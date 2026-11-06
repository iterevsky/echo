# ASCII-WATER — normative visual and rendering specification (W-1)

## 1. Status and interpretation

This is the single approved direction for the laboratory renderer. It describes a procedural **night-water landscape**: a low shoreline, a distant vertical light column, and its mirrored, attenuated reflection below the waterline. The character field is the primary image, not a decorative overlay.

- **D4:** spatial character density is hybrid; the scene is never uniformly dense or uniformly sparse.
- **D5:** the scene contains a shoreline band, distant light column, and mirrored reflection, all generated procedurally.
- **D6:** wave height primarily changes reflection sampling geometry. Brightness and glyph density responses are secondary.
- **D7:** idle water is calm and slow, with rare, small impulses; there is no rain or constant ripple field.
- **D-7 / platform contingency:** use Canvas 2D. A different graphics API is out of scope here.
- **PTV:** proposed tuning value for laboratory validation. PTV is not an unresolved direction or an author-approval gate.
- Values marked **Existing CRT token** reproduce values already present in the project's `style.css`.

D4–D7 above refer to Step-4 final decisions 4–7. The historical platform contingency is explicitly written D-7, so the two numbering systems are not conflated.

No alternative compositions, rendering pipelines, or open design choices are specified. W-2 implements this document; rendered acceptance belongs to W-2.

## 2. Coordinates, viewport, and cell grid

### 2.1 Normalized scene space

All procedural functions consume normalized coordinates `(x, y)`:

- `x = column / max(1, cols - 1)` and `y = row / max(1, rows - 1)`.
- `x = 0, y = 0` is the upper-left; `x = 1, y = 1` is the lower-right.
- `clamp(v) = min(1, max(0, v))`.
- `fract(v) = v - floor(v)`.
- `mix(a, b, t) = a + (b - a) * t`.

**Source:** PTV.

### 2.2 Cell-size ladder and grid dimensions

| Parameter | Required value | Source |
|---|---:|---|
| Available cell sizes | 8, 10, 12 CSS px | W-2 contract |
| Initial cell size | 12 CSS px | PTV |
| Device-pixel ratio used by the visible canvas | `min(window.devicePixelRatio || 1, 2)` | PTV |
| Column count | `cols = max(1, floor(cssWidth / cellPx))` | PTV |
| Row count | `rows = max(1, floor(cssHeight / cellPx))` | PTV |
| Actual cell width | `cellWidth = cssWidth / cols` | PTV |
| Actual cell height | `cellHeight = cssHeight / rows` | PTV |
| Visible canvas backing size | `round(cssWidth * dpr) × round(cssHeight * dpr)` | PTV |
| Visible-context transform | `setTransform(dpr, 0, 0, dpr, 0, 0)` | PTV |

The fractional `cellWidth` and `cellHeight` cover the viewport exactly; do not crop or leave an unpainted strip at the far edge. Resize recomputes the grid, buffers, and atlas. The 8/10/12 controls redraw immediately. Automatic quality changes are not part of W-2.

**Source for all rules in this subsection:** PTV except the ladder, which is the W-2 contract.

## 3. Scene composition

### 3.1 Fixed geometry

| Feature | Required geometry / value | Source |
|---|---|---|
| Sky region | `0 ≤ y < shoreY(x)` | D5; numeric shape PTV |
| Shoreline band | `shoreY(x) ≤ y < 0.56` | D5; numeric shape PTV |
| Waterline Y | `0.56 * viewportHeight` | D5; fraction PTV |
| Water region | `0.56 ≤ y ≤ 1` | D5 |
| Light-column center X | `0.68 * viewportWidth` | D5; position PTV |
| Light-column core width | `0.018 * viewportWidth` | PTV |
| Light-column halo width | `0.075 * viewportWidth` | PTV |
| Light-column top Y | `0.10 * viewportHeight` | PTV |
| Light-column bottom Y | the waterline, `0.56 * viewportHeight` | D5/PTV |
| Light-column visible height | `0.46 * viewportHeight` | PTV |
| Reflection vertical extent | `0.56 ≤ y ≤ 1`; source is mirrored around Y=0.56 | D5 |

The shoreline is a thin, irregular dark band immediately above the waterline, not a mountain range or a second light source. Define:

```text
shoreY(x) = 0.50
          + 0.006 * sin(2π * (3x + 0.17))
          + 0.003 * sin(2π * 11x)
```

This produces a bounded, deterministic shoreline variation of at most 0.009 in normalized Y.

**Source:** D5 for the feature; formula and amplitudes PTV.

### 3.2 Deterministic texture hash

Use the same reproducible hash wherever a cell needs procedural texture:

```text
hash(x, y) = fract(sin(x * 127.1 + y * 311.7 + 17.0) * 43758.5453)
```

