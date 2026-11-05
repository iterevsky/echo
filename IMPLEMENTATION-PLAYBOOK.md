# IMPLEMENTATION-PLAYBOOK.md — ЭХО: end-to-end execution manual for Kimi Code Desktop · v1.2 (2026-11-05)

This is the operational manual for the implementation phase. Open Kimi Code Desktop, follow §7.1–§7.4 once, then execute tasks by pasting the §8 prompts in the §7.5 order. Everything needed is in this file; its companions are ROADMAP.md v2.2 (technical specification), TASKS.md v4.2 (diagnostics/evidence), DECISIONS.md v4.2 (author decisions), IMPLEMENTATION-STATUS.md v1.2 (live progress); ИНСТРУКЦИЯ АГА.md is the author's Russian-language operating guide (navigation aid, not an instruction source).

**v1.2 changes (Step-4 final corrective reconciliation, 2026-11-05):** one-task-lag SHA bookkeeping made DYNAMIC — §7.6 and every prompt's field 13 now determine the predecessor from actual Git history (commit chronology, never the nominal schedule), so Track 1/Track 2 interleaving is genuinely supported; status fields renamed to their real temporal meaning (`HEAD immediately before this commit`, `Working tree state immediately before staging`); Track 2 interleaving made operational (§7.5 dynamic next-task selection; no mandatory T23→W-1 dependency; W-8 governed by S3 and its exact HARD dependencies); S3 clarified (all Kimi-executable prerequisite checks green; PENDING-AUTHOR device results may remain pending without blocking W-8; the overall three-device 30 FPS gate stays unpassed until real device data exists — W-8 may be implementation-complete while it remains pending); baseline logic corrected (§7.6 step 10 — pre-existing = present in B-0's record, not merely the anticipated chapters-meta issue; T8 does not absorb unrelated baseline failures; full static green claimed only when all recorded failures are actually resolved); IMPLEMENTATION-STATUS.md declared the sole operational exception to every task's file-scope limits (applied in §7.6/§7.7, all 32 prompts, and the LAB-ONLY additions); S1 given an executable mechanism (W-5's single conditional documentation-only exception — ROADMAP/PLAYBOOK parameter sync inside the W-5 commit; no separate S1 task or commit); W-8's tap/entry ordering made physically consistent (conditional splash: entry guaranteed immediate; splash guaranteed only when the module is ready before the transition covers the water, otherwise the queued impulse is safely discarded and no old splash ever appears later); W-7 default-radius selection mechanism defined (engineering parameter, documented with rationale in gesture-contract.md, PTV if unvalidated); §7.8 gained the missing existing-branch recovery procedure; §7.3 closeout checks scoped to active vs historical D-10/G-1 references; §7.12 final regression uses the active-reference chapters-meta scope and the corrected baseline logic; §10 resume prompt selects the next task dynamically; T6 prompt made genuinely self-contained (full consumer map + exact 5-step removal sequence embedded); T11 prompt states the synthetic strong-mode verification path (zero :strong markers exist; chapters.js is never modified, not even temporarily); T15 acceptance split explicitly into Kimi local-fixture verification vs author-operated production verification; PA-5 expanded (genuine weights + title appearance review). No author decision was reopened; no implementation work was performed.

**v1.1 changes (Step-4 final documentation reconciliation):** §8 fully rewritten — all 32 prompts independently self-contained (verbatim safety preamble at the top of every prompt; complete 13-field set; full completion-report template; explicit one-task-lag SHA status-update instruction; the forbidden shortcuts "same preamble as B-0" / "standard reporting" / "follow TASKS.md verbatim" / "see the relevant section" / "run the usual checks" eliminated); prompt order corrected to end …T25 → T26 → T23; §7.6 loop steps 15–17 rewritten for the one-task-lag SHA bookkeeping rule (a commit never contains its own hash; never amend; final hash via `git rev-parse HEAD` in the final report); T3 prompt carries the importScripts-vs-page-fetch distinction; T7 acceptance corrected (registration *invoked* before window.load; install/activation recorded separately; `ready` timing diagnostic only); T8 prompt carries the retry-safe loader + truthful search scope; T15 prompt hardened (no live-script invocation, no real remote, no production access, no GitHub Action, local fixture server); W-1 no longer demands renderer/visual output; W-2 native-browser-JS orchestration + diagnostic 60 FPS; W-3 diagnostic 60 FPS; W-5 tuning-parameter framing + S1 documentation-sync + fallback ≠ gate pass + <5 ms diagnostic; W-7 production default-radius contract; W-8 explicit 7-step splash/entry ordering + default-radius API + two-mechanism SW statement; baseline wording corrected everywhere (audit-known *expected* issue, reproduced at B-0, unconfirmed until then); dependency classification (HARD vs EXECUTION ORDER) applied to §7.5 and all PRECONDITIONS fields; source-precedence note added to §8 (audit passages = historical evidence, never active instructions); §10 resume prompt continues autonomously (no re-paste-for-confirmation); §9 register extended with PA-11/PA-12/PA-13.

**Absolute rules (apply to every session and every task):**

- Work only on the development branch `work/echo-step4-implementation` descending from commit `e2acadbf5f2d07c03701dc7c002cd30161d3e1e1`.
- Never publish, deploy, push any branch to GitHub, push to the production branch, invoke `push-echo.cmd`, or change the live site. The author alone publishes.
- Never use destructive Git commands (`reset --hard`, `clean`, forced checkout, destructive rebase, blanket stash) and never rewrite history.
- Never edit chapter text, ordering, or markers in chapters.js. Respect every frozen area (ROADMAP.md v2.2 "Closing notes").
- No frameworks, bundlers, build systems, package managers, or new runtime libraries. Network access only for official font binaries + license files (T20/T22).
- One task = one commit. Run the task's specified checks before committing.
- Never claim a test/measurement as performed or passed when it was not. PENDING-AUTHOR items are never marked PASS.
- Stop and report on: unexplained test failure; unattributable failure; unexpected author changes in the tree; data-loss risk; frozen-area conflict; required new dependency; 30 FPS water minimum unmet after Canvas optimization; instruction conflicting with the repository beyond safe reconciliation.

---

## 7.1 Kimi Code Desktop setup (Windows)

1. Open the existing Kimi Code Desktop workspace. **Do not clone anything** — the `echo` repository is already present (decision 18).
2. Confirm the selected folder is the actual repository root: it must contain `index.html`, `script.js`, `style.css`, `chapters.js`, `sw.js`, `version.js`, `chapters-meta.js` (present until T8 removes it), `tests/`, `fonts/`, `images/`, `push-echo.cmd`, `README.md`.
3. Confirm the workspace is trusted (Kimi Code trust prompt accepted), so the terminal and file tools operate.
4. Do implementation in a **new session** started after this documentation work is complete — do not reuse a documentation-session context.
5. Model: select **K3.1 Pro (`k3.1-pro`)** with Thinking enabled and effort **MAX**.
6. If K3.1 Pro is unavailable, use **K3 (`k3`)** with MAX thinking.
7. When switching to K3.1 Pro, start a **new session** — do not change the model inside an old session and assume its context/cache remains valid.
8. Use the Composer for execution, the built-in terminal for commands, the Changes view and File Preview to inspect every diff before any commit.
9. Execution mode: Goal mode is appropriate for the autonomous multi-task phase; a single long session per batch is fine (see §10 continuity rules).
10. Permission mode: **Ask When Needed** — not Never Ask. Routine approved edits and commands proceed; dangerous or sensitive operations (anything touching remotes, publishing, destructive Git, operations outside the workspace) must remain subject to approval — and they are all forbidden anyway.
11. Never authorize: publishing, deployment, remote pushing, invoking `push-echo.cmd`, destructive Git commands, or operations outside the approved workspace.

## 7.2 Repository preflight and branch creation

Run in the built-in terminal (PowerShell). Expected interpretations inline:

```powershell
$ErrorActionPreference = 'Stop'

$RepoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $RepoRoot

git remote -v                      # expect: origin → github.com/iterevsky/echo (fetch+push). If absent/different: STOP, report.
git status --short --branch        # expect: clean tree. If dirty: STOP, report exact state (see below).
git branch --show-current          # informational: the production branch name.
git rev-parse HEAD                 # informational.
git cat-file -e 'e2acadbf5f2d07c03701dc7c002cd30161d3e1e1^{commit}'   # expect: exit 0 (pinned commit present locally).
                                   # If the object is missing: STOP. Do NOT fetch/push without authorization; report.
```

Verify the root contains the expected project files (§7.1 step 2 list). Then create the development branch:

```powershell
git branch --list 'work/echo-step4-implementation'   # expect: empty. If it exists: STOP — never overwrite an existing branch; report and pick the recovery path in §7.8.
git switch -c work/echo-step4-implementation e2acadbf5f2d07c03701dc7c002cd30161d3e1e1
git status --short --branch        # expect: ## work/echo-step4-implementation, clean
```

Rules: the implementation branch **must descend from the pinned baseline** — never use the current production branch as an alternative baseline. Before switching/creating: check for an existing branch with that name, and for tracked, staged, and untracked changes. **Never** run `git reset --hard`, `git clean`, forced checkout, destructive rebase, or blanket stash to get around a dirty workspace; never discard uncommitted author work. If the checkout is dirty in a way that makes the transition unsafe, **stop and report the exact state plus safe alternatives** (e.g. author commits or stashes deliberately).

## 7.3 Step-4 documentation-only closeout

Before any implementation, place the Step-4 documents into the repository root (copy from the delivery location): `ROADMAP.md`, `TASKS.md`, `DECISIONS.md`, `IMPLEMENTATION-PLAYBOOK.md`, `IMPLEMENTATION-STATUS.md`, `CHANGELOG.md`, `ИНСТРУКЦИЯ АГА.md`. Then validate:

- All referenced task IDs exist or are explicitly marked CANCELLED/OBSOLETE/SUPERSEDED (T5 obsolete, T10 cancelled, T24 superseded, no T21).
- No ACTIVE D-10 or G-1 open item or instruction remains (v1.2 scoped wording). Historical pre-resolution references may remain — in DECISIONS.md, CHANGELOG.md, and elsewhere — when clearly marked SUPERSEDED, resolved, or historical. Likewise, chapters-meta reference checks distinguish active implementation references (runtime code, Service Worker configuration, active tests, generators) from historical documentation references, which are permitted and intentionally preserved. No W-1 visual-choice gate; no duplicate/conflicting W-series paths (canonical layout only: `lab/ascii-water/…`, root `ascii-water.js`, `docs/ascii-water-verification.md`).
- Performance thresholds agree everywhere (ROADMAP v2.2 §7.2 is the single version: hard gate ≥30 FPS × 10 min × 3 devices; ladder 8/10/12 px; hysteresis values are engineering tuning parameters — current set 16 ms/90f downgrade, 11 ms/600f upgrade, 5 s dwell; W-2/W-3 60 FPS and <5 ms reduced-motion figures diagnostic; static fallback ≠ gate pass).
- Task dependencies are acyclic and justified (ROADMAP v2.2 §1 two-category classification: HARD vs EXECUTION ORDER); the §7.5 batch order here agrees with ROADMAP §5 (…T25 → T26 → T23).
- Every §8 prompt is self-contained (verbatim preamble + 13 fields + full completion-report template + DYNAMIC-predecessor SHA status instruction + the IMPLEMENTATION-STATUS.md file-scope exception — no abbreviation shortcuts).
- No application source file was modified: `git status --short` lists only the documentation files.

Documentation commit (explicit file list — **never `git add .`**):

```powershell
git add ROADMAP.md TASKS.md DECISIONS.md IMPLEMENTATION-PLAYBOOK.md IMPLEMENTATION-STATUS.md CHANGELOG.md "ИНСТРУКЦИЯ АГА.md"
git diff --cached --check
git diff --cached --stat
git diff --cached            # full inspection — read it
git commit -m "docs: Step-4 execution playbook v1.2, roadmap v2.2, decisions v4.2, tasks v4.2, status tracker v1.2, author guide"
git status --short --branch  # expect: clean
```

This commit is **not** an implementation task; it precedes B-0.

## 7.4 B-0 — actual baseline before code changes

B-0 is the first implementation task and the gate for every code task. Full prompt in §8. Procedure summary: serve the repo locally (§7.9), run `tests/run-static.ps1`, open the three browser test pages, capture complete outputs, classify every check (PASS / the expected chapters-meta freshness failure — only if actually reproduced, captured with its output / other pre-existing failure with excerpts / manual-or-device), record environment details, write `tests/BASELINE.md`, commit once, prove via `git status` that no application source file changed. Audit-known expected baseline issue: chapters-meta.js freshness mismatch (6808 vs 6807) — to be reproduced and captured during B-0; **not yet confirmed by the implementation baseline run**; expected to be eliminated by T8 (D-10 B). No failure set is asserted before B-0 runs. **Do not claim the static baseline green** before T8 lands.

## 7.5 Exact batch and dependency schedule

One task = one commit. **Scheduling rules (v1.2, binding — mirrors ROADMAP v2.2 §1/§5):** Track 1 retains its approved internal execution order below; Track 2 retains strict internal order W-1 → W-2 → … → W-9; **Track 2 may begin after B-0 and may interleave sequentially with Track 1** on the same branch; there is **no mandatory dependency between T23 and W-1**; T23 must still execute after T26 and before S4; **W-8 waits for its exact HARD dependencies and S3 — not for unrelated Track 1 tasks such as T11, T17, or T23**; shared-file conflicts are serialized — two tasks are never implemented simultaneously against the same working tree; **the exact next task is selected dynamically** from the runnable set (all HARD prerequisites committed, internal workstream order respected, no shared-file conflict with work in flight), with no routine author approval (decision 16). The batch layout below — and likewise the ledger row order in IMPLEMENTATION-STATUS.md — is the canonical reference layout, **not a global execution lock**.

```
TRACK 0   B-0
TRACK 1   Batch 1:    T1 → T2 → T4 → T3 → T7
          Batch 1.5:  T8                      (D-10 B only)
          Batch 2:    T9 → T11 → T12 → T13 → T14 → T17
          Batch 3:    T6 → T18 → T15 → T16 → T19 → T20 → T22 → T25 → T26
          Evaluated:  T23                     (hard dep: T2; final slot: AFTER T26 — Batch 3 closes T25 → T26 → T23, before final regression)
TRACK 2   W-1 → W-2 → W-3 → W-4 → W-5 → W-6 → W-7 → W-8 → W-9   (strict internal order; starts after B-0)
```

**Why T8 sits at Batch 1.5:** it removes the stale chapters-meta tooling and restores a fully-green run-static baseline before user-facing work builds on top of a red one, and its `ensureChapters()` loader pattern is reused by W-6's loading plan and W-8's module loader. Placing it later would let Batch 2 run against a known-red baseline and would delay the water track's architecture input.

**Dependencies — two categories, and only two (binding; mirrors ROADMAP v2.2 §1):**

**HARD DEPENDENCY** (the downstream task technically requires the upstream result): T3→T7 (shared SW-lifecycle regression surface); Batch 1→T8 (script chain, CSS gate, versioned SW, early registration); T9→T14 (corrected cover geometry); T13→T16 (final open/close paths); T6→T18 (post-T6 state surface); T3+T8→T15 (version model + post-meta tooling shape); T20→T22 (license discipline — T20 strictly before T22); T2→T23, T2→T25, T2→T26 (repaired CSS subsystem + parser gate); W-2←W-1, W-3←W-2, W-4←W-3, W-5←W-4, W-6←W-5, W-7←W-3+W-4 **and T12** (gesture protection pattern to reuse); **W-8←Batch 1 (T1, T2, T4, T3, T7) + T8 + T9 + T12 + T13 + T14 + W-2…W-7 (S3 gate)** — W-8 explicitly does **not** depend on T11 or T17; W-9←W-8.

**EXECUTION ORDER / SHARED-FILE CONFLICT** (serialization for safe editing, clean diffs, and regression attribution — never a functional prerequisite, never restatable as a technical dependency): T4→T3 (diff hygiene), T11↔T9, T12↔T11, T17↔T14, T6↔T17, T15↔T18, T16↔T15, T19↔T16, T20↔T19, T25↔T22, T26↔T25, and every other adjacency in the batch schedule. Shared-file conflicts to serialize: style.css (T2, T9, T14, T16-adjacent, T22, T25, T26, T23, W-8), script.js (T4, T7, T8, T12, T13, T14, T16, T17, T18, T6, W-8), sw.js (T3, T8, T22, W-8), index.html (T1, T8, T12, T16, T19, W-8), tests/run-static.ps1 (T2, T8).

