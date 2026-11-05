# CHANGELOG.md — Stage 1.5 editorial synchronization (2026-11-04)

Documents synchronized with the author's decisions D-1…D-9 and the Stage-1.5 verification results (echo-audit.md §25). Format: what it was → what it became. Everything not listed here is unchanged from v1. All checks ran against the pinned snapshot; no code was modified anywhere. 〔Corrected 2026-11-05: this line formerly claimed "archive == commit `e2acadbf` == production" — an overstatement. Correct scope: archive ↔ commit `e2acadbf` verified 78/78 by blob hash; production ↔ archive hash-verified for the nine listed resources only; full production↔archive identity was never established. The overstatement is recorded here, not silently erased.〕

---

## echo-audit.md (v1 → v2)

**Header**

- Was: `# ЭХО — Comprehensive Audit … (Phase 1: Research)` + single date line.
- Became: title carries `· v2`; added a v2 paragraph stating the Stage-1.5 sync, the 〔v2〕 inline-marker convention, and that everything unmarked remains valid.

**D2 — Version linkage broken**

- Was: `version.js` header comment states the SW reads it via `importScripts` — sw.js contains no `importScripts` (full read).
- Became: same + 〔v2〕 strengthening — **no file references `ECHO_VERSION` at all**; version.js is write-only today (§25.6).

**D3 — CSS errors** (the §1.11 correction)

- Was: `**D3 — Four CSS syntax errors (stray `)`), silently killing animations.**` — described film-grain-shift + crt-noise-shift keyframes and three gap typos as one "four errors" item; no class (a)/(b) distinction; no full-file parse.
- Became: `**D3 — 〔v2 corrected〕 Five CSS defect locations, 10 broken declarations…**` — five locations (516–519 ×4, 1152–1154 ×3, 2101, 2108, 2170), one signature (unmatched `)`); class (a) token-level syntax error with local effect (single declaration dropped; rules survive; the @media `.rs-row` rule becomes empty because `gap` was its only declaration); class (b) — **none found** in a full-file Chromium parse of all 1,652 declarations (§25.4); live effect measured (size-row gaps 0 px, §25.5); fix criterion now includes the full-file parser run in run-static.ps1.

**D7 — "New chapter" badge**

- Was: fix criterion = author supplies dates for 73–82; T6 BLOCKED→READY.
- Became: same + 〔v2〕 **Superseded** note — D-2 resolved: feature discontinued; T6 rewritten as gradual removal (P2, READY) over the §25.2 consumer map; `PUBLISHED_AT` untouched; old saves loadable.

**§17 A1 — Slow initial loading**

- Was: `T8 (lazy chapters.js via chapters-meta boot)`.
- Became: `T8 (lazy chapters.js — 〔v2〕 boot model per D-10: branch A via chapters-meta, branch B via optimistic TOC + await-on-open, preliminarily recommended)`.

**§17 A5 — Film unskippable**

- Was: `iOS double-tap zoom: currently moot (user-scalable=no); if D-1 unlocks zoom, add touch-action: manipulation on the film screen.`
- Became: zoom clause withdrawn — D-1 FINAL keeps the lock; `touch-action` is absent from the entire codebase (§25.3) and is neither added nor removed; T12 carries no zoom-policy logic; skip scope marked author-confirmed (D-9).

**§19 — Publication**

- Was: `regenerate chapters-meta.js (build-meta.ps1) and fail on diff` as an unconditional publish step.
- Became: that step applies only if D-10 = option A; under B the meta tooling no longer exists.

**§20 — Entry flow**

- Was: `No structural change is included in TASKS.md; only D-8 option 4 is cheap enough to recommend for a decision.`
- Became: same + 〔v2〕 resolution block — D-8: **current entry flow = default active design**; options 1–4 closed for the record; DESIGN-PROPOSALS evaluates against this baseline.

**§21 — Consolidated list by priority**

- Was: P0 T1,T2 · P1 T3,T4,T5,T6(BLOCKED D-2),T7,T8,T9,T11,T12,T13,T10,T14 · P2 T15–T20,T22(CONDITIONAL D-4) · P3 T23,T24.
- Became: 〔v2〕 list — T2 description updated (5 locations/10 declarations); T5 and T8 moved to **CONDITIONAL (D-10)**; T6 moved to **P2** as the badge-removal task (D-2 resolved, priority reassessed per the brief, not auto-P1); T22 **READY** (D-4 = option A); T11 carries the D-3 hierarchy; T12 carries the confirmed skip scope; T24 records D-6 placement and the D-7 condition.

**§22 — Development plan**

- Was: `Batch 1 (P0+P1 foundation, independent): T1 → T2 → T5 → T4 → T3 → T7. Batch 2 … T6 when D-2 answered. Batch 3 … (→ T22 if D-4 says so).`
- Became: 〔v2〕 **initial implementation package fixed: T1 → T2 → T4 → T3 → T7** (+T5 only if D-10 = A); T3→T7 sequenced (code-independent but sharing the SW-lifecycle regression surface — §25.6); Batch 2 = T9→T11→T12→T13→T10→T14; Batch 2.5 = T8 on D-10; Batch 3 = T6→T15→…→T22; Batch 4 unchanged; one commit per task with regression checks after each.

**§25 — Stage-1.5 verification addendum (new section)**

- Added: §25.1 "Аа" max-size check (desktop+mobile, no overflow/clipping, all core functions; cosmetic gap defect confirmed) · §25.2 badge consumer map · §25.3 VOICE registry (37 standard / 6 unmarked, per-chapter distribution, no `:strong` convention) + touch-action absence · §25.4 full-file CSS parse (10 invalid declarations / 5 locations; class (b) none; false-positive classes documented) · §25.5 sheet geometry measurements · §25.6 T3/T7 dependency verification + version.js consumer search · §25.7 chapters-meta consumer analysis (zero runtime consumers → D-10).

**Completeness matrix**

