# ASCII-WATER — integrated-candidate verification (W-9)

**W-9 integrated-candidate verification. Desktop Chromium gate: PASS. Physical-device and post-deployment checks remain PENDING-AUTHOR.**

- Candidate: W-8 commit `f7e9702cbb5c82ce17209c6c0f6bb6d71b9ea178`, `feat: ASCII-WATER primary splash composition + unified entry gestures (W-8)`.
- Branch: `work/echo-step4-implementation`.
- Module: root `ascii-water.js`, **20,835 bytes** (20.35 KiB); no dependencies, build step, WebGL, or production global other than the intended `window.__echoWater`.
- Local production-like static context: `pwsh tests/serve.ps1 -Port 8734`, with the development-branch candidate at `http://127.0.0.1:8734/`. Failure/offline injection used the existing local Node fixture on port 8777. Nothing was published, deployed, pushed, or requested from the live site.
- Browser: Kimi Code Desktop / Microsoft Edge WebView2 Chromium. Desktop measurements use 1280×800, DPR 1; earlier composition checks also used the actual emulated 390×844 viewport at device DPR 3, renderer DPR capped at 1.5.
- Scope: verification and this report only. Temporary browser fixtures were removed before staging and are not part of this commit. No production, lab, chapter, frame, or image code/content was changed by W-9.

## 1. Automated/local-browser checks performed by Kimi

### Candidate regression — completed

The final W-9 regression page was `http://127.0.0.1:8777/_w9regression.html?candidate=f7e9702&run=2`. It reported **17 PASS / 0 FAIL**, with zero captured runtime errors. This was a real DOM-event suite against the committed W-8 code, not a source-only or import check.

| Check | Result |
| --- | --- |
| Buttonless mouse hover produces subtle waves and no entry | PASS |
| Mouse drag produces wake and no entry | PASS |
| Swipe-up is drag-only and does not enter | PASS |
| Single synthesized click gesture plus compatibility `touchend`/click produces one strong impulse and one immediate entry | PASS |
| Impulse → entry → freeze → destroy ordering | PASS |
| Unchanged cover/entry sequence reaches title and the 84-item contents | PASS |
| Keyboard Enter enters immediately with a centered impulse | PASS |
| Returning reader sees saved progress without loading water | PASS |
| Saved chapter opens; `'01'` is normalized to `'1'`, value `0.4` preserved; no water request | PASS |
| Failed module leaves zero injected scripts and no cached rejected promise | PASS |
| Entry remains immediate after module failure | PASS |
| Deliberate retry initializes the module after failure | PASS |
| `ascii-water.js` is actually present in `echo-v77` with status 200 | PASS |
| Offline reload initializes water after actual caching | PASS |
| Reduced-motion control retains a complete, byte-identical static canvas frame | PASS |
| Reduced-motion keyboard entry remains immediate | PASS |
| Captured runtime-error array is empty | PASS |

The mode-control requests in this fixture use POST to bypass GET caching. That fixes fixture-state contamination; it does not change the application's Service Worker. Offline initialization was asserted only after an actual successful cache read, never merely because caching had been requested.

### Existing checks rerun on the committed candidate

- `pwsh tests/run-static.ps1`: **PASS**, all emitted checks passed, including unchanged `chapters.js`, CSS parsing, the frozen viewport, cache-version derivation, precache existence for `ascii-water.js`, and JS syntax checks.
- `http://127.0.0.1:8734/tests/browser/unit-state.html`: **17 PASS**, `RESULT: OK`.
- The exact W-8 candidate passed the pre-commit production gesture suite **29/29**, entry/film/menu/resource suite **26/26**, and delayed-load/natural-surge suite **8/8**. These support the integrated regression evidence; they are not relabeled as checks rerun by W-9.
- Desktop and actual 390×844 cover captures showed the full-size character-water surface and a cropped, non-opaque emblem. Computed emblem-center offset was **0 px at both viewports**. The unchanged natural T14 IDLE→SURGE transition invoked the water hook at approximately 8 seconds. The author’s artistic review is separately **PA-13 PENDING-AUTHOR**.

