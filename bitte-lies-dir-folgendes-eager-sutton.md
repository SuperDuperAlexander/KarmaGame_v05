# Light Within — Plan: Vertical Slice v0.1 + Work Packages for parallel agents

## Context
- Goal: build the first playable Vertical Slice (the 15 steps in `Begin Vertical Slice v0.1.md`), then STOP and report.
- Final GLBs are not ready. All visuals must swap later by config only (Asset Registry). Gameplay never depends on GLB internals.
- Work is split into packages (WPs) that several agents (Claude Code + Codex) can run in parallel. Each WP has a model recommendation.
- Sources: `GAME_MASTER_SPEC.md` (gameplay truth), `Begin Vertical Slice v0.1.md` (work order), `3D_ASSET_GENERATION_MASTER.md` (asset contract; today only in `my-content-studio\Vorlagen für 3D Modelle\`).

## User decisions (2026-10-01)
- All code lives in `D:\MyDrive\ALEXANDER\PROJEKTE\KarmaGame_v05` (a Google Drive folder). No other location.
- No code is copied from folders outside `KarmaGame_v05`. Lessons (knowledge) from older attempts are OK. npm packages are OK.
- OpenAI models run as Codex in this folder → they can take full coding WPs.

## Findings
**Docs conflict.** The two master docs use different node names, clip names, folders and beetle concepts (e.g. clips `Idle_Loop` vs `Idle`; `MESH_package_wrap/SOCKET_chain` vs `packageBody/chainAnchor`; `inner-world/floating_platforms.glb` vs `inner_world/inner_platform_kit.glb`). The real generated files follow `3D_ASSET_GENERATION_MASTER.md`. → solved by logical names + registry mapping (AD-4).

**Rig test (`character-rig-test/`).**
- Proven: a plain-Python script (`rig_character.py`, no Blender) gave the AI mesh 17 bones (Hips, Spine, Chest, Neck, Head, L/R UpperArm·LowerArm·Hand, L/R UpperLeg·LowerLeg·Foot) and 2 in-place clips: `Idle`, `Walk` (authored for 1.3 m/s). Babylon 8.56.2 plays and blends them.
- `character-rig-test/public/player_rigged_test.glb` (2.6 MB, 34k tris, no grip nodes) = **temporary Player**.
- The game file `3D Models/assets/characters/player.glb` has NO skeleton and NO clips (6 parts + one unnamed 17,796-tri part, grips, 2048² texture).
- Do not copy these bugs: turning via `rotation.y` (glTF sets `rotationQuaternion`, `__root__` flips handedness), deprecated `SceneLoader.ImportMeshAsync`, barrel imports (6.3 MB bundle, build out of memory). Walk clip fits 1.3 m/s, spec wants walk 2.8 / run 4.6.
- Reusable (in-folder): `rig_character.py` math + clip writer, `check_asset.py` GLB reader + checks.

**Assets.** All GLBs: plain glTF, no extensions, no `ROOT`/`MESH_`/`COL_`/`SOCKET_` names, no LODs, no colliders, one material, one JPEG.
| Logical ID | v0.1 source | Status | Registry fix |
|---|---|---|---|
| Player | `character-rig-test/public/player_rigged_test.glb` | temporary, Idle + Walk | clip map, props on `LeftHand`/`RightHand` bones, Run → Walk fallback |
| Merchant | `3D Models/assets/characters/merchant.glb` | temporary, static A-pose | code idle sway |
| FinancePackage | `3D Models/assets/core/finance_package.glb` | temporary | offset +0.188 Y, turn ~90° |
| ChainLink | `3D Models/assets/core/package_chain.glb` | temporary | link is 55 cm, long axis Y, wrong sockets → scale/pitch/axis in config; chain built in code |
| MarketStallA | `3D Models/assets/market/market_stall_A.glb` | temporary | box colliders from config |
| All others (Central Tree outer/inner, Beetle, City Gate, walls, buildings, citizens, Stall B, props, platforms, rocks, crystals, vegetation) | none usable in this folder | **placeholder** | — |
| Source Water, Thought Waves, fog, particles | runtime code | code | — |
- Optional (your choice): copy 3 newer GLBs from `my-content-studio\Brand Assets\3D Models\assets\` (outer tree, beetle, female citizen) into `KarmaGame_v05\3D Models\assets\`. Then one registry edit each. A good first swap test.
- Your asset pipeline (separate track): jobs 03 (inner tree, failed ~15×), 08 (raw `08_platform_long.glb` is truncated), 10, 11/12, 13–21 failed or not started. Trellis output never has a skeleton → the in-folder rig script is the only way to animate characters today.
- Unrelated leftovers (git-ignored, I delete nothing): `Temporary Assets/captures`, `firecrawl_test`, `youtube` (312 MB video), `write_probe_root.txt`.
- Concept sheets in root, agents must look at them: `_14` overview, `_32` characters/beetle/package, `_39` Central Tree states + inner zones, `_44` **level maps**, `_49` narrative + Thought Waves.

**Lessons from older attempts (knowledge only):** lock design + keep a "do not reopen" decision log · E2E must press real keys/touches; never hide a core step behind an invisible trigger · beauty from light/fog/color, not code primitives or heavy filters · measure on a real phone early · `precision highp float` in custom shaders · deep imports, lazy glTF loader · thin instances (Safari needs spare slots) · touch UI only after a real touch, joystick with pointer capture + dead zone, ≥48 px, safe areas · throttled saves + save on page hide, dt cap 50 ms · strip unused GLB textures.

## Game behavior for v0.1
**Layout (concept `_44`, tree trunk = (0,0) in both worlds, +Z north, +X east, meters).**
- Outer (≈64 × 72 m, closed): spawn (0,−47) on Arrival Path → waystone with package (1.2,−43.5) → City Gate at z −26 (opening 4 × 4.5 m, blocked until package) → Central Square r 15 with tree, Look Within spot (0,−2.8) → Market east (x 21..36): 3 stalls, merchant, glinting "desire object". North/west alleys closed (later Exchange House, Dark district). killY −10.
- Inner (mirror around the tree axis): arrival (0,−7) → root tree + Source Water (center) → package root (4,−2) "Reflect" → beetle area east (7.5,−0.5), shown only after the market event. "Hold to return" at the inner trunk (0,−3.4). Ring blocker r 11, killY −12.

**Rule chain (data, not a quest script; open order).**
| Rule | Signal | Condition | Effect | Lasting visual (from state) |
|---|---|---|---|---|
| R1 | interact waystone | no package | PACKAGE_RECEIVED, attachment +0.10, save | package carried, chain loose, gate open |
| R2 | enter city zone | package | CITY_ENTERED, save | — |
| R3 | enter tree zone | city entered | TREE_DISCOVERED, tree pulse | Look Within prompt |
| R4 | hold at tree | tree discovered | transition → inner | — |
| R5 | inner activated | first time | INNER_WORLD_ENTERED, save | Reflect prompt |
| R6 | interact "Reflect" | inner entered, not saved | open "What does money mean to you?" | — |
| R7 | reflection save/skip | not saved | MONEY_REFLECTION_SAVED, save. **No trait change — answers are never scored** | return spot glows |
| R8 | hold at inner trunk | always | transition → outer | — |
| R9 | enter market zone | city entered | MARKET_VISITED, save | merchant active |
| R10 | interact desire object | market visited, not triggered | ATTACHMENT_TRIGGERED, attachment +0.35, **save, then** wave "I want more..." | chain tense, beetle `dormant` |
| R11 | inner activated | triggered, not seen | ATTACHMENT_SEEN, beetle reveal, save | beetle `attached`, chain package → beetle |
| R12 | ATTACHMENT_SEEN recorded | — | end hint → **STOP** | — |
- "I want more..." fires exactly once, also after a reload: facts are a set, fired rules are saved, condition guard, save before the wave, wave dedupe.
- The reflection panel opens only on an explicit "Reflect" press (mobile keyboard), never by itself.

## Architecture decisions (seed for `DEVELOPMENT_DECISIONS.md`)
- **AD-1 Stack:** Vite + TypeScript strict + Babylon.js + Vitest + Playwright + ESLint. Deep imports, lazy glTF loader. Babylon latest 9.x; first proof in WP-01 = rigged player plays Idle/Walk; if it fails → pin 8.56.2 (proven).
- **AD-2 Entity ≠ Visual:** `GameEntity` root TransformNode = gameplay transform → collider (invisible capsule/box from registry) → interactable → state → `VisualComponent` (GLB instance is a child). Movement and collision never use the GLB.
- **AD-3 Asset Registry** (`src/assets/registry/<category>.ts`) is the ONLY place with file paths. Per entry: status (`placeholder|temporary|final`), file, transform, normalize, hideNodes, LOD, collision, logical clip map (names[], loop, authoredSpeed, fallback), logical node map (names[], bones allowed), logical material map (`'*'` = all), instancing, zone, placeholder spec (always), extras, budget, notes. Missing file → placeholder + one dev warning. `?assets=placeholder` forces all placeholders. `?viewer` lists every asset and missing names.
- **AD-4 Names:** code uses logical names only (`walk`, `socket.handR`, `root.attachment`); the registry maps to real GLB names. Files follow the 3D doc; gameplay follows the Master Spec.
- **AD-5 Collision:** Babylon built-in collisions (`moveWithCollisions`, ellipsoid ≈ capsule r 0.32 / h 1.65) behind a `CharacterMotor` interface. Simple colliders + ramps. No physics engine in v0.1. Kill-plane → last safe position. Camera ray-picks a `cameraBlocker` layer.
- **AD-6 Scenes:** one Engine; `SceneManager` (WP-01) with BootScene, OuterWorldScene, InnerWorldScene. Inner created on first visit, then kept paused. Each scene has its own player entity; player position lives in the store.
- **AD-7 UI = DOM overlay** (prompt, hold ring, reflection textarea, pause, loading veil, touch controls, Thought Wave labels with edge clamp; wave ribbon in 3D). UI sends commands only.
- **AD-8 World State = pure TS:** `EventBus` (signals) → `RuleEngine` (data rules: signal + condition + once + effects) → `WorldStore` (facts set, fired rules, traits, counters) → selectors. No Babylon import in state, rules, save, reflection.
- **AD-9 Lasting visuals come from selectors** (package, chain, beetle, gate, tree mood). Effects only do transient things (wave, panel, FX, transition, save). So a reload always shows the right world.
- **AD-10 Traits:** `traits{attachment, fear, trust, contentment}` (0..1 image values, no moral score). Work-order flags (`packageReceived`, `marketEventExperienced`, …) are selectors.
- **AD-11 Save:** localStorage `light-within-save-v1`, schemaVersion + migrate, corrupt → `light-within-save-recovery`, ≤1 write/s, save on scene change + page hide. Reflections plain text ≤2000 chars, never leave the device.
- **AD-12 Text:** all player text in `src/content/strings.en.ts`; content rules of spec §1/§4 apply.
- **AD-13 Dev tools:** `?debug` overlay (FPS, draw calls, meshes, tris, textures, GPU), `?safe` (no post FX), `?test`; `window.__lw` hook only in dev/test builds.
- **AD-14 Asset files:** drop zone `3D Models/assets/` (tracked) → `npm run assets:sync` → `public/assets/` (generated, ignored). Registry points to `/assets/...`.

## Model guide
| Tier | Use for | Claude | Codex |
|---|---|---|---|
| S (hard) | contracts, core systems, cross-system integration, hard bugs | **Opus 5.5** | GPT-6 Astra (strongest, most expensive) |
| M (standard) | one feature with clear spec + frozen interfaces | **Sonnet 5.5** | **GPT-5.6 Sol** |
| L (light) | docs, lists, checklists, single asset swaps | Haiku 4.5 | GPT-5.6 Luna |
- One Lead (Opus) merges everything. M agent stuck after 2 tries → escalate to S.
- Never use L-tier for Babylon runtime code.
- Good split: Claude runs the critical path; Codex (GPT-5.6 Sol) runs leaf WPs 03, 05, 07, 08, A1, 21; GPT-6 Astra does A3 (rig math) and the contract review.

## Work packages — Milestone 1 (Vertical Slice v0.1)
Size: S ≈ ½ agent session, M ≈ 1, L ≈ 2+.
| WP | Name | Wave | Needs | Model (alt) | Size | Done when (short) |
|---|---|---|---|---|---|---|
| 00 | Repo setup + docs + briefs | 0 | – | Opus = me, after approval | S | git + ignores + docs committed |
| 01 | Foundation: toolchain, contracts, SceneManager, feature stubs, working minimal stubs, layout seed, strings seed, lint guards | 0 | 00 | **Opus** (Astra) | L | checks pass; rigged player Idle/Walk, turns correctly; initial JS ≤1 MB gzip; worktree node_modules junction verified |
| 01R | Contract review → tag `contracts-v1` | 0 | 01 | **GPT-6 Astra** (Opus) | S | review notes fixed, tag set |
| 02 | World State + RuleEngine + selectors + headless journey harness | 1 | 01R | Sonnet (5.6 Sol) | M | all Condition types tested; once-rule survives save/load; harness turns signals into facts |
| 03 | Save + Reflection store | 1 | 01R | **5.6 Sol** (Sonnet) | S | corrupt save → recovery key; ≤1 write/s; pagehide flush; delete reflections keeps facts |
| 04 | Asset system: registry entries, loader, placeholders, VisualComponent, animation driver, `?viewer` | 1 | 01R | **Opus** (Astra) | L | `?assets=placeholder` plays the same; missing file → placeholder + 1 warning; Run falls back to Walk |
| 05 | Input + mobile controls | 1 | 01R | **5.6 Sol** (Sonnet) | M | stick only after first touch, dead zone, no page scroll, targets ≥48 px, stacked input locks |
| 06 | UI shell: prompt, hold ring, reflection panel, pause, loading veil | 1 | 01R | Sonnet (5.6 Sol) | M | Save/Skip send commands; HTML stays literal text; confirms for New Game + Delete; nothing covers controls at 390×844 |
| 07 | Debug overlay + test hook `__lw` | 1 | 01R | **5.6 Sol** (Sonnet) | M | overlay shows all stats; `__lw` absent in production build |
| 08 | Thought Wave system | 1 | 01R | **5.6 Sol** (Sonnet) | S | max 2 waves; >64 chars rejected; edge clamp tested; reduced-motion fade |
| 10 | Follow camera | 1 (early) | 05 stub | Sonnet (5.6 Sol) | M | clamps hold (4.5–6.5 m, 1.2 m, 20–55°); never inside a wall in a wall-hug test |
| 11 | Interaction: press, hold, zones | 1 (early) | 02/05/06 stubs | Sonnet (5.6 Sol) | M | one ENTER/EXIT per crossing; hold resets on release; E and touch button each give one interact |
| 17 | Look Within transition (both ways) | 1 (early) | stub scenes | **Opus** (Astra) | M | 8 steps logged both ways; save before switch; ≤2 s after cache; hold spam cannot double-trigger; reload in inner resumes there |
| 09 | Player controller + animation states | 2 | 04, 05 | Sonnet + Opus review | M+ | 2.8/4.6 m/s ±5%; no turning flip; ramps OK, 0.3 m ledge blocks; kill-plane works |
| 12 | Outer World greybox | 2 | 04 | Sonnet (5.6 Sol) | M | path walkable, gate blocked before package, tree crown visible from spawn, ≤80 draw calls |
| 13 | Inner World greybox + Source Water | 2 | 04 | Sonnet (5.6 Sol) | M | arrival view shows package root + beetle spot at 390×844; water `highp`, ≤60 particles |
| 14 | Atmosphere, WorldStatePresenter, quality presets | 2 | 02, 04 | Sonnet (5.6 Sol), with concept images | M | mood right after reload; presets switch live; `?safe` works; fog never hides the path |
| 15 | NPC basics (merchant, citizens) | 2 | 04 | Sonnet (5.6 Sol) | S | merchant idle sway, turns to player within 4 m, far animation off |
| 16 | Package, chain, beetle controllers | 2 | 02, 04 | Sonnet (5.6 Sol) | M | package on hand-bone socket; chain/beetle states right after reload; chain = 1 draw call |
| 18a | Slice rule data + headless journey test | 2 | 02 | Sonnet (5.6 Sol) | S | journey passes in both orders (tree first / market first); one wave after reload |
| 19a | E2E harness + autopilot (real keys) + smoke test | 2 | 07 | Sonnet (5.6 Sol) | M | harness + smoke pass desktop + mobile viewport |
| 21 | Content + safety review (strings, rules §1/§4) | 2 | 01 strings | **5.6 Sol** (Sonnet) | S | checklist passes, no diagnosis/karma/money promises |
| 18b | Slice integration | 3 | 09–17, 18a | **Opus** (Astra) | M | full slice by hand, desktop + 390×844 touch, no debug commands, no console errors |
| 19b | E2E journeys desktop + mobile | 3 | 18b, 19a | Sonnet (5.6 Sol) | M | 15 steps with real input; one wave after reload; beetle `attached`; 0 errors; no network POST |
| 20 | Performance pass | 3 | 18b, D2 | Sonnet → Opus if stuck | M | phone: <120 draw calls, <250k tris, ≥30 FPS or documented reason; start download ≤12 MB |
| 22 | Milestone review + report → **STOP** | 4 | 19b, 20, 21 | **Opus** (+ optional Astra review) | M | every spec §21 criterion has evidence; README + decisions updated |

**Asset track (parallel to code):**
| WP | Name | Wave | Model (alt) | Size | Done when |
|---|---|---|---|---|---|
| A1 | Asset validator + sync (seed: `check_asset.py`) | 1 | **5.6 Sol** (Sonnet) | M | `assets:sync` idempotent; `assets:check` prints table, non-zero exit on broken `final` asset |
| A2 | Asset status doc + generation manifest (22 jobs, name conflicts) | 0 | Haiku (5.6 Luna) | S | all 22 jobs + conflicts listed; manifest matches 3D doc §11 |
| A3 | Rig v2: Walk@2.8, Run@4.6, Interact, LookAround; grips under hand bones; multi-mesh `player.glb` later | 0 | **GPT-6 Astra** (Opus) | L | clips pass checks; a person reviews the bends |
| A4 | Final asset swap (repeat per asset) | later | Haiku (5.6 Luna) | S each | diff = one registry entry + one GLB |

**Your checkpoints (human + phone):** D1 after WP-01: open the rigged player with `?debug` on a real phone. D2 after Wave 2: play the greybox on the phone. WP-20 needs D2.

## Parallel vs. sequential
```
W0  00 → 01 → 01R (tag contracts-v1)            parallel: A2, A3
W1  first: 04 · 02 · 05 · 06   then: 03 · 07 · 08 · A1   early: 10 · 11 · 17
W2  09 · 12 · 13 · 14 · 15 · 16 · 18a · 19a · 21                 + D2 (you)
W3  18b → 19b · 20
W4  22 → STOP + report
```
- **Critical path:** 00 → 01 → 04 → 09 → 18b → 19b → 22. Best agents go here.
- Early start is safe against the frozen contracts + WP-01 working stubs. NOT early: 18b, 20, A4.
- Recommended load: 3–4 agents at the same time (Google Drive + merge effort).
- Merge order in W1: 04, 02, 05, 06 first.

## Coordination rules (go into `AGENTS.md`; `CLAUDE.md` imports it)
1. Branch per WP `wp/<id>-<name>`, commit prefix `WP-<id>:`. Every agent (Codex too) works in its own worktree `KarmaGame_v05/_worktrees/<id>` (git-ignored). Root checkout = Lead only.
2. **Pause Google Drive sync while agents run.** npm cache outside Drive (cache, not code). Worktree `node_modules` = junction to root one. All agents on Windows (no WSL mix).
3. Edit only your own folders. Lead only: `package.json`/lockfile, `src/contracts/`, `src/app/`, scene shells, `index.html`, `AGENTS.md`. Each module folder has a pre-wired `feature.ts` — fill yours, never edit the feature list.
4. Ownership: 02 `src/state/`+`src/rules/` · 03 `src/save/`,`src/reflection/` · 04 `src/assets/` (all registry entries) · 05 `src/input/`,`src/ui/touch/` · 06 `src/ui/` rest · 07 `src/debug/` · 08 `src/thought-waves/` · 09 `src/player/` · 10 `src/camera/` · 11 `src/interaction/` · 12 `src/world/outer/` · 13 `src/world/inner/` · 14 `src/presentation/` · 15 `src/npc/` · 16 `src/props/`,`src/creatures/` · 17 `src/transition/` · 18a/b `src/narrative/` + string values · 19a/b `tests/e2e/` · A1 `tools/assets/` · A3 `tools/rig/`. Each WP owns its own unit tests in `tests/<module>.spec.ts`.
5. Lint guards: no `@babylonjs/core` barrel import; no `.glb` string outside the registry; no Babylon in state/rules/save/reflection/narrative.
6. Before hand-off: `npm run typecheck && npm run lint && npm test && npm run build` pass (+ e2e if relevant). Journey tests never call `__lw.dev.*`.
7. Hand-off files: `docs/reports/WP-<id>.md` (done, verified how, open issues) + `docs/decisions/WP-<id>.md`. Lead merges decisions into `DEVELOPMENT_DECISIONS.md`.
8. Need a mapping or interface change? Write it in the report. The Lead decides.
9. Mark every temporary/placeholder asset in the registry and in `docs/assets/ASSET_STATUS.md`.

## Roadmap for the whole game (coarse; detail after the v0.1 report)
- **M1 Vertical Slice v0.1** — this plan. STOP after the beetle.
- **M2 Finance MVP:** Fear Child + Dark NPC (cold root zone), Service Corner (help, no kneeling), Give/Receive (water between basins), citizens' stories, Exchange House + Guide, beetle transformation, end image at Source Water.
- **M3 Final art:** swap final GLBs (registry only), LODs, KTX2/meshopt, real-phone tuning, rig remaining characters (A3 pipeline).
- **M4 Polish + release:** audio, localization, settings, accessibility, hosting. Later: consent-based LLM reflection (spec §10.3).

## What I do right after you approve (= WP-00)
1. `git init` in `KarmaGame_v05`; `.gitignore` (node_modules, dist, `.npm-cache`, `_worktrees/`, `Temporary Assets/`, `public/assets/`, `*.mkv`, test output); `.gitattributes` (`* text=auto eol=lf`).
2. Copy `3D_ASSET_GENERATION_MASTER.md` into `KarmaGame_v05/docs/` (a doc, not code; the work order says agents must read it).
3. Write `AGENTS.md`, `CLAUDE.md`, `DEVELOPMENT_DECISIONS.md` (AD-1…AD-14), `docs/PLAN.md` (this plan).
4. Write one brief per WP in `docs/wp/` (goal, read first, needs, owns / must not touch, interfaces, tasks, done when + commands, report format, model). WP-01 brief gets the full contract sketch (ids, runtime, state, rules, save, assets, entity, input, interaction, ui, world, debug).
5. First commit. STOP and report. You start WP-01. No game code is written in this step.

## Verification (Milestone 1)
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run assets:check`, `npm run test:e2e` (desktop 1280×720 + mobile 390×844 touch).
- E2E plays the 15 steps with real input, reloads mid-way (facts, reflection, position kept), checks "I want more..." exactly once and beetle `attached`, 0 console errors, no network POST.
- Same E2E with `?assets=placeholder` → proves asset swap without code change.
- `?debug` screenshots per zone on mobile view: <120 draw calls, <250k tris.
- Human play on desktop + real phone (D1, D2). Report says clearly what was not verified.
