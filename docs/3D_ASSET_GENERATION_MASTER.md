# 3D_ASSET_GENERATION_MASTER.md

## 1. Purpose

This is the complete work order for a 3D generation agent. Create exactly 22 GLB assets for a Babylon.js browser and mobile game. Work in the order in section 7. Export each job as one valid GLB in its exact path. A kit is one GLB with separately named pieces. Use the concept images supplied with the real game project. This document does not claim that those images or the 3D application programming interface (API) are present in this workspace.

The assets expose parts and animation clips. Babylon.js controls story state, light, material changes, placement, collisions, and clip playback. Keep filenames, node names, and clip names exactly as written. Do not invent story text.

Output paths start at `/assets/` in the game project. If the project serves static files from `public/assets/`, put the files there so the web path stays `/assets/...`.

## 2. Contents and asset index

P0 means the first playable slice. P1 means a later core scene. P2 means reusable world detail. The job number sets the generation order.

| Job | File under `/assets/` | Category | Priority | Purpose |
|---:|---|---|---|---|
| 01 | `characters/player.glb` | Character | P0 | Playable traveler and package holder |
| 02 | `core/central_tree_outer.glb` | Tree | P0 | City tree with independent sides |
| 03 | `core/central_tree_inner.glb` | Tree | P0 | Inner tree with controllable roots |
| 04 | `core/finance_package.glb` | Object | P0 | Symbolic package |
| 05 | `creatures/attachment_beetle.glb` | Creature | P0 | Attachment and transformation |
| 06 | `characters/merchant.glb` | Character | P0 | Market help and Give/Receive story |
| 07 | `market/market_stall_A.glb` | Market | P0 | First food stall |
| 08 | `inner_world/inner_platform_kit.glb` | Inner World kit | P0 | Walkable floating platforms |
| 09 | `characters/citizen_female.glb` | Character | P2 | Reusable city resident |
| 10 | `characters/citizen_male.glb` | Character | P2 | Reusable city resident |
| 11 | `characters/fear_child.glb` | Character | P1 | Fear to hope change |
| 12 | `characters/dark_district_npc.glb` | Character | P1 | Human resident whose intent is misread |
| 13 | `characters/exchange_guide.glb` | Character | P1 | Exchange House guide |
| 14 | `city/exchange_house.glb` | Building | P1 | Exchange destination |
| 15 | `market/market_stall_B.glb` | Market | P2 | Second stall shape |
| 16 | `market/market_props.glb` | Market kit | P1 | Loose goods for help scene |
| 17 | `city/city_building_kit.glb` | City kit | P1 | Reusable houses and modules |
| 18 | `city/city_infrastructure.glb` | City kit | P1 | Gate, walls, bridge, street pieces |
| 19 | `inner_world/inner_rock_kit.glb` | Inner World kit | P2 | Cavern rocks |
| 20 | `inner_world/inner_crystal_kit.glb` | Inner World kit | P2 | Light-ready crystals |
| 21 | `world/vegetation_kit.glb` | World kit | P2 | Cheap repeated plants |
| 22 | `core/package_chain.glb` | Object | P1 | Reusable links for a runtime chain |

## 3. Global prompt

The agent must put this block before **every** asset prompt in section 6. Add only the matched reference images to that request.

```text
GLOBAL STYLE AND TECHNICAL REQUIREMENTS
Create a production-ready 3D game asset for a Babylon.js browser and mobile game. Use the supplied concept art to match the subject, silhouette, proportions, color family, and visual language. Keep required game controls even when a reference image shows parts joined together.
Use stylized 3D, a painterly fantasy look, warm cinematic color, simple readable forms, soft rounded geometry, and a strong silhouette. Make visual quality through shape, material, color, and game light rather than dense geometry. Do not use a photorealistic style.
Export one self-contained GLB using glTF 2.0. Use Y-up, meters, applied mesh transforms, correct normals, clean UVs, physically based rendering (PBR) materials, web-sized textures, and exact required node and clip names. Optimize for real-time WebGL on mobile. Use as few materials as practical.
Set a logical pivot. Give each kit piece its own placement pivot. Avoid hidden geometry and tiny modeled detail. Do not include a background, sky, ground plane, baked scene light, baked glow, camera, display stand, unrelated props, water, fog, particles, or runtime effects.
Return only the requested asset. Keep every part that Babylon.js must control as a separate named node. Do not replace a required animation with a static pose.
```

## 4. Technical standards

