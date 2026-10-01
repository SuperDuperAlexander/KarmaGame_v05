# WP-A3 [Work Package A3]

## Final integration update (2026-10-02)

- The registry now uses `player_rigged_v2.glb`.
- Normal desktop and touch journeys load the new rig.
- Idle, Walk and Run play in the game.
- End images show the carried package and chain.
- The final merged build and all 71 tests pass.
- Asset checks confirm five clips, two hand grips and 17 bones.
- A human must still review moving bends and hand grip.
- Earlier work-folder check notes below are history.
- The current full report is `docs/reports/WP-22.md`.

- Added a repeatable local rig runner.
- Used `character-rig-test/rig_character.py` as the local math and clip writer.
- Used the local `check_asset.py` rules for the new file checks.
- The tested input stays unchanged.
- The original mesh, images, weights and Idle clip stay unchanged.
- No outside project code, Blender or paid job was used.
- The new file remains temporary.

## File and clips

- File: `3D Models/assets/characters/player_rigged_v2.glb`.
- Size: 2,771,448 bytes.
- Mesh: 46,588 vertices and 34,315 triangles.
- Rig: 17 bones and one material.
- Clips: `Idle`, `Walk`, `Run`, `Interact`, `LookAround`.
- `Walk` fits 2.8 meters per second.
- `Run` fits 4.6 meters per second.
- `Interact` plays once for one second.
- `LookAround` loops in three seconds.
- Other clips loop.
- Grips: `leftHandGrip` and `rightHandGrip`.
- The grips are children of `LeftHand` and `RightHand`.
- Both local grip positions are `(0, -0.04, 0.02)`.
- The lead must add the file path to the asset registry after browser review.
- The expected served path after asset sync is `/assets/characters/player_rigged_v2.glb`.

## Checks

- Checked binary file layout, bounds and buffer ranges.
- Checked exact clip names and full joint reset tracks.
- Checked loop end poses and unit rotation values.
- Checked grip names and hand parents.
- Checked source bytes and source data tables stay unchanged.
- Checked skin weights sum to one.
- Checked sample knees bend forward and flat soles stay flat.
- Checked stance travel fits each authored speed.
- Checked stance contact error below 0.00001 meters at exported keys.
- Seven Python file checks passed.
- `npm run typecheck` and `npm run lint` passed.
- `npm test` passed: 50 tests in five files. This includes the seven Python checks.
- `npm run build` needs the lead's `src/main.ts`, absent in this worktree.
- Evidence: `tools/rig/validation-v2.json`.

## Limits and next checks

- Walk uses a 0.31 meter half reach and 4.52 steps per second.
- Run uses a 0.38 meter half reach and 6.05 steps per second.
- These fast steps follow the short original legs and the set game speeds.
- Run drops the hips by up to 0.13 meters.
- Walk drops the hips by up to 0.08 meters.
- These are contact math choices. They do not prove a natural gait.
- The local checks sample the exported keys.
- The game must check motion between keys, fades and foot slip.
- A person has not checked the new bends.
- Package grip needs a view check in the game.
- Browser load, animation blend and real phone checks remain open.
