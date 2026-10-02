# WORLD BUILDING AND DETAIL SPEC

- File: `WORLD_BUILDING_AND_DETAIL_SPEC.md`.
- Owner: Alexander.
- Date: 2026-10-02.
- Milestone: **Vertical Slice v0.2 – World & Art Integration**.
- Status: Binding world and art extension.
- Main rule: Keep the working game. Build a compact, full, living world around it.
- This file adds rules to `GAME_MASTER_SPEC.md`.
- This file does not replace either master file.

## 1. Purpose, sources, priority, and scope

### 1.1 What this file controls

- Build the shape and scale of the city.
- Place buildings, paths, props, plants, and people.
- Add depth, light, sound, and small motion.
- Hide game limits within a believable world.
- Keep important objects and actions clear.
- Keep the game fast on a phone.
- Produce review images and a measured report.

### 1.2 Read order and rule ownership

| Source | Owns | Use in v0.2 |
|---|---|---|
| `GAME_MASTER_SPEC.md` | Game rules, events, reflection, controls, camera, save, and scope | Keep these rules. Do not rewrite the game. |
| `docs/3D_ASSET_GENERATION_MASTER.md` | The 22 model jobs, file names, model parts, clips, and asset style | Use its real file and part names through registry maps. |
| `WORLD_BUILDING_AND_DETAIL_SPEC.md` | World shape, detail, art placement, mood, depth, and visual review | Use this file for the v0.2 world pass. |
| Project `AGENTS.md` | Work rules, file ownership, imports, and required checks | Follow the active project rules. |
| `DEVELOPMENT_DECISIONS.md` and current code | Existing implementation choices | Inspect these before changing the world. |
| Concept images in the game project | Shape, style, and color reference | Compare actual subjects before claiming a match. |

- The asset master is under `docs/` in the inspected project.
- If another checkout has it at the root, read that actual file.
- The game master keeps authority over story meaning and play behavior.
- The asset master keeps authority over exported asset names.
- Map different names from the older game asset prompts in the registry.
- Do not rename working model parts to satisfy an older prompt.
- This extension replaces vague world-placement advice for v0.2.
- It does not relax the master performance limits.
- Keep a stricter active limit if two sources differ.
- Record a conflict and the chosen mapping in `DEVELOPMENT_DECISIONS.md`.
- Ask only when a conflict cannot be resolved without changing game meaning or authorized scope.

### 1.3 Evidence used for this extension

- The earlier chat defines the compact city and the missing detail layers.
- Its three images show large empty ground areas and visible arena walls.
- They also show isolated stalls and an unclear tree shape.
- The current files were inspected in `D:\MyDrive\ALEXANDER\PROJEKTE\KarmaGame_v05`.
- Current code already adds real building kits, plants, banners, light, and backdrops.
- Those additions are later than the referenced test images.
- Keep useful existing art work.
- Judge the current running build before changing it.
- The current inner walk area has a radius of about 11 m.
- The current outer square has a radius of 15 m.
- The current market has three stalls.
- These are starting facts from code, not proof of the current screen result.
- No live game or phone test was run to write this document.

### 1.4 Scope lock

- Preserve free three-dimensional movement.
- Preserve the current camera and input rules.
- Preserve the event-and-condition world state.
- Preserve reflection words, local storage, Skip, and deletion.
- Preserve the working path through the attached beetle.
- Do not add the full Fear story.
- Do not add the Exchange ending.
- Do not add new dialogue systems or online text services.
- Do not add combat, scores, rewards, or a new quest chain.
- Do not add flight in this pass.
- Prepare world shapes for future flight only.
- Keep any later system already present in the chosen checkout.
- Report that scope difference before review.
- Do not remove existing work to force an older baseline.

### 1.5 Terms used below

| Term | Plain meaning |
|---|---|
| Hero object | The main object in a view. |
| Composition | The planned arrangement of the view. |
| Dressing | Objects that make a place look used. |
| Landmark | A large shape that helps the player find a place. |
| Foreground / midground / background | Near / middle / far layers in a view. |
| Collider | An invisible shape that stops movement. |
| GLB [binary glTF model file] | A file that holds a three-dimensional model. |
| NPC [non-player character] | A person controlled by the game. |
| MVP [minimum viable product] | The first useful complete version. |
| LOD [level of detail] | A simpler model used at greater distance. |
| Instance | A repeated copy that shares model data. |
| Thin instance | A cheap repeated copy with little separate object data. |
| Impostor | A flat image that stands in for a far object. |
| Decal | A small surface image used for wear or marks. |
| Shader | A program that sets how a surface looks. |
| VFX [visual effects] | Light, particles, or other added visual motion. |
| FPS [frames per second] | The number of screen images drawn each second. |
| Draw call | One request to draw a group of shapes. |
| Alpha overdraw | Repeated drawing through partly clear surfaces. |
| UI [user interface] | Buttons, labels, and other screen controls. |
| UV [texture coordinates] | Values that place an image on a surface. |
| GPU [graphics processing unit] | The part of the device that draws the game. |

## 2. Five binding detail levels

| Level | Agent must build | Placement rule | Proof of completion |
|---|---|---|---|
| 1. Macro Layout | City outline, zone links, tree hub, gate approach, inner mirror anchors | Keep short routes and the same game links. | A scale map shows every route and anchor. |
| 2. Architectural Composition | House groups, roofs, alleys, arches, walls, stairs, courts | Frame paths and landmarks with varied groups. | Each zone has a clear shape in a plain light view. |
| 3. Gameplay Dressing | Package setting, tree approach, merchant work area, desire display, reflection area | Clear space surrounds each action. | The full play path works without debug changes. |
| 4. Environmental / Set Dressing | Benches, goods, tools, planters, fences, signs, cloth | Place useful groups beside occupied places. | Each group has a named use or small story. |
| 5. Micro Detail & Atmosphere | Wear, small plants, wind, particles, sound, haze, light variation | Add selective detail near views and paths. | A short idle view has depth and restrained life. |

- Build the levels in this order for each zone.
- Check movement after levels 1 and 2.
- Check action visibility after level 3.
- Add level 4 only where the place has a clear use.
- Add level 5 after the larger shapes work.
- Recheck the same camera views after each level.
- Micro detail must not hide a poor layout.
- Every hero view must show all five levels.
- Far scenery may use fewer physical details.
- Keep the same visual hierarchy in low quality mode.

## 3. Compact city layout and route dimensions

### 3.1 Plan shape

- Use an uneven, roughly circular city.
- Aim for a playable city body about 70–90 m across.
- Use about 75 m as the first layout target.
- Keep the outside arrival path separate from that diameter.
- Aim for a total north-to-south route extent near 95–115 m.
- Keep most buildings at the path edges.
- Use roofs behind the first building row to imply more streets.
- Do not build every implied street as playable space.
- Keep the existing zone names and game links.
- Treat the listed zone order as a wayfinding order.
- Keep free choice after the gate where current rules allow it.

```text
                         EXCHANGE HOUSE
                          approach court
                               |
           quiet side lane ----+---- roof layer
                    \          |
       DARK DISTRICT ---- CENTRAL TREE ---- JOY MARKET
          arches           small square       stalls
             \             /       \          /
              courts ----/         service pocket
                              |
                          CITY GATE
                              |
                      START / ARRIVAL PATH
```

### 3.2 Practical dimensions

| Element | First target | Allowed tuning | Required result |
|---|---:|---:|---|
| Start to gate walking route | 18–24 m | 15–28 m | Short arrival with one framed gate reveal. |
| Gate to tree approach | 20–26 m | 18–30 m | Tree crown guides the player from the gate. |
| Tree to market action | 22–28 m | 18–32 m | About 8–12 seconds at normal walking speed. |
| Tree to Dark District entry | 18–24 m | 16–28 m | A clear arch or bend marks the change. |
| Tree to Exchange entrance | 26–34 m | 24–38 m | The entrance appears beyond a short approach. |
| Main streets | 3–5 m clear | Widen only at an active pocket | Two people can pass without camera lock. |
| Side alleys | 1–2 m clear | Prefer 1.5–2 m for playable routes | A short camera check must pass. |
| Market main passage | 2.8–3.5 m clear | Up to 4 m at a trading pocket | No crowd blocks the desire interaction. |
| Market secondary passage | 1.5–2 m clear | Avoid long narrow routes | It gives a side view and a return path. |
| Small courts | 4–8 m across | Shape may be irregular | A bench, work group, or view gives them use. |
| Building front setback | 0–1.2 m | A doorway pocket may reach 2 m | Doors and walls frame the path. |
| Normal buildings | 5–9 m wide; 6–11 m high | Use kit sizes as measured | Small groups have different roof heights. |
| Ground level changes | 0.25–1.2 m per pocket | Up to 2 m across a zone | Use ramps behind visible steps. |
| Visual stair rise | 0.12–0.18 m | Stay below the controller limit | No required climb needs a jump. |

- Width means free space after props and people are placed.
- The player radius is 0.32 m in the game master.
- A 1 m alley is a short side pocket unless the camera test proves it usable.
- Keep a main route at least 3 m wide through the hub.
- Preserve the 2.8 m/s walk speed and 4.6 m/s run speed.
- Shorten distances before changing movement speed.
- A bare view wider than about 8–10 m needs a clear purpose.
- The tree space and the gate opening are valid open spaces.
- Empty yards with no path, view, or use are not valid open spaces.

### 3.3 Anchor plan and safe reshape

- Use meters.
- Keep Y as up.
- Keep +Z as north and +X as east.
- Keep the tree gameplay origin at `(0, 0)` in the horizontal plane.
- Use `src/content/places.ts` as the shared place source.
- Keep interaction, world visuals, and tests aligned with that source.
- Do not use the following numbers as a second hard-coded map.

| Anchor | Current inspected position `(X, Z)` | v0.2 first choice |
|---|---|---|
| Arrival spawn | `(0, -47)` | Keep unless the outside path needs a small shift. |
| Package / waystone | `(1.2, -43.5)` | Keep. Dress it as a real arrival point. |
| Gate | `(0, -26)` in the world builder | Keep a 4 m clear opening. |
| Tree gameplay root | `(0, 0)` | Keep this shared origin. |
| Look Within | `(0, -2.8)` | Keep clear and reachable. |
| Market desire / merchant | `(26, 0)` / `(27.5, 2)` | Keep first. Pull nearby stalls into a tighter group. |
| Dark District / resident | `(-24, 4)` / `(-27, 4)` | Use for visual layout only if story is not active. |
| Exchange door / building | `(0, 27)` / `(0, 36)` | Build the visual approach beyond the current north edge. |
| Inner arrival / return | `(0, -7)` / `(0, -3.4)` | Keep the known walk path. |
| Inner package / beetle | `(4, -2)` / `(7.5, -0.5)` | Keep the tested action relation. |

- Current outer ground and edge shapes stop near `Z=24`.
- The Exchange visual approach needs a north extension.
- Extend only the required ground, colliders, and art chunks.
- Keep the north route closed with a believable threshold if its story remains deferred.
- Do not open unfinished story through an art change.
- Current outer tree visuals sit about 2.2 m north of their entity.
- Measure the actual visible trunk before placing density rings.
- Apply the rings around that visible trunk.
- Keep the portal path aligned with its gameplay anchor.
- Change the offset only with collider and state-view checks.
- Update saved-position validation when world bounds change.
- Map an old invalid position to a nearby safe route anchor.
- Preserve all saved facts and reflection text.
- Do not require a new save to hide a layout problem.