- **File:** One binary GLB per job. Use glTF 2.0. Embed textures or keep every referenced texture available at the final path. No temporary URI may remain.
- **Axes and units:** Y is up. Use meters. Face characters and directional props toward +Z at rest. Apply mesh scale and rotation. Keep armature animation transforms valid. Avoid negative scale.
- **Origins:** Put standing character pivots at ground between feet, building and tree pivots at ground center, portable object pivots at their center, and kit-piece pivots at useful base or snap points. Name grip and anchor transforms.
- **Scale:** Use a provisional 1.7 m player, 2.5–3.5 m stall, and 10–14 m outer tree. The inner tree must be much larger. Match supplied concept proportions. Record any changed size.
- **Materials:** Use glTF metallic/roughness PBR. Aim for 1–3 materials on a simple prop, 3–5 on a hero, and at most 4 shared materials for a kit. Keep emissive slots separate when the game changes them.
- **Textures:** Aim for 1024 × 1024 or smaller on mobile. A hero may use up to 2048 × 2048 after review. Prefer power-of-two dimensions. Use alpha only where it saves geometry without large overdraw.
- **Geometry:** Starting review targets are portable props under 3,000 triangles, people under 20,000, beetle under 15,000, outer tree under 40,000, and each whole kit under 40,000. Record actual counts. Preserve the silhouette when a target needs an exception.
- **Level of detail (LOD):** Export `LOD0`. If supported, include `LOD1` at about half the triangles and a simple `LOD2`. Keep all required control nodes on `LOD0`. If the API cannot make safe LODs, record `LOD_pending`; the game can make them later. Never remove required nodes silently.
- **UVs and normals:** Use clean UVs, correct face direction, and working tangent space when normal maps exist. Shared UVs are fine for repeated plain parts. Check alpha edges.
- **Collisions:** Babylon.js makes simple game colliders. A requested `*_COL` guide must stay invisible in normal rendering. Give platforms a clean walkable top. Avoid per-link chain collision.
- **Nodes:** Use exact names from section 6. A named parent may hold child meshes, but each required part must stay independent. Avoid names such as `Cube.001`.
- **Animations:** Export one animation group per exact listed clip name. Use humanoid rigs for people. Use joints or part transforms for the beetle. Keep locomotion in place so Babylon.js moves the object. Make loops seamless. Keep action clips separate. Align grips with held props.
- **Light:** Do not bake sun, fog, aura, bloom, or reflection into textures. Expose separate emissive masks or slots for symbols, roots, crystals, and beetle core. Babylon.js sets light strength and flow.
- **References:** Search the actual project for concept images. Match by subject. Store real paths in `referenceImages`. Do not claim a visual match without comparing images. If a required image is absent, set `needs_reference`. Continue only if that job explicitly allows text-only generation.
- **States:** The GLB contains a neutral base and controllable parts. Babylon.js makes story states. Do not deliver several fixed variants in place of one modular asset.

## 5. Style Bible

The outer world is a warm, painterly fantasy city. The Inner World uses the same visual language at a symbolic scale. Use broad shapes that read from a third-person camera and on a phone. Use soft edges and restrained surface detail. Keep wood, plaster, stone, metal, leaf, and cloth colors consistent across kits. The dark district resident is human. The fear child is gentle. The beetle is expressive and approachable. Use concept art for exact color and costume choices. Check each hero as a small silhouette before approval.

## 6. Asset prompts

Each block is the **asset-specific prompt**. Prepend section 3. Attach the named real reference images. Keep output paths exact.

### 01 — `player.glb`

References: player character sheet; front, side, and back views if present.

```text
OUTPUT: /assets/characters/player.glb
PURPOSE: Main third-person player. Keep the back view clear in motion and flight.
VISUAL: Young adult traveler with broad player identification. Warm face, dark brown hair tied loosely back, off-white tunic or shirt, dark blue loose trousers, brown boots, simple leather items, and a small brown backpack with a subtle warm symbol. Show curiosity and inner strength.
GEOMETRY/NODES: Humanoid rig; separate playerBody, hair, tunic, trousers, boots, backpack, backpackSymbol, leftHandGrip, rightHandGrip. Keep the backpack symbol on a controllable material slot. Hands must hold the finance package and market objects.
SCALE/PIVOT/COLLISION: About 1.7 m. Ground pivot between feet. Leave room for a capsule collider and a carried package.
ANIMATIONS, EXACT: Idle, Walk, Run, WalkBack, StrafeLeft, StrafeRight, Interact, PickUp, CarryIdle, CarryWalk, Give, Receive, Sit, LookAround, FearReaction, Breathe, FlyIdle, FlyForward, Land. Loop idle and travel clips. Keep travel in place.
BABYLON STATES: Base motion, carrying, giving, receiving, fear reaction, rest, and flight. Game attaches the package at a grip and controls backpack glow.
OPTIMIZE: Keep face and silhouette. Put fine cloth detail in texture. Share materials where controls allow.
DO NOT: Add weapons, armor, huge fantasy gear, a fixed package, a floor, or baked glow.
```

### 02 — `central_tree_outer.glb`

References: central tree and city square concepts.

