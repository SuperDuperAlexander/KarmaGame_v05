# Asset status

- No asset is final or approved.
- No paid asset job was started.
- No model was copied from another project.
- Runtime files come from `3D Models/assets/` in this project.
- `npm run assets:sync` copies them to `public/assets/` and optimizes them.
- Rig tools: `tools/rig/rig_shared.py`, `validate_shared.py`, marks in `tools/rig/marks/`.

## After Wave 1

All assets are `temporary`. A person must check the art on a real phone.

| No. | File | Raw MB | Opt MB | Triangles | Status | Checks open |
|---|---|---|---|---|---|---|
| 01 | player_rigged_v2.glb | 2.64 | 2.34 | 34,315 | temporary | Gait and grips; 17-bone v2 rig has 5 clips |
| 02 | central_tree_outer.glb | 4.66 | 1.75 | 34,936 | temporary | Art look, stone and fence color; separate meshes for glow |
| 03 | central_tree_inner.glb | 3.39 | 1.43 | 39,997 | temporary | Art look, darkness; missing root_package and root_background_02 nodes |
| 04 | finance_package.glb | 0.54 | 0.30 | 2,627 | temporary | Missing straps and symbol nodes |
| 05 | attachment_beetle.glb | 1.20 | 0.67 | 14,269 | temporary | Art look; one mesh, no rig, no clips, no anchor node |
| 06 | merchant_rigged.glb | 1.70 | 0.75 | 19,651 | temporary | Bends; rigged with shared 17-bone rig; 5 clips |
| 07 | market_stall_A.glb | 0.90 | 0.51 | 8,265 | temporary | Art look; missing frame, counter and shelves nodes |
| 08 | inner_platform_kit.glb | 1.35 | 0.79 | 15,986 | temporary | Art look, kit parts; no colliders |
| 09 | citizen_female_rigged.glb | 0.55 | 0.30 | 10,988 | temporary | Bends; rigged with shared 17-bone rig; 5 clips |
| 10 | citizen_male_rigged.glb | 0.57 | 0.31 | 13,039 | temporary | Bends; rigged with shared 17-bone rig; 5 clips |
| 11 | fear_child_rigged.glb | 0.92 | 0.52 | 19,998 | temporary | Bends, fast walk (0.255 s cycle); shared 17-bone rig; 5 clips; Phase B only |
| 12 | dark_npc_rigged.glb | 0.51 | 0.27 | 12,350 | temporary | Bends; rigged with shared 17-bone rig; 5 clips; Phase B only |
| 13 | exchange_guide_rigged.glb | 0.71 | 0.39 | 18,074 | temporary | Bends, stiff coat; rigged with shared 17-bone rig; 5 clips; Phase B only |
| 14 | exchange_house.glb | 2.43 | 0.91 | 29,999 | temporary | Art look; Phase B only |
| 15 | market_stall_B.glb | 0.75 | 0.41 | 9,996 | temporary | Art look; kit part; long side is depth |
| 16 | market_props.glb | 1.11 | 0.63 | 15,161 | temporary | Art look; 13 kit parts (crate, baskets, fruit, bread, jug, cloth, table, barrel, box, sign) |
| 17 | city_building_kit.glb | 2.93 | 1.02 | 28,433 | temporary | Art look; 12 kit parts (small/medium/corner/tower houses, walls, windows, doors, roofs, balcony, archway, stairs) |
| 18 | city_infrastructure.glb | 2.32 | 0.73 | 18,071 | temporary | Art look; 9 kit parts (gate, walls, bridge, stairs, lamp, bench, fence, banner, fountain) |
| 19 | inner_rock_kit.glb | 0.94 | 0.54 | 11,095 | temporary | Art look; 8 kit parts (rocks, arch, stalagmite, cliff_wall) |
| 20 | inner_crystal_kit.glb | 0.70 | 0.41 | 2,726 | temporary | Art look; 4 kit parts (crystal_small/medium/cluster/tall), heights 0.4–4.0 m |
| 21 | vegetation_kit.glb | 1.02 | 0.57 | 9,315 | temporary | Art look; 9 kit parts (grass, flowers, fern, bushes, vine, mushrooms) |
| 22 | package_chain.glb | 0.10 | 0.05 | 1,500 | temporary | One link, flat ring, Y axis 0.64 m, X width 0.44 m, Z thin 0.12 m |
| test | player_rigged_test.glb | 2.55 | 2.55 | 34,315 | temporary | Test rig, 17 bones, 2 clips (Idle, Walk); source for the v2 rig only, not loaded by the game |
| v2 | player_rigged_v2.glb | 2.64 | 2.34 | 34,315 | temporary | Main rig, 17 bones, 5 clips (Idle, Walk, Run, Interact, LookAround) |

**Totals**: raw 37.32 MB, optimized 19.41 MB.

Far LOD levels are built at load time (WP-36). Start download before the first playable frame is about 7.3 MB (WP-36).

## Name conflicts

- The game uses logical names such as `handR`, `walk`, `run` and `chain`.
- The registry maps these names to the real asset names.
- The asset work order uses `Idle` and `Walk`.
- The game master also names clips such as `Idle_Loop`.
- The asset work order uses `packageBody` and `chainAnchor`.
- Older game naming uses `MESH_package_wrap` and `SOCKET_chain`.
- Runtime paths follow the asset work order.
- V2 Walk is authored for 2.8 metres per second.
- V2 Run is authored for 4.6 metres per second.
- Hand sockets use linked hand bone transform nodes. A bone attachment is the fallback.

## Open checks

- Browser loads, real movement, both route scenes and reload checks pass.
- Both normal and placeholder asset routes pass at desktop and phone-size views.
- Camera wall and gate tests pass.
- A person must check bends at elbows, knees and hips for all rigged characters.
- A person must check the v2 gait and hand grip.
- A person must check the game on a real phone (30 FPS target).
- File checks do not prove art quality or phone speed.
- House textures are dark; light can warm them in WP-35.
- The merchant mesh front is -Z (yaw offset π); it may turn its back to the player.
- The beetle file has no anchor node; the chain end meets the head side.
- The Source Water strip cuts through fear roots at the west; WP-35 must fix it.
- The inner floor is a flat code disk; kit platforms are too small to tile.
- Phone spawn and gate views show 172k triangles, near budget; WP-36 should add LOD or far-house culling.