- Was: 13 rows, `BLOCKED tasks linked to DECISIONS | ✔ T6→D-2, T22→D-4, T24(WebGL)→D-7`.
- Became: same rows + four 〔v2〕 rows — CONDITIONAL tasks (T5/T8→D-10, no BLOCKED remain); Stage-1.5 decision sync; targeted checks all completed ≤2 attempts (none COULD NOT VERIFY); "four→five" correction; spoiler row extended (VOICE registry = counts only).

---

## TASKS.md (v1 → v2)

**Header**

- Was: title + pinning paragraph; "Execution: one task per commit, in order".
- Became: + v2 sync line; **initial implementation package stated explicitly (T1, T2, T4, T3, T7 + conditional T5)** with the T3→T7 sequencing rationale.

**T2**

- Was: `Repair 4 CSS parse errors`; five sites listed but titled "4"; gap values "restore per surrounding context (suggested 8–12 px)"; parser check "any parser".
- Became: `Repair 5 CSS defect locations (10 broken declarations)`; exact line numbers and anchors for all five; class (a)/(b) taxonomy with the verified verdict (all ten class (a), local effect; class (b) none — §25.4); keep the author's numeric gap values (14/6/10 px — only the `)` is the defect); acceptance adds the full-file parser run + computed-style spot-checks (keyframe steps carry background-position; gaps compute to 14/6/10 px).

**T3**

- Was: add `'version.js'` and `'chapters-meta.js'` to CODE_FILES unconditionally.
- Became: chapters-meta.js addition only while the file exists (D-10 = A); diagnosis strengthened (no ECHO_VERSION consumers anywhere — §25.6); dependency line: sequenced before T7.

**T5**

- Was: `P1 · READY — Regenerate chapters-meta.js`.
- Became: `P1 · CONDITIONAL (D-10, option A only)` — void under option B (removal happens inside T8 branch B).

**T6**

- Was: `P1 · BLOCKED (D-2) — Restore "new chapter" badges for chapters 73–82` (add dates, verify badge).
- Became: `P2 · READY — Gradual removal of the "new chapter" badge mechanism` — D-2 resolved (discontinued). Complete verified consumer map (script.js 9 sites, style.css 3 sites, README.md:15, 3 browser-test files; index.html verified clean); `PUBLISHED_AT` and chapter content explicitly not touched; old echo_state saves remain loadable (unknown-key tolerance, unit-state.html:79); priority reassessed to P2 per the brief (removal, not breakage).

**T7**

- Was: dependencies "none; pairs with T8".
- Became: + sequenced **after T3** with the verified rationale (different files, same SW-lifecycle regression surface — §25.6).

**T8**

- Was: `P1 · READY — Lazy-load chapters.js`; pre-load emptiness via `CHAPTERS_META.emptyIndices`; dependencies "T1, T5, T3 recommended".
- Became: `P1 · CONDITIONAL (D-10)` — two specified branches: A (keep minimal meta, requires T5) and B (remove meta + generator + run-static check; optimistic TOC + await-on-open; every open path awaits `ensureChapters()` and validates against real `chapterTexts`; placeholder dims late, cosmetic; progress counts refresh after load); branch comparison summarized (reliability/loading/complexity/maintainability → B preliminarily recommended); acceptance split into shared + per-branch (B: placeholder can never be opened; A: meta check green); dependencies updated.

**T11**