`x` and `y` are normalized scene coordinates. No `Math.random()` call participates in the scene, grain, or ambient scheduling seed.

**Source:** PTV.

### 3.3 Base luminance before the light column

Compute one base value per cell:

```text
if y < shoreY(x):
    base = 0.035 + 0.055 * (1 - y / 0.50)
else if y < 0.56:
    base = 0.10 + 0.09 * hash(x, y)
else:
    t = (y - 0.56) / 0.44
    base = 0.07 + 0.06 * (1 - t)
```

The sky stays sparse and dim, the shoreline receives local texture, and open water stays darker than the light and its reflection.

**Source:** D4/D5 for spatial behavior; values PTV.

### 3.4 Distant light column

For `0.10 ≤ y ≤ 0.56`, calculate:

```text
vertical = clamp((y - 0.10) / 0.06)
halo = max(0, 1 - abs(x - 0.68) / 0.075) ** 2
core = max(0, 1 - abs(x - 0.68) / 0.018)
columnEnergy = vertical * (0.35 * halo + 0.65 * core)
```

Outside that Y interval, `columnEnergy = 0`. The narrow core and wider halo form one distant light source. Apply:

```text
sceneLum = clamp(base + columnEnergy)
```

**Source:** D5 for the column; formula and values PTV.

## 4. Reflection and the W-2 displacement hook

For `y < 0.56`, the final scene luminance is `sceneLum` from §3.

For `y ≥ 0.56`:

1. Compute `t = (y - 0.56) / 0.44`.
2. Compute the reflected source coordinate `sourceY = 2 * 0.56 - y`.
3. Sample the same procedural scene at `(x, sourceY)`, including its light column and shoreline.
4. Apply `attenuation = 0.68 * exp(-1.6 * t)`.
5. Set `reflectedLum = sourceLum * attenuation`.
6. Set `highlight = reflectedLum * (0.45 + 0.55 * hash(x, y))`.
7. Set `waterLum = clamp(reflectedLum + 0.08 * highlight)`.

The reflection is therefore genuinely mirrored and loses energy with depth; it is not an independent second landscape.

**Source:** D5 for mirroring; attenuation/highlight values PTV.

### W-2 identity hook

Before sampling the mirrored source, W-2 calls the displacement hook:

```text
samplePosition = displaceReflection(x, y, waveField)
```

In W-2, `displaceReflection` returns exactly `{ x, y }`; `waveField` may be null. This is pipeline step 4 and is the only displacement extension point. W-3 will make horizontal displacement depend primarily on the wave-height gradient. W-2 must not simulate waves or substitute a brightness-only ripple.

**Source:** D6 plus the W-2/W-3 pipeline contract.

## 5. Character ramps and spatial density

All ramps are ordered from least to greatest ink coverage. They contain symbols only; no ramp encodes or suggests book text.

| Ramp name | Ordered glyphs | Count | Spatial use | Source |
|---|---|---:|---|---|
| Sparse | ` .:-=+*#%@` | 10 | Open sky and open water | D4; glyphs PTV |
| Dense | ` .:+=*%#&@` | 10 | Light column and reflection highlights | D4; glyphs PTV |
| Shore texture | ` .:~-=+#` | 8 | Textured shoreline band | D4/D5; glyphs PTV |

The leading space is intentional in every ramp.

### 5.1 Density map

Calculate `denseWeight` per cell:

```text
if the cell is in the shoreline band:
    denseWeight = 0.35 + 0.45 * hash(x, y)
else:
    denseWeight = max(columnEnergy, highlight or 0 for non-water cells)
```

Then:

```text
density = clamp(0.08 + 0.82 * denseWeight + 0.04 * hash(x, y))
```

Ramp selection is spatial and mandatory:

```text
if the cell is in the shoreline band:
    ramp = Shore texture
else if denseWeight >= 0.35:
    ramp = Dense
else:
    ramp = Sparse
```

Open sky/water therefore stays sparse while the light, highlights, and shoreline become locally dense. No global density multiplier may make the whole scene uniformly dense or sparse.

**Source:** D4/D5 for the spatial behavior; thresholds and formulas PTV.

### 5.2 Density is secondary to luminance geometry

Before quantization, derive:

```text
glyphLum = clamp(currentCellLum * (0.80 + 0.20 * density))
```

`currentCellLum` is `sceneLum` above the waterline and `waterLum` below it. This is a modest secondary density response. It must never replace geometric displacement when waves are added.

**Source:** D6; numeric response PTV.

## 6. Mandatory 4×4 Bayer quantization

Use this exact canonical matrix:

```text
 0  8  2 10
12  4 14  6
 3 11  1  9
15  7 13  5
```

For integer grid coordinates `(column, row)`:

