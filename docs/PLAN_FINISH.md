# Plan: finish v0.1 with the real 3D models

- Date: 2026-10-02.
- Goal: replace code shapes with the new models in `3D Models/assets/`.
- Goal: make the slice look finished and run well on a phone.
- Scope stays the same: the game stops at the attached beetle (spec §6, §22).
- Spec phase 5 (art and speed) and phase 6 (checks) are still open. This plan closes them.
- Phase B (Finance MVP story) is listed at the end. It starts only after the user says yes.

## Model use (user instruction 2026-10-02)

- The user asked to give work to smaller, cheaper models.
- Lead: Claude Opus. Owns contracts, merges, reviews, final look check.
- Code and visual helpers: Claude Sonnet.
- Docs and check runs: Claude Haiku.
- ChatGPT/Codex: the user can start a brief from `docs/wp/` in Codex. The briefs do not depend on one tool.
- The user updated `AGENTS.md` and `CLAUDE.md` on 2026-10-02.
- User decision 2026-10-02: all characters use the test rig skeleton and clips (WP-34).
- All other `AGENTS.md` rules stay: worktrees, owned files, checks, reports, three workers or fewer.

## What the new files contain (lead check, 2026-10-02)

| File | Triangles | Texture | Parts (GLB node names) |
|---|---:|---|---|
| characters/player.glb | 34,315 | 2048 | no rig; runtime keeps `player_rigged_v2.glb` |
| characters/merchant.glb | 19,651 | 1024 | `merchantBody`, grips; no rig |
| characters/citizen_female.glb | 10,988 | 1024 | `citizenBody`, grips; no rig |
| characters/citizen_male.glb | 13,039 | 1024 | `citizenBody`, grips; no rig |
| characters/fear_child, dark_district_npc, exchange_guide | 12–20k | 1024 | Phase B only |
| core/central_tree_outer.glb | 34,936 | 2048 | `leaves_*`, `trunk`, `branches_*`, `root_surface_*`, `small_vines` |
| core/central_tree_inner.glb | 39,997 | 2048 | `root_attachment_*`, `root_fear_*`, `root_center`, `trunk`, `leaf_clusters` |
| core/finance_package.glb | 2,627 | 1024 | unchanged |
| core/package_chain.glb | 1,500 | 512 | new: `chain_link`, `linkStart`, `linkEnd` |
| creatures/attachment_beetle.glb | 14,269 | 1024 | one mesh `body`; no rig |
| city/city_building_kit.glb | 28,433 | 2048 | `small_house`, `medium_house`, `corner_house`, `tower`, `wall_section`, `roof_*`, `balcony`, `archway`, `stairs` … |
| city/city_infrastructure.glb | 18,071 | 2048 | `city_gate`, `wall_straight`, `wall_corner`, `small_bridge`, `street_lamp`, `bench`, `fountain_base` … |
| city/exchange_house.glb | 29,999 | 2048 | Phase B only |
| market/market_stall_A/B.glb | 8–10k | 1024 | `canopy` + unnamed body |
| market/market_props.glb | 15,161 | 1024 | `wooden_crate`, `small_basket`, `ceramic_jug`, `bread`, `apple` … |
| inner_world/inner_platform_kit.glb | 15,986 | 1024 | `platform_small/medium/large/long/round/bridge` |
| inner_world/inner_rock_kit.glb | 11,095 | 1024 | `rock_*`, `rock_arch`, `stalagmite`, `cliff_wall` |
| inner_world/inner_crystal_kit.glb | 2,726 | 1024 | `crystal_small/medium/cluster/tall` |
| world/vegetation_kit.glb | 9,315 | 1024 | `grass_clump`, `flower_*`, `fern`, `bush_*`, `vine_segment`, `mushroom_*` |

- All files: one material, one texture, plain glTF, no LOD, no colliders, no animation.
- Raw total is about 29 MB. Spec start budget is 12 MB, total 35 MB. So an optimizer step is needed.
- The names follow `docs/3D_ASSET_GENERATION_MASTER.md`, not spec §18. The registry maps them (AD-4).

## Lead work done (WP-30)

- `AssetService.create(id, scene, parent, part)` can now load one part of a kit file.
- Registry entry field `parts: {logicalPart: [glbNodeNames]}` maps kit parts.
- The registry is split by owner: `characters.ts`, `core.ts`, `outer.ts`, `inner.ts`. `index.ts` joins them.
- New asset ids: `CitizenMale`, `MarketProps`, and Phase B ids `FearChild`, `DarkNpc`, `ExchangeGuide`, `ExchangeHouse`. All start as code placeholders.
- `player_rigged_v2.glb` was missing in the drop folder. `python tools/rig/generate_rig_v2.py` made it again. The bytes match git.
- Type check, lint and 71 tests pass.

## Work packages

