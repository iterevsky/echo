# ASCII-WATER — gesture and production integration contract (W-7)

Date: 2026-11-11. Status: **validated in the laboratory; no production changes made.** Dependencies verified: W-3 `0b0f894249114e1c9e893bca1d6a0d85edb55b94`, W-4 `f0d8a9a89d03350695f998e56043d46270b06375`, T12 `d46c4c9d5dc98f84ebc76cd8f139cdab4a9025ae`. W-6's deferred-loading plan is preserved.

## 1. Event ownership and the single tap channel

The lab canvas owns `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture`, `pointerleave`, and `keydown`. Window `blur` and document `visibilitychange` cancel active gestures. There are **no `click` or `touchend` gesture listeners** and no competing global entry recognizer. Compatibility clicks and `touchend` events cannot create a second effect.

T12's unified-channel protection is the model: pointerup is the only tap channel, with pointer-type filtering and cancellation. The lab's `onTap(tap)` callback and `entrySignals` array are the entry-signal interface. `taps` records the same gesture metadata; `effects` records the gesture-to-effect mapping without turning a log entry into another entry event.

Cell-size buttons own their ordinary button `click` handlers only; they are not water gestures. Keyboard/non-gesture entry affordances and entry-sequence internals/timing remain unchanged in production.

For W-8, the cover canvas uses this same single recognizer. `startSequence()` is called synchronously by the entry-signal path, never by a second click handler.

## 2. Coordinates and DPR/cell-size interpretation

Pointer coordinates are captured on `pointerdown` and retained for tap completion. Conversion uses the canvas CSS rectangle and the renderer's current `cellWidth`/`cellHeight`:

```text
cssX = clamp(clientX - rect.left, 0, rect.width)
cssY = clamp(clientY - rect.top, 0, rect.height)
gridX = clamp(cssX / cellWidth, 0, cols - 1)
gridY = clamp(cssY / cellHeight, 0, rows - 1)
normalizedX = cssX / rect.width
normalizedY = cssY / rect.height
```

`gridX/gridY` are continuous simulation-grid coordinates. DPR affects backing sharpness only and is **not multiplied again** into these coordinates. Current cell size and fractional cell dimensions are respected. Out-of-range input clamps to grid bounds. Tap impulses use the **original contact coordinates**, not the pointerup position. Keyboard entry uses the canvas center (`normalizedX = normalizedY = 0.5`).

## 3. Gesture-to-effect model

| Input | Classification | Water effect | Entry signal |
| --- | --- | --- | --- |
| Touch/pen short tap | Movement `<8 px` **and** duration `<250 ms` | Strength `0.65`, default radius `3`, at original contact | Exactly one |
| Touch/pen drag | Distance `≥8 px`, or release classified as drag | Velocity-clamped wake, strength `0.12–0.65`, radius `2`, 24 ms trail cadence | **None** |
| Long press | Duration `≥250 ms` without a short tap | No tap impulse | **None** |
| Swipe up | Treated as drag, never a special entry gesture | Wake only | **None** |
| Mouse hover | `pointerType=mouse`, `buttons=0` | Strength `0.035–0.08`, radius `2`, at least 40 ms between impulses | **None** |
| Mouse drag | Mouse movement crossing the drag threshold | Velocity-clamped wake, strength `0.12–0.65`, radius `2` | **None** |
| Stationary mouse click | Short, sub-threshold press/release | Strong splash, strength `1.1`, radius `3`, at original click | Exactly one |
| Keyboard Enter/Space | Non-repeat keydown on focused canvas | Strength `0.65`, radius `3`, centered | Exactly one per activation |

Velocity is clamped to 4000 CSS px/s. At most **three contacts** are tracked independently; a fourth is rejected with `cap-reject`. Three active wave sources are retained with oldest-source recycling.

`pointercancel`, `lostpointercapture`, and blur clear active pointer state and retire input-source metadata for the affected contact(s); blur retires all input sources, including hover. Ambient sources are not treated as input cancellation state. Existing physical wave energy dissipates through the normal height-field simulation—no new impulses are emitted after cancellation.

## 4. Exact production invocation and entry ordering

The production public call is exactly:

```js
window.__echoWater.drop(x, y, strength)
```

**There is no radius argument.** The call is guarded by the existence of a ready module and a callable `drop`, is fire-and-forget, and is **never awaited by the entry handler**. A rejected call cannot reject or delay entry.

The required tap order is:

1. Classify once on the unified pointer channel; never reclassify the gesture as tap and drag.
2. Retain the original contact coordinates in grid units.
3. If the module is ready, invoke `drop(x, y, strength)` synchronously without awaiting it. If it is still loading, place **one bounded impulse for the current entry attempt** in the single pending slot. If it failed, discard the impulse.
4. Call the existing `startSequence()` immediately, regardless of module readiness or the queued impulse.
5. If the module becomes ready while water is still visible, flush the pending impulse on the next rendered frame.
6. If the transition covers the water first, discard the pending impulse. Freeze only when that existing transition covers the water.
7. Destroy the module after the transition completes.

The pending slot holds only the latest impulse for the current attempt; rapid taps cannot grow an unbounded queue. Module failure or cover clears it. Calling `ready()` after failure or cover is inert and cannot flush an old splash. Offline initialization follows W-6: it works only after an actual successful cache write; otherwise entry continues without water.