```text
OUTPUT: /assets/core/central_tree_outer.glb
PURPOSE: Iconic city tree and world-state display.
VISUAL: Ancient broad canopy, strong trunk and main branches, soft leaf masses. Neutral export is healthy. Make the shape clear from across the square.
GEOMETRY/NODES, EXACT: trunk, branches_left, branches_right, branches_center, leaves_left_01, leaves_left_02, leaves_right_01, leaves_right_02, leaves_center, small_vines, root_surface_left, root_surface_right, root_surface_center. Keep every group independent. Mark the Fear side, Attachment side, and center in metadata.
SCALE/PIVOT/COLLISION: About 10–14 m high. Pivot at trunk base. Use a simple game collider around trunk and large roots.
ANIMATIONS: None required. Game may move leaves lightly.
BABYLON STATES: Neutral healthy tree; Fear side loses leaves and darkens; Attachment side gains runtime growth; balanced center uses the same geometry.
OPTIMIZE: Use leaf clusters or careful cards. Check mobile alpha overdraw.
DO NOT: Merge foliage, create five tree GLBs, include plaza geometry, or bake state effects.
```

### 03 — `central_tree_inner.glb`

References: Inner World tree and outer tree concepts. It must read as the same tree.

```text
OUTPUT: /assets/core/central_tree_inner.glb
PURPOSE: Large symbolic Central Tree with individual roots for story light.
VISUAL: Same main trunk and branch identity as outer tree, at much larger scale. Huge exposed roots reach out and down toward Source Water. Leave space to walk and fly around them.
GEOMETRY/NODES, EXACT: trunk, root_center, root_fear_main, root_fear_secondary, root_attachment_main, root_attachment_secondary, root_package, root_background_01, root_background_02, branches_upper, leaf_clusters. Keep each root separate and give each a distinct emissive mask or slot.
SCALE/PIVOT/COLLISION: About 25–40 m overall as a provisional target. Pivot at trunk base. Make selected root tops suitable for simple walking colliders.
ANIMATIONS: None required. Game animates root materials.
BABYLON STATES: Dark, active Fear root, active Attachment root, active package root, flowing center, and balanced state. Game addresses each root by name.
OPTIMIZE: Put detail near reachable roots. Simplify high or distant branches.
DO NOT: Add Source Water, crystals, rocks, particles, an environment shell, or baked light flow.
```

### 04 — `finance_package.glb`

References: finance package concept and player hand scale.

```text
OUTPUT: /assets/core/finance_package.glb
PURPOSE: Central object to hold, carry, give, and receive.
VISUAL: Small rectangular travel parcel or wooden package, simple straps, subtle circular front symbol. Ordinary at first, slightly mysterious.
GEOMETRY/NODES, EXACT: packageBody, straps, symbol, lockPoint, chainAnchor. Add packageGrip if possible. Keep symbol on a controllable emissive slot. Place anchors where hand and chain can attach cleanly.
SCALE/PIVOT/COLLISION: About 0.35–0.5 m wide. Center pivot. Game uses a box collider.
ANIMATIONS: None. Character clips move it.
BABYLON STATES: neutral, reacting, glowing, transformed via material and emissive values.
OPTIMIZE: Broad readable straps; texture for small marks.
DO NOT: Add a chain, particle effect, floor, fixed hand, or baked glow.
```

### 05 — `attachment_beetle.glb`

References: Attachment beetle and transformed-wing concepts.

```text
OUTPUT: /assets/creatures/attachment_beetle.glb
PURPOSE: Attachment creature that consumes loose objects and changes into a calm winged form.
VISUAL: Rounded dark blue-black shell, warm amber lines under segments, expressive silhouette. Initial form is small and calm. Attachment form appears larger and frantic. Later the shell opens and translucent luminous wings appear. Keep it approachable.
GEOMETRY/NODES, EXACT: body, head, leftWingShell, rightWingShell, leftInnerWing, rightInnerWing, legs, antennae, glowingCore. Give moving parts useful pivots. Inner wings may start hidden.
SCALE/PIVOT/COLLISION: Initial length about 0.9–1.2 m; game can scale it. Body-center pivot near ground. Simple game capsule or box collider.
ANIMATIONS, EXACT: Idle, Crawl, Consume, ConsumeFast, Agitated, Stop, OpenShell, OpenWings, Transform, CalmIdle, Fly. Loop suitable idle, crawl, and fly clips.
BABYLON STATES: Small calm, larger frantic, shell open, wings visible, core glowing, calm flight. Game spawns collected props.
OPTIMIZE: Use broad segments, few materials, simple wing shape.
DO NOT: Fix food or attracted objects to the mesh. Do not make a horror creature or bake aura particles.
```

### 06 — `merchant.glb`

References: merchant and market concepts.

