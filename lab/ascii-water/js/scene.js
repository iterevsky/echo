(function () {
    const root = window.AsciiWater = window.AsciiWater || {};

    root.RAMPS = [' .:-=+*#%@', ' .:+=*%#&@', ' .:~-=+#'];
    root.BAYER = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];

    const clamp = (value) => Math.min(1, Math.max(0, value));
    const hash = (x, y) => {
        const value = Math.sin(x * 127.1 + y * 311.7 + 17.0) * 43758.5453;
        return value - Math.floor(value);
    };

    class Scene {
        constructor(cols, rows) {
            this.waveField = null;
            this.displaceReflection = (x, y) => ({ x, y });
            this.resize(cols, rows);
        }

        resize(cols, rows) {
            this.cols = Math.max(1, Math.floor(cols));
            this.rows = Math.max(1, Math.floor(rows));
            const size = this.cols * this.rows;
            this.sceneBuffer = new Uint8ClampedArray(size * 4);
            this.reflectionBuffer = new Uint8ClampedArray(size * 4);
            this.lum = new Float32Array(size);
            this.columnEnergy = new Float32Array(size);
            this.highlight = new Float32Array(size);
            this.denseWeight = new Float32Array(size);
            this.glyphLum = new Float32Array(size);
            this.ramp = new Uint8Array(size);
            this.shore = new Uint8Array(size);
        }

        sampleScene(x, y) {
            const shoreY = 0.50 + 0.006 * Math.sin(2 * Math.PI * (3 * x + 0.17)) + 0.003 * Math.sin(2 * Math.PI * 11 * x);
            const shore = y >= shoreY && y < 0.56;
            let base;
            if (y < shoreY) base = 0.035 + 0.055 * (1 - y / 0.50);
            else if (shore) base = 0.10 + 0.09 * hash(x, y);
            else {
                const t = (y - 0.56) / 0.44;
                base = 0.07 + 0.06 * (1 - t);
            }
            let columnEnergy = 0;
            if (y >= 0.10 && y <= 0.56) {
                const vertical = clamp((y - 0.10) / 0.06);
                const halo = Math.max(0, 1 - Math.abs(x - 0.68) / 0.075) ** 2;
                const core = Math.max(0, 1 - Math.abs(x - 0.68) / 0.018);
                columnEnergy = vertical * (0.35 * halo + 0.65 * core);
            }
            return { lum: clamp(base + columnEnergy), columnEnergy, shore };
        }

        generateLandscape() {
            for (let row = 0; row < this.rows; row++) {
                const y = row / Math.max(1, this.rows - 1);
                for (let col = 0; col < this.cols; col++) {
                    const x = col / Math.max(1, this.cols - 1);
                    const index = row * this.cols + col;
                    const sample = this.sampleScene(x, y);
                    this.lum[index] = sample.lum;
                    this.columnEnergy[index] = sample.columnEnergy;
                    this.shore[index] = sample.shore ? 1 : 0;
                }
            }
        }

        writeGray(buffer, index, lum) {
            const value = Math.round(clamp(lum) * 255);
            const offset = index * 4;
            buffer[offset] = value;
            buffer[offset + 1] = value;
            buffer[offset + 2] = value;
            buffer[offset + 3] = 255;
        }

        writeWater(buffer, index, lum) {
            const value = clamp(lum);
            const offset = index * 4;
            buffer[offset] = Math.round(7 + value * 248);
            buffer[offset + 1] = Math.round(19 + value * 236);
            buffer[offset + 2] = Math.round(21 + value * 234);
            buffer[offset + 3] = 255;
        }

        renderSceneBuffer() {
            for (let i = 0; i < this.lum.length; i++) this.writeGray(this.sceneBuffer, i, this.lum[i]);
        }

        renderReflection() {
            for (let row = 0; row < this.rows; row++) {
                const y = row / Math.max(1, this.rows - 1);
                for (let col = 0; col < this.cols; col++) {
                    const x = col / Math.max(1, this.cols - 1);
                    const index = row * this.cols + col;
                    if (y < 0.56) {
                        this.highlight[index] = 0;
                        this.writeGray(this.reflectionBuffer, index, 0);
                        continue;
                    }
                    const t = (y - 0.56) / 0.44;
                    const position = this.displaceReflection(x, y, this.waveField);
                    const sourceY = 2 * 0.56 - position.y;
                    const source = this.sampleScene(clamp(position.x), clamp(sourceY));
                    const attenuation = 0.68 * Math.exp(-1.6 * t);
                    const reflected = source.lum * attenuation;
                    const highlight = reflected * (0.45 + 0.55 * hash(x, y));
                    this.highlight[index] = highlight;
                    this.lum[index] = clamp(reflected + 0.08 * highlight);
                    this.writeWater(this.reflectionBuffer, index, this.lum[index]);
                }
            }
        }

        finishCharacterCells() {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const index = row * this.cols + col;
                    const x = col / Math.max(1, this.cols - 1);
                    const y = row / Math.max(1, this.rows - 1);
                    const dense = this.shore[index]
                        ? 0.35 + 0.45 * hash(x, y)
                        : Math.max(this.columnEnergy[index], this.highlight[index]);
                    const density = clamp(0.08 + 0.82 * dense + 0.04 * hash(x, y));
                    this.denseWeight[index] = dense;
                    this.ramp[index] = this.shore[index] ? 2 : dense >= 0.35 ? 1 : 0;
                    this.glyphLum[index] = clamp(this.lum[index] * (0.80 + 0.20 * density));
                }
            }
        }

        generate() {
            this.generateLandscape();
            this.renderSceneBuffer();
            this.renderReflection();
            this.finishCharacterCells();
            return this;
        }
    }

    root.Scene = Scene;
})();
