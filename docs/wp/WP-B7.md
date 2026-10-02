# WP-B7: Action clips for the shared rig and `Visual.play`

- Model: Claude Sonnet. Wave 2 of Phase B. Needs: WP-34 (shared rig, done), WP-B0 (done).
- Read first: `docs/wp/_COMMON_FINISH.md`, `docs/PLAN_MVP.md`, `GAME_MASTER_SPEC.md` §1 (lower position = active help, never kneeling), §16.6, §18.1–§18.7 (clip lists), `tools/rig/README.md`, `docs/reports/WP-34.md`.
- Owns: `tools/rig/`, `3D Models/assets/characters/*_rigged.glb` and `player_rigged_v2.glb` (regenerated outputs), `src/assets/feature.ts` (clip playback only), `src/assets/registry/characters.ts` (clip maps), tests `tests/rig*.spec.ts`, `tests/assets-play*.spec.ts`, `docs/evidence/wp-b7/`.
- Do not edit world, narrative, UI or app files.

## Tasks

1. Add these clips to the shared rig generator for every character (player and the six NPCs), with the same 17 bones, 30 keys per second or more, no root motion, no scale keys: `Help` (lift with both arms in front, slight knee bend, back straight — never kneel), `Carry_Loop` (hold a box in front at chest height), `Give` (reach forward with both hands, open), `Receive` (open hands, take, bring close), `Talk_Loop` (small hand gestures), `Listen_Loop` (calm, head tilt, small nods), `Search_Loop` (look down left and right, bend a little), `Relief` (shoulders drop, breathe out), `Worry_Loop` (arms closed, small shifts), `Refuse` (small hand up, step back half), `Welcome` (open arms, small).
2. Keep the existing clips unchanged. The player v2 file may change now (new clips); prove that the old clips are byte-equal in their key data, or explain the change.
3. `src/assets/feature.ts`: implement `Visual.play(action, loop?)`. Map logical action names (`help`, `carry`, `give`, `receive`, `talk`, `listen`, `search`, `relief`, `worry`, `refuse`, `welcome`) through the registry clip map. A one-shot clip plays once and blends back to idle/walk. Loop clips play until `animate()` is called with another state or `play` is called again. Placeholders return false (no crash).
4. Registry clip maps for all characters in `characters.ts`.
5. Validate all files (`validate_shared.py` extended). Sizes: each character file at most 3 MB.
6. Render front and side views of `Help`, `Give`, `Receive` for the merchant and the player in `docs/evidence/wp-b7/`. Look at them. No kneeling, no arms through the body.

## Done when

- `npm run assets:sync`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass. `npm run test:e2e` passes with your own `LW_PORT`.
- Report: per file bytes, clip list, and an open item for a human bend check.
- Commit on your branch with prefix `WP-B7:`.