```text
OUTPUT: /assets/characters/merchant.glb
PURPOSE: Food seller for the Give/Receive micro-story.
VISUAL: Friendly middle-aged merchant, warm face, short beard, practical clothes, apron, head covering. Strong shape without cartoon exaggeration.
GEOMETRY/NODES: Humanoid rig; merchantBody, apron, headCover, leftHandGrip, rightHandGrip. Hands must lift a loose item, accept help, offer a gift, and pass goods. Goods remain separate game props.
SCALE/PIVOT/COLLISION: Human scale; pivot between feet; simple game capsule.
ANIMATIONS, EXACT: Idle, TalkGesture, Work, Lift, Carry, StruggleWithObject, ReceiveHelp, OfferGift, Give, Thank, HelpOtherNPC, Walk. Align giving and receiving poses with player grips.
BABYLON STATES: Work, struggle, receive help, offer gift, thank, help another citizen. Game attaches objects and times actions.
OPTIMIZE: Put face and cloth detail in textures. Share city cloth palette.
DO NOT: Attach permanent fruit, a gift, the stall, or dialogue text.
```

### 07 — `market_stall_A.glb`

References: first market food stall and city palette.

```text
OUTPUT: /assets/market/market_stall_A.glb
PURPOSE: Merchant location and first reusable food stall.
VISUAL: Simple wood frame, colorful fabric canopy, clear food display area, warm fantasy palette.
GEOMETRY/NODES, EXACT: frame, canopy, counter, shelves. Keep canopy material easy to recolor. Leave room for runtime goods on counter and ground.
SCALE/PIVOT/COLLISION: About 2.5–3.5 m wide; pivot at ground center. Counter is reachable by player and merchant. Game uses simple box colliders.
ANIMATIONS: None. Optional fabric motion is runtime work.
BABYLON STATES: Recolored or restocked using materials and separate props.
OPTIMIZE: Broad wood pieces and small cloth texture.
DO NOT: Attach products, merchant, fallen items, baked text, or scene ground.
```

### 08 — `inner_platform_kit.glb`

References: Inner World floating platform concepts.

```text
OUTPUT: /assets/inner_world/inner_platform_kit.glb
PURPOSE: Reusable walkable floating platforms.
VISUAL: Soft irregular stone shapes with some moss on top. Undersides taper into floating rock.
GEOMETRY/NODES, EXACT: platform_small, platform_medium, platform_large, platform_long, platform_round, platform_bridge. Each piece is independent with a pivot at its walkable top center. Share stone and moss materials.
SCALE/PIVOT/COLLISION: Useful player-scale sizes, such as 2 m, 4 m, and 7 m widths. Keep tops clear for simple game colliders. Record top height from each pivot.
ANIMATIONS: None. Game may move whole platforms.
BABYLON STATES: Placed, visible, and optionally moving at runtime.
OPTIMIZE: Simple tops and low-detail undersides. Reuse pieces.
DO NOT: Add crystals, waterfalls, water, particles, or a full level layout.
```

### 09 — `citizen_female.glb`

References: city resident concepts and clothing palette.

```text
OUTPUT: /assets/characters/citizen_female.glb
PURPOSE: Reusable female-base city resident for several non-player characters (NPCs).
VISUAL: Friendly neutral citizen, simple timeless clothes, no ornate gear. Support clothing and material color variants.
GEOMETRY/NODES: Humanoid rig; citizenBody, clothingPrimary, clothingSecondary, hair, leftHandGrip, rightHandGrip. Recolor clothes without recoloring skin or hair.
SCALE/PIVOT/COLLISION: Human scale, ground pivot between feet, simple game capsule.
ANIMATIONS, EXACT: Idle, Walk, Talk, Sit, Receive, Give, Carry, LookAround. Keep walk in place. Hands hold a small market prop.
BABYLON STATES: Color variants, idle, talk, trade, carry, sit.
OPTIMIZE: One reusable rig and small material set. Put trim in textures.
DO NOT: Add large unique accessories, fixed goods, dialogue text, or background.
```

### 10 — `citizen_male.glb`

References: city resident concepts and clothing palette.

```text
OUTPUT: /assets/characters/citizen_male.glb
PURPOSE: Reusable male-base city resident for several non-player characters (NPCs).
VISUAL: Friendly neutral citizen with a distinct base shape and simple timeless clothes. Support easy material and outfit color variants.
GEOMETRY/NODES: Humanoid rig; citizenBody, clothingPrimary, clothingSecondary, hair, leftHandGrip, rightHandGrip. Recolor clothes independently of skin and hair.
SCALE/PIVOT/COLLISION: Human scale, ground pivot between feet, simple game capsule.
ANIMATIONS, EXACT: Idle, Walk, Talk, Sit, Receive, Give, Carry, LookAround. Keep travel in place and loops clean. Hands hold a small market prop.
BABYLON STATES: Color variants, idle, talk, trade, carry, sit.
OPTIMIZE: Share rig conventions and, if possible, clip timing with citizen_female.
DO NOT: Add ornate gear, fixed goods, dialogue text, or background.
```

### 11 — `fear_child.glb`

References: fear child concept and Inner World palette.

