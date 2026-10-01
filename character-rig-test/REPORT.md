# Character rig test

## Result

- The test GLB [binary 3D file] loads in Babylon.js.
- It has 17 bones and two clips: `Idle` and `Walk`.
- The model keeps its source mesh, material, and image.
- The test scene stays separate from the game.

## Source check

- The source has one mesh and one triangle group.
- It has 46,588 vertex records and 34,315 triangles.
- It has one material and one built-in 1024 × 1024 JPEG image.
- The model is 1.70 m high. Its feet are at `Y=0`.
- The model uses `Y` as up. It faces `+Z`.
- The two source nodes have no rotation or scale change.
- The arms form an A-pose. The legs have space between them.
- The shoulders, elbows, hips, and knees have clear bend areas.
- Many vertex records split at image seams. A position match joins most of them.
- The matched mesh has 12 surface parts. Its main part has 46,146 of 46,588 vertex records.
- These small parts did not block this test.
- The source has no skin or animation. This is the main missing data.

## Method

- Run `python rig_character.py` in this folder.
- The script reads `../player_simple_opt.glb`.
- It uses 17 fixed joint marks for this model.
- It puts weights on each vertex from its 3D position.
- Equal vertex positions get equal weights. This helps at image seams.
- It adds short, in-place `Idle` and `Walk` clips.
- It writes `public/player_rigged_test.glb`.
- The script keeps the source mesh, normals, image map, image bytes, and material.
- A person placed the 17 joint marks once after a front and side view check. This was the manual step.
- New characters need a new joint mark check. The script is not a general body finder.

## Other rig methods

- [Adobe Mixamo](https://helpx.adobe.com/creative-cloud/help/mixamo-rigging-animation.html) can rig a person. It needs FBX, OBJ, or ZIP input. It also asks a person to place joint marks.
- [Blender](https://docs.blender.org/manual/en/latest/animation/armatures/skinning/parenting.html) can give a placed bone rig automatic weights. A person must still check the weights.
- [Blender GLB export](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html) can hold a skin and animation.
- This test uses the local script because it can run again with no Blender install or cloud step.

## Run

1. Open PowerShell in `D:\MyDrive\ALEXANDER\PROJEKTE\KarmaGame_v05\character-rig-test`.
2. Run `npm ci` if this is a new copy.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:5173/`.
5. Use `W`, `A`, `S`, and `D` to move.
6. Drag the mouse to turn the camera. Use the wheel to zoom.
7. Press `Walk test` to see the clip while the player stays still.

## Checks

- `python check_asset.py` passed. It checked the source mesh bytes, image bytes, bone use, clip names, and weight sums.
- The final build passed with `$env:NODE_OPTIONS='--max-old-space-size=2048'; npm run build` in PowerShell.
- One build run ran out of Node memory before that change.
- Babylon.js loaded the model with 17 bones and 34,315 triangles.
- The front, side, and back views showed no large tears in the test walk pose.
- The shoulder, elbow, hip, and knee bends need a close human review before game use.
- A movement test changed the player position from `Z=0.30` to `Z=0.65`. The camera kept the player in view.
- The `Walk test` control changed Walk to Idle in the same browser run.
- No browser error was seen in the test run.
- The automated browser showed 1 to 6 FPS [frames per second]. Background limits may affect this value. Do not use it as a phone or real GPU [graphics processor] result.
- The built JavaScript file was about 6.3 MB before compression. This may need work before mobile use.

## Decision

- This model can use a skeleton in Babylon.js.
- The local script can be reused for models with the same pose, scale, and body shape after a joint mark check.
- Do a close bend check and a real device speed check before using this as the main character pipeline.
- Stop here. Do not move this test into the game yet.

## Arm and walk fix — 2026-10-01

- The first weights let the thigh bones move some hand vertices. This caused the extra arm bends shown in the review.
- The arm region now takes priority over the leg region.
- The elbow blend now stays near the elbow. The wrist and hand follow the forearm with no extra wrist bend.
- Both clips lower the arms from the source A-pose.
- Walk swings each arm against the leg on the same side.
- The elbows keep a small forward bend. They do not bend backwards.
- The loop has 33 key samples over 1.08 seconds. The step timing and foot tilt are smoother.
- Both clips now set all 17 joint rotations. The change to Idle also resets the elbows and legs.
- The asset check passed for 892 outer arm vertices with no leg or body weights.
- Side views checked both swing ends. A front view checked arm spacing. The live loop and both clip changes worked in Babylon.js with no browser errors.
- The live browser meter showed about 60 FPS [frames per second] in this run. This is a local browser result. A phone check is still open.
- For a fixed side pose, open `/?walk=1&phase=0.5&view=side` on the test server. Remove `phase` to play the loop.
- The old GLB is saved at `validation/before-arm-fix.glb` for comparison.

## Knee bend and stance fix — 2026-10-01

- The old leg weights spread each knee bend along the thigh and shin.
- The new weights blend only near the hip, knee, and ankle.
- The boot and the leg shafts keep their shape.
- The leg joint marks now sit closer to the centre of the source legs in the side view.
- The script sets a foot path first. It then calculates the thigh and knee angles from the two bone lengths.
- This calculation runs when the file is made. The browser only plays the saved clip.
- Each knee bends forward. The shin folds back under the thigh.
- The swing foot lifts 10 cm. The stance foot stays on the floor.
- The foot stays level. Each arm swings against the leg on the same side.
- The walk has 65 samples over 0.96 seconds.
- The stance foot travels 62 cm in 0.48 seconds. This matches the test movement speed of about 1.3 m/s.
- Both clips bring the legs inward by about 5 degrees. This narrows the front view stance.
- The foot centres are now about 20 cm apart. The source stance was about 32 cm wide.
- The source mesh, image, and material bytes stay the same.
- No new manual step was needed.
- The earlier file is saved at `validation/before-knee-fix.glb`.
- The asset check tests 2,566 boot and leg shaft vertices. It also checks both knee bends, floor contact, foot lift, stance width, and the loop join.
- For the front view, use `/?walk=1&view=front`. Add `&phase=0` to stop at a contact pose.
- Front views checked both contact poses. Side views checked both swing knee bends.
- The live walk and the change to Idle passed in Babylon.js. No browser error was seen.
- The build passed. The live server and built copy contain the same new character file.
