# Development decisions

## Architecture decisions (seed for `DEVELOPMENT_DECISIONS.md`)
- **AD-1 Stack:** Vite + TypeScript strict + Babylon.js + Vitest + Playwright + ESLint. Deep imports, lazy glTF loader. Babylon latest 9.x; first proof in WP-01 = rigged player plays Idle/Walk; if it fails → pin 8.56.2 (proven).
- **AD-2 Entity ≠ Visual:** `GameEntity` root TransformNode = gameplay transform → collider (invisible capsule/box from registry) → interactable → state → `VisualComponent` (GLB instance is a child). Movement and collision never use the GLB.
- **AD-3 Asset Registry** (`src/assets/registry/<category>.ts`) is the ONLY place with file paths. Per entry: status (`placeholder|temporary|final`), file, transform, normalize, hideNodes, LOD, collision, logical clip map (names[], loop, authoredSpeed, fallback), logical node map (names[], bones allowed), logical material map (`'*'` = all), instancing, zone, placeholder spec (always), extras, budget, notes. Missing file → placeholder + one dev warning. `?assets=placeholder` forces all placeholders. `?viewer` lists every asset and missing names.
- **AD-4 Names:** code uses logical names only (`walk`, `socket.handR`, `root.attachment`); the registry maps to real GLB names. Files follow the 3D doc; gameplay follows the Master Spec.
- **AD-5 Collision:** Babylon built-in collisions (`moveWithCollisions`, ellipsoid ≈ capsule r 0.32 / h 1.65) behind a `CharacterMotor` interface. Simple colliders + ramps. No physics engine in v0.1. Kill-plane → last safe position. Camera ray-picks a `cameraBlocker` layer.
- **AD-6 Scenes:** one Engine; `SceneManager` (WP-01) with BootScene, OuterWorldScene, InnerWorldScene. Inner created on first visit, then kept paused. Each scene has its own player entity; player position lives in the store.
- **AD-7 UI = DOM overlay** (prompt, hold ring, reflection textarea, pause, loading veil, touch controls, Thought Wave labels with edge clamp; wave ribbon in 3D). UI sends commands only.
- **AD-8 World State = pure TS:** `EventBus` (signals) → `RuleEngine` (data rules: signal + condition + once + effects) → `WorldStore` (facts set, fired rules, traits, counters) → selectors. No Babylon import in state, rules, save, reflection.
- **AD-9 Lasting visuals come from selectors** (package, chain, beetle, gate, tree mood). Effects only do transient things (wave, panel, FX, transition, save). So a reload always shows the right world.
- **AD-10 Traits:** `traits{attachment, fear, trust, contentment}` (0..1 image values, no moral score). Work-order flags (`packageReceived`, `marketEventExperienced`, …) are selectors.
- **AD-11 Save:** localStorage `light-within-save-v1`, schemaVersion + migrate, corrupt → `light-within-save-recovery`, ≤1 write/s, save on scene change + page hide. Reflections plain text ≤2000 chars, never leave the device.
- **AD-12 Text:** all player text in `src/content/strings.en.ts`; content rules of spec §1/§4 apply.
- **AD-13 Dev tools:** `?debug` overlay (FPS, draw calls, meshes, tris, textures, GPU), `?safe` (no post FX), `?test`; `window.__lw` hook only in dev/test builds.
- **AD-14 Asset files:** drop zone `3D Models/assets/` (tracked) → `npm run assets:sync` → `public/assets/` (generated, ignored). Registry points to `/assets/...`.



## Execution update, 2026-10-01
- All work uses ChatGPT agents. The original model names are no longer task assignments.
- Combine leaf packages into three owned worktrees to reduce merge cost. Preserve the package checks.
- Root Git exists with an unborn main branch and a prefilled index. Keep user files. Exclude generated and unrelated temporary data from the first commit.
- Google Drive sync state cannot be proved here. Do not change the user's sync app.
- The older 8.x player proof is evidence only. Test the current 9.x runtime.
- A3 rig work and final art may stay a separate track when the fallback clips meet the slice needs.
- Real phone checks need the user device. Browser touch tests are separate evidence.

## Integration record, 2026-10-02

- Babylon.js 9.29.0 loads the local rig in the game. Keep 9.x.
- The boot stage uses a loading panel. It does not need a third render scene.
- Module entry functions replace empty feature stubs.
- Three task groups use separate worktrees. Each node_modules path is a junction to the root install.
- Helpers used the same ChatGPT session model. No Claude service was used.
- The shared type review ran after the first feature merge. This differs from the old gate order.
- Review fixes passed before the final full browser suite.
- The reviewed types are tagged contracts-v1.
- Use modern model containers to cache one file per scene and clone or instance its visuals.
- Normalize visuals at the origin before attaching them to the game entity.
- Player imported facing needs zero registry yaw in this local file.
- The outer player carries a separate package and a one-draw loose or tense chain.
- V2 Walk and Run use their own authored speed. A fallback uses its actual clip's speed.
- The rounded collision shape can climb short steps. A low side ray blocks a 0.3 metre ledge but permits a ramp.
- A camera ray must skip disabled colliders. Invisible enabled walls still block it.
- Pause stops scene clips as well as game movement.
- Save before wave and world change uses a queued effect chain. Normal writes stay at one per second.
- Page hide and service dispose can flush the final state at once.
- Delete also removes the corrupt-save recovery copy, which can contain old words.
- The wave rule reserves its name before save. The app shows only that fresh effect.
- New Game stops rendering, resets the store and clears the save before reload.
- Low and medium view choices change visual detail without changing play.
- Safe mode starts with low-cost effects. No heavy post effect is used in this slice.
- Thought layers from the idle scene stay hidden.
- Restored positions must fit their world map. Bad positions use the spawn point.
- World changes use an opaque loading veil. Logged fade phases are stage names; this is not a timed art dissolve.
- Initial test launches forced software graphics. Slow reads made long held-key tests unreliable.
- Final tests use Intel Iris Xe through native D3D11 [Direct3D 11].
- Input pulses end before each read so a slow reply cannot move the player past a target.
- Software mode stays available with LW_SOFTWARE=1. It is not phone-speed proof.
- Keep all v0.1 story scope at the attached beetle. Final art and later story remain separate.

## Hand-off choices

- Each owned package has its detailed choices in docs/decisions/.
- State, save and reflection choices: WP-02 and WP-03.
- Asset and scene choices: WP-04, WP-12, WP-13, WP-14, WP-15 and WP-16.
- Input and screen choices: WP-05, WP-06 and WP-08.
- Shared types, motion, camera and world change: WP-01, WP-01R, WP-09, WP-10, WP-11 and WP-17.
- Slice and checks: WP-18a, WP-18b, WP-19a, WP-19b and WP-21.
- Local file track: WP-A1, WP-A2 and WP-A3.
