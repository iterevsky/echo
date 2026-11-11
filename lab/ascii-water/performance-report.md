# ASCII-WATER — W-5 performance report

Date: 2026-11-11. Branch: `work/echo-step4-implementation`. Predecessor: W-4 `f0d8a9a89d03350695f998e56043d46270b06375`.

## Scope and acceptance rule

This report covers the native-browser laboratory at `/lab/ascii-water/`; it is not a production-integration result. The only hard performance threshold is **mean FPS ≥30 sustained for 10 continuous minutes**, separately for desktop Chromium, physical mid-range Android Chrome, and physical iPhone Safari. **55 FPS is a target, not a minimum.** Static fallback is a degradation outcome and is never a hard-gate pass.

Desktop measurements were collected by Kimi in the built-in Chromium browser at 1280×800, DPR 1, with the page visible. Frame data comes from actual `requestAnimationFrame` timestamps and `performance.now()` after rendering. Payload uses Resource Timing `transferSize || encodedBodySize`. The on-demand `r` summary computes full-run values without periodic full-history sorting. Physical-device results remain **PENDING-AUTHOR**.

## Parameters and S1 disposition

**No engineering tuning values changed.** The conditional S1 documentation synchronization was therefore not required; ROADMAP.md and IMPLEMENTATION-PLAYBOOK.md were not edited.

| Parameter | Current implemented value |
| --- | --- |
| Ladder | 8 px high / 10 px medium / 12 px low |
| Downgrade | One level when the last-90-frame p95 is >16 ms |
| Upgrade | One level when the last-600-frame p95 is <11 ms |
| Minimum dwell | 5000 ms between changes |
| Fallback | At 12 px, continuous mean <30 FPS for 60 s |
| DPR cap | 1.5 |
| Scanlines / vignette / grain — 8 px | 0.18 / 0.22 / 0.12 |
| Scanlines / vignette / grain — 10 px | 0.12 / 0.18 / 0.06 |
| Scanlines / vignette / grain — 12 px | 0.08 / 0.14 / 0 (grain off) |

A small `30 - 1e-9` comparison tolerance prevents an exact-30 FPS stream from falling below the threshold through floating-point rounding. This does not change the documented acceptance value.

## Desktop 10-minute run — PASS

- Final URL: `http://127.0.0.1:8771/lab/ascii-water/?run=10min`
- Timed visible interval: **2026-11-11 21:29:55–21:39:55 (UTC+3), exactly 600 seconds**
- Full metric window: **638.878 seconds**, including the visible lead-in around timer setup
- Frames: **72,869**
- Mean FPS: **114.066715**
- Full-run p95 frame time: **11.900 ms**
- Dropped-frame ratio: **0.0000137233 (0.00137233%)**
- Maximum frame interval: **41.100 ms**
- Initial cell size / first water frame: 12 px / 69.3 ms
- Payload: **60,836 bytes / 59.41 KiB**
- Adaptive changes / fallback / wave resets: **0 / 0 / 0**; 15 deterministic ambient impulses over the full window

**Hard-gate verdict: PASS for desktop Chromium.** Mean FPS exceeded 30 for the entire 638.878-second full metric window, which contains the uninterrupted 600-second visible interval. This is not a claim for either physical-device row or for the combined three-device gate.

## Cold and warm loads

Final source was served from a fresh local origin, `http://127.0.0.1:8771/lab/ascii-water/`, with `Cache-Control: public, max-age=3600`.

| Load | First water frame | Payload | Short-run mean FPS | Full-short-run p95 | Dropped ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| Cold | 106.8 ms | 62,636 bytes / 61.17 KiB | 113.761 | 11.800 ms | 0.0706% |
| Warm, confirmed generation 10 | 78.4 ms | 60,836 bytes / 59.41 KiB | 113.125 | 11.900 ms | 0% |

The cold short-run duration was 24.886 s; the warm short-run duration was 52.821 s. These are diagnostic startup samples, not the 10-minute gate sample. The reload tool returned `NAVIGATION_FAILED`; `tab.get_state` confirmed generation 10 with `loading: false`, and the warm metrics had reset, so the reload actually occurred.

**Time to first responsive touch:** **586.5 ms** from navigation start until the first touch effect completed a rendered frame, with **3.9 ms** event-to-next-frame latency. The separate warm-load touch page recorded a 45.5 ms first water frame and 60,836-byte payload. This used DOM `PointerEvent` dispatch with `pointerType: "touch"` under emulation, not a physical touchscreen; it is not conflated with the event-to-frame latency.