## 7.6 The task execution loop (every task, no exceptions)

1. Confirm repository root and branch: `git branch --show-current` → `work/echo-step4-implementation`.
2. Confirm the working tree is clean: `git status --short` → empty.
3. Read the task prompt (§8) and the linked evidence sections (TASKS.md v4.2 / ROADMAP.md v2.2 §4 row).
4. Inspect the current code; **re-locate symbols by name or stable structure — line numbers are hints, not truth** (earlier tasks shift them).
5. Identify every call site, consumer, and regression surface within scope.
6. State the intended minimal change before editing (one paragraph in the session log).
7. Edit only the approved files and behavior.
8. Run the task-specific checks (prompt field 8).
9. Run the affected regression subset (prompt field 9).
10. Run `tests/run-static.ps1`; compare failures against B-0's tests/BASELINE.md record. Baseline logic (v1.2, binding): B-0 establishes the complete observed baseline — a failure actually present in B-0 is PRE-EXISTING, regardless of whether it is the anticipated chapters-meta issue; the chapters-meta mismatch is only an audit-known EXPECTED issue, unconfirmed until B-0 actually reproduces it. A NEW failure is one absent from the B-0 record, or a new regression relative to it. T8 removes the chapters-meta tooling and its freshness check — and eliminates the known meta failure if B-0 reproduced it — but does NOT silently absorb unrelated pre-existing failures; those remain documented and receive separate disposition or task assignment. Fully green run-static is claimed only when all recorded failures have actually been resolved. Any new unexplained failure: stop and diagnose (step 14).
11. Review the **complete diff** (`git diff`), not just changed lines.
12. Run `git diff --check`.
13. Confirm no forbidden area changed (frozen list in the prompt's DO-NOT-TOUCH field).
14. If a test fails: diagnose. Fix only defects within the current task's approved scope. If the cause is unexplained, outside scope, or risks data loss — **stop before committing and report** (§7.7 failure rules).
15. Update IMPLEMENTATION-STATUS.md **before** staging. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is **permitted in every task commit, even when it lies outside the task's implementation/artifact scope — this exception authorizes no other out-of-scope change** (v1.2). Bookkeeping per the **dynamic one-task-lag SHA rule (v1.2):** (a) determine the actual predecessor from Git history — `git log --oneline -10` / `git rev-parse HEAD` — the most recently committed implementation task in the ACTUAL branch history, Track 1 or Track 2 (commit chronology decides, never the nominal schedule); (b) record that predecessor's exact SHA in its ledger row (for B-0: record the Step-4 documentation commit SHA in the session log instead); (c) set the current task's row to `COMPLETE IN THIS COMMIT` with the hash field literally `pending post-commit resolution` — a commit can never contain its own hash; (d) fill checks run + results, refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, Exact next action. Stage only the explicitly listed task files **plus IMPLEMENTATION-STATUS.md** (the status update rides in the task commit).
16. Create exactly one commit with the prompt's required message.
17. **Never amend** the commit to insert its own hash. The ledger stays exactly one task behind on hashes — correct by design. The chat completion report states the real new hash (read via `git rev-parse HEAD` post-commit) and confirms the actual new HEAD and the post-commit working-tree state; the **final** task's hash goes into the final completion report the same way, since no later commit exists to carry it.
18. Verify the working tree is clean.
19. Proceed to the next task only when the task is technically complete. **No task may be marked complete merely because its files were edited.**

## 7.7 One task = one commit

Every active task (including B-0 and all W tasks) gets exactly one commit with the required message (§8 prompt field 11). No commit may contain unrelated tasks or unrelated repairs. No commit is ever amended — including to insert its own hash (dynamic one-task-lag rule, §7.6 steps 15–17; the predecessor SHA always comes from actual Git history, never the nominal schedule). **File-scope exception (v1.2, global):** IMPLEMENTATION-STATUS.md is mandatory operational metadata and is permitted in every task commit, even when it lies outside the task's implementation/artifact directory; this exception does not authorize any other out-of-scope change. In particular: B-0 creates `tests/BASELINE.md` and updates IMPLEMENTATION-STATUS.md; T tasks modify only their declared task files plus IMPLEMENTATION-STATUS.md; W-1…W-7 keep all implementation/artifact changes strictly inside `lab/ascii-water/` with IMPLEMENTATION-STATUS.md as the sole general exception (W-5 has one additional conditional S1 documentation exception — §7.11); W-8 touches production files plus IMPLEMENTATION-STATUS.md; W-9 touches `docs/ascii-water-verification.md` plus IMPLEMENTATION-STATUS.md. If a task cannot be completed:

- Do not create a misleading successful commit. Do not hide failing checks. Do not bundle unrelated repairs.
- Preserve the working tree for diagnosis.
- Report: failed acceptance criteria, full output, attempted repair, exact next safe action. Then stop (§11 stop conditions).

## 7.8 Rollback and recovery

- **The target branch `work/echo-step4-implementation` already exists at preflight (§7.2) — safe recovery path (v1.2):** (1) inspect the existing branch — `git branch -vv`, `git show-ref`, `git log --oneline -20`; (2) determine whether it already descends from the pinned baseline `e2acadbf5f2d07c03701dc7c002cd30161d3e1e1`; (3) inspect whether it contains commits, author changes, or implementation work; (4) do NOT overwrite, delete, reset, rebase, or force-checkout it; (5) report its actual state and propose safe alternatives for the author (e.g. adopt it if it genuinely descends from the pinned baseline and holds the expected work, or an author-supervised cleanup); (6) resume only through an explicitly permitted, non-destructive path. Never silently switch to another branch or create a competing implementation branch.
- **A task edit breaks tests (uncommitted):** `git diff` to review; restore specific files with `git restore -- <path>` only for files the task itself touched; re-attempt once with the diagnosis applied; if still failing → stop and report.
- **Unintended file modification:** `git restore -- <path>` for that file only; verify against `git status`.
- **A task touched a frozen area:** restore the frozen file immediately (`git restore -- <path>`), report the violation, re-plan the change to stay in scope.
- **Mistaken commit, not pushed (nothing is ever pushed):** prefer a new revert commit (`git revert <hash>`) — never reset/rewrite history. If the commit is the branch tip and contains only the mistaken task, `git revert HEAD` is the standard recovery.
- **Failed browser/manual check:** record the exact failure in IMPLEMENTATION-STATUS.md; retry after diagnosis; if attributable to the task → fix in scope; else stop.
- **Context compaction / session resume:** follow §10 — the status file and Git history are the truth, not verbal summaries.
- **Roadmap vs repository conflict:** re-locate by symbol/structure (§7.6 step 4). If the conflict cannot be safely reconciled (anchor missing, behavior differs materially) → stop and report with both versions quoted.
- **A completed task regresses after a later task:** identify the regressing commit (`git log`, bisect manually if needed); the later task's owner fixes it within its scope or reverts via a revert commit; record the incident in IMPLEMENTATION-STATUS.md.

## 7.9 Local browser verification

Serve the static site over HTTP (required — Service Worker behavior is not realistic over `file://`):

```powershell
# Preferred: the repo's own server (PowerShell 7+; if only Windows PowerShell 5.1 is present, try pwsh first, else powershell)
pwsh tests/serve.ps1 -Port 8734        # serves the project root at http://127.0.0.1:8734/

# Fallback: Python launcher
py --version
py -m http.server 8734 --bind 127.0.0.1

# Fallback: plain python
python --version
python -m http.server 8734 --bind 127.0.0.1
```

Browser test pages: `http://127.0.0.1:8734/tests/browser/unit-state.html`, `…/effects-lab.html`, `…/focusprobe.html` (and task-specific pages listed in prompts).

In DevTools verify, as tasks require: **Console** (zero errors, zero 404s); **Network** (requests, 404s, payload sizes, throttling: Fast/Slow 3G, CPU throttle 4×); **Application → Service Workers** (install/activate/update, `Update on reload`, cache storage contents, old-cache purge); **Application → Cache Storage** (cache names = `echo-<ECHO_VERSION>`); **offline reload** (Network → Offline checkbox, reload); **responsive viewports** (320/390/430/768/1280 px, portrait+landscape, safe-area emulation where available); **rendering** (prefers-reduced-motion emulation via Rendering tab); **touch/pointer** (device toolbar touch emulation); **Performance** (record traces, frame timing, FPS meter via Rendering → FPS meter).

## 7.10 Physical-device testing (author devices — decision 14)

The author has a physical iPhone and a physical Android device. Kimi prepares these procedures; **the author executes them**; results are recorded as PENDING-AUTHOR until actually supplied.

**LAN preview setup (both devices):**

1. On the Windows machine: find the LAN IP (`ipconfig` → IPv4, e.g. 192.168.1.50).
2. Serve with a LAN bind. The repo's serve.ps1 binds loopback only — for device testing use the Python fallback bound to all interfaces:
   ```powershell
   py -m http.server 8734 --bind 0.0.0.0
   ```
   (Windows Firewall: allow the prompt for Python on private networks.)
3. On the device (same Wi-Fi): open `http://<LAN-IP>:8734/` (integrated candidate) or `http://<LAN-IP>:8734/lab/ascii-water/` (lab page).
4. **Secure-context limitation (state this honestly):** plain LAN HTTP is **not** a secure context — Service Worker registration and full offline behavior will not work on the device. Ordinary HTTP testing covers interaction, visual, and performance checks only. The SW/offline portion on physical devices stays **PENDING-AUTHOR** with the exact remainder stated ("SW install/offline on device verified only after deployment or via a trusted HTTPS origin"). Do not introduce a tunneling service or new dependency without authorization.

**Android (Chrome) — water performance (W-5/W-9 hard gate):**

1. Open the lab page / integrated candidate in Chrome. 2. Tap/drag/multitouch to confirm input. 3. Start the on-page metrics (the lab's metrics.js overlay shows FPS/p95). 4. Leave the page visibly running **10 continuous minutes** (screen awake; plug in; disable auto-lock temporarily). 5. Record: mean FPS, p95 frame time, dropped-frame ratio, any ladder step-downs (visible in the overlay log), device model, Android version, Chrome version. 6. Pass = ≥30 FPS sustained for the full 10 minutes. 7. Copy the numbers into `lab/ascii-water/performance-report.md` (W-5) or the PENDING-AUTHOR section of IMPLEMENTATION-STATUS.md.

**iPhone (Safari) — same protocol:** Settings → Safari → Advanced → Web Inspector optional; keep screen awake (Settings → Display & Brightness → Auto-Lock → Never, temporarily); 10-minute visible run; record model, iOS version, Safari version; same metrics; same pass rule.

**Touch latency + gestures (both devices):** tap (entry/splash at tap point), drag (wake, no entry), multitouch (2–3 contacts), rapid taps; confirm one touch = one effect; note any perceptible latency.

**Other device checks:** T9 cover centering + safe-area (iPhone Safari, portrait/landscape, browser bar shown/hidden — cover img centered, bottom bar clears the home indicator); T12 film double-tap (iPhone Safari + Android Chrome — skip from each phase, single tap inert, hint readable); T22 genuine Golos weights on iPhone Safari (no faux-bold stroke on `.book-title`); T16 VoiceOver (iPhone) / NVDA (Windows desktop) overlay walkthrough; reduced-motion on device (iOS: Settings → Accessibility → Motion → Reduce Motion; Android: Settings → Accessibility → Remove animations).

## 7.11 W-series technical execution

Canonical files (only these may exist for the water work):

```
lab/ascii-water/index.html · design.md · loading-plan.md · gesture-contract.md · performance-report.md
lab/ascii-water/js/scene.js · renderer.js · waves.js · input.js · quality.js · metrics.js
(Production, W-8 only:) ascii-water.js at repository root · docs/ascii-water-verification.md (W-9)
```

- **W-1** — build: parameter table for the approved direction in design.md. Touches: lab only. Must not: present unresolved alternatives; touch production; **demand a renderer or any visual output (v1.1 — W-1 is a specification task; rendering confirmation lives in W-2)**. Visual result: documented night-water scene spec. Instrumentation: none. Tests: table completeness review. Output: design.md. Commit: one. Next when: W-2 can implement without inventing values.
- **W-2** — build: scene.js + renderer.js + metrics.js, orchestrated by **native browser JavaScript only** (no invented bootstrap/loader/bundler); the full 7-step pipeline (landscape → shoreline/column/lighting → mirrored reflection → wave-displacement hook → hybrid ASCII luminance mapping → **4×4 Bayer dithering** → night grade/glow/scanlines/vignette/grain). Must not: ship a gradient as the final result; touch production. Instrumentation: FPS/p95/dropped/payload via metrics.js. Tests: §8/W-2 acceptance. Output: working lab renderer + recorded desktop numbers. Next when: the complete landscape renders correctly and measurements are recorded — **the 60 FPS figure is diagnostic/aspirational, never a W-2 gate** (binding gate: §7.2 at W-5/W-9).
- **W-3** — build: waves.js (two-buffer Hugo Elias reimplemented; displacement-refraction primary; brightness/density secondary; absorbing boundaries; ≤3 active sources with oldest-recycling; slow drift; rare calm ambient). Must not: add rain/drizzle; use mirrored/wrap boundaries; add a dependency. Tests: refraction visibility, boundary absorption, source cap, 60 s stability, combined frame rate recorded (**60 FPS diagnostic, not a gate**). Next when: acceptance green.
- **W-4** — build: input.js (tap/drag arbitration <8 px & <250 ms; wake trails; hover waves; click splash; multitouch ≤3; velocity clamping; grid coordinate conversion; pointercancel/blur cleanup). Must not: touch production entry handling. Tests: every input type produces its specified response; latency measured. Next when: acceptance green.
- **W-5** — build: quality.js (ladder 8/10/12 px; hysteresis — engineering tuning parameters, current set 16 ms/90f down, 11 ms/600f up, 5 s dwell, no oscillation, static fallback — **fallback engagement is not a hard-gate pass**) + performance-report.md (§7.2 matrix). Tests: 10-min desktop run by Kimi; device runs by author (PENDING-AUTHOR); throttle-based ladder demonstration; reduced-motion frame cost recorded (<5 ms diagnostic). Next when: desktop hard-gate data recorded; device data queued. **S1 (documentation-only — executable mechanism, v1.2):** W-1…W-7 remain laboratory implementation tasks and none may modify production code; IMPLEMENTATION-STATUS.md is the general operational exception; **W-5 has ONE additional conditional documentation-only exception** — IF engineering tuning values actually changed, the W-5 commit may also update the affected parameter references in ROADMAP.md (§7.2, the W-2 hook note, W-5) and IMPLEMENTATION-PLAYBOOK.md (the corresponding technical section and affected prompts), strictly limited to synchronizing the measured/tuned values; no unrelated documentation edits; the sync completes before W-6. If no values changed, S1 is satisfied by an explicit no-change confirmation in the W-5 completion report and STATUS. No separate S1 implementation task or commit is created. This is a narrow documentation exception — it does not move W-1…W-7 production work outside the lab.
- **W-6** — build: loading-plan.md + lab harness simulating delayed/failed module loading. Must not: create production ascii-water.js; touch index.html/script.js/sw.js; add a production loader/global; change production cache groups. Tests: shell interactive before module; graceful module failure. Next when: plan complete + harness demonstrates both behaviors.
- **W-7** — build: gesture-contract.md + lab verification of the full approved model. Must not: edit production script.js or any production file. Tests: programmatic gesture→effect log, no double effects. **Default radius (v1.2 — executable rule):** the production `window.__echoWater.drop(x, y, strength)` takes no radius argument; its default radius is an ENGINEERING PARAMETER, not a new author design decision — no author approval gate is introduced. W-7 selects and tests a defensible value in the lab against the approved three-source physics model and the interaction scale; the numerical value, its coordinate/grid interpretation, and the rationale are recorded in gesture-contract.md (marked PTV if still an estimate rather than validated); W-8 uses exactly the documented value; the internal lab API may retain its explicit radius argument. Next when: contract complete enough for W-8 to implement without design choices (including the documented default radius).
- **W-8** — build: production integration (root ascii-water.js; cover canvas as primary surface; Zastavka cropped-emblem treatment; loader per W-6; gestures per W-7 with the **explicit 7-step tap/entry ordering (v1.2)**: ① classify the gesture exactly once on the unified channel → ② record the original contact coordinates → ③ impulse at those coordinates if the module is ready, else queue a single bounded impulse tied to the current entry attempt → ④ startSequence() immediately, never awaiting module initialization or the impulse → ⑤ if the module is ready, or finishes initializing while the water is still visibly on screen, the renderer processes the impulse on its next frame — the splash is then visible before the transition covers the water → ⑥ freeze the canvas only when the transition actually covers the water → ⑦ destroy after. A queued impulse is DISCARDED if the module becomes ready only after the transition covers the water, or if the module fails — a late initialization never displays an old splash on a later screen or entry attempt; the isStarted guard stays intact; the entry is never delayed, restarted, or cancelled by the water module. Two distinct guarantees: the entry gesture and entry sequence are guaranteed immediate, independent of the module; a visible splash is guaranteed only when the module is ready in time — otherwise best-effort and safely discarded; production `drop(x,y,strength)` with the documented default radius; SW = best-effort EXTRA precache + code-fetch strategy stated as two distinct mechanisms, never claimed cached until success; reduced-motion static frame). Gate: S3 (all prerequisites green). Must not: modify Zastavka.jpg/frames/chapters.js; delay entry for the module; block the shell on the module. Revert boundary: exactly one commit; the lab prototype is untouched by it.
- **W-9** — build: docs/ascii-water-verification.md from the §7.3 water subset + §7.2 matrix on the integrated candidate served locally. Must not: deploy, publish, push; mark device rows passed without author data. Next when: report committed → S4 final regression.

## 7.12 Final regression (S4 — after W-9, on the integrated development-branch candidate)

Full checklist = ROADMAP.md v2.2 §7.3 rows 1–12, executed in order, with outcomes recorded in IMPLEMENTATION-STATUS.md under four headings: **(a) Kimi automated tests, (b) Kimi local-browser tests, (c) PENDING-AUTHOR physical-device checks, (d) author-only post-deployment checks.** The checklist explicitly includes: fresh + returning reader boot; tap entry with unchanged sequence; splash at tap point; drag-only waves; hover waves + click splash; swipe-up not entering; film full path + double-tap skip + exact hint text; TOC reveal `200 + i*20` ≤2.5 s; frozen electric-glitch/analog-drop timings; menu swipe open/close; keyboard + focus; all VOICE modes + unknown-token fallback; PHOTO regression only; chapter loading/deep links/empty-chapter prevention; legacy echo_state resume validation; SW install/update/offline lifecycle; reduced-motion everywhere; noscript; font files + licensing; safe-area + cover centering; water performance/latency/offline; no `navigator.vibrate`; no dead `glyph-utils.js` reference; no active runtime, Service Worker, configuration, test, or generator references to `chapters-meta.js` / `CHAPTERS_META` (historical documentation and audit references are intentionally permitted — v1.2 scoped wording); run-static reported fully green only when every failure recorded in tests/BASELINE.md has actually been resolved (v1.2 baseline logic).

---

## 8. Per-task copy-paste prompts (32 prompts, execution order)

Paste one prompt into the Kimi Code session, let it complete fully, verify the commit, then paste the next. Prompts appear below in the canonical reference order: B-0 → T1 → T2 → T4 → T3 → T7 → T8 → T9 → T11 → T12 → T13 → T14 → T17 → T6 → T18 → T15 → T16 → T19 → T20 → T22 → **T25 → T26 → T23** (final Track-1 slot, binding within Track 1) → W-1 → … → W-9. This listing order is NOT a global execution lock (v1.2): Track-2 prompts may interleave sequentially with Track 1 after B-0 under the §7.5 dynamic-selection rules — never two tasks simultaneously against the same working tree, and each prompt determines its SHA predecessor from actual Git history, not from this list.

**Self-containment (binding):** every prompt below is independently copyable. Each carries the full verbatim safety preamble, all 13 fields, the complete completion-report template, the explicit status-update instruction (dynamic one-task-lag SHA rule — the predecessor is read from actual Git history), and the IMPLEMENTATION-STATUS.md operational file-scope exception (v1.2). Nothing is spelled out "once" — the shortcuts "same preamble as B-0", "standard reporting", "follow TASKS.md verbatim", "see the relevant section", and "run the usual checks" are forbidden forms and appear nowhere. Where a prompt cites a document section, it still restates everything needed to execute.

**Source precedence (v1.1, binding):** these prompts + ROADMAP v2.2 + TASKS v4.2 + DECISIONS v4.2 are the only active instruction sources. echo-audit.md is the evidence archive, not an instruction source: audit §11 (old water model), §13 A2 (glyph-corruption ideas — forbidden by decision 11), §17 A1 (D-10 option A — superseded; D-10 = B), §17 A5 (old film-hint wording), §17 A7 (old beckon design), §19 (D-10 option A + the GitHub Action idea), §20 (entry-flow alternatives — G-1 = B resolved), §§21–22 (old priorities/batches), and §24 (the 30 FPS figure — now binding as the ROADMAP §7.2 hard gate) are historical evidence, never active instructions. Where a prompt cites audit evidence, the prompt's own text governs execution.

---

### Prompt B-0 — Record the actual test baseline (gate task — no code changes)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK B-0 — Record the actual test baseline (gate task — no code changes).
1. OBJECTIVE: capture the exact pre-implementation state of all project checks on this branch and commit it as tests/BASELINE.md.
2. CONTEXT/EVIDENCE: implementation has not started; the baseline is unrecorded. Audit-known EXPECTED baseline issue: the chapters-meta.js freshness check in tests/run-static.ps1 (stale generated file, chapter 82 length mismatch 6808 vs 6807 — documented in echo-audit.md D6). It must be reproduced and captured here; it is NOT yet confirmed by any implementation baseline run, and no other failure may be asserted or excluded before this task runs. T8 is expected to eliminate it (D-10 = B).
3. FILES/AREAS: run tests/run-static.ps1 (PowerShell); serve the repo (pwsh tests/serve.ps1 -Port 8734, or py -m http.server 8734 --bind 127.0.0.1) and open http://127.0.0.1:8734/tests/browser/unit-state.html, .../effects-lab.html, .../focusprobe.html. CREATE only tests/BASELINE.md.
4. EXPECTED CHANGE: one new file tests/BASELINE.md containing: date; environment (Windows build, PowerShell version, browser + version); complete run-static.ps1 output; complete results of the three browser pages; every check classified as (a) PASS, (b) the EXPECTED chapters-meta freshness failure — only if actually reproduced, with its output captured, (c) OTHER PRE-EXISTING FAILURE with full output excerpts, or (d) MANUAL/DEVICE check (not runnable now).
5. APPROACH: run, capture, classify, write, commit. Do not fix anything.
6. DO-NOT-TOUCH: every file except creating tests/BASELINE.md. No application source, styles, assets, SW, or existing test files.
7. ACCEPTANCE: every check classified; the chapters-meta issue either reproduced-and-captured or explicitly recorded as not reproduced; git status shows only tests/BASELINE.md added. Do NOT claim the static baseline green — the reproduced chapters-meta freshness failure (if confirmed) remains until T8 removes that check (D-10 B).
8. CHECKS: pwsh tests/run-static.ps1 (capture full output); the three browser pages (capture full results); git status --short.
9. REGRESSION: none (no code change).
10. PRECONDITIONS: branch created per playbook §7.2; tree clean; Step-4 documentation commit done.
11. COMMIT MESSAGE: test: record pre-implementation baseline (B-0)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). B-0 is the FIRST implementation task — no implementation commit exists before it, so record the Step-4 documentation commit SHA in the session log as the preceding commit — read it with `git log` before staging. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T1 — Remove the dead glyph-utils.js script tag

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T1 — Remove the dead glyph-utils.js script tag.
1. OBJECTIVE: eliminate a guaranteed 404 that delays the classic-script boot chain.
2. CONTEXT/EVIDENCE: echo-audit.md D1 — the file is absent in repo and production (404 twice verified); nothing references it. Anchor: index.html ≈ line 453, the exact tag `<script src="glyph-utils.js"></script>`.
3. FILES/AREAS: index.html only — that one tag (re-locate by content; the line number is a hint).
4. EXPECTED CHANGE: delete the tag. Do not create a replacement file.
5. APPROACH: one-line deletion.
6. DO-NOT-TOUCH: script.js, chapters.js, sw.js, style.css; all other script tags.
7. ACCEPTANCE: page loads with zero 404s in console and network; boot sequence unchanged; TOC renders; the diff is exactly one removed line.
8. CHECKS: serve locally (playbook §7.9), load /, inspect console+network; pwsh tests/run-static.ps1 (compare against the B-0 record — the reproduced chapters-meta failure, if B-0 confirmed it, is the only acceptable remaining failure); git diff --check.
9. REGRESSION: full intro flow (cover→title→TOC), chapter open, SW install.
10. PRECONDITIONS: B-0 committed.
11. COMMIT MESSAGE: fix: remove dead glyph-utils.js script tag (D1)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T2 — Repair 10 broken CSS declarations + add a full-file parse check

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T2 — Repair 10 broken CSS declarations + add a full-file parse check.
1. OBJECTIVE: restore silently-dropped declarations (grain/noise keyframe steps, reader-sheet gaps) and prevent silent recurrence.
2. CONTEXT/EVIDENCE: echo-audit.md D3 + TASKS.md v4.2 T2 — all 10 defects share one signature: an unmatched `)` inside the value. Locations (re-locate by anchor): (a) style.css ≈516–519 `background-position: -64px 32px)` inside @keyframes film-grain-shift (4 declarations); (b) ≈1152–1154 `background-position: 128px 64px)` inside @keyframes crt-noise-shift (3); (c) ≈2101 `.rs-size { display: flex; align-items: center; gap: 14px); }`; (d) ≈2108 `.rs-size-dots { display: flex; gap: 6px); }`; (e) ≈2170 `.rs-row { gap: 10px); }` inside @media (max-width: 480px).
3. FILES/AREAS: style.css (exactly those declarations); tests/run-static.ps1 (add the parse check).
4. EXPECTED CHANGE: remove the stray `)` in each of the 10 declarations, keeping the author's values (14/6/10 px — intentional). Add to run-static.ps1 a full-file CSS parse check (any standards-based parser over all of style.css) that fails on any parse error.
5. APPROACH: minimal character-level fixes; verify with computed styles.
6. DO-NOT-TOUCH: keyframe names/timings; the author's gap values; reader tone colors; the viewport check in run-static.ps1 (must stay byte-identical — D-1).
7. ACCEPTANCE: (1) full-file CSS parse reports zero errors; (2) computed-style spot-checks: the 20%/25% keyframes of film-grain-shift/crt-noise-shift carry a real background-position; .rs-size computed column-gap = 14px, .rs-size-dots = 6px, .rs-row at ≤480 px = 10px; (3) film grain visibly shifts between two frames ≥0.5 s apart; (4) reader sheet spacing even at all 4 font sizes.
8. CHECKS: parser output; computed-style verification in DevTools; visual two-frame grain comparison; sheet layout at 320/390/430/768/1280 px; pwsh tests/run-static.ps1.
9. REGRESSION: film choreography, CRT overlay on all screens, reader sheet at all 4 sizes.
10. PRECONDITIONS: T1 committed (execution order; hard gate: B-0).
11. COMMIT MESSAGE: fix: repair 10 broken CSS declarations + add full-file parse check (D3)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T4 — Remove haptics (Vibration API)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T4 — Remove haptics (Vibration API).
1. OBJECTIVE: eliminate both navigator.vibrate call sites (haptics are a forbidden feature).
2. CONTEXT/EVIDENCE: echo-audit.md D5 — anchors: script.js ≈1078–1079 `navigator.vibrate([30, 60, 30])` (VOICE shock), ≈2065 `navigator.vibrate(30)` (film hit). No echo_state haptics fields exist — no migration.
3. FILES/AREAS: script.js only.
4. EXPECTED CHANGE: delete both call sites including their `if (navigator.vibrate)` guards; prune any comment referencing vibration; surrounding VOICE-shock / film-hit visual logic stays intact.
5. APPROACH: surgical deletions; re-locate by anchor text.
6. DO-NOT-TOUCH: VOICE marker rendering, film timing tables.
7. ACCEPTANCE: `grep -n vibrate script.js` (or Select-String) returns no matches; VOICE events and film hits still fire visually.
8. CHECKS: grep; open a VOICE chapter (e.g. ?ch=20) and confirm shock visuals; play the film to the frame-6 hit; pwsh tests/run-static.ps1.
9. REGRESSION: VOICE aggressive sequence timing; film frame-6 hit; reader flows.
10. PRECONDITIONS: T1, T2 committed (execution order — keeps vibration-removal diff noise out of the T3 SW review; not a hard technical dependency).
11. COMMIT MESSAGE: fix: remove Vibration API call sites (D5)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T3 — Unify the version model (version.js ↔ sw.js)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T3 — Unify the version model (version.js ↔ sw.js).
1. OBJECTIVE: make version.js the single version source; the Service Worker derives its cache name from it.
2. CONTEXT/EVIDENCE: echo-audit.md D2 — version.js declares `var ECHO_VERSION = 'v76'` and its header comment claims the SW importScripts it, but FACT: no file references ECHO_VERSION (sw.js, script.js clean; index.html loads version.js but nothing consumes the value). sw.js ≈19 hardcodes `const CACHE_VERSION = 'echo-v66'` (stale); the sw.js header comment (lines 1–18) describes a retired strategy.
3. FILES/AREAS: sw.js (≈19 anchor CACHE_VERSION; ≈55 anchor `const CODE_FILES = [`; header comment block); version.js (header-comment fix only — and only if the existing comment is inaccurate).
4. EXPECTED CHANGE: (1) sw.js: add `importScripts('version.js')` then `const CACHE_VERSION = 'echo-' + ECHO_VERSION;` (sw.js is a classic worker — importScripts is valid); (2) add 'version.js' to CODE_FILES (network-first); (3) rewrite the stale sw.js header comment to describe the actual atomic-CORE/allSettled-EXTRA design; (4) fix the version.js header comment to match reality (comment-only). Do NOT add chapters-meta.js anywhere — D-10 = B, it is removed by T8. TWO DISTINCT LOADING PATHS — do not conflate: (a) the SW's own importScripts('version.js') update-fetch is a browser worker mechanism — adding version.js to CODE_FILES does NOT control it, and it is verified in the SW lifecycle suite; (b) ordinary page fetches for version.js follow the CODE_FILES network-first strategy once listed. Verify both paths independently.
5. APPROACH: minimal edits; then exercise the full SW lifecycle.
6. DO-NOT-TOUCH: fetch strategy bodies (networkFirst/cacheFirst), NETWORK_TIMEOUT, offlinePage logic.
7. ACCEPTANCE: fresh install → cache name equals `echo-<ECHO_VERSION>` (currently echo-v76); bumping ECHO_VERSION alone produces a new cache on next deploy simulation; old echo-* caches purged after activation; version.js fetched network-first on ordinary page requests (verify via cache/network inspection); the SW's importScripts update-fetch verified separately; controllerchange reload happens exactly once; `?ch=` route preserved across the reload; offline reload works.
8. CHECKS: DevTools → Application (SW install/activate, Cache Storage before/after a simulated version bump); Network → Offline reload; pwsh tests/run-static.ps1.
9. REGRESSION: offline reload after update (old→new), offline reading from existing cache, controllerchange single-fire, install prompt flow.
10. PRECONDITIONS: T1, T2, T4 committed (execution order; hard gate: B-0).
11. COMMIT MESSAGE: fix: single version source, SW derives cache name (D2)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T7 — Register the Service Worker early (DOMContentLoaded)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T7 — Register the Service Worker early (DOMContentLoaded).
1. OBJECTIVE: start SW registration at script execution / DOMContentLoaded instead of waiting for window.load.
2. CONTEXT/EVIDENCE: echo-audit.md D8/§6.3 — registration sits in a `window.addEventListener('load', …)` block (script.js ≈2396–2397; re-locate by anchor), delaying offline capability behind the slowest resource (live-verified at audit time: 170.8 s on a degraded link).
3. FILES/AREAS: script.js — the registration block only.
4. EXPECTED CHANGE: move `navigator.serviceWorker.register('sw.js')` to run immediately at script execution (the script is at end of body) or on DOMContentLoaded; keep the controllerchange→reload logic unchanged.
5. APPROACH: minimal move; then verify under throttling with instrumentation.
6. DO-NOT-TOUCH: sw.js internals (T3 covered); the controllerchange handler body.
7. ACCEPTANCE: ACCEPTANCE (corrected, v1.1 — read exactly): registration is INVOKED before window.load (proven by instrumentation: a timestamped marker at the register() call vs the load event under Slow-3G throttling); installation and activation are observed and recorded SEPARATELY (they are lifecycle events, not consequences of the move); controllerchange reload fires exactly once; offline reload works; install prompt flow intact. navigator.serviceWorker.ready timing may be recorded DIAGNOSTICALLY but is NOT a guaranteed consequence of moving the registration call and is NOT an acceptance gate.
8. CHECKS: DevTools Network throttling Slow 3G + instrumentation timestamps for register() invocation, install, activate, controllerchange, load (and diagnostically: ready); offline reload; pwsh tests/run-static.ps1.
9. REGRESSION: controllerchange reload (once), offline reload, install prompt flow.
10. PRECONDITIONS: T3 committed (HARD dependency — shared SW-lifecycle regression surface; rerun the T3 lifecycle checks here too).
11. COMMIT MESSAGE: fix: register SW at DOMContentLoaded (D8)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T8 — Lazy-load chapters.js; remove the chapters-meta tooling (D-10 = B, the only branch)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T8 — Lazy-load chapters.js; remove the chapters-meta tooling (D-10 = B, the only branch).
1. OBJECTIVE: unblock first paint/entry from the 296 KB chapters.js payload; eliminate the stale-artifact freshness hazard; remove the known chapters-meta failure IF B-0 reproduced it — without absorbing unrelated baseline failures.
2. CONTEXT/EVIDENCE: echo-audit.md D8 + TASKS.md v4.2 T8 — TOC titles are hardcoded in index.html, so chapters.js is not needed for first paint; FACT: CHAPTERS_META has zero runtime consumers — its only consumer is the freshness check in tests/run-static.ps1 (≈:15, :46, :59–69 — re-locate by content); runtime emptiness derives from chapterTexts[index] (script.js ≈321–328). The known expected baseline failure (chapters-meta stale, 6808 vs 6807 — if B-0 reproduced it) is removed by this task.
3. FILES/AREAS: index.html (script chain ≈451–454, anchor `<script src="chapters.js">`); script.js — initProgress (≈1586), openChapter (≈677), every direct chapters/chapterTexts reference (≈321, 354–355, 441, 472, 679, 1534, 1550, 1588 — re-locate by symbol); sw.js (cache lists/comments); tests/run-static.ps1 (remove the meta freshness block); DELETE chapters-meta.js and tests/build-meta.ps1. Search the whole repo afterwards for `chapters-meta` and `CHAPTERS_META` — zero ACTIVE references may survive in runtime code, Service Worker configuration, active tests, or generators. SEARCH SCOPE TRUTHFULNESS (v1.2): historical/explanatory references inside documentation — echo-audit.md (evidence archive), CHANGELOG.md (history), DECISIONS.md (decision rationale), and the workflow documents ROADMAP.md / TASKS.md / IMPLEMENTATION-PLAYBOOK.md / IMPLEMENTATION-STATUS.md — are PRESERVED intentionally; they are records, not active references; report the search results as exactly that split, never as "zero references anywhere".
4. EXPECTED CHANGE: (1) delete chapters-meta.js, tests/build-meta.ps1, and the run-static meta check; (2) drop the classic chapters.js tag; (3) add `ensureChapters()` — a promise-cached dynamic script loader that is RETRY-SAFE (v1.1): a failed load must NOT leave a permanently rejected cached promise — on failure remove the injected script element, reset the cached promise to null, and allow a deliberate retry on the next open attempt; (4) optimistic TOC: render immediately from the hardcoded titles; .empty styling applies after load (placeholder dims a beat late — cosmetic, accepted); (5) EVERY chapter-opening path (TOC click, ?ch=N deep link, swRoute restore, prev/next, initProgress resume) awaits ensureChapters() and validates emptiness against the REAL chapterTexts; (6) an empty/whitespace-only chapter must never open through any path — and a chapter whose load FAILED must never open as if empty: failure and emptiness are distinct states, failure surfaces a retry path; (7) legacy lastChapter validated only after load: index in range AND chapter non-empty, else safe fallback WITHOUT losing settings or progress data; (8) chapters.js stays in the SW core precache (offline first-open must work); (9) idle prefetch after cover/intro starts; await-on-open shows a minimal inline shimmer; (10) progress counts computed/refreshed after load.
5. APPROACH: loader first, then consumers one by one; test each open path against a throttled network; test the failure path (blocked chapters.js request → retry succeeds).
6. DO-NOT-TOUCH: chapters.js itself (content/markers); TOC item markup; CACHE strategy bodies; version flow (T3).
7. ACCEPTANCE: cold throttled load → cover tappable before chapters.js completes; first chapter open ≤ baseline + 0.5 s when prefetch fired, graceful shimmer otherwise; offline first-open works; empty chapter can never open (prove via ?ch= on an empty index after load); failed load → no stuck rejected promise, script element removed, deliberate retry succeeds; legacy-save fixtures (valid / out-of-range / empty-target) each handled safely with progress preserved; no active implementation references to chapters-meta.js / CHAPTERS_META remain in runtime code, Service Worker configuration, active tests, or generators (historical documentation references preserved and reported as exactly that split); the chapters-meta freshness check and its generator are removed; the known chapters-meta failure, IF B-0 actually reproduced it, is eliminated; T8 introduces NO new unexplained failure against the B-0 record; unrelated pre-existing failures remain recorded and receive separate disposition — run-static.ps1 is claimed fully green ONLY when all recorded baseline failures have actually been resolved (v1.2); zero console errors.
8. CHECKS: DevTools Fast/Slow-3G cold-load timeline; fixture matrix via tests/browser/unit-state.html + manual localStorage seeding; offline reload + first-open; failure-injection retry test (block the chapters.js request once, then allow it); Select-String -Pattern "chapters-meta|CHAPTERS_META" -Path (repo) → hits only in documentation/historical records (echo-audit.md, CHANGELOG.md, DECISIONS.md, and explanatory mentions in the workflow *.md files); pwsh tests/run-static.ps1 → the meta failure gone, no new failures vs B-0; full green claimed only per the field-7 rule.
9. REGRESSION: resume-to-position, VOICE/PHOTO rendering, share-quote generation, SW precache contents, ?ch=N deep links, initProgress overlay.
10. PRECONDITIONS: Batch 1 complete — T1, T2, T4, T3, T7 committed (HARD dependency).
11. COMMIT MESSAGE: feat: lazy-load chapters.js, remove chapters-meta tooling (D8, D-10=B)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T9 — Fix cover centering on narrow viewports + safe-area padding

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T9 — Fix cover centering on narrow viewports + safe-area padding.
1. OBJECTIVE: eliminate the −15.6 px cover-image offset on phones; keep the bottom bar clear of the home indicator.
2. CONTEXT/EVIDENCE: echo-audit.md D11/A4 — live emulation: img flush-left inside a full-width stage because max-width:92% binds on narrow viewports and .cover-stage/.cover-tremor never center the img. Anchors: style.css ≈2440 `.cover-tremor {`, ≈116–127 `#cover-screen img {`, bottom-bar rule (chapter screen nav).
3. FILES/AREAS: style.css only.
4. EXPECTED CHANGE: center the img inside .cover-tremor (flex centering on the tremor wrapper, or margin-inline:auto + display:block on the img — implement one, verify both, keep the better); add `padding-bottom: env(safe-area-inset-bottom)` to the bottom bar; mirror the film screen's dvh pattern where vh is unsafe.
5. APPROACH: computed-geometry verification per viewport (getBoundingClientRect in console: stage center vs img center).
6. DO-NOT-TOUCH: the cover art file (Zastavka.jpg), mask/filter values, beckon logic (T14's surface).
7. ACCEPTANCE: emulated 320/390/430 px portrait+landscape: cover img centerOffsetX within ±1 px; bottom bar clears the home-indicator area; desktop cover unchanged. PHYSICAL-iPHONE check → PENDING-AUTHOR (PA-1 — never self-mark passed).
8. CHECKS: DevTools device toolbar at the four widths × two orientations + computed geometry; pwsh tests/run-static.ps1.
9. REGRESSION: beckon transforms, cover tap targets, desktop cover, film screen layout.
10. PRECONDITIONS: T8 committed (execution order).
11. COMMIT MESSAGE: fix: center cover image, add safe-area padding (D11/A4)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T11 — Rebuild VOICE glitch modes on WAAPI with three distinct choreographies

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T11 — Rebuild VOICE glitch modes on WAAPI with three distinct choreographies.
1. OBJECTIVE: give the book's signature effect three genuinely different movement languages; fix the D-3 dispatch violation; remove runtime stylesheet injection.
2. CONTEXT/EVIDENCE: echo-audit.md D13/A3 + D-3 — standard is currently two shadow blips (37/43 markers); 6 unmarked markers fall through to aggressive (violates the author-resolved hierarchy); runtime @keyframes string injection prevents per-step randomness. Anchors: script.js generators ≈963/≈1093/≈1127, dispatch ≈1170–1180, layer builder ≈980–986. Marker registry (structural FACT): 43 balanced markers — :standard ×37 (ch0:3, ch4:3, ch20:5, ch47:4, ch81:10, ch82:12), unmarked ×6 (ch20:2, ch31:1, ch33:2, ch47:1), zero :strong (intentional).
3. FILES/AREAS: script.js (generators, dispatch, layer lifecycles), style.css (retire the injected-keyframes remnants only).
4. EXPECTED CHANGE: (1) dispatch per D-3: unmarked→standard; :standard→standard; :strong→strong (aggressive-class); :whisper→whisper; unknown→standard + one-time console diagnostic naming the token; (2) STANDARD = WAAPI: base jitter (steps() timing, ±1–2 px, 8–12 steps/s) + slice bursts (two voice-slice layers, complementary clip-path insets, opposite ±4–8 px shears, 150–250 ms) + red/cyan peeks (opacity ≤0.5, ≤120 ms); bursts every 0.8–2.4 s randomized while in view; (3) STRONG = phased: snap-in (full slice tear ±8 px + chroma split ±3 px, 200–400 ms) → sustain → stepped decay (2–3 settle steps); intensity ceiling = today's aggressive visuals ported to WAAPI; (4) WHISPER unchanged; (5) delete the stylesheet string injection entirely; cancel animations via getAnimations().cancel() when out of view. HARD: decision 11 forbids ANY additional glyph distortion or character-noise effects — implement exactly this choreography, nothing more (the glitched-writer/A2 registry idea is NOT used). HARD: animated properties limited to transform, opacity, clip-path — ONLY (v1.1: the earlier filter permission is withdrawn); no layout-geometry animation (D-3), CLS = 0.
5. APPROACH: powerglitch (MIT) technique reimplemented natively — element.animate + steps(n, jump-start), per-step randomization; no dependency.
6. DO-NOT-TOUCH: chapters.js and all markers; the marker grammar; the layer builder structure (≈980–986); whisper visuals; width/height/top/left/margin/padding/filter animations.
7. ACCEPTANCE: three modes visually distinct in side-by-side captures (movement/character/phases — not just intensity); text fully readable during events; zero layout-shift entries attributable to VOICE; neighbor bounding boxes identical before/during/after (programmatic check); reduced-motion → whisper/no-op; no runtime stylesheet injection remains; unknown-token fallback fires with diagnostic; all 43 markers reviewed across ch 0,4,20,31,33,47,81,82; long-chapter scroll performance unchanged. Author visual review of the three modes → PA-11 (PENDING-AUTHOR — does not block completion).
8. CHECKS: captures per mode; Performance trace on the densest chapter (ch82); layout-shift measurement via PerformanceObserver; neighbor-geometry assertions in console; reduced-motion emulation; pwsh tests/run-static.ps1. STRONG-MODE VERIFICATION (v1.2): chapters.js contains ZERO `:strong` markers and its content/markers are frozen — verify the strong dispatch path on an ISOLATED SYNTHETIC DOM ELEMENT or a temporary browser test fixture; a `:strong` marker is NEVER added to or modified in chapters.js, not even temporarily; all three modes must be testable without editing the book content.
9. REGRESSION: PHOTO events in the same chapters (frozen subsystem — regression only), chapter scroll/nav, TOC entry.
10. PRECONDITIONS: T9 committed (execution order — NOT a hard dependency). T4 already removed the vibrate call near the shock path — do not reintroduce it.
11. COMMIT MESSAGE: feat: rebuild VOICE modes on WAAPI with distinct choreography (D13/A3, D-3)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T12 — Film double-tap skip with unified tap channel + exact hint

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T12 — Film double-tap skip with unified tap channel + exact hint.
1. OBJECTIVE: give the film interstitial a skip path that can never false-trigger from one physical touch.
2. CONTEXT/EVIDENCE: echo-audit.md D9/A5 — the film is a pure timeout chain, taps inert (live-verified). Anchors: script.js `function runFilmSequence()` ≈1807, timing block ≈1998–2031 (anchor `const LAMP_MS = 900`), the `later()` helper; index.html #film-screen. FACT: `touch-action` appears nowhere in the codebase — do not add or remove it. Skip scope (D-9, author-confirmed): double tap skips the ENTIRE remaining sequence to exactly the final state the sequence would reach on its own.
3. FILES/AREAS: script.js (film controller), index.html (#film-screen hint element), style.css (hint styling only).
4. EXPECTED CHANGE: (1) extend the `later()` helper into a clearable timer registry on the film controller; (2) tap detection guarantees ONE physical touch = ONE tap: unify on a single channel — pointerup with pointerType filtering, OR touchend with the subsequent synthetic click explicitly suppressed within the gesture window; (3) two genuine taps within 300 ms → clear the registry → run the sequence's own endToTitle() path (identical final state); single tap = no-op; (4) hint text EXACTLY «Дважды коснитесь, чтобы пропустить» (final author wording — no paraphrase) shown at lamp ignition, fading after 2 s, shown on every film play — NO persistent suppression flag; (5) reduced-motion: the hint TEXT remains visible as a readable static element — only its animation is disabled/removed, never the instruction itself.
5. APPROACH: hammer.js tap discipline as reference (movement/time thresholds), implemented natively; no dependency.
6. DO-NOT-TOUCH: frame timing tables, film CSS keyframes, viewport meta, touch-action anywhere, the global click→startSequence cover listener (must not re-fire), Zastavka.jpg, frames.
7. ACCEPTANCE: double-tap skips from any point including the lamp phase to the identical post-film state; single tap no-op; PROGRAMMATIC PROOF: dispatch a touch sequence + synthesized click → exactly one registered tap (no false skip); no zombie timers (skip at 1 s → no late class changes within 15 s); hint shows the exact text «Дважды коснитесь, чтобы пропустить»; hint static and readable under reduced-motion; full unskipped path intact; filmReady-skip branch intact. Physical iPhone Safari + Android Chrome verification → PENDING-AUTHOR (PA-2): emulation is useful for debugging but does NOT replace the author's physical-device acceptance checks.
8. CHECKS: programmatic gesture dispatch in the local page; timer-registry inspection; film full path; reduced-motion emulation; pwsh tests/run-static.ps1.
9. REGRESSION: title enter choreography, state flags, cover tap start, intro sequence.
10. PRECONDITIONS: T11 committed (execution order — NOT a hard dependency). NOTE: W-7/W-8 will reuse this unified-channel pattern — write it cleanly and document the arbitration window in the commit message.
11. COMMIT MESSAGE: feat: film double-tap skip with unified tap channel + hint (D9/A5)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T13 — Horizontal swipe recognizer for the menu

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T13 — Horizontal swipe recognizer for the menu.
1. OBJECTIVE: native swipe recognizer for menu open/close; remove the right-edge special-case.
2. CONTEXT/EVIDENCE: echo-audit.md D10/A6 — live-verified: menu opens only via tap or right-edge (>0.82·W) left-swipe on the chapter screen; no close gesture; touchend-snapshot logic without velocity/tracking. Anchors: script.js ≈540–556 (swipe block), openMenu ≈1227 / closeMenu / toggleMenu ≈1255.
3. FILES/AREAS: script.js only.
4. EXPECTED CHANGE: minimal recognizer (~60 lines, hammer.js criteria as reference — no dependency): touchstart records point/time; touchmove tracks dominant axis; touchend classifies a horizontal swipe when |Δx|≥64 px AND |Δx|>1.5·|Δy| AND duration ≤600 ms. Left-swipe on chapter + TOC screens opens the menu; right-swipe closes it when open; cancel on multi-touch or if vertical scrolling engaged first. Keep the tap trigger and the existing edge swipe working during the transition, then remove the edge special-case.
5. APPROACH: implement alongside the existing handlers; matrix-test before removing the edge case.
6. DO-NOT-TOUCH: vertical swipe navigation (chapter swipe-up next — SWIPE_LONG_THRESHOLD path), scroll handlers, photo overlay gestures (frozen subsystem — regression only).
7. ACCEPTANCE: swipe opens and closes the menu on chapter and TOC screens; a 100-swipe mixed-angle matrix shows zero false opens during vertical scroll; tap path unchanged; chapter swipe-up next-chapter intact; text selection unharmed.
8. CHECKS: scripted/swipe matrix in device emulation; manual pass on the local server; pwsh tests/run-static.ps1.
9. REGRESSION: cover gestures, reader sheet interactions, menu Esc/focus behavior (T16 builds here).
10. PRECONDITIONS: T12 committed (execution order). NOTE: shares the touch-event surface with W-8 — keep arbitration clean and document any global listeners added.
11. COMMIT MESSAGE: feat: horizontal swipe recognizer for menu (D10/A6)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T14 — Rebuild the cover idle rhythm and beckon element (decision 10 = A)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T14 — Rebuild the cover idle rhythm and beckon element (decision 10 = A).
1. OBJECTIVE: replace the dead beckon CSS and one-shot rhythm with a living IDLE→SURGE→LULL cycle and a high-contrast beckon ring.
2. CONTEXT/EVIDENCE: echo-audit.md D11/A7 — beckon fires once (7.5 s) then a near-invisible 7 s breath; dead #cover-screen.beckon-1/2/3 CSS documents an abandoned design. Anchors: script.js ≈2641–2660 `(function coverBeckon()`; style.css ≈2333–2355 (dead beckon CSS), ≈2443–2461 (beckon-play/beckon-settle), ≈2479–2510 (keyframes).
3. FILES/AREAS: script.js, style.css.
4. EXPECTED CHANGE: state machine EXACTLY IDLE → SURGE → LULL (the old IDLE → BECKON → SETTLE design is superseded — do not resurrect it): 20–40 s cycle; 3 s SURGE (WAAPI steps() micro-tremor on .cover-tremor + glow pulse + ripple pair); then LULL (breath only); beckon element rebuilt as a high-contrast double-outline ring anchored to the IMAGE RECT (img.getBoundingClientRect, recomputed on resize/orientationchange); dead beckon-1/2/3 CSS deleted; re-arm cleanly on visibilitychange; reduced-motion → static textual hint. Leave a documented hook point where W-8 will add a water impulse burst on surge (hook only — no water code in this task).
5. APPROACH: powerglitch steps() technique for the tremor; afterglow-crt rhythm as reference; no dependencies.
6. DO-NOT-TOUCH: the cover art file; the cover-breathe pseudo-element glow; T9's centering geometry (build on it).
7. ACCEPTANCE: cycle repeats indefinitely without single-frame jerks; ring contrast ≥3:1 measured on both bright and dark cover zones; no cover layout shift; works 320–1280 px; reduced-motion static path; composition stays centered (T9). Author visual review of the rhythm and ring → PA-12 (PENDING-AUTHOR — does not block completion).
8. CHECKS: long idle observation (2+ cycles) at multiple widths; contrast measurement via computed styles/screenshots; visibilitychange re-arm; pwsh tests/run-static.ps1.
9. REGRESSION: cover tap/swipe start, intro sequence start, cover mask/filter rendering, T9 geometry.
10. PRECONDITIONS: T9 committed (HARD dependency — the ring anchors to the corrected cover geometry); T13 committed (execution order).
11. COMMIT MESSAGE: feat: rebuild idle splash rhythm and beckon element (D11/A7)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T17 — TOC reveal stagger: continuous linear

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T17 — TOC reveal stagger: continuous linear.
1. OBJECTIVE: all 84 items fully visible within 2.5 s with a perceptible stagger.
2. CONTEXT/EVIDENCE: echo-audit.md D14 — current `200 + i * 80` puts the 84th item at ≈6.9 s. Anchor: script.js ≈1568–1584 (`200 + i * 80`).
3. FILES/AREAS: script.js only.
4. EXPECTED CHANGE: replace with EXACTLY the continuous linear `200 + i * 20` (indices 0–83 → 200…1860 ms) — no other formula. The capped variant `200 + Math.min(i,28)*60` is REJECTED (it collapsed items 29+ to identical delays). Keep idempotency (revealTimers clearing) and the reduced-motion instant path.
5. APPROACH: single-expression change + verification.
6. DO-NOT-TOUCH: item content/order, read/current state logic.
7. ACCEPTANCE: all 84 items fully visible ≤2.5 s after TOC show; stagger still perceptible; reduced-motion instant; rapid exit/enter safe (timers cleared).
8. CHECKS: timed observation + Performance marks; rapid TOC exit/enter ×10; reduced-motion emulation; pwsh tests/run-static.ps1.
9. REGRESSION: signal boot path, TOC states, electric-glitch coexistence.
10. PRECONDITIONS: T14 committed (execution order — NOT a hard dependency).
11. COMMIT MESSAGE: fix: continuous TOC reveal stagger (D14)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T6 — Gradual removal of the discontinued "new chapter" badge mechanism (D-2)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T6 — Gradual removal of the discontinued "new chapter" badge mechanism (D-2).
1. OBJECTIVE: remove the full badge dependency chain; keep old saves loading.
2. CONTEXT/EVIDENCE: D-2 — the "new chapter" badge mechanism is discontinued; this task removes the complete dependency chain while old saves keep loading. The complete Stage-1.5-verified consumer map is EMBEDDED HERE so this prompt executes WITHOUT opening TASKS.md (line numbers are anchors from the pinned snapshot — re-locate by symbol/structure after neighboring edits). script.js: `normalizeSeenNew(s.seenNew)` ≈ line 107; the `lastVisit` / `prevVisit` normalization ≈ line 117; the prevVisit rollover IIFE ≈ 309–317; the `seenNew` and `prevVisit` locals in `updateContentsMemory` ≈ 350–351; the `isNew` calculation ≈ 386–388; `.toggle('new', isNew)` ≈ 393; the `seenNew` clearing in `openChapter` ≈ 716–720; the `lastVisit` write in `saveState` ≈ 757. style.css: `.contents-item.new .dot` ≈ 2249; `.contents-item.new:not(.current)` ≈ 2258; in the reduced-motion selector list ≈ 2432 remove ONLY the `.contents-item.new .dot` selector — preserve the containing block and every other selector. Other files: README.md badge paragraph ≈ line 15; tests/browser/unit-state.html badge normalization test ≈ 74–79 and legacy fixture keys ≈ 101–102; tests/browser/effects-lab.html seeded `lastVisit` ≈ 43; tests/browser/focusprobe.html seeded `lastVisit` ≈ 17. FACT: loadState tolerates unknown keys (unit-state.html:79) — old saves carrying seenNew/prevVisit/lastVisit simply ignore them; badge-era keys remaining in stored echo_state are harmless unknown legacy data — NO migration and NO deletion of stored keys.
3. FILES/AREAS: script.js, style.css, README.md, the three test files listed.
4. EXPECTED CHANGE — the exact five-step removal sequence: (1) remove the isNew logic — the `isNew` calculation ≈ 386–388, the `.toggle('new', isNew)` class toggling ≈ 393, the `seenNew` clearing in `openChapter` ≈ 716–720, the prevVisit rollover IIFE ≈ 309–317, and the associated `seenNew` / `prevVisit` locals in `updateContentsMemory` ≈ 350–351; (2) remove the `lastVisit` write in `saveState` ≈ 757 and the badge-era normalization entries in loadState — `normalizeSeenNew(s.seenNew)` ≈ 107 and the `lastVisit` / `prevVisit` normalization ≈ 117; (3) remove ONLY the three CSS entries listed in field 2 (≈ 2249, ≈ 2258, and the single `.contents-item.new .dot` selector inside the reduced-motion list ≈ 2432), preserving every unrelated style and the containing reduced-motion block; (4) update the README.md badge paragraph ≈ 15 to state that the feature is discontinued; (5) update the specified fixtures/assertions — unit-state.html ≈ 74–79 (badge normalization test) and ≈ 101–102 (legacy fixture keys), effects-lab.html ≈ 43 and focusprobe.html ≈ 17 (seeded `lastVisit`). Do NOT touch PUBLISHED_AT in chapters.js (author's data, inert record), chapter content, or any marker. No migration, no deletion of stored keys.
5. APPROACH: execute the five steps in the order given; re-locate every anchor by symbol/structure, not by line number; after each step re-run the affected unit-state fixtures; verify old-save compatibility explicitly at the end. TASKS.md T6 remains additional evidence — it is NOT a required instruction source for this prompt.
6. DO-NOT-TOUCH: PUBLISHED_AT, chapters.js, .dot base styles (other consumers exist).
7. ACCEPTANCE: TOC renders read/current/empty states and the progress line exactly as before; no `.new` class ever applied; old fixture state (all three badge-era keys) loads with progress and settings intact; `grep -n "seenNew\|prevVisit\|lastVisit\|PUBLISHED_AT" script.js` → no matches; run-static unaffected.
8. CHECKS: grep; unit-state fixtures (updated in this task); manual TOC states pass; pwsh tests/run-static.ps1.
9. REGRESSION: updateContentsMemory logic, progress line, deep-link/swRoute guards, state sanitation tests.
10. PRECONDITIONS: T17 committed (execution order — NOT a hard dependency).
11. COMMIT MESSAGE: chore: remove discontinued badge mechanism (D-2)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T18 — Add echo_state schema version

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T18 — Add echo_state schema version.
1. OBJECTIVE: give future state migrations a hook.
2. CONTEXT/EVIDENCE: echo-audit.md §6.2 — no schema version exists; today additive-only, low risk. Anchors: script.js loadState/saveState (anchor `echo_state`), corrupt-quarantine block (`echo_state_backup`).
3. FILES/AREAS: script.js only.
4. EXPECTED CHANGE: write `v: 1` into echo_state on save; on load, absent `v` ⇒ treat as v0 → upgrade in place (no field changes today); keep the quarantine behavior for corrupt JSON.
5. APPROACH: minimal addition; fixture-test legacy states.
6. DO-NOT-TOUCH: existing key names/semantics; the quarantine design.
7. ACCEPTANCE: v-less fixture loads with progress intact; new saves carry `v`; corrupt JSON still quarantines; post-T6 legacy keys load cleanly.
8. CHECKS: fixture matrix (v-less / v:1 / corrupt / post-T6-keys) via unit-state.html + manual localStorage seeding; resume-to-position; pwsh tests/run-static.ps1.
9. REGRESSION: settings persistence, resume, progress counts.
10. PRECONDITIONS: T6 committed (HARD dependency — this task documents the post-T6 state surface).
11. COMMIT MESSAGE: feat: echo_state schema version (audit §6.2)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T15 — Verified one-button publish flow (dry-run only — hard constraints)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION: this task edits the author's publish script. You may only ever dry-run its logic against local fixtures. NEVER execute a real publish, push, or deployment; never invoke the live script; never use a real remote; never access production; do not implement the GitHub Action idea.

TASK T15 — Verified one-button publish flow (dry-run only — hard constraints).
1. OBJECTIVE: pre-push guards + version bump + post-deploy verification for the AUTHOR's manual use; document that no local script can guard manual uploads via the GitHub web interface.
2. CONTEXT/EVIDENCE: echo-audit.md §19/D2 — the script has no version increment, no post-deploy verification, weak guards; web uploads bypass everything. Files: push-echo.cmd (whole flow), version.js/sw.js (per T3's model), README.md (limitation note). The audit §19 optional GitHub Action idea is NOT an active instruction — do not implement it (v1.1).
3. FILES/AREAS: push-echo.cmd, README.md.
4. EXPECTED CHANGE: pre-push: fail on dirty tree/wrong branch; bump ECHO_VERSION in version.js (single source — the SW derives the cache name per T3); node --check on JS files + run-static.ps1 gate; commit + push (never --force); post-check: after 20–40 s, cache-bypassed GET of production version.js + index.html + sw.js, compare version string and sha256 to local; print PASS/FAIL with URLs; warn on a repeat push with an unchanged tree. cmd/PowerShell + Invoke-WebRequest only — no new dependencies. D-10 = B: NO chapters-meta step exists — do not add one. Add an explicit limitation paragraph (script header + README): this script cannot guard uploads performed manually through the GitHub web interface.
5. APPROACH: static edit; test the logic against local fixtures and a simulated bump. DRY-RUN CONSTRAINTS (hard, v1.1): NEVER invoke the live publish script; NEVER execute real commit/push/deploy actions through it; NEVER use a real GitHub remote in a dry-run; NEVER access production for verification; demonstrate the post-check logic against a LOCAL FIXTURE HTTP SERVER only.
6. DO-NOT-TOUCH: GitHub Pages mechanics; credential handling beyond existing git auth; the run-static viewport check (byte-identical, D-1).
7. ACCEPTANCE — the responsibilities are split (v1.2). KIMI VERIFIES (local only): simulated version bump; pre-push guard logic; post-check logic demonstrated against a LOCAL FIXTURE HTTP SERVER; dirty-tree, wrong-branch, version-mismatch, and no-network cases each print actionable diagnostics; all pre-existing guards still run; the limitation paragraph is present in both the script header and README; recorded evidence that NO real remote, real commit/push/deploy, live publish script, GitHub Action, or production endpoint was invoked during testing. THE AUTHOR VERIFIES AFTER PUBLISHING (never Kimi): the actual production GET of version.js, index.html, and sw.js; version-string and SHA-256 comparison; the real post-deployment result. The script must RETAIN its author-operated real production verification capability — the restriction is on Kimi EXECUTING it, not on implementing it for the author.
8. CHECKS: dry-run scenarios against the local fixture server (dirty tree, wrong branch, simulated bump, no-network); pwsh tests/run-static.ps1.
9. REGRESSION: run-static viewport check byte-identical; existing guards unchanged.
10. PRECONDITIONS: T18 committed (execution order); T3 + T8 committed (HARD dependency — the version model and the post-meta tooling shape must be in place).
11. COMMIT MESSAGE: chore: verified one-button publish flow with documented limits (audit §19)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T16 — Keyboard/ARIA pass with behavior-based overlay semantics

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T16 — Keyboard/ARIA pass with behavior-based overlay semantics.
1. OBJECTIVE: full keyboard operability + truthful assistive-technology semantics.
2. CONTEXT/EVIDENCE: echo-audit.md §11.4 — no Esc-to-close; focus unmanaged; icon buttons unnamed. Anchors: script.js openMenu ≈1227/closeMenu, reader sheet open/close, photo overlay; index.html #menu-overlay, #reader-sheet, #install-overlay, #photo-overlay, icon buttons (#menu-trigger, #install-trigger). Blanket role="dialog"/aria-modal on everything is WRONG — semantics must match behavior.
3. FILES/AREAS: script.js, index.html.
4. EXPECTED CHANGE: (1) FIRST inventory each overlay's actual interaction behavior (menu, settings sheet, resize sheet, photo overlay, install prompt): genuinely modal (blocks the page beneath) vs non-modal (coexists) — record the inventory with justifications in the commit message; (2) only genuinely modal surfaces get role="dialog" + aria-modal="true" + focus trap; (3) non-modal surfaces get suitable semantics (labelled region/group) with focus movement on open and focus return on close — never falsely announced as modal; (4) Esc closes the topmost overlay everywhere; (5) aria-label on icon-only buttons; (6) PHOTO: strictly necessary accessibility parity only — NO behavior change (frozen subsystem).
5. APPROACH: inventory → implement per-overlay → keyboard walkthrough.
6. DO-NOT-TOUCH: visual design of overlays; PHOTO behavior beyond accessibility parity.
7. ACCEPTANCE: full keyboard path without a mouse: TOC → open chapter → open settings → change size → Esc → Esc → back to TOC; every overlay's announced modality matches the recorded inventory; focus returns to the trigger; swipe/tap paths (T13) unaffected. NVDA/VoiceOver pass → PENDING-AUTHOR (PA-3/PA-4).
8. CHECKS: keyboard-only walkthrough; DevTools accessibility tree inspection per overlay; pwsh tests/run-static.ps1.
9. REGRESSION: T13 swipe paths, inert toggling, reader sheet sliders, menu open/close.
10. PRECONDITIONS: T15 committed (execution order — NOT a hard dependency); T13 committed (HARD dependency — open/close paths).
11. COMMIT MESSAGE: feat: keyboard/ARIA pass with behavior-based overlay semantics (audit §11.4)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T19 — noscript fallback page

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T19 — noscript fallback page.
1. OBJECTIVE: with JavaScript disabled, show a meaningful styled page instead of a black void.
2. CONTEXT/EVIDENCE: echo-audit.md §8 — the routing-pending mechanism hides everything without JS. Areas: index.html (head ≈27 routing-pending style; end of body for the noscript block).
3. FILES/AREAS: index.html only.
4. EXPECTED CHANGE: add a <noscript> block: an inline <style> neutralizing the routing-pending hiding + a static message (book title, author, note that JavaScript is required, contact per the menu's existing content).
5. APPROACH: minimal static addition; test both modes.
6. DO-NOT-TOUCH: script order (post-T1/T8 state); the routing-pending mechanism itself.
7. ACCEPTANCE: JS disabled → meaningful styled page renders; JS enabled → the noscript block is inert and boot is unaffected.
8. CHECKS: DevTools → disable JavaScript → reload; re-enable → full boot; pwsh tests/run-static.ps1.
9. REGRESSION: boot sequence, SW install.
10. PRECONDITIONS: T16 committed (execution order — NOT a hard dependency).
11. COMMIT MESSAGE: feat: noscript fallback (audit §8)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T20 — Ship the OFL font license files

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — NETWORK: permitted ONLY to download official font license/copyright files from verified upstream sources — nothing else.

TASK T20 — Ship the OFL font license files.
1. OBJECTIVE: make the README's OFL claim true — license texts ship with the fonts.
2. CONTEXT/EVIDENCE: echo-audit.md §10.5 — OFL claimed in README; no license files present. Bundled fonts (FACT, fonts/ dir): PT Serif 400/700 + italic (cyrillic+latin), Golos Text (cyrillic+latin) — both SIL OFL 1.1.
3. FILES/AREAS: fonts/ (new text files only), README.md.
4. EXPECTED CHANGE: download the official OFL 1.1 texts and the upstream copyright notices for PT Serif (Paratype) and Golos Text (Paratype/Google Fonts) from the exact upstream releases matching the bundled files; place them in fonts/ (e.g. OFL.txt + per-family notices); link them from README.md.
5. APPROACH: verify upstream provenance before saving; record source URLs in the commit message.
6. DO-NOT-TOUCH: font binaries; style.css font-face blocks (T22's surface).
7. ACCEPTANCE: license files present and correct for the exact bundled versions; README accurately links them.
8. CHECKS: file review; README render; pwsh tests/run-static.ps1.
9. REGRESSION: none.
10. PRECONDITIONS: T19 committed (execution order — NOT a hard dependency). NOTE: T20 must land strictly BEFORE T22 (license discipline — hard).
11. COMMIT MESSAGE: chore: ship OFL license files (audit §10.5)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T22 — Genuine Golos Text Medium 500 / Bold 700 woff2 (D-4 = A)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — NETWORK: permitted ONLY to download official Golos Text font binaries from the verified upstream (Paratype / Google Fonts) — nothing else.

TASK T22 — Genuine Golos Text Medium 500 / Bold 700 woff2 (D-4 = A).
1. OBJECTIVE: stop serving weight-400 files for the 500/700 @font-face declarations (faux-bold today).
2. CONTEXT/EVIDENCE: echo-audit.md D4 — style.css ≈51–81 declares 500/700 but points at the 400 files. D-4 resolved: ship genuine files (OFL, cyrillic+latin).
3. FILES/AREAS: fonts/ (2 new woff2), style.css (the two @font-face blocks), sw.js (add the new files to the non-blocking extra cache group).
4. EXPECTED CHANGE: obtain genuine Golos Text Medium (500) and Bold (700) woff2, cyrillic+latin subsets, from the verified upstream; point the 500/700 blocks at the new files; record the ACTUAL byte sizes in the commit message (the old "+40–60 KB" was an estimate — measure the real files); add both files to the SW extra cache group.
5. APPROACH: verify fontTools/metadata weight class (500/700) before wiring; visual check after.
6. DO-NOT-TOUCH: PT Serif blocks; other @font-face declarations.
7. ACCEPTANCE: DevTools → Fonts panel shows the genuine 500/700 files rendering .book-title and UI labels (not synthesis from 400); no faux-bold stroke; title layout width shift reviewed and acceptable; actual sizes recorded in the commit message. iOS Safari genuine-weight check AND the author's visual review of the title (genuine Medium/Bold use on physical iPhone Safari, title appearance, width-change assessment, overall acceptance of the final typography) → PENDING-AUTHOR (PA-5, expanded v1.2 — never a Kimi Code approval requirement).
8. CHECKS: Fonts panel inspection; side-by-side title capture; SW cache contents include the new files; pwsh tests/run-static.ps1.
9. REGRESSION: install overlay precache, UI typography everywhere Golos is used.
10. PRECONDITIONS: T20 committed (HARD dependency — license discipline; T20 strictly before T22).
11. COMMIT MESSAGE: fix: genuine Golos Text 500/700 weights (D4, D-4=A; +NN KB actual)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T25 — Electric-glitch visual variants (timing frozen)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T25 — Electric-glitch visual variants (timing frozen).
1. OBJECTIVE: three quality variants of the per-item TOC electric-glitch; frequency/duration/triggering untouched.
2. CONTEXT/EVIDENCE: Step-2 directive (visual quality only). Anchors: script.js ≈858–921 (triggerGlitch; GROUP_SIZE / INTERVAL_MS / GLITCH_DURATION — FROZEN); style.css electric-glitch keyframes ≈1346–1364.
3. FILES/AREAS: style.css, script.js (variant picker only).
4. EXPECTED CHANGE: three distinct variants — shear / chroma-walk / drop-frame — with a seeded no-immediate-repeat picker; same property set as today (transform/text-shadow/clip-path); palette pair only; steps(1) timing kept. Constants and gating logic untouched — assert programmatically.
5. APPROACH: powerglitch vocabulary, vault66-crt parameter discipline; no dependencies.
6. DO-NOT-TOUCH: GROUP_SIZE/INTERVAL_MS/GLITCH_DURATION, trigger/gating logic, analog-drop (T26's surface), TOC item text.
7. ACCEPTANCE: three visually distinct renderings of the same 1.2 s event across consecutive triggers (captures); programmatic assertion that the timing constants are unchanged; zero animation under reduced-motion; read/current/empty TOC states survive.
8. CHECKS: consecutive-trigger captures; constant assertions (console); reduced-motion emulation; pwsh tests/run-static.ps1.
9. REGRESSION: TOC states, reveal stagger (T17), analog-drop coexistence.
10. PRECONDITIONS: T22 committed (execution order — NOT a hard dependency); T2 committed (HARD dependency — repaired CSS subsystem + parser gate).
11. COMMIT MESSAGE: feat: electric-glitch visual variants, timing frozen (Step-2 §6)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T26 — Analog-drop visual quality (timing frozen)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T26 — Analog-drop visual quality (timing frozen).
1. OBJECTIVE: make the whole-TOC drop read as a directional sweep with decay; scheduler and duration untouched.
2. CONTEXT/EVIDENCE: Step-2 directive. Anchors: script.js ≈904–915 (25000+rand(15000) scheduler — FROZEN); style.css analog-drop + scanline-fly ≈1405–1411; the 200 ms duration — FROZEN.
3. FILES/AREAS: style.css only.
4. EXPECTED CHANGE: two-phase brightness profile (bright lead edge + decay trail; beam-hold curve reference: afterglow-crt) + sub-1 px vertical root jitter during the 200 ms (transform-only).
5. APPROACH: CSS-only; parameter sanity bounds from vault66-crt ranges.
6. DO-NOT-TOUCH: the scheduler, the 200 ms duration, triggers, reduced-motion behavior.
7. ACCEPTANCE: drop reads as a directional sweep with decay (frame captures); scheduler and duration asserted unchanged programmatically; reduced-motion off; no moiré against the scanlines; legibility during the event.
8. CHECKS: frame captures across several drops; constant assertions; moiré check at multiple widths; pwsh tests/run-static.ps1.
9. REGRESSION: CRT overlay, scanlines, TOC legibility, electric-glitch coexistence.
10. PRECONDITIONS: T25 committed (execution order — NOT a hard dependency); T2 committed (HARD dependency — CSS surface + parser gate).
11. COMMIT MESSAGE: feat: analog-drop visual quality pass, timing frozen (Step-2 §6)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt T23 — Phosphor ghost layer: evidence-based verdict (final Track-1 slot, after T26)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.

TASK T23 — Phosphor ghost layer: evidence-based verdict (final Track-1 slot, after T26).
1. OBJECTIVE: determine on evidence whether a phosphor ghost layer improves CRT depth without regressions; adopt or discard automatically.
2. CONTEXT/EVIDENCE: afterglow-crt (MIT) ghost-layer pattern — blurred ultra-low-opacity duplicate (opacity 0.02–0.05, blur 1–2 px). Areas: style.css CRT overlay section (anchor @keyframes crt-noise-shift, post-T2 region); at most one static div in index.html.
3. FILES/AREAS: style.css, possibly index.html (one static div).
4. EXPECTED CHANGE: (1) capture a reproducible BASELINE: screenshots + frame-time trace on non-reading screens (cover/title/TOC); (2) implement the ghost-layer variant limited to non-reading screens; capture under IDENTICAL conditions; (3) compare visual depth/persistence; (4) verify reading-screen exclusion and text readability; (5) measure rendering/frame-time impact (Performance trace, desktop Chromium; CPU throttle 4× sensitivity check); (6) VERDICT: adopt ONLY if improvement is clear AND no performance or readability regression — otherwise remove the experimental code completely; (7) record the verdict + evidence in the commit message and IMPLEMENTATION-STATUS.md.
5. APPROACH: A/B under fixed viewport/steps; honest measurement; the decision rule is pre-approved — apply it, do not ask.
6. DO-NOT-TOUCH: reading-screen CRT layers; reduced-motion behavior (ghost off under reduced-motion either way).
7. ACCEPTANCE: A/B evidence + frame cost recorded; exactly one outcome committed: adopted-with-evidence OR discarded-with-evidence (experimental code removed).
8. CHECKS: screenshots diff review; Performance traces both variants; reduced-motion emulation; pwsh tests/run-static.ps1.
9. REGRESSION: CRT overlay on chapter screens (must stay as-is unless the verdict explicitly extends it — default: no).
10. PRECONDITIONS: T26 committed (execution order — this is the final Track-1 slot: T25 → T26 → T23); T2 committed (HARD dependency — CRT CSS surface).
11. COMMIT MESSAGE: feat: phosphor ghost layer — adopted on evidence (M1)   [OR]   docs: phosphor ghost layer discarded — evidence recorded (M1)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-1 — Formalize the approved ASCII-WATER visual direction (specification task — NO renderer)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-1 — Formalize the approved ASCII-WATER visual direction (specification task — NO renderer).
1. OBJECTIVE: lab/ascii-water/design.md contains every parameter W-2 needs — for the ONE approved direction, not alternatives.
2. CONTEXT/EVIDENCE: author decisions 4–7 (final): hybrid spatial character density; night-water landscape with shoreline band + distant light column + mirrored reflection below the waterline; wave height → displacement/refraction primary, brightness/density secondary; calm idle with rare small perturbations (no rain); procedural rendering; CRT treatment integrated without overwhelming the characters. Research base: echo-audit.md §11 (historical context only — the decisions above govern).
3. FILES/AREAS: CREATE lab/ascii-water/design.md only. W-1 is a SPECIFICATION task (v1.1): it does NOT demand a renderer or any visual output. Any rough sketch made while working is illustrative only, is never acceptance evidence, and is never presented as an unresolved direction or author choice gate. Actual rendering confirmation belongs to W-2.
4. EXPECTED CHANGE: design.md with: scene composition (sky band, shoreline band, water band with waterline Y as viewport fraction, light column position/width/height); character ramp tables (density-ordered, 8–12 glyphs per ramp) + the spatial density map (dense ramps: light column, reflection highlights, shoreline texture; sparse ramps: open sky/water); the 4×4 Bayer matrix definition; night grade values (background #06080a family, cyan-green glow family); scanline/vignette/grain amounts referencing the project's existing CRT tokens; glyph-size ladder 8/10/12 px; idle parameters (drift speed, ambient perturbation rarity — rare, low-energy, on the order of one small impulse per 20–60 s PTV); reduced-motion static frame spec.
5. APPROACH: write the table from the decisions; every value traceable to a decision or marked PTV; no rendering required.
6. DO-NOT-TOUCH: any production file; Zastavka.jpg; chapters.js. Glyph ramps must never encode or suggest chapter text.
7. ACCEPTANCE: W-2 can implement from design.md without inventing values; every parameter traceable to a decision or marked PTV; the written specification unambiguously describes night water with shoreline + light column + mirrored reflection; no unresolved "direction choices" remain in the document. (Confirmation that the RENDERED scene reads as intended is W-2's acceptance, not W-1's.)
8. CHECKS: table completeness review against the decisions list.
9. REGRESSION: none (lab only).
10. PRECONDITIONS: B-0 committed.
11. COMMIT MESSAGE: docs: ASCII-WATER visual direction parameters (W-1)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-2 — Complete ASCII rendering pipeline (7 steps, native browser JS only)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-2 — Complete ASCII rendering pipeline (7 steps, native browser JS only).
1. OBJECTIVE: the lab page renders the full meaningful night landscape as ASCII at interactive rates, with instrumentation.
2. CONTEXT/EVIDENCE: design.md (W-1). Technique reference: kciter/ascii-3d-renderer.js (MIT) — density→char ramps, glyph atlas pre-render + per-cell drawImage; reimplement, no dependency. The pipeline is fixed (Step-4 §4.2) — all seven steps, in order: (1) generate the procedural night landscape; (2) render shoreline, light column, scene lighting into an offscreen buffer; (3) produce the mirrored reflection below the waterline; (4) apply wave-field displacement when sampling the reflection (identity hook until W-3); (5) convert scene/reflection luminance to the hybrid ASCII representation (spatial density per design.md); (6) apply 4×4 Bayer ordered dithering in quantization (MANDATORY — must not disappear); (7) apply night grade, restrained glow, scanlines, vignette, grain.
3. FILES/AREAS: CREATE lab/ascii-water/index.html, js/scene.js, js/renderer.js, js/metrics.js. ORCHESTRATION (v1.1): the lab page wires these modules together with NATIVE BROWSER JAVASCRIPT ONLY — plain script composition consistent with the no-build/no-framework constraint; no invented bootstrap, loader, bundler, or module framework.
4. EXPECTED CHANGE: offscreen scene buffer → per-cell luminance sampling → glyph atlas lookup → drawImage per cell into the visible canvas; atlas pre-rendered per ramp per cell size (8/10/12 px); rAF loop; metrics.js overlay: FPS, p95 frame time, dropped-frame ratio, payload size. A plain gradient is allowed as a development fixture but does NOT satisfy acceptance.
5. APPROACH: build the pipeline stepwise; verify each stage visually; then measure.
6. DO-NOT-TOUCH: any production file; no external dependencies; no build step.
7. ACCEPTANCE: the lab page displays the COMPLETE landscape — shoreline + light column + mirrored reflection readable as a character-rendered scene (this is where the rendering confirmation lives); Bayer dithering visibly present in gradient zones; 8/10 px modes functional; instrumentation live; frame rate at 12 px cells on desktop Chromium measured and recorded — 60 FPS here is a DIAGNOSTIC/ASPIRATIONAL figure, NOT a gate: falling short of 60 FPS does not block W-2 (the only binding FPS gate is ROADMAP §7.2, exercised at W-5 and W-9); measurements recorded in the session report.
8. CHECKS: local server → /lab/ascii-water/; FPS meter + overlay numbers (two runs: cold/warm); DevTools network for payload.
9. REGRESSION: none (lab only).
10. PRECONDITIONS: W-1 committed (HARD dependency — the parameter table).
11. COMMIT MESSAGE: lab: complete ASCII-WATER rendering pipeline (W-2)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-3 — Wave physics: displacement-refraction model

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-3 — Wave physics: displacement-refraction model.
1. OBJECTIVE: believable water surface whose PRIMARY visual effect is refraction/displacement of the reflected scene.
2. CONTEXT/EVIDENCE: decision 6: wave height primarily causes geometric displacement/refraction of the reflected scene; glyph density/brightness respond secondarily. decision 7: calm idle, rare small perturbations, NO rain/drizzle/constant ripple field. Algorithm reference: victorqribeiro/rippleEffect (MIT) — Hugo Elias two-buffer height field, damping ≈0.999 — REIMPLEMENT independently, no dependency.
3. FILES/AREAS: CREATE lab/ascii-water/js/waves.js; hook into renderer.js (the W-2 displacement hook).
4. EXPECTED CHANGE: two-buffer height-field simulation on the coarse grid (96×54 class at 12 px cells, scaled with the ladder). Model (the ONLY one): primary output = horizontal displacement when sampling the mirrored scene (offset ∝ height-field gradient); secondary output = modest modulation of glyph brightness/density. Absorbing/damped boundaries (extra damping at border cells) — NO mirrored-edge reflection, NO wrap-around. Maximum 3 active ripple sources, oldest recycled. Slow underlying drift (low-frequency phase offset feeding the displacement sampler). Idle: calm — rare low-energy ambient impulses only (≈ one per 20–60 s, PTV). Internal lab API: drop(x, y, strength, radius) in grid coordinates (the radius-capable signature stays lab-internal; production gets a documented default radius — W-7/W-8). Stability guard: NaN/blow-up detection resets the field silently.
5. APPROACH: implement the buffer math; wire the displacement sampler first; verify refraction visually; then add the secondary modulation.
6. DO-NOT-TOUCH: any production file; W-2's seven pipeline steps (the displacement hook is step 4); no rain mechanisms.
7. ACCEPTANCE: waves visibly refract the reflected scene (displacement, not just brightness); secondary brightness/density response present but modest; boundaries absorb (no edge bounce); 3-source cap + recycling demonstrable; idle state calm and alive; 60 s numeric stability run clean; physics+render frame rate on desktop Chromium measured and recorded — 60 FPS here is DIAGNOSTIC/ASPIRATIONAL, NOT a gate: falling short does not block W-3 (the binding gate is ROADMAP §7.2 at W-5/W-9).
8. CHECKS: console-driven drop() tests; stability run with metrics overlay; FPS measurement.
9. REGRESSION: W-2 pipeline still renders the complete scene.
10. PRECONDITIONS: W-2 committed (HARD dependency — the renderer).
11. COMMIT MESSAGE: lab: wave-field physics with displacement-refraction model (W-3)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-4 — Full input model (touch + mouse)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-4 — Full input model (touch + mouse).
1. OBJECTIVE: every approved input type drives the wave field correctly in the lab.
2. CONTEXT/EVIDENCE: decision 8 + the approved gesture model (ROADMAP v2.2 §9): touch tap vs drag; drag wake; consecutive impulses; multitouch capped at W-3's limit (3); desktop mouse HOVER (no buttons) = subtle low-energy waves; mouse drag = wake trail; stationary mouse click = strong splash; velocity-based intensity with safe clamping. Tap criteria reference: hammer.js (movement <8 px AND <250 ms = tap; crossing the drag threshold makes it a drag, never both).
3. FILES/AREAS: CREATE lab/ascii-water/js/input.js.
4. EXPECTED CHANGE: unified Pointer Events layer: tap/drag arbitration with the criteria above; drag wake = impulse trail along movement, strength ∝ velocity (clamped); consecutive impulses; multitouch ≤3 active sources; hover impulses throttled (≥40 ms apart, strength floor); click = strong splash; pointer↔grid coordinate conversion accounting for DPR and current cell size; pointercancel/blur/loss-of-focus clears active pointers; tap events exposed separately via a callback (for W-7); touch-action:none on the lab canvas ONLY (lab pattern — not production).
5. APPROACH: implement per input type; test mouse on desktop, touch via device emulation; log every gesture→effect mapping.
6. DO-NOT-TOUCH: any production file; production entry handling is not represented here.
7. ACCEPTANCE: every listed input produces its specified visible response on desktop Chromium (mouse) + emulated touch; multitouch 2–3 contacts tracked independently; tap callback fires with coordinates; cancellation leaves no stuck sources; event→next-frame latency measured by metrics.js.
8. CHECKS: input matrix run; DevTools touch emulation; metrics overlay latency readout.
9. REGRESSION: W-3 physics intact.
10. PRECONDITIONS: W-3 committed (HARD dependency — the impulse API).
11. COMMIT MESSAGE: lab: full pointer/mouse input model (W-4)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-5 — Performance matrix + adaptive quality ladder (+ S1 documentation sync)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exceptions (v1.2): (a) IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13); (b) CONDITIONAL S1 documentation-only synchronization — IF and only if engineering tuning values actually changed, this task's commit may also update the affected parameter references in ROADMAP.md (§7.2, the W-2 hook note, W-5) and IMPLEMENTATION-PLAYBOOK.md (the corresponding technical section and affected prompts), strictly limited to the changed values; no unrelated documentation edits; no separate S1 task or commit is created. Neither exception authorizes any other out-of-scope change, and no production file may be touched.

TASK W-5 — Performance matrix + adaptive quality ladder (+ S1 documentation sync).
1. OBJECTIVE: quality.js implements the one approved ladder/hysteresis; performance-report.md records the §7.2 matrix for every environment actually tested.
2. CONTEXT/EVIDENCE: decision 13 — the ONLY hard threshold: ≥30 FPS sustained for 10 continuous minutes on (1) desktop Chromium, (2) physical mid-range Android + Chrome, (3) physical iPhone + Safari. 55 FPS is a target, not a minimum. All other measurements are diagnostics. The ONE ladder: 8 px high / 10 px medium / 12 px low. The ONE hysteresis policy — current documented values: downgrade one level when p95 frame time over the last 90 frames > 16 ms; upgrade one level when p95 over the last 600 frames < 11 ms; minimum 5 s dwell between changes; one level per evaluation (no oscillation); if 12 px cannot sustain 30 FPS for 60 s → graceful static fallback frame. DPR cap 1.5. These values are ENGINEERING TUNING PARAMETERS (v1.1) — a single documented current value set, not frozen law: if profiling justifies adjusting them, do it ONCE, record the rationale in performance-report.md, and propagate the tuned values IN THE SAME W-5 COMMIT to ROADMAP.md (§7.2, the W-2 hook note, W-5) and to this playbook (the corresponding technical section and the affected prompts) — strictly the affected parameter references, no unrelated documentation edits (the conditional file-scope exception in the safety addition above) — BEFORE W-6 begins; that propagation IS the S1 checkpoint (documentation-only; not an author gate; not an implementation task; NO separate S1 task or commit is created). If nothing changed, S1 is satisfied by an explicit no-change confirmation in your completion report and STATUS.
3. FILES/AREAS: CREATE lab/ascii-water/js/quality.js, lab/ascii-water/performance-report.md.
4. EXPECTED CHANGE: quality.js: ladder + hysteresis + scanline/vignette/grain tiers tied to levels + static fallback; performance-report.md: every §7.2 diagnostic (payload, time-to-first-water-frame, time-to-first-responsive-touch, mean FPS, p95 frame time, dropped-frame ratio, 10-min stability, adaptive behavior, cold/warm cache, reduced-motion) per environment ACTUALLY tested — desktop rows by you (Kimi); physical-device rows left PENDING-AUTHOR with the §7.10 procedures referenced.
5. APPROACH: implement quality.js; validate hysteresis under DevTools CPU throttle 4× (must step down within ~2 s and recover stably, never oscillate); run the 10-minute desktop capture; fill the report.
6. DO-NOT-TOUCH: any production file; do NOT mark physical-device rows passed (author devices; procedures in playbook §7.10); do NOT implement WebGL — if the 30 FPS desktop gate fails after optimization, record evidence and STOP (D-7 requires separate explicit authorization).
7. ACCEPTANCE: desktop 10-minute run recorded with mean FPS / p95 / dropped-frame ratio; hard-gate verdict for desktop stated truthfully; ladder demonstrated stepping down under throttle and recovering; no oscillation; static fallback demonstrated AND explicitly recorded as NOT a pass of the 30 FPS hard gate (it is the degradation outcome); reduced-motion static frame cost measured and recorded (<5 ms is a DIAGNOSTIC target, not a gate); device rows PENDING-AUTHOR (PA-6/PA-7).
8. CHECKS: 10-min visible run with metrics overlay; throttle test; reduced-motion emulation.
9. REGRESSION: W-2/W-3/W-4 behaviors intact at every ladder level.
10. PRECONDITIONS: W-4 committed (HARD dependency — integrated pipeline to measure).
11. COMMIT MESSAGE: lab: performance matrix + adaptive quality ladder (W-5)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-6 — Loading architecture (lab documentation + harness only)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-6 — Loading architecture (lab documentation + harness only).
1. OBJECTIVE: lab/ascii-water/loading-plan.md fully specifies how the module will load in production; a lab harness proves the shell stays interactive before the module loads and survives module failure.
2. CONTEXT/EVIDENCE: decision 15 — W-6 is laboratory work only. T8's ensureChapters() is the pattern reference (promise-cached, RETRY-SAFE dynamic script injection — a failed load removes the script element, resets the cached promise, and allows a deliberate retry). Post-T3 SW design: non-blocking extra cache group (allSettled style) — the shell never depends on optional assets.
3. FILES/AREAS: CREATE lab/ascii-water/loading-plan.md + harness additions inside lab/ascii-water/ only.
4. EXPECTED CHANGE: loading-plan.md documents: (1) architecture — dynamic injection of root-level ascii-water.js, promise-cached and retry-safe, triggered after cover interactive (requestIdleCallback or first pointer intent, whichever first), NEVER on the critical path; (2) caching/offline — TWO DISTINCT MECHANISMS, stated separately (v1.1): the install-time best-effort EXTRA precache attempt (allSettled — shell install never depends on it) AND the runtime code-fetch strategy covering ordinary page requests for the module where appropriate; offline initialization works only after the asset has ACTUALLY been cached; never claim caching before the cache operation succeeds; (3) payload figure (record actual); (4) failure handling (module missing/failed → cover fully usable, entry unaffected); (5) the exact W-8 implementation plan (files, hook points, single-commit revert boundary). The lab harness simulates delayed module loading (artificial delay + failure injection) and demonstrates shell-interactive-before-module and graceful module failure.
5. APPROACH: write the plan from W-5's measured numbers; build the harness against the lab page.
6. DO-NOT-TOUCH: (hard) do NOT create production ascii-water.js; do NOT modify index.html, script.js, sw.js; no production loader; no production global; no production cache-group changes.
7. ACCEPTANCE: loading-plan.md complete (all five sections, both caching mechanisms stated distinctly); harness demonstrates both behaviors; payload figure recorded.
8. CHECKS: harness runs with delay + failure injection; shell interactivity verified during delay.
9. REGRESSION: lab page intact.
10. PRECONDITIONS: W-5 committed (HARD dependency — measurements feed the plan); S1 documentation sync done (tuned values propagated, or one-line no-change confirmation in the W-5 report).
11. COMMIT MESSAGE: lab: deferred-loading architecture + simulation harness (W-6)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-7 — Gesture contract (lab verification only)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION — LAB-ONLY: touch nothing outside lab/ascii-water/. No production file may be created, edited, or deleted in this task. Sole operational exception: IMPLEMENTATION-STATUS.md (mandatory status metadata, staged with every task commit per field 13) — this exception authorizes no other out-of-scope change.

TASK W-7 — Gesture contract (lab verification only).
1. OBJECTIVE: lab/ascii-water/gesture-contract.md + lab verification of every model clause. NO production changes.
2. CONTEXT/EVIDENCE: decision 2 + ROADMAP v2.2 §9 (the approved model): TOUCH — short tap = entry signal + visible impulse at the original contact coordinates; drag (crosses threshold) = wake/waves, never entry; swipe-up ≠ entry; no entry delay waiting for water initialization. MOUSE — hover (no buttons) = subtle waves; drag = wake; stationary click = strong splash + entry signal at the click position. SHARED — one coherent Pointer Events arbitration; one physical touch never counted twice (pointerup/touchend/synthetic-click) reusing T12's unified-channel pattern; keyboard/non-gesture entry parity; entry sequence internals/timing untouched.
3. FILES/AREAS: CREATE lab/ascii-water/gesture-contract.md; extend the lab page/input.js for verification.
4. EXPECTED CHANGE: lab implementation of the arbitration (tap vs drag vs hover vs click; multitouch cap; cancellation; single-registration protection modeled on T12's channel); a programmatic gesture→effect log proving no ambiguous double effects. gesture-contract.md documents: event ownership (who listens, who consumes), coordinates passed to the water system, the EXACT production invocation — window.__echoWater.drop(x, y, strength), guarded, fire-and-forget, NEVER awaited by the entry handler (queue the impulse if the module is not ready; drop gracefully if it failed); the production API takes NO radius argument — it applies a DOCUMENTED DEFAULT RADIUS, and this contract records that default value (the radius-capable drop(x, y, strength, radius) signature remains the internal lab API only) — plus keyboard parity and reduced-motion behavior. DEFAULT-RADIUS SELECTION (v1.2 — executable rule): the default radius is an ENGINEERING PARAMETER, not a new author design decision — NO author approval gate is introduced. Select and test a defensible value in the lab against the approved three-source physics model and the interaction scale; record the numerical value, its coordinate/grid interpretation, and the rationale in gesture-contract.md; if the value is still an estimate rather than validated, mark it PTV. W-8 will use exactly the documented value.
5. APPROACH: implement in the lab; synthesize every gesture programmatically; record the log.
6. DO-NOT-TOUCH: (hard) production script.js and every other production file.
7. ACCEPTANCE: every model clause verified in the lab; the gesture→effect log shows zero double-counts and zero ambiguous effects; the contract is complete enough that W-8 implements without any design choices (including the documented default radius).
8. CHECKS: programmatic gesture suite; manual lab pass (mouse + emulated touch).
9. REGRESSION: W-4 input model intact.
10. PRECONDITIONS: W-3, W-4 committed (HARD dependency); T12 committed (HARD dependency — the unified-channel protection pattern must exist to reuse; read its commit/code first).
11. COMMIT MESSAGE: lab: gesture contract verification + W-8 integration spec (W-7)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-8 — Production integration: ASCII-WATER primary splash composition (the ONLY production W task)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION: this is THE production task for the water system — all other W tasks were lab-only. The revert boundary is exactly this one commit; the lab prototype (lab/ascii-water/) is not touched by it.

TASK W-8 — Production integration: ASCII-WATER primary splash composition (the ONLY production W task).
1. OBJECTIVE: the cover's primary visual is the ASCII night-water scene; Zastavka.jpg becomes a cropped/fragmented emblem; tap enters with a splash; the swipe-up entry shortcut is retired.
2. CONTEXT/EVIDENCE: decisions 2/8/9/15; W-1…W-7 outputs (design.md parameters, loading-plan.md, gesture-contract.md — follow them exactly); S3 gate: Batch 1 (T1,T2,T4,T3,T7), T8, T9, T12, T13, T14, W-2…W-7 all complete with green checks. Anchors: script.js entry handlers ≈533–563 (document click→startSequence; touchend swipe-up diffY>50,|diffX|<40→startSequence; isStarted guard), startSequence ≈565+; cover section in index.html; cover styles in style.css; sw.js cache groups (post-T3).
3. FILES/AREAS: CREATE ascii-water.js (repository ROOT — the repo keeps runtime scripts at root); EDIT index.html (cover canvas + emblem treatment hooks), script.js (loader, cover lifecycle, gesture wiring per contract), style.css (cover layering, emblem, reduced-motion), sw.js (see item 5 below).
4. EXPECTED CHANGE: (1) ascii-water.js: single self-registering module — window.__echoWater = { init(canvas), destroy(), drop(x,y,strength), setReducedMotion(bool) }; the production drop takes NO radius argument — it applies the documented default radius from gesture-contract.md (the radius-capable signature stays lab-internal); payload ≤25 KB minified target (PTV — justify in the commit message if exceeded); (2) index.html: canvas as the cover's PRIMARY visible surface — the night landscape clearly readable as a character-rendered scene; Zastavka.jpg as a cropped/fragmented emblem WITHIN the composition (CSS object-position/clip-path/mask on the UNCHANGED file) — never an opaque layer hiding/replacing/subordinating the water; title/identity typography and the entry hint may stay as DOM above the canvas; (3) script.js: loader per loading-plan.md (after cover interactive — NEVER blocking entry); cover lifecycle init/destroy; gestures per gesture-contract.md, with the tap/entry path executing EXACTLY THIS ORDERED SEQUENCE (v1.2, binding): ① classify the gesture exactly once on the unified channel (tap vs drag vs swipe — never reclassified mid-gesture); ② record the original contact coordinates; ③ if the water module is ready, send the impulse at those coordinates; if it is still loading, queue a SINGLE BOUNDED impulse tied to the current entry attempt (fire-and-forget); ④ call the existing entry start (startSequence()) IMMEDIATELY — NEVER awaiting module initialization or the impulse; ⑤ if the module is ready, or finishes initializing while the water is still visibly on screen, the renderer processes the impulse on its next frame — the splash is then visible before the transition covers the water; ⑥ freeze the canvas to its current frame ONLY when the existing transition actually visually covers the water; ⑦ destroy() the water instance after the transition completes (no persistent cost). LATE/FAILURE BEHAVIOR (v1.2, binding): if the transition covers the water before the module becomes ready → DISCARD the queued impulse; if the module fails → DISCARD it; a late initialization must NEVER display an old splash on a later screen or entry attempt; the existing isStarted guard remains intact; the entry sequence is NEVER delayed, restarted, or cancelled because of the water module. TWO DISTINCT GUARANTEES: (a) the entry gesture and the entry sequence are guaranteed to work immediately, independent of the water module; (b) a visible splash is guaranteed only when the module is ready in time — otherwise best-effort and safely discarded; drag → waves only; mouse hover → subtle waves; RETIRE the touchend swipe-up entry shortcut (approved D-8 amendment: sequence unchanged, tap = the single touch entry gesture); isStarted guard unchanged; keyboard/non-gesture entry unbroken; T12's unified-channel protection REUSED — no competing global event system; (4) style.css: layering + emblem + reduced-motion static water frame with a usable entry path; (5) sw.js — TWO DISTINCT MECHANISMS, not conflated (v1.1): the module joins the best-effort EXTRA precache group (allSettled style per loading-plan.md — shell installation never depends on it) AND, where appropriate, the code-fetch (network-first) strategy covering ordinary page requests for the module; the first is the install-time precache attempt, the second is the runtime fetch strategy — the diff states both explicitly, and the module is NEVER claimed cached until the cache operation has actually succeeded; (6) frames frame-01…07 untouched; T14's surge hook emits an impulse burst; (7) entry sequence internals and timing UNCHANGED.
5. APPROACH: port the lab modules into the single production module; wire strictly per the two lab documents; verify the failure paths (module blocked/absent) explicitly.
6. DO-NOT-TOUCH: Zastavka.jpg file (never modified/deleted); frames; chapters.js; entry sequence internals/timing; PHOTO subsystem; reading screens (water never ships there).
7. ACCEPTANCE: cover shows the water composition as the primary surface with the emblem per decision 9; the 7-step tap ordering verifiable in a gesture log (classify once → coordinates → impulse if ready / single bounded entry-scoped queue → immediate startSequence → next-frame splash while the water is visible → freeze on cover → destroy); tap enters immediately regardless of module readiness (no lost/delayed gestures); a visible splash is demonstrated when the module is ready in time, AND the late-module path is demonstrated to discard the queued impulse WITHOUT delaying entry and WITHOUT showing an old splash on a later screen or entry attempt — a splash is NEVER promised where the module cannot be ready before the transition covers the water (v1.2); drag/hover per contract; swipe-up no longer enters; module failure → cover fully usable; offline works after the asset has ACTUALLY been cached (verify); reduced-motion static frame + entry; single physical touch = one tap (programmatic); module load never delays shell interactivity (cold-load trace); §7.2 diagnostics recorded in the production context; the whole task reverts cleanly as ONE commit without touching lab/ascii-water/. Author review of the integrated composition → PA-13 (PENDING-AUTHOR — does not block completion).
8. CHECKS: cold-load trace (Fast/Slow 3G); programmatic gesture suite on the production page; SW cache inspection; offline reload; reduced-motion emulation; pwsh tests/run-static.ps1; full ROADMAP §7.3 rows 1–3.
9. REGRESSION: full entry flow ×10 (both reader classes), T9/T14 cover behavior, T12 film path, T13 swipe recognizer coexistence.
10. PRECONDITIONS: the S3 gate list — verify each prerequisite is committed with green checks before starting: Batch 1 (T1, T2, T4, T3, T7), T8, T9, T12, T13, T14, W-2…W-7 (all HARD dependencies). W-8 explicitly does NOT depend on T11 or T17.
11. COMMIT MESSAGE: feat: ASCII-WATER primary splash composition + unified entry gestures (W-8)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```

### Prompt W-9 — Final verification of the integrated candidate (report only — no code changes)

```text
SAFETY PREAMBLE (verbatim, binding): Work only in the approved development branch descending from the pinned baseline. Never publish, deploy, push, invoke push-echo.cmd, or change the live site. Never use destructive Git commands or rewrite history. Never edit chapter text or markers. Respect all frozen areas and the no-dependency architecture. One implementation task = one commit. Run all specified checks before committing. Never claim unperformed checks as passed. Keep PENDING-AUTHOR items unpassed. Stop on unexplained failures, data-loss risks, frozen-area conflicts, unexpected author changes, or scope conflicts.
TASK-SPECIFIC SAFETY ADDITION: this task VERIFIES — it writes one report file and changes no code.

TASK W-9 — Final verification of the integrated candidate (report only — no code changes).
1. OBJECTIVE: docs/ascii-water-verification.md records the full water verification on the integrated candidate, with the three verification types separated.
2. CONTEXT/EVIDENCE: this is a static site — no build pipeline exists; "production" here means the development-branch candidate served locally in a production-like static context (playbook §7.9). W-8 is committed and green.
3. FILES/AREAS: CREATE docs/ascii-water-verification.md only.
4. EXPECTED CHANGE: execute the water subset of the final regression (ROADMAP v2.2 §7.3 rows 2, 8-water, 9-water, 11) + the full §7.2 diagnostic matrix in the integrated context; record results under three explicit headings: (1) automated/local-browser checks performed by you (Kimi) — with actual numbers; (2) physical-device checks — PENDING-AUTHOR with the §7.10 procedures (never mark passed without the author's data); (3) post-deployment checks — author-only after publishing.
5. APPROACH: serve locally; measure; record honestly; deviations stated with rationale.
6. DO-NOT-TOUCH: all code (any defect found becomes a NEW task report — do not fix in this task); never deploy/publish/push.
7. ACCEPTANCE: every §7.2 row is PASS (measured), PENDING-AUTHOR (device), or deviation-with-rationale; the water regression subset green on the same candidate; the report committed. (The final task hash — if this is the final task — is reported in the final report via `git rev-parse HEAD`, per the one-task-lag rule.)
8. CHECKS: as measured; pwsh tests/run-static.ps1.
9. REGRESSION: none (report only).
10. PRECONDITIONS: W-8 committed and green (HARD dependency).
11. COMMIT MESSAGE: docs: ASCII-WATER integrated-candidate verification (W-9)
12. COMPLETION REPORT (post it in chat after committing; every line mandatory, no "standard reporting" shorthand):
   - Task ID + status (COMPLETE, or BLOCKED + exact reason)
   - Commit message used
   - Commit hash — the exact SHA read with `git rev-parse HEAD` after committing (or, only in the impossible case the commit failed, explicitly "no commit created")
   - Files changed (exact list)
   - Exact checks run (every command and page, as executed)
   - Checks passed / failed (each check named; failures quoted — never claim an unperformed check as passed)
   - Known baseline failures observed (compare against tests/BASELINE.md)
   - New failures introduced by this task + their disposition (any unexplained new failure = stop condition, not a commit)
   - Known limitations of the result
   - Remaining PENDING-AUTHOR items attached to this task
   - Exact next action (the next task per PLAYBOOK §7.5)
13. STATUS UPDATE (rides inside THIS task's commit — stage IMPLEMENTATION-STATUS.md together with the task files. IMPLEMENTATION-STATUS.md is mandatory operational metadata and is PERMITTED IN EVERY TASK COMMIT even when it lies outside this task's implementation/artifact scope — this exception authorizes no other out-of-scope change): set this task's ledger row to COMPLETE IN THIS COMMIT with the hash field literally `pending post-commit resolution` (a commit can never contain its own hash — NEVER amend a commit to insert it). Predecessor bookkeeping is DYNAMIC (v1.2): before staging, run `git log --oneline -10` and `git rev-parse HEAD`, identify the most recently committed implementation task in the ACTUAL branch history — Track 1 or Track 2, commit chronology decides, never the nominal schedule — and record that task's exact SHA in its ledger row. Fill checks run + results; refresh `HEAD immediately before this commit`, `Working tree state immediately before staging`, Last completed checkpoint, and Exact next action. The ledger is always exactly one task behind on hashes — that is correct by design (one-task-lag rule); the final task's hash is reported in the final report via `git rev-parse HEAD`.
```
---

## 9. PENDING-AUTHOR register

Checks Kimi cannot truthfully complete. They never block autonomous progress (decision 16); they are recorded here and in IMPLEMENTATION-STATUS.md and presented in full at completion. **Never mark one PASS.**

| # | Item | Origin | Environment | Procedure reference |
| --- | --- | --- | --- | --- |
| 1 | Cover centering + safe-area | T9 | physical iPhone, Safari | §7.10 "Other device checks" |
| 2 | Film double-tap skip | T12 | physical iPhone Safari + Android Chrome | §7.10 |
| 3 | NVDA overlay pass | T16 | Windows + NVDA | §7.10 |
| 4 | VoiceOver overlay pass | T16 | iPhone VoiceOver | §7.10 |
| 5 | Genuine Golos weights + title appearance review — genuine Medium/Bold rendering verified on physical iPhone Safari; title appearance; width-change assessment; acceptance of the final typography | T22 | physical iPhone Safari | §7.10 |
| 6 | Water 10-min performance — Android | W-5/W-9 | physical mid-range Android + Chrome | §7.10 protocol |
| 7 | Water 10-min performance — iPhone | W-5/W-9 | physical iPhone + Safari | §7.10 protocol |
| 8 | Touch latency + gesture behavior | W-5/W-9 | both devices | §7.10 |
| 9 | SW/offline on physical devices | W-9 | both devices — requires a trusted secure context; plain LAN HTTP does not qualify; exact remainder stated in the status file | §7.10 limitation |
| 10 | Post-deployment checks | (author-only) | live site after the author publishes | T15's post-check flow |
| 11 | T11 three-mode VOICE visual review | T11 | author's eyes, any device — side-by-side capture judgment | §8/T11 acceptance |
| 12 | T14 idle rhythm + beckon ring visual review | T14 | author's eyes, any device — 2–3 cycles + ring contrast judgment | §8/T14 acceptance |
| 13 | W-8/W-9 integrated cover composition review | W-8/W-9 | author's devices — composition + entry feel on the integrated candidate | §8/W-8 acceptance |

Items 11–13 are author visual judgments. Like every PENDING-AUTHOR item they **never block autonomous execution** — the task completes on its programmatic acceptance and the review queue is presented at completion.

## 10. Session continuity and context management

IMPLEMENTATION-STATUS.md is the single source of truth for progress — not chat memory, not verbal summaries.

**Before ending or compacting any session, update IMPLEMENTATION-STATUS.md with:** the current task and last completed task; the current commit hash; exact test results; any uncommitted changes (with reason); known failures and why they remain; the next task and its dependencies; all PENDING-AUTHOR items; the exact next action.

**A resumed session must first read, in this order:** IMPLEMENTATION-PLAYBOOK.md (this file) → IMPLEMENTATION-STATUS.md → the relevant ROADMAP.md v2.2 sections → the current task prompt (§8) → `git status` → current branch and HEAD. It must not trust a verbal summary when the status file and Git history provide exact state.

**Ready-to-paste resume prompt (autonomous continuation — v1.2, dynamic selection):**

```text
Resume the ЭХО implementation. Read in this order: IMPLEMENTATION-PLAYBOOK.md, IMPLEMENTATION-STATUS.md, ROADMAP.md v2.2 §1 and §5, then run `git status` and `git log --oneline -10` on branch work/echo-step4-implementation. The status file plus Git history are the source of truth — do not trust my verbal summary. Confirm: current branch, clean tree, last completed task + its commit hash, and the set of runnable tasks. Determine the next runnable task DYNAMICALLY: all HARD dependencies committed; Track 1 and Track 2 internal order respected (Track 2 may interleave with Track 1 after B-0; W-1…W-9 strictly ordered; there is no mandatory T23→W-1 dependency; W-8 waits only for its exact HARD dependencies and S3); no shared-file conflict with other work; never assume a fixed predecessor from the nominal schedule. Then EXECUTE that next approved task automatically — take its self-contained prompt from PLAYBOOK §8 and run it under the playbook's safety rules (never publish/push/deploy; one task = one commit; checks before commit; the dynamic one-task-lag SHA status rule — the status ledger's predecessor SHA always comes from actual Git history, and a commit is never amended to carry its own hash; IMPLEMENTATION-STATUS.md is the sole operational exception to task file scope; PENDING-AUTHOR never marked passed). Do not stop to ask for routine confirmation of already-approved tasks; continue through the approved sequence, reporting per batch and stopping only at the §11 stop conditions.
```

## 11. Autonomous execution policy (decision 16, exact)

Kimi Code: executes the approved §7.5 sequence independently; makes one task commit at a time; runs the required tests before each commit; continues to the next independent task without asking for routine approval; reports after each meaningful batch (Batch 1, Batch 1.5, Batch 2, Batch 3, T23, W-5/S1, W-7, W-8/S3, W-9/S4) and at final completion; preserves PENDING-AUTHOR items without pretending they passed.

Kimi Code **stops and reports** when: a task introduces an unexplained test failure; a failure cannot be safely attributed; the working tree contains unexpected author changes; a change risks losing chapter content, user state, images, or other data; the task would modify a frozen area; a new runtime dependency would be required; the approved 30 FPS water minimum cannot be met after Canvas optimization (record evidence; the D-7 WebGL branch needs separate explicit authorization); an instruction conflicts with the repository in a way that cannot be safely reconciled; or an author decision that has genuinely not been made is required (none should remain — verify against DECISIONS.md v4.2 first).

Kimi Code does **not**: stop for approvals the 19 decisions already resolved (no visual-direction gate, no gesture gate, no T23 verdict gate, no per-commit approval); wait for a reply to continue independent tasks; make new design choices and call them author-approved; publish, deploy, push, or invoke push-echo.cmd under any circumstances.

---

## Appendix A — Step-4 documentation manifest

Documents of record for the implementation phase: ROADMAP.md v2.2 (technical specification + priorities + testing policy), TASKS.md v4.2 (per-task diagnostics/evidence), DECISIONS.md v4.2 (all author decisions, none open), IMPLEMENTATION-PLAYBOOK.md v1.2 (this manual), IMPLEMENTATION-STATUS.md v1.2 (live progress), ИНСТРУКЦИЯ АГА.md (author-facing Russian operating guide — navigation aid, never an instruction source), tests/BASELINE.md (created by B-0), CHANGELOG.md (workflow history). echo-audit.md is the evidence archive — historical findings only, never an instruction source (§8 source-precedence note).