| WP | Name | Model | Wave | Needs | Owns |
|---|---|---|---|---|---|
| 31 | Asset optimizer (size, textures) | Sonnet | 1 | 30 | `tools/assets/`, devDependencies for glTF-Transform |
| 32 | Outer world with real art | Sonnet | 1 | 30 | `src/world/outer/`, `registry/outer.ts`, Citizen entries in `registry/characters.ts`, kit-part fixes in `src/assets/feature.ts` |
| 33 | Inner world, beetle and chain with real art | Sonnet | 1 | 30 | `src/world/inner/`, `registry/inner.ts`, `registry/core.ts`, `src/creatures/`, `src/props/` |
| 34 | Shared rig and clips for all six characters | Sonnet | 2 (first free slot) | 30 | `tools/rig/`, `registry/characters.ts`, `src/npc/` |
| 35 | Light, fog, tree state glow, water polish | Sonnet | 2 | 32, 33 | `src/presentation/` |
| 36 | Speed: LOD, freeze, lazy load, budgets | Sonnet | 3 | 31–35 | `tools/assets/`, `src/assets/` (load), scene freeze calls via report |
| 37 | Docs and asset status | Haiku | after each wave | – | `docs/assets/ASSET_STATUS.md`, `README.md` (known limits), `docs/work-packages.json` |
| 38 | Full check run and evidence | Haiku | after each wave | – | `docs/evidence/` (read-only on code) |
| 39 | Merge, look review, `DEVELOPMENT_DECISIONS.md` | Opus (lead) | each wave | – | shared files |

```
Wave 1: 31 · 32 · 33  (parallel, 3 workers)   → lead merge 31 first, then 32, 33 → 38 check run
Wave 2: 34 · 35       (parallel)              → lead merge → 38 check run → 37 docs
Wave 3: 36            → lead merge → 38 → 37 → user phone check (D1, D2) and walk review
```

- Critical path: 30 → 32/33 → 35 → 36 → phone check.
- Cost rule: Opus only merges and reviews. Sonnet builds. Haiku runs checks and writes docs.
- Each helper writes `docs/reports/WP-<id>.md` and `docs/decisions/WP-<id>.md`.

## Done when (this plan)

- All v0.1 assets that have a new file use it. Status `temporary` until a person approves the look.
- `?assets=placeholder` still plays the full slice (swap proof).
- All six browser journeys pass. Zero console errors.
- Phone-size view: under 80 draw calls target, 120 hard; under 250,000 triangles.
- Start download without audio at most 12 MB target, 18 MB hard. Total at most 35 MB.
- The user checks a real phone (30 FPS target) and the walk/grip look.

## Phase B: Finance MVP (only after user approval)

| WP | Name | Model | Assets |
|---|---|---|---|
| B1 | Rules and state for Fear, Service, Give, Receive, Exchange, Transformation | Sonnet | – |
| B2 | Fear Child and Dark NPC stories, cold root zone | Sonnet | fear_child, dark_district_npc |
| B3 | Service Corner: merchant crate (help, no kneel), gift accept/decline | Sonnet | merchant (needs Help, Carry clips) |
| B4 | Citizens who give too much / cannot receive; water between two basins | Sonnet | citizens |
| B5 | Exchange House and Guide, beetle transformation, end image at Source Water | Sonnet | exchange_house, exchange_guide |
| B6 | Content and safety review (§1, §4, §21) | Haiku draft, Opus final | – |

## Lead notes after WP-33 merge (input for WP-35 and lead follow-ups)

- WP-33 merged. Checks on `main`: type check, lint, 74 tests pass. Helper e2e: 6 of 6.
- Inner view: 25–30 draw calls, 92k–137k triangles. Inside budget.
- WP-35: the inner floor is a flat grey code disk. Give it a painted stone look with root seams. Use platform kit parts at the edge.
- WP-35: the inner scene is too dark. The tree roots read as a dark ceiling. Light the roots from below.
- WP-35: the Source Water strip cuts through the fear roots in the west. Move or shorten the strip.
- Lead: the outer carry chain in `src/app/sceneManager.ts` still uses the code torus. Switch it to the new link.
- Lead: kit parts keep their X offset from the file. WP-33 resets it in its code. Decide in the WP-32 merge if the loader centers parts.
- Open: the chain ends at the beetle head. The beetle file has no anchor node.

## Lead notes after WP-31 and WP-32 merge

- Merged WP-31 and WP-32. The lead removed the inner X reset because the loader now centres kit parts.
- `main` checks: type check, lint, 83 tests and build pass.
- Full e2e on `main` (port 5230): first run 4 of 6 pass. Both "normal assets" journeys failed once.
- A rerun of each failed journey passes (desktop 1 of 1, mobile 2 of 2). Likely cause: the first Vite start after `npm install` re-bundles dependencies and reloads the page. WP-38 must run the full suite twice and report any repeat failure.
- WP-36 input: the desktop spawn view shows 296,408 triangles at 25 FPS (frames per second) on the first frames. The city view shows 244,262. Phone-size views are lower, but this needs LOD or distance culling for houses.

## Lead notes after WP-34, WP-35 and WP-37 merge

- Merged WP-34 (shared rig), WP-35 (light, ground, water, mood) and WP-37 (docs).
- `main` checks: type check, lint and 89 tests pass. Helpers report e2e 6 of 6 each.
- Lead look check: outer square, path and market read warm and clear. Rigged citizens and merchant face the right way.
- Lead look check: the inner trunk shows as a flat dark-blue wall in front of the camera. WP-36 fixes it.
- Next: WP-36 (speed, view blockers, load size), then WP-38 (two full check runs), then WP-37 again, then the user phone check.
