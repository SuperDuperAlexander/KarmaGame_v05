# WP-18a [Work Package 18a]

- Added `sliceRules` in `src/narrative/sliceRules.ts`.
- Added both paths: tree first and market first.
- Both paths pass after reload.
- The desire wave saves its name before it starts.
- Reload does not repeat that wave.
- The attached beetle ends this slice.
- No later story facts exist in the rule data.
- The end hint does not stop free movement.
- Market first can show the beetle before the player saves a reflection.
- The lead must keep the reflection action usable after that hint.
- Text comes from `src/content/strings.en.ts`.
- `npm run typecheck`, `npm run lint` and 49 unit tests passed.
- Build needs the lead's `src/main.ts`.
- Browser checks remain open.
