# DECISIONS.md — ЭХО: author decisions · v4.2

v4.2 (2026-11-05): final corrective reconciliation — D-4 impact restated (T20 strictly before T22); D-7 impact updated (T24 is a superseded historical task, not an active implementation path; the contingency lives in W-5/W-9 and ROADMAP §7.2); D-8's DESIGN-PROPOSALS-related instruction explicitly marked SUPERSEDED — NOT AN ACTIVE INSTRUCTION; D-6 scope clarified (T9/T14 are not W-1…W-7 lab dependencies; both are HARD prerequisites of W-8); D-9 verification note clarified (physical-device verification remains PENDING-AUTHOR; emulation does not replace it). All 19 author decisions preserved and closed; none reopened or softened.

v4.1 (2026-11-05): final reconciliation — historical pre-resolution material explicitly marked as superseded non-instructions; D-7 formulation precision; D-1 WCAG wording confirmed; D-3 property set synchronized with the final T11 specification. No decision reopened.

v2 (2026-11-04): Stage-1.5 synchronization. **D-1…D-9 are RESOLVED by the author** — each entry records the actual decision and the document/task that now carries it. **D-10 is the single new open item**, discovered during Stage-1.5 verification (chapters-meta.js has no runtime consumers). Resolved items are kept for the record; do not reopen them without new facts. Audit evidence lives in echo-audit.md (§25 for Stage-1.5 verifications); task mechanics in TASKS.md v2.

v3 (2026-11-05): Step-2/Step-3 directives applied — **D-6 SUPERSEDED** (ASCII-WATER is now the interactive foundation of the splash screen; history preserved in the entry); **T10 cancelled** (recorded below); frozen areas recorded (photo subsystem, splash frames, 3D objects, title animation); D-1 documented with WCAG precision; **D-10 remains the only open D-item**. New open non-D item: **G-1** (ASCII-WATER interaction vs the cover start gesture — analysis and recommendation in ROADMAP.md §9; requires author decision, D-8 must not be changed without it).

v4 (2026-11-05): **Step-4 final resolutions applied — no open D-items and no open non-D items remain.** D-10 closed (option B); G-1 closed (option B) with a narrow D-8 amendment; the film-skip hint wording fixed; the ASCII-WATER visual direction, wave behavior, mouse behavior, and Zastavka role fixed; T23 converted to an evidence-based auto-verdict; the performance acceptance policy fixed (single hard gate); Kimi Code autonomy and device access recorded. Full application map: ROADMAP.md v2.2 §10. Historical entries below are preserved, including superseded ones.

---

## D-1 · Viewport zoom policy — RESOLVED (FINAL): zoom stays locked

**Author's decision:** the zoom prohibition is **final**. `index.html:5` keeps `maximum-scale=1.0, user-scalable=no`; the `tests/run-static.ps1` viewport check (≈55–58) is preserved byte-identical and must keep failing any change.
**Recorded as:** a deliberate design constraint with a known accessibility trade-off accepted by the author. 〔v4.1 precision〕 WCAG 2.2 SC 1.4.4 and SC 1.4.10 **were not tested**; neither compliance nor non-compliance is asserted anywhere. The Stage-1 recommendation to unlock zoom is withdrawn and must not be re-proposed.
**Compensating check (Stage 1.5, done):** the "Аа" text controls were verified at maximum size as the sanctioned enlargement path — desktop 1440×900 and mobile 390×844, size step 3 (computed 20.8 px / line-height 1.8): no horizontal overflow, no clipped paragraphs, reader sheet fits the viewport, chapter scroll/nav/bar auto-hide all functional. The only defect found is the cosmetic 0 px gaps in the sheet's size row — already tracked as part of T2 (class-(a) CSS defect, style.css:2101/2108/2170).
**Impact:** T12 carries no zoom-policy logic and no touch-action changes; nothing else affected.

## D-2 · "New chapter" badges — RESOLVED: feature discontinued