```text
OUTPUT: /assets/characters/fear_child.glb
PURPOSE: Symbolic child whose pose changes from fear to hope.
VISUAL: Small child, off-white clothes, bare feet, soft face, short dark hair. Initial body language is closed and small. Later it is upright, open, calm, and hopeful.
GEOMETRY/NODES: Child humanoid rig; childBody, clothing, hair, leftHandGrip, rightHandGrip. Materials can warm or brighten without a new mesh.
SCALE/PIVOT/COLLISION: Child scale beside player. Pivot between feet in standing pose. Simple game collider works when seated.
ANIMATIONS, EXACT: CurledUp, CryIdle, LookUp, Sit, ReachHand, StandUp, Walk, HopefulIdle. Loop CryIdle and HopefulIdle. Make StandUp flow from a closed pose.
BABYLON STATES: Closed fear, cautious response, open hope. Game controls light and materials.
OPTIMIZE: Preserve face and hands; simple clothes.
DO NOT: Make the child supernatural, horrific, or a separate transformed mesh.
```

### 12 — `dark_district_npc.glb`

References: dark district resident and district concepts.

```text
OUTPUT: /assets/characters/dark_district_npc.glb
PURPOSE: Human resident whose actions the player first misreads.
VISUAL: Long simple dark clothes with hood or layered cloth. Face partly visible. Strong shape. Scene light and posture may seem tense, but later action must read as protective and human.
GEOMETRY/NODES: Humanoid rig; npcBody, hood, outerCloth, face, leftHandGrip, rightHandGrip. Keep enough face visible for a calm scene.
SCALE/PIVOT/COLLISION: Human scale, ground pivot, simple game capsule.
ANIMATIONS, EXACT: Idle, Walk, Approach, DefensiveGesture, PushGesture, FearReaction, ProtectSomeone, Relax, Talk. PushGesture must read clearly without violent contact.
BABYLON STATES: Tense approach, defense, protection, relaxed talk. Game supplies scene context.
OPTIMIZE: Use cloth shape and color instead of dense folds.
DO NOT: Make a monster, an evil caricature, or a fixed hostile face.
```

### 13 — `exchange_guide.glb`

References: Exchange House guide concept, if supplied.

```text
OUTPUT: /assets/characters/exchange_guide.glb
PURPOSE: Older guide who receives and returns the finance package.
VISUAL: Timeless simple robes, warm restrained face, neutral colors, subtle gold detail. Wise without a wizard look.
GEOMETRY/NODES: Humanoid rig; guideBody, robe, goldDetails, leftHandGrip, rightHandGrip. Grips must work with finance_package.
SCALE/PIVOT/COLLISION: Human scale, ground pivot, simple game capsule.
ANIMATIONS, EXACT: Idle, Welcome, Point, ReceivePackage, ReturnPackage, OpenHands, Walk. Match receipt and return poses to player Give/Receive.
BABYLON STATES: Welcome, receive, return, open hands, walk. Game attaches package to the correct hand.
OPTIMIZE: Put fine gold marks in a small material area.
DO NOT: Add a staff, fixed package, spell effect, or scene floor.
```

### 14 — `exchange_house.glb`

References: Exchange House concept and city architecture palette.

```text
OUTPUT: /assets/city/exchange_house.glb
PURPOSE: Distant city landmark with a visible delivery hall.
VISUAL: Two complementary sides meet at one central building. One is a little warm and bright; the other is a little cool and dark. Large central entrance. A small hall is visible through it. Keep the whole building harmonious.
GEOMETRY/NODES, EXACT: foundation, leftWing, rightWing, centralHall, entranceArch, doors, roof, windows, decorativeDetails. Keep doors separate. Make only the visible hall depth.
SCALE/PIVOT/COLLISION: Doorway fits player and package. Pivot at ground center. Game uses simple wall and threshold colliders.
ANIMATIONS: None required. Game may rotate doors.
BABYLON STATES: Open or shut doors; side color or light levels may change at runtime.
OPTIMIZE: Strong distant outline. Skip tiny ornaments and unseen rooms.
DO NOT: Add a giant literal Yin-Yang sign, full city square, baked light, or characters.
```

### 15 — `market_stall_B.glb`

References: market concept and stall A palette.

```text
OUTPUT: /assets/market/market_stall_B.glb
PURPOSE: Second market shape for reuse.
VISUAL: Slightly larger than stall A. Asymmetric canopy, side table, hanging fabric. Match its wood and cloth language.
GEOMETRY/NODES: frame, canopy, counter, shelves, sideTable, hangingFabric. Keep cloth separate for recolor. Leave space for loose goods.
SCALE/PIVOT/COLLISION: About 3–4 m wide. Ground-center pivot. Game uses simple colliders. Keep trade path open.
ANIMATIONS: None required. Game may move fabric lightly.
BABYLON STATES: Recolored and stocked through materials and separate props.
OPTIMIZE: Reuse stall A material palette and textures where possible.
DO NOT: Attach goods, a merchant, or a ground plane.
```

### 16 — `market_props.glb`

References: market goods concepts and merchant/stall scale.

