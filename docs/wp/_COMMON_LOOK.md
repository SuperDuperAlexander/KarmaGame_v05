# Common rules for the look pass (WP-40, WP-41, WP-42)

- User request 2026-10-02: improve the graphics. Three Sonnet helpers work in parallel.
- Read `docs/wp/_COMMON_FINISH.md` too. All its rules apply.
- Target look: the concept sheet `ChatGPT Image 1 Oct 2026, 15_47_14.png` in the project root (and the other `15_47_*.png` sheets). Warm golden-hour city with saturated colours and glowing lanterns. A magic, luminous inner world in blue, violet and gold with floating islands, waterfalls and crystals.
- Current look: `docs/evidence/wp-36/*-after.png`.
- Spec limits stay: beauty from light, fog, colour and few particles (spec §1, §15). One main dynamic light (two hard). No extra dynamic point lights: fake lamp light with emissive meshes, halo billboards and the glow layer.
- Phone budget at 390×844 (normal assets): at most 80 draw calls target (120 hard), at most 180,000 triangles. Particles at most 250 (half on `low`). Report numbers before and after.

## Shared contract for glow

- WP-42 owns the glow layer.
- A mesh that should glow sets `mesh.metadata = {...mesh.metadata, glow: true}`. Its material needs an emissive colour.
- WP-42 adds only meshes with `metadata.glow === true` to the glow layer. The glow layer is off on `low` and in `?safe`.
- WP-40 tags lantern flames, window lights and warm accents. WP-41 tags crystals, root veins, water and beetle veins.

## Work method

- Measure first. Take screenshots. Change one thing. Take screenshots again. Look at them with the Read tool and compare with the concept.
- Keep gameplay positions, colliders, rules, state and text unchanged.
- Run e2e with your own `LW_PORT`. Stop only your own dev server (by PID). Never kill all `node.exe`.
