# WP-B1: Rules, story data, selectors, hints and text

- Model: Claude Sonnet. Wave 1 of Phase B. Needs: WP-B0 (done).
- Read first: `docs/wp/_COMMON_FINISH.md`, `docs/PLAN_MVP.md` (story table: the source for this WP), `GAME_MASTER_SPEC.md` §1, §3, §4, §5, §7, §8.3, §10, §21 "Inhalt und Sicherheit", `AGENTS.md` (its scope stop at the beetle is lifted for Phase B by the user on 2026-10-02).
- Read the contracts: `src/contracts/state.ts`, `src/contracts/story.ts`, `src/content/places.ts`, `src/narrative/index.ts` (stub surface: keep its export names), `src/narrative/sliceRules.ts`, `src/rules/ruleEngine.ts`, `src/state/*.ts`, `src/reflection/reflectionStore.ts`.
- Owns: `src/narrative/`, `src/state/selectors.ts`, `src/state/worldStore.ts` (defaults and migration only), `src/content/strings.en.ts`, `src/reflection/`, `src/rules/`, tests `tests/narrative*.spec.ts`, `tests/mvp*.spec.ts`, `tests/content*.spec.ts`, `tests/state*.spec.ts`, `tests/conditions*.spec.ts`, `tests/save*.spec.ts`.
- Pure TypeScript. No Babylon import (lint guard). Do not edit UI, app, interaction, world or contracts. Need a contract change? Write it in the report.

## Tasks

1. `src/narrative/microStories.ts`: the six micro stories plus the beetle step and the finale step from `docs/PLAN_MVP.md` as `MicroStory` data. Short lines (at most 120 characters each, at most 3 lines per step). Choice labels at most 32 characters. Every step can be left.
2. `src/narrative/mvpRules.ts`: data rules for every row of the story table. Use `signal:'spot'|'zone-enter'|'choice'|'story-closed'` with `signalId`. Effects: facts, traits, counters (`serviceActs`, `giveCount`, `receiveCount`), `story`, `story-end`, `act`, `wave` (with `actor` and `tone`; at most 64 characters), `hint`, `save`, `panel` with prompt `enough` for the finale. Spec event facts (`SERVICE_OFFERED`, `GIVE_COMPLETED`, …) are set once, even if reached twice; counters may grow.
3. `EXCHANGE_UNDERSTOOD` when give and receive are both done, in any order (also check on each relevant signal). `FINANCE_MVP_COMPLETE` when `TREE_DISCOVERED`, `MONEY_REFLECTION_SAVED`, `SERVICE_OFFERED`, `GIVE_COMPLETED`, `RECEIVE_COMPLETED` and `ATTACHMENT_TRANSFORMED` are set.
4. Change the slice end: R12 must no longer say "This is the end". After the beetle the hint points softly to the city stories. Keep all slice rules and tests working (the e2e slice journey must still pass: same prompts, same wave, same facts).
5. `src/narrative/spots.ts` and `zones.ts`: `SpotData` and `ZoneData` for every story place (use `src/content/places.ts` names in `place`), each with a `when` condition, so prompts show only when they make sense. Keep the slice spots (waystone, tree, desire, reflect, return) with the same ids, texts and conditions. Zones: `city`, `tree`, `market` as today plus `dark-district`, `exchange-street`.
6. `src/narrative/index.ts`: export `allRules` (slice + MVP), `stories`, `spots`, `zones`, `speakerNames`, `nextHint(state, world)` (soft guidance for any state, both worlds).
7. Selectors in `src/state/selectors.ts`: extend `beetleState` with `observed`, `released`, `transformed`; `chainState` gets `free` after transformation; add `fearZoneVisible`, `basinFlow` (0..1 from give and receive counts), `servicePlants` (0..3), `finaleReady`, `finaleSeen`, `storyDone(storyId)`.
8. Reflection: support prompt ids `money` and `enough` (`ReflectionPrompt`). Keep the `money` behaviour. Keep plain text and the 2,000 character limit.
9. Save: new facts and counters must load from old saves (schemaVersion 1, add defaults in migration).
10. Rule engine (`src/rules/ruleEngine.ts`): apply `counter` effects to `state.counters` inside the same store update as facts and traits. Clamp traits to 0..1. Do not pass `counter` effects to the app.
11. Strings: all new player text in `strings.en.ts`. Content rules: no diagnosis, no "you really feel", no money reward promise, no karma as fact, no score, no right answer, help is active (never kneel). Dr. Rulin style: short questions, no preaching.

## Tests (headless, no browser)

- Every story with every choice path, including "leave" at each step.
- Full MVP in at least three different orders reaches `FINANCE_MVP_COMPLETE`.
- Declining every gift still reaches the end (guide tea). Walking away from the child still reaches the end.
- Once-rules survive save and load. A reload at every step keeps the state.
- Content test: scan all strings for banned words and phrases (diagnose, karma is, you will earn, guaranteed, kneel, wrong answer, score, …) and length limits.

## Done when

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass.
- Report lists every fact, rule id, story id, spot id and zone id, and the test count.
- Commit on your branch with prefix `WP-B1:`.
