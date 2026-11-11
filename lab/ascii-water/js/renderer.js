(function () {
    const root = window.AsciiWater = window.AsciiWater || {};
    const CELL_SIZES = [8, 10, 12];
    const GLOW_PADDING = 4;
    const clamp = (value) => Math.min(1, Math.max(0, value));

    function mixColor(a, b, amount) {
        return a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount));
    }

    const GRADES = Array.from({ length: 16 }, (_, index) => {
        const value = index / 15;
        const rgb = value < 0.55
            ? mixColor([10, 27, 31], [75, 143, 136], value / 0.55)
            : mixColor([75, 143, 136], [201, 247, 232], (value - 0.55) / 0.45);
        return 'rgb(' + rgb.join(',') + ')';
    });

    class Renderer {
        constructor(canvas, options) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d', { alpha: false });
            this.metrics = options && options.metrics;
            this.cellPx = options && options.cellPx || 12;
            this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.rafId = null;
            this.lastTimestamp = null;
            this.atlases = new Map();
            this.drawCalls = 0;
            this.tick = this.tick.bind(this);
            this.resize = this.resize.bind(this);
            this.handleMotionChange = this.handleMotionChange.bind(this);
            this.buildGrainTile();
            this.resize();
            window.addEventListener('resize', this.resize);
            if (this.motionQuery.addEventListener) this.motionQuery.addEventListener('change', this.handleMotionChange);
            else this.motionQuery.addListener(this.handleMotionChange);
            if (!this.motionQuery.matches) this.start();
        }

        buildGrainTile() {
            this.grainTile = document.createElement('canvas');
            this.grainTile.width = 256;
            this.grainTile.height = 256;
            const context = this.grainTile.getContext('2d');
            const image = context.createImageData(256, 256);
            for (let row = 0; row < 256; row++) {
                for (let col = 0; col < 256; col++) {
                    const value = Math.sin(col * 127.1 + row * 311.7 + 17) * 43758.5453;
                    const grain = Math.round((value - Math.floor(value)) * 110);
                    const offset = (row * 256 + col) * 4;
                    image.data[offset] = grain;
                    image.data[offset + 1] = grain;
                    image.data[offset + 2] = grain;
                    image.data[offset + 3] = 255;
                }
            }
            context.putImageData(image, 0, 0);
        }

        makeAtlas(rampIndex, cellPx, cellWidth, cellHeight, gradeBin, glow) {
            const ramp = root.RAMPS[rampIndex];
            const dpr = this.dpr;
            const padding = glow ? GLOW_PADDING : 0;
            const glyphWidth = Math.ceil(cellWidth * dpr);
            const glyphHeight = Math.ceil(cellHeight * dpr);
            const atlasCellWidth = glyphWidth + Math.ceil(padding * 2 * dpr);
            const atlasCellHeight = glyphHeight + Math.ceil(padding * 2 * dpr);
            const canvas = document.createElement('canvas');
            canvas.width = atlasCellWidth * ramp.length;
            canvas.height = atlasCellHeight;
            const context = canvas.getContext('2d');
            context.setTransform(dpr, 0, 0, dpr, padding * dpr, padding * dpr);
            context.font = '700 ' + cellPx * 0.9 + 'px monospace';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = GRADES[gradeBin];
            for (let glyphIndex = 0; glyphIndex < ramp.length; glyphIndex++) {
                const x = glyphIndex * atlasCellWidth / dpr + cellWidth / 2;
                const y = cellHeight / 2;
                if (glow) {
                    context.shadowColor = 'rgba(100, 216, 197, 0.16)';
                    context.shadowBlur = 4 * dpr;
                    context.fillText(ramp[glyphIndex], x, y);
                    context.shadowColor = 'transparent';
                    context.shadowBlur = 0;
                }
                context.fillText(ramp[glyphIndex], x, y);
            }
            return { canvas, glyphWidth: atlasCellWidth, glyphHeight: atlasCellHeight, padding };
        }

        buildAtlases() {
            this.atlases.clear();
            for (const cellPx of CELL_SIZES) {
                const cols = Math.max(1, Math.floor(this.cssWidth / cellPx));
                const rows = Math.max(1, Math.floor(this.cssHeight / cellPx));
                const cellWidth = this.cssWidth / cols;
                const cellHeight = this.cssHeight / rows;
                for (let ramp = 0; ramp < root.RAMPS.length; ramp++) {
                    for (let grade = 0; grade < 16; grade++) {
                        for (let glow = 0; glow <= 1; glow++) {
                            const key = [ramp, cellPx, this.dpr, grade, glow].join(':');
                            this.atlases.set(key, this.makeAtlas(ramp, cellPx, cellWidth, cellHeight, grade, glow === 1));
                        }
                    }
                }
            }
        }

        buildTreatment() {
            this.treatment = document.createElement('canvas');
            this.treatment.width = this.canvas.width;
            this.treatment.height = this.canvas.height;
            const context = this.treatment.getContext('2d');
            context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            const scanlines = document.createElement('canvas');
            scanlines.width = 1;
            scanlines.height = 4;
            const scanlineContext = scanlines.getContext('2d');
            scanlineContext.fillStyle = 'rgba(0, 0, 0, 0.12)';
            scanlineContext.fillRect(0, 2, 1, 2);
            context.globalAlpha = 0.18;
            context.fillStyle = context.createPattern(scanlines, 'repeat');
            context.fillRect(0, 0, this.cssWidth, this.cssHeight);

            context.save();
            context.translate(this.cssWidth / 2, this.cssHeight / 2);
            context.scale(this.cssWidth / 2, this.cssHeight / 2);
            const vignette = context.createRadialGradient(0, 0, 0, 0, 0, 1);
            vignette.addColorStop(0, 'rgba(10,14,10,0.15)');
            vignette.addColorStop(0.55, 'rgba(3,6,3,0.94)');
            vignette.addColorStop(1, 'rgba(1,3,1,0.98)');
            context.globalAlpha = 0.22;
            context.fillStyle = vignette;
            context.fillRect(-1, -1, 2, 2);
            context.restore();

            context.globalCompositeOperation = 'screen';
            context.globalAlpha = 0.12;
            context.fillStyle = context.createPattern(this.grainTile, 'repeat');
            context.fillRect(0, 0, this.cssWidth, this.cssHeight);
            context.globalCompositeOperation = 'source-over';
            context.globalAlpha = 1;
        }

        resize() {
            const bounds = this.canvas.getBoundingClientRect();
            this.cssWidth = Math.max(1, bounds.width);
            this.cssHeight = Math.max(1, bounds.height);
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.cols = Math.max(1, Math.floor(this.cssWidth / this.cellPx));
            this.rows = Math.max(1, Math.floor(this.cssHeight / this.cellPx));
            this.cellWidth = this.cssWidth / this.cols;
            this.cellHeight = this.cssHeight / this.rows;
            this.canvas.width = Math.round(this.cssWidth * this.dpr);
            this.canvas.height = Math.round(this.cssHeight * this.dpr);
            this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            if (this.scene) this.scene.resize(this.cols, this.rows);
            else this.scene = new root.Scene(this.cols, this.rows);
            if (this.waves) this.waves.resize(this.cols, this.rows);
            else this.waves = new root.WaveField(this.cols, this.rows);
            this.scene.waveField = this.waves;
            this.scene.displaceReflection = (x, y, field) => field ? field.sampleDisplacement(x, y) : { x, y };
            this.buildAtlases();
            this.buildTreatment();
            this.render();
        }

        setCellSize(cellPx) {
            if (!CELL_SIZES.includes(cellPx)) throw new RangeError('Cell size must be 8, 10, or 12 CSS px');
            if (cellPx === this.cellPx) return;
            this.cellPx = cellPx;
            this.resize();
        }

        render() {
            this.scene.generate();
            const context = this.context;
            context.fillStyle = '#06080a';
            context.fillRect(0, 0, this.cssWidth, this.cssHeight);
            this.drawCalls = 0;
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const index = row * this.cols + col;
                    const threshold = (root.BAYER[row % 4][col % 4] + 0.5) / 16 - 0.5;
                    const x = col / Math.max(1, this.cols - 1);
                    const y = row / Math.max(1, this.rows - 1);
                    const modulation = y < 0.56 ? 1 : this.waves.sampleModulation(x, y);
                    const modulated = clamp(this.scene.glyphLum[index] * modulation);
                    const quantized = clamp(modulated + threshold * 0.10);
                    const rampIndex = this.scene.ramp[index];
                    const ramp = root.RAMPS[rampIndex];
                    const glyphIndex = Math.round(quantized * (ramp.length - 1));
                    if (glyphIndex === 0) continue;
                    const gradeBin = Math.round(quantized * 15);
                    const glow = this.scene.denseWeight[index] >= 0.65 && quantized >= 0.65 ? 1 : 0;
                    const atlas = this.atlases.get([rampIndex, this.cellPx, this.dpr, gradeBin, glow].join(':'));
                    context.drawImage(
                        atlas.canvas,
                        glyphIndex * atlas.glyphWidth,
                        0,
                        atlas.glyphWidth,
                        atlas.glyphHeight,
                        col * this.cellWidth - atlas.padding,
                        row * this.cellHeight - atlas.padding,
                        this.cellWidth + atlas.padding * 2,
                        this.cellHeight + atlas.padding * 2
                    );
                    this.drawCalls++;
                }
            }
            context.drawImage(this.treatment, 0, 0, this.cssWidth, this.cssHeight);
        }

        start() {
            if (this.motionQuery.matches || this.rafId !== null) return;
            this.lastTimestamp = null;
            if (this.metrics) this.metrics.reset();
            this.rafId = requestAnimationFrame(this.tick);
        }

        stop() {
            if (this.rafId !== null) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.lastTimestamp = null;
            if (this.metrics) this.metrics.reset();
        }

        handleMotionChange() {
            if (this.motionQuery.matches) {
                this.stop();
                this.waves.reset();
                this.waves.phase = 0;
                this.render();
            } else {
                this.start();
            }
        }

        tick(timestamp) {
            if (this.motionQuery.matches) {
                this.rafId = null;
                return;
            }
            this.rafId = requestAnimationFrame(this.tick);
            const started = performance.now();
            const elapsed = this.lastTimestamp === null ? 0 : (timestamp - this.lastTimestamp) / 1000;
            this.waves.advance(elapsed);
            this.render();
            const renderMs = performance.now() - started;
            if (this.metrics) {
                this.metrics.frameRendered();
                const cells = this.cols + ' × ' + this.rows + ' @ ' + this.cellPx + ' px'
                    + '\nWaves ' + this.waves.ambientCount + ' ambient, ' + this.waves.sources.length + ' active, ' + this.waves.resetCount + ' resets';
                if (this.lastTimestamp !== null) this.metrics.record(timestamp - this.lastTimestamp, renderMs, cells);
                else {
                    this.metrics.lastRenderMs = renderMs;
                    this.metrics.cells = cells;
                    this.metrics.paint(true);
                }
            }
            this.lastTimestamp = timestamp;
        }

        drop(x, y, strength, radius) {
            if (this.motionQuery.matches) return null;
            return this.waves.drop(x, y, strength, radius);
        }

        getDiagnostics() {
            return {
                cellPx: this.cellPx,
                cols: this.cols,
                rows: this.rows,
                dpr: this.dpr,
                atlasEntries: this.atlases.size,
                drawCalls: this.drawCalls,
                running: this.rafId !== null,
                reducedMotion: this.motionQuery.matches,
                displacementHookConnected: this.scene.waveField === this.waves,
                waveSources: this.waves.sources.map(source => source.id),
                wavePhase: this.waves.phase,
                waveResets: this.waves.resetCount
            };
        }
    }

    root.Renderer = Renderer;
})();
