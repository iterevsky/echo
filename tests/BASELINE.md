# B-0 — Actual pre-implementation test baseline

## Run identity and environment

- **Date:** 2026-11-05
- **Branch:** `work/echo-step4-implementation`
- **HEAD when the checks were run:** `85e9e4e2a33cb35380bc9e994948d38e911e7b5d` (`docs: Step-4 implementation package`)
- **Pinned development baseline:** `e2acadbf5f2d07c03701dc7c002cd30161d3e1e1`
- **Windows:** display version 25H2; build `26200.9457`; OS version `10.0.26200.0`
- **PowerShell:** 7.6.6, Core edition
- **Node.js used by the static syntax checks:** v24.22.1
- **Browser:** Kimi Code Desktop browser panel, Microsoft Edge WebView2 156.0.4314.58 (Chromium)
- **Local server command:** `pwsh tests/serve.ps1 -Port 8734`

## Classification summary

| Check | Classification | Observed result |
| --- | --- | --- |
| `pwsh tests/run-static.ps1` | **PASS** | Exit code 0; all 33 emitted checks passed. |
| Expected `chapters-meta.js` freshness failure | **NOT REPRODUCED** | The actual freshness check emitted `PASS  chapters-meta.js is up to date with chapters.js`; the anticipated chapter-82 `6808` vs `6807` mismatch did not appear. |
| `tests/browser/unit-state.html` | **PASS** | All 17 checks passed; `RESULT: OK`. |
| `tests/browser/effects-lab.html` | **PASS** | The default `suite=cover` run reached `DONE` and reported `no errors`. Its emitted measurements are diagnostic observations, not individual PASS/FAIL assertions. |
| `tests/browser/focusprobe.html` | **PASS** | Reached `DONE`; `activeElement` was the `BUTTON.progress-continue`, and `primary is button: true`. No error line was emitted. |
| Other pre-existing failures in the executed checks | **NONE OBSERVED** | No category-(c) failure was emitted by the requested static or browser checks. |
| Physical-device, author-review, assistive-technology, and post-deployment checks | **MANUAL/DEVICE — not run now** | The PA-1 through PA-13 items remain `PENDING-AUTHOR`; none is passed by this baseline. See the classification list below. |

This is a record of the observed runs, not a claim that unrun scenarios or devices are verified.

## Complete static-check output

**Command executed:** `pwsh tests/run-static.ps1`

**Exit code:** 0

```text
PASS  chapters.js unmodified vs git
PASS  CACHE_VERSION parseable
PASS  CACHE_VERSION bumped vs main (v0 -> v66; served files changed)
PASS  exists: index.html
PASS  exists: style.css
PASS  exists: script.js
PASS  exists: chapters.js
PASS  exists: chapters-meta.js
PASS  exists: sw.js
PASS  no CDN links in index.html/style.css
PASS  viewport meta present and unchanged
PASS  chapterCount (84) == contents-item count (84)
PASS  chapters-meta.js is up to date with chapters.js
PASS  precache file exists:
PASS  precache file exists: index.html
PASS  precache file exists: style.css
PASS  precache file exists: script.js
PASS  precache file exists: chapters.js
PASS  precache file exists: Zastavka.jpg
PASS  precache file exists: icons/icon.svg
PASS  precache file exists: icons/icon-192.png
PASS  precache file exists: icons/icon-512.png
PASS  precache file exists: icons/apple-touch-icon.png
PASS  precache file exists: fonts/pt-serif-400-cyrillic.woff2
PASS  precache file exists: fonts/pt-serif-400-latin.woff2
PASS  precache file exists: fonts/pt-serif-700-cyrillic.woff2
PASS  precache file exists: fonts/pt-serif-700-latin.woff2
PASS  precache file exists: fonts/pt-serif-400-italic-cyrillic.woff2
PASS  precache file exists: fonts/pt-serif-400-italic-latin.woff2
PASS  precache file exists: fonts/golos-text-cyrillic.woff2
PASS  precache file exists: fonts/golos-text-latin.woff2
PASS  node --check script.js
PASS  node --check sw.js

All static checks passed.
```

### Expected chapters-meta freshness issue