### Full §7.2 integrated performance matrix — measured

The visible measurement page was `http://127.0.0.1:8734/_w9gate.html?candidate=f7e9702`. It started with a DOM Pointer Event mouse-drag impulse (no entry), then kept the integrated cover visible for a continuous **600-second** measurement window. Full-run FPS/p95/dropped values came from actual `requestAnimationFrame` intervals in the production module. During the gate the harness read raw counters without sorting frame history; it calculated the complete distribution once at the end. Resource Timing supplies the payload values below using `transferSize || encodedBodySize`; module file size was measured independently.

The outer browser viewport was 1280×800 at DPR 1; the actual production iframe/canvas was **1265×560 CSS px**. At the end of the gate the renderer used 10 px cells on a 126×56 grid. This was the real production renderer and input path, not a lab copy or a timer-only fixture.

| Diagnostic | Measured result |
| --- | --- |
| Module file size | **20,835 bytes** |
| Cold Resource Timing payload / first water frame | **20,835 bytes / 198.3 ms** |
| Warm Resource Timing payload / first water frame | **20,835 bytes / 165.8 ms** |
| First pointer intent / first responsive effect | **229.3 ms / 232.3 ms** after navigation start |
| First event-to-next-frame latency | **2.5 ms**; one initial drag sample, not a physical-touch measurement |
| Timed visible interval | **600.750 s**, `2026-11-11T22:14:00.150Z` to `2026-11-11T22:24:00.889Z` (01:14:00.150–01:24:00.889 local time on 2026-11-12) |
| Full-run frames / mean FPS | **78,901 / 131.316576** |
| Full-run p95 frame time | **11.8 ms** |
| Full-run dropped-frame ratio | **0.0000126741106 = 0.00126741%** (intervals >25 ms) |
| Wave resets / fallback during normal gate | **0 / not engaged** |
| **Desktop ≥30 FPS × 10 minutes hard gate** | **PASS — desktop Chromium only** |
| Natural ladder history | `12→10` at 5,089.6 ms; `10→12` at 11,048.3 ms; `12→10` at 325,841.8 ms; 10 px at gate end; no fallback |
| Adaptive controller downgrade/recovery | **PASS** — see the deterministic production-controller evidence below |
| Reduced-motion static render cost | **11.91 ms mean / 15.8 ms p95 / 17.5 ms maximum** across 24 calls, discarding four warm-up calls for the first two statistics. The <5 ms diagnostic target was missed; this is **not** a gate failure |
| Offline behavior | **PASS after actual caching** — see completed regression |
| Runtime errors / failed resources | **0 captured runtime errors** across cold and warm runs; **0 failed resource responses** in the cold run |

The final adaptive page was `http://127.0.0.1:8734/_w9adaptive.html?candidate=f7e9702`. Using the real production quality controller with deterministic frame intervals — 90 degraded samples per level and 600 low-frame-time samples per recovery — it demonstrated:

1. `8→10` downgrade at 1,800 ms.
2. `10→12` downgrade at 91,800 ms.
3. `12→10` upgrade at 96,800 ms, respecting the 5-second dwell.
4. `10→8` upgrade at 101,800 ms, again respecting the dwell.
5. No further changes after another 600 low-frame-time samples, no fallback, and no runtime errors.

This verifies the implemented ladder, hysteresis, dwell, one-level-per-evaluation behavior, and stable recovery. It is deterministic controller evidence, **not** a claim of DevTools CPU-throttle or a wall-clock load test.

The separate `http://127.0.0.1:8734/_w9fallback.html?candidate=f7e9702` fixture intentionally injected repeated 40 ms main-thread work after the normal gate run. **Degradation demonstration PASS:** at 12 px, fallback engaged after **65.4755 s** of this scenario; `fallback=true`, `frozen=true`, and the complete canvas frame remained byte-identical after a further 200 ms. The degraded run measured **21.575511 mean FPS**, **47.2 ms p95**, and **99.9277457% dropped frames**, with zero runtime errors. This is explicitly **NOT a pass of the 30 FPS hard gate**: the measured normal-run gate above is the only desktop gate verdict.

