# WP-B2 report: story panel, data spots and zones, app wiring

## Done

- Story panel in `src/ui/index.ts`: speaker, up to 3 lines, up to 3 choices, a Leave button. Plain text only (`textContent`). Keys 1-3 choose, E picks the first, Esc leaves. Input is locked with the existing modal lock. Panel sits at the top, so it never covers the touch stick. No slide with reduced motion.
- `ui.story(view|null)` works. `ui.reflection(text, question?)` shows the question.
- Interaction reads `spots` and `zones` from `src/narrative`, places from `src/content/places.ts`, and conditions with `matchesCondition`. Press spots send `{type:'spot', id: signalId ?? id}`. Zones send `{type:'zone-enter', id}` once per crossing. The interaction dispatch now takes a `Signal` object.
- `src/app/app.ts`: `story`, `story-end`, `act`, `wave` (actor position and tone), `panel` with `prompt` (money, enough), `counter` (ignored in the app). `story-closed` carries the open story id. `nextHint` runs after every rule run and on scene change.
- New helper file `src/ui/storyEffects.ts` (pure, tested with a fake world).
- Thought waves have tone colours (`src/thought-waves/core.ts`).

## Checks

- typecheck, lint: pass. `npm test`: 24 files, 116 tests pass (new: ui-story, ui-effects, interaction-data, waves-tone). `npm run build`: pass.
- `npm run test:e2e` (port 5252): 6 of 6 pass.
- Not checked: a real phone, a real story with data (the stub lists are empty).

## Open issues

- The rule engine does NOT apply `counter` effects (`src/rules/ruleEngine.ts`). WP-B1 must add it. The app ignores `counter` on purpose.
- `WaveService.show` in `src/contracts/visual.ts` has no `tone`. The app casts to `ToneWaveService`. Lead: add `tone?` to the contract.
- Temporary labels (read through `label(key, fallback)` in `app.ts`, so a string in `strings.en.ts` wins): `leave` = "Leave", `enoughQuestion` = "What is enough for you?".
- The enough reflection is saved by the app straight into `state.reflections.enough` (the reflection store only knows `money`). A skip deletes it.
- Data spots replace the slice spots once `spots` is not empty. WP-B1 must then include the slice spots (waystone, tree look-within, desire, reflect, return) in the data. Slice zones (city, tree, market) always run, data zones are added.
- A `story` effect is dropped while the reflection panel is open, or while pause is open.