```text
threshold = (bayer[row mod 4][column mod 4] + 0.5) / 16 - 0.5
quantized = clamp(glyphLum + threshold * 0.10)
glyphIndex = round(quantized * (ramp.length - 1))
glyph = ramp[glyphIndex]
```

The dither amplitude is 0.10. Apply it independently to sky, water, shoreline, light, and reflection. Do not omit ordered dithering in quiet gradient zones and do not replace it with random noise.

**Source:** W-2 pipeline contract for the matrix requirement; amplitude and quantization formula PTV.

## 7. Buffers, glyph atlas, and drawing order

### 7.1 Required W-2 pipeline

Keep these seven stages in order:

1. Generate the procedural scene using §§2–3.
2. Render shoreline, light column, and scene lighting into the scene buffer.
3. Produce the mirrored reflection using §4.
4. Call the displacement hook before reflection sampling; identity in W-2.
5. Convert scene/reflection luminance into spatially selected character cells using §§5–6.
6. Apply the mandatory Bayer quantization.
7. Apply night grade, restrained glow, scanlines, vignette, and grain using §§8–9.

### 7.2 Buffer dimensions

| Buffer | Dimensions / format | Source |
|---|---|---|
| Scene offscreen buffer | `cols × rows`, RGBA8 pixels | PTV |
| Reflection offscreen buffer | `cols × rows`, RGBA8 pixels | PTV |
| Luminance sampling | one scene/reflection sample per grid cell | W-2 contract |
| Visible canvas | viewport backing size from §2.2 | PTV |

The offscreen buffers are independent of DPR. DPR affects only atlas and visible-canvas sharpness.

### 7.3 Atlas

Pre-render each glyph of each ramp separately at each supported cell size and current DPR. Do not call `fillText` for every visible cell on every frame.

| Atlas parameter | Required value | Source |
|---|---|---|
| Font | `700 ${cellPx * 0.9}px monospace` | PTV |
| Alignment | `textAlign = "center"`, `textBaseline = "middle"` | PTV |
| Normal atlas cell | `ceil(cellWidth * dpr) × ceil(cellHeight * dpr)` | PTV |
| Glow atlas padding | 4 CSS px on every side, converted by DPR | PTV |
| Atlas variants | normal and restrained-glow, each with 16 grade colors | PTV |
| Grade bins | `gradeBin = round(quantized * 15)`; use `grade(gradeBin / 15)` | PTV |
| Glyph color | The grade-bin color; no runtime composite recoloring | PTV |

The atlas key is `(ramp, cellPx, dpr, gradeBin, glowFlag)`. Draw the selected tinted atlas cell with `drawImage` into the visible cell rectangle. Account for the 4 px glow padding in the source/destination rectangles so the glyph center stays at the cell center. Rebuild atlas entries only when cell size, DPR, ramp, or grade changes.

**Source for atlas strategy:** W-2 technique contract; values PTV.

## 8. Night grade and restrained glow

### 8.1 Palette

| Role | Color | Source |
|---|---|---|
| Page/background | `#06080a` | Required night-background family; exact value PTV |
| Water shadow tint | `#071315` | PTV |
| Low glyph grade | `#0a1b1f` | PTV |
| Middle glyph grade | `#4b8f88` | PTV |
| Highlight glyph grade | `#c9f7e8` | PTV |
| Glow | `rgba(100, 216, 197, 0.16)` | PTV |

### 8.2 Grade interpolation

Interpolate RGB channels linearly, without gamma correction:

```text
if quantized < 0.55:
    color = mixRGB(#0a1b1f, #4b8f88, quantized / 0.55)
else:
    color = mixRGB(#4b8f88, #c9f7e8, (quantized - 0.55) / 0.45)
```

Round the resulting channels to integers. Paint the page/background first with `#06080a`; the water shadow tint is the offscreen water-region base tint and must not hide the reflection.

**Source:** night cyan-green direction from D5; stops/interpolation PTV.

### 8.3 Glow

Use the glow atlas variant only when both conditions hold:

```text
denseWeight >= 0.65 AND quantized >= 0.65
```

The glow uses `rgba(100, 216, 197, 0.16)` and a 4 CSS px blur, baked into the glow atlas. Do not apply a full-screen blur or a second blurred copy of the scene. Glow must not obscure the underlying character shapes.

**Source:** restrained CRT treatment; thresholds/blur PTV.

## 9. Integrated CRT treatment

Apply these after glyph grade/glow, without replacing the characters with a full-screen effect.

