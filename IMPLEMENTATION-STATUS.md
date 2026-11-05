# IMPLEMENTATION-STATUS.md — ЭХО implementation progress (living document) · v1.2 (2026-11-05)

Source of truth for implementation state. Updated inside every task commit (playbook §7.6 steps 15–17). Never trust verbal summaries over this file + `git log`.

**v1.2 (Step-4 final corrective reconciliation, 2026-11-05):** the one-task-lag SHA rule made DYNAMIC — the predecessor is the most recently committed implementation task in ACTUAL Git history (Track 1 or Track 2; commit chronology, never the nominal schedule), so Track 1/Track 2 interleaving is supported; status vocabulary gained `COMPLETE IN THIS COMMIT` explicitly; position fields renamed to their real temporal meaning (`HEAD immediately before this commit`, `Working tree state immediately before staging`) — the post-commit SHA and clean-tree state belong to Kimi's completion report, not to a file edited before the commit exists; ledger declared a canonical reference layout, not a global execution lock; baseline "other pre-existing failures" set to an explicit NOT RECORDED state; PA-5 expanded (genuine weights + title appearance review); this file declared the sole operational exception to every task's file-scope limits.

**v1.1 (Step-4 final documentation reconciliation):** commit-hash bookkeeping formalized as the one-task-lag rule (below); Position section split into target vs actual branch with honest NOT CREATED / NOT RECORDED states; working-tree field added; baseline wording corrected (audit-known *expected, unconfirmed* issue); PA-11…PA-13 added (author visual reviews — never blocking); performance table declared a compact summary over the two canonical reports.

## Commit hash bookkeeping — the DYNAMIC one-task-lag rule (v1.2, binding)

A commit can never contain its own hash. Therefore:

1. The status update committed **inside task N's commit** records task N as `COMPLETE IN THIS COMMIT` with the hash field literally `pending post-commit resolution`.
2. The **next** task's status update records the exact SHA of its ACTUAL predecessor — determined from Git history, not from the nominal schedule: before staging, run `git log --oneline -10` / `git rev-parse HEAD` and identify the most recently committed implementation task in the actual branch history, **Track 1 or Track 2 — commit chronology decides, never logical task order.** (For B-0: record the Step-4 documentation commit SHA in the session log instead.) The ledger must not assume that W-1 follows T23, that T1 necessarily follows B-0 without interleaving, or that any task has a fixed predecessor.
3. **Never amend** a commit to insert its own hash. The ledger is always exactly one task behind on hashes — that is correct, not an error.
4. The **final** task's hash is reported in the final completion report via `git rev-parse HEAD` (no further commit exists to carry it).
5. The working-tree state is recorded before every commit: expected = only the current task's intended changes plus this file's update; anything else is a stop condition (unexpected author changes → stop and report).
6. This file is **mandatory operational metadata and is permitted in every task commit, even when it lies outside the task's implementation/artifact scope** — the sole such exception; it authorizes no other out-of-scope change.

## Position

- **Target branch:** work/echo-step4-implementation — **CREATED AND VERIFIED**; descends from the pinned commit
- **Actual current branch:** work/echo-step4-implementation
- **Baseline commit (pinned):** e2acadbf5f2d07c03701dc7c002cd30161d3e1e1
- **HEAD immediately before this commit** 〔field renamed v1.2 — the file is edited BEFORE the current commit exists; it never asserts the current commit's final SHA〕**:** 5ce8140b5d7d4be563d610554c79412a1c1f86da (`test: record pre-implementation baseline (B-0)`)
- **Working tree state immediately before staging** 〔field renamed v1.2 — the post-commit clean-tree state belongs to Kimi's completion report, not to this pre-commit file〕**:** only the one-line `index.html` T1 change and this T1 update to `IMPLEMENTATION-STATUS.md`
- **Current task:** T1 — remove the dead `glyph-utils.js` script tag
- **Last completed checkpoint:** T1 — dead script tag removed and regression-checked; **COMPLETE IN THIS COMMIT**
- **Exact next action:** playbook §7.5 / §8 T2 — repair the 10 broken CSS declarations and add the full-file parse check
- **Current stop/blocker reason:** none

## Task ledger

