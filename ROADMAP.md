# ROADMAP.md — ЭХО: technical solutions & execution roadmap for Kimi Code · v2.2 (2026-11-05)

Single execution source for the implementation phase. Supersedes the sequencing/priority content of TASKS.md v2 (TASKS.md v4.2 remains the per-task diagnostic source) and the experiment framing of echo-audit.md §11. Sources: echo-audit.md v2+〔v3〕, TASKS.md v4.2, DECISIONS.md v4.2, CHANGELOG.md, the repository research registry (echo-audit §12–16), the pinned snapshot (archive == commit `e2acadbf5f2d07c03701dc7c002cd30161d3e1e1`, 78/78 blob-verified; production hash-verified for the nine §5 resources only — never claim the live site matches the full archive).

**v2.2 changes (Step-4 final corrective reconciliation, 2026-11-05):** T7 acceptance corrected here to match the binding TASKS/PLAYBOOK definition (registration INVOKED before window.load, proven by instrumentation; invocation/installation/activation/controllerchange/ready are distinct observations; `ready` timing diagnostic only — the old `ready`-before-load criterion removed); the §7.3 chapters-meta search scoped to ACTIVE implementation references (historical documentation/evidence references intentionally permitted); §5 restructured so Track 2 is presented as an independent workstream with dynamic scheduling, not as a block necessarily following T23 (no mandatory T23→W-1 dependency; W-8 governed by S3 + its exact HARD dependencies only; sequential interleaving, never simultaneous work against the same tree); S3 explicitly permits PENDING-AUTHOR physical-device results (all Kimi-executable prerequisite checks green; the overall three-device 30 FPS gate remains unpassed until real device data exists; W-8 may be implementation-complete while it is pending); W-8's tap/entry ordering made physically consistent — entry guaranteed immediate, splash guaranteed only when the module is ready before the transition covers the water, otherwise the queued impulse is discarded (late/failure behavior specified); T8's acceptance no longer promises a blanket fully-green baseline (the known meta failure is removed if B-0 reproduced it; unrelated B-0 failures stay recorded and receive separate disposition; full green is claimed only when every recorded failure is actually resolved); S1 described with its executable mechanism (the sync rides inside the W-5 commit as W-5's single conditional documentation-only file-scope exception); the broken A4 row in §2 repaired (unambiguous `abs(Δx)` expressions); IMPLEMENTATION-STATUS.md declared the sole operational exception to task file-scope limits. No decision reopened; no priority, artistic-group, or task-scope change beyond these corrections.

**v2.1 changes (Step-4 final documentation reconciliation):** dependencies classified into HARD DEPENDENCY vs EXECUTION ORDER / SHARED-FILE CONFLICT (artificial dependencies removed; §1); priority assignments restated as the binding list (§4); T23's final execution slot fixed after T26 (order …T25 → T26 → T23); T3 file scope and the importScripts-vs-page-fetch distinction stated (§4/T3); performance acceptance reclassified — W-2/W-3 60 FPS figures and the <5 ms reduced-motion figure are diagnostic/aspirational, never blocking; the static fallback does **not** constitute passing the 30 FPS hard gate; hysteresis values are engineering tuning parameters; S1 redefined as a documentation-only tuning-synchronization checkpoint (not an author gate, not an implementation task); W-1 acceptance no longer demands a renderer or visual output (rendering confirmation lives in W-2); W-2 orchestration limited to native browser JavaScript; W-8 splash/entry ordering written as an explicit 7-step sequence, production API default radius documented, SW caching stated as two distinct mechanisms; the audit-known baseline issue reworded as an *expected, unconfirmed* issue to be reproduced at B-0 (§5.2 wording); four artistic groups assign exactly one primary group per visual task (§3); PENDING-AUTHOR distinctions extended (PA-11…PA-13); historical-audit precedence note added (§6). No decision was reopened; no task scope changed beyond these clarifications.

**v2 changes (Step 4):** all 19 final author decisions applied — D-10 closed (B), G-1 closed (B, tap=entry+splash / drag=waves / swipe-up retired, narrow D-8 amendment), T5 obsolete, W-1 visual direction fixed (no choice gate), W-2 full 7-step pipeline, W-3 single physical model, W-5 single performance policy (hard gate: ≥30 FPS × 10 min on three devices), W-6/W-7 lab-only, W-8 sole production-integration task, W-9 local static-hosting verification, T16 behavior-based modal semantics, T17 continuous stagger, T12 exact hint, T15 limitation documented, T23 evidence-based auto-verdict, Kimi Code autonomous execution (one task = one commit, stop conditions defined), S1/S2 no longer author gates. v1 content preserved where still accurate; superseded v1 instructions are marked, not silently deleted.

**Binding constraints (never violated by any task):** vanilla HTML/CSS/JS, no frameworks, no build tools, no package managers, no new runtime libraries; GitHub Pages static hosting; local assets only; Service Worker + offline preserved; localStorage `echo_state` model preserved; general application architecture unchanged; no audio, no haptics, no `navigator.vibrate`; chapter content/markers never edited; `{{PHOTO}}` subsystem/photographs/filters frozen (regression-only, except strictly necessary accessibility parity in T16); frames frame-01…07 frozen; `Zastavka.jpg` file never modified or deleted (display treatment per decision 9); D-1 zoom lock final (run-static viewport check byte-identical); entry sequence unchanged except the approved gesture-trigger change; reading-column geometry and reading conventions untouched; existing periodic TOC event timing frozen, no new periodic TOC events; `PUBLISHED_AT` data untouched; `img_06.jpg` reserved and untouched; no 3D objects; no gamification/statistics/timers; no new navigation surfaces for novelty; no new effects on reading screens; no new title animations; no unapproved VOICE glyph noise/character corruption; DESIGN-PROPOSALS.md is not a work source; D-7 stands (WebGL only with separate explicit authorization after documented Canvas 2D failure); network access only for official font binaries + license files (T20/T22), verified upstream.

**Canonical file layout (Step-4 §5, adapted once):** the repository keeps every runtime script at root (`script.js`, `chapters.js`, `sw.js`, `version.js`) — there is no `js/` directory — so the production module is **`ascii-water.js` at repository root** (the spec's `js/ascii-water.js` adapted to the established convention). Lab layout exactly as specified:

```text
lab/
  ascii-water/
    index.html
    design.md
    loading-plan.md
    gesture-contract.md
    performance-report.md
    js/
      scene.js
      renderer.js
      waves.js
      input.js
      quality.js
      metrics.js
```

Final verification report: `docs/ascii-water-verification.md`. No parallel versions (`lab/ascii-water.html`, `lab/water/`, `lab/PERF.md`, `docs/ascii-water-direction.md`) may exist.

**Global execution rules (author-mandated):**

1. All implementation work happens on a **dedicated development branch** (`work/echo-step4-implementation`) created from the approved pinned baseline (`e2acadbf`). The repository is already present in the Kimi Code Desktop workspace — never clone another copy.
2. **One task = one commit.** Each task runs the checks listed in its acceptance criteria before commit.
3. **Publishing is author-only.** Kimi Code must never publish, deploy to GitHub Pages, push any branch to GitHub, push to the production branch, invoke push-echo.cmd, or perform any action that changes the live website. A task is complete when committed on the development branch with its checks reported.
4. **Baseline discipline:** before any code change, task B-0 records the actual test baseline (tests/run-static.ps1 + relevant tests/browser/*) on the pinned snapshot. Audit-known expected baseline issue: chapters-meta.js freshness mismatch (6808 vs 6807). It must be reproduced and captured during B-0; it is **not yet confirmed by the implementation baseline run**, and no claim about the full set of baseline failures may be made before B-0 actually runs. The issue is expected to be eliminated by T8 (D-10 B) — do not claim a green static baseline until T8 lands. After implementation begins, **no task may introduce a new unexplained failure**.
5. **PENDING-AUTHOR discipline:** checks requiring the author's devices/access are tracked in §11 with status PENDING-AUTHOR. Kimi Code never marks them passed. A task may be *implementation-complete* while its device acceptance stays PENDING-AUTHOR — the two statuses are always reported separately. PENDING-AUTHOR items do not interrupt autonomous execution (decision 16); the full queue is presented at the end.
6. **No invented numbers.** Every performance figure is either a measured FACT (cited), a proposed threshold awaiting validation (marked PTV), or absent. FACT/INFERENCE/HYPOTHESIS/PTV marking applies throughout. Never report a measurement that was not performed.
7. No anchors or instructions contain literary text from chapters.js; structural references only.
8. **Autonomous execution (decision 16):** Kimi Code executes the approved sequence independently, one commit at a time, runs required tests before each commit, continues to the next independent task without asking for routine approval, reports after each meaningful batch and at completion. It **stops and reports** when: a task introduces an unexplained test failure; a failure cannot be safely attributed; the working tree contains unexpected author changes; a change risks losing chapter content, user state, images, or other data; the task would modify a frozen area; a new runtime dependency would be required; the 30 FPS water minimum cannot be met after Canvas optimization (D-7 evidence); an instruction conflicts with the repository in a way that cannot be safely reconciled; or a genuinely unmade author decision is required. It does **not** stop for approvals the 19 decisions already resolved.

---

## 1. Overall work architecture

**Track 0 — gate:** B-0 (test-baseline recording). B-0 is a **baseline gate, not a P0 implementation task**; P0 remains empty under the priority rubric. Nothing else starts on the dev branch before B-0 is committed.

**Track 1 — core repairs** (one branch, one task = one commit, sequential within batches):

- **Batch 1 (boot spine):** T1 → T2 → T4 → T3 → T7.
- **Batch 1.5:** T8 (D-10 B branch only). *Why here:* T8 removes the stale-meta tooling and eliminates the known chapters-meta failure **if B-0 actually reproduced it** (v2.2 — T8 does not absorb unrelated baseline failures; full static green is claimed only when every failure recorded at B-0 has actually been resolved), before user-facing work builds on top of the tooling; it also delivers the `ensureChapters()` loader pattern that W-6's loading plan and W-8's module loader reuse. Placing T8 after Batch 2 would let Batch 2 run against the stale-meta tooling and would delay the loading architecture the water track depends on.
- **Batch 2 (user-facing):** T9 → T11 → T12 → T13 → T14 → T17.
- **Batch 3 (quality/publish-safety):** T6 → T18 → T15 → T16 → T19 → T20 → T22 → T25 → T26.
- **Evaluated experiment:** T23 — permitted any time after T2 when the style.css CRT/effect surface is quiet; concrete final slot: **after T26, i.e. Batch 3 ends …T25 → T26 → T23**, before S4.

**Track 2 — ASCII-WATER** (internal order strict): W-1 → W-2 → W-3 → W-4 → W-5 → W-6 → W-7 → W-8 → W-9. **Scheduling (v2.2, binding):** Track 2 may begin immediately after B-0 and may interleave SEQUENTIALLY with Track 1 on the same branch; two tasks are never implemented simultaneously against the same working tree, and shared-file conflicts are serialized. There is **no mandatory dependency between T23 and W-1**; T23 must still execute after T26 and before S4 (its Track-1 slot is unchanged); **W-8 waits for S3 and its exact HARD dependencies — not for unrelated Track 1 tasks such as T11, T17, or T23**. The exact next task is selected DYNAMICALLY from the runnable set (all HARD prerequisites committed, internal workstream order respected, no shared-file conflict with work in flight) with no routine author approval (decision 16); the batch layout in §5 and the ledger row order in IMPLEMENTATION-STATUS.md are canonical reference layouts, **not a global execution lock**. W-1…W-7 are strictly laboratory work (`lab/ascii-water/` + its documents only). **W-8 is the only task that wires the water system into production.**

**Dependencies — two categories, and only two (v2.1, binding):**

**Category 1 — HARD DEPENDENCY:** the downstream task technically requires the upstream result; it cannot be correctly implemented or verified without it. The complete hard-dependency set:

- **T3→T7** — SW-lifecycle regression surface shared (§25.6-verified); the registration-timing change is only verifiable against the fixed version/cache model.
- **Batch 1 → T8** — the loader and cache strategy build on the fixed script chain (T1), CSS integrity (T2), versioned SW (T3), and early registration (T7).
- **T9→T14** — the beckon ring anchors to the corrected cover geometry.
- **T13→T16** — the overlay modality inventory and focus paths build on the final open/close paths.
- **T6→T18** — T18 documents the post-T6 state surface.
- **T3+T8→T15** — the publish flow consumes the T3 version model and the post-T8 (no-meta) tooling shape.
- **T20→T22** — license discipline: new font binaries ship only with their license files in place.
- **T2→T23, T2→T25, T2→T26** — the repaired CSS subsystem and its parser gate must be in place first.
- **W-chain:** W-2 needs W-1 parameters; W-3 needs W-2's renderer; W-4 needs W-3's impulse API; W-5 needs W-2–W-4 integrated; W-6 needs W-5 measurements; W-7 needs W-3/W-4 input model **and T12 completed** (the unified-channel protection pattern must exist to reuse).
- **W-8 (sole production-integration task) needs:** Batch 1 complete (T1, T2, T4, T3, T7 — boot spine), **T8** (loading architecture + cache groups), **T9** (cover geometry), **T12** (unified tap channel / double-registration protection), **T13** (swipe recognizer sharing the touch surface), **T14** (cover idle rhythm the composition integrates with), **W-2…W-7** (lab outputs). W-8 explicitly does **not** depend on T11 or T17.
- **W-9 needs W-8.**

**Category 2 — EXECUTION ORDER / SHARED-FILE CONFLICT:** sequencing that exists for safe editing, clean diffs, or regression attribution — **not** a functional prerequisite. These pairs are explicitly **not** hard dependencies: T4→T3 (diff hygiene only), T11↔T9, T12↔T11, T17↔T14, T6↔T17, T15↔T18, T16↔T15, T19↔T16, T20↔T19, T25↔T22, T26↔T25, and every other adjacency inside the batch schedule. Category-2 ordering never justifies blocking an independent task, and no task prompt may restate a category-2 adjacency as a technical dependency.

**Synchronization points (technical, not author questionnaires — decisions are resolved):**

- **S1** — **documentation-only synchronization checkpoint: not an author gate, not an implementation task, no commit of its own.** Executable mechanism (v2.2): W-1…W-7 remain laboratory tasks and none may modify production code; IMPLEMENTATION-STATUS.md is the general operational exception to every task's file-scope limits; **W-5 has ONE additional conditional documentation-only exception** — if W-5 profiling adjusted any quality-ladder/hysteresis tuning values, the tuned values are propagated **inside the W-5 commit** to this document (§7.2, W-2 hook note, W-5) and to IMPLEMENTATION-PLAYBOOK.md (the corresponding technical section and the affected §8 prompts), strictly limited to the changed parameter references, **before W-6 begins**; performance-report.md records the rationale. If no values changed, S1 is satisfied by an explicit no-change confirmation in the W-5 completion report and STATUS. No separate S1 task or commit is created. Separately, and unchanged: if the 30 FPS hard gate fails after Canvas optimization — record evidence, stop the Canvas acceptance path, report for the D-7 decision (WebGL requires separate explicit authorization — never implemented silently).
- **S2** — retired as a gate: G-1 is resolved (decision 2). The gesture contract is a W-7 exit criterion, not a checkpoint.
- **S3** — technical integration gate for W-8. **S3 passes when (v2.2):** every W-8 prerequisite above is committed; every prerequisite check that Kimi Code can actually perform has passed; the relevant lab outputs and the integration contract are complete; any checks requiring the author's physical devices remain explicitly **PENDING-AUTHOR — their pending status does NOT prevent W-8**. However, the overall three-device 30 FPS performance gate is NOT passed until actual results exist for desktop Chromium, physical Android Chrome, and physical iPhone Safari; Kimi never marks physical tests PASS; W-8 may be implementation-complete while the overall performance gate remains pending; W-9 reports the state honestly; if real device results later establish that the 30 FPS hard minimum cannot be met, the failure is reported (WebGL requires the separate explicit D-7 authorization — never implemented silently). Three distinct concepts are kept separate everywhere: implementation completion; Kimi-executable verification; overall acceptance including author-only results.
- **S4** — final regression (§7.3) on the integrated development-branch candidate + author verification of the PENDING-AUTHOR queue.

---

## 2. Repository → technique practical map

All entries verified during the audit research phase (echo-audit §12–16 registry). Usage limits are binding: code may be studied and reimplemented from MIT sources; **no source file is copied into the project**, no external runtime dependency is added (decision 19: network only for official font binaries + licenses).

| Ref | Repository | License | What it provides (verified) | Read depth | Used by | Usage limit |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | 7PH/powerglitch | MIT | WAAPI-based glitch: `element.animate` + `steps()` timing + slice layers (cloned shards with clip-path insets, opposing shears); per-step randomization model | Read in full | T11, T14, T25 | Technique reimplementation only; no dependency |
| A2 | thetarnav/glitched-writer | MIT | Glyph palette / character-noise approach for text layers | Read | (constrained) | **Ideas only, and currently disallowed in output:** decision 11 forbids additional VOICE glyph noise/character corruption; palettes must never touch base text. Retained as registry record |
| M1 | HauntedCrusader/afterglow-crt | MIT | Phosphor ghost layer (blur 0.6–3 px, opacity 0.015–0.10), beam hold-phase brightness curve | Read in full | T23, T26, T14 (rhythm reference) | Technique reference; T23 is evidence-gated |
| M2 | mdombrov-33/vault66-crt-effect | MIT | CRT parameter ranges (scanline/glow/vignette discipline) | Read | T25, T26, W-2 grade | Parameter ranges as sanity bounds; no copying |
| A4 | hammerjs/hammer.js | MIT | Swipe classification criteria (abs(Δx) ≥ 64 px distance threshold; abs(Δx) > 1.5 * abs(Δy) dominant-axis rule; velocity threshold; failure on perpendicular overflow) | Read in full (recognizers) | T13 | Algorithm criteria reimplemented natively (~60 LOC); no dependency |
| A8 | victorqribeiro/rippleEffect | MIT | Hugo Elias two-buffer height-field water algorithm, damping ≈0.999 reference | Read in full | W-3, W-4 | Algorithm reimplemented independently at small scale; no dependency |
| A10 | kciter/ascii-3d-renderer.js | MIT | Density→character ramp mapping, glyph atlas pre-render + per-cell drawImage approach | Read | W-2, W-5 | Technique reference; reimplementation only |
| M3 | mdn/serviceworker-cookbook | (MDN, CC0/CC-BY-SA code patterns) | SW registration timing (immediate/DOMContentLoaded), cache group patterns | Pattern confirmation | T3, T7, T8, W-6 | Patterns only |
| A5 | (GPL glitch-art reference) | **GPL** | Visual benchmark for glitch intensity vocabulary | Skimmed | T25 (benchmark only) | **No code, no text, no assets** — GPL incompatible; visual reference at most |
| A9/A6 | WebGL water/ascii references | MIT | WebGL-branch techniques | Registry | D-7 contingency only | Activated only if D-7 is explicitly authorized after documented Canvas 2D failure |
| M4/M7/A7 | assorted | **No license found** | Visual ideas | Registry | — | Ideas only; **no code copying** (no license = no rights) |

**Dependency conclusion (FACT):** every technique in this roadmap is reimplemented in vanilla JS. Zero runtime dependencies are added to the project.

---

## 3. Direction B — technical map of the four artistic groups

Direction B (visual enrichment of existing surfaces) is the author's fixed classification. **Every visual task binds to exactly one PRIMARY group (v2.1 rule); no task invents a fifth category.** Secondary relationships are real but recorded separately — they never create a second primary membership. Infrastructure tasks (B-0, T1, T2, T3, T4, T6, T7, T8, T15, T16, T18, T19, T20, T22) carry no artistic-group assignment.

**Group 1 — Decoding / Destruction.** Signal decay as the book's native language. **Primary members: T11** (VOICE in-chapter distortion — three distinct choreographies), **T25** (electric-glitch on the TOC — three quality variants: shear / chroma-walk / drop-frame, timing frozen at 15 s cycle / 1.2 s window), **T26** (analog-drop whole-screen traversal — two-phase brightness profile + sub-pixel jitter, 200 ms window and 25–40 s scheduler frozen). Bound to: script.js:858–921 (electric-glitch), 904–915 (analog-drop), style.css:1346–1364, 1405–1411, VOICE generators ≈963/1093/1127 + dispatch ≈1163–1180. *Secondary relationships:* T25/T26 events occur on the TOC surface, so they touch Group 4's navigation context — noted, not a primary membership.

**Group 2 — Physical Response.** The surface reacts to the reader. **Primary members: W-series** (ASCII-WATER wave field — tap splash, drag wake, hover shimmer, multitouch), **T12** (film double-tap skip feedback), **T13** (menu swipe recognizer). Bound to: cover canvas (new, W-8), script.js entry handlers ≈533–563, film controller ≈1807+, menu touch handlers ≈540–556. *Secondary relationships:* the water idle state breathes without input (Group 3 territory) and the W-8 entry splash participates in navigation staging (Group 4 territory); T13 serves navigation (Group 4 territory). All noted, none primary.

**Group 3 — Living Details.** Idle surfaces breathe without input. **Primary members: T14** (cover IDLE→SURGE→LULL rhythm + beckon ring, decision 10 = A), **T23** (phosphor ghost evaluation — ambient persistence as a living detail). Bound to: script.js ≈2641–2660, style.css ≈2443–2510. *Secondary relationships:* the water idle model (W-3) implements the same calm-living quality inside its Group-2 primary surface.

**Group 4 — Navigation with Artistic Feedback.** Moving through the book is itself staged. **Primary member: T17** (TOC reveal choreography — the staged disclosure of the navigation surface). Bound to: script.js ≈1568–1584 (reveal). *Secondary relationships:* the entry gesture → water splash → glitch transition (W-7/W-8) is navigation staging executed by a Group-2-primary system; T25/T26 interference events land on the TOC (their primary membership stays Group 1); existing chapter swipe navigation is T13-adjacent (Group 2 primary).

**Variety guard:** within each group, effects must differ in *kind* (choreography, phase structure, spatial character), not merely in the intensity of one effect (author's Step-2 directive, applied to T11 and T25/T26).

---

## 4. Complete task table

**Priorities (rubric: P0 = data loss / inability to read; P1 = serious stability/offline/navigation/key-feature failure; P2 = real degradation; P3 = optional/evaluated) — binding assignment (v2.1, synchronized with TASKS.md v4.2 headings):** **P0: empty** — no current task qualifies; B-0 is a BASELINE GATE, not a P0 implementation task. **P1: T3, T7, T8, T11, T12, W-1, W-2, W-3, W-4, W-5, W-6, W-7, W-8, W-9** (W-series = author-declared central workstream). **P2: T1, T2, T4, T6, T9, T13, T14, T15, T16, T17, T18, T19, T20, T22, T25, T26** (lowered-from-v2 marks and justifications preserved in TASKS.md v4.2; batch placement reflects risk/critical-path, not only priority). **P3: T23** (evaluation-gated, auto-verdict per decision 12). Obsolete/cancelled/superseded: **T5** (obsolete under D-10 B), **T10** (cancelled by author — never scheduled), **T24** (superseded by the W-series — historical record only), T21 does not exist.

Fields per task: ID · Priority · Title · Problem · Evidence · Solution · Repo ref · Files · Dependencies · Acceptance · Risks · Commit.

---

### Track 0

**B-0** · GATE · Record the actual test baseline

- **Problem:** the actual state of all checks on the pinned snapshot is unrecorded. Audit-known expected baseline issue: chapters-meta.js freshness mismatch (6808 vs 6807) — it must be reproduced and captured during B-0, it is **not yet confirmed by the implementation baseline run**, and it is expected to be eliminated by T8 (D-10 B). No other failure may be asserted or excluded before B-0 actually runs.
- **Evidence:** Step-3 addition A; Step-4 §7.4.
- **Solution:** clean checkout state on the dev branch from `e2acadbf`; run tests/run-static.ps1 in PowerShell; open tests/browser/unit-state.html, effects-lab.html, focusprobe.html via local HTTP; capture complete outputs; classify every check: (a) PASS / (b) the expected chapters-meta freshness failure, if reproduced / (c) other pre-existing failure (full excerpts) / (d) manual-or-device check; record environment (OS build, PowerShell version, browser + version); create tests/BASELINE.md; one commit.
- **Repo:** —. **Files:** creates tests/BASELINE.md only.
- **Dependencies:** none (first task). **Acceptance:** every check classified; `git status` proves no application source file changed; commit `test: record pre-implementation baseline (B-0)`.
- **Risks:** none. Do **not** claim the static baseline green: the reproduced chapters-meta freshness failure (if confirmed at B-0) remains until T8 removes that check (D-10 B).

### Track 1 — Batch 1 (boot spine)

**T1** · P2 · Remove dead glyph-utils.js script tag

- **Problem:** `<script src="glyph-utils.js">` 404s on every load, delaying the classic-script boot chain.
- **Evidence:** audit D1; index.html:453 (FACT).
- **Solution:** delete the single tag. **Files:** index.html (one line). **Dependencies:** B-0.
- **Acceptance:** zero 404s on load; boot and TOC unchanged; diff = one line. **Risks:** none.
- **Commit:** `fix: remove dead glyph-utils.js script tag (D1)`.

**T2** · P2 · Repair 10 broken CSS declarations + parser gate

- **Problem:** 10 declarations with unmatched `)` in 5 locations silently kill grain/noise keyframe steps and sheet gaps.
- **Evidence:** audit D3; style.css:516–519, 1152–1154, 2101, 2108, 2170 (FACT).
- **Solution:** delete each stray `)` (keep values 14/6/10 px); add a full-file CSS parse check to tests/run-static.ps1 (fail on any parse error). **Files:** style.css, tests/run-static.ps1. **Dependencies:** B-0.
- **Acceptance:** parser reports zero errors; computed background-position present at affected keyframes; gaps compute to 14/6/10 px; grain visibly shifts across two frames; sheet layout intact at 320/390/430/768/1280 px. **Risks:** visual change in grain/noise — that is the fix working.
- **Commit:** `fix: repair 10 broken CSS declarations + add full-file parse check (D3)`.

**T4** · P2 · Remove Vibration API call sites

- **Problem:** `navigator.vibrate([30,60,30])` and `navigator.vibrate(30)` violate the no-haptics constraint.
- **Evidence:** audit D5; script.js ≈1078–1079, ≈2065 (FACT).
- **Solution:** delete both call sites with their guards; prune vibration comments. **Files:** script.js. **Dependencies:** B-0.
- **Acceptance:** `grep -n vibrate script.js` → no matches; VOICE-shock and film-hit visuals still fire. **Risks:** none.
- **Commit:** `fix: remove Vibration API call sites (D5)`.

**T3** · P1 · Single version source; SW derives cache name

- **Problem:** version.js declares `ECHO_VERSION='v76'` but **nothing consumes it** (script.js: 0 references — FACT; sw.js never importScripts it); sw.js hardcodes `CACHE_VERSION='echo-v66'` (stale); the sw.js header comment describes the intended importScripts design but the implementation never followed it.
- **Evidence:** audit D2/§6.3/§25.6; sw.js:19, version.js, index.html:451 (FACT).
- **Solution:** sw.js gains `importScripts('version.js')` and `const CACHE_VERSION = 'echo-' + ECHO_VERSION;`; rewrite the stale sw.js header comment to the actual atomic-CORE/allSettled-EXTRA design; add `'version.js'` to the network-first code group; fix the version.js header comment to match reality (comment-only edit, only if the existing comment is inaccurate). **Two distinct loading paths — do not conflate (v2.1):** (a) the SW's own `importScripts('version.js')` update-fetch is a browser worker mechanism — adding version.js to CODE_FILES does **not** control it, and it is verified in the SW lifecycle suite; (b) ordinary page fetches for version.js follow the CODE_FILES network-first strategy once listed. Both paths are verified independently. chapters-meta.js is not added anywhere (D-10 = B, final). **Files:** sw.js + version.js (comment only if needed). **Dependencies:** T4 (execution order — diff hygiene, not a hard dependency).
- **Acceptance:** fresh install caches `echo-v76`; bumping version.js alone → new cache name; old caches purged on activate; version.js served network-first; controllerchange reload-once intact; offline reload works; `?ch=` preserved.
- **Risks:** SW lifecycle regressions — run the full install→activate→purge→update suite. **Commit:** `fix: single version source, SW derives cache name (D2)`.

**T7** · P1 · Register SW at DOMContentLoaded

- **Problem:** registration waits for `window.load` — first-visit offline readiness is delayed by slow assets.
- **Evidence:** audit D8/§6.3 (DV); script.js ≈2396–2397 (FACT).
- **Solution:** move registration to immediate script execution / DOMContentLoaded. **Files:** script.js (registration block only). **Dependencies:** T3 (same regression surface).
- **Acceptance (corrected, v2.2 — matches the binding TASKS/PLAYBOOK definition):** `navigator.serviceWorker.register()` is INVOKED before `window.load`, demonstrated by instrumentation (a timestamped marker at the register() call vs the load event under Slow-3G throttling); registration invocation, installation, activation, `controllerchange`, and `navigator.serviceWorker.ready` are DISTINCT observations — installation and activation are observed and recorded separately; controllerchange reload fires exactly once; offline reload works; install prompt flow intact. `ready` timing may be recorded DIAGNOSTICALLY but is NOT an acceptance condition (the old `ready`-before-`window.load` criterion is removed). **Risks:** registration timing races — covered by lifecycle suite.
- **Commit:** `fix: register SW at DOMContentLoaded (D8)`.

### Track 1 — Batch 1.5

**T5** · ~~P2~~ · **OBSOLETE (D-10 = B, Step-4 decision 1).** chapters-meta.js is deleted by T8; there is no metadata left to regenerate. Historical record preserved in TASKS.md v4.2. **No prompt, no execution.**

**T8** · P1 · Lazy-load chapters.js — D-10 **branch B only**

- **Problem:** 296 KB (wire) chapters.js gates first paint/readiness though TOC titles are hardcoded; the chapters-meta tooling is a permanent freshness hazard.
- **Evidence:** audit D8 (A1); index.html ≈451–454; script.js consumers ≈321, 354–355, 441, 472, 677, 679, 1534, 1550, 1586, 1588 (FACT).
- **Solution (branch B — the only branch):** (1) delete `chapters-meta.js`; (2) delete `tests/build-meta.ps1`; (3) remove the chapters-meta freshness-check block from tests/run-static.ps1 (≈:15, :46, :59–69 — re-locate by content, line numbers are hints); (4) remove every now-obsolete metadata reference from sw.js cache lists, comments, docs, tests; (5) promise-cached `ensureChapters()` dynamic loader for chapters.js; (6) optimistic TOC (renders from hardcoded titles immediately); (7) every chapter-opening path (TOC click, `?ch=`, resume, share, next-chapter) awaits the real `chapterTexts`; (8) chapter emptiness determined **only** from actual loaded text — an empty/whitespace chapter can never open through any path; (9) legacy `lastChapter` validated **after** load (index in range AND chapter non-empty), else safe fallback **without losing settings or progress data**; (10) chapters.js stays in the SW core/offline strategy so offline first-open works; (11) idle prefetch after cover interactive; await-on-open shows the existing shimmer.
- **Repo:** M3 (patterns). **Files:** index.html, script.js, sw.js, tests/run-static.ps1; deletions: chapters-meta.js, tests/build-meta.ps1. Never edits chapters.js contents/markers.
- **Dependencies:** Batch 1 complete.
- **Acceptance:** throttled cold load: cover tappable before chapters.js completes; first chapter open ≤ baseline + 0.5 s (prefetch); offline first-open works; empty chapter can never be opened from TOC/`?ch=`/resume; legacy-save fixture (valid, out-of-range, empty-target) each handled safely with progress preserved; no active implementation references to chapters-meta.js / CHAPTERS_META remain in runtime code, Service Worker configuration, active tests, or generators (historical documentation/evidence references intentionally preserved); the freshness check and its generator are removed; **the known chapters-meta failure, IF B-0 actually reproduced it, is eliminated**; T8 introduces no new unexplained failure against the B-0 record; unrelated pre-existing failures remain recorded and receive separate disposition — **run-static is claimed fully green only when every failure recorded at B-0 has actually been resolved** (v2.2); VOICE/PHOTO rendering, share-quote, `?ch=N`, initProgress overlay all intact.
- **Risks:** boot-order races; legacy-state edge cases — covered by the fixture matrix. **Commit:** `feat: lazy-load chapters.js, remove chapters-meta tooling (D8, D-10=B)`.

---

### Track 1 — Batch 2 (user-facing)

**T9** · P2 · Center cover image, safe-area padding

- **Problem:** cover img offset −15.6 px on narrow viewports; bottom bar lacks safe-area padding.
- **Evidence:** audit D11/A4; style.css ≈116–127, ≈2440 (FACT + emulation).
- **Solution:** center the img inside `.cover-tremor`; `padding-bottom: env(safe-area-inset-bottom)` on the bottom bar; mirror the film screen's dvh pattern where vh is unsafe. **Files:** style.css. **Dependencies:** B-0.
- **Acceptance:** centerOffsetX within ±1 px at 320/390/430 px × portrait/landscape (emulated); bottom bar clears home indicator; desktop cover unchanged; **physical-iPhone verification → PENDING-AUTHOR (§11)**. **Risks:** cover geometry — regression: beckon, tap targets.
- **Commit:** `fix: center cover image, add safe-area padding (D11/A4)`.

**T11** · P1 · Rebuild VOICE modes on WAAPI with distinct choreography

- **Problem:** standard VOICE = two shadow blips (37/43 markers); unmarked tokens fall through to aggressive (violates D-3); runtime @keyframes string injection prevents per-step randomness; the three modes must differ in movement, distortion character, and phase sequence — not merely intensity.
- **Evidence:** audit D13/A3, D-3; script.js generators ≈963/≈1093/≈1127, dispatch ≈1170–1180, layers ≈980–986 (FACT); 43-marker inventory.
- **Solution:** (1) dispatch per D-3 — unmarked→standard, `:standard`→standard, `:strong`→strong (aggressive-class; zero `:strong` markers today — intentional), `:whisper`→whisper, unknown→standard + one-time console diagnostic; (2) **standard** = WAAPI base jitter (steps(), ±1–2 px, 8–12 steps/s) + slice bursts (voice-slice ×2, complementary clip-path insets, opposite ±4–8 px shears, 150–250 ms) + red/cyan peeks (opacity ≤0.5, ≤120 ms); bursts every 0.8–2.4 s randomized while in view; (3) **strong** = phased: snap-in tear (±8 px + chroma ±3 px, 200–400 ms) → sustain → stepped decay; ceiling = today's aggressive visuals ported to WAAPI; (4) **whisper** unchanged; (5) delete stylesheet string injection; cancel via getAnimations().cancel() out of view. **Decision 11 constraint: strictly this choreography — no additional glyph distortion, no character-noise effects, nowhere (the A2 registry idea is not used).** Layout geometry never animated (transform/opacity/clip-path only — D-3 hard constraint, CLS = 0).
- **Repo:** A1. **Files:** script.js, style.css (retire injected keyframes only). **Dependencies:** B-0.
- **Acceptance:** three modes visually distinct in side-by-side capture (movement/character/phases); text fully readable during events; zero layout-shift attributable to VOICE; neighbor bounding boxes identical before/during/after (programmatic); reduced-motion → whisper/no-op; no runtime stylesheet injection; unknown-token fallback fires with diagnostic; all 43 markers reviewed across ch 0,4,20,31,33,47,81,82; long-chapter scroll perf unchanged.
- **Risks:** 43-marker surface — the review pass is mandatory. **Commit:** `feat: rebuild VOICE modes on WAAPI with distinct choreography (D13/A3, D-3)`.

**T12** · P1 · Film double-tap skip + unified tap channel + exact hint

- **Problem:** no skip path (taps inert); touchend+synthetic click would double-register one physical touch into a false skip-all.
- **Evidence:** audit D9/A5; script.js runFilmSequence ≈1807, timing ≈1998–2031 (FACT).
- **Solution:** (1) timer registry on the film controller (extend the `later()` helper into a clearable registry); (2) unified tap channel — pointerup with pointerType filtering, or touchend with the following synthetic click explicitly suppressed within the gesture window; **one physical touch = exactly one tap**; (3) two genuine taps ≤300 ms → clear registry → run the sequence's own endToTitle() path (identical final state); single tap = no-op; (4) hint text **exactly «Дважды коснитесь, чтобы пропустить»** (decision 3), shown at lamp ignition per existing task timing, fades after 2 s, shown every play — **no persistent suppression flag**; (5) reduced-motion: hint **text remains visible as a readable static element** — only its animation is disabled/removed, never the instruction itself.
- **Repo:** A4 (tap discipline). **Files:** script.js, index.html (#film-screen hint element), style.css (hint styling only). **Dependencies:** B-0. **Note:** the unified-tap protection built here is reused by W-8's gesture model (decision: "reuse the protections developed for T12").
- **Acceptance:** double-tap skips from every phase incl. lamp to the identical post-film state; single tap no-op; **single physical touch (touchend+synthetic click) counted exactly once — programmatic check**; no zombie timers within 15 s after skip; hint shows exact text, readable and static under reduced-motion; full unskipped film path intact; filmReady-skip branch intact; **iOS Safari + Android Chrome physical verification → PENDING-AUTHOR (§11)**.
- **Risks:** timer leaks; gesture double-count — both have explicit acceptance checks. **Commit:** `feat: film double-tap skip with unified tap channel + hint (D9/A5)`.

**T13** · P2 · Horizontal swipe recognizer for menu

- **Problem:** menu opens only via tap or right-edge (>0.82·W) left-swipe on chapter screen; no close gesture; touchend-snapshot logic.
- **Evidence:** audit D10/A6; script.js ≈540–556, openMenu/closeMenu/toggleMenu ≈1227–1259 (FACT).
- **Solution:** native recognizer (~60 lines): touchstart records point/time; touchmove tracks dominant axis; touchend classifies horizontal swipe if |Δx|≥64 px, |Δx|>1.5·|Δy|, ≤600 ms; left-swipe opens on chapter+TOC, right-swipe closes when open; cancel on multi-touch or if vertical scroll engaged first; keep tap + edge swipe during transition, then remove the edge special-case.
- **Repo:** A4 (criteria only). **Files:** script.js. **Dependencies:** B-0. **Note:** shares the touch-event surface with W-8 (listed as a W-8 prerequisite so arbitration stays coherent).
- **Acceptance:** swipe open+close on chapter and TOC screens; 100-swipe mixed-angle matrix with zero false opens during vertical scroll; tap path unchanged; chapter swipe-up next-chapter intact; text selection unharmed.
- **Risks:** gesture conflicts — matrix acceptance covers. **Commit:** `feat: horizontal swipe recognizer for menu (D10/A6)`.

**T14** · P2 · Rebuild idle splash rhythm and beckon (decision 10 = A)

- **Problem:** beckon fires once (7.5 s) then near-invisible 7 s breath; dead beckon-1/2/3 CSS (abandoned design); author requires rebuild.
- **Evidence:** audit D11/A7; script.js ≈2641–2660, style.css ≈2333–2355, ≈2443–2461, ≈2479–2510 (FACT).
- **Solution (as approved — no further visual gate):** state machine IDLE→SURGE→LULL (20–40 s cycle; 3 s surge: WAAPI steps() micro-tremor on .cover-tremor + glow pulse + ripple pair; then lull); beckon = high-contrast double-outline ring anchored to the image rect (getBoundingClientRect on resize/orientationchange); delete dead CSS; re-arm on visibilitychange; reduced-motion → static textual hint. In the W-8 composition the surge additionally emits a water impulse burst (hook point only; wired in W-8).
- **Repo:** A1 (steps technique), M1 (rhythm reference). **Files:** script.js, style.css. **Dependencies:** T9 (shared cover geometry).
- **Acceptance:** cycle repeats indefinitely without single-frame jerks; ring contrast ≥3:1 measured on bright and dark zones of the art; no cover layout shift; works 320–1280 px; reduced-motion static path.
- **Risks:** cover composition — geometry regression list from T9. **Commit:** `feat: rebuild idle splash rhythm and beckon element (D11/A7)`.

**T17** · P2 · TOC reveal stagger — continuous linear

- **Problem:** reveal stagger `200 + i*80` → 84th item at ≈6.9 s.
- **Evidence:** audit D14; script.js ≈1568–1584 (FACT).
- **Solution:** replace with **continuous linear stagger `200 + i * 20`** (Step-4 §4.11 — the v1 capped formula `200 + Math.min(i,28)*60` is superseded: it collapsed every item after index 28 to the same delay). Indices 0–83 → 200…1860 ms.
- **Files:** script.js. **Dependencies:** B-0.
- **Acceptance:** all 84 items fully visible ≤2.5 s; stagger remains perceptible; reduced-motion immediate; rapid exit/enter safe (revealTimers cleared); read/current states intact.
- **Risks:** none material. **Commit:** `fix: continuous TOC reveal stagger (D14)`.

### Track 1 — Batch 3 (quality / publish-safety)

**T6** · P2 · Remove discontinued badge mechanism (D-2)

- **Problem:** badge dependency chain (seenNew/prevVisit/lastVisit) still live though the feature is discontinued.
- **Evidence/Solution:** per TASKS.md v4.2 T6 verbatim (9 JS sites, 3 CSS sites, README:15, 3 test files; five-step plan; PUBLISHED_AT untouched). **Files:** script.js, style.css, README.md, tests. **Dependencies:** B-0.
- **Acceptance:** states/progress line unchanged; old fixture loads; grep clean for the removed keys; unit-state fixtures pass. **Risks:** state surface — fixture matrix covers.
- **Commit:** `chore: remove discontinued badge mechanism (D-2)`.

**T18** · P2 · echo_state schema version

- **Problem:** no schema version on echo_state.
- **Evidence:** audit §6.2.
- **Solution:** write `v:1`; absent `v` ⇒ v0 → upgrade in place (no field changes); quarantine behavior kept. **Files:** script.js (loadState/saveState). **Dependencies:** T6 (documents the post-T6 surface).
- **Acceptance:** v-less fixture loads with progress intact; new saves carry `v`; corrupt JSON quarantines; post-T6 legacy keys load cleanly. **Risks:** state loss — fixture matrix mandatory.
- **Commit:** `feat: echo_state schema version (audit §6.2)`.

**T15** · P2 · Verified one-button publish flow (author-operated)

- **Problem:** push-echo.cmd has no version bump, no post-deploy verification, weak guards; **and it cannot guard uploads performed manually through the GitHub web interface** (Step-4 §3 — this limitation must be documented, never overstated).
- **Evidence:** audit §19.
- **Solution:** per TASKS.md v4.2 T15 fix plan (pre-push guards incl. node --check + run-static; bump version.js as single source per T3; post-deploy cache-bypassed GET + version compare; repeat-push warning; D-10 B: no meta step exists — remove it from the plan). Add explicit documentation of the web-upload limitation in the script header and README note. The audit §19 optional GitHub Action idea is **not an active instruction — it is never implemented**. **Kimi dry-run constraints (hard, v2.1):** Kimi never invokes the live publish script; a dry-run uses no real GitHub remote and no real commit/push/deploy actions; no production access for verification; the post-check logic is demonstrated against a local fixture HTTP server only.
- **Files:** push-echo.cmd, README.md (note). **Dependencies:** T3 (version flow), T8 (no meta tooling).
- **Acceptance:** dry-run simulated bump → post-check logic demonstrated against a local fixture; failure paths print actionable diagnostics; all pre-existing guards still run; run-static viewport check byte-identical (D-1); limitation paragraph present.
- **Risks:** none to the live site (dry-run only). **Commit:** `chore: verified one-button publish flow with documented limits (audit §19)`.

**T16** · P2 · Keyboard/ARIA pass with behavior-based overlay semantics

- **Problem:** no Esc-to-close; focus unmanaged; unnamed icon buttons. (v1's blanket `role="dialog"` + `aria-modal="true"` + focus trap on all overlays is **superseded** — Step-4 §4.10.)
- **Evidence:** audit §11.4.
- **Solution:** (1) **inventory each overlay's actual interaction behavior first** (menu, settings sheet, resize sheet, photo overlay, install prompt): which block the underlying page (genuinely modal) vs which coexist with it (non-modal); (2) only genuinely modal surfaces get `role="dialog"` + `aria-modal="true"` and a focus trap; (3) non-modal surfaces get suitable semantics (e.g. labelled region/group) with correct focus movement on open and focus return on close — never falsely announced as modal; (4) Esc closes the topmost overlay everywhere; (5) aria-labels on icon-only buttons; (6) PHOTO: strictly necessary accessibility parity only — no behavior change (frozen subsystem).
- **Files:** script.js, index.html. **Dependencies:** T13 (shared open/close paths).
- **Acceptance:** full keyboard path TOC→chapter→settings→resize→Esc→Esc→TOC without a mouse; semantics match the recorded inventory (each overlay's modality justified in the commit message); focus returns to trigger; swipe/tap paths unaffected; **NVDA/VoiceOver pass → PENDING-AUTHOR (§11)**.
- **Risks:** overlay behavior regressions — keyboard walkthrough covers. **Commit:** `feat: keyboard/ARIA pass with behavior-based overlay semantics (audit §11.4)`.

**T19** · P2 · noscript fallback

- **Problem:** without JS, black void (routing-pending hides everything).
- **Evidence:** audit §8.
- **Solution:** `<noscript>` block — inline style neutralizing routing-pending + static message (title, author, JS-required note, contact per menu content). **Files:** index.html. **Dependencies:** B-0.
- **Acceptance:** JS off → meaningful styled page; JS on → inert, boot unaffected. **Risks:** none.
- **Commit:** `feat: noscript fallback (audit §8)`.

**T20** · P2 · Ship OFL license files

- **Problem:** OFL claimed in README; no license files ship.
- **Evidence:** audit §10.5.
- **Solution:** add upstream OFL 1.1 texts + copyright notices for PT Serif and Golos Text (fonts/OFL.txt + notices) from the exact upstream releases (decision 19: the only permitted network use); README links them. **Files:** fonts/ (new text files), README.md. **Dependencies:** B-0.
- **Acceptance:** files present and correct for the exact font versions; README accurate. **Risks:** none.
- **Commit:** `chore: ship OFL license files (audit §10.5)`.

**T22** · P2 · Genuine Golos Text 500/700 weights (D-4 = A)

- **Problem:** @font-face 500/700 serve weight-400 files → faux-bold.
- **Evidence:** audit D4; style.css ≈51–81 (FACT).
- **Solution:** obtain genuine Golos Text Medium 500 / Bold 700 woff2 (cyrillic+latin, OFL, upstream Paratype/Google Fonts — decision 19 network exception); point the two blocks at the new files; record actual byte sizes in the commit message; add to SW EXTRA cache group. **Files:** fonts/ (2 new woff2), style.css, sw.js. **Dependencies:** T20 (license discipline).
- **Acceptance:** DevTools Fonts panel shows genuine files rendering .book-title/UI; no faux synthesis; iOS Safari stroke check → PENDING-AUTHOR (§11); sizes recorded; title layout width shift reviewed.
- **Risks:** none material. **Commit:** `fix: genuine Golos Text 500/700 weights (D4, D-4=A; +NN KB actual)`.

**T25** · P2 · Electric-glitch visual variants (timing frozen)

- **Problem:** electric-glitch renders one repeated pattern inside its 1.2 s window.
- **Evidence:** script.js:858–921 (GROUP_SIZE/INTERVAL_MS/GLITCH_DURATION — frozen, FACT); style.css:1346–1364; Step-2 §6 mandate.
- **Solution:** three quality variants (shear / chroma-walk / drop-frame) with a seeded no-immediate-repeat picker; same property set (transform/text-shadow/clip-path), palette pair only, steps(1) kept.
- **Repo:** A1 (vocabulary), M2 (discipline). **Files:** style.css, script.js (variant picker only). **Dependencies:** T2 (same CSS subsystem).
- **Acceptance:** three visually distinct renderings captured across consecutive triggers; **constants asserted unchanged programmatically** (15 s / 1.2 s); zero animation under reduced-motion; read/current TOC states survive.
- **Risks:** none beyond CSS. **Commit:** `feat: electric-glitch visual variants, timing frozen (Step-2 §6)`.

**T26** · P2 · Analog-drop visual quality (timing frozen)

- **Problem:** analog-drop's 200 ms traversal is flat.
- **Evidence:** script.js:904–915; style.css:1405–1411 (scanline-fly) (FACT).
- **Solution:** two-phase brightness profile (bright lead edge + decay trail per M1 beam-hold curve) + sub-1 px vertical root jitter during the 200 ms (transform-only).
- **Repo:** M1 (curve), M2 (ranges). **Files:** style.css. **Dependencies:** T2.
- **Acceptance:** drop reads as a directional sweep with decay (frame captures); **scheduler (25000+rand(15000)) and 200 ms duration asserted unchanged**; reduced-motion off; no moiré against scanlines; legibility during event.
- **Risks:** none beyond CSS. **Commit:** `feat: analog-drop visual quality pass, timing frozen (Step-2 §6)`.

### Track 1 — evaluated experiment

**T23** · P3 · Phosphor ghost layer — evidence-based auto-verdict (decision 12)

- **Problem:** no phosphor persistence layer; value unproven.
- **Evidence:** M1 ghost pattern (blur 1–2 px, opacity 0.02–0.05 range).
- **Solution (decision 12 — no further approval gate):** (1) capture a reproducible baseline (screenshots + frame-time trace, non-reading screens); (2) capture the ghost-layer variant under identical conditions; (3) compare visual depth/persistence; (4) verify reading-screen exclusion and text readability; (5) measure rendering/frame-time impact on the available test environment; (6) **adopt only if improvement is clear AND no performance or readability regression** — otherwise remove the experimental code and record the discard verdict with evidence; (7) record the verdict and evidence in the commit.
- **Files:** style.css (CRT section); at most one static div. **Dependencies:** T2 (hard — CSS surface + parser gate); final execution slot: **after T26** (Batch 3 closes …T25 → T26 → T23).
- **Acceptance:** A/B evidence + frame cost recorded; binary verdict executed and documented. **Risks:** none (removable by verdict).
- **Commit:** `feat: phosphor ghost layer — adopted on evidence (M1)` **or** `docs: phosphor ghost layer discarded — evidence recorded (M1)`.

---

### Track 2 — ASCII-WATER (W-1…W-7 strictly inside `lab/ascii-water/`; W-8 sole production task)

**Fixed visual direction (decisions 4–7 — not a choice, a specification):** hybrid character density (density varies spatially); night-water landscape with a shoreline band, a distant light column, and mirrored reflection below the waterline; procedural rendering; wave height primarily displaces/refracts the reflected scene, glyph density/brightness respond secondarily; idle surface calm and slow with rare small perturbations (no rain, no constant ripple field); existing CRT/projector treatment integrated without overwhelming the characters.

**W-1** · P1 · Formalize the approved visual direction

- **Problem:** the chosen direction needs a complete, implementable parameter table (not alternatives).
- **Evidence:** decisions 4–7; audit §11 research base.
- **Solution:** write `lab/ascii-water/design.md` formalizing **the** direction: scene composition (sky band, shoreline band, water band with waterline Y, distant light column position/width/height); character ramp tables (density-ordered, 8–12 glyphs per ramp; **hybrid spatial density**: dense ramps reserved for high-detail zones — light column, reflection highlights, shoreline texture — sparse ramps for open sky/water); quantization (4×4 Bayer matrix definition); night grade values (background #06080a family, cyan-green glow family); scanline/vignette/grain amounts referencing existing CRT tokens; glyph-size ladder 8/10/12 px; idle-motion parameters (drift speed, ambient perturbation rarity — rare, low-energy); reduced-motion static frame spec. **W-1 is a specification task (v2.1): it does not demand a renderer or any visual output.** Any sketch or rough mock made while working is illustrative only, is never acceptance evidence, and is never presented as an unresolved artistic direction or an author choice gate. Actual rendering confirmation happens in W-2.
- **Files:** lab/ascii-water/design.md. **Dependencies:** B-0.
- **Acceptance:** parameter table complete enough that W-2 implements without inventing values; every parameter traceable to a decision or marked PTV; the written specification unambiguously describes night water with shoreline + light column + mirrored reflection (confirmation that the *rendered* scene reads as intended is W-2's acceptance, not W-1's).
- **Risks:** none. **Commit:** `docs: ASCII-WATER visual direction parameters (W-1)`.

**W-2** · P1 · Complete rendering pipeline prototype

- **Problem:** feasibility of the full Canvas 2D ASCII pipeline at interactive rates is unproven.
- **Evidence:** audit §11; A10 technique.
- **Solution:** build the lab page (`lab/ascii-water/index.html` + `js/scene.js`, `js/renderer.js`, `js/metrics.js`) orchestrated by **native browser JavaScript only** — plain script composition consistent with the no-build/no-framework constraint; no invented bootstrap, loader, bundler, or module framework — implementing **the complete 7-step pipeline, in this order:** (1) generate the meaningful procedural night landscape (sky, stars/noise field, shoreline band, distant light column, scene lighting); (2) render shoreline, light column, lighting into an offscreen scene buffer; (3) produce the mirrored reflection below the waterline; (4) apply wave-field displacement when sampling the reflection (hook point for W-3; identity displacement until W-3 lands); (5) convert scene/reflection luminance to the hybrid ASCII representation (spatially-varying density per W-1); (6) apply **4×4 Bayer ordered dithering** in the quantization step (mandatory — must not disappear); (7) apply night grade, restrained glow, scanlines, vignette, grain. Glyph atlas pre-rendered per ramp per cell size; drawImage per cell; rAF loop; `metrics.js` instrumentation: FPS, p95 frame time, dropped-frame ratio, payload size. A plain gradient is permitted as a low-level renderer test fixture during development — **it does not satisfy W-2 acceptance**.
- **Files:** lab/ascii-water/ only. **Dependencies:** W-1.
- **Acceptance:** the lab page displays the **complete meaningful landscape** (shoreline + light column + mirrored reflection readable as a character-rendered scene — this is where the rendering confirmation formerly attached to W-1 lives); Bayer dithering visibly present in gradient zones; 8/10 px modes functional; instrumentation live; frame rate at 12 px cells on desktop Chromium measured and recorded — **60 FPS here is a diagnostic/aspirational figure, not a gate: falling short of 60 FPS does not block W-2** (the only binding FPS gate is §7.2, exercised at W-5 and W-9); measurements recorded.
- **Risks:** none. **Commit:** `lab: complete ASCII-WATER rendering pipeline (W-2)`.

**W-3** · P1 · Wave physics — one physical model, one data flow

- **Problem:** wave simulation for the water band (v1's conflicting height→luminance vs height→displacement descriptions are superseded — Step-4 §4.3).
- **Evidence:** decision 6; A8 algorithm (read in full).
- **Solution (`js/waves.js`):** two-buffer height-field simulation per Hugo Elias, **reimplemented independently** (small algorithm, no dependency). **Single model:** primary output = **horizontal displacement/refraction when sampling the mirrored scene** (offset proportional to the height-field gradient); secondary output = **modest modulation of glyph brightness and density**. Grid: 96×54 class at 12 px cells, scaled with the ladder. Damping baseline 0.999 (tunable 0.995–0.9999, PTV). **Absorbing/damped boundaries — no mirrored-edge reflection, no wrap-around** (border cells apply extra damping). **Maximum 3 active ripple sources in v1, oldest-source recycled.** Slow underlying drift (low-frequency phase offset feeding the displacement sampler). Idle = calm: rare, low-energy ambient perturbations only (on the order of one small impulse per 20–60 s, PTV); **no continuous drizzle, no rain stream, no frequent random drops.** Impulse API: `drop(x, y, strength, radius)` in grid coordinates; stability guard (NaN/blow-up detection resets the field silently).
- **Files:** lab/ascii-water/js/waves.js (+ renderer hook). **Dependencies:** W-2.
- **Acceptance:** waves visibly refract the reflected scene (displacement, not just brightness); secondary brightness/density response present but modest; boundaries absorb (no edge bounce); source cap + recycling demonstrable; idle state calm and alive per decision 7; 60 s numeric stability run clean; physics+render frame rate on desktop Chromium measured and recorded — **60 FPS here is diagnostic/aspirational, not a gate: falling short does not block W-3** (the only binding FPS gate is §7.2 at W-5/W-9).
- **Risks:** none. **Commit:** `lab: wave-field physics with displacement-refraction model (W-3)`.

**W-4** · P1 · Input layer — all approved input types

- **Problem:** pointer/mouse → impulses mapping for every approved input type (v1's pointerdown-only scope is superseded — Step-4 §4.4).
- **Evidence:** decision 8 (mouse), §2.1 gesture model (touch); A4 criteria.
- **Solution (`js/input.js`):** unified **Pointer Events** layer: (1) touch tap vs drag distinction (movement <8 px AND <250 ms = tap; crossing the drag threshold makes it a drag, never both); (2) drag wake = impulse trail along movement, strength ∝ velocity with safe clamping; (3) consecutive impulses supported; (4) multitouch capped at the W-3 limit (3 active sources); (5) desktop **mouse hover with no pressed button = subtle low-energy waves** (throttled, e.g. ≥40 ms between hover impulses, strength floor); (6) mouse drag = wake trail; (7) mouse click (stationary) = strong splash; (8) velocity-based intensity with clamping throughout; (9) coordinate conversion pointer↔simulation grid accounting for DPR and current cell size; (10) pointercancel / blur / loss-of-focus clears active pointers cleanly; (11) tap events exposed separately (for W-7's contract); lab page uses touch-action:none on the canvas — **lab-only pattern, not production**.
- **Files:** lab/ascii-water/js/input.js. **Dependencies:** W-3.
- **Acceptance:** every listed input produces the specified visible response on desktop Chromium (mouse) + emulated touch; multitouch 2–3 contacts tracked independently; tap callback fires with coordinates; cancellation leaves no stuck sources; event→next-frame latency measured by metrics.js (feeds §7.2 diagnostics).
- **Risks:** none. **Commit:** `lab: full pointer/mouse input model (W-4)`.

**W-5** · P1 · Performance matrix + adaptive quality — single policy

- **Problem:** prove the hard performance gate on the device matrix; define one adaptive ladder (v1's conflicting 14 ms/9 ms/30-frame/60-frame rules are superseded — Step-4 §4.5).
- **Evidence:** decision 13; §7.2 policy (binding, single version).
- **Solution (`js/quality.js` + `lab/ascii-water/performance-report.md`):** implement the **one quality ladder: 8 px high / 10 px medium / 12 px low** with the **one hysteresis policy — current documented values: downgrade one level when p95 frame time over the last 90 frames > 16 ms; upgrade one level when p95 over the last 600 frames < 11 ms; minimum 5 s dwell between level changes; never oscillate (one level per evaluation); if 12 px cannot sustain 30 FPS for 60 s → graceful static fallback frame** (entry/other functionality unaffected; **engaging the static fallback does NOT constitute passing the 30 FPS hard gate — it is the graceful degradation outcome, recorded as such**). These values are **engineering tuning parameters (v2.1)** — a single documented current value set, not frozen law: W-5 profiling validates them and may adjust them **once**, with rationale recorded in performance-report.md, and the tuned values propagated to ROADMAP (§7.2, W-2 hook note, this task) and IMPLEMENTATION-PLAYBOOK.md (§7.2-equivalent + affected prompts) **before W-6 begins — that propagation is the S1 checkpoint** (documentation-only; not an author gate, not an implementation task). DPR cap 1.5. Scanline/vignette/grain toggle tiers tied to ladder levels. Run the §7.2 diagnostic matrix: desktop Chromium (Kimi), physical mid-Android Chrome + physical iPhone Safari (**PENDING-AUTHOR — author devices, exact procedures in the playbook §7.10; never marked passed without actual collected data**). **Hard gate: ≥30 FPS sustained for 10 continuous minutes on each of the three devices.** 55 FPS is a target, not a minimum. WebGL remains contingency only: if Canvas 2D fails the 30 FPS matrix after optimization → record evidence, stop the Canvas acceptance path, report for D-7 (explicit authorization required — never silently implement WebGL).
- **Files:** lab/ascii-water/ only. **Dependencies:** W-4.
- **Acceptance:** performance-report.md filled per §7.2 for every environment actually tested; 10-min desktop run recorded by Kimi; physical-device sections filled from author-collected data or left PENDING-AUTHOR; adaptive ladder demonstrated stepping down under 4× CPU throttle and recovering after; no oscillation; static fallback demonstrated and explicitly recorded as *not* a hard-gate pass; reduced-motion static frame cost measured and recorded (**<5 ms is a diagnostic target, not a gate**).
- **Risks:** device availability — queue discipline applies. **Commit:** `lab: performance matrix + adaptive quality ladder (W-5)`.

**W-6** · P1 · Loading architecture — **laboratory documentation only**

- **Problem:** define how the module loads without delaying the app shell/entry — as a validated plan, not production code (v1's production implementation scope is superseded — Step-4 §4.6).
- **Evidence:** decision 15; T8 loader pattern.
- **Solution (`lab/ascii-water/loading-plan.md` + lab harness):** (1) document the deferred-loading architecture: dynamic script injection of root-level `ascii-water.js`, promise-cached, triggered after cover interactive (requestIdleCallback or first pointer intent, whichever first), never on the critical path; (2) **build a lab harness that simulates delayed module loading** (artificial delay + failure injection) and verify the shell stays interactive before the module loads and survives module failure; (3) define caching/offline behavior: module joins the SW non-blocking extra-cache group (allSettled style, post-T3 design) — shell cache never depends on it; offline initialization required **after the asset has actually been cached**; never claim caching until the cache operation succeeds; (4) record payload size and failure handling; (5) document exactly how W-8 implements the plan (files, hook points, revert boundary).
- **MUST NOT:** create production ascii-water.js; modify index.html, script.js, sw.js; add a production loader; register a production global; change production cache groups.
- **Files:** lab/ascii-water/ only. **Dependencies:** W-5 (measurements feed the plan).
- **Acceptance:** loading-plan.md complete (architecture, cache behavior, failure modes, W-8 implementation plan); lab harness demonstrates shell-interactive-before-module and graceful module-failure; payload figure recorded.
- **Risks:** none. **Commit:** `lab: deferred-loading architecture + simulation harness (W-6)`.

**W-7** · P1 · Gesture contract — **lab verification only**

- **Problem:** prove the approved gesture model end-to-end and specify its production contract (v1's production script.js edits are superseded — Step-4 §4.7).
- **Evidence:** decision 2 (B) + §2.1 model; T12 protection pattern.
- **Solution (`lab/ascii-water/gesture-contract.md` + lab implementation):** implement and verify in the lab: (1) short tap → entry signal + visible impulse at the original contact coordinates; (2) drag (crosses threshold) → wake/waves, never entry; (3) swipe-up → **not** entry; (4) mouse hover → subtle waves; mouse drag → wake; stationary click → strong splash + entry signal at click position; (5) multitouch cap; (6) cancellation handling; (7) **one physical touch never counted twice across pointerup/touchend/synthetic-click** — the arbitration reuses the T12 unified-channel pattern (pointerup with pointerType filtering, or touchend with synthetic-click suppression in the gesture window); (8) no entry delay waiting for water initialization — the impulse is fire-and-forget, queued if the module is not ready, dropped gracefully if it failed. Produce the contract document: event ownership (who listens, who consumes), coordinates passed to the water system, the exact production invocation (`window.__echoWater.drop(x, y, strength)` — guarded, never awaited by the entry handler; the production API takes **no radius argument — it applies a documented default radius**, recorded in the contract; the radius-capable `drop(x, y, strength, radius)` signature remains the internal lab API only), keyboard/non-gesture entry parity, reduced-motion behavior.
- **MUST NOT:** edit production script.js or any production file.
- **Files:** lab/ascii-water/ only. **Dependencies:** W-3, W-4; T12 completed (protection pattern exists to reuse).
- **Acceptance:** every model clause verified in the lab with a programmatic gesture→effect log (no ambiguous double effect); contract document complete enough that W-8 implements without design choices.
- **Risks:** none. **Commit:** `lab: gesture contract verification + W-8 integration spec (W-7)`.

**W-8** · P1 · Production integration — ASCII-WATER is the primary splash composition

- **Problem:** wire the validated water system into the cover as the primary visual surface (v1's "canvas behind the image" wording is superseded — Step-4 §4.8).
- **Evidence:** decisions 2, 8, 9, 15; W-1…W-7 outputs.
- **Solution:** (1) create root-level `ascii-water.js` (single module, self-registering `window.__echoWater = { init(canvas), destroy(), drop(x,y,strength), setReducedMotion(bool) }` — **production `drop` takes no radius argument: it applies the documented default radius from the W-7 contract; the radius-capable `drop(x, y, strength, radius)` signature remains the internal lab API only**, payload ≤25 KB min target PTV — justify in commit if exceeded); (2) index.html: canvas element in the cover section — **the ASCII-WATER canvas is the primary visible visual surface**; the night landscape is clearly readable as a character-rendered scene; (3) `Zastavka.jpg` appears as a **cropped or fragmented emblem within the composition** (CSS object-position/clip-path/mask on the unchanged file) — never an opaque layer that hides, replaces, or visually subordinates the water; the image file itself is never modified or deleted; (4) existing title/identity typography and the entry hint may remain as DOM above the canvas; (5) script.js: loader per the W-6 plan (after cover interactive, never blocking entry); cover lifecycle init/destroy; **gesture wiring per the W-7 contract**, with the tap/entry path executing **exactly this ordered sequence (v2.2, binding):** ① classify the gesture exactly once on the unified channel (tap vs drag vs swipe — never reclassified mid-gesture); ② record the original contact coordinates; ③ if the water module is ready, send the impulse at those coordinates; if it is still loading, queue a **single bounded impulse tied to the current entry attempt** (fire-and-forget); ④ call the existing entry start (`startSequence()`) **immediately — the entry never awaits module initialization or the impulse**; ⑤ if the module is ready, **or finishes initializing while the water is still visibly on screen**, the renderer processes the impulse on its next frame — the splash is then visible before the transition covers the water; ⑥ freeze the canvas to its current frame **only when the existing transition actually visually covers the water**; ⑦ `destroy()` the water instance after the transition completes (no persistent cost). **Late/failure behavior (v2.2, binding):** if the transition covers the water before the module becomes ready → the queued impulse is DISCARDED; if the module fails → DISCARDED; a late initialization never displays an old splash on a later screen or entry attempt; the existing `isStarted` guard remains intact; the entry sequence is never delayed, restarted, or cancelled because of the water module. **Two distinct guarantees:** the entry gesture and the entry sequence are guaranteed to work immediately, independent of the water module; a visible splash is guaranteed only when the module is ready in time — otherwise best-effort and safely discarded; drag = waves only; mouse hover = subtle waves; **the touchend swipe-up entry shortcut is retired** (narrow D-8 amendment: sequence unchanged, tap = single touch entry gesture); isStarted guard unchanged; keyboard and existing non-gesture entry affordances unbroken; T12's unified-channel protection reused — no competing global event system; (6) style.css: cover layering + emblem treatment + reduced-motion static water frame with a usable entry path; (7) sw.js — **two distinct mechanisms, not conflated (v2.1):** the module joins the **best-effort EXTRA precache group** (allSettled style per the W-6/T3 design — shell installation never depends on it) **and**, where appropriate, the **code-fetch (network-first) strategy** covering ordinary page requests for the module; the first is the install-time precache attempt, the second is the runtime fetch strategy — the diff states both explicitly, and the module is **never claimed cached until the cache operation has actually succeeded**; shell preserved even if the water asset is unavailable; (8) canvas freeze → transition cover → destroy() timing is steps ⑥–⑦ of the ordered sequence in (5); the existing glitch/flash covers the transition; frames frame-01…07 untouched; T14 surge hook emits an impulse burst; (9) entry sequence internals and timing unchanged.
- **Files:** ascii-water.js (new), index.html, script.js, style.css, sw.js. **Dependencies:** **Batch 1 (T1, T2, T4, T3, T7), T8, T9, T12, T13, T14, W-2…W-7** — S3 gate. Explicitly not dependent on T11/T17.
- **Acceptance:** cover shows the water composition as primary surface; entry fires immediately on tap regardless of module readiness (no lost/delayed gestures); splash at the tap point visible before the transition covers **when the module is ready in time — and the late-module path demonstrably discards the queued impulse without delaying entry and without showing an old splash on a later screen or entry attempt (v2.2 — a splash is never promised where the module cannot be ready before the transition covers the water)**; drag/hover behaviors per contract; swipe-up no longer enters; module failure → cover still fully usable; offline after actual caching works; reduced-motion static frame + entry; single physical touch = one tap (programmatic); module load never delays shell interactivity (cold-load trace); the whole task reverts as a single commit without touching the lab prototype; §7.2 water diagnostics recorded in production context.
- **Risks:** the largest single-surface change — mitigated by the S3 gate and the single-commit revert boundary. **Commit:** `feat: ASCII-WATER primary splash composition + unified entry gestures (W-8)`.

**W-9** · P1 · Final verification of the integrated candidate

- **Problem:** prove the water system on the integrated development-branch candidate ("production build" wording superseded — this is a static site with no build pipeline; Step-4 §4.9).
- **Evidence:** §7.2/§7.3.
- **Solution:** serve the development branch locally in a production-like static hosting context (playbook §7.9); execute the water subset of §7.3 + the full §7.2 matrix in the integrated context; separate the three verification types explicitly: (1) automated/local browser checks by Kimi; (2) physical-device checks by the author — recorded PENDING-AUTHOR until actual results are supplied; (3) post-deployment checks by the author after publishing. Write `docs/ascii-water-verification.md`. **W-9 never deploys, publishes, or pushes.**
- **Files:** docs/ascii-water-verification.md (new) only. **Dependencies:** W-8.
- **Acceptance:** every §7.2 row PASS (measured), or PENDING-AUTHOR (device), or marked with deviation + rationale; full §7.3 regression green on the same candidate; report committed.
- **Risks:** none. **Commit:** `docs: ASCII-WATER integrated-candidate verification (W-9)`.

---

## 5. Priorities and execution sequence

**Track 0 + Track 1 — canonical internal order (binding within the track):**

| Step | Tasks | Gate to proceed | Tests after each task |
| --- | --- | --- | --- |
| Track 0 | B-0 | baseline committed | B-0's own record |
| Batch 1 | T1 → T2 → T4 → T3 → T7 | each task's acceptance green | task acceptance + its regression list + run-static subset |
| Batch 1.5 | T8 | acceptance green per its scoped criteria — the known meta failure removed IF B-0 reproduced it; **no blanket fully-green promise** (v2.2: full static green is claimed only when every failure recorded at B-0 has actually been resolved) | T8's full acceptance (offline, legacy-save fixtures, empty-chapter paths) |
| Batch 2 | T9 → T11 → T12 → T13 → T14 → T17 | acceptance green | acceptance + regressions + run-static |
| Batch 3 | T6 → T18 → T15 → T16 → T19 → T20 → T22 → T25 → T26 | acceptance green | acceptance + regressions + run-static |
| Evaluated | T23 (hard dep: T2; final slot: **after T26** — Batch 3 closes T25 → T26 → T23, before S4) | verdict recorded | A/B evidence + frame cost |

**Track 2 — separate workstream, scheduled dynamically (v2.2, binding):**

| Rule | Content |
| --- | --- |
| Internal order | W-1 → W-2 → W-3 → W-4 → W-5 → W-6 → W-7 → W-8 → W-9 — **strict, never reordered** |
| Start | Any time **after B-0** — there is **no mandatory dependency between T23 and W-1** |
| Interleaving | May interleave **sequentially** with Track 1 on the same branch; two tasks are never implemented simultaneously against the same working tree; shared-file conflicts are serialized |
| Next-task selection | **Dynamic**: the exact next task is selected from the runnable set — all HARD prerequisites committed, internal workstream order respected, no shared-file conflict with work in flight. The tables above/below are canonical reference layouts, **not a global execution lock** (the same applies to the IMPLEMENTATION-STATUS.md ledger row order) |
| Gates | per-task acceptance; S1 after W-5 (documentation-only tuning sync inside the W-5 commit, §1); **S3 before W-8** (technical — PENDING-AUTHOR device results may remain pending, §1) |
| W-8 boundary | W-8 waits for S3 and its exact HARD dependencies (Batch 1 + T8 + T9 + T12 + T13 + T14 + W-2…W-7) — **not for unrelated Track 1 tasks such as T11, T17, or T23** |
| Tests | per-task acceptance; §7.2 diagnostics at W-5/W-9 |

Nothing waits on an author answer — the 19 decisions resolved every gate; device-dependent verifications queue as PENDING-AUTHOR without blocking (decision 16).

**Why this order:** B-0 first (no code before a recorded baseline). Batch 1 fixes the boot spine while the tree is clean (T1 404 → T2 CSS parse gate → T4 hygiene → T3/T7 SW, sequenced for their shared SW regression surface). T8 immediately after (Batch 1.5): it removes the stale-meta tooling and the known meta failure (if B-0 reproduced it) before user-facing work builds on the tooling, and its loader pattern feeds W-6/W-8. Batch 2 orders user-facing work by shared surfaces (T9 before T14 on cover geometry; T13 before T16 on open/close paths) and puts T12/T13 before W-8 needs their gesture protections. Batch 3 sequences quality work by surface (T18 after T6, T22 after T20, T25/T26 after T2). T23 executes after T26 — final Track 1 order …T25 → T26 → T23 (quiet CSS surface; T25/T26/T23 share the CRT/effect surface, so the experiment runs once that surface is fully quiet). Track 2 is internally strict (each W builds on the previous artifact) with W-8 last but one because it integrates everything.

## 6. Kimi Code instructions

The executable, self-contained, copy-paste prompt for every active task (**32 prompts**: B-0 + the 22 active T-tasks + W-1…W-9) lives in **IMPLEMENTATION-PLAYBOOK.md §8** — that is the single source for prompts. Each §4 row above is the technical basis (problem/evidence/solution/acceptance) the prompt expands; TASKS.md v4.2 carries the deep diagnosis and regression lists. No task prompt exists for T5 (obsolete), T10 (cancelled), T21 (nonexistent), T24 (superseded). The task-execution loop (clean tree → re-locate symbols → minimal change → task checks → regression subset → run-static → full-diff review → one commit → status update per the one-task-lag SHA rule) is defined in playbook §7.6 and applies to every task.

**Historical-audit precedence note (v2.1, binding):** echo-audit.md is the evidence archive, not an instruction source. Wherever an audit-era text conflicts with the current documents, the current documents win. Specifically these audit passages are **historical evidence only, never active instructions:** audit §11 (the old water model), §13 A2 (glyph-corruption ideas — forbidden by decision 11), §17 A1 (D-10 option A — superseded, D-10 = B), §17 A5 (the old film-hint wording), §17 A7 (the old beckon design — superseded by decision 10), §19 (D-10 option A and the GitHub Action idea), §20 (the entry-flow alternatives — G-1 = B resolved), §§21–22 (the old priority/batch scheme), §24 (the 30 FPS figure now binding as the §7.2 hard gate). Implementation follows ROADMAP v2.2 + DECISIONS v4.2 + TASKS v4.2 + PLAYBOOK v1.2 only.

## 7. Testing plan

### 7.1 Baseline discipline

- B-0 records the actual pre-implementation baseline; every task runs its own acceptance + affected baseline subset; any **new** unexplained failure stops the line (decision 16 stop conditions).
- **T8 removes the chapters-meta tooling and its freshness check** (D-10 B) and thereby eliminates the known meta failure **if B-0 actually reproduced it** — T8 does NOT silently absorb unrelated baseline failures (v2.2). Audit-known expected baseline issue: chapters-meta.js freshness mismatch (6808 vs 6807) — to be reproduced and captured during B-0; it is unconfirmed until B-0 actually reproduces it, and B-0 may additionally record OTHER pre-existing failures — a failure present in B-0's record is pre-existing regardless of whether it is the anticipated meta issue. Until B-0 runs, no failure set is asserted. Unrelated pre-existing failures remain documented and receive separate disposition or task assignment. A task must not introduce any new unexplained failure. The static baseline is claimed fully green only when every failure recorded at B-0 has actually been resolved.
- run-static.ps1 runs after every task commit, compared against B-0 and the current documented baseline; the full §7.3 regression runs at S3 and S4.

### 7.2 Performance policy (single version — Step-4 §4.5, decision 13)

**The only hard performance acceptance threshold:** ASCII-WATER sustains **≥30 FPS for 10 continuous minutes** on each of: (1) desktop Chromium, (2) physical mid-range Android + Chrome, (3) physical iPhone + Safari. **55 FPS is a target, not a minimum.** Physical-device rows are PENDING-AUTHOR until the author's collected data arrives (procedures: playbook §7.10) — never marked passed otherwise.

**Diagnostic measurements (valuable, not hard gates):** module payload; time-to-first-water-frame; time-to-first-responsive-touch; mean FPS; p95 frame time; dropped-frame ratio; 10-minute stability trace; adaptive-quality behavior; cold-load behavior; offline behavior; reduced-motion behavior. Recording methods (rAF timestamps, Performance API marks, DevTools network/trace, CPU throttle) are specified in playbook §7.9/§7.10.

**Binding non-FPS requirements:** water loading never delays the app shell or entry; reduced-motion renders a static frame with a usable entry path; offline initialization works after the asset has actually been cached (never claimed before the cache operation succeeds).

**The one quality ladder:** 8 px high / 10 px medium / 12 px low. **The one hysteresis policy — current documented values:** downgrade one level when p95 frame time over the last 90 frames > 16 ms; upgrade one level when p95 over the last 600 frames < 11 ms; minimum 5 s dwell between changes; one level per evaluation (no oscillation); 12 px failing 30 FPS for 60 s → graceful static fallback — **note: engaging the static fallback is the degradation outcome, NOT a pass of the 30 FPS hard gate**. DPR cap 1.5. These values are **engineering tuning parameters (v2.1):** one documented current value set appears in W-2 (hook), W-5 (validation), this section, and every prompt — no conflicting variants exist. W-5 may tune them once with recorded rationale; the tuned set is propagated to ROADMAP + PLAYBOOK **inside the W-5 commit** before W-6 — that propagation is the S1 documentation-only checkpoint (W-5's single conditional file-scope exception, v2.2; no separate S1 task or commit).

### 7.3 Final regression (whole site; runs at S3 and S4 on the integrated development-branch candidate)

1. **Boot:** fresh reader and returning reader (saved progress → TOC) paths; zero console errors; zero 404; fonts applied.
2. **Entry:** tap starts the unchanged entry sequence (cover → glitch → title → film); water splash at the tap/click point; drag-only waves; mouse hover waves; click splash; swipe-up does **not** enter; keyboard/non-gesture entry intact; entry fires even if the water module is not ready or failed.
3. **Film:** full unskipped path; double-tap skip from every phase; single touch counted once; hint shows exactly «Дважды коснитесь, чтобы пропустить», readable and static under reduced-motion.
4. **TOC:** all 84 items; reveal ≤2.5 s with perceptible stagger (`200 + i*20`); read/current states; electric-glitch/analog-drop with frozen timings; menu swipe open/close; Esc/focus behavior.
5. **Chapter:** open via TOC, `?ch=N`, direct URL, next-chapter swipe; all VOICE modes + unmarked + unknown-token fallback; **PHOTO subsystem regression only**; resize sheet; settings persistence; progress line.
6. **Loading:** chapter loading via ensureChapters; deep links; empty-chapter prevention on every path; legacy `echo_state` (v-less, out-of-range lastChapter, corrupt) validated safely with progress preserved.
7. **Overlays:** menu/settings/resize/photo/install — modality matches the T16 inventory; focus return; Esc ordering; safe-area layout; cover centering ±1 px emulated.
8. **Service Worker:** install → activate → purge → single controllerchange reload; version bump simulation (T3); registration before window.load (T7); offline reload; water module offline after actual caching; shell survives missing water asset.
9. **Accessibility:** reduced-motion everywhere (water static, film hint static-readable, VOICE reduced, stagger immediate); noscript page; keyboard walkthrough.
10. **Static checks:** run-static.ps1 reported fully green **only when every failure recorded at B-0 has actually been resolved** (v2.2 baseline logic); CSS parse check green; no `navigator.vibrate`; no dead `glyph-utils.js` reference; **no active implementation references to `chapters-meta.js` or `CHAPTERS_META` in runtime code, Service Worker configuration, active tests, or generators** (v2.2 scoped wording — historical documentation, decision-history, and evidence-archive references are permitted and intentionally preserved); no 3D/audio/haptics introduced.
11. **ASCII-WATER:** §7.2 hard gate + diagnostics in the integrated context; adaptive ladder behavior; input latency; offline behavior.
12. **Outcome separation:** results recorded as (a) Kimi automated, (b) Kimi local-browser, (c) PENDING-AUTHOR physical-device, (d) author-only post-deployment.

---

## 8. D-10 — RESOLVED (Step-4 decision 1: option B)

chapters-meta.js, tests/build-meta.ps1, and the freshness-check block in tests/run-static.ps1 are removed by T8; the no-metadata branch is implemented (optimistic TOC, promise-cached ensureChapters, emptiness from actual loaded text, legacy lastChapter validated post-load, chapters.js kept in SW core for offline first-open). Historical rationale: option A's permanent freshness coupling had already failed once in practice (stale 6808/6807 record); B removes the coupling, one request, and the tooling dependency at the one-time cost of optimistic rendering + runtime validation. **T5 is obsolete.** No A-branch instruction survives.

## 9. G-1 — RESOLVED (Step-4 decision 2: option B; narrow D-8 amendment recorded)

**The approved gesture model:** *Touch/pen:* short tap starts the existing entry sequence and creates a visible water impulse at the original contact coordinates; a movement crossing the drag threshold is a drag — wake and waves, never entry; swipe-up does not start the entry sequence; no entry delay to wait for water initialization. *Mouse:* hover without a pressed button → subtle low-energy waves; drag → wake trail; stationary click → strong splash + entry at the click position. *Shared:* one coherent Pointer Events arbitration model; one physical touch never counted twice (pointerup/touchend/synthetic-click protection reusing T12's pattern); keyboard accessibility and existing non-gesture entry affordances unbroken; the entry sequence itself (first-time: cover → glitch → title → film; returning readers with progress → TOC) and its timing unchanged — the decision changes the entry **trigger**, not the sequence.

**D-8 amendment (narrow, as approved):** the swipe-up entry shortcut is retired; tap becomes the single touch entry gesture; nothing else about D-8 changes. The v1 five-option analysis is preserved in TASKS.md v4.2 history; options 1/3/4/5 are rejected.

## 10. The 19 final author decisions — application map

| # | Decision | Applied in |
| --- | --- | --- |
| 1 | D-10 = B (remove meta tooling) | §4/T8, §8; T5 obsolete |
| 2 | G-1 = B (tap=entry+splash, drag=waves, swipe-up retired) | §9, §4/W-7, W-8 |
| 3 | Film hint exactly «Дважды коснитесь, чтобы пропустить» | §4/T12 |
| 4 | Hybrid spatial character density | §4/W-1, W-2 |
| 5 | Night-water landscape: shoreline, light column, mirrored reflection | §4/W-1, W-2 |
| 6 | Wave height → displacement/refraction primary; brightness/density secondary | §4/W-3 |
| 7 | Calm idle, rare small perturbations, no rain | §4/W-3, W-1 |
| 8 | Mouse hover subtle waves; click strong splash + entry | §4/W-4, W-7, W-8 |
| 9 | Zastavka.jpg = cropped/fragmented emblem; water primary; file untouched | §4/W-8 |
| 10 | T14 = IDLE→SURGE→LULL + double-outline beckon ring | §4/T14 |
| 11 | VOICE strictly per approved choreography; no glyph noise | §4/T11 |
| 12 | T23 auto-verdict on evidence | §4/T23 |
| 13 | Hard gate: ≥30 FPS × 10 min × 3 devices; 55 = target; rest = diagnostics | §7.2, §4/W-5 |
| 14 | Author has physical iPhone + Android; precise procedures; no pretend-testing | §11, playbook §7.10 |
| 15 | W-1…W-7 lab-only; W-8 sole production wiring | §1, §4/W-6, W-7, W-8 |
| 16 | Autonomous execution; one task = one commit; defined stop conditions; batch reports | Global rule 8, playbook §11-equivalent |
| 17 | Kimi Code Desktop on Windows | playbook §7.1 |
| 18 | Repo already in workspace; never clone | Global rule 1, playbook §7.1 |
| 19 | Network only for official font binaries + licenses; verify upstream | Constraints, §4/T20, T22 |

## 11. PENDING-AUTHOR queue

Checks Kimi cannot truthfully perform. Never marked PASS. They do not block autonomous progress (decision 16); the full queue is presented at completion.

| Item | Origin task | Device / environment | Procedure (detail: playbook §7.10) | Status |
| --- | --- | --- | --- | --- |
| Cover centering + safe-area | T9 | physical iPhone, Safari (iOS 16+) | cover + menu + sheets, portrait/landscape, bar shown/hidden | PENDING-AUTHOR |
| Film double-tap skip | T12 | physical iPhone Safari + Android Chrome | skip from each phase; single tap inert; hint legible | PENDING-AUTHOR |
| NVDA / VoiceOver overlay pass | T16 | NVDA (Windows) + VoiceOver (iOS) | keyboard/SR walkthrough of regression rows 4, 7, 9 | PENDING-AUTHOR |
| iOS Safari genuine-weight check | T22 | physical iPhone Safari | .book-title renders genuine Medium/Bold, no faux stroke | PENDING-AUTHOR |
| Water 10-min performance — Android | W-5/W-9 | physical mid-range Android + Chrome | lab page + integrated candidate; 10-min FPS capture per §7.2 hard gate | PENDING-AUTHOR |
| Water 10-min performance — iPhone | W-5/W-9 | physical iPhone + Safari | same | PENDING-AUTHOR |
| Touch latency + gesture behavior | W-5/W-9 | both physical devices | tap/drag/multitouch/hover-equivalents; latency observation | PENDING-AUTHOR |
| SW/offline on physical devices | W-9 | both devices | requires a trusted secure context; if LAN HTTP cannot provide it, stays open with exact remainder stated | PENDING-AUTHOR |
| Post-deployment checks | (author-only) | live site after the author publishes | cache-bypassed load, version check, smoke path | PENDING-AUTHOR |
| T11 three-mode VOICE visual review (PA-11) | T11 | author's eyes, any device | side-by-side capture of standard/strong/whisper; distinctness + readability judgment | PENDING-AUTHOR |
| T14 idle rhythm + beckon ring visual review (PA-12) | T14 | author's eyes, any device | observe 2–3 IDLE→SURGE→LULL cycles; ring contrast judgment on the real cover art | PENDING-AUTHOR |
| W-8/W-9 integrated composition review (PA-13) | W-8/W-9 | author's devices | cover composition (water primary + emblem + typography) and entry feel on the integrated candidate | PENDING-AUTHOR |

Visual-review items (PA-11, PA-12, PA-13) are judgments only the author can make, but like every PENDING-AUTHOR item they **never block autonomous execution** — tasks complete on their programmatic acceptance and the review queue is presented at the end (decision 16).

---

## Closing notes

- **Traceability:** every §4 task cites its evidence anchor and repo reference; every prompt (playbook §8) maps 1:1 to a §4 row; every resolved decision maps in §10; every device-dependent check is in §11.
- **Frozen areas** (never touched by any task): chapters.js content and markers; photographs and the PHOTO mechanism (regression-only, T16 accessibility parity excepted); frames frame-01…07; Zastavka.jpg file; 3D objects; game features / new reading mechanisms; new periodic TOC events; existing periodic TOC timing; entry sequence beyond the approved trigger change; DESIGN-PROPOSALS.md as a source; author constraints themselves; `PUBLISHED_AT`; `img_06.jpg`; reading-column geometry.
- **No invented numbers:** every threshold is a FACT anchor, a binding approved value, or marked PTV. The §7.2 ladder/hysteresis values are engineering tuning parameters with a single documented current value set (W-5 may tune once, propagated via S1).
- **Kimi Code never publishes** — no deploy, no push, no push-echo.cmd, no live-site action. Local commits on the development branch only. The author alone publishes.