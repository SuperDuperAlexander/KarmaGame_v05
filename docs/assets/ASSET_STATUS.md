# Asset status

- No asset is final or approved.
- No paid asset job was started.
- No model was copied from another project.
- Runtime files come from `3D Models/assets/` and `character-rig-test/public/` in this project.
- `npm run assets:sync` copies them to the generated `public/assets/` folder.

| Logical asset | Status | Current proof |
|---|---|---|
| Player | temporary | Local v2 rig; 34,315 triangles, 17 joints, Idle/Walk/Run/Interact/LookAround, two hand grips, 2048 x 2048 texture |
| Merchant | temporary | 19,651 triangles, 1024 x 1024 texture, no rig or clips |
| FinancePackage | temporary | 2,627 triangles, 1024 x 1024 texture, missing straps and symbol nodes |
| ChainLink | temporary | 1,099 triangles, 512 x 512 texture; runtime uses one merged code chain |
| MarketStallA | temporary | 8,265 triangles, 1024 x 1024 texture, missing frame, counter and shelves nodes |
| CentralTreeOuter, CentralTreeInner, AttachmentBeetle | placeholder | Code shapes, no final art proof |
| MarketStallB, CityGate, CityWall, CityBuilding, Citizen | placeholder | Code shapes, no final art proof |
| InnerPlatform, Rock, Crystal, Vegetation | placeholder | Code shapes, no final art proof |
| Source Water, light specks, fog | runtime code | One water shader, one merged speck mesh, scene fog |

## Name conflicts

- The game uses logical names such as `handR`, `walk`, `run` and `chain`.
- The registry maps these names to the real asset names.
- The asset work order uses `Idle` and `Walk`.
- The game master also names clips such as `Idle_Loop`.
- The asset work order uses `packageBody` and `chainAnchor`.
- Older game naming uses `MESH_package_wrap` and `SOCKET_chain`.
- The asset work order uses `inner_world/inner_platform_kit`.
- Older game naming uses `inner-world/floating_platforms`.
- Runtime paths follow the asset work order.
- The local test player is a separate temporary rig.
- V2 Walk is authored for 2.8 metres per second.
- V2 Run is authored for 4.6 metres per second.
- If Run is absent, it falls back to Walk at the Walk clip speed.
- Hand sockets use linked hand bone transform nodes.
- A bone attachment is the fallback when no linked node exists.

## Open checks

- Browser loads, real movement, both route scenes and reload checks pass.
- Both normal and all-shape routes pass at desktop and phone-size views.
- Camera wall and disabled gate tests pass.
- The player v2 math and file checks pass.
- A person must still check the v2 gait and hand grip.
- A person must check the game on a real phone.
- File checks do not prove these checks.
- The raw player file has no skin or clips. The runtime uses the local v2 rig instead.
- All 22 full generation prompts are in `asset-generation-manifest.json`.
- All jobs stay pending. Reference paths point to real concept sheets in the project root.