Ledger rows are grouped by their canonical workstream/reference order (ROADMAP v2.2 §1/§5). **This table is not a global execution lock** (v1.2): the exact next runnable task is determined from completed work, HARD dependencies, the strict internal workstream order, and the interleaving/shared-file rules in ROADMAP §1/§5 — Track 2 may interleave with Track 1 after B-0. Status vocabulary: NOT STARTED / IN PROGRESS / **`COMPLETE IN THIS COMMIT`** (task implementation and required checks complete; the status update rides in the current task commit; its own SHA remains `pending post-commit resolution` until the following task's commit records it) / **COMPLETE** (SHA resolved by a later commit) / BLOCKED (reason) / SUPERSEDED / CANCELLED / OBSOLETE. (For the record: T5 OBSOLETE, T10 CANCELLED, T24 SUPERSEDED — never scheduled; no T21 exists.)

| Task | Status | Commit | Checks run | Result summary | Limitations / notes |
| --- | --- | --- | --- | --- | --- |
| B-0 | COMPLETE | 5ce8140b5d7d4be563d610554c79412a1c1f86da | `pwsh tests/run-static.ps1`; `unit-state.html`; `effects-lab.html` (default cover suite); `focusprobe.html` | Static: 33 PASS, exit 0; unit-state: 17 PASS / `RESULT: OK`; effects-lab: `no errors` / `DONE`; focusprobe: progress-continue button active / `DONE` | Expected chapters-meta mismatch NOT reproduced; no other failure observed in the executed checks; full record in `tests/BASELINE.md`; PA items remain pending |
| T1 | COMPLETE IN THIS COMMIT | pending post-commit resolution | Direct `/` load + intro/TOC/chapter; HTTP status log; `errprobe.html?clear=1`; SW status probe; `pwsh tests/run-static.ps1`; `git diff --check` | Cover→title→TOC and chapter 01 opened; runtime errors none; direct `/` responses all 200 with no glyph-utils request; SW activated/controller=true/cache echo-v66; static 33 PASS | WebView2 local only. Auxiliary harness pages emitted favicon/srcdoc-relative 404s outside the direct `/` load; no application source path implicated. |
| T2 | NOT STARTED | — | — | — | |
| T4 | NOT STARTED | — | — | — | |
| T3 | NOT STARTED | — | — | — | |
| T7 | NOT STARTED | — | — | — | |
| T8 | NOT STARTED | — | — | — | D-10 B only; removes the known meta failure IF B-0 reproduced it — no blanket green-baseline promise |
| T9 | NOT STARTED | — | — | — | device check → PA-1 |
| T11 | NOT STARTED | — | — | — | visual review → PA-11 (non-blocking) |
| T12 | NOT STARTED | — | — | — | device checks → PA-2 |
| T13 | NOT STARTED | — | — | — | |
| T14 | NOT STARTED | — | — | — | visual review → PA-12 (non-blocking) |
| T17 | NOT STARTED | — | — | — | |
| T6 | NOT STARTED | — | — | — | |
| T18 | NOT STARTED | — | — | — | |
| T15 | NOT STARTED | — | — | — | dry-run only; local fixture server; no GitHub Action |
| T16 | NOT STARTED | — | — | — | AT checks → PA-3/PA-4 |
| T19 | NOT STARTED | — | — | — | |
| T20 | NOT STARTED | — | — | — | network: font licenses only |
| T22 | NOT STARTED | — | — | — | network: font binaries only; iOS check → PA-5; actual byte sizes recorded |
| T25 | NOT STARTED | — | — | — | timing frozen |
| T26 | NOT STARTED | — | — | — | timing frozen |
| T23 | NOT STARTED | — | — | — | auto-verdict on evidence; final Track-1 slot (T25 → T26 → T23) |
| W-1 | NOT STARTED | — | — | — | lab only; specification task — no renderer output |
| W-2 | NOT STARTED | — | — | — | lab only; 60 FPS diagnostic, not a gate |
| W-3 | NOT STARTED | — | — | — | lab only; 60 FPS diagnostic, not a gate |
| W-4 | NOT STARTED | — | — | — | lab only |
| W-5 | NOT STARTED | — | — | — | lab only; device rows → PA-6/PA-7; S1 doc-sync after |
| W-6 | NOT STARTED | — | — | — | lab only |
| W-7 | NOT STARTED | — | — | — | lab only |
| W-8 | NOT STARTED | — | — | — | S3-gated production integration; composition review → PA-13 (non-blocking) |
| W-9 | NOT STARTED | — | — | — | verification only; composition review → PA-13 (non-blocking) |

## Baseline (filled by B-0)

- **B-0 date / environment:** 2026-11-05; Windows 25H2 build 26200.9457; PowerShell 7.6.6 Core; Node.js v24.22.1; Kimi Code Desktop browser panel / Microsoft Edge WebView2 156.0.4314.58. Full record: `tests/BASELINE.md`.
- **Audit-known expected baseline issue:** chapters-meta.js freshness mismatch (6808 vs 6807) in tests/run-static.ps1 — an audit expectation before B-0; T8 still removes this tooling under D-10 B.
- **Reproduced at B-0?** **NO.** The actual run emitted `PASS  chapters-meta.js is up to date with chapters.js`; no 6808-vs-6807 mismatch appeared. Full output is captured in `tests/BASELINE.md`.
- **Other pre-existing failures:** None observed in the requested static and browser checks. This does not assert coverage of unrun scenarios or devices.

## New failures and disposition

| Failure | Introduced by | Disposition | Status |
| --- | --- | --- | --- |
| — | — | — | — |

## PENDING-AUTHOR items (never marked PASS; never block autonomous execution)

| ID | Item | Origin task | Status | Result (when supplied) |
| --- | --- | --- | --- | --- |
| PA-1 | Cover centering + safe-area | T9 | PENDING-AUTHOR | — |
| PA-2 | Film double-tap skip (iOS Safari + Android Chrome) | T12 | PENDING-AUTHOR | — |
| PA-3 | NVDA overlay pass | T16 | PENDING-AUTHOR | — |
| PA-4 | VoiceOver overlay pass | T16 | PENDING-AUTHOR | — |
| PA-5 | Genuine Golos weights + title appearance review — genuine Medium/Bold rendering on physical iPhone Safari; title appearance; width-change assessment; final typography acceptance | T22 | PENDING-AUTHOR | — |
| PA-6 | Water 10-min performance — Android Chrome | W-5/W-9 | PENDING-AUTHOR | — |
| PA-7 | Water 10-min performance — iPhone Safari | W-5/W-9 | PENDING-AUTHOR | — |
| PA-8 | Touch latency + gesture behavior | W-5/W-9 | PENDING-AUTHOR | — |
| PA-9 | SW/offline on physical devices (secure-context limitation) | W-9 | PENDING-AUTHOR | — |
| PA-10 | Post-deployment checks (author-only, after publishing) | — | PENDING-AUTHOR | — |
| PA-11 | T11 three-mode VOICE visual review (distinctness + readability) | T11 | PENDING-AUTHOR | — |
| PA-12 | T14 idle rhythm + beckon ring visual review | T14 | PENDING-AUTHOR | — |
| PA-13 | W-8/W-9 integrated cover composition review | W-8/W-9 | PENDING-AUTHOR | — |

PA-11/PA-12/PA-13 are author visual judgments. Like every PENDING-AUTHOR item they **do not block autonomous execution** (decision 16): tasks complete on programmatic acceptance; the full queue is presented at completion.

## W-series performance results (compact summary)

This table is a summary only. Canonical detail lives in `lab/ascii-water/performance-report.md` (W-5, lab context) and `docs/ascii-water-verification.md` (W-9, integrated context). The only hard gate: **≥30 FPS sustained for 10 continuous minutes** on each environment below. 55 FPS is a target, not a minimum; W-2/W-3 60 FPS figures and the reduced-motion <5 ms figure are diagnostic. Engaging the static fallback is **not** a gate pass.

| Environment | Mean FPS | p95 frame time | Dropped-frame ratio | 10-min sustained ≥30 FPS | Ladder behavior | Date / build |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop Chromium (Kimi) | — | — | — | — | — | — |
| Physical Android Chrome (PA-6) | — | — | — | PENDING-AUTHOR | — | — |
| Physical iPhone Safari (PA-7) | — | — | — | PENDING-AUTHOR | — | — |

## Session log

| Date | Session | What happened | HEAD after |
| --- | --- | --- | --- |
| 2026-11-05 | Step 4 (documentation) | ROADMAP v2, TASKS v4, DECISIONS v4, playbook, status tracker created | — (not yet committed to repo) |
| 2026-11-05 | Step-4 final reconciliation (documentation) | ROADMAP v2.1, TASKS v4.1, DECISIONS v4.1, PLAYBOOK v1.1, STATUS v1.1 — one-task-lag SHA rule, dependency classification, diagnostic-vs-gate performance split, 32 self-contained prompts | — (not yet committed to repo) |
| 2026-11-05 | Step-4 final CORRECTIVE reconciliation (documentation) | ROADMAP v2.2, TASKS v4.2, DECISIONS v4.2, PLAYBOOK v1.2, STATUS v1.2 + new ИНСТРУКЦИЯ АГА.md — dynamic predecessor SHA, real Track-2 interleaving, S3/PENDING-AUTHOR split, B-0-based baseline logic, STATUS file-scope exception, executable S1, W-8 conditional splash, T6 self-containment, ИНСТРУКЦИЯ АГА author guide | — (not yet committed to repo) |
| 2026-11-05 | B-0 | Preceding commit read from Git history: Step-4 documentation `85e9e4e2a33cb35380bc9e994948d38e911e7b5d`. Captured the actual static and three-page browser baseline in `tests/BASELINE.md`; expected chapters-meta mismatch not reproduced; no code changed. | pending post-commit resolution |
| 2026-11-05 | T1 | Actual predecessor: B-0 `5ce8140b5d7d4be563d610554c79412a1c1f86da`. Removed only the dead `glyph-utils.js` tag from `index.html`; direct intro/chapter flow, runtime-error probe, SW activation, HTTP status log, and static checks completed. | pending post-commit resolution |
