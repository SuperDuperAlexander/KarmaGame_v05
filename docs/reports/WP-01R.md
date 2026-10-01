# WP-01R review

- Reviewed the live root code after the feature merges.
- Reviewed `GAME_MASTER_SPEC.md` section 21.
- The early contract review was delayed. This review records that change.
- No shared code was changed by this review.
- This report does not mark v0.1 complete.

## Checks run

- Root `npm run typecheck` passed.
- Root `npm test` passed: 67 tests in 11 files.
- A Babylon 9 NullEngine ray check proved the disabled gate fault.
- The old ray filter hit a disabled box.
- An enabled check removed that hit.
- The lead added that enabled check during this review.
- Lead smoke evidence reports 44 draw calls and about 78,000 triangles.
- The lead used SwiftShader. This is software rendering.
- This worker did not run a browser or phone check.

## Contract result

- State, rules, save, reflection and narrative have no Babylon imports.
- Game roots own movement and collision.
- Visual roots own model axes and scale.
- Asset paths are in the registry.
- Asset bounds are set before the visual gets its world parent.
- Asset sources are cached per scene. Static copies use instances.
- The lazy glTF 2.0 import registers both the file loader and the model loader.
- Hand grips use named nodes or linked hand bone nodes.
- Run uses the real chosen clip's authored speed.
- Input locks can overlap. Each release clears only its own lock.
- Rules keep facts, fired rule names and wave names in the save.
- Save validation rejects bad data. Bad text goes to the recovery key.
- Reflection code keeps literal text. It does not change traits.
- Save and reflection code contain no network call.
- Scene cache keeps each world's player position between visits.
- The live lead code checks loaded spawn bounds and frees scenes on exit.
- Outer gate, inner ring and market table have separate simple colliders.
- Reflection and desire spots remain within reach of their colliders.
- The v2 rig is in the asset drop zone. Recursive sync includes it.
- No change to the shared interfaces is needed for the current slice.

## Findings

| Priority | Finding | Evidence | Next action |
|---|---|---|---|
| 1 | Pause stops game updates but keeps clip motion. | `src/app/app.ts` skips the motor but still calls `scene.render()`. The pause command does not pause animatables. | Pause scene animation too. Check a pause while the player walks. |
| 2 | The viewer omits missing names. | `src/assets/feature.ts` records missing nodes and clips. The viewer in `src/app/app.ts` shows status and path only. | Show the recorded missing names for loaded visuals. |
| 2 | Live quality choice is not connected. | `setPresentationQuality` has no app or user interface caller. | Add a live choice, or record this plan item as open. |
| fixed | Disabled gate could block the camera. | Babylon's custom ray predicate skips the default enabled check. The NullEngine probe hit the disabled gate. | Lead added `mesh.isEnabled()` to the filter. Run a gate camera check. |

## Section 21 evidence map

| Check | Current proof | Open proof |
|---|---|---|
| Full slice without debug commands | Rule and save unit tests pass. Scene smoke boots. | Full desktop and touch input journeys. |
| Package, chain and open gate | State-driven code and world tests pass. | Browser views after first action and reload. |
| Tree and two inner visits | Both worlds load from the same state. Beetle state unit test passes. | Full route, clear landmark and attached beetle view. |
| Reflection save or skip | Local save, text and delete unit tests pass. | Browser input, reload and literal text checks. |
| One desire wave | Rule facts and wave names persist. Journey unit tests pass. | Full browser journey and reload count. |
| Keyboard, mouse and 390 x 844 touch | Input and hold tests pass. | Real input browser runs, control overlap and camera wall checks. |
| Stay inside the map | Closed outer edges, inner ring and spawn bounds are present. | Wall-hug route and ring camera tests. |
| Build and code quality | Type check and 67 tests passed in this review. | Lead final lint and build run after all edits. |
| Asset swaps | Registry, fallback, cache and placement tests pass. | Full journey with `?assets=placeholder`. Final art is optional for this slice. |
| No browser errors | Lead smoke reports no errors. | Both full journeys, reload and inner scene checks. |
| Fewer than 120 draws and 250,000 triangles | Lead smoke reports 44 draws and about 78,000 triangles on SwiftShader. | Counts in each scene at the mobile view. |
| 30 frames per second on the chosen phone | No phone proof. | D1 and D2 real phone checks. |
| Clear tree, water, package, market and beetle | Placeholder shapes and water shader exist. | Browser views in each zone and a human view check. |
| No score, diagnosis, promise or text upload | Content tests pass. Reflection code is local and plain text. | Browser request log in the full journey. |

- The milestone stays open until the missing checks have proof.
- Do not call a mobile browser view a real phone test.
- Do not call temporary art final.
- Stop story scope at the attached beetle.