### Method limits and deviations

- The browser tool does not expose DevTools CPU-throttle-4× or native reduced-motion-preference controls. The adaptive ladder was checked by injecting deterministic degraded/recovery frame intervals into the real production quality controller **after** the gate; this is not a wall-clock load test. Reduced motion used the production `setReducedMotion(true)` API. Neither is claimed to be the unavailable native emulation. The separate fallback demonstration used real 40 ms repeated main-thread work.
- Synthetic DOM Pointer Events and device emulation are not physical touch devices. Touch, gesture, and SW behavior on real devices remain pending below.
- The integrated gate was a real 600-second visible run, not a timer-only fixture. The separate intentional degradation run was labeled and never counted toward the gate.
- An initial instrumentation-heavy attempt emitted `Error: waitFor timeout` during adaptive recovery: its metrics calls repeatedly sorted the full accumulated frame history during the measured phase. That attempt was excluded from the final verdict. The replacement used raw counters during the gate and evaluated adaptive behavior only afterward; no production code was changed to address the harness failure.
- A subsequent post-gate adaptive fixture initially supplied only five degraded samples after a level change, fewer than the controller's required 90, so it did not exercise the second downgrade. The standalone `_w9adaptive.html` check supplied the required 90 degraded samples per level and passed. This fixture correction did not alter or invalidate the already completed gate measurement.
- The reduced-motion <5 ms render-cost diagnostic target was missed in the production context (11.91 ms mean / 15.8 ms p95). It is reported as a diagnostic deviation, not suppressed or treated as a gate failure.
- No DevTools Fast/Slow-3G trace is claimed. W-8 used server-side delay profiles for deferred-loading behavior; those profiles are not equivalent to a complete browser network-throttling trace.
- B-0's anticipated chapters-meta mismatch was **not reproduced**. The current static run has no unexplained failures. The known legacy `focusprobe.html` harness incompatibility recorded in `IMPLEMENTATION-STATUS.md` is not silently reclassified as fixed.

## 2. Physical-device checks — PENDING-AUTHOR

No physical device was tested. No result in this section is passed, and the overall three-device gate is **not** claimed. Procedures are in `IMPLEMENTATION-PLAYBOOK.md` §7.10.

| Item | Required evidence | Status |
| --- | --- | --- |
| PA-6 — mid-range Android + Chrome | Integrated candidate visibly running for 10 continuous minutes; device/Android/Chrome versions; mean FPS, p95, dropped-frame ratio, ladder changes. Gate: mean FPS ≥30 over the full 10-minute run | PENDING-AUTHOR |
| PA-7 — physical iPhone + Safari | Same 10-minute protocol and metrics; device/iOS/Safari versions | PENDING-AUTHOR |
| PA-8 — touch latency and gestures | Tap/splash at original coordinates, drag without entry, 2–3 contacts, rapid taps without double entry, perceived latency | PENDING-AUTHOR |
| PA-9 — Service Worker/offline on physical devices | Install/offline verification on a trusted HTTPS origin after deployment, or another explicitly trusted secure context. Plain LAN HTTP is not sufficient for SW testing | PENDING-AUTHOR |
| PA-13 — integrated composition review | Author’s visual judgment of the water-primary cover, cropped emblem, splash, and static reduced-motion frame | PENDING-AUTHOR |

## 3. Post-deployment checks — author-only after publishing

**PA-10 — PENDING-AUTHOR.** No deployment or live-site request was made. After the author chooses to publish, the author must perform cache-bypassed loading, verify the served `version.js` and Service Worker lifecycle, test online/offline water initialization, check the cover and entry on real devices, and confirm that the live `ascii-water.js` matches the reviewed candidate. These remain author-only and do not block this local verification commit.