```text
OUTPUT: /assets/market/market_props.glb
PURPOSE: Loose goods for display, help, giving, receiving, and beetle attraction.
VISUAL: Warm simple fantasy market goods with clear rounded shapes.
GEOMETRY/NODES, EXACT: wooden_crate, fruit_crate, small_basket, large_basket, apple, orange, bread, ceramic_jug, cloth_roll, small_table, wooden_barrel, wooden_box, fallen_sign. Every item is a separate reusable node with its own render mesh and useful pivot. Add grip nodes to large items if useful.
SCALE/PIVOT/COLLISION: Hand and stall scale. Pivot at each item's center or base; record which. Game makes simple boxes or spheres. fallen_sign must rotate and lie cleanly.
ANIMATIONS: None. Game moves each prop.
BABYLON STATES: Displayed, fallen, carried, given, received, drawn toward beetle. Use instancing for repeats.
OPTIMIZE: Small goods get very low triangle counts and shared materials.
DO NOT: Merge all goods into one fixed stall display or attach them to the beetle.
```

### 17 — `city_building_kit.glb`

References: Mediterranean-European fantasy city concepts.

```text
OUTPUT: /assets/city/city_building_kit.glb
PURPOSE: Modular pieces for many city blocks.
VISUAL: Warm plaster, stone bases, simple tiled roofs, painterly fantasy look.
GEOMETRY/NODES, EXACT: small_house, medium_house, corner_house, tower, wall_section, window_module, door_module, roof_small, roof_medium, balcony, archway, stairs. Each is independently placeable with its own base or snap pivot. Share a small plaster, stone, wood, and roof material set.
SCALE/PIVOT/COLLISION: Player-scale doors and stairs. Ground pivot on complete houses. Edge or base pivot on modules. Game builds simple wall and stair colliders.
ANIMATIONS: None.
BABYLON STATES: Reused, recolored, placed, and hidden by distance.
OPTIMIZE: Repeat modules. Give doorways visible depth but no full interior.
DO NOT: Bake a whole city, furnish interiors, or model tiny roof tiles.
```

### 18 — `city_infrastructure.glb`

References: gate, wall, bridge, and city square concepts.

```text
OUTPUT: /assets/city/city_infrastructure.glb
PURPOSE: Reusable public structures and route pieces.
VISUAL: Match city_building_kit plaster, stone, wood, metal, and banner palette.
GEOMETRY/NODES, EXACT: city_gate, wall_straight, wall_corner, small_bridge, stone_stairs, stone_arch, street_lamp, bench, wooden_fence, banner_pole, fountain_base. Each is separately placeable. Use base or snap pivots. fountain_base is structure only.
SCALE/PIVOT/COLLISION: Gate and bridge pass a walking player. Stairs allow a simple ramp collider. Record module widths for connection.
ANIMATIONS: None.
BABYLON STATES: Placement, lamp light, banner color, and fountain water are runtime work.
OPTIMIZE: Shared city materials; walls and fences suit instancing.
DO NOT: Add fountain water, full city layout, particles, or baked night light.
```

### 19 — `inner_rock_kit.glb`

References: Inner World cavern and rock concepts.

```text
OUTPUT: /assets/inner_world/inner_rock_kit.glb
PURPOSE: Repeated cavern rocks, cliff, and arch.
VISUAL: Broad irregular painterly stone facets. Match platform stone but vary silhouette.
GEOMETRY/NODES, EXACT: rock_small_A, rock_small_B, rock_medium_A, rock_medium_B, rock_large, rock_arch, stalagmite, cliff_wall. Each is separate with a base pivot and shared stone materials.
SCALE/PIVOT/COLLISION: Several player-scale sizes. Keep arch walk-through open. Game adds simple nearby colliders.
ANIMATIONS: None.
BABYLON STATES: Placed, rotated, scaled, and hidden by distance.
OPTIMIZE: Use instancing and simple distant faces.
DO NOT: Add crystals, Source Water, platforms, or particles.
```

### 20 — `inner_crystal_kit.glb`

References: Inner World crystal and light concepts.

```text
OUTPUT: /assets/inner_world/inner_crystal_kit.glb
PURPOSE: Repeated crystals with game-controlled light response.
VISUAL: Simple faceted mystical crystals that read on a phone screen.
GEOMETRY/NODES, EXACT: crystal_small, crystal_medium, crystal_cluster, crystal_tall. Each is separately placeable. Expose base color, emissive color, and emissive intensity through named material slots; report actual names.
SCALE/PIVOT/COLLISION: From hand height to tall landmarks. Base pivot on each. Game collides only with large pieces.
ANIMATIONS: None; game animates material values.
BABYLON STATES: Dim, active, calm light and color.
OPTIMIZE: Few facets and materials; instance repeats.
DO NOT: Bake glow into textures, add a light per crystal, or add particles.
```

### 21 — `vegetation_kit.glb`

References: city and Inner World plant concepts.