## 4. World Composition rules

### 4.1 Buildings and roofs

- Place buildings in groups of 3–6.
- Give each group at least two silhouettes.
- Vary roof height by about 0.5–2 m within a group.
- Mix sloped roofs, a low roof, and occasional small towers.
- Keep the tree crown above most normal rooflines.
- Place the Exchange roof where its outline reads from the hub.
- Use yaw changes of about 2–8 degrees for selected houses.
- Use small changes in front position of about 0.2–0.8 m.
- Use scale changes near 0.9–1.1 only where doors still fit.
- Keep most house gaps near 0–0.6 m.
- Reserve selected gaps of 1–2 m for actual alleys.
- Do not rotate every house by the same amount.
- Do not make regular rows of equal brown boxes.
- Keep small variation within one coherent building style.
- Add doorway depth, one balcony, or a side roof to break a flat group.
- Build only visible interior depth.

### 4.2 Paths, reveals, and curiosity corners

- Put a small bend or frame on long routes.
- Aim for a new visual beat every 5–10 m.
- Avoid a dead straight view longer than about 20–25 m.
- Keep deliberate tree and Exchange views open.
- A reveal exposes a new landmark after a bend or arch.
- A conceal hides part of the next space to invite movement.
- Use one small curiosity corner per short zone route.
- A curiosity corner may show a planter, work bench, cloth, or water sound.
- Make a side pocket 2–4 m deep.
- Show its return path from the entry.
- Do not build hidden dead ends that look like required quest routes.
- Guide the route with a bright wall edge, roof opening, moving person, or prop face.
- Use signs as support.
- Keep the route readable with quest markers hidden.

### 4.3 Sightline protection

- Mark view corridors in layout data.
- Keep a 3–5 m ground corridor on main approaches.
- Keep an upper corridor for the tree crown and Exchange roof.
- Use a crown glimpse during travel where the full trunk is concealed.
- Reveal the full tree again at each main zone entrance.
- Check the gate, market, Dark District, and Exchange approach views.
- Check the camera at minimum and maximum follow distance.
- Keep large banners out of the portal view.
- Keep the package and desire display clear against their background.
- Use light and value contrast as well as color.

## 5. Density Rings

- Build rings as irregular sectors.
- Do not place objects in perfect circles.
- The hero space gives the main object room.
- The activity ring adds signs of people.
- The building ring gives the place an edge.
- The distant layer implies a larger world.
- Visible detail rises from the hero space to the occupied edge.
- Physical detail becomes cheaper again in the distant layer.
- A dense silhouette does not require dense geometry.

| Landmark | Hero Space | Activity Ring | Building Ring | Distant Layer |
|---|---|---|---|---|
| Central Tree | About 0–4 m from visible trunk; roots, portal, source only | About 4–10 m; benches, people, plants, stone edges | Building fronts about 11–15 m away; building bodies beyond | Roofs and towers beyond the first block |
| Gate | 4 m opening and 2–3 m clear approach on each side | Side cart, notice surface, two people | Gate wings and close houses | Tree crown and roofs beyond the opening |
| Merchant / desire display | Counter face plus 1.5–2 m action space | Shoppers, basket groups, side table | Stalls and house fronts frame a pocket 6–10 m across | Roofs, cloth, and tree crown |
| Exchange | Clear threshold and 3–4 m forecourt center | Paired benches, low planting, water edge | Two wings frame a court about 10–14 m across | Tree glimpse and calm roof skyline |
| Inner Source / package root | Clear 2–3 m action area | Roots, low crystals, nearby water | Rock and root frames about 8–20 m out | Cavern and platform silhouettes |

- Give every ring at least one clear gap for movement or a view.
- Keep activity out of the central action corridor.
- A hero ring must not look like a bare test disk.
- Use paving joints, low roots, or water edges for quiet surface detail.
- Do not fill the hero space with crates to meet a density count.

## 6. Hidden world limits and view layers

### 6.1 Binding boundary rule

- No final view may show the tall dark green arena walls.
- Keep required invisible edge colliders.
- Hide them behind a complete visual edge.
- Use a house back, natural wall, hedge, roof mass, or rock bank at the contact edge.
- A visible wall must look like city architecture.
- Break its top with roof shapes, plants, towers, and depth.
- Do not leave a uniform wall at one height around the world.
- Fog must support the disguise.
- Fog alone must not hide a nearby flat arena wall.
- An apparent exit must have a visible reason for closure.
- Do not let the player walk into an invisible plane across an open-looking road.

### 6.2 Mandatory layer stack

| Layer | Typical distance from the camera | Build method | Rules |
|---|---:|---|---|
| Playable foreground | 0–15 m | Real models and simple colliders | Clear paths and close surface detail. |
| Architectural midground | 15–50 m | Reused houses, roof pieces, walls, trees | Overlap silhouettes and hide the actual edge. |
| Distant city | 45–120 m | Low-detail roofs, towers, or impostors | No rooms, people rigs, or gameplay collision. |
| Landscape / mountains | 100–400 m or visual equivalent | Low-cost mesh bands or painted planes | Use two uneven height bands and haze. |
| Sky | Behind all other layers | Existing sky system | Blend horizon color with distant haze. |

- Distances are starting ranges, not mandatory load distances.
- Far layers may fit inside a smaller physical shell.
- Keep their apparent scale consistent as the camera moves.
- Check all allowed camera yaw and pitch angles.
- Check views from every boundary contact point.
- Check the lowest mobile detail setting.
- Keep a cheap background even when close detail is removed.
- Turn collider visualization on only in development.
- Recheck camera fading so it does not expose the old wall behind a house.

## 7. Outer World Zone Bible

- Each zone uses the same city style and sun direction.
- Zone differences come from space, shade, activity, materials, and sound.
- Blend changes over about 5–8 m near a zone join.
- Do not place a hard color seam across a road.
- Use the following people counts as local placement targets.
- They are not separate groups that must all animate at once.

### 7.1 Start Area / Arrival Path

| Field | Build rule |
|---|---|
| Emotional intent | Calm arrival and mild curiosity. The package has weight without shame. |
| Spatial layout | A gently curved path about 18–24 m from package point to gate. Add one small arrival pocket. |
| Building density | No full building row outside. Use one low shed or wall fragment plus city roofs beyond. |
| Street width | 3–4 m walking band. The package pocket adds 1–2 m at one side. |
| Landmark | Gate opening first. Tree crown appears above or through it. |
| Foreground | Package support stone, worn path edge, low grass, one basket or travel object. |
| Midground | Gate, low walls, one tree or bush group at the side. |
| Background | City roofs, tree crown, mountain haze, sky. |
| Prop vocabulary | Arrival stone, low bench, notice surface, cart wheel, small bundle. Use 2–3 groups. |
| Vegetation | Grass at path edges, two shrub groups, a few warm flowers. Keep package clear. |
| NPC density / behavior | 0–2 people. One distant arrival or gate worker loop is enough. |
| Motion | Grass, one cloth edge, birds far above the gate. |
| Light / color | Warm side light, soft blue shade, pale path, muted greens. |
| Sound | Soft wind, distant birds, faint city life behind the gate. |
| Micro detail | Foot wear on the path, pebbles at edges, grass in wall seams. |
| Sightlines | Gate is clear at package pickup. Crown glimpse survives the path bend. |
| Transition | Plants thin near the gate. Stone paving and voices grow toward the opening. |
| Gameplay readability | Package stands on a clear support. Preserve the gate's package condition. |
| Must not happen | A huge empty lawn, scattered random cargo, a hidden package, or a second required tutorial. |

### 7.2 City Gate

| Field | Build rule |
|---|---|
| Emotional intent | A welcoming threshold into a lived city. |
| Spatial layout | Two uneven gate wings frame a 4 m opening. Add a short passage with visible depth. |
| Building density | Houses sit close behind the wings. One side roof overlaps the passage view. |
| Street width | 4 m at the opening. 3–5 m on its city side. |
| Landmark | Gate arch near. Central Tree far. |
| Foreground | Stone base, hinge detail, one worn threshold, wall-foot plants. |
| Midground | Gate wings, one cart recess, close house corners. |
| Background | Tree crown, market roof edge, Exchange roof glimpse where possible. |
| Prop vocabulary | Notice board, lamp, cart, stacked supply crate, small banner. Use 2–4 side groups. |
| Vegetation | Ivy or a vine strip on one wing. Low plants at the base. |
| NPC density / behavior | 1–3 placed people. Keep the center open. Use greeting, looking, or work loops. |
| Motion | Banner edge, one walking silhouette, restrained lamp flame. |
| Light / color | Shade under the arch leads to a warmer view of the square. |
| Sound | Step echo under stone. City murmur rises beyond it. |
| Micro detail | Threshold wear, slight stone color changes, dust near unused corners. |
| Sightlines | Frame the crown from the passage center. Do not hang cloth across it. |
| Transition | Outside earth becomes city paving. Building fronts close in before the hub reveal. |
| Gameplay readability | Keep door state, trigger, and collider aligned. The open gate must have no remaining blocker. |
| Must not happen | A fortress prison mood, a long black tunnel, crowd blockage, or a visible rectangular arena. |

### 7.3 Central Square

| Field | Build rule |
|---|---|
| Emotional intent | Shared center, clear orientation, quiet life. |
| Spatial layout | A public space about 24–28 m across. Use an uneven oval with four route mouths. |
| Building density | About 8–12 frontage segments form groups. Leave route gaps and crown views. |
| Street width | Main route mouths 3–5 m. A continuous clear route crosses the activity ring. |
| Landmark | Central Tree is the first read. Source Water is the close second read. |
| Foreground | Low roots, worn paving, source edge, a selected plant group. |
| Midground | Benches, a pair talking, planters, small stone edges, door pockets. |
| Background | Houses, overlapping roofs, Exchange outline, far city and sky. |
| Prop vocabulary | 3–4 benches, 4–6 plant groups, 2–3 low stone groups, one small water feature. |
| Vegetation | The hero crown dominates. Use low flowers and shrubs around the activity edge. |
| NPC density / behavior | 4–6 placed people. Sit, talk, cross a short route, or watch water. |
| Motion | Tree leaves, source flow, two idle groups, one walker. |
| Light / color | Warm open sun, soft shadows, pale stone, lifted shade. |
| Sound | Water close to roots, light voices, birds above roofs. |
| Micro detail | Paving wear on desire lines, leaves at edges, moss beside source stone. |
| Sightlines | Gate, Market, Dark District, and Exchange approach each get a tree view. |
| Transition | Market adds cloth and voices. Dark route adds shade. Exchange adds order. |
| Gameplay readability | The portal approach stays clear. State changes remain visible from the square edge. |
| Must not happen | A huge empty circle, crates against the trunk, four identical house rows, or a competing giant fountain. |

### 7.4 Joy Market

