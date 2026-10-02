# WP-B4: Inner mirrors, beetle transformation and finale image

- Model: Claude Sonnet. Wave 2 of Phase B. Needs: WP-B0, WP-B1, WP-B2 (merged), WP-43 (look polish).
- Read first: `docs/wp/_COMMON_FINISH.md`, `docs/wp/_COMMON_LOOK.md`, `docs/PLAN_MVP.md`, `docs/reports/WP-B1.md`, `GAME_MASTER_SPEC.md` §1, §8.2, §8.3, §9, §18.8.
- Read code: `src/state/selectors.ts` (beetleState with observed/released/transformed, chainState `free`, fearZoneVisible, basinFlow, servicePlants, finaleReady, finaleSeen), `src/content/places.ts`, `src/narrative/microStories.ts`, `src/contracts/visual.ts`, `src/world/inner/*.ts`, `src/creatures/*.ts`, `src/props/*.ts`, `src/presentation/*.ts`.
- Owns: `src/world/inner/`, `src/creatures/`, `src/props/`, `src/presentation/` (finale image and outer water state), tests `tests/world-inner*.spec.ts`, `tests/beetle*.spec.ts`, `tests/chain*.spec.ts`, `tests/presentation*.spec.ts`, `docs/evidence/wp-b4/`.
- Do not edit outer world files (WP-B3), narrative, UI, app or assets.

## Tasks

1. Beetle states (spec §18.8, all from `selectors.beetleState`): `observed` — calmer breathing, glow softens; `released` — legs relax, shell opens a little, chain detaches; `transformed` — soft posture, dim warm glow, small light motes, maybe gentle wing-like light (concept sheet panel E). Never dying, exploding or shrinking away.
2. Chain: `free` after transformation — the chain from package to beetle fades out or drops loose. Outer carry chain also follows `chainState` (loose → tense → free). One draw call.
3. Fear root zone at `innerFearZone`: visible cold blue-violet roots and soft dark mist when `fearZoneVisible`; it calms a little after `CHILD_LISTENED` or `DARK_LISTENED`. Not scary.
4. Two basins at `basinLeft` and `basinRight` with a water channel between them. Flow strength from `basinFlow` (0 = still, 1 = steady flow with light specks). Shader water with `precision highp float`.
5. Service plants at `servicePlants`: 0 to 3 small glowing plants rise with `servicePlants`.
6. Finale image in the outer world at `finale` (`finaleSeen`): Source Water bright and steady, tree glow warm, chain gone, light motes rising, gentle camera-friendly composition. No text in 3D.
7. `WorldView.act` and `actorPosition` for the inner world (`beetle`, `player`): `observe` → beetle turns toward the player; `release` → short release motion.
8. Every lasting look must be right directly after reload in any state (AD-9).
9. Budget: phone view at most 80 draw calls, 180,000 triangles. Particles at most 250.

## Done when

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` (own `LW_PORT`) pass.
- Screenshots in `docs/evidence/wp-b4/` (desktop and 390×844): each beetle state, fear zone, basins at flow 0 and 1, plants 0 and 3, finale image. Use a scratch spec that sets state through real play or a dev-only save file; never ship a cheat.
- Commit on your branch with prefix `WP-B4:`.