```text
OUTPUT: /assets/world/vegetation_kit.glb
PURPOSE: Cheap plants for repeated placement.
VISUAL: Stylized grass, flowers, ferns, bushes, vines, and mushrooms in the warm painterly style.
GEOMETRY/NODES, EXACT: grass_clump, flower_small, flower_cluster, fern, bush_small, bush_medium, vine_segment, mushroom_small, mushroom_cluster. Each is independent with a base pivot. Give vine_segment a clear repeat direction.
SCALE/PIVOT/COLLISION: Player-scale vegetation. Small plants have no game collision. Large bushes can use simple blockers.
ANIMATIONS: None; game makes wind.
BABYLON STATES: Wind, color, growth, and extra plants on the Attachment side.
OPTIMIZE: Very low geometry. Use alpha cards only when overdraw stays small. Suit thin instancing.
DO NOT: Build a fixed garden or bake wind and glow.
```

### 22 — `package_chain.glb`

References: chain concept if supplied; match package metal and anchor scale.

```text
OUTPUT: /assets/core/package_chain.glb
PURPOSE: Reusable links between package, player, and Inner World roots.
VISUAL: Broad rounded stylized metal links that read at game distance. No heavy industrial look.
GEOMETRY/NODES: One reusable chain_link. Optional short chain_preview. Add linkStart and linkEnd transforms so Babylon.js can repeat links on a curve and join finance_package.chainAnchor.
SCALE/PIVOT/COLLISION: Pivot at chain link center. Align repeated length on +Z. Record link length in meters. Game uses one broad interaction zone rather than per-link collision.
ANIMATIONS: None; game places and moves the links.
BABYLON STATES: Visible, taut, loose, released, joined to roots.
OPTIMIZE: One low-detail link for instancing. Hide or omit preview during game use.
DO NOT: Export a fixed 10 m chain, attach package, or include roots.
```

### Runtime systems: no separate GLB jobs

Do not send these to the 3D API as new models.

| System | Babylon.js or cheap background method |
|---|---|
| Thought Waves, including `I'm afraid...` and `I want more...` | Ribbon or trail, shader/material, and live text |
| Source Water | Simple plane or mesh, animated normal map, shader |
| Fog | Scene fog or low-cost depth effect |
| Aura | Shader or limited particles |
| Transformation Light | Particles, emissive materials, glow layer |
| Wind | Plant shader or node movement, limited particles |
| Root-light flow | Animated emissive mask or shader on inner tree roots |
| Objects drawn to beetle | Instances of separate `market_props` meshes |
| Sky, distant mountains, distant skyline | Sky image, background planes, or very cheap distant geometry |

## 7. Generation order and story fit

**Vertical Slice Asset Pack, first eight:** `player.glb` → `central_tree_outer.glb` → `central_tree_inner.glb` → `finance_package.glb` → `attachment_beetle.glb` → `merchant.glb` → `market_stall_A.glb` → `inner_platform_kit.glb`. Check them in one small Babylon.js scene before the next group.

**Remaining 14:** `citizen_female.glb` → `citizen_male.glb` → `fear_child.glb` → `dark_district_npc.glb` → `exchange_guide.glb` → `exchange_house.glb` → `market_stall_B.glb` → `market_props.glb` → `city_building_kit.glb` → `city_infrastructure.glb` → `inner_rock_kit.glb` → `inner_crystal_kit.glb` → `vegetation_kit.glb` → `package_chain.glb`.

The first game route is package → city gate → Central Tree → Inner World and Source Water → return → market → Attachment event → beetle. Later scenes use Fear, Give/Receive, transformation, and Exchange.

**Give/Receive micro-story:** A loose market object falls or resists movement. The merchant plays `StruggleWithObject`. The player plays `Interact` or `PickUp`, then `Give`. The merchant plays `ReceiveHelp`, `Thank`, `OfferGift`, and `Give`. The player plays `Receive`. Later, the merchant can play `HelpOtherNPC`. Babylon.js owns the loose object, gift, hand attachments, event timing, and story state. No character GLB may include a permanent object in its hands. The player and merchant grips must align in a shared test scene.

## 8. Quality-control checklist after each generation

Record evidence before `status` becomes `approved`.

1. Open the downloaded candidate in a glTF viewer and a Babylon.js test scene. After approval and placement, reload it from its final `/assets/` path. Check load and console errors both times.
2. Check Y-up, +Z front where needed, meter scale beside the player, applied transforms, pivot, and anchors.
3. Compare front, side, back, and phone-size silhouette with the real reference image. Record image paths and visual differences.
4. Check textures, UVs, normals, alpha edges, PBR light response, and absence of unwanted floor, background, camera, or baked light.
5. Enumerate required nodes. Check names, unique parts, placement pivots, and independent control.
6. Enumerate exact animation groups. Play all clips. Check loops, in-place travel, hand grips, beetle shell and wing motion, and clean pose changes.
7. Record triangle count, material count, texture sizes, GLB size, and LOD status. Compare with section 4 review targets and inspect on a mobile-sized screen.
8. Test game collision: player passes doors and bridges, stands on platform tops, and reaches market goods.
9. Test game controls: outer tree sides, inner roots, package symbol, beetle parts, crystal emissive slots, kit pieces, and chain repetition.
10. Save a screenshot and a short validation report. An API success response alone does not prove asset quality.

## 9. Retry and refinement rules

Keep each bad artifact and its report. Name the failed check. Change only the failed part of the prompt or reference choice. Try one targeted regeneration. Then try one repair in a 3D editor or one further regeneration. Compare results. Reject missing required nodes, clips, readable shape, useful pivot, correct scale, or mobile suitability. If the API cannot create a required rig or modular part, set `blocked` and report the exact issue. Never call a static pose an animation. Never silently replace the GLB with a code-made object. Stop at a blocked P0 job because later style and scale may depend on it. For P1 or P2, continue only when the blocked job has no later dependency; keep the block visible in the report.

## 10. One-job-at-a-time automation

1. Find the real game project, `/assets/` directory, concept images, and configured 3D API. Test the connection. Keep API keys out of logs and the manifest.
2. Build one manifest entry per index row. Copy the full asset-specific prompt and exact required names. Resolve `referenceImages` to real file paths. Default `allowTextOnly` to `false` for P0 jobs.
3. Select the first `pending` job. Send the section 3 global prompt, then that job's section 6 prompt, with only its matching images.
4. Store the provider job ID. Wait and poll at the provider's safe interval. Never submit all 22 at once. Enforce a user-set API cost or credit cap. If no cap exists, report the likely paid batch cost before running it.
5. Download the GLB to a temporary work path. Check type and size. Keep the old approved asset until a replacement passes validation.
6. Run section 8 on the candidate. Save counts, screenshots, provider ID, final path, and findings in a report. Copy the passed GLB to its exact `/assets/` path. Reload it from there. Set `approved` only after that final load passes. Start the next job.
7. On failure, use section 9. Update attempts and status. Stop and report only a blocking error. Do not claim unverified visual or animation quality.

## 11. Proposed `asset-generation-manifest.json` schema

Create this file in the real game project. The object below is a **valid example shape**, not proof that a reference image exists. Build all 22 entries from sections 2 and 6. Put the full asset-specific block in `prompt`. The runner prepends the global block once.

```json
{
  "schemaVersion": 1,
  "assetRoot": "/assets",
  "globalPromptSource": "3D_ASSET_GENERATION_MASTER.md, section 3",
  "jobs": [
    {
      "id": "01",
      "filename": "player.glb",
      "category": "character",
      "priority": "P0",
      "prompt": "Copy the complete asset-specific prompt for job 01 from section 6 here.",
      "referenceImages": [],
      "allowTextOnly": false,
      "outputFolder": "/assets/characters",
      "animated": true,
      "requiredAnimations": ["Idle", "Walk", "Run", "WalkBack", "StrafeLeft", "StrafeRight", "Interact", "PickUp", "CarryIdle", "CarryWalk", "Give", "Receive", "Sit", "LookAround", "FearReaction", "Breathe", "FlyIdle", "FlyForward", "Land"],
      "requiredNodes": ["playerBody", "hair", "tunic", "trousers", "boots", "backpack", "backpackSymbol", "leftHandGrip", "rightHandGrip"],
      "status": "pending",
      "attempts": 0,
      "providerJobId": null,
      "finalPath": null,
      "validationReport": null,
      "notes": []
    }
  ]
}
```

Allowed status values: `pending`, `needs_reference`, `submitted`, `generating`, `downloaded`, `validating`, `retry`, `approved`, `blocked`. Use IDs `01` through `22`. Match `filename` and `outputFolder` to section 2. Use `requiredAnimations: []` for static assets. Set `animated` to `true` only when clips are required. Preserve exact case in node and clip names. Store local reference paths, not base64 data. Never store an API key. An approved job needs its final path, actual geometry and texture counts, visual-check evidence, and a validation report.

## 12. Copy-paste prompt for the 3D automation agent

```text
Read 3D_ASSET_GENERATION_MASTER.md in full. Use it as the asset contract for this Babylon.js browser and mobile game. Find the real project, supplied concept images, and configured 3D generation API. Build asset-generation-manifest.json with all 22 jobs, full asset-specific prompts, exact paths, nodes, and clips. Prepend the document's global prompt to each request. Process jobs 01 through 22 one at a time. Attach only real matching references. Wait for each API job. Download its GLB. Validate file load, scale, pivots, materials, nodes, clips, reference match, and mobile cost in a viewer and Babylon.js. Save approved files in the exact /assets paths. Update the manifest and validation report. Apply the retry rules. Keep secrets out of logs. Do not invent missing images, claim unverified success, skip required clips, or create extra GLB jobs for runtime effects. Make routine choices yourself. Stop and report only a blocking error, with the job ID, evidence, and exact missing input or failed requirement.
```
