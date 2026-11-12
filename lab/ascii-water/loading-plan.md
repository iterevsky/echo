# ASCII-WATER — W-6 deferred-loading plan

Date: 2026-11-11. Scope: architecture and lab harness only. **No root-level production `ascii-water.js`, production loader/global, production cache change, or edit to `index.html` / `script.js` / `sw.js` is made by W-6.** W-5 tuning values did not change, so S1 required no documentation synchronization.

## 1. Architecture — deferred, promise-cached, retry-safe

W-8 will load one root-level `ascii-water.js` through a classic dynamic `<script async>` element after the cover is interactive. `requestIdleCallback` and the first pointer intent race; whichever happens first starts the same cached promise. If idle callbacks are unavailable, a bounded `setTimeout` fallback schedules the same non-critical work. The optional module never sits in the initial script chain and never blocks first paint, cover input, or `startSequence()`.

The loader follows T8's `ensureChapters()` pattern:

- A pending load returns the same promise, so pointer intent and idle scheduling cannot create duplicate requests or duplicate module instances.
- Success stores one initialized module instance and its `init`/`destroy` lifecycle API.
- Failure removes the injected script element, clears the cached promise to `null`, records a usable error state, and leaves the shell fully interactive. A later deliberate retry creates a new request; a rejected promise is never permanently cached.
- Initialization is fire-and-forget from the entry handler. Entry never awaits the network request, module initialization, or a water impulse.
- The cover schedules loading only after it is interactive. The module is optional throughout its lifecycle.

## 2. Caching and offline behavior — two distinct mechanisms

### 2.1 Install-time best-effort EXTRA precache

W-8 adds `ascii-water.js` to the existing **non-blocking EXTRA cache group**, using the post-T3 `Promise.allSettled` behavior. Installation of the application shell must succeed whether this optional asset succeeds or fails. A fulfilled `cache.add` operation is required before the module can be described as cached; a rejected or uncompleted attempt is not evidence of caching.

### 2.2 Runtime code-fetch strategy

Where appropriate for an ordinary page request for `ascii-water.js`, W-8 uses the existing code-fetch network-first strategy. This is separate from the install-time precache attempt: it governs runtime retrieval and may populate/update the cache after a successful network response. It does not justify claiming the module is cached before an actual cache write succeeds.

Offline initialization is supported **only after the asset has actually been cached**. An offline cold miss, failed precache, failed runtime fetch, or missing asset leaves the module unavailable; the cover and entry still work. The Service Worker never turns the optional water asset into an installation dependency.

## 3. Measured payload and performance inputs

W-5 measured the final laboratory page, not a production bundle:

| Measurement | Result |
| --- | ---: |
| Warm laboratory payload | **60,836 bytes / 59.41 KiB** |
| Cold laboratory payload | **62,636 bytes / 61.17 KiB** |
| Desktop 10-minute gate | **PASS** — 114.066715 mean FPS, 11.900 ms full-run p95, 0.00137233% dropped over 638.878 s |
| First water frame in the gate run | 69.3 ms |
| Cold / warm first water frame | 106.8 / 78.4 ms |
| First responsive touch | 586.5 ms, with 3.9 ms event-to-next-frame latency |
| Reduced-motion warm mean / p95 | 3.07 / 10.50 ms; p95 misses the non-gate diagnostic target |

The production target remains **≤25 KB minified (PTV)**, not a measurement. No production module exists at W-6, so no production payload can be claimed. W-8 must record the actual minified root-module bytes and justify any excess in its commit. The isolated harness optional fixture is **266 bytes on disk** and measured **566 bytes transferred including HTTP overhead** via Resource Timing. The fixture is only a loading test asset, not a production-size estimate.

## 4. Failure handling and entry ordering

A missing, delayed, rejected, or initialization-failing module never changes the cover's interaction model. Tap classification and the existing `startSequence()` execute immediately, with keyboard and non-gesture entry preserved. A failed module never produces a rejected-promise loop or a stale splash on a later screen.

For a tap, W-8 preserves the approved order: classify once and record original contact coordinates; if the module is ready, send the impulse synchronously without awaiting it; otherwise queue **one bounded impulse tied only to the current entry attempt**; call `startSequence()` immediately. If the module becomes ready while water remains visible, the next frame may show that impulse. If the transition covers the water first, or loading fails, the queued impulse is discarded. No late splash appears on another screen or entry attempt. Drag remains waves-only, and the retired swipe-up shortcut remains retired.

The harness independently proves delayed readiness, request failure, deliberate retry, promise joining, failed-script removal, and continued shell entry. It uses an isolated fixture, not the production global or production cache.

## 5. Exact W-8 implementation plan and revert boundary

W-8 is the only production-integration task and lands after its S3 prerequisites. Its single production commit contains:

- **`ascii-water.js` (new):** self-contained module exposing `window.__echoWater = { init(canvas), destroy(), drop(x, y, strength), setReducedMotion(bool) }`. Production `drop` has no radius parameter and applies W-7's documented default radius. The radius-capable signature remains lab-internal.
- **`index.html`:** add the cover canvas as the primary visual surface and retain title/entry affordances above it; do not alter the unchanged `Zastavka.jpg` file or chapter content.
- **`script.js`:** implement the deferred retry-safe loader and cover lifecycle; reuse T12 unified-tap protection and W-7 event ownership. Start entry immediately, freeze only when the existing transition covers the water, and destroy after the transition. Wire T14's documented surge hook to an impulse burst without changing its rhythm.
- **`style.css`:** cover layering, cropped/fragmented emblem treatment using only the existing image, and reduced-motion static-water presentation. Preserve T9 centering geometry and existing entry behavior.
- **`sw.js`:** add the module to best-effort EXTRA precache and apply runtime code-fetch handling separately; preserve the shell and existing caches/strategies.
- **`version.js`:** bump `ECHO_VERSION` through the T3 single-source version flow because the Service Worker asset set changes.

The composition must show night water, shoreline, distant light column, and mirrored reflection as characters, with the existing image visible as an emblem rather than an opaque replacement. Reduced motion retains a complete static frame and usable entry. W-8 records production payload, diagnostics, offline-after-actual-cache behavior, failure disposal, and cover composition review PA-13 without treating author review as a blocker.

**Single-commit revert boundary:** all production integration above lands in exactly one W-8 commit. Reverting that commit restores the previous production cover, loader, styles, cache list, and version as one unit. The W-1…W-7 laboratory files and their history remain untouched by that revert. W-9 then verifies the integrated candidate without deploying, publishing, or pushing.
