(function () {
'use strict';
const RAMPS = [' .:-=+*#%@', ' .:+=*%#&@', ' .:~-=+#'];
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const PROFILES = {
8: { scanlines: 0.18, vignette: 0.22, grain: 0.12 },
10: { scanlines: 0.12, vignette: 0.18, grain: 0.06 },
12: { scanlines: 0.08, vignette: 0.14, grain: 0 },
14: { scanlines: 0.06, vignette: 0.11, grain: 0 },
16: { scanlines: 0.04, vignette: 0.08, grain: 0 }
};
const TARGET_FRAME_MS = 1000 / 30;
const clamp = (v, low = 0, high = 1) => Math.min(high, Math.max(low, v));
const hash = (x, y) => {
const n = Math.sin(x * 127.1 + y * 311.7 + 17) * 43758.5453;
return n - Math.floor(n);
};
const GRADES = Array.from({ length: 16 }, (_, i) => {
const t = i / 15;
const a = t < 0.55 ? [10, 27, 31] : [75, 143, 136];
const b = t < 0.55 ? [75, 143, 136] : [201, 247, 232];
const f = t < 0.55 ? t / 0.55 : (t - 0.55) / 0.45;
return 'rgb(' + a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',') + ')';
});
class Scene {
constructor(sourceImage) { this.sourceImage = sourceImage; }
resize(cols, rows, cssWidth = cols, cssHeight = rows) {
this.cols = cols;
this.rows = rows;
const n = cols * rows;
this.sb = new Uint8ClampedArray(n * 4);
this.rb = new Uint8ClampedArray(n * 4);
this.lum = new Float32Array(n);
this.column = new Float32Array(n);
this.highlight = new Float32Array(n);
this.dense = new Float32Array(n);
this.glyph = new Float32Array(n);
this.ramp = new Uint8Array(n);
this.shore = new Uint8Array(n);
const image = this.sourceImage;
if (!image || !image.naturalWidth || !image.naturalHeight) throw new Error('cover source image is unavailable');
this.sourceWidth = image.naturalWidth;
this.sourceHeight = image.naturalHeight;
this.cssWidth = cssWidth;
this.cssHeight = cssHeight;
this.cropScale = Math.max(cssWidth / this.sourceWidth, cssHeight / this.sourceHeight);
this.cropWidth = cssWidth / this.cropScale;
this.cropHeight = cssHeight / this.cropScale;
this.cropX = (this.sourceWidth - this.cropWidth) / 2;
this.cropY = (this.sourceHeight - this.cropHeight) / 2;
this.waterline = clamp((0.63 * this.sourceHeight - this.cropY) * this.cropScale / cssHeight);
const canvas = document.createElement('canvas');
canvas.width = cols;
canvas.height = rows;
const context = canvas.getContext('2d');
context.drawImage(image, this.cropX, this.cropY, this.cropWidth, this.cropHeight, 0, 0, cols, rows);
const pixels = context.getImageData(0, 0, cols, rows).data;
this.sourceLum = new Float32Array(n);
for (let i = 0; i < n; i++) {
const offset = i * 4;
this.sourceLum[i] = (0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2]) / 255;
}
}
sourcePoint(x, y) {
return {
x: (this.cropX + clamp(x) * this.cssWidth / this.cropScale) / this.sourceWidth,
y: (this.cropY + clamp(y) * this.cssHeight / this.cropScale) / this.sourceHeight
};
}
sampleSource(x, y) {
const gx = clamp((x * this.sourceWidth - this.cropX) / this.cropWidth) * (this.cols - 1);
const gy = clamp((y * this.sourceHeight - this.cropY) / this.cropHeight) * (this.rows - 1);
const x0 = Math.floor(gx), y0 = Math.floor(gy);
const x1 = Math.min(this.cols - 1, x0 + 1), y1 = Math.min(this.rows - 1, y0 + 1);
const tx = gx - x0, ty = gy - y0;
const top = this.sourceLum[y0 * this.cols + x0] * (1 - tx) + this.sourceLum[y0 * this.cols + x1] * tx;
const bottom = this.sourceLum[y1 * this.cols + x0] * (1 - tx) + this.sourceLum[y1 * this.cols + x1] * tx;
return top * (1 - ty) + bottom * ty;
}
sample(x, y) {
const point = this.sourcePoint(x, y);
return { lum: this.sampleSource(point.x, point.y), column: 0, shore: false };
}
gray(buffer, index, lum, water) {
const offset = index * 4;
buffer[offset] = Math.round((water ? 0 : 0) + clamp(lum) * (water ? 248 : 255));
buffer[offset + 1] = Math.round((water ? 0 : 0) + clamp(lum) * (water ? 236 : 255));
buffer[offset + 2] = Math.round((water ? 0 : 0) + clamp(lum) * (water ? 234 : 255));
buffer[offset + 3] = 255;
}
generate(field) {
for (let row = 0; row < this.rows; row++) {
const y = row / Math.max(1, this.rows - 1);
for (let col = 0; col < this.cols; col++) {
const x = col / Math.max(1, this.cols - 1);
const i = row * this.cols + col;
const s = this.sample(x, y);
this.lum[i] = s.lum;
this.column[i] = 0;
this.shore[i] = 0;
this.gray(this.sb, i, s.lum, false);
}
}
for (let row = 0; row < this.rows; row++) {
const y = row / Math.max(1, this.rows - 1);
for (let col = 0; col < this.cols; col++) {
const x = col / Math.max(1, this.cols - 1);
const i = row * this.cols + col;
if (y < this.waterline) {
this.highlight[i] = 0;
this.gray(this.rb, i, 0, false);
continue;
}
const t = (y - this.waterline) / Math.max(0.0001, 1 - this.waterline);
const p = field.displace(x, y);
const point = this.sourcePoint(p.x, p.y);
const reflected = this.sampleSource(point.x, 1.26 - point.y) * 0.68 * Math.exp(-1.6 * t);
const highlight = reflected * (0.45 + 0.55 * hash(x * 3.7 + field.time * 2.3, y * 2.9 + field.time * 1.7));
this.highlight[i] = highlight;
this.lum[i] = clamp(reflected + 0.08 * highlight);
this.gray(this.rb, i, this.lum[i], true);
}
}
for (let row = 0; row < this.rows; row++) {
for (let col = 0; col < this.cols; col++) {
const i = row * this.cols + col;
const x = col / Math.max(1, this.cols - 1);
const y = row / Math.max(1, this.rows - 1);
const dense = Math.max(this.column[i], this.highlight[i]);
const density = clamp(0.08 + 0.82 * dense + 0.04 * hash(x, y));
this.dense[i] = dense;
this.ramp[i] = dense >= 0.35 ? 1 : 0;
this.glyph[i] = clamp(this.lum[i] * (0.80 + 0.20 * density));
}
}
}
}
class Field {
constructor(cols, rows) {
this.phase = 0;
this.time = 0;
this.accumulator = 0;
this.ambientElapsed = 0;
this.ambientSeed = 0x41534949;
this.ambientCount = 0;
this.sourceId = 0;
this.resetCount = 0;
this.sources = [];
this.nextAmbient = this.ambientDelay();
this.resize(cols, rows);
}
resize(cols, rows) {
this.cols = cols;
this.rows = rows;
const n = cols * rows;
this.current = new Float32Array(n);
this.next = new Float32Array(n);
this.damping = new Float32Array(n);
for (let y = 0; y < rows; y++) {
for (let x = 0; x < cols; x++) {
const d = Math.min(x, y, cols - 1 - x, rows - 1 - y);
this.damping[y * cols + x] = d === 0 ? 0.985 : d === 1 ? 0.90 : d === 2 ? 0.96 : d === 3 ? 0.99 : 1;
}
}
this.sources.length = 0;
this.accumulator = 0;
}
ambientDelay() {
this.ambientSeed = (1664525 * this.ambientSeed + 1013904223) >>> 0;
return 4 + 8 * this.ambientSeed / 4294967296;
}
reset() {
this.current.fill(0);
this.next.fill(0);
this.sources.length = 0;
this.accumulator = 0;
}
drop(x, y, strength, radius = 3) {
if (![x, y, strength, radius].every(Number.isFinite) || radius <= 0) return null;
const source = { id: ++this.sourceId, x: clamp(x, 0, this.cols - 1), y: clamp(y, 0, this.rows - 1), strength, radius, time: this.time, ambient: false };
if (this.sources.length >= 3) this.sources.shift();
this.sources.push(source);
for (let row = Math.max(1, Math.floor(source.y - radius)); row <= Math.min(this.rows - 2, Math.ceil(source.y + radius)); row++) {
for (let col = Math.max(1, Math.floor(source.x - radius)); col <= Math.min(this.cols - 2, Math.ceil(source.x + radius)); col++) {
const distance = Math.hypot(col - source.x, row - source.y);
if (distance <= radius) this.current[row * this.cols + col] += strength * (1 - distance / radius) ** 2;
}
}
return source.id;
}
boundary(index, value) {
const result = value * 0.999 * this.damping[index];
if (!Number.isFinite(result) || Math.abs(result) > 16) {
this.resetCount++;
this.reset();
return false;
}
this.next[index] = result;
return true;
}
step() {
const current = this.current;
const next = this.next;
const mur = (Math.SQRT1_2 - 1) / (Math.SQRT1_2 + 1);
for (let y = 1; y < this.rows - 1; y++) {
for (let x = 1; x < this.cols - 1; x++) {
const i = y * this.cols + x;
if (!this.boundary(i, ((current[i - 1] + current[i + 1] + current[i - this.cols] + current[i + this.cols]) * 0.5 - next[i]) * 0.999)) return;
}
}
for (let x = 1; x < this.cols - 1; x++) {
const top = x;
const bottom = (this.rows - 1) * this.cols + x;
if (!this.boundary(top, current[top + this.cols] + mur * (next[top + this.cols] - current[top]))) return;
if (!this.boundary(bottom, current[bottom - this.cols] + mur * (next[bottom - this.cols] - current[bottom]))) return;
}
for (let y = 1; y < this.rows - 1; y++) {
const left = y * this.cols;
const right = left + this.cols - 1;
if (!this.boundary(left, current[left + 1] + mur * (next[left + 1] - current[left]))) return;
if (!this.boundary(right, current[right - 1] + mur * (next[right - 1] - current[right]))) return;
}
next[0] = next[this.cols - 1] = next[(this.rows - 1) * this.cols] = next[this.rows * this.cols - 1] = 0;
this.current = next;
this.next = current;
this.time += 1 / 60;
for (let i = this.sources.length - 1; i >= 0; i--) {
if (this.time - this.sources[i].time >= 6) this.sources.splice(i, 1);
}
}
advance(seconds) {
if (!Number.isFinite(seconds) || seconds <= 0) return;
const elapsed = Math.min(seconds, 1);
this.phase += 0.055 * elapsed;
this.ambientElapsed += elapsed;
this.accumulator += elapsed;
let steps = 0;
while (this.accumulator >= 1 / 60 && steps < 60) {
this.step();
this.accumulator -= 1 / 60;
steps++;
}
if (this.ambientElapsed >= this.nextAmbient) {
this.ambientElapsed -= this.nextAmbient;
this.nextAmbient = this.ambientDelay();
this.ambientCount++;
if (!this.sources.some(source => source.ambient)) {
const x = (0.18 + 0.64 * hash(this.ambientCount, 1.7)) * (this.cols - 1);
const y = (0.65 + 0.25 * hash(this.ambientCount, 4.2)) * (this.rows - 1);
const id = this.drop(x, y, 0.25, 3);
const source = this.sources.find(item => item.id === id);
if (source) source.ambient = true;
}
}
}
height(x, y) {
const gx = clamp(x, 0, this.cols - 1);
const gy = clamp(y, 0, this.rows - 1);
const x0 = Math.floor(gx), y0 = Math.floor(gy);
const x1 = Math.min(this.cols - 1, x0 + 1), y1 = Math.min(this.rows - 1, y0 + 1);
const tx = gx - x0, ty = gy - y0;
const top = this.current[y0 * this.cols + x0] * (1 - tx) + this.current[y0 * this.cols + x1] * tx;
const bottom = this.current[y1 * this.cols + x0] * (1 - tx) + this.current[y1 * this.cols + x1] * tx;
return top * (1 - ty) + bottom * ty;
}
displace(x, y) {
const gx = x * (this.cols - 1), gy = y * (this.rows - 1);
const gradient = (this.height(gx + 1, gy) - this.height(gx - 1, gy)) * 0.5;
const offset = clamp(gradient * 18, -4, 4) + Math.sin(this.phase) * 0.35;
return { x: x + offset / Math.max(1, this.cols - 1), y };
}
modulation(x, y) {
return 1 + clamp(this.height(x * (this.cols - 1), y * (this.rows - 1)) * 0.06, -0.06, 0.06);
}
}
class Quality {
constructor(view) {
this.view = view;
this.intervals = [];
this.changes = [];
this.lastChange = -Infinity;
this.below24Since = null;
this.fallback = false;
}
p95(count) {
const samples = this.intervals.slice(-count).sort((a, b) => a - b);
return samples.length ? samples[Math.floor((samples.length - 1) * 0.95)] : 0;
}
mean(count) {
const samples = this.intervals.slice(-count);
const total = samples.reduce((sum, value) => sum + value, 0);
return samples.length ? samples.length * 1000 / total : 0;
}
setCell(cellPx, timestamp, reason) {
if (this.view.cellPx === cellPx || this.fallback) return;
this.changes.push({ from: this.view.cellPx, to: cellPx, reason, timestamp });
this.lastChange = timestamp;
this.intervals.length = 0;
this.below24Since = null;
this.view.setCellSize(cellPx);
}
record(frameMs, timestamp) {
if (this.fallback || !Number.isFinite(frameMs) || frameMs <= 0) return;
this.intervals.push(frameMs);
if (this.intervals.length > 600) this.intervals.shift();
if (this.view.cellPx === 16 && this.intervals.length >= 300 && this.mean(300) < 24 - 1e-9) {
if (this.below24Since === null) this.below24Since = timestamp;
if (timestamp - this.below24Since >= 10000) {
this.fallback = true;
this.view.freeze();
return;
}
} else this.below24Since = null;
if (timestamp - this.lastChange < 5000) return;
if (!document.getElementById('cover-screen').classList.contains('visible')) {
if (this.intervals.length >= 90 && this.p95(90) > 40 && this.view.cellPx < 16) this.setCell(this.view.cellPx + 2, timestamp, 'downgrade');
else if (this.intervals.length >= 300 && this.p95(300) < 34 && this.mean(300) >= 27 && this.view.cellPx > 8) this.setCell(this.view.cellPx - 2, timestamp, 'upgrade');
}
}
}
class View {
constructor(canvas, sourceImage) {
this.canvas = canvas;
this.context = canvas.getContext('2d', { alpha: false });
this.cellPx = 12;
this.rafId = null;
this.lastTimestamp = null;
this.destroyed = false;
this.frozen = false;
this.intervals = [];
this.runIntervals = [];
this.pendingInputs = [];
this.inputLatencies = [];
this.firstWaterFrameMs = 0;
this.firstResponsiveTouchMs = 0;
this.lastInputLatencyMs = 0;
this.lastRenderMs = 0;
this.totalFrameMs = 0;
this.totalDropped = 0;
this.reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
this.reduced = this.reducedQuery.matches;
this.tick = this.tick.bind(this);
this.resize = this.resize.bind(this);
this.motionChange = this.motionChange.bind(this);
this.scene = new Scene(sourceImage);
this.field = new Field(1, 1);
this.quality = new Quality(this);
this.buildGrain();
this.resize();
window.addEventListener('resize', this.resize);
if (this.reducedQuery.addEventListener) this.reducedQuery.addEventListener('change', this.motionChange);
else this.reducedQuery.addListener(this.motionChange);
if (!this.reduced) this.start();
}
buildGrain() {
this.grain = document.createElement('canvas');
this.grain.width = this.grain.height = 256;
const context = this.grain.getContext('2d');
const image = context.createImageData(256, 256);
for (let y = 0; y < 256; y++) {
for (let x = 0; x < 256; x++) {
const i = (y * 256 + x) * 4;
const value = Math.round(hash(x, y) * 110);
image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
image.data[i + 3] = 255;
}
}
context.putImageData(image, 0, 0);
}
setCellSize(cellPx) {
this.cellPx = cellPx;
this.resize();
}
atlas(ramp, grade, glow) {
const key = [ramp, grade, glow].join(':');
if (this.atlases.has(key)) return this.atlases.get(key);
const dpr = this.dpr, padding = glow ? 4 : 0;
const width = Math.ceil(this.cellWidth * dpr) + Math.ceil(padding * 2 * dpr);
const height = Math.ceil(this.cellHeight * dpr) + Math.ceil(padding * 2 * dpr);
const canvas = document.createElement('canvas');
canvas.width = width * RAMPS[ramp].length;
canvas.height = height;
const context = canvas.getContext('2d');
context.setTransform(dpr, 0, 0, dpr, padding * dpr, padding * dpr);
context.font = '700 ' + this.cellPx * 0.9 + 'px monospace';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillStyle = GRADES[grade];
for (let i = 0; i < RAMPS[ramp].length; i++) {
const x = i * width / dpr + this.cellWidth / 2;
if (glow) {
context.shadowColor = 'rgba(100,216,197,0.16)';
context.shadowBlur = 4 * dpr;
context.fillText(RAMPS[ramp][i], x, this.cellHeight / 2);
context.shadowColor = 'transparent';
context.shadowBlur = 0;
}
context.fillText(RAMPS[ramp][i], x, this.cellHeight / 2);
}
const atlas = { canvas, width, height, padding };
this.atlases.set(key, atlas);
return atlas;
}
buildTreatment() {
const profile = PROFILES[this.cellPx];
this.treatment = document.createElement('canvas');
this.treatment.width = this.canvas.width;
this.treatment.height = this.canvas.height;
const context = this.treatment.getContext('2d');
context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
const lines = document.createElement('canvas');
lines.width = 1;
lines.height = 4;
lines.getContext('2d').fillStyle = 'rgba(0,0,0,0.12)';
lines.getContext('2d').fillRect(0, 2, 1, 2);
context.globalAlpha = profile.scanlines;
context.fillStyle = context.createPattern(lines, 'repeat');
context.fillRect(0, 0, this.cssWidth, this.cssHeight);
context.save();
context.translate(this.cssWidth / 2, this.cssHeight / 2);
context.scale(this.cssWidth / 2, this.cssHeight / 2);
const vignette = context.createRadialGradient(0, 0, 0, 0, 0, 1);
vignette.addColorStop(0, 'rgba(10,14,10,0.15)');
vignette.addColorStop(0.55, 'rgba(3,6,3,0.94)');
vignette.addColorStop(1, 'rgba(1,3,1,0.98)');
context.globalAlpha = profile.vignette;
context.fillStyle = vignette;
context.fillRect(-1, -1, 2, 2);
context.restore();
if (profile.grain > 0) {
context.globalCompositeOperation = 'screen';
context.globalAlpha = profile.grain;
context.fillStyle = context.createPattern(this.grain, 'repeat');
context.fillRect(0, 0, this.cssWidth, this.cssHeight);
context.globalCompositeOperation = 'source-over';
}
context.globalAlpha = 1;
}
resize() {
if (this.destroyed) return;
const bounds = this.canvas.getBoundingClientRect();
this.cssWidth = Math.max(1, bounds.width);
this.cssHeight = Math.max(1, bounds.height);
this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
this.cols = Math.max(1, Math.floor(this.cssWidth / this.cellPx));
this.rows = Math.max(1, Math.floor(this.cssHeight / this.cellPx));
this.cellWidth = this.cssWidth / this.cols;
this.cellHeight = this.cssHeight / this.rows;
this.canvas.width = Math.round(this.cssWidth * this.dpr);
this.canvas.height = Math.round(this.cssHeight * this.dpr);
this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
this.atlases = new Map();
this.scene.resize(this.cols, this.rows, this.cssWidth, this.cssHeight);
this.field.resize(this.cols, this.rows);
this.buildTreatment();
this.render();
}
render() {
if (this.destroyed) return;
this.scene.generate(this.field);
const context = this.context;
context.fillStyle = '#06080a';
context.fillRect(0, 0, this.cssWidth, this.cssHeight);
for (let row = 0; row < this.rows; row++) {
for (let col = 0; col < this.cols; col++) {
const i = row * this.cols + col;
const x = col / Math.max(1, this.cols - 1);
const y = row / Math.max(1, this.rows - 1);
const threshold = (BAYER[row % 4][col % 4] + 0.5) / 16 - 0.5;
const modulation = y < this.scene.waterline ? 1 : this.field.modulation(x, y);
const quantized = clamp(this.scene.glyph[i] * modulation + threshold * 0.10);
const ramp = this.scene.ramp[i];
const glyph = Math.round(quantized * (RAMPS[ramp].length - 1));
if (!glyph) continue;
const glow = this.scene.dense[i] >= 0.65 && quantized >= 0.65 ? 1 : 0;
const atlas = this.atlas(ramp, Math.round(quantized * 15), glow);
context.drawImage(atlas.canvas, glyph * atlas.width, 0, atlas.width, atlas.height,
col * this.cellWidth - atlas.padding, row * this.cellHeight - atlas.padding,
this.cellWidth + atlas.padding * 2, this.cellHeight + atlas.padding * 2);
}
}
context.drawImage(this.treatment, 0, 0, this.cssWidth, this.cssHeight);
if (!this.firstWaterFrameMs) this.firstWaterFrameMs = performance.now();
}
start() {
if (this.destroyed || this.frozen || this.reduced || this.rafId !== null) return;
this.lastTimestamp = null;
this.rafId = requestAnimationFrame(this.tick);
}
tick(timestamp) {
if (this.destroyed || this.frozen || this.reduced) {
this.rafId = null;
return;
}
this.rafId = requestAnimationFrame(this.tick);
const frameMs = this.lastTimestamp === null ? 0 : timestamp - this.lastTimestamp;
if (this.lastTimestamp !== null && frameMs < TARGET_FRAME_MS - 0.5) return;
const started = performance.now();
this.field.advance(frameMs / 1000);
this.render();
const renderMs = performance.now() - started;
this.lastRenderMs = renderMs;
if (this.pendingInputs.length) {
for (const input of this.pendingInputs) {
this.lastInputLatencyMs = Math.max(0, started - input);
this.inputLatencies.push(this.lastInputLatencyMs);
if (!this.firstResponsiveTouchMs) this.firstResponsiveTouchMs = started;
}
this.pendingInputs.length = 0;
if (this.inputLatencies.length > 120) this.inputLatencies.splice(0, this.inputLatencies.length - 120);
}
if (this.lastTimestamp !== null) {
this.intervals.push(frameMs);
this.runIntervals.push(frameMs);
this.totalFrameMs += frameMs;
this.totalDropped += Math.max(0, Math.round(frameMs / TARGET_FRAME_MS) - 1);
if (this.intervals.length > 120) this.intervals.shift();
this.quality.record(frameMs, timestamp);
}
this.lastTimestamp = timestamp;
}
motionChange() {
this.reduced = this.reducedQuery.matches;
if (this.reduced) {
if (this.rafId !== null) cancelAnimationFrame(this.rafId);
this.rafId = null;
this.field.reset();
this.field.phase = 0;
this.render();
} else this.start();
}
setReducedMotion(value) {
this.reduced = Boolean(value);
if (this.reduced) {
if (this.rafId !== null) cancelAnimationFrame(this.rafId);
this.rafId = null;
this.field.reset();
this.field.phase = 0;
this.render();
} else this.start();
}
freeze() {
this.frozen = true;
if (this.rafId !== null) cancelAnimationFrame(this.rafId);
this.rafId = null;
this.lastTimestamp = null;
}
destroy() {
this.freeze();
this.destroyed = true;
window.removeEventListener('resize', this.resize);
if (this.reducedQuery.removeEventListener) this.reducedQuery.removeEventListener('change', this.motionChange);
else this.reducedQuery.removeListener(this.motionChange);
}
drop(x, y, strength) {
if (this.destroyed || this.reduced) return null;
const id = this.field.drop(x, y, strength, 3);
if (id !== null) this.pendingInputs.push(performance.now());
return id;
}
getMetrics() {
const mean = this.intervals.length ? this.intervals.reduce((sum, value) => sum + value, 0) / this.intervals.length : 0;
const sorted = this.intervals.slice().sort((a, b) => a - b);
const runSorted = this.runIntervals.slice().sort((a, b) => a - b);
const inputs = this.inputLatencies.slice().sort((a, b) => a - b);
const dropped = this.intervals.reduce((total, value) => total + Math.max(0, Math.round(value / TARGET_FRAME_MS) - 1), 0);
return {
frames: this.intervals.length,
fps: mean ? 1000 / mean : 0,
p95Ms: sorted.length ? sorted[Math.floor((sorted.length - 1) * 0.95)] : 0,
droppedRatio: this.intervals.length ? dropped / (this.intervals.length + dropped) : 0,
renderMs: this.lastRenderMs,
inputLatencyMs: this.lastInputLatencyMs,
inputP95Ms: inputs.length ? inputs[Math.floor((inputs.length - 1) * 0.95)] : 0,
firstWaterFrameMs: this.firstWaterFrameMs,
firstResponsiveTouchMs: this.firstResponsiveTouchMs,
runFrames: this.runIntervals.length,
runMeanFps: this.totalFrameMs ? this.runIntervals.length * 1000 / this.totalFrameMs : 0,
runP95Ms: runSorted.length ? runSorted[Math.floor((runSorted.length - 1) * 0.95)] : 0,
runDroppedRatio: this.runIntervals.length ? this.totalDropped / (this.runIntervals.length + this.totalDropped) : 0,
cellPx: this.cellPx,
dpr: this.dpr,
grid: [this.cols, this.rows],
qualityChanges: this.quality.changes.slice(),
fallback: this.quality.fallback,
waveResets: this.field.resetCount,
reducedMotion: this.reduced,
frozen: this.frozen
};
}
}
let active = null;
window.__echoWater = {
init(canvas, { sourceImage } = {}) {
if (!sourceImage) throw new Error('cover source image is required');
if (active) active.destroy();
active = new View(canvas, sourceImage);
return active;
},
destroy() {
if (active) active.destroy();
active = null;
},
drop(x, y, strength) {
return active ? active.drop(x, y, strength) : null;
},
setReducedMotion(value) {
if (active) active.setReducedMotion(value);
}
};
})();