- Was: rebuild on WAAPI; standard = jitter+slices+peeks; "unmarked markers" question open (D-3).
- Became: + **marker registry** (FACT: 43 balanced; 37 `:standard` with per-chapter distribution; 6 unmarked ch20×2/ch31×1/ch33×2/ch47×1; no `:strong` exists today); + **D-3 hierarchy implemented exactly**: unmarked → redesigned standard (changes today's aggressive fall-through), `:strong` → aggressive (new token, zero markers today, author re-marks editorially), `:standard` → redesigned standard, `:whisper` unchanged, unknown tokens → standard (was: aggressive fall-through); + **hard animation constraints** (no layout-geometry changes; transform/opacity/clip-path primary; filter only with justification + perf verification; no neighbor displacement/overlap/resize); + acceptance: zero Layout Shift, stable neighbor geometry (programmatic check), visual isolation, readability.

**T12**

- Was: skip target "assumed" (option per D-9); fix-plan step (4): `if D-1 unlocks zoom, add touch-action: manipulation`; dependencies "interacts with D-1 re touch-action".
- Became: skip scope **author-confirmed** (D-9) — entire remaining sequence to the identical final state; step (4) deleted and replaced by the recorded investigation: no zoom-policy logic at all; `touch-action` absent codebase-wide (FACT §25.3) — neither added nor removed (reference: manipulation suppresses browser double-tap zoom/click delay, not app-level detection; viewport lock already makes the browser side inert); acceptance adds iOS (Safari) + Android (Chrome) verification.

**T15**

- Was: meta regen unconditional; regressions "run-static viewport policy (subject to D-1)".
- Became: meta step only if D-10 = A; viewport-policy check "stays byte-identical (D-1 final)"; do-not-touch adds the viewport check.

**T18**

- Was: regressions "resume, settings persistence, badge logic state".
- Became: acceptance/regressions reference legacy badge-era keys (`seenNew`/`prevVisit`/`lastVisit`) loading cleanly post-T6; "badge logic state" removed (the logic no longer exists); lands naturally after T6.

**T22**

- Was: `P2 · CONDITIONAL (D-4)` with options A/B.
- Became: `P2 · READY (D-4 resolved: option A)` — genuine Golos Text 500/700 woff2, cyrillic+latin, OFL, no synthesis; acceptance requires DevTools Fonts-panel verification + visual check; "+40–60 KB" marked as estimate — actual sizes to be recorded in the commit message; SW precache pickup added to regressions.

**T24**

- Was: "Diagnosis: fixed Canvas 2D base"; dependencies "WebGL comparison only via D-7 after results".
- Became: + **placement recorded (D-6)**: future home = cover/splash behind the existing graphics; prototype stays an independent lab page; no integration task now; T9/T14 related in subject, explicitly not technical dependencies; + **WebGL recorded (D-7)**: only if Canvas 2D misses the performance matrix.

**Cross-reference notes / batch order**

- Was: `BLOCKED/CONDITIONAL links: T6→D-2 · T22→D-4 · T24(WebGL)→D-7 · entry-flow change→D-8`; batch `P0 (T1, T2) → P1 foundation (T5, T4, T3, T7) → P1 user-facing (…T6 when D-2 lands) → P2 (…T22) → P3`.
- Became: CONDITIONAL links = T5→D-10, T8→D-10, T24(WebGL)→D-7 condition; a "resolved and closed (v2)" list (T6→D-2 removal, T22→D-4 READY, T12→D-9, T12/D-1, D-5, D-6/D-7, D-8); batch order = **T1→T2→T4→T3→T7** (+T5 if D-10=A) → user-facing → T8 conditional → P2 (incl. T6) → P3; one commit per task.

---

## DECISIONS.md (v1 → v2)

**Intro**

- Was: "Decisions that cannot be made from the code… Answering D-2 and D-4 unblocks T6 and T22; the rest gate optional directions."
- Became: v2 sync statement — D-1…D-9 **RESOLVED by the author** (each records the actual decision + where it is carried); **D-10** the single new open item; resolved items kept for the record, not to be reopened without new facts.

**D-1**

- Was: open; recommendation = allow zoom (option 1), reader-sheet max size questioned as insufficient.
- Became: **RESOLVED (FINAL): zoom stays locked** — viewport meta and the run-static viewport check preserved; recorded as a deliberate constraint with a known a11y trade-off; the Stage-1 unlock recommendation withdrawn and not to be re-proposed; compensating check done — "Аа" at max size verified on desktop+mobile (no overflow/clipping, all functions; only the cosmetic gap defect, tracked in T2).

**D-2**

- Was: open; recommendation = supply dates for 73–82 (option 1); retiring the badge "not recommended".
- Became: **RESOLVED: feature discontinued** — T6 rewritten as gradual removal with the verified consumer map; `PUBLISHED_AT` untouched; old saves loadable; the Stage-1 recommendation superseded by the author's decision.

**D-3**

- Was: open; question = should unmarked markers get the rebuilt standard intensity.
- Became: **RESOLVED** — hierarchy: unmarked → redesigned standard; `:strong` → aggressive; other modes keep purposes. Registry recorded (FACT): 43 markers (37 `:standard`, 6 unmarked with per-chapter distribution); no `:strong` convention exists today; dispatch supports standard/whisper/default→aggressive; hard animation constraints recorded in T11.

**D-4**

- Was: open; recommendation = option A (genuine files, ≈+40–60 KB).
- Became: **RESOLVED: option A** — T22 READY; DevTools Fonts-panel + visual verification; byte figure marked estimate, actuals to be recorded.

**D-5**

- Was: open; author's call (keep/remove).
- Became: **RESOLVED: keep img_06.jpg** — no action, no task.

**D-6**

- Was: open; recommendation = option 1 (cover) after T24.
- Became: **RESOLVED: cover/splash behind the existing graphics** — recorded in T24; prototype stays independent; no integration task now; T9/T14 related, not dependencies.

**D-7**

- Was: open; recommendation = decide only if T24 misses the FPS matrix.
- Became: **RESOLVED: exactly that** — WebGL only if Canvas 2D insufficient; recorded in T24.

**D-8**

- Was: open; recommendation = ceremony-once-per-session (option 1).
- Became: **RESOLVED: current entry flow = default active design** — no entry-flow tasks; the ceremony-once proposal closed; DESIGN-PROPOSALS treats the current flow as the baseline.

**D-9**

- Was: open; T12 "assumes" skip-all (recommended).
- Became: **RESOLVED (confirmed): skip the entire remaining sequence to the identical final state** — "assumption" label removed from T12.

**D-10 (new)**

- Added: **chapters-meta.js future — OPEN.** Discovery (FACT): zero runtime consumers; only consumer = run-static.ps1 freshness check; runtime emptiness derives from `chapterTexts` directly; file currently stale (D6). Option A (minimal generated meta + T5) vs option B (remove meta/generator/check; optimistic TOC + await-on-open). Comparison across reliability (B — single source of truth, D6 class eliminated), loading (B marginally — no extra blocking request), complexity (A simpler pre-load logic; B bounded async change), maintainability (B removes generator+artifact+guard). Preliminary recommendation: **B**, conditional on T8's await-discipline acceptance. Impact: T8 branch, T5, T15 meta step, T3 CODE_FILES line.

---

## Verification ledger (what was checked for this sync)

| Check | Result | Evidence |
| --- | --- | --- |
| "Аа" controls at max size (desktop + mobile) | pass; only cosmetic gap defect (→T2) | audit §25.1/25.5 |
| Badge consumer map (D-2 removal scope) | complete: 9 JS sites, 3 CSS sites, README, 3 test files | audit §25.2 |
| VOICE marker registry (D-3) | 43 balanced: 37 `:standard`, 6 unmarked; no `:strong` convention | audit §25.3 |
| touch-action presence (§1.12) | absent codebase-wide; neither added nor removed in T12 | audit §25.3 |
| Full-file CSS parse (§1.11) | 10 invalid declarations / 5 locations; class (b): none | audit §25.4 |
| T3/T7 dependency verification (§1.11) | code-independent; sequenced (shared SW-lifecycle regression) | audit §25.6 |
| chapters-meta consumers (D-10) | zero runtime consumers; only the test freshness check | audit §25.7 |

All checks completed within two attempts; none marked COULD NOT VERIFY. No repository, archive, or production modification at any point.

---

# Stage 1.5.1 editorial synchronization (2026-11-05)

Continuation scope: targeted corrections + substantial reset of design research to **Direction B (visual enrichment)** per the author's Stage-1.5.1 instruction. The five v2 documents and the pinned snapshot were the working context 〔Corrected 2026-11-05: this parenthetical formerly claimed "archive == commit `e2acadbf` == production, 78/78 blob match" — an overstatement merging two different scopes. Correct scope: archive ↔ commit verified 78/78 by blob hash; production hash-verified for the nine listed resources only. Recorded, not silently erased.〕; no re-audit was performed and no finding was recalculated. No code, repository, archive, or published-site content was modified.

## DESIGN-PROPOSALS.md (v1 → v2 — substantial rewrite, not a revision)

**Direction**

- Was: concepts C-1…C-10 derived from game/interaction studies (research registry R1–R13); emphasis on experimental reading conventions and abstract design philosophy.
- Became: **Direction B — visual enrichment of the existing digital book** (art direction, motion design, VFX, illustration, composition, 2D/3D craft). Direction A closed. Document reorganized to the required §9 structure: 9.1 executive summary · 9.2 existing visual identity (reuse audit) · 9.3 reference library (10 precisely documented references) · 9.4 eight concrete proposals VP-1…VP-8 with the full 9-field set each · 9.5 implementation-alternative comparisons (A–D) · 9.6 shortlist of 5 · 9.7 rejected/postponed register (R-1…R-14, P-1…P-3) · 9.8 seven author questions.

**Principle conflicts removed (recorded, not silently dropped)**

- v1 **C-4** (hide the persistent progress fill) → §9.7/R-1, rejected per Stage-1.5.1 §3.3/§3.4.
- v1 **C-8b** (TOC spine journey indicator) → §9.7/R-2, rejected per §3.4.
- Reading time / progress readouts / statistics → §9.7/R-3/R-4 (§3.4); gamification vocabulary → R-5 (§3.5); scroll-staging/spatial reading → R-6 (§3.1); fake-broken interactions → R-8 (§3.2); audio/haptics → R-14 (§3.6).
- Surviving v1 positions carried forward as standing rules: effects budget (R-11), single-voice typography (R-10/R-13), scarcity/solitude (R-12), honest controls (R-8).

**New findings incorporated (FACT, against the pinned snapshot)**

- The author's Example 2 (~15 s TOC disturbance) **already exists**: electric-glitch `GROUP_SIZE=15 / INTERVAL_MS=15000 / GLITCH_DURATION=1200` (script.js:858–921) + whole-TOC analog-drop every 25–40 s (script.js:904–915; style.css:1405–1411). VP-2 develops vocabulary inside the existing window; **T10 left untouched** — keep/retire/merge documented as author question Q1, no silent merge.
- The author's Example 3 (clickable word → photograph) **already exists** as {{PHOTO}}: parser script.js:741–745; overlay 799–851; keyboard handler 1480–1490; **existing touch anti-scroll guard** (150 ms hold + touchmove cancel, 1464–1499); 5 markers (img_01–05). VP-3 = refinements only; no duplicate overlay proposed.
- VOICE glitch architecture is richer than the registry noted: `.voice-base` + `.voice-red`/`#c41e3a` + `.voice-cyan`/`#00A8E8` + two `.voice-slice` layers (style.css:1414–1440; script.js:985–986) + neighbor shock waves (1068–1073). VP-1 extends this stack; marker system and D-3 hierarchy explicitly untouched.
- CRT rolling band runs continuously on the TOC but is `display:none` inside chapters — an **authored boundary** ("только статичные слои", style.css:1174–1200); proposals respect it.
- Frame assets frame-01..07 feed the film-gate (script.js:1699–1710) → VP-5 audit scope.

**Reference base replaced**

- Was: R1–R13 (games, VN conventions, reading benchmarks, award-site write-ups).
- Became: REF-1…REF-10 with exact URLs, dates, named creators, mechanism descriptions, FACT-vs-interpretation marking, and Internet Archive status per entry: Se7en titles (archive verified 2024-12-06), True Detective S1 titles, Spider-Verse technique (fxguide + Imageworks official), Murata "Monster Movie" (SAAM object page), The Boat (archive partial — shell only, marked), In Pieces (archive verified, making-of preserved), Codrops/Blotter.js (archive verified 2024-12-14), `<model-viewer>` (web.dev 2024-03-08), CRT shader literature (libretro docs; cgwg shader — GPL, technique reference only, no code copied), PowerGlitch (carried from Stage 1). Two reference rounds executed; one query (Codrops glitch tutorial) returned no results and was not retried beyond the two-attempt rule — the technique space was fully covered by REF-6/REF-10.

## echo-audit.md, TASKS.md, DECISIONS.md (targeted-correction review)

- Reviewed against Stage-1.5.1 §3 principles for conflicts: **none found — no corrections applied.** TASKS.md mentions of the progress line are acceptance-criteria language preserving existing behavior ("renders … exactly as before"), not proposals for new indicators; §3.4 governs design proposals, and DESIGN-PROPOSALS v2 complies. T10 intentionally unmodified (Stage-1.5.1 forbids changing its timing/behavior without author approval; the distinction from the existing disturbance lives in DESIGN-PROPOSALS §9.4/VP-2 and §9.8/Q1). DECISIONS.md unchanged; D-10 remains open; Q1–Q7 are proposal-level questions, not D-series decisions.

## Stage-1.5.1 verification ledger

| Check | Result | Evidence |
| --- | --- | --- |
| Snapshot re-extraction after /tmp wipe | pass (78/78 files intact) | pinned archive re-extracted |
| electric-glitch/analog-drop anchors | verified: script.js:858–921, 904–915; style.css:1346+, 1405–1411 | direct reads |
| {{PHOTO}} mechanism incl. touch guard | verified: script.js:741–745, 799–851, 1448–1500 | direct reads |
| VOICE layer architecture | verified: style.css:1414–1473; script.js:749–750, 985–986, 1068–1073, 1163–1180 | direct reads |
| CRT chapter-static boundary | verified: style.css:1156–1200 (rolling `display:none` in chapter) | direct reads |
| Frame-asset consumers | verified: script.js:1699–1710 | direct reads |
| Photo keyboard handler | verified: Enter/Space at script.js:1480–1490 | direct reads |
| §3-conflict sweep of TASKS/DECISIONS | no conflicts; zero edits | grep review |
| Reference archive status | 4 verified accessible, 1 partial (The Boat), 5 marked unverified per §7 | Wayback fetches |
| Spoiler sweep of DESIGN-PROPOSALS v2 | no chapter content, names, or motifs | grep review |

All checks completed within two attempts; none marked COULD NOT VERIFY.

---

# Step 3 documentation-baseline synchronization (2026-11-05)

Applied the outstanding corrections mandated by the Step-2/Step-3 author documents before roadmap preparation. Scope: surgical edits only; no rewrite; no project code touched anywhere.

## TASKS.md (v2 → v3)

- Header: added v3 note — ROADMAP.md becomes the execution source; CHAPTERS_META reference review recorded (references only in tests/run-static.ps1 :15/:46/:59–69 and tests/build-meta.ps1; none in index.html, sw.js, script.js, README.md, push-echo.cmd); production-scope wording corrected (nine resources, not 78).
- **T10:** task body replaced with a CANCELLED record (author decision; electric-glitch/analog-drop remain with frozen timing; superseded by ROADMAP T25/T26 quality-only tasks; former Q1 resolved).
- **T12:** removed the unapproved rule "suppress hint after 3 successful skips" (fix plan + acceptance); added the double-registration requirement — one physical touch = one tap (unified channel: pointerup with pointerType filtering, or touchend with synthetic-click suppression) with a programmatic acceptance check.
- **T24:** placement note updated — D-6 superseded; prototype remains the Track-2 seed.
- Cross-reference block: v3 closures added (T10 cancellation, D-6 supersession, frozen areas); batch order marked superseded by ROADMAP.md §5.

## echo-audit.md (〔v3〕 inline marks)

- §1 (line ~12): production-identity claim split into two scopes — archive↔commit verified 78/78; production hash-verified only for nine listed resources.
- §5: same scope correction appended to the divergence FACT.
- §25 header: parenthetical corrected to the two-scope wording.
- §11: header reframed (ASCII-WATER now the central splash workstream); the unsupported "≈ well under 2 ms on desktop" figure **removed** and replaced with a measurement requirement; placement proposals marked SUPERSEDED.
- §4 D12: T10 cancellation recorded.
- §10 item 5 (periodic sweep): cancelled.
- §17 A2: T10 solution struck through, cancellation recorded; §17 A5: hint-suppression rule removed, double-registration requirement added.
- §21/§22: T10 removed from P1 list and Batch 2; v3 notes added (priorities re-justified in ROADMAP.md; Track-2 W-series replaces the T24 experiment framing).
- §11.4 + §25.1: WCAG precision — the "Аа" max-size checks do not constitute WCAG 2.2 SC 1.4.4/1.4.10 verification (no 200% enlargement or 320 px reflow test performed); D-1 stands with the trade-off recorded precisely, neither conformance nor non-conformance asserted.
- Completeness matrix: stale "BLOCKED tasks linked to DECISIONS" row replaced by the 〔v3〕 Step-2/Step-3 sync row (the 〔v2〕 CONDITIONAL row already states no BLOCKED tasks remain).

## DECISIONS.md (v2 → v3)

- Header v3 note added (D-6 superseded; T10 cancelled; G-1 open).
- **D-6:** marked SUPERSEDED with full history preserved (2026-11-04 placement "behind the existing graphics" → Step-2 direction "foundation of the splash screen, physically interactive"); D-7 explicitly remains in effect.
- New section "Step-2 / Step-3 author directives": T10 cancellation, photo-subsystem freeze, splash-frame freeze, 3D exclusion, VP-6 inactivity, VOICE scope confirmation, DESIGN-PROPOSALS removal, D-1/WCAG documentation precision, D-10 still open.

## Verification ledger (this sync)

| Check | Result |
| --- | --- |
| CHAPTERS_META references (full repo sweep) | only tests/run-static.ps1 (:15, :46, :59–69) + tests/build-meta.ps1; zero in index.html/sw.js/script.js/README.md/push-echo.cmd (FACT) |
| Stale BLOCKED entries | one matrix row (line 476) — replaced; TASKS.md had no BLOCKED task statuses |
| Unsupported frame-cost figure | one instance (§11) — removed; no other "<2 ms" claims exist |
| Production-identity overclaims | three locations (§1, §5, §25 header) — corrected |
| T10 references | four locations (TASKS T10 + batch order; audit D12/§10.5/§17 A2/§21/§22) — all marked |
| WCAG wording | two locations (§11.4, §25.1) — corrected |
| T12 unapproved hint rule | two locations (TASKS T12; audit §17 A5) — removed |

No claims were left that production matches the archive beyond the nine hash-verified resources. No test-baseline claim is made: the actual run-static.ps1 / tests/browser baseline must be recorded by Kimi Code as ROADMAP task B-0 before any code change (the known chapters-meta freshness failure is documented, D-10-dependent).

---

## Step 3 — execution roadmap delivered (2026-11-05)

**ROADMAP.md created (v1).** Complete, prioritized, technically justified execution roadmap for Kimi Code, per the Step-3 specification. Contents: binding constraints + 7 global execution rules; §1 work architecture (Tracks 0/1/2, real dependencies, sync points S1–S4); §2 repository→technique practical map (9 licensed/MIT sources + idea-only references); §3 Direction B technical map of the four artistic groups; §4 complete 12-field task table with re-justified priorities (P0 empty; P1: T3/T7/T8/T11/T12/W-series; P2 with ↓-lowered justifications; P3: T23); §5 batch order with rationale, parallelization, and author gates; §6 ready-to-use 9-field Kimi Code instructions for every task (B-0, T-series, W-1…W-9); §7 testing plan (baseline discipline incl. which task restores the fully-passing static baseline under each D-10 option; binding performance-measurement matrix with method/device/OS/browser/threshold per metric, unvalidated targets marked PTV; full-site final regression plan); §8 D-10 option comparison (A vs B — loading, files, T3/T5/T8/T15 dependencies, risks, resume-safety criteria; B remains the preliminary preference, unresolved); §9 gesture analysis (5 options × 6 criteria, evidence-based recommendation: tap = entry + splash at tap point, drag = waves, swipe-up entry retired — requires D-8 amendment, G-1 open); §10 author-decision list (11 items); §11 PENDING-AUTHOR queue (device/environment/procedure per item).

No source code was written or modified; no implementation was started; no publishing actions. All frozen areas respected (chapters.js content/markers, PHOTO mechanism, splash frames, 3D, TOC periodic-effect timings, entry sequence pending G-1, DESIGN-PROPOSALS.md out of workflow).

---

## Step 4 — executable implementation playbook delivered (2026-11-05)

**The author's 19 final decisions applied; ROADMAP v1 → v2; DECISIONS v3 → v4; TASKS v3 → v4; IMPLEMENTATION-PLAYBOOK.md and IMPLEMENTATION-STATUS.md created.** No application source code, styles, assets, SW code, or tests were modified; no implementation task was started; no publishing/push/deploy action occurred.

Key corrections to ROADMAP v1: D-10 closed (B — T5 obsolete, T8 branch B only, moved to Batch 1.5); G-1 closed (B — tap=entry+splash, drag=waves, swipe-up retired, narrow D-8 amendment recorded); W-1 visual direction fixed (hybrid density / night-water landscape / shoreline + light column + mirrored reflection — no choice gate); W-2 full 7-step pipeline (4×4 Bayer mandatory); W-3 single physical model (displacement-refraction primary, absorbing boundaries, ≤3 sources, no rain); W-4 full input model incl. mouse hover; W-5 single performance policy (hard gate ≥30 FPS × 10 min × 3 devices; one 8/10/12 px ladder; one hysteresis 16 ms/90f down, 11 ms/600f up, 5 s dwell); W-6 lab-only loading documentation; W-7 lab-only gesture contract; W-8 sole production-integration task (water primary, Zastavka cropped emblem, entry never waits for the module); W-9 local static-hosting verification (no "production build" wording); T16 behavior-based modal semantics; T17 continuous stagger `200 + i*20`; T12 exact hint «Дважды коснитесь, чтобы пропустить» + static-readable under reduced-motion; T15 web-upload limitation documented; T23 evidence-based auto-verdict; S1/S2 demoted to technical checkpoints (no author gates remain); canonical file layout fixed (lab/ascii-water/…, root ascii-water.js — adapted once to the repo's root-level script convention, docs/ascii-water-verification.md).

The playbook contains: Kimi Code Desktop setup (K3.1 Pro MAX / K3 MAX, Ask When Needed, never authorize publishing), preflight + branch procedure (from the pinned commit, non-destructive), documentation-only closeout, B-0 baseline gate, exact batch schedule with real dependencies, the 19-step task execution loop, one-task-one-commit rules, rollback/recovery, local HTTP verification (tests/serve.ps1 primary, python fallback), physical-device procedures (LAN preview + 10-min performance protocol + secure-context limitation stated honestly), W-series execution detail, the final regression checklist, **32 self-contained copy-paste task prompts** (B-0, T1–T26 active set, W-1…W-9 — no prompts for T5/T10/T21/T24), the PENDING-AUTHOR register, session-continuity rules with a resume prompt, and the autonomy policy (decision 16).
Accuracy note (added at the final reconciliation, 2026-11-05): the delivered prompt set is **32 prompts** (B-0 + 22 active T-tasks + W-1…W-9). The initial Step-4 package was functional but **not fully consistent** — the final reconciliation pass recorded in the next entry (SHA bookkeeping rule, dependency classification, diagnostic-vs-gate performance split, prompt self-containment, prompt order T25 → T26 → T23) was required and applied. No claim of initial full consistency is made.

---

# Step-4 final documentation reconciliation (2026-11-05)

**ROADMAP v2 → v2.1; TASKS v4 → v4.1; DECISIONS v4 → v4.1; IMPLEMENTATION-PLAYBOOK v1 → v1.1; IMPLEMENTATION-STATUS v1 → v1.1.** Documentation only — no implementation authorized, started, or performed; no application code, tests, styles, assets, Service Worker code, or chapter content touched; echo-audit.md untouched (it is the evidence archive).

- **SHA self-reference** resolved by the one-task-lag bookkeeping rule: the status update inside task N's commit reads "COMPLETE IN THIS COMMIT" with the hash "pending post-commit resolution"; the next task's commit records the previous task's exact SHA; no commit is ever amended to insert its own hash; the final task's hash goes into the final report via `git rev-parse HEAD`; a "working tree state / uncommitted changes" field was added to the status template.
- **Baseline wording corrected everywhere:** the chapters-meta.js freshness mismatch (6808 vs 6807) is an audit-known *expected* baseline issue — to be reproduced and captured during B-0, not yet confirmed by the implementation baseline run, expected to be eliminated by T8; nothing asserts it is the only failure before B-0 actually runs.
- **Performance reclassified:** W-2/W-3 60 FPS figures and the reduced-motion <5 ms figure are diagnostic/aspirational, never blocking; engaging the static fallback is not a pass of the 30 FPS hard gate; hysteresis values are engineering tuning parameters; S1 is a documentation-only tuning-synchronization checkpoint before W-6 (not an author gate, not an implementation task).
- **Priorities restated as binding:** P0 empty; P1 = T3, T7, T8, T11, T12, W-1…W-9; P2 = T1, T2, T4, T6, T9, T13, T14, T15, T16, T17, T18, T19, T20, T22, T25, T26; P3 = T23; B-0 = BASELINE GATE.
- **Dependencies classified into two categories:** HARD (T3→T7; Batch 1→T8; T9→T14; T13→T16; T6→T18; T3+T8→T15; T20→T22; T2→T23/T25/T26; the W-chain; W-7←W-3/W-4/T12; W-8←Batch 1+T8+T9+T12+T13+T14+W-2…W-7; W-9←W-8) versus EXECUTION ORDER / SHARED-FILE CONFLICT (all other batch adjacencies; the artificial dependencies T11↛T9, T12↛T11, T17↛T14, T6↛T17, T15↛T18, T16↛T15, T19↛T16, T20↛T19, T25↛T22, T26↛T25 removed). W-8 is explicitly not dependent on T11/T17.
- **Task corrections:** T3 (two distinct loading paths — the SW's importScripts update-fetch vs ordinary page fetch; CODE_FILES does not control the former; files = sw.js + version.js comment-only; no chapters-meta.js anywhere); T7 (acceptance = registration *invoked* before window.load; installation/activation recorded separately; `ready` timing diagnostic only, never guaranteed); T8 (retry-safe loader — no permanently rejected promise, failed script element removed, cached promise reset, deliberate retry; search scope = no *active* references, historical references preserved); T11 (transform/opacity/clip-path only — the filter permission withdrawn; no A2 character-corruption); T12 (hint exactly «Дважды коснитесь, чтобы пропустить»; emulation does not replace the author's physical-device checks — PA-2); T14 (exactly IDLE → SURGE → LULL; the four artistic groups now assign exactly one primary group per visual task, secondary relationships noted separately, infrastructure tasks carry none); T15 (never invoke the live script, no real remote in dry-run, no production access, no GitHub Action; post-check logic demonstrated against a local fixture HTTP server); T17 (exactly `200 + i * 20`); T20 strictly before T22 with actual byte sizes recorded; final Track-1 order T25 → T26 → T23.
- **W-series corrections:** W-1 is a specification task — no renderer or visual output demanded, rendering confirmation lives in W-2; W-2 orchestrates modules via native browser JavaScript only (no invented bootstrap); W-8 splash/entry written as an explicit 7-step ordering (classify once → record coordinates → impulse if ready/queue → startSequence() immediately without awaiting → renderer processes next frame → freeze canvas only when the transition covers the water → destroy after); production API `window.__echoWater.drop(x, y, strength)` applies a documented default radius (radius-capable signature stays lab-internal); SW stated as two distinct mechanisms (best-effort EXTRA precache group and, where appropriate, the code-fetch strategy — never claimed cached until the operation succeeds).
- **PLAYBOOK v1.1:** §8 fully rewritten — all 32 prompts independently self-contained (verbatim safety preamble, complete 13-field set, full completion-report template, explicit SHA-rule status-update instruction; the abbreviation shortcuts "same preamble as B-0" / "standard reporting" / "follow TASKS.md verbatim" / "see the relevant section" / "run the usual checks" eliminated); the resume prompt continues autonomously instead of asking the author to re-paste tasks; the source-precedence note added (audit §11 old water model, §13 A2 glyph-corruption ideas, §17 A1 D-10 option A, §17 A5 old hint wording, §17 A7 old beckon, §19 D-10 A + GitHub Action, §20 entry alternatives, §§21–22 old priorities/batches, §24 the now-binding 30 FPS figure = historical evidence, not active instructions).
- **STATUS v1.1:** target vs actual branch distinguished (NOT CREATED / NOT RECORDED until verified at preflight); one-task-lag rule documented; PA-11 (T11 visual review), PA-12 (T14 visual review), PA-13 (W-8/W-9 composition review) added — visual judgments, never blocking; performance table declared a compact summary over lab/ascii-water/performance-report.md and docs/ascii-water-verification.md.
- **CHANGELOG itself:** the two production-identity overstatements (Stage 1.5 header, Stage 1.5.1 header) corrected to the two-scope wording with the overstatement explicitly recorded, not erased; the Step-4 entry accuracy note added above.

---

# Step-4 final cross-document corrective reconciliation (2026-11-05)

**ROADMAP v2.1 → v2.2; TASKS v4.1 → v4.2; DECISIONS v4.1 → v4.2; IMPLEMENTATION-PLAYBOOK v1.1 → v1.2; IMPLEMENTATION-STATUS v1.1 → v1.2; CHANGELOG — this entry appended; `ИНСТРУКЦИЯ АГА.md` — NEW (seventh deliverable, author-facing Russian operating guide).** Documentation only — no implementation or source-code changes were authorized, started, or performed in this corrective pass; no application code, tests, styles, assets, Service Worker code, chapter content, repository state, branch, commit, or production site was touched; echo-audit.md untouched.

**What this entry records honestly:**

- The previous entry's 34/34 checks were results against the *previous* reconciliation checklist — not proof that no cross-document inconsistencies existed. The author's independent review found additional operational inconsistencies; this corrective pass resolved them.
- The former claim of "32 fully self-contained prompts" required correction: the T6 prompt depended on TASKS.md for essential instructions (the complete consumer map and the exact five-step removal plan). The T6 prompt now embeds both.
- Fixed logical-predecessor SHA assumptions (field 13 naming a predetermined previous task, e.g. W-1 recording T23) were incompatible with the approved Track 1 / Track 2 interleaving. They were replaced across all 32 prompts, §7.6, and the status file with DYNAMIC bookkeeping: the predecessor is the most recently committed implementation task in actual Git history, by commit chronology, never by the nominal schedule. Status fields renamed to their real temporal meaning (`HEAD immediately before this commit`, `Working tree state immediately before staging`).

**Defects found after the previous reconciliation (selection):** hardcoded predecessor SHAs in all 32 prompts; Track 2 interleaving stated but not operational (§5 table presented Track 2 as a block after T23; no dynamic next-task selection; phantom T23→W-1 dependency); S3 / W-8 acceptance readable as requiring physical-device checks green before integration; PLAYBOOK §7.6 step 10 treating the chapters-meta issue as the only possible pre-existing failure; IMPLEMENTATION-STATUS.md updates conflicting with strict task file scopes and LAB-ONLY restrictions; S1 lacking an executable mechanism (W-5 both required to sync documents and forbidden to touch them); W-8 promising a visible splash in cases where the module physically cannot be ready before the transition covers the water; W-7 requiring a documented default radius without a selection mechanism; PLAYBOOK §7.8 lacking the existing-branch recovery path that §7.2 referenced; §7.3's "no open D-10 or G-1 anywhere" check too broad for legitimate historical references; §7.12's blanket "no chapters-meta.js references" criterion; the resume prompt following the nominal schedule instead of actual state; ROADMAP T7 still carrying the superseded `ready`-before-`load` acceptance criterion; TASKS dependency fields not matching the binding HARD classification (T7/T14/T16/T18/T15/T22/T23/T25/T26 cards; T20's "land before or with T22"); TASKS T15 acceptance sending Kimi's post-check against real production; TASKS T14's D-6 note still describing ASCII-WATER as placed behind existing graphics; T22's author review embedded in Kimi acceptance instead of the PENDING-AUTHOR register; DECISIONS D-4/D-7/D-8/D-6/D-9 needing the listed clarifications; ROADMAP §2's A4 table row broken by unescaped Markdown table delimiters.

**Corrections applied (by document):**

- **ROADMAP v2.2:** T7 acceptance corrected (registration INVOKED before window.load; lifecycle events distinct; `ready` diagnostic only); §7.3 chapters-meta search scoped to active implementation references; §5 restructured (Track 1 canonical table + separate Track 2 dynamic-scheduling rules; no mandatory T23→W-1 dependency; W-8 governed by S3 and its exact HARD dependencies only); S3 explicitly permits PENDING-AUTHOR device results while the overall three-device 30 FPS gate remains unpassed until real data exists; W-8 solution/acceptance carry the conditional splash behavior (entry guaranteed immediate; splash guaranteed only when the module is ready in time; queued impulse discarded when late or failed; no old splash ever on a later screen); T8 acceptance no longer promises a blanket fully-green baseline; S1 described with its executable mechanism; A4 table row repaired with unambiguous `abs(Δx)` expressions; other tables verified structurally.
- **TASKS v4.2:** dependency fields aligned with the binding classification (HARD stated as HARD for T7←T3, T14←T9, T16←T13, T18←T6, T15←T3+T8, T22←T20-strictly-before, T23/T25/T26←T2; serialization-only adjacencies explicitly labeled EXECUTION ORDER / SHARED-FILE CONFLICT); T15 acceptance split (Kimi: local-fixture verification only; author: post-publish production verification; the script retains its author-operated capability); T8 acceptance scoped; T14 D-6 note marked historical/superseded with the W-8-vs-lab scope clarification; T22 author review moved to the PENDING-AUTHOR register (PA-5).
- **DECISIONS v4.2:** all 19 author decisions preserved and closed, none reopened or softened; clarifications only — D-4 (T20 strictly before T22), D-7 (T24 superseded historical task; contingency lives in W-5/W-9 + ROADMAP §7.2), D-8 (DESIGN-PROPOSALS instruction marked SUPERSEDED — NOT AN ACTIVE INSTRUCTION), D-6 (T9/T14: not lab dependencies, HARD prerequisites of W-8), D-9 (physical-device verification PENDING-AUTHOR; emulation does not replace it).
- **IMPLEMENTATION-PLAYBOOK v1.2:** dynamic predecessor SHA in §7.5/§7.6/§7.7 and every prompt's field 13; IMPLEMENTATION-STATUS.md declared the sole operational file-scope exception (applied to all 32 prompts and LAB-ONLY additions); W-5's single conditional S1 documentation exception made executable (sync rides inside the W-5 commit); baseline logic corrected (B-0's record governs; T8 does not absorb unrelated failures; full static green claimed only when all recorded failures are actually resolved); §7.8 existing-branch recovery procedure added; §7.3 closeout scoped to active vs historical references; §7.12 active-reference scope + corrected baseline logic; §10 resume prompt selects the next task dynamically; T6 prompt made genuinely self-contained; T11 synthetic strong-mode verification (zero `:strong` markers exist; chapters.js never modified, even temporarily); T15 dry-run split explicit; W-7 default-radius selection mechanism; W-8 conditional splash; PA-5 expanded.
- **IMPLEMENTATION-STATUS v1.2:** `COMPLETE IN THIS COMMIT` added to the declared vocabulary (COMPLETE kept for SHA-resolved tasks); position fields renamed to their temporal meaning; ledger declared a reference layout, not a global execution lock; "other pre-existing failures" set to an explicit NOT RECORDED state; PA-5 expanded; dynamic predecessor rule recorded.
- **CHANGELOG:** this entry appended; history preserved — the two production-identity overstatement corrections, the Stage-1.5 / 1.5.1 / Step-3 / Step-4 entries, and the previous reconciliation entry remain recognizably historical and were not rewritten to suggest the earlier package had already contained these corrections. The three verification ledgers (Stage-1.5, Stage-1.5.1, Step-3) were inspected for the reported malformation and found to be **already structurally valid Markdown tables** in the current file — no repair was needed or made; no literal `\*\*` or ``\``` escape-token defects were found anywhere in the file.
- **`ИНСТРУКЦИЯ АГА.md` (NEW):** the author's Russian-language operating guide — document map, work sequence, exactly what to send to Kimi Code and where each prompt lives, model-selection guidance (only the models recorded in PLAYBOOK §7.1), change-monitoring instructions, frozen-area protections, the chapter-addition workflow for use BETWEEN Kimi tasks, and a quick-start checklist. It is a navigation aid, **not a new technical source of truth**; where it could ever diverge, the authority remains ROADMAP / TASKS / DECISIONS / PLAYBOOK / STATUS in their respective roles.

**The original 19 author decisions were preserved and not reopened.** No implementation work was performed in this pass; the package is prepared for the author's review and acceptance.
