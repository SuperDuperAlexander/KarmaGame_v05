# WP-B3: Outer levels for the Finance MVP

- Model: Claude Sonnet. Wave 2 of Phase B. Needs: WP-B0, WP-B1, WP-B2 (merged), WP-43 (look polish).
- Read first: `docs/wp/_COMMON_FINISH.md`, `docs/wp/_COMMON_LOOK.md`, `docs/PLAN_MVP.md`, `docs/reports/WP-B1.md`, `docs/reports/WP-B2.md`, `GAME_MASTER_SPEC.md` §1, §5, §8.1, §15.
- Read code: `src/content/places.ts` (story places), `src/narrative/spots.ts`, `zones.ts`, `microStories.ts` (what happens where), `src/contracts/visual.ts` (`WorldView.act`, `actorPosition`, `Visual.play`), `src/world/outer/*.ts`, `src/npc/*.ts`, `src/assets/registry/*.ts`.
- Owns: `src/world/outer/`, `src/npc/`, `src/assets/registry/outer.ts`, `src/assets/registry/characters.ts` (placement notes only; WP-B7 owns clip maps — coordinate by keeping your edits to new entries), tests `tests/world-outer*.spec.ts`, `tests/npc*.spec.ts`, `docs/evidence/wp-b3/`.
- Do not edit narrative, rules, UI, app, presentation or inner files. Need a place moved? Propose new coordinates in your report; the lead edits `places.ts`.

## Tasks

1. Open the north street from the square to the Exchange House: remove or move houses in the north row so a clear street runs from z 15 to the door at `exchangeDoor` (0, 27). Extend the ground and the world edge north to about z 46. Place `ExchangeHouse` (`city/exchange_house.glb`, footprint about 12 × 10 m, height about 8 m) at `exchangeHouse` (0, 36), door facing the square. Box colliders for walls; the door area stays open.
2. Open the west alley to a small dark district around `darkDistrict` (−24, 4): a few houses closer together, cooler tint (no new light), a bench, the Dark NPC at `darkNpc`. Keep the world closed beyond it.
3. Service corner at `serviceCrate` (17, −9): a hand cart, a heavy crate (`MarketProps` crate part) that can move to `serviceCrateDrop`. The crate move is a transient act from `act('merchant'|'player','carry')`; its lasting position comes from state (`CRATE_CARRIED`).
4. Place NPCs (static entity + visual + simple turn-to-player within 4 m, distance cull like the citizens): `FearChild` at `fearChild`, `DarkNpc` at `darkNpc`, giver (`Citizen`) at `giver`, receiver (`CitizenMale`) at `receiver`, `ExchangeGuide` at `guide`. Move the two current square citizens to these roles (no duplicates). A small glinting coin at `lostCoin`, visible only while the search is running and before `COIN_FOUND`.
5. Implement `WorldView.act(actor, action)` and `actorPosition(actor)` for the outer world: map actors to their entities; call `visual.play?.(action)` (WP-B7 adds clips; until then fall back to a small code motion); move the crate on `carry`; small light motes on `give`/`receive`. No kneeling.
6. Lasting looks from state: crate at the stall after `CRATE_CARRIED`; dark district slightly warmer after `DARK_LISTENED`; the guide stands at the door before `GUIDE_MET`, inside after.
7. Every story place must be reachable on foot, with free space of at least 2 m around each spot. Spots must not overlap.
8. Budget: phone view at most 80 draw calls, 180,000 triangles, also in the new street and the dark district.

## Done when

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` (own `LW_PORT`) pass.
- Screenshots in `docs/evidence/wp-b3/` (desktop and 390×844): north street with Exchange House, dark district, service corner, each NPC with the player next to it (scale check).
- Commit on your branch with prefix `WP-B3:`.