## Adaptive-quality verification

### Deterministic controller and integrated fixtures

| Check | Result |
| --- | --- |
| 90-frame downgrade | 8→10 px at 1499.94 ms |
| 600-frame recovery | 10→8 px 6000 ms after the downgrade |
| Dwell enforcement | Exactly 5000 ms before the next downgrade |
| Exact-30 FPS | No fallback over 2100 frames / 70 s |
| 34 ms degraded stream | Static fallback at 63.070 s, after 60.010 s below 30 FPS |
| Integrated downgrade / recovery | 8→10 px at 9800 ms; 10→8 px at 15800 ms |
| Integrated suite | 14 PASS / 0 FAIL |

No oscillation occurred. Each evaluation changes at most one level, and the intervals reset after a level change.

### Real main-thread load

The built-in browser exposes no DevTools CPU-throttle-4× control. The following is a disclosed main-thread-load substitute, **not a claim that DevTools 4× emulation was performed**. Recovery was verified with the 600-frame deterministic fixture above.

| Fixture | 8→10 px | 10→12 px | Notes |
| --- | ---: | ---: | --- |
| Immediate 20 ms injected load | 3661.8 ms | 8673.6 ms | Includes startup and required dwell |
| Immediate 8 ms injected load | 2586.9 ms | 7592.9 ms | Includes atlas initialization and required dwell |
| Warmed load, started at 1624.2 ms | 2058.8 ms — **434.6 ms after load start** | 7070.6 ms | 5011.8 ms dwell between changes; stable 12 px afterward, no fallback |

After the warmed load ended, the 12 px level remained stable at approximately 110.86 mean FPS over the latest 90 frames. The deterministic fixture separately proved recovery after 600 frames below 11 ms.

## Static fallback demonstration

A 34 ms frame-interval fixture at 12 px triggered fallback after 60.010 s below 30 FPS. The actual renderer cancelled its animation loop, retained the evidence, and rendered a static frame at a measured **3.60 ms** cost. The overlay displayed `STATIC (not a gate pass)`. This demonstration is **NOT a pass of the 30 FPS hard gate**; it is the graceful degradation outcome.

## Reduced motion

A controlled `matchMedia('(prefers-reduced-motion: reduce)')` fixture used a 640×480 canvas at 12 px, DPR cap 1.5, and the low treatment tier. It retained the complete scene and started no rAF loop or wave simulation. Twenty warm explicit renders after discarding four initialization renders measured:

- Mean render cost: **3.07 ms**
- p95 render cost: **10.50 ms**
- Maximum render cost in the complete 24-render set: **10.90 ms**

The **<5 ms figure is a diagnostic target, not a gate**. The mean was below 5 ms; the small-sample warm p95 exceeded it and is reported rather than suppressed.

## Input and pipeline regressions

The integrated 14-check suite passed at all three levels: complete spatial scene and 288 atlas entries, W-3 refraction, W-4 tap callbacks, treatment tiers, downgrade/recovery, static fallback, full-run aggregates, first-responsive-touch marking, and reduced-motion behavior. No production file was changed.

## Physical-device matrix — PENDING-AUTHOR

No physical-device measurement was performed, and no row below is passed.

| Environment | Payload / first frame / first responsive touch | Mean FPS / p95 / dropped | 10-minute hard gate | Adaptive behavior | Cold/warm | Reduced motion | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Physical mid-range Android + Chrome | — | — | — | — | — | — | **PENDING-AUTHOR (PA-6)** |
| Physical iPhone + Safari | — | — | — | — | — | — | **PENDING-AUTHOR (PA-7)** |

Author procedures are in `IMPLEMENTATION-PLAYBOOK.md` §7.10: serve the lab to the device on LAN, keep it visible and awake for 10 continuous minutes, record device/model/OS/browser versions plus mean FPS, p95 frame time, dropped-frame ratio, and adaptive behavior. Physical touch latency and 2–3-contact gestures follow the same section. Plain LAN HTTP does not establish a secure context, so physical Service Worker/offline verification remains separately pending.

## Limitations

- Desktop Chromium and emulated fixtures only; physical Android/iPhone rows await the author.
- DevTools CPU-throttle-4× was unavailable in the built-in browser. Main-thread-load substitution and deterministic recovery are explicitly separated above.
- Reduced motion used a controlled `matchMedia` fixture, not a physical OS preference toggle.
- Local static servers only; no production, deployment, network service, dependency, or WebGL work was performed.