| Field | Build rule |
|---|---|
| Emotional intent | Harmless pleasure, color, shared work, and welcome. Joy remains valid after Attachment. |
| Spatial layout | A market strip about 16–24 m long. Use 5–7 stalls in two uneven edges and one trading pocket. |
| Building density | Close house fronts support the stalls. Leave one short side court and one roof gap. |
| Street width | Main passage 2.8–3.5 m. Side passages 1.5–2 m. |
| Landmark | Merchant canopy and clear desire display. Tree crown anchors the return view. |
| Foreground | Fruit piles, baskets, cloth folds, ceramic jars, counter edge. |
| Midground | Buyers, sellers, varied canopies, side tables, wall planters. |
| Background | House roofs, banners above the route, crown glimpse, distant city. |
| Prop vocabulary | Goods, scales, jars, crates, baskets, cloth rolls, small tables, blank signs. |
| Vegetation | Pot plants at stall ends. A vine or shrub joins the market to its house edge. |
| NPC density / behavior | 6–9 placed people. Buy, sort, carry, talk, or wait at a counter. |
| Motion | 2–3 visible close people loops, one walker, canopy motion, small goods handling. |
| Light / color | Warm sun and shade under colorful cloth. Muted red, gold, teal, and cream. |
| Sound | Low crowd murmur, soft trade gestures, cloth, occasional crate contact. |
| Micro detail | Fruit leaf, pottery variation, worn counter, dirt under storage stacks. |
| Sightlines | The entry shows cloth first and the merchant next. The tree return route stays visible. |
| Transition | Two shared prop groups bridge the hub and market. Roofs overlap across the join. |
| Gameplay readability | Desire object has a quiet backing surface. Shoppers do not cover it or its action prompt. |
| Must not happen | A hostile market, moral color coding, a giant empty road, or a sudden evil-market swap. |

### 7.5 Dark District

| Field | Build rule |
|---|---|
| Emotional intent | Quiet, close, cool, and partly unknown. People remain human and dignified. |
| Spatial layout | A bent lane about 14–22 m long. Add one arch, one short stair or ramp, and one small court. |
| Building density | 5–8 close fronts. Use a higher wall beside a lower roof to vary the outline. |
| Street width | Main lane 2.5–3.5 m. Side pockets 1.5–2 m. |
| Landmark | A lit doorway or arch marks the inner pocket. Crown glimpse guides the way back. |
| Foreground | Cool stone, a repair tool, one stool, wall-foot damp marks. |
| Midground | Close plaster fronts, a resident, stair rail, shaded arch. |
| Background | Overlapping roof shapes, pale sky gap, a distant warm window. |
| Prop vocabulary | Water jar, folded cloth, wood stack, tools, quiet bench, small lamp. |
| Vegetation | About one third of market plant density. Use moss and one tended pot. |
| NPC density / behavior | 1–3 placed people. Repair, sit, carry a small bundle, or watch the lane. |
| Motion | One cloth line, faint water drip, one slow resident loop. |
| Light / color | Cool ambient shade with restrained warm door light. Keep faces and paving readable. |
| Sound | Soft footsteps, distant voices, mild drip, close cloth. Leave pauses between sounds. |
| Micro detail | Slight damp roughness, edge moss, wall cracks, doorstep wear. |
| Sightlines | Arch frames a human activity. A bend hides part of the next court without a threat. |
| Transition | Building shade increases gradually. Market warmth remains faintly audible near the join. |
| Gameplay readability | Keep resident silhouette and escape route clear. Fear effects never erase the walking surface. |
| Must not happen | Monsters, red threat light, horror music, hostile architecture, crushed black faces, or a paradise swap after insight. |

### 7.6 Exchange House / Exchange Approach

| Field | Build rule |
|---|---|
| Emotional intent | Calm, order, mutual exchange, and equal worth. |
| Spatial layout | A short 3–4 m approach opens into a 10–14 m court. Two wings frame one shared entrance. |
| Building density | 3–5 nearby fronts support the court. The house remains the clear destination. |
| Street width | 3–4 m approach. Keep at least 3 m through the forecourt. |
| Landmark | Joined roof shape and a large readable entrance. |
| Foreground | Two low plant or stone groups, worn threshold, a quiet water edge. |
| Midground | Two wings, shared hall, paired benches, guide space if already present. |
| Background | Roof layer, tree glimpse through the approach, far haze. |
| Prop vocabulary | Benches, bowls, blank ledger, modest table, small cloth panel. Keep groups sparse. |
| Vegetation | Two related low plant groups. Avoid a garden that covers the entrance. |
| NPC density / behavior | 1–2 placed people. Wait, sit, or cross calmly. Do not add finale dialogue. |
| Motion | Water, a small cloth edge, quiet idle posture. |
| Light / color | Warm stone on one side and cool shade on the other. Both sides have similar visual weight. |
| Sound | Soft water and steps. Distant city murmur with more space between sounds. |
| Micro detail | Paving rhythm, small material differences, threshold wear. |
| Sightlines | Roof or entrance reads from the hub. The approach leads straight to the shared center. |
| Transition | Clutter falls away gradually. Paired forms replace market irregularity. |
| Gameplay readability | Keep reserved entrance and guide anchors clear. Existing story gates remain intact. |
| Must not happen | A giant Yin/Yang sign, a good wing and evil wing, a palace, a bank symbol, or a newly active ending. |

- Yin and Yang are complementary parts of one whole.
- Show this relation through paired volumes and shared use.
- Use a curved path edge or two joined roof forms if the asset allows it.
- Keep both wings useful and welcoming.
- Do not assign moral value to bright or dark material.

## 8. Central Tree Hero Composition

### 8.1 Shape and placement

- Keep the tree as the main Outer World landmark.
- Use the supplied optimized tree as soon as it passes asset checks.
- The asset master gives a provisional height of 10–14 m.
- Current code scales a supplied tree to about 16 m.
- Measure the current result before changing that scale.
- Use 12–16 m as the scene tuning range if the silhouette fits the concept.
- Record the chosen height and canopy width.
- Keep the tree taller than most nearby house fronts.
- Keep an uneven crown with readable large branches.
- Do not reduce it to a vertical post with crossbars.
- If the model is missing, use a shaped trunk and broad leaf masses.
- Spend placeholder effort on the silhouette and state regions.
- Do not model tiny bark detail in a temporary tree.

### 8.2 Square and rings

- Start with a public paving area about 24–28 m across.
- Reduce the current 30 m disk only if the camera and roots still fit.
- Shape its edge around house fronts and route mouths.
- Keep about 3.5–4 m of low-clutter space around the visible trunk.
- Keep the portal approach wider than the interaction radius.
- Keep a 3 m clear route between the portal and the gate-side street.
- Put 3–4 benches in separate groups at about 6–9 m from the trunk.
- Face two benches toward the tree.
- Face one bench toward water or a social group.
- Place 4–6 low plant groups between occupied bench sectors.
- Add 2–3 low stone or paving-edge groups.
- Place 4–6 people in the activity ring.
- Keep the portal sector free of standing crowds.
- Frame the square with 8–12 frontage segments.
- Break those fronts into uneven groups.
- Keep four distinct route mouths.
- Add roofs behind at least two frontage groups.
- Leave at least one sky gap behind the crown.

### 8.3 Water and tree states

- Source Water begins at or below the roots.
- Use one shallow channel or basin near the source.
- Keep an optional second water element smaller than the source composition.
- Use low stone, moss, and ripples to support the water.
- Do not put a large fountain in front of the trunk.
- Keep Fear, Attachment, and center regions separately addressable.
- Keep the registry maps for tree nodes and materials.
- State tint must affect the intended region only.
- Do not recolor the whole city when one tree side changes.
- Check each existing tree state from the four approach views.
- Compare images at the same camera and exposure.
- Use development state previews only for this art check.
- Do not add new story triggers to obtain a screenshot.
- Keep leaves, branches, and emissive cues visible on low quality.

### 8.4 Required views

| View | Required first read | Keep clear |
|---|---|---|
| Gate toward square | Crown above an uneven roof frame | Center approach and crown gap |
| Market toward square | One major branch and the trunk after the exit bend | Canopy gap and return route |
| Dark District toward square | Crown against pale sky; trunk at the lane mouth | Arch opening and upper branch view |
| Exchange approach toward square | Tree centered or slightly off-center beyond the court | Paired planting must stay low |
| Square close view | Roots, Source Water, portal, and changed state region | No random crate or banner at the trunk |

## 9. Joy Market detailed build

### 9.1 Stall plan

- Keep the existing merchant and desire anchors first.
- Replace the three isolated stall arrangement with a grouped market.
- Aim for 5–7 stalls in the normal view set.
- Use at least two stall shapes.
- Use widths near 2.5–4 m as defined by the asset master.
- Use a smaller side table as one partial stall.
- Put three stalls along one bent edge.
- Put two stalls along the other edge with offset centers.
- Place any extra stall in the side court.
- Vary yaw by about 3–12 degrees within the street direction.
- Keep counters facing a clear buyer pocket.
- Overlap canopy shapes in the middle-distance view.
- Keep the main walk band free below them.
- Use canopy colors from four restrained variants.
- Do not repeat the same variant on three adjacent stalls.
- Keep canopy height clear of the player and package.
- Check the follow camera under the lowest cloth edge.

### 9.2 Stall content recipe

| Stall type | Main cluster | Secondary cluster | Story cue |
|---|---|---|---|
| Fruit | 2 fruit crates; shared low-detail fruit piles | 1 basket and 1 empty box under the counter | Goods are being sorted. |
| Bread | 3–5 grouped bread forms; folded cloth | 1 jug and 1 basket behind the seller | A fresh batch has arrived. |
| Pottery | 4–7 jars in three sizes | 1 packed crate and a cloth pad | Fragile goods need care. |
| Cloth | 2 rolls and one draped panel | Small table with folded pieces | Someone is measuring fabric. |
| Merchant hero stall | Clear desire display and work counter | Heavy crate recess, gift placement reserve, receiving space | Work and exchange belong together. |

- Use complete fruit piles for most displays.
- Use separate fruit only near hands or a named story action.
- Keep tiny goods on surfaces.
- Do not place jars or fruit evenly along every wall.
- Put stock storage beside the stall that uses it.
- Use blank or icon-based signs.
- Do not add currencies, brand names, or new story text.
- Use two planters at stall ends near the square join.
- Add one short cloth line above a side court.
- Keep the line out of the landmark corridor.

### 9.3 Merchant Micro Story space

- Preserve existing merchant behavior and role.
- Reserve a work bay about 3 × 4 m beside the stall.
- Reserve a 1.5 m clear receiving space at the counter.
- Keep the heavy crate close to its source and drop surface.
- Keep gift and hand-grip targets as separate entities.
- Give the merchant a short work loop that serves this stall.
- A help-other loop may use an existing animation if it is already available.
- Do not implement a new Give/Receive quest in v0.2.
- Keep the staging ready for that later story.
- If the story already exists in the checkout, preserve its events and free choices.
- Show practical help without kneeling.
- Do not imply that help guarantees a later payment.

### 9.4 People and movement