## 5. Production default radius — **3 grid cells, validated**

**W-8 must use exactly `3` simulation-grid cells as the default radius for every public `drop(x, y, strength)` call.** This is an engineering parameter validated in the lab, **not PTV and not a new author-approval gate**.

The radius is centered on the supplied grid coordinates; the nominal diameter is `2 × radius = 6 cells`. Its apparent diameter scales with the ladder: 48 px at 8 px cells, 60 px at 10 px cells, and 72 px at 12 px cells. It is large enough to read at touch scale while remaining local. Lab wake/hover impulses retain their specialized radius of 2 cells; W-3's calm ambient impulse also remains at radius 2. The production public API never exposes those internal choices.

### Measured radius comparison

The same strength-0.65 impulse was stepped 12 times at each cell size. `affected` is the number of initially nonzero height-field cells; `maxDelta` is the maximum scene-luminance change caused by reflection displacement. All three radii were visibly refractive; radius 4 spreads farther without being necessary for the interaction target.

| Cell size | Radius | Diameter | Affected cells | Max luminance delta |
| ---: | ---: | ---: | ---: | ---: |
| 8 px | 2 | 32 px | 14 | 0.064497 |
| 8 px | **3** | **48 px** | **28** | **0.062066** |
| 8 px | 4 | 64 px | 50 | 0.079845 |
| 10 px | 2 | 40 px | 13 | 0.058205 |
| 10 px | **3** | **60 px** | **30** | **0.056994** |
| 10 px | 4 | 80 px | 52 | 0.066038 |
| 12 px | 2 | 48 px | 12 | 0.049465 |
| 12 px | **3** | **72 px** | **27** | **0.060866** |
| 12 px | 4 | 96 px | 50 | 0.055806 |

Radius 3 exceeds the 0.02 visibility criterion at every level, gives a useful local footprint rather than a single-cell point, and preserves the three-source cap with finite height values. The non-monotonic deltas are expected from propagation through the scene; the decision is based on local footprint and consistent visible refraction, not on choosing the largest value.

## 6. Keyboard, non-gesture entry, and reduced motion

The lab canvas is a focusable `role="button"` with `tabindex="0"`. Enter and Space issue the same entry-signal callback as a short tap and a centered radius-3 impulse; key repeats are ignored. Keyboard and other non-gesture entry affordances must remain intact in production.

With reduced motion, the complete static scene remains, no rAF or wave simulation runs, and pointer/keyboard **entry signals still fire immediately**. A `null` wave-source ID is an intentional no-animation outcome, not an entry failure. Entry timing and navigation are not blocked to accommodate water.

## 7. Loading/failure and single-registration evidence

The W-6 promise-cached, retry-safe loader is required. Pointer intent and idle scheduling join the same pending request; failed loading removes the script and clears the promise so deliberate retry can succeed. Module initialization never delays entry.

The gesture log distinguishes `touch-tap`, `mouse-click`, `keyboard-entry`, drag/hover mappings, `tap-callback`, `queued-impulse`, `queued-flush`, and `impulse-discarded`. Acceptance invariants are:

- A physical tap produces exactly one water impulse and exactly one entry signal, including after synthetic `touchend`/`click`.
- A drag or swipe produces wake effects and zero entry signals.
- A loading tap produces one immediate entry signal and at most one pending impulse; readiness flushes at most once.
- Failure or cover produces no queued flush and no late splash.
- Keyboard activation is centered and counted once, never repeated by key auto-repeat.

**Verification results:** 24/24 programmatic contract checks passed. Manual desktop checks confirmed `keyboard-entry`, `mouse-hover`, `mouse-click`, and `mouse-drag`. The emulated-touch DOM pass recorded one tap signal/effect, no duplicate after compatibility events, and drag without a new entry signal. DPR/cell conversion, multitouch, cancellation, queue disposal, exact thresholds, reduced motion, and all radius comparisons passed. `pwsh tests/run-static.ps1` also passed.

Physical touch behavior remains **PA-8 PENDING-AUTHOR**; emulated DOM touch is not represented as physical-device evidence.

## 8. W-8 implementation requirements and revert boundary

W-8 implements this contract in one production commit:

- Create root `ascii-water.js` with `init(canvas)`, `destroy()`, `drop(x, y, strength)`, and `setReducedMotion(bool)` on `window.__echoWater`. Public `drop` applies radius **3** and is guarded/fire-and-forget.
- Add the primary cover canvas and emblem treatment in `index.html`/`style.css`, preserving T9 geometry, the unchanged `Zastavka.jpg`, and usable reduced-motion entry.
- Wire the deferred loader and unified gestures in `script.js`, reusing T12 protection. Keep `startSequence()` and entry-sequence internals/timing unchanged; T14's existing surge hook emits the impulse burst.
- Add best-effort EXTRA precache and separate runtime code-fetch handling in `sw.js`; never claim caching before success. Bump `ECHO_VERSION` in `version.js` through T3's single-source flow.
- Record production payload and diagnostics, actual-cache offline behavior, and late-module disposal. Composition review remains PA-13 and non-blocking.

All production integration is one W-8 commit. Reverting it restores the prior cover and integration as a unit without deleting or reverting the W-1…W-7 laboratory work. W-9 performs verification only and never deploys, publishes, or pushes.
