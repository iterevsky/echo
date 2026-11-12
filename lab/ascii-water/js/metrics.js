(function () {
    const root = window.AsciiWater = window.AsciiWater || {};

    const percentile = (samples, ratio) => {
        if (!samples.length) return 0;
        const sorted = samples.slice().sort((a, b) => a - b);
        return sorted[Math.floor((sorted.length - 1) * ratio)];
    };

    class MetricsOverlay {
        constructor(element) {
            this.element = element;
            this.intervals = [];
            this.runIntervals = [];
            this.renderCosts = [];
            this.pendingInputs = [];
            this.inputLatencies = [];
            this.payloadBytes = 0;
            this.lastPaint = 0;
            this.lastRenderMs = 0;
            this.lastInputLatencyMs = 0;
            this.lastEffect = '—';
            this.cells = '—';
            this.firstWaterFrameMs = 0;
            this.firstResponsiveTouchMs = 0;
            this.qualityState = null;
            this.fallbackReason = '';
            this.fallbackCostMs = 0;
            this.totalFrameMs = 0;
            this.totalDropped = 0;
            this.runStartedAt = performance.now();
        }

        reset() {
            this.intervals.length = 0;
            this.runIntervals.length = 0;
            this.renderCosts.length = 0;
            this.pendingInputs.length = 0;
            this.inputLatencies.length = 0;
            this.lastInputLatencyMs = 0;
            this.lastEffect = '—';
            this.totalFrameMs = 0;
            this.totalDropped = 0;
            this.runStartedAt = performance.now();
            this.lastPaint = 0;
            this.paint(true);
        }

        setPayload(bytes) {
            this.payloadBytes = Math.max(0, Math.round(bytes));
            this.paint(true);
        }

        capturePayload() {
            const entries = performance.getEntriesByType('navigation').concat(performance.getEntriesByType('resource'));
            const bytes = entries.reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0);
            this.setPayload(bytes);
            return bytes;
        }

        markWaterFrame() {
            if (!this.firstWaterFrameMs) this.firstWaterFrameMs = performance.now();
        }

        setQualityState(state) {
            this.qualityState = state;
        }

        setFallback(reason, costMs) {
            this.fallbackReason = reason;
            this.fallbackCostMs = costMs;
            this.paint(true);
        }

        recordInput(eventTime, effect) {
            this.pendingInputs.push({ eventTime: Number.isFinite(eventTime) ? eventTime : performance.now(), effect });
            if (this.pendingInputs.length > 120) this.pendingInputs.shift();
            this.lastEffect = effect;
            this.paint(true);
        }

        frameRendered(frameTime) {
            if (!this.pendingInputs.length) return;
            const now = Number.isFinite(frameTime) ? frameTime : performance.now();
            for (const input of this.pendingInputs) {
                this.lastInputLatencyMs = Math.max(0, now - input.eventTime);
                this.inputLatencies.push(this.lastInputLatencyMs);
                if (!this.firstResponsiveTouchMs && input.effect.startsWith('touch-')) this.firstResponsiveTouchMs = now;
            }
            this.pendingInputs.length = 0;
            if (this.inputLatencies.length > 120) this.inputLatencies.splice(0, this.inputLatencies.length - 120);
            this.paint(true);
        }

        record(frameMs, renderMs, cells) {
            this.intervals.push(frameMs);
            this.runIntervals.push(frameMs);
            this.renderCosts.push(renderMs);
            this.totalFrameMs += frameMs;
            if (frameMs > 25) this.totalDropped++;
            if (this.intervals.length > 120) this.intervals.shift();
            if (this.renderCosts.length > 120) this.renderCosts.shift();
            this.lastRenderMs = renderMs;
            this.cells = cells;
            this.paint(false);
        }

        getSnapshot() {
            const mean = this.intervals.length ? this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length : 0;
            const dropped = this.intervals.length ? this.intervals.filter(value => value > 25).length / this.intervals.length : 0;
            const sortedInputs = this.inputLatencies.slice().sort((a, b) => a - b);
            const inputP95 = sortedInputs.length ? sortedInputs[Math.floor((sortedInputs.length - 1) * 0.95)] : 0;
            return {
                frames: this.intervals.length,
                fps: mean ? 1000 / mean : 0,
                meanMs: mean,
                p95Ms: percentile(this.intervals, 0.95),
                droppedRatio: dropped,
                renderMs: this.lastRenderMs,
                payloadBytes: this.payloadBytes,
                inputLatencyMs: this.lastInputLatencyMs,
                inputP95Ms: inputP95,
                inputSamples: this.inputLatencies.length,
                lastEffect: this.lastEffect,
                pendingInputs: this.pendingInputs.length,
                firstWaterFrameMs: this.firstWaterFrameMs,
                firstResponsiveTouchMs: this.firstResponsiveTouchMs,
                quality: this.qualityState,
                fallbackReason: this.fallbackReason,
                fallbackCostMs: this.fallbackCostMs,
                runFrames: this.runIntervals.length,
                runMeanFps: this.totalFrameMs > 0 ? this.runIntervals.length * 1000 / this.totalFrameMs : 0,
                runDroppedRatio: this.runIntervals.length ? this.totalDropped / this.runIntervals.length : 0,
                cells: this.cells
            };
        }

        getRunSummary() {
            return Object.assign(this.getSnapshot(), {
                runP95Ms: percentile(this.runIntervals, 0.95),
                runDurationMs: performance.now() - this.runStartedAt,
                runMaxMs: this.runIntervals.reduce((max, value) => Math.max(max, value), 0)
            });
        }

        paint(force) {
            const now = performance.now();
            if (!force && now - this.lastPaint < 250) return;
            this.lastPaint = now;
            const m = this.getSnapshot();
            const quality = m.quality;
            this.element.textContent =
                'FPS ' + m.fps.toFixed(1) + '\n' +
                'Frame p95 ' + m.p95Ms.toFixed(2) + ' ms\n' +
                'Dropped ' + (m.droppedRatio * 100).toFixed(1) + '%\n' +
                'Render ' + m.renderMs.toFixed(2) + ' ms\n' +
                'Input ' + m.inputLatencyMs.toFixed(1) + ' ms · p95 ' + m.inputP95Ms.toFixed(1) + ' ms\n' +
                'Effect ' + m.lastEffect + '\n' +
                'Water ' + m.firstWaterFrameMs.toFixed(1) + ' ms\n' +
                'Touch ' + (m.firstResponsiveTouchMs ? m.firstResponsiveTouchMs.toFixed(1) + ' ms' : '—') + '\n' +
                'Quality ' + (quality ? quality.cellPx + ' px · p95 ' + quality.p95_90.toFixed(1) + ' ms' : '—') + (m.fallbackReason ? ' · STATIC (not a gate pass)' : '') + '\n' +
                'Payload ' + m.payloadBytes + ' bytes (' + (m.payloadBytes / 1024).toFixed(2) + ' KiB)\n' +
                'Grid ' + m.cells;
        }
    }

    root.MetricsOverlay = MetricsOverlay;
})();
