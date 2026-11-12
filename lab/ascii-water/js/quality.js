(function () {
    const root = window.AsciiWater = window.AsciiWater || {};
    const LEVELS = [8, 10, 12];
    const DOWNGRADE_P95 = 16;
    const UPGRADE_P95 = 11;
    const DOWNGRADE_SAMPLES = 90;
    const UPGRADE_SAMPLES = 600;
    const DWELL_MS = 5000;
    const FALLBACK_MS = 60000;
    const PROFILES = {
        8: { scanlines: 0.18, vignette: 0.22, grain: 0.12 },
        10: { scanlines: 0.12, vignette: 0.18, grain: 0.06 },
        12: { scanlines: 0.08, vignette: 0.14, grain: 0 }
    };

    class QualityController {
        constructor(renderer) {
            this.renderer = renderer;
            this.cellPx = renderer.cellPx;
            this.intervals = [];
            this.changes = [];
            this.lastChangeTime = -Infinity;
            this.lastTimestamp = performance.now();
            this.below30Since = null;
            this.fallback = false;
            this.fallbackReason = '';
            this.renderer.setCellSize(this.cellPx, PROFILES[this.cellPx]);
            this.publish();
        }

        percentile(count) {
            const samples = this.intervals.slice(-count);
            if (!samples.length) return 0;
            samples.sort((a, b) => a - b);
            return samples[Math.floor((samples.length - 1) * 0.95)];
        }

        meanFps(count) {
            const samples = this.intervals.slice(-count);
            if (!samples.length) return 0;
            const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
            return mean > 0 ? 1000 / mean : 0;
        }

        setCellSize(cellPx, reason, timestamp) {
            if (this.fallback || !LEVELS.includes(cellPx) || cellPx === this.cellPx) return false;
            const now = Number.isFinite(timestamp) ? timestamp : performance.now();
            const previous = this.cellPx;
            this.cellPx = cellPx;
            this.lastChangeTime = now;
            this.lastTimestamp = now;
            this.below30Since = null;
            this.intervals.length = 0;
            this.renderer.setCellSize(cellPx, PROFILES[cellPx]);
            this.changes.push({ from: previous, to: cellPx, reason, timestamp: now });
            this.publish();
            return true;
        }

        engageFallback(timestamp) {
            if (this.fallback) return;
            this.fallback = true;
            this.fallbackReason = '12 px remained below 30 FPS for 60 s';
            this.changes.push({ from: this.cellPx, to: 'static', reason: 'fallback', timestamp });
            this.renderer.activateFallback(this.fallbackReason);
            this.publish();
        }

        recordFrame(frameMs, timestamp) {
            if (this.fallback || !Number.isFinite(frameMs) || frameMs <= 0) return;
            this.lastTimestamp = timestamp;
            this.intervals.push(frameMs);
            if (this.intervals.length > UPGRADE_SAMPLES) this.intervals.shift();
            if (this.cellPx === 12 && this.intervals.length >= DOWNGRADE_SAMPLES && this.meanFps(DOWNGRADE_SAMPLES) < 30 - 1e-9) {
                if (this.below30Since === null) this.below30Since = timestamp;
                if (timestamp - this.below30Since >= FALLBACK_MS) {
                    this.engageFallback(timestamp);
                    return;
                }
            } else {
                this.below30Since = null;
            }
            if (timestamp - this.lastChangeTime >= DWELL_MS) {
                if (this.intervals.length >= DOWNGRADE_SAMPLES && this.percentile(DOWNGRADE_SAMPLES) > DOWNGRADE_P95 && this.cellPx < 12) {
                    this.setCellSize(this.cellPx + 2, 'downgrade', timestamp);
                    return;
                }
                if (this.intervals.length >= UPGRADE_SAMPLES && this.percentile(UPGRADE_SAMPLES) < UPGRADE_P95 && this.cellPx > 8) {
                    this.setCellSize(this.cellPx - 2, 'upgrade', timestamp);
                    return;
                }
            }
            this.publish();
        }

        getSnapshot() {
            return {
                cellPx: this.cellPx,
                dprCap: 1.5,
                samples: this.intervals.length,
                p95_90: this.percentile(DOWNGRADE_SAMPLES),
                p95_600: this.percentile(UPGRADE_SAMPLES),
                mean90Fps: this.meanFps(DOWNGRADE_SAMPLES),
                below30Seconds: this.below30Since === null ? 0 : Math.max(0, (this.lastTimestamp - this.below30Since) / 1000),
                lastChangeTime: this.lastChangeTime,
                changes: this.changes.slice(),
                fallback: this.fallback,
                fallbackReason: this.fallbackReason,
                treatment: PROFILES[this.cellPx]
            };
        }

        publish() {
            if (this.renderer.metrics && this.renderer.metrics.setQualityState) {
                this.renderer.metrics.setQualityState(this.getSnapshot());
            }
        }
    }

    root.QualityController = QualityController;
})();