- Place 6–9 market residents.
- Keep only 2–3 near market residents fully animated at one time.
- Count the player and nearby square residents in the global skin limit.
- Place two buyers facing counters.
- Place a talking pair at the side pocket.
- Give one carrier a 5–10 m out-and-back route.
- Give one seller a sorting or looking loop.
- Offset loop start times.
- Do not move the entire crowd at the same time.
- Let walkers yield to the player.
- Keep them out of the desire action zone.

### 9.5 Attachment presentation

- Keep the joyful base art after `ATTACHMENT_TRIGGERED`.
- Keep products, people, cloth colors, and daylight.
- Add warm gold attention cues near the relevant object.
- Use the existing Thought Wave text and behavior.
- Keep the two-wave limit and reduced-motion behavior.
- Let subtle motion tighten around the attention source if the current system supports it.
- Stage future attraction with loose prop instances and a few curved paths.
- Those paths are a visual force field, not required physical simulation.
- Do not add new attraction gameplay in this pass.
- Do not pull the merchant, buildings, or crowd into the effect.
- Keep walking and interaction controls stable.
- Do not make pleasure or ownership appear evil.

## 10. Dark District detailed build

- Place a main lane with two slight bends.
- Use 5–8 close building fronts.
- Use heights near 7–11 m beside a 2.5–3.5 m main lane.
- Put one arch near the join from the square.
- Put a 0.5–1 m level change deeper in the district.
- Use a ramp collider behind the visible steps.
- Keep a 4–6 m court beyond one bend.
- Put a repair group or seated person in that court.
- Show ordinary work at the first reveal.
- Use one tended pot rather than many bright flower beds.
- Place 2–3 lamps across the district.
- Use emissive lamp surfaces before adding real lights.
- Use slightly lower stone roughness near damp edges.
- Use darkened lower wall bands and sparse moss.
- Keep full wet reflections out of the mobile baseline.
- Keep faces readable in shade.
- Keep the main path lighter than blocked wall recesses.

### 10.1 Fear is a perception layer

- Keep the same buildings and resident identity.
- Keep the same route and safe exit.
- A future Fear state may add a little cool fog, shadow contrast, and focused sound.
- A future Thought Wave may narrow attention toward a misunderstood action.
- Do not turn the objective world into a hostile zone.
- Do not add creatures, red eyes, or attack cues.
- Do not implement new Fear events in v0.2.
- Preview existing state-driven art only where the system already supports it.
- After a later transformation, ease the perceptual tension.
- Keep the district cool, quiet, and shaded.
- Do not replace it with a bright flower paradise.
- Human activity must read as ordinary in both states.

## 11. Inner World complete detail specification

### 11.1 Meaning, map, and scope

- Mirror the outer city through shared directions and landmarks.
- Keep Attachment toward the market side.
- Keep Fear toward the Dark District side.
- Keep the package at its dedicated root.
- Keep the source at the shared tree center.
- Use greater vertical scale and more distant depth.
- Do not mirror every house as a literal cave object.
- The scene should feel like the same place seen inwardly.
- Preserve the current arrival, return, reflection, and beetle walk path.
- A playable core near 22–30 m across is enough for v0.2.
- Extend visual platforms and cave layers over about 50–100 m apparent space.
- Use a 25–40 m inner tree where the supplied model supports that scale.
- Use far root and cave silhouettes to imply a much larger cavern.
- Do not build kilometers of collision geometry.
- Do not enlarge the loaded walk area merely to make the view feel large.

### 11.2 Area order

- Use the reading order Entrance → Inner Tree / Roots / Source → Fear Zone → Attachment Zone → Package Zone.
- Treat it as a composition and state-preview order.
- Do not force a new walking quest in that order.
- The existing package reflection remains reachable on the first visit.
- The existing beetle remains revealed by its current state condition.
- Fear remains a reserved or fogged branch until an existing state allows it.

| Area | Spatial recipe | Close detail | Distant support | Readability and scope |
|---|---|---|---|---|
| Entrance | A 3–4 m clear landing/path points at the inner trunk. Two low rocks frame its sides. | Real platform edge, small fern, low crystal pair. | Root arch above and cave silhouettes beyond. | Show safe walking ground, source direction, and return route. |
| Inner Tree / Roots / Source | A central walk surface wraps large roots. Keep a 3 m route past the trunk. | Real root contours, source basin, moss, water channel. | Large root spans rise into haze. | Tree and water are the first read. No tall crystal blocks the trunk. |
| Fear Zone | A cool left-side root recess with one sheltered platform. | Broad rock edge, dim crystal, one low plant patch. | Root shadows and a pale upper cave slit. | Future state may reveal detail. No horror forms or new event. |
| Attachment Zone | A warm right-side root bend beside the beetle area. | Chain route, low gold vein accents, sparse loose prop reserve. | Root strands repeat into haze. | Beetle reads separately from the chain. No clutter pile hides it. |
| Package Zone | A 2–3 m clear root pocket with a stable standing area. | Package support, quiet source reflection, low stone or root frame. | A branch rises behind the package without crossing its outline. | Reflection prompt and Skip remain clear. It stays reachable before Attachment. |

### 11.3 Three depth layers

| Layer | First range | Representation | Detail and motion |
|---|---:|---|---|
| Near | 0–15 m | Real 3D [three-dimensional] roots, rocks, platforms, crystals | Clear top edges, simple colliders, selective wear and plants. |
| Middle | 15–40 m | Simplified root spans, rock arches, platform forms | Shared materials, little surface detail, no small collision. |
| Far | 40–120 m apparent depth | Cheap cavern walls, root strips, island silhouettes, impostors | Strong value shapes, haze, little or no motion. |

- Show at least three separated layers from arrival and reflection.
- Overlap one foreground edge against a middle platform.
- Put a farther root behind that platform.
- Leave a pale fog gap behind the root.
- Use different scale and light value in each layer.
- Keep the far cave top uneven.
- Keep dark shapes readable against the fog.
- Do not surround the player with an obvious ring of identical rocks.
- Do not let a background image read as a flat wall at close range.
- Anchor far planes to the world.
- Use low-cost mesh silhouettes where camera rotation exposes a card edge.

### 11.4 Vertical layout and future flight readability

- Use a walkable floor band at about Y=0 to Y=2 m.
- Use decorative middle platforms at about Y=3–8 m.
- Use far root spans or cave openings at about Y=10–25 m.
- Keep every required v0.2 destination connected by walking ground.
- Give visible steps ramp colliders.
- Do not place the reflection package on an unreachable floating island.
- Do not animate a required walking platform up and down.
- Do not add a jump or flight dependency.
- For future flight, reserve a clear volume about 4–6 m wide between major roots.
- Mark safe landing tops with shape and light.
- Keep decorative far islands dimmer than future reachable islands.
- Use apparent scale, overlap, and light to show altitude.
- Keep root silhouettes out of the current camera near plane.
- Flight remains a later feature from the game master.

### 11.5 Source Water and root light flow

- Build Source Water from a narrow mesh or small basin.
- Use animated UV [texture coordinates] flow and restrained normal detail.
- Use one shared water material across connected channels.
- Avoid real fluid simulation.
- Avoid a reflected second scene on the mobile baseline.
- Keep water emissive enough to read without turning white.
- Give one clear flow direction from the source through roots.
- Use root masks or surface-aligned flow strips for light.
- Keep light flow slow and continuous.
- Use a shared time value with small root phase offsets.
- Use selected root materials for Fear, Attachment, package, and center.
- Map those materials through the asset registry.
- If an asset has one merged material, use a targeted overlay or mapped node tint.
- Record the control limitation.
- Do not tint the entire inner tree as a shortcut.
- Keep root flow readable with bloom off.
- Use at most a few tiny source particles on low quality.

### 11.6 Fog gates and state reveal

- Read visibility from existing world-state selectors.
- Keep a small decorative frame present for an unrevealed branch.
- Conceal its far contents with geometry and haze.
- Do not use a large transparent fog wall across the screen.
- Keep the first-visit package visible.
- Keep the beetle hidden until the current Attachment condition is met.
- On reveal, enable only that area's art chunk and a short light change.
- Do not add a new state schema just for decoration.
- Start loading a revealed chunk before its effect exposes it.
- Reapply the same visible state after reload.
- Repeated reveal checks must not create duplicate meshes or particles.
- A view gate does not make a walking route safe.
- Keep an edge collider or root barrier behind concealed gaps.

### 11.7 Inner audio and motion

- Use source water as the nearest sound anchor.
- Add a very soft cavern air layer.
- Add a rare distant drip or stone echo.
- Keep reflection space quieter than the entrance.
- Use slow root flow and small water motion.
- Use sparse motes with gentle drift.
- Keep crystal light variation below a distracting pulse.
- Keep sound and motion slower than the market.

## 12. Set-Dressing Library

### 12.1 Global placement contract

- Place clusters of 3–7 related objects.
- Give each cluster a named owner, task, or use.
- Give each cluster one main shape.
- Put smaller objects against that main shape or on its surface.
- Leave at least 1 m between unrelated small clusters where space allows.
- Keep the route widths from section 3 after dressing.
- Keep action areas and view corridors as exclusion zones.
- Snap props to ground or a support surface.
- Keep handles, lids, and cloth facing a useful direction.
- Rotate stored objects differently from displayed objects.
- Reuse shared meshes and materials.
- Keep decorative props non-colliding unless they block the route visibly.
- Use simple colliders for benches, carts, or large crates the player can reach.

| Category | Where and why | Cluster recipe | Cheap build method / collision |
|---|---|---|---|
| Crates / fruit crates | Storage beside a stall or work bay | 1 closed crate, 1 open crate, 1 basket | Instances; one box collider only for a large reachable stack |
| Barrels | Supply recess or water store | 1–2 barrels beside a wall, one cloth or cup | Instances; no per-barrel collision if behind a solid edge |
| Benches | Square activity ring, quiet court, Exchange | Bench, low planter, worn ground patch | Shared model; simple box collider |
| Lanterns / street lamps | Gate, route mouth, Dark District door | Lamp plus support and a small wear mark | Instances; emissive flame; no real light per lamp |
| Signs / notice boards | Stall front, gate recess, turn cue | One icon sign with a useful facing | Shared atlas; no new quest text; no collider on hanging signs |
| Cloth / banners | Stall shade, court work, Exchange accent | One main cloth and 1–2 folded pieces | Shared material variants; shader or one node sway |
| Baskets | Goods sorting or carrying | 2 sizes, one filled and one empty | Instances; grouped contents |
| Pots / planters | Doorstep, bench, stall end | 1 large pot and 1–2 low plants | Instances or thin instances; soil shares a material |
| Pottery / jars | Pottery stall, water use, work table | 3–5 jars with uneven size and spacing | Instances; no collision on table goods |
| Laundry lines | Small side court above daily work | Two poles or house anchors, 3–5 cloth shapes | Shared low-detail cloth; no long screen-wide alpha sheet |
| Wood piles | Repair pocket or store door | 5–9 logs as one grouped mesh | Instance the pile, not every tiny log |
| Tools | Repair stool, bench, merchant work bay | 1–3 tools on one support | Small opaque meshes; no random street tools |
| Tables | Seller or work scene | One table and a useful tabletop group | Box collider where reachable; goods remain separate when used |
| Fences / rails | Yard edge, stair, platform safety | Short run with a reason to stop | Repeated modules; simple segment colliders |
| Stones / edging | Water, plant bed, route edge | 3–6 stones grouped along an edge | Thin instances; only large rocks collide |
| Fountain / water elements | Source area or one quiet court | Low basin, channel, moss, small water surface | Infrastructure model plus runtime water |
| Cart / hand cart | Gate supplies or merchant work | Cart, related crate, clear work gap | Simple model and box collider; no cart physics needed |
| Gift / ledger / bowls | Reserved service and Exchange surfaces | One readable object with clear free space | Existing assets or simple placeholders; no new story system |

