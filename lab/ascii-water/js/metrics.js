(function () {
    const root = window.AsciiWater = window.AsciiWater || {};

    class MetricsOverlay {
        constructor(element) {
            this.element = element;
            this.intervals = [];
            this.renderCosts = [];
            this.pendingInputs = [];
            this.inputLatencies = [];
            this.payloadBytes = 0;
            this.lastPaint = 0;
            this.lastRenderMs = 0;
            this.lastInputLatencyMs = 0;
            this.lastEffect = '—';
            this.cells = '—';
        }

        reset() {
            this.intervals.length = 0;
            this.renderCosts.length = 0;
            this.pendingInputs.length = 0;
            this.inputLatencies.length = 0;
            this.lastInputLatencyMs = 0;
            this.lastEffect = '—';
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
            }
            this.pendingInputs.length = 0;
            if (this.inputLatencies.length > 120) this.inputLatencies.splice(0, this.inputLatencies.length - 120);
            this.paint(true);
        }

        record(frameMs, renderMs, cells) {
            this.intervals.push(frameMs);
            this.renderCosts.push(renderMs);
            if (this.intervals.length > 120) this.intervals.shift();
            if (this.renderCosts.length > 120) this.renderCosts.shift();
            this.lastRenderMs = renderMs;
            this.cells = cells;
            this.paint(false);
        }

        getSnapshot() {
            const sorted = this.intervals.slice().sort((a, b) => a - b);
            const mean = this.intervals.length ? this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length : 0;
            const p95 = sorted.length ? sorted[Math.floor((sorted.length - 1) * 0.95)] : 0;
            const dropped = this.intervals.length ? this.intervals.filter(value => value > 25).length / this.intervals.length : 0;
            const sortedInputs = this.inputLatencies.slice().sort((a, b) => a - b);
            const inputP95 = sortedInputs.length ? sortedInputs[Math.floor((sortedInputs.length - 1) * 0.95)] : 0;
            return {
                frames: this.intervals.length,
                fps: mean ? 1000 / mean : 0,
                meanMs: mean,
                p95Ms: p95,
                droppedRatio: dropped,
                renderMs: this.lastRenderMs,
                payloadBytes: this.payloadBytes,
                inputLatencyMs: this.lastInputLatencyMs,
                inputP95Ms: inputP95,
                inputSamples: this.inputLatencies.length,
                lastEffect: this.lastEffect,
                pendingInputs: this.pendingInputs.length,
                cells: this.cells
            };
        }

        paint(force) {
            const now = performance.now();
            if (!force && now - this.lastPaint < 250) return;
            this.lastPaint = now;
            const m = this.getSnapshot();
            this.element.textContent =
                'FPS ' + m.fps.toFixed(1) + '\n' +
                'Frame p95 ' + m.p95Ms.toFixed(2) + ' ms\n' +
                'Dropped ' + (m.droppedRatio * 100).toFixed(1) + '%\n' +
                'Render ' + m.renderMs.toFixed(2) + ' ms\n' +
                'Input ' + m.inputLatencyMs.toFixed(1) + ' ms · p95 ' + m.inputP95Ms.toFixed(1) + ' ms\n' +
                'Effect ' + m.lastEffect + '\n' +
                'Payload ' + m.payloadBytes + ' bytes (' + (m.payloadBytes / 1024).toFixed(2) + ' KiB)\n' +
                'Grid ' + m.cells;
        }
    }

    root.MetricsOverlay = MetricsOverlay;
})();