| Layer | Existing project token | Lab amount / rule | Source |
|---|---|---|---|
| Scanline pattern | Repeating vertical pattern: transparent 0–2 px, `rgba(0, 0, 0, 0.12)` 2–4 px | Use that exact pattern; layer opacity 0.18 | Existing token; lab opacity PTV |
| Vignette shape | Radial ellipse at center: `rgba(10,14,10,0.15)` at 0%, `rgba(3,6,3,0.94)` at 55%, `rgba(1,3,1,0.98)` at 100% | Use those exact stops; layer opacity 0.22 | Existing token; lab opacity PTV |
| Grain tile | 256 × 256 px tile, screen blend | Tile opacity 0.12; fixed procedural tile | Existing token; lab opacity PTV |
| Rolling band | Existing rolling animation | Off | PTV |

Layer order: scanlines, vignette, then grain. The lab opacity overrides are deliberately restrained; do not copy the stronger chapter or TOC opacity values wholesale. Grain must use a fixed tile generated once, not regenerated per frame.

**Reduced motion:** these layers are static. No scanline motion, rolling band, animated grain, or CRT flicker is introduced by the lab.

## 10. Idle motion and perturbations

### 10.1 Slow underlying drift

The following values are the normative input to the W-3 displacement model; W-2's displacement hook remains identity:

| Parameter | Required value | Source |
|---|---:|---|
| Drift phase increment | `0.055 * elapsedSeconds` radians | D7; rate PTV |
| Horizontal drift amplitude | 0.35 grid cells | D6/D7; amplitude PTV |
| Drift phase at initial render | 0 | PTV |
| Drift function | `sin(phase) * 0.35` grid cells | PTV |

Drift is a low-frequency geometric offset, not a separate brightness pulse.

### 10.2 Rare ambient impulse

After an ambient impulse is scheduled, the next delay is:

```text
nextAmbientSeconds = 20 + 40 * deterministicUnitInterval
```

Use this fixed sequence (PTV), advanced once whenever a new ambient delay is scheduled:

```text
ambientSeed = 0x41534949                         # initial state
ambientSeed = (1664525 * ambientSeed + 1013904223) >>> 0
deterministicUnitInterval = ambientSeed / 4294967296
```

No wall-clock or frame-count randomness is used. Each ambient impulse has:

| Parameter | Required value | Source |
|---|---:|---|
| Normalized strength | 0.08 | D7; value PTV |
| Radius | 2 grid cells | D7; value PTV |
| Concurrent ambient sources | at most 1 | D7 |
| Total active-source ceiling | 3, shared with later input | W-3 contract |
| Rain / drizzle / continuous ripple generator | prohibited | D7 |

The scene remains calm between impulses. No perpetual small drops are allowed to imitate rain.

## 11. Reduced-motion static frame

When `prefers-reduced-motion: reduce` matches:

1. Render the same complete scene at phase 0.
2. Use the fixed grain tile and static scanline/vignette layers.
3. Do not start a `requestAnimationFrame` loop.
4. Do not schedule ambient impulses and do not apply drift or pointer-generated waves.
5. Redraw once on initial render, resize, or an explicit 8/10/12 cell-size change.

No scene feature is removed: shoreline, light column, mirrored reflection, spatial density, and Bayer dithering remain present in the static frame.

**Source:** D7 plus the reduced-motion requirement; implementation rule PTV.

## 12. Lab instrumentation and operational contract

W-2 wires the lab with native browser JavaScript and plain script composition only: no framework, build step, dependency, or invented loader. The lab files remain under `lab/ascii-water/`; production integration is not part of W-1 or W-2.

The metrics overlay is a small top-left monospace readout with `rgba(0,0,0,0.65)` background and 8 px padding (PTV). It reports:

| Metric | Definition | Source |
|---|---|---|
| FPS | `1000 / meanFrameMilliseconds` over the latest 120 frames | PTV |
| p95 frame time | 95th percentile of those frame intervals | PTV |
| Dropped-frame ratio | fraction of intervals greater than 25 ms | PTV |
| Payload | actual transferred/encoded bytes for lab resources, reported in bytes and KiB | W-2 contract |

Metrics are diagnostic here; this document creates no new performance gate. The existing device acceptance policy remains unchanged.

## 13. W-2 implementation acceptance inherited by this specification

W-2 must be able to produce all of the following from the values above, without inventing a different direction:

- A complete night landscape with the shoreline at Y=0.50–0.56, the distant light at X=0.68, and a mirrored reflection below Y=0.56.
- Sparse open sky/water and locally dense shoreline/light/reflection cells.
- Visible 4×4 Bayer quantization in gradients.
- The identity displacement hook in pipeline step 4, ready for W-3.
- Functional 8, 10, and 12 px cell modes with atlas pre-rendering and per-cell `drawImage`.
- The specified night grade, restrained glow, and CRT treatment without losing character readability.
- Calm idle behavior, no rain, and a complete reduced-motion static frame.
- Live FPS, p95 frame time, dropped-frame ratio, and payload instrumentation.

W-1 is complete as a written specification. No renderer, sketch, production file, or rendered acceptance claim is created by this task.