**Author's decision:** the badge mechanism is **discontinued entirely** (not repaired, not re-dated).
**Recorded as:** T6 rewritten as a gradual-removal task (P2, READY) with a Stage-1.5-verified complete consumer map: script.js:107/117/309–317/350–351/386–388/393/716–720/757; style.css:2249/2258/2432; README.md:15; tests/browser/unit-state.html:74–79,101–102, effects-lab.html:43, focusprobe.html:17. `PUBLISHED_AT` in chapters.js is **not touched** (author's data, remains as an inert record); chapter content untouched; old echo_state saves remain loadable (unknown keys are tolerated — FACT: unit-state.html:79).
**Impact:** T6 (removal). No replacement signal is introduced.

## D-3 · VOICE mode hierarchy — RESOLVED

**Author's decision:** the hierarchy is: **unmarked `{{VOICE}}` → redesigned standard** (T11); **explicitly marked strong (`{{VOICE:strong}}`) → aggressive**; other modes keep their purposes (`:standard` → redesigned standard, `:whisper` → whisper).
**Stage-1.5 registry (FACT, structural counts only, no text read):** 43 markers, all balanced — `{{VOICE:standard}}` ×37 (ch0:3, ch4:3, ch20:5, ch47:4, ch81:10, ch82:12); unmarked ×6 (ch20:2, ch31:1, ch33:2, ch47:1). **No `:strong` convention exists today**; the dispatch (script.js:1170–1180) supports standard/whisper/default→aggressive; the 6 unmarked events currently render aggressive and will render the redesigned standard after T11 unless the author re-marks them `:strong` (an editorial act outside T11's scope).
**Animation constraints recorded in T11 (hard):** no layout-geometry changes; **permitted animated properties: transform, opacity, clip-path — only** 〔v4.1: the earlier "filter with justification" permission is withdrawn to match the final T11 specification and decision 11〕; no neighbor displacement/overlap/resize; acceptance includes zero Layout Shift and stable neighbor geometry. Decision 11 additionally forbids any glyph distortion or character-noise effects.
**Impact:** T11.

## D-4 · Golos Text weights — RESOLVED: option A (genuine files)

**Author's decision:** ship genuine Golos Text Medium (500) and Bold (700) woff2, cyrillic+latin, OFL — no synthesis.
**Recorded as:** T22 is now **READY** (was CONDITIONAL). Acceptance requires verification in DevTools → Fonts panel that the genuine files render (not the 400 file), plus a visual check. The earlier "+40–60 KB" was an estimate; actual file sizes must be recorded in the commit message when the files are obtained.
**Impact:** T22 (READY); T20 — 〔v4.2〕 **T20 must be completed and committed BEFORE T22 begins. Its license files must already be present when T22 adds the font binaries.**

## D-5 · Unused image img_06.jpg — RESOLVED: keep, no action

**Author's decision:** img_06.jpg stays (reserved). No task created; the Stage-1 "remove" option is closed.

## D-6 · ASCII-WATER placement — SUPERSEDED (2026-11-05, author's Step-2 direction)

**History (original decision, 2026-11-04):** the future placement was the **cover/splash behind the existing cover graphics**; the prototype stayed an independent lab page; no integration task was created at that time.
**Superseding direction (author, Step 2):** ASCII-WATER is now **the foundation of the splash screen itself** — the central visual element of the splash composition, physically responding to user interaction (splashes and waves at the touch point). It is not a background behind the existing image and not a separate menu-reachable page. The previous "behind the existing graphics" placement no longer governs. D-7 **remains in effect**: WebGL only if Canvas 2D fails the agreed performance matrix.
**Impact:** ROADMAP.md Track 2 (W-series) carries the work; integration is a separate milestone gated on core repairs, the loading architecture, and the author's gesture decision (open item G-1, ROADMAP §9/§10). T9/T14 remain related in subject. 〔v4.2 scope clarification: **T9 and T14 are NOT technical dependencies of the W-1…W-7 laboratory prototype. Both ARE HARD prerequisites for W-8 production integration, as specified in ROADMAP §1.**〕 〔v4.1〕 **G-1 is since RESOLVED (Step-4 decision 2: tap = entry + splash at tap point; drag = waves; swipe-up retired — see the Step-4 resolutions section). The "open item G-1" reference above is historical.**

## D-7 · WebGL branch for ASCII-WATER — RESOLVED: only if Canvas 2D is insufficient

**Author's decision:** a WebGL variant is considered **only if** the Canvas 2D implementation fails the binding hard gate — **≥30 FPS sustained for 10 continuous minutes on each of: desktop Chromium, physical mid-range Android Chrome, physical iPhone Safari** — after documented optimization. Otherwise the work stays Canvas 2D. 〔v4.1 formulation precision: "30+ FPS" → "≥30 FPS"; the three-device matrix made explicit.〕
**Impact:** 〔v4.2〕 The WebGL contingency applies to the W-series Canvas 2D implementation, principally W-5/W-9 and ROADMAP §7.2. **T24 is a superseded historical task, not an active implementation path.** WebGL requires the separately defined performance-failure condition and explicit author authorization.

## D-8 · Entry ceremony — RESOLVED: current flow is the default active design

**Author's decision:** the **current entry flow** (cover → glitch → title → film on every fresh visit; returning readers with progress skip to TOC) is the **default active design**. No entry-flow tasks are created; the Stage-1 "ceremony-once-per-session" proposal is closed. 〔Historical, v4.2 marked: "DESIGN-PROPOSALS (Phase 2 of Stage 1.5) must treat the current flow as the baseline to evaluate against, not as a problem to fix." —〕 **SUPERSEDED — NOT AN ACTIVE INSTRUCTION.** The current entry ceremony remains the default active design; DESIGN-PROPOSALS.md is not part of the workflow.
**Impact:** no task. 〔v4.2: the former "DESIGN-PROPOSALS constraint" is not an active instruction — see above.〕
**Amendment (2026-11-05, Step-4 decision 2 — narrow):** the entry **flow** is unchanged, but the touchend swipe-up entry shortcut is retired and tap becomes the single touch entry gesture; the tap additionally creates a water impulse at the contact coordinates (W-8). Nothing else about D-8 changes — sequence, timing, and the returning-reader TOC path are untouched.

## D-9 · Film skip scope — RESOLVED (confirmed): skip everything

**Author's decision:** confirmed — double tap skips the **entire remaining sequence** to exactly the same final state the sequence would reach on its own (title or TOC per branch). The "assumption" label is removed from T12; this is now a confirmed requirement.
**Impact:** T12 (acceptance updated). 〔v4.2: **T12 physical iOS Safari and Android Chrome verification remains PENDING-AUTHOR until the author supplies actual device results. Emulation does not replace physical-device acceptance.**〕

---

## D-10 · chapters-meta.js future — RESOLVED (2026-11-05, Step-4 decision 1): option B — remove meta entirely

**Resolution:** the author chose **B**. chapters-meta.js, tests/build-meta.ps1, and the freshness-check block in tests/run-static.ps1 are removed by T8 (D-10 B branch — the only branch). T5 is obsolete (no prompt, no execution). T15's meta-gate step and T3's CODE_FILES meta addition do not apply. **Historical record below preserved as decided context.**

**〔PRE-RESOLUTION HISTORY — SUPERSEDED — NOT AN ACTIVE DECISION OR IMPLEMENTATION INSTRUCTION. The final resolution is B, recorded above this entry's options. The option texts below are preserved as decision context only.〕**

**Essence:** Stage-1.5 verification established (FACT, full-text consumer search over the pinned snapshot): **`CHAPTERS_META` has zero runtime consumers.** The runtime chapter model derives emptiness from `chapterTexts[index]` itself (script.js:321–328); the only consumer of chapters-meta.js anywhere is the freshness check in `tests/run-static.ps1:59–69` (regenerate-and-compare via `tests/build-meta.ps1`). The file is also currently stale (audit D6: chapter 82 length 6808 vs actual 6807), which is precisely the failure mode of a redundant derived artifact. The question: what should chapters-meta.js be when chapters.js becomes lazy (T8)?
**Option A — keep a minimal generated meta.** Reduce chapters-meta.js to what pre-load boot genuinely needs (chapterCount + emptyIndices; lengths optional), regenerate via build-meta.ps1 (T5 executes), keep the run-static freshness check, and let pre-load emptiness consumers (initProgress, TOC `.empty` styling, progress counts) read it before chapters.js arrives.
**Option B — remove meta entirely (preliminary recommendation).** Delete chapters-meta.js, build-meta.ps1, and the run-static meta check. T8 implements the "optimistic TOC + await-on-open" model: TOC renders immediately from the hardcoded HTML titles; every chapter *open* path (TOC click, `?ch=` deep-link, swRoute restore, prev/next, resume) awaits `ensureChapters()` and validates emptiness against the real `chapterTexts`; emptiness styling and progress counts apply once chapters are loaded (the placeholder item dims a beat late — cosmetic only); `lastChapter` always points to a non-empty chapter by construction, so resume never needs pre-load emptiness.
**Comparison (evidence in echo-audit.md §25):**

- *Reliability:* B wins — single source of truth; the stale-artifact class (D6) disappears by construction. A keeps a derived copy that can silently drift again.
- *Loading:* B marginally wins — meta as a classic script adds a small (~2 KB) blocking request in the boot chain; B is neutral.
- *Complexity:* A keeps pre-load logic simpler (synchronous meta reads); B moves validation into async open paths — a moderate, well-bounded change confined to the paths listed above.
- *Maintainability:* B removes a generator, a generated artifact, and a guard check; A keeps all three but gains a publish-time freshness guarantee.
**Preliminary recommendation:** **B**, conditional on T8's await-discipline acceptance criteria passing (placeholder can never be opened; `?ch=` on an empty index rejected after load).
**Impact:** T8 is CONDITIONAL on this choice (branch A/B); T5 executes only under A; T15's meta-gate step applies only under A; T3's CODE_FILES addition of chapters-meta.js applies only under A.

---

## Step-2 / Step-3 author directives (2026-11-05) — recorded for the working documents

- **T10 CANCELLED.** The proposed additional periodic TOC sweep is rejected. The existing electric-glitch (per-item, ~15 s cycle) and analog-drop (whole-TOC, 25–40 s) remain; their frequency, duration, and triggering must not change; only visual quality may be improved (ROADMAP T25/T26). No new periodic TOC event. The former open question Q1 (T10 vs the existing disturbance) is resolved by this cancellation.
- **Photo subsystem frozen.** The {{PHOTO}} mechanism, highlighted-word styling, overlay behavior, and the photographs themselves are outside the scope of changes; no new photo mechanisms, no photograph processing. If a reproducible defect in accidental activation during text selection is evidenced, it is treated as a defect report, not a redesign opening.
- **Splash frames frozen.** frame-01…frame-07 are not redrawn or replaced; technical fixes that do not alter the images remain in scope.
- **3D objects excluded.** No 3D television receiver or alternative 3D objects.
- **VP-6 title animation not an active task.** Existing title behavior changes only for a specific, confirmed defect.
- **VOICE scope confirmed.** Distinct choreography for standard / strong / whisper (D-3 hierarchy stands); no marker edits; zero `:strong` markers today is an intentional content state, not a defect.
- **DESIGN-PROPOSALS.md removed from the workflow.** It is not a source for new proposals; useful technical findings are preserved in echo-audit.md and ROADMAP.md.
- **D-1 stands with precise documentation.** Zoom stays locked; the "Аа" max-size check is recorded as the sanctioned enlargement path, and WCAG 2.2 SC 1.4.4/1.4.10 are documented as not-tested (trade-off accepted by the author), neither claimed-passed nor asserted-failed.
- **D-10 was resolved at Step 4 (option B)** — see the D-10 entry and the Step-4 resolution section below.

---

### Closed at Stage 1 (for the record)

No other items were left open by the audit; the Stage-1 note "answering D-2 and D-4 unblocks T6 and T22" is superseded — both are now answered (T6 = removal; T22 = READY).

---

## Step-4 final resolutions (2026-11-05) — the 19 author decisions, recorded as binding

No open items remain. Application map with task-level impact: ROADMAP.md v2.2 §10.

1. **D-10 = B.** Remove chapters-meta.js, tests/build-meta.ps1, and the run-static freshness-check block; T8 implements the no-metadata branch. T5 obsolete.
2. **G-1 = B.** Tap starts the existing entry sequence and creates a water splash at the tap coordinates; drag creates waves only; swipe-up no longer starts the entry sequence. Recorded as the narrow **D-8 amendment** above: the sequence is unchanged; only the trigger set changed.
3. **Film-skip hint wording (final):** «Дважды коснитесь, чтобы пропустить». Shown per existing task timing; no persistent suppression flag; under reduced-motion the text stays visible as a static readable element.
4. **ASCII-WATER character model:** hybrid density — density varies spatially, never uniformly dense, never uniformly sparse.
5. **ASCII-WATER scene:** night-water landscape with a shoreline band, a distant light column, and a mirrored reflection below the waterline; procedural rendering.
6. **Wave response model:** wave height primarily causes geometric displacement/refraction of the reflected scene; glyph density and brightness respond secondarily.
7. **Idle water behavior:** calm, slowly moving surface with rare, small perturbations; no continuous rain, no constant ripple field.
8. **Mouse behavior:** hover without a pressed button creates subtle low-energy waves; a stationary click creates a strong splash and — when it qualifies as a tap — starts the entry sequence with the splash at the click point.
9. **Zastavka.jpg role:** appears as a cropped or fragmented emblem within the composition; the ASCII-WATER canvas remains the primary visual element; the source image file is never modified or deleted.
10. **T14 design:** IDLE → SURGE → LULL cycle and a high-contrast double-outline beckon ring — approved as specified; no further visual gate.
11. **VOICE:** implemented strictly per the approved ROADMAP choreography; no additional glyph distortion or character-noise effects anywhere.
12. **T23:** run the A/B experiment; adopt the ghost layer automatically only on clear visual improvement with no measurable performance or readability regression; otherwise discard and record the evidence. No further approval gate.
13. **Performance acceptance policy:** the single hard gate is ≥30 FPS sustained for 10 continuous minutes on desktop Chromium, a physical mid-range Android (Chrome), and a physical iPhone (Safari). 55 FPS is a target, not a minimum. All other measurements are diagnostics, not acceptance gates.
14. **Devices:** the author has a physical iPhone and a physical Android device; precise test procedures are prepared (IMPLEMENTATION-PLAYBOOK.md §7.10); Kimi never claims physical-device tests it did not perform.
15. **Lab/production split:** W-1 through W-7 are strictly laboratory work (W-7 prepares the gesture contract and lab verification only); **W-8 is the only task that wires the water system into production.**
16. **Kimi Code autonomy:** Kimi executes the approved roadmap autonomously — one task per commit, specified checks before each commit, no per-task approval requests; it stops on unexplained failures, data-loss risk, frozen-area conflicts, missing dependencies, unmet 30 FPS minimum after Canvas optimization, or genuinely unmade decisions; it reports after meaningful batches and at completion.
17. **Environment:** Kimi Code Desktop on Windows.
18. **Workspace:** the repository is already present in the Kimi Code workspace; inspect and use it; never clone another copy.
19. **Network policy:** network access only for official font binaries and their license/copyright files (verified upstream); no external runtime dependencies, no unrelated assets.