- Missing props do not require new paid model jobs.
- Use available kit pieces first.
- Use simple, replaceable shapes for a missing useful item.
- Keep missing items in the asset status list.
- Do not create a second asset registry for dressing.

## 13. Micro Detail Library

| Detail | Placement | Representation | Culling / cost rule |
|---|---|---|---|
| Grass | Path edges, wall feet, garden pockets | Thin instances of low-detail clumps; selective alpha-test cards | Start near 150–300 visible clumps on mobile; group by local chunk |
| Flowers / small plants | Planters, bench edges, tended courts | Thin instances or instances | Use 30–80 visible accents; avoid a uniform carpet |
| Small stones | Worn path edges and water | Opaque low-detail geometry | Use grouped patches; hide tiny forms beyond 12–18 m |
| Leaves | Under crown edges and against walls | Atlas marks or a few flat opaque shapes | Only 1–3 close patches need separate geometry |
| Moss | Water edge, shaded stone, Dark District base | Vertex colors, shared texture mask, or a small decal | No separate moss mesh per stone |
| Cracks | Selected paving and old wall corners | Shared material texture or atlas decal | Avoid cracks across every surface |
| Dirt / wear marks | Doorsteps, feet paths, storage areas | Atlas decals or material masks | Start with 8–16 visible marks, not hundreds |
| Vines | One facade edge or shaded court | Reused vine mesh segments | Keep broad silhouettes; no tiny leaf rigs |
| Grass / leaf wind | Nearby plants and hero leaf masses | Shared shader time or a few node rotations | One shared update; no per-blade code loop |
| Dust / pollen | Sunlit tree area and selected market view | Small particles | Start with 40–100 alive decorative particles per view |
| Birds | Above roofs and distant tree layers | 2–4 tiny meshes or silhouette cards on curves | No flock simulation; no collision |
| Insects | One plant or water pocket | 3–8 tiny particles or cheap mesh points | Local only; disable far from player |
| Water motion | Source and shallow channels | UV flow, small normal change, optional ripple mask | No fluid physics or full-scene reflection |
| Cloth motion | Canopy hem, small banner, laundry | Vertex shader or low-amplitude node sway | Pin the support edge; stop far updates |
| Smoke / steam | One work or food spot with a reason | A few small billboard particles | 8–20 alive; no large screen-covering plume |

- These are tuning starts, not quotas.
- Count all detail against the same frame budget.
- Use opaque shapes where they cost less than layered alpha cards.
- Keep texture family count small.
- Do not create one material for each flower color.
- Avoid visible repeating grids.
- Use a fixed placement seed for small variation.
- Keep important clusters hand-authored.
- Keep tiny dirt out of the main interaction contrast area.

## 14. Environmental storytelling

- Every close prop cluster must answer: Who uses this place?
- It must also answer: What are they doing here?
- Write a one-line use in the placement data or decision notes.
- A story cluster does not need dialogue or a quest.
- Use five first-pass examples below.

| Example | Exact group | Placement | Meaning / protection |
|---|---|---|---|
| Merchant sorting delivery | Open fruit crate, full basket, empty crate, folded cloth | Beside the merchant's work bay | Work has started. Keep the help route open. |
| Stall repair | Stool, short wood pile, two tools, partly rolled cloth | At one side of a cloth stall | Someone keeps the market in good order. No broken danger cue. |
| Shared rest | Two cups or bowls, bench, small plant, worn paving patch | Square activity ring | Two people use this place together. Keep tree sightline clear. |
| Quiet doorstep | Water jar, tended pot, folded cloth on a low ledge | Dark District court | A resident cares for daily life. Darkness does not imply neglect or evil. |
| Fair exchange | Two related bowls, blank ledger, central table | Visible Exchange hall surface | Both sides have a place. Do not trigger the ending. |

- Repeat a recipe with small changes at most twice in one view.
- Do not clone the same story group across every zone.
- Keep culturally specific symbols out unless the source art requires them.
- Do not invent new plot from decorative objects.

## 15. NPC Population System

### 15.1 Population and budget

- Aim for about 12–20 visible people across a lively combined hub/market view set.
- This target applies to a populated view, not to each zone.
- Use fewer people in the Dark District and Exchange.
- Place roughly 16–24 residents across the compact Outer World as a first plan.
- Cull people hidden behind whole building groups.
- Keep the player, merchant, and story characters inside the same skin budget.
- The master target is 6 active skinned meshes.
- The master hard limit is 10 active skinned meshes.
- A skinned mesh is a body shape moved by a bone rig.
- One person may contain more than one skinned mesh.
- Count meshes as well as people.
- Do not assume that pausing a skeleton removes its skin render cost.

### 15.2 Near / Mid / Far tiers

| Tier | First distance | People behavior | Render and update rule |
|---|---:|---|---|
| Near | 0–10 m | Merchant plus 2–3 nearby residents use full loops | Use the available rig. Target 4–6 active skinned meshes total including player. |
| Mid | 10–25 m | Sit, talk, carry, or walk slowly | Prefer unskinned static-pose copies or shared cheap motion. Keep separate rigs within the total cap. |
| Far | Beyond 25 m | Sparse silhouettes suggest activity | Static-pose meshes, low-detail cards, or very cheap transforms. No active skeleton. |

- Adjust distances to screen size and view blockage.
- Keep story roles near enough to remain readable.
- Use about 2 m of distance hysteresis at tier changes.
- Hysteresis means different entry and exit distances to prevent flicker.
- Blend a pose or change behind a building edge where possible.
- Share loaded model and material resources.
- Share an animation rig only when the loader and rig support that safely.
- Do not claim ordinary instancing makes independent skin animation free.
- A far standing pose must not look like an exported A-pose.
- If no far pose exists, use a simple dignified silhouette placeholder.

### 15.3 Occupation loops

| Loop | Duration / extent | Placement rule |
|---|---|---|
| Talk | 8–15 seconds with idle gaps | Two people face each other at a side pocket. |
| Sit / look | 10–25 seconds | Feet meet the paving and body meets the bench. |
| Carry | 5–10 m route with a pause at each end | Connect storage and a stall. Do not cross the portal. |
| Buy | 8–20 seconds | Face the counter, then step back to a waiting point. |
| Work | 6–12 seconds | Face goods, tools, or a work surface. |
| Walk | 6–15 m route | Use a route lane beside the player's main band. |
| Watch | 8–20 seconds | Face water, tree, or a real street action. |

- Use fallback clips from the current registry map.
- Do not create new full animation sets for decoration.
- Keep a small route graph in world data.
- Use a few named waypoints and waits.
- Do not add a city-wide navigation simulation.
- Let a walker pause when the player is close.
- Keep action clear zones free of crowd stops.
- Keep loop timing stable across quality changes.
- Pause and scene deactivation must stop active loops.
- Resume without creating duplicate route tasks.
- Keep decorative people separate from story event ownership.

## 16. Motion Layer

- Every populated zone needs at least two low-cost motion sources.
- A quiet zone may use water and cloth alone.
- Stagger motion speed and phase.
- Use a shared time source for plant and cloth shaders.
- Stop unused scene updates.
- Keep reduced-motion support from the current game.
- Reduce sway, pulsing, and drifting in reduced-motion mode.
- Keep required state cues as static tint or fades.

| Motion | First budget / amplitude | Update rule |
|---|---|---|
| Canopy hems / banners | About 1–3 cm movement or 1–2 degrees sway | Shader preferred; 2–4 selected nodes near player if needed |
| Hero leaf masses | About 1–2 degrees gentle motion | A few nodes or shared shader; do not rotate trunk |
| Grass | Low shared bend | Shader only; no blade-by-blade update |
| Water | Continuous slow flow | One shared material time value |
| Lamps | Small brightness change | Emissive material; no moving point light per lamp |
| Smoke / steam | One justified plume per view | Small particle pool; stop offscreen |
| Birds | 2–4 distant shapes | Simple curved routes with long quiet gaps |
| Insects | 3–8 local shapes | One small local pool |
| People | 2–3 visible close loops plus sparse cheap mid loops | Use the global skin and update cap |
| Pollen / motes | 40–100 decorative alive particles | Add event particles from the same total budget |

- Do not enable all effects just because they exist in the library.
- A 10-second idle view should show life without distracting constant action.
- Keep visual motion out of the reflection text area.

## 17. Lighting and Atmosphere Bible

### 17.1 Outer World

- Keep one main sun across all city zones.
- Use warm sunlight and soft blue ambient fill.
- Use soft shadows where the quality budget allows them.
- Keep contact cues below feet, benches, and stalls.
- Keep shade readable on a small screen.
- Avoid flat equal brightness on all surfaces.
- Avoid black faces or white overexposed paving.
- Use wall color, cloth shade, and narrow sky openings to vary zones.
- Preserve the current atmosphere system where it works.
- Tune its values after the compact layout is built.

| Setting | Practical starting range | Rule |
|---|---|---|
| Sun elevation | About 30–45 degrees | Cast useful building shade without hiding half the path. |
| Sun intensity | About 0.9–1.3 in the current engine setup | Tune with actual materials and exposure. |
| Ambient fill intensity | About 0.45–0.7 | Keep dark clothes and faces readable. |
| Outer haze start / end | About 45–60 m / 120–180 m | Keep the close square clear. Blend far layers into the horizon. |
| Mobile shadow map | One map, at most 1024 × 1024 | Low quality may disable it. |
| Shadow casters | Target 12; hard limit 20 | Count drawn mesh parts, not only entity roots. |

- These light values are tuning starts.
- They are not a claim that all material pipelines respond identically.
- Use the same exposure for all state comparison images.
- Use subtle color grading only if it preserves gameplay contrast.
- Do not depend on a heavy post-processing effect for the basic art quality.

### 17.2 Zone variations

- Start and square have the largest clear sky view.
- The market adds warm colored cloth shadows and close human activity.
- The Dark District has more building shade and cooler fill.
- The Exchange uses balanced warm and cool surfaces.
- Fade local sound and material accents at zone joins.
- Keep sun direction continuous.
- Do not create separate day times for adjacent streets.

### 17.3 Inner World

- Let Source Water and root flow define the main light hierarchy.
- Use cool cave fill with restrained warm Attachment accents.
- Use emissive root masks and crystals before adding lights.
- Keep no more than 1–2 dynamic main lights under the master limit.
- A fill light must not become a separate dynamic light at each crystal.
- Aim for 0–1 local point light on mobile.
- Count it inside the total main-light cap.
- Use fog gaps to separate large forms.
- Start fog near 20–30 m and let far forms fade by about 80–120 m.
- Keep near walk edges and interaction areas outside strong fog.
- Suggest light rays with 1–3 small masked strips only if they fit the alpha budget.
- Use lit opaque surfaces as the low-quality fallback.
- Do not add expensive true volumetric light.
- Keep glow selective and mild.
- Keep the scene readable with glow disabled.

## 18. Background and Depth System

- Build separate near roofs, far city, hills, mountains, and sky layers.
- Reuse the current background helpers where they fit the new layout.
- Add 2–3 far roof groups behind the building ring.
- Use 1–2 restrained tower shapes.
- Do not let a far tower compete with the tree.
- Use a closer tree silhouette layer outside one boundary sector.
- Use a farther mountain band with lower contrast.
- Use cloud forms that blend with the sky.
- Keep a horizon break from every allowed route view.
- Never use a blank single-color wall as the horizon.

### 18.1 Cheap depth rules

- Use full geometry near the player.
- Use roof-only geometry behind the first house row.
- Use simplified complete silhouettes where the camera can see around them.
- Use flat impostors only beyond reachable space.
- Prefer opaque backgrounds with large color shapes.
- Keep clear-image borders masked behind geometry or haze.
- Use natural parallax from camera movement.
- Parallax means near objects move more across the view than far objects.
- Avoid separate sliding image animation that makes the city swim.
- Check camera rotation at the gate and both market ends.
- Do not show the edge or back of a distant card.
- Keep far layers non-pickable and non-colliding.
- Keep them out of shadow casting.
- Aim for about 3–8 draw calls for the whole far system on mobile.
- Preserve it in low quality mode.

## 19. Material and Color Variation

| Family | Base use | Planned variants | Efficient variation |
|---|---|---|---|
| Plaster | House walls and gate wings | Cream, muted peach, warm grey | Shared atlas; limited tint or vertex color |
| Stone | Bases, stairs, square, water edges | Warm pale stone; cool shaded stone | Shared roughness and wear masks |
| Wood | Stalls, doors, benches, crates | Medium brown; darker used wood | One atlas with small tint changes |
| Roof | Tiles, low roof bands | Terracotta; muted red-brown | 2–3 shared variants; no tile-by-tile meshes |
| Fabric | Canopies, banners, laundry | Muted red, gold, teal, cream | 4–6 shared variants at most |
| Vegetation | Plants, crown, vines | Warm green, shade green, restrained flower accents | Vertex colors or instance color where supported |
| Inner stone / roots | Platforms, rocks, inner tree | Cool blue-grey with local warm state accents | Shared atlas; mapped root masks |
| Metal / pottery | Chain, tools, market jars | Low shine metal; muted ceramic | Shared small atlas and roughness variations |

- Start with about 12–20 shared material variants per visible scene.
- Measure actual draw calls before making new variants.
- Change hue by only a few percent on normal buildings.
- Use roughness changes near 0.05–0.15 for selective wear.
- Keep style variation smaller than zone identity.
- Do not clone a material per house, plant, or crate.
- Use instance attributes only where the current material supports them.
- A one-material generated kit cannot isolate plaster and roof with a whole-object tint.
- Use its atlas regions, vertex colors, or a few shared corrected variants.
- Do not brighten wood and roof along with plaster by accident.
- Keep source materials intact unless a clear correction is needed.
- Avoid strong metallic surfaces in this painterly world.
- Use wear at contact edges and human-use places.
- Do not cover every surface in dirt and cracks.

## 20. Audio Detail

- Audio is a spatial detail layer.
- It does not need constant music or dialogue.
- Use the current sound service if one exists.
- Add a small scene-owned sound layer if it does not.
- Start sound after a user action to satisfy browser playback rules.
- Keep mute and volume controls usable.
- Stop sounds when their scene pauses or closes.
- Share decoded sound buffers where possible.

| Zone / source | Required sound | Range and mix |
|---|---|---|
| Start | Wind, rare birds, faint city | Wide soft bed; city grows toward gate |
| Gate | Stone steps and light passage echo | Close and short; no constant loud echo |
| Square | Source water, low voices, birds | Water audible within about 8–15 m |
| Market | Murmur, cloth, rare crate or pottery handling | Activity bed falls over about 15–25 m |
| Dark District | Quiet steps, faint drip, distant city | Lower density; pauses between local sounds |
| Exchange | Water, calm steps, distant city | Soft and open; no ritual or reward sting |
| Inner World | Source flow, cave air, rare drip | Water leads; reflection pocket stays quiet |

- Use 1–2 ambience loops per active zone mix.
- Blend adjacent loops rather than switching them at a hard line.
- Aim for 4–8 concurrent sound voices on mobile.
- Give each short sound a cooldown of about 5–15 seconds.
- Vary volume and start time slightly.
- Use footsteps for earth, stone, and wood as practical material groups.
- Do not play wood steps on every platform if the visible surface is stone.
- Keep footstep timing tied to actual travel.
- Do not play footsteps while paused or standing still.
- Avoid complex sound-ray simulation in v0.2.
- Use zone mix and distance falloff.
- Keep UI sounds clear but quiet.
- Use available local sound assets.
- Document missing or temporary sound files.
- Do not buy or fetch paid sound packs for this pass.

## 21. Mobile-first Performance and Density Budget

### 21.1 Frame and asset limits

- Aim for 60 FPS [frames per second] on desktop.
- Aim for stable 30 or more FPS on a mid-range phone.
- The desktop frame time target is about 16.7 ms.
- The phone frame time target is about 33.3 ms.
- Keep the existing master's limits below.
- Reduce far detail before removing landmarks or key path cues.

| Metric | Working target | Master hard limit / review rule |
|---|---:|---|
| Mobile draw calls in normal view | About 80 | 120 |
| Mobile visible triangles | About 180,000 | 250,000 |
| Active skinned meshes | 6 | 10 |
| Dynamic main lights | 1 | 2 |
| Shadow-casting meshes | 12 | 20 |
| Alive transparent particles | Usually 80–150 in v0.2 | Target 250; hard limit 500 including events |
| Mobile shadow maps | 0–1 | One at 1024 × 1024 maximum |
| Initial download, excluding audio | 12 MB [megabytes] | 18 MB |
| Full slice asset download | 35 MB | 50 MB |
| Normal texture edge | 512–1024 pixels | 1024 pixels |
| Hero texture edge | 1024 pixels | 2048 only with recorded reason |
| Cached world change | Under 2 seconds | Report longer changes and loading indicator |

- The numbers above are aggregate limits.
- A cluster or zone allocation is only a tuning guide.
- Do not count one instanced draw as one triangle copy.
- Count every visible instance's geometry.
- Include shadow passes when reporting rendering cost.
- Report exactly what the engine counter measures.
- Texture download size does not equal device memory size.
- A 1024-pixel square four-channel image uses about 4 MB before mip levels if stored uncompressed.
- Keep an estimated texture memory table if the browser cannot expose memory.
- Label estimates as estimates.
- Start with a texture memory aim near 64–96 MB for the active scene.
- Lower it if the target phone shows reloads, stalls, or loss of graphics context.
- This memory aim does not replace measured device behavior.

### 21.2 Practical view allocations

| View | Triangle allocation start | Draw-call allocation start | Detail priority |
|---|---:|---:|---|
| Tree / square | 40–60k hero and close ground; 40–60k people; 50–70k rest | 70–95 total | Tree outline, source, clear route, occupied edge |
| Market | 25–45k stalls; 35–55k people; 45–70k buildings and props | 70–100 total | Merchant, goods clusters, canopy rhythm |
| Inner World | 40–55k tree; 20–35k player/package/beetle; 45–75k rest | 55–85 total | Roots, source, walking edges, three depth layers |

- Allocations need not add to the hard ceiling.
- Keep spare cost for temporary waves and state effects.
- Trim a generated model's invisible kit parts before repeated use.
- A whole kit budget is not a budget for each kit piece.

### 21.3 Detail tiers, loading, and reuse

- Use Near / Mid / Far detail by view size and distance.
- Start ordinary prop LOD changes near 10–15 m and 25–35 m.
- Keep hero silhouettes longer than ordinary props.
- Keep LOD [level of detail] change thresholds in asset configuration.
- Use regular instances for props that need individual motion or state.
- Use thin instances for repeated static grass, stones, and similar plants.
- Group thin instances by local cells about 8–12 m across.
- Do not make one giant batch that prevents useful culling.
- Recompute batch bounds after placement.
- Freeze only truly static transforms and materials.
- Exclude cloth, people, water, roots with changing light, and state nodes from unsafe freezing.
- Merge only objects that share material and lifetime.
- Do not merge the whole city into one mesh.
- Use frustum culling, which skips objects outside the camera view.
- Use building groups to hide detail naturally.
- Add occlusion checks only if measurement shows they save work.
- Occlusion checks test whether other shapes hide an object.
- Do not add a costly check per small prop.
- Load the start, gate, and needed tree assets first.
- Preload the market before it becomes clearly visible.
- Avoid obvious one-second stall or people pop-in at the route reveal.
- Load Inner World on first entry with the existing transition veil.
- Keep an inactive scene paused.
- Dispose unneeded chunks if device memory requires it.
- Do not rebuild all chunks after each state event.
- Keep at most the active zone and one useful neighbor at full detail.
- Keep the distant city layer cheap and available.
- Use shared atlases for repeated surfaces.
- Keep generated optimized files separate from source assets.
- Use existing optimization and decoder support.
- Add a new compression format only after a load and fallback check.

### 21.4 Quality modes

| Mode | Keep | Reduce |
|---|---|---|
| Low / Simple | Routes, interactions, hero tree, source, base zone identity, far skyline | Shadows, particles, small decals, plant count, crowd rig count, glow |
| Medium | Same play and silhouettes; selective soft shadow | Far small props, crowd motion, excess alpha layers |
| High / Full | Extra close plants, surface wear, more subtle motion | Still obey device limits; no new gameplay |

- Map these to the project's existing quality names.
- Keep existing `?safe` behavior.
- Do not let a quality change remove an action collider or story person.
- Low quality must still pass the boundary and landmark gates.

### 21.5 Profiling protocol

- Capture a current baseline before world changes.
- Use the same route, camera, resolution, quality, and renderer after changes.
- Confirm the browser is connected to the correct game server.
- Record device name, browser, renderer, pixel ratio, resolution, and quality.
- Warm the scene for about 15 seconds.
- Measure about 60 seconds per square, market, and inner view.
- Include standing, camera turns, and route walking.
- Record median frame time and 95th-percentile frame time.
- The 95th percentile shows the slower end of most frames.
- Record worst sustained slowdown, draw calls, triangles, skin count, and lights.
- Record first-load time, cached switch time, and asset transfer size.
- Run a phone route for at least 5 minutes to expose heat-related slowdown.
- Check browser errors and lost graphics context.
- Do not claim phone speed from a desktop touch viewport.
- Do not claim real GPU speed from software rendering.
- If no phone is available, keep the phone acceptance gate open.
- Finish the build and visual evidence that do not depend on that phone.
- Report the exact unverified check.
- Do not increase the budget just to pass a counter.

## 22. Asset Replacement Architecture

### 22.1 Existing integration points

| Current location | v0.2 responsibility |
|---|---|
| `src/assets/registry/` | Only runtime asset paths; logical IDs, parts, clips, normalization, LOD, status |
| `src/assets/feature.ts` and existing asset service | Load once, cache, clone or instance, fall back safely |
| `src/world/outer/layout.ts` | Building groups, route data, view corridors, prop sectors |
| `src/world/outer/feature.ts`, `decor.ts`, `look.ts`, `citizens.ts` | Outer scene assembly and art behavior |
| `src/world/inner/feature.ts`, `treeGlow.ts`, `crystalGlow.ts` | Inner layers and state-readable roots |
| `src/content/places.ts` | Shared gameplay anchors |
| `src/presentation/` | Light, haze, sky, water, particles, backgrounds, quality |
| `src/npc/`, `src/props/`, `src/creatures/` | Existing people, package, chain, and beetle visuals |
| `src/camera/` | Camera blocker and fade checks after denser layout |
| `docs/assets/ASSET_STATUS.md` | Verified asset state and missing pieces |

- Confirm these locations in the working checkout.
- Extend the existing modules.
- Do not create a second engine, player controller, or scene system.
- Keep state, rules, save, reflection, and narrative free of engine imports.
- Keep deep Babylon imports from the active project rules.

### 22.2 Entity and visual contract

```text
Gameplay entity
  -> stable transform
  -> simple collider
  -> interaction anchor
  -> state binding
  -> visual wrapper
       -> model or placeholder
       -> mapped nodes / clips / materials
```

- The collider moves the player.
- The visual model follows the entity.
- A model replacement must not change movement, event IDs, or saved facts.
- Keep collision sizes in explicit configuration.
- Use per-asset scale, rotation, and position offsets.
- Normalize the model before attaching it to the entity.
- Keep a tested per-part pivot map for kit pieces.
- Keep runtime path strings inside the registry.
- Use logical node names outside the registry.
- Map them to actual supplied model names.
- Optional visual internals may be missing.
- Required gameplay anchors must then use a configured fallback.
- Report the fallback once in development.
- Never let a temporary model node own quest state.

### 22.3 Integrate the 22 assets one at a time

- Asset optimization is a separate parallel track.
- It is not a prerequisite that all 22 files finish together.
- Use each optimized asset as soon as it loads and passes review.
- Do not start paid generation jobs in this pass.
- Do not copy newer assets from unrelated projects.
- Keep a missing asset's current safe placeholder.
- A file marked optimized is not automatically final.
- Validate size, orientation, materials, parts, and silhouette in the game.

| Asset-master file under `/assets/` | Immediate world role | v0.2 scope |
|---|---|---|
| `characters/player.glb` | Traveler visual | Keep the working rigged source and clip map if this file has no rig. |
| `core/central_tree_outer.glb` | Main hero tree | High priority; preserve state parts. |
| `core/central_tree_inner.glb` | Root landmark | High priority; preserve root controls. |
| `core/finance_package.glb` | Arrival, carried, and inner package | Preserve grip and event behavior. |
| `creatures/attachment_beetle.glb` | Attached beetle | Preserve current attached state. |
| `characters/merchant.glb` | Hero market worker | Keep role and tested rig fallback. |
| `market/market_stall_A.glb` | Reused stall | Integrate and stock separately. |
| `inner_world/inner_platform_kit.glb` | Close and middle platforms | Load only needed kit parts. |
| `characters/citizen_female.glb` | Resident variants | Share resources; tier the crowd. |
| `characters/citizen_male.glb` | Resident variants | Same tier rules. |
| `characters/fear_child.glb` | Reserved later role | Art only if already present; no new Fear quest. |
| `characters/dark_district_npc.glb` | District resident | Keep human visual intent; no new Fear event. |
| `characters/exchange_guide.glb` | Reserved guide | Art staging only; no new ending. |
| `city/exchange_house.glb` | Distant house and approach | Visual landmark; current story gate remains. |
| `market/market_stall_B.glb` | Second stall silhouette | Reuse with shared cloth variants. |
| `market/market_props.glb` | Goods and useful clusters | Keep action goods as separate entities. |
| `city/city_building_kit.glb` | House fronts and roof layers | Group and vary measured kit pieces. |
| `city/city_infrastructure.glb` | Gate, walls, stairs, lamps, benches | Visual structures with simple game colliders. |
| `inner_world/inner_rock_kit.glb` | Close rocks and cavern frames | Simplify or instance farther pieces. |
| `inner_world/inner_crystal_kit.glb` | Selected light accents | Emissive material; no light per crystal. |
| `world/vegetation_kit.glb` | Plants and vines | Thin instances where safe. |
| `core/package_chain.glb` | Carried and inner chain | Shared links or existing one-draw curve; no per-link physics. |

- These are the asset master's logical export paths.
- The actual player registry may point to a separate rigged file.
- Preserve that proven mapping.
- The current drop folder is `3D Models/assets/`.
- `npm run assets:sync` builds the served `public/assets/` files.
- Keep that source-to-runtime workflow.
- Do not change served files manually as the only record of a fix.

### 22.4 Replacement transaction and checks

1. Check the candidate file and record its status.
2. Update the matched registry entry.
3. Run the existing asset synchronization and validation.
4. Load the candidate in the asset viewer.
5. Check front, side, back, scale, pivot, and all required mapped controls.
6. Check it in its actual zone.
7. Check the related interaction and state after reload.
8. Keep the previous fallback if the candidate fails.
9. Record the result in the asset status file.

- This is a safe swap with a recorded fallback.
- It does not require a new save schema.
- Keep source and optimized model versions traceable.

### 22.5 Package and chain visual correction

- Preserve the existing package and chain states.
- Place the package at the configured hand or carry anchor.
- Give the loose chain a short clear hanging curve.
- Keep it beside the carry silhouette.
- Keep it away from ankles and between-leg motion.
- Keep endpoints joined during Idle, Walk, and Run.
- Use the existing one-draw chain method where possible.
- Limit near link count to the visible curve need.
- Use roughly 8–16 visible links as a first tuning range.
- Use fewer links or a simplified strip at distance.
- Do not let the chain look like a row of floating rings.
- Do not add chain collision or a physics dependency.
- Check the hand, hip, and foot view while walking.

### 22.6 Layout data contract

- Store placements as data where the current module permits it.
- Use a fixed seed only for small optional variation.
- Keep landmarks, actions, and view corridors explicitly authored.

| Data group | Required fields or equivalent |
|---|---|
| Zone | Stable ID, bounds, neighbor IDs, entry views, ambience profile, load group |
| Route | Waypoints, clear width, slope/ramp data, no-prop band |
| Hero | Entity anchor, measured visual offset, hero radius, protected view corridors |
| Building group | Asset/part IDs, transforms, measured footprint, collider plan, shared material variant |
| Prop cluster | Stable ID, one-line use, anchor, item IDs/transforms, cull tier, collision flags |
| Resident | Role or decorative ID, station, route, loop, tier rule, action exclusion rules |
| Distant layer | Asset/mesh source, apparent scale, transform, depth band, no-collision flag |
| Review view | Stable ID, camera position/target, quality, state, viewport |

- Do not add this as a separate general-purpose editor project.
- Use small typed tables in the current world folders.
- Reuse existing contracts when they already contain the needed fields.

## 23. Visual Quality Gates and Screenshot Review

### 23.1 Per-zone art completion gate

- [ ] No visible arena boundary from normal camera positions.
- [ ] No large bare area without a path, activity, or hero purpose.
- [ ] At least three depth layers appear in the main view.
- [ ] The main landmark reads first.
- [ ] The player route reads with UI [user interface] hidden.
- [ ] The zone reads as itself without a zone label.
- [ ] Prop clusters have clear uses.
- [ ] Houses have varied rooflines and grouped fronts.
- [ ] At least one subtle motion source is visible.
- [ ] The active zone also has appropriate spatial sound.
- [ ] Key action surfaces and prompts remain clear.
- [ ] People occupy real work, rest, or route spaces.
- [ ] The camera can turn without entering walls or exposing fake layers.
- [ ] State changes remain readable.
- [ ] Low quality preserves routes, landmarks, and hidden limits.
- [ ] The zone view stays inside the mobile geometry and draw-call limits.
- [ ] Required phone performance is measured or clearly marked open.

- Do not mark a zone art-pass complete if a mandatory visual gate fails.
- Do not mark phone performance passed without a phone test.
- A visually complete zone may still have an open device gate.
- Keep those two statuses separate in the report.
- Temporary assets can pass the art gate if their result is coherent.
- List them without claiming final asset quality.

### 23.2 Screenshot matrix

- Use the normal production follow camera for acceptance images.
- Do not use only a free art camera.
- Capture both UI-visible and UI-hidden versions of key views.
- UI-hidden is for composition review.
- UI-visible is for control and action review.
- Pair before/after views from the same anchor where possible.
- Record camera, state, viewport, quality, and renderer in a capture manifest.

| Capture ID | View | Required evidence |
|---|---|---|
| `01-start` | Package point toward gate | Quiet detail, clear pickup, gate and crown depth |
| `02-gate` | Passage toward tree | Close frame, clear route, no arena wall |
| `03-square-wide` | Gate-side square edge | Hero rings, roof variation, life, skyline |
| `04-tree-close` | Portal approach | Root and water detail; no blocked interaction |
| `05-tree-market` | Market exit toward tree | Crown and trunk return view |
| `06-market-entry` | Square toward market | Grouped stalls and people; clear desire route |
| `07-market-counter` | Merchant buyer position | Goods story, action space, warm harmless mood |
| `08-dark-entry` | Square-side arch | Cool human district; readable return route |
| `09-dark-court` | Inner lane pocket | Everyday work, depth, no horror cue |
| `10-exchange` | Approach toward house | Complementary wings and shared entrance |
| `11-inner-arrival` | Landing toward roots | Walking floor and three cave layers |
| `12-inner-source` | Source/root close view | Flow, material, clear return route |
| `13-inner-package` | Reflection standing point | Clear package, text area, far depth |
| `14-inner-beetle` | Second visit beetle view | Attached state, chain path, readable silhouette |
| `15-boundary-sweep` | Contact views at four edge sectors | Disguised limits from allowed camera angles |

- Capture all primary views at desktop 1280 × 720 or the project's standard viewport.
- Capture square, market, tree action, inner arrival, package, and beetle at 390 × 844 touch view.
- Capture one low-quality square, market, and inner view.
- Capture at least three camera angles per main zone.
- Extra angles may share a contact sheet, but keep original images.
- Use a normal view, a reverse view, and an edge/corner view.
- Add a 10–15 second idle clip for square, market, and inner source if recording is available.
- A still image cannot prove motion, audio, or phone speed.
- Keep those checks separate.

### 23.3 Review report contents

- Give every zone one status: not started, in progress, visual pass, or needs revision.
- State which phone gates remain open.
- Link the scale map and screenshot manifest.
- List models integrated and models still temporary.
- List old art retained and new art added.
- Give before/after view metrics.
- Record gameplay regression checks.
- Record any missing source sound or model controls.
- Record choices that differ from a proposed dimension in this file.
- Explain each difference in one sentence.
- Do not claim polished direction from only a successful build.

## 24. Implementation Order: Vertical Slice v0.2 – World & Art Integration

### 24.1 Preflight

