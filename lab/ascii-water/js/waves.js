(function () {
    const root = window.AsciiWater = window.AsciiWater || {};
    const STEP_SECONDS = 1 / 60;
    const DAMPING = 0.999;
    const MAX_HEIGHT = 16;
    const MUR = (Math.SQRT1_2 - 1) / (Math.SQRT1_2 + 1);
    const SOURCE_LIFETIME = 6;
    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
    const hash = (x, y) => {
        const value = Math.sin(x * 127.1 + y * 311.7 + 17) * 43758.5453;
        return value - Math.floor(value);
    };

    class WaveField {
        constructor(cols, rows) {
            this.sources = [];
            this.phase = 0;
            this.time = 0;
            this.accumulator = 0;
            this.ambientElapsed = 0;
            this.ambientSeed = 0x41534949;
            this.ambientCount = 0;
            this.sourceId = 0;
            this.resetCount = 0;
            this.nextAmbientSeconds = this.scheduleAmbient();
            this.resize(cols, rows);
        }

        resize(cols, rows) {
            this.cols = Math.max(1, Math.floor(cols));
            this.rows = Math.max(1, Math.floor(rows));
            const size = this.cols * this.rows;
            this.current = new Float32Array(size);
            this.next = new Float32Array(size);
            this.boundaryDamping = new Float32Array(size);
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const distance = Math.min(col, row, this.cols - 1 - col, this.rows - 1 - row);
                    this.boundaryDamping[row * this.cols + col] = distance === 0 ? 0.985
                        : distance === 1 ? 0.90
                        : distance === 2 ? 0.96
                        : distance === 3 ? 0.99
                        : 1;
                }
            }
            this.sources.length = 0;
            this.accumulator = 0;
        }

        reset() {
            this.current.fill(0);
            this.next.fill(0);
            this.sources.length = 0;
            this.accumulator = 0;
        }

        scheduleAmbient() {
            this.ambientSeed = (1664525 * this.ambientSeed + 1013904223) >>> 0;
            return 20 + 40 * this.ambientSeed / 4294967296;
        }

        drop(x, y, strength, radius) {
            strength = strength === undefined ? 0.08 : strength;
            radius = radius === undefined ? 2 : radius;
            if (![x, y, strength, radius].every(Number.isFinite) || radius <= 0) return null;
            const source = {
                id: ++this.sourceId,
                x: clamp(x, 0, this.cols - 1),
                y: clamp(y, 0, this.rows - 1),
                strength,
                radius,
                ambient: false,
                time: this.time
            };
            if (this.sources.length >= 3) this.sources.shift();
            this.sources.push(source);
            const minX = Math.max(1, Math.floor(source.x - radius));
            const maxX = Math.min(this.cols - 2, Math.ceil(source.x + radius));
            const minY = Math.max(1, Math.floor(source.y - radius));
            const maxY = Math.min(this.rows - 2, Math.ceil(source.y + radius));
            for (let row = minY; row <= maxY; row++) {
                for (let col = minX; col <= maxX; col++) {
                    const distance = Math.hypot(col - source.x, row - source.y);
                    if (distance > radius) continue;
                    const falloff = 1 - distance / radius;
                    this.current[row * this.cols + col] += strength * falloff * falloff;
                }
            }
            return source.id;
        }

        step() {
            const current = this.current;
            const next = this.next;
            const writeBoundary = (index, value) => {
                const damped = value * DAMPING * this.boundaryDamping[index];
                if (!Number.isFinite(damped) || Math.abs(damped) > MAX_HEIGHT) {
                    this.resetCount++;
                    this.reset();
                    return false;
                }
                next[index] = damped;
                return true;
            };
            for (let row = 1; row < this.rows - 1; row++) {
                for (let col = 1; col < this.cols - 1; col++) {
                    const index = row * this.cols + col;
                    const value = ((current[index - 1] + current[index + 1] + current[index - this.cols] + current[index + this.cols]) * 0.5 - next[index])
                        * DAMPING * this.boundaryDamping[index];
                    if (!Number.isFinite(value) || Math.abs(value) > MAX_HEIGHT) {
                        this.resetCount++;
                        this.reset();
                        return;
                    }
                    next[index] = value;
                }
            }
            for (let col = 1; col < this.cols - 1; col++) {
                const top = col;
                const bottom = (this.rows - 1) * this.cols + col;
                if (!writeBoundary(top, current[top + this.cols] + MUR * (next[top + this.cols] - current[top]))) return;
                if (!writeBoundary(bottom, current[bottom - this.cols] + MUR * (next[bottom - this.cols] - current[bottom]))) return;
            }
            for (let row = 1; row < this.rows - 1; row++) {
                const left = row * this.cols;
                const right = left + this.cols - 1;
                if (!writeBoundary(left, current[left + 1] + MUR * (next[left + 1] - current[left]))) return;
                if (!writeBoundary(right, current[right - 1] + MUR * (next[right - 1] - current[right]))) return;
            }
            next[0] = 0;
            next[this.cols - 1] = 0;
            next[(this.rows - 1) * this.cols] = 0;
            next[this.rows * this.cols - 1] = 0;
            this.current = next;
            this.next = current;
            this.time += STEP_SECONDS;
            for (let i = this.sources.length - 1; i >= 0; i--) {
                if (this.time - this.sources[i].time >= SOURCE_LIFETIME) this.sources.splice(i, 1);
            }
        }

        advance(elapsedSeconds) {
            if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return;
            const elapsed = Math.min(elapsedSeconds, 1);
            this.phase += 0.055 * elapsed;
            this.ambientElapsed += elapsed;
            this.accumulator += elapsed;
            let steps = 0;
            while (this.accumulator >= STEP_SECONDS && steps < 60) {
                this.step();
                this.accumulator -= STEP_SECONDS;
                steps++;
            }
            if (this.ambientElapsed >= this.nextAmbientSeconds) {
                this.ambientElapsed -= this.nextAmbientSeconds;
                this.nextAmbientSeconds = this.scheduleAmbient();
                this.ambientCount++;
                if (!this.sources.some(source => source.ambient)) {
                    const x = (0.18 + 0.64 * hash(this.ambientCount, 1.7)) * (this.cols - 1);
                    const y = (0.65 + 0.25 * hash(this.ambientCount, 4.2)) * (this.rows - 1);
                    const id = this.drop(x, y, 0.08, 2);
                    const source = this.sources.find(item => item.id === id);
                    if (source) source.ambient = true;
                }
            }
        }

        sampleHeight(x, y) {
            const gx = clamp(x, 0, this.cols - 1);
            const gy = clamp(y, 0, this.rows - 1);
            const x0 = Math.floor(gx);
            const y0 = Math.floor(gy);
            const x1 = Math.min(this.cols - 1, x0 + 1);
            const y1 = Math.min(this.rows - 1, y0 + 1);
            const tx = gx - x0;
            const ty = gy - y0;
            const top = this.current[y0 * this.cols + x0] * (1 - tx) + this.current[y0 * this.cols + x1] * tx;
            const bottom = this.current[y1 * this.cols + x0] * (1 - tx) + this.current[y1 * this.cols + x1] * tx;
            return top * (1 - ty) + bottom * ty;
        }

        displacementX(x, y) {
            const gx = x * (this.cols - 1);
            const gy = y * (this.rows - 1);
            const gradient = (this.sampleHeight(gx + 1, gy) - this.sampleHeight(gx - 1, gy)) * 0.5;
            return clamp(gradient * 18, -4, 4) + Math.sin(this.phase) * 0.35;
        }

        sampleDisplacement(x, y) {
            return {
                x: x + this.displacementX(x, y) / Math.max(1, this.cols - 1),
                y
            };
        }

        sampleModulation(x, y) {
            const height = this.sampleHeight(x * (this.cols - 1), y * (this.rows - 1));
            return 1 + clamp(height * 0.06, -0.06, 0.06);
        }

        getStats() {
            let maxAbs = 0;
            let energy = 0;
            let finite = true;
            for (const value of this.current) {
                if (!Number.isFinite(value)) finite = false;
                else {
                    maxAbs = Math.max(maxAbs, Math.abs(value));
                    energy += Math.abs(value);
                }
            }
            return {
                cols: this.cols,
                rows: this.rows,
                finite,
                maxAbs,
                energy,
                sourceIds: this.sources.map(source => source.id),
                phase: this.phase,
                ambientCount: this.ambientCount,
                nextAmbientSeconds: this.nextAmbientSeconds,
                resetCount: this.resetCount
            };
        }
    }

    root.WaveField = WaveField;
})();
