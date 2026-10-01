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