- Read the three specifications and the active project work rules.
- Read current decision notes and asset status.
- Run the current game from the correct checkout.
- Confirm the actual server and port.
- The inspected project uses port 5186 by default.
- Record current route, action anchors, asset paths, and camera limits.
- Capture baseline views and performance counts.
- Keep existing useful art and checks.
- Make a small task map against the modules in section 22.
- Do not rewrite v0.1.

### 24.2 Ordered work and exit checks

| Step | Work | Exit check |
|---:|---|---|
| 1 | Compact world reshape | Main routes use target widths. All current actions remain reachable. Save positions recover safely. |
| 2 | Hide boundaries | Normal and low-quality camera sweep shows believable edges in all sectors. |
| 3 | Building composition | House groups, roof variation, arches, courts, and view corridors work in plain lighting. |
| 4 | Insert optimized models as available | Each model passes registry, viewer, and in-zone checks. Missing files keep fallbacks. |
| 5 | Central Tree composition | Rings, source, portal, and four approach views pass. State parts stay visible. |
| 6 | Market dressing | 5–7 grouped stalls, useful goods, merchant space, and clear desire action. |
| 7 | Inner World depth | Three layers, vertical scale, walkable core, source flow, and state reveal pass. |
| 8 | Vegetation and set dressing | Every close cluster has a use. Paths and views remain clear. |
| 9 | NPC population | Near/Mid/Far tiers work. Population looks occupied. Skin count stays in budget. |
| 10 | Lighting, fog, and background | Zones share one city look. Near actions remain readable. Far layers hide limits. |
| 11 | Motion | Quiet life is visible in idle clips. Pause and reduced-motion modes work. |
| 12 | Audio | Zone mixes, footsteps, source flow, mute, and scene cleanup work. |
| 13 | Performance pass | Required counters pass. Actual phone measurement is obtained or explicitly open. |
| 14 | Screenshots and review | Complete capture matrix, report, asset list, and acceptance status are saved. STOP. |

- Step 4 may happen again when another optimized model arrives.
- Do not wait for all 22 models before finishing other steps.
- Do not skip a failing movement or camera check to add more props.
- Use the same route checks after meaningful layout changes.
- Avoid broad repeated tests after unchanged art-only edits.
- Run the full required checks at final integration.
- Stop after the v0.2 evidence and report.
- Wait for Alexander's review before adding new Fear or Exchange story work.

### 24.3 Required deliverables in the game checkout

| Deliverable | Suggested location | Required content |
|---|---|---|
| Implemented world pass | Existing `src/` modules and model workflow | All in-scope art and layout changes |
| Layout notes / scale map | `docs/v0.2/WORLD_LAYOUT.md` | Zones, dimensions, routes, anchors, view corridors |
| Decisions | `DEVELOPMENT_DECISIONS.md` | Important choices, source conflicts, retained offsets |
| Asset status | `docs/assets/ASSET_STATUS.md` | Integrated, temporary, missing, rejected, and control limitations |
| Screenshot manifest | `docs/evidence/v0.2/captures.json` | Camera, state, viewport, quality, renderer, file |
| Images / optional clips | `docs/evidence/v0.2/` | Required views with source originals |
| Performance record | `docs/evidence/v0.2/performance.json` | Device, views, metrics, timing, estimated memory |
| Final report | `docs/reports/V0.2-WORLD-ART.md` | Changes, checks, zone gates, device limits, review status |

- Use the existing report format if project rules require a work-package report.
- Keep these suggested evidence paths consistent across the final report.

## 25. v0.2 Acceptance Criteria

### 25.1 Gameplay preservation

- [ ] Start and package pickup work.
- [ ] Package and chain follow the player correctly.
- [ ] Gate condition and open collision work.
- [ ] Player reaches the Central Tree.
- [ ] Look Within enters and exits safely.
- [ ] Inner Tree, roots, Source Water, and package are clear.
- [ ] Reflection Save and Skip work.
- [ ] Saved text remains local and unscored.
- [ ] Reload preserves facts, response, and safe player position.
- [ ] Market triggers the existing `I want more...` wave once.
- [ ] Reload does not repeat the once-only wave.
- [ ] Second inner visit shows the attached beetle.
- [ ] Alternate exploration order remains valid where current rules allow it.
- [ ] Keyboard, mouse, and touch controls still work.
- [ ] Camera collision, pause, and quality controls still work.
- [ ] No art route needs flight or a new jump mechanic.

### 25.2 World and visual quality

- [ ] The city is compact and connected.
- [ ] The view no longer reads as a Babylon test arena.
- [ ] Each Outer World zone has its own clear visual identity.
- [ ] The Central Tree is the main Outer World landmark.
- [ ] Hero space remains open but its edge feels occupied.
- [ ] Joy Market feels warm and believably alive.
- [ ] Attachment does not turn joy into evil.
- [ ] Dark District feels cool and quiet without horror cues.
- [ ] Exchange uses complementary architecture without a giant symbol.
- [ ] Inner World feels deep and mysterious through real near forms and cheap far layers.
- [ ] No tall arena wall is visible from normal play views.
- [ ] No large open ground area lacks a clear use.
- [ ] Props form useful story groups.
- [ ] Subtle motion and sound support the world.
- [ ] Low quality retains the same main visual direction.
- [ ] Multi-angle screenshots pass section 23.
- [ ] Remaining temporary art is listed.
- [ ] The visual direction can be reviewed even if some assets are not final.

### 25.3 Assets, build, and speed

- [ ] Temporary and optimized models can swap through the registry.
- [ ] Gameplay does not depend on temporary model internals.
- [ ] Asset load failures keep a useful fallback.
- [ ] Required asset controls are verified or their limits are listed.
- [ ] Type check, lint, unit tests, build, asset checks, and browser journey pass.
- [ ] The full journey also passes with forced placeholders.
- [ ] Browser console has no unhandled errors.
- [ ] Mobile-view draw calls and triangles stay within master limits.
- [ ] Skin, light, shadow, particle, texture, and download counts are recorded.
- [ ] Desktop speed meets the target on a named device or its failure is listed.
- [ ] Real mid-range phone holds 30 or more FPS in the tested route.
- [ ] Phone heat, camera wall behavior, save/reload, and world switch are checked.
- [ ] Missing real-phone proof keeps the device gate open.
- [ ] No major new story or game system was added.
- [ ] Final report ends with review needed and no automatic next story work.

### 25.4 Completion labels

- Use **v0.2 ready for visual review** when art and code checks pass.
- Use **device validation open** if a real-phone test is missing.
- Use **v0.2 accepted** only after the required gates and Alexander's review pass.
- Do not label missing proof as a pass.

## 26. Single Copy-Paste Coding-Agent Prompt

```text
Implement Vertical Slice v0.2 – World & Art Integration

Read GAME_MASTER_SPEC.md first.
Read 3D_ASSET_GENERATION_MASTER.md next.
In the current project, that file is docs/3D_ASSET_GENERATION_MASTER.md.
Read WORLD_BUILDING_AND_DETAIL_SPEC.md next.
Read the active AGENTS.md, DEVELOPMENT_DECISIONS.md, asset status, and current world code.

Continue the existing working v0.1.
Do not rewrite it.
Do not rebuild its engine, controls, state, save, reflection, camera, or scene system.
Keep useful art work already present in the current checkout.
Treat this as a world and art pass.

First run the current game from the correct checkout and capture baseline views.
Check the actual server and port.
Map the existing gameplay anchors, route, colliders, model controls, and quality modes.
Use the shared places source for changed anchors.
Keep saved facts and reflection text when the layout changes.

Build a compact, dense, roughly circular city.
Keep Start Area, City Gate, Central Square/Central Tree, Joy Market, Dark District, and Exchange Approach.
Use the dimensions, five detail levels, density rings, zone recipes, and view rules in WORLD_BUILDING_AND_DETAIL_SPEC.md.
Group houses and vary their roofs.
Use short organic paths, small courts, selected alleys, arches, and ramp-backed stairs.
Hide world edges with architecture, plants, roofs, far city, landscape, and sky.
Keep all main tree and Exchange view corridors readable.

Make the tree the main hero object.
Keep its portal, source, and state regions clear.
Make the market warm, harmless, and alive before and after Attachment.
Keep the Dark District human, cool, and quiet.
Use complementary Exchange wings without a giant Yin/Yang sign.
Give Inner World real close roots, rocks, and walkable platforms.
Add cheaper middle shapes and far cave/root/platform silhouettes.
Use haze, water, root light flow, and vertical scale for depth.
Keep all required destinations walkable.
Do not add flight.

Add useful prop clusters, selective micro detail, low-cost motion, zone sound, and Near/Mid/Far people tiers.
Preserve the merchant's role and staging for Give/Receive/Help-Other.
Do not add a new quest to that staging.
Keep crowds out of actions and camera routes.
Correct the package and chain view without changing their game meaning.

Use available optimized GLB [binary glTF model file] assets as each passes validation.
Do not wait for all 22 files.
Keep existing safe placeholders for missing or failed files.
Use the existing asset registry as the only runtime path source.
Map real file parts, materials, and clips there.
Keep gameplay and collision separate from visuals.
Keep per-asset scale, rotation, offsets, and safe control fallbacks.
Do not start paid model jobs or copy assets from another project.
Record which assets are temporary and which controls remain missing.

Keep the game master's mobile limits.
Aim for 60 FPS [frames per second] on desktop and stable 30 or more on a mid-range phone.
Use instancing, local thin-instance batches, LOD [level of detail], shared materials, cheap far layers, limited skins, and limited lights.
Keep the same play behavior in every quality mode.
Do not claim real-phone speed from a desktop touch viewport or software rendering.

Work in the order in section 24 of WORLD_BUILDING_AND_DETAIL_SPEC.md.
Make small useful choices yourself.
Do not ask unnecessary questions.
Record important choices and any specification conflict in DEVELOPMENT_DECISIONS.md.
If a dimension needs adjustment, keep the intended visual result and record the measured reason.
Do not add major new story, Fear, Exchange ending, online text, or other game systems.
Preserve any later behavior already present in the selected checkout and report that scope difference.

Verify the complete existing route:
Start -> receive package -> pass gate -> tree -> Look Within -> inner roots/source/package -> save or skip reflection -> return -> market -> one I want more... wave -> return inward -> attached beetle.
Check reload, camera walls, touch controls, pause, quality changes, and asset fallback mode.
Run the project-required type check, lint, unit tests, build, asset validation, and browser journeys.
The current commands are npm run typecheck, npm run lint, npm test, npm run build, npm run assets:check, and npm run test:e2e.
Run npm run assets:sync when asset inputs change.
Update route tests for legitimate shared-anchor changes without weakening their real-input checks.

Save the scale map, multi-angle desktop and 390 x 844 touch screenshots, low-quality views, capture manifest, and measured performance report.
Use the evidence paths in section 24 or the project's required equivalent.
Review every zone against the quality gates.
If a phone is unavailable, finish independent work and mark device validation open.
List exactly what was verified and what remains unverified.
List integrated assets, remaining placeholders, known visual limits, and important decisions.

STOP after v0.2, screenshots, checks, and the final report.
State that Alexander's visual review is the next step.
Do not continue automatically into new Fear or Exchange finale work.
```