**Classification: NOT REPRODUCED.** The audit-known expectation was a stale generated file with a chapter-82 length mismatch of `6808` vs `6807`. In this actual B-0 run, the corresponding check passed, as captured above. No mismatch output was produced, so no category-(b) failure is recorded.

## Complete browser-page results

### 1. State unit tests

**Page opened:** `http://127.0.0.1:8734/tests/browser/unit-state.html`

**Classification:** **PASS** — 17 checks, followed by `RESULT: OK`.

```text
PASS  T1 zero-padded keys
PASS  T2 collision keeps greater
PASS  T2b collision keeps greater (reversed)
PASS  T3 clamp + string numbers
PASS  T4 invalid dropped
PASS  T5 unknown fields preserved
PASS  T6 wrong types
PASS  T7 idempotent
PASS  T7b seenNew normalized
PASS  T7b invalid date dropped, unknown kept
PASS  T8 readerSettings
PASS  T9 lastChapter int kept
PASS  T9b lastChapter fraction dropped
PASS  T9c lastChapter negative dropped
PASS  T10 non-object state
PASS  T11 future chapter kept
PASS  T12 valid state is a no-op
RESULT: OK
```

### 2. Effects lab

**Page opened:** `http://127.0.0.1:8734/tests/browser/effects-lab.html`

**Classification:** **PASS** for the requested default-page run — it completed with `no errors` and `DONE`. The page selected its default `cover` suite. The other suite buttons and query-string variants were not run in B-0.

```text
running…
SUITE=cover RM=false ret=null DPR=1 iframeWidth=987
t=0.6s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=1.5s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=2.8s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=4.2s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=5.7s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=6.2s:
  classes: "beckon-play"
  animationName=beckon-tremor
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=none
  opacity=1
  animationName=beckon-glow, beckon-run-scale
  translate=none transform=none
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=7.5s:
  classes: "beckon-settle"
  animationName=none
  translate=none transform=none
  filter=none
  opacity=1
  animationName=beckon-breath
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=contrast(1.05) brightness(0.95)
  opacity=1
t=8.5s:
  classes: "beckon-settle"
  animationName=none
  translate=none transform=none
  filter=none
  opacity=1
  animationName=beckon-breath
  translate=none transform=matrix(1, 0, 0, 1, 0, 0)
  filter=contrast(1.05) brightness(0.95)
  opacity=1
no errors
DONE
```

### 3. Focus probe

**Page opened:** `http://127.0.0.1:8734/tests/browser/focusprobe.html`

**Classification:** **PASS** — the probe reached `DONE`, reported the progress-continue button as the active element, confirmed that the primary control is a button, and emitted no error line.

```text
running…
activeElement: tag=BUTTON class=progress-continue id=
primary is button: true
DONE
```

## MANUAL/DEVICE checks not run now

All rows below are classified **MANUAL/DEVICE (not runnable as part of this B-0 automated capture)**. Their status remains `PENDING-AUTHOR`; B-0 neither executes nor passes them.

| ID | Check | Classification / status |
| --- | --- | --- |
| PA-1 | Cover centering and safe-area on a physical iPhone | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-2 | Film double-tap skip on iPhone Safari and Android Chrome | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-3 | NVDA overlay pass | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-4 | VoiceOver overlay pass | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-5 | Genuine Golos weights and title appearance review | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-6 | Water 10-minute performance on physical Android Chrome | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-7 | Water 10-minute performance on physical iPhone Safari | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-8 | Touch latency and gesture behavior | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-9 | Service Worker/offline behavior on physical devices | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-10 | Post-deployment checks | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-11 | T11 three-mode VOICE visual review | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-12 | T14 idle rhythm and beckon-ring visual review | MANUAL/DEVICE — PENDING-AUTHOR |
| PA-13 | W-8/W-9 integrated cover-composition review | MANUAL/DEVICE — PENDING-AUTHOR |

## Scope and limitations

- No application source, style, asset, Service Worker, chapter text/marker, or existing test file was intentionally changed.
- The static command regenerates `chapters-meta.js` as part of its existing freshness check; Git reported no content change afterward.
- These results cover the exact static command and the three requested page URLs on the environment above. They do not establish physical-device, production, deployment, or unrun effects-lab-variant behavior.
- The anticipated chapters-meta mismatch was not reproduced and therefore is not listed as an observed baseline failure. T8 remains responsible for removing that tooling under D-10 B.
