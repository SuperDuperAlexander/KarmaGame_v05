# WP-B1 report: rules, story data, selectors, hints, text

## Done
- 8 stories in `src/narrative/microStories.ts`: merchant, child, dark, giver, receiver, guide, beetle, finale (22 step choices + 2 finale choices, 24 unique choice ids).
- 79 rules: 12 slice rules (R1 to R12) and 67 MVP rules in `src/narrative/mvpRules.ts`.
- 18 spots in `src/narrative/spots.ts`. 2 new zones in `src/narrative/zones.ts`.
- `allRules`, `stories`, `spots`, `zones`, `speakerNames`, `nextHint` exported with the stub names.
- Selectors: `beetleState` (observed, released, transformed), `chainState` (free), `fearZoneVisible`, `basinFlow`, `servicePlants`, `finaleReady`, `finaleSeen`, `storyDone(state, id)`.
- Rule engine applies `counter` effects in the same store update and clamps traits. Counters are not passed to the app.
- Reflection: prompt `money` and `enough`. `saveReflection(store, text, prompt?)`, `skipReflection(store, prompt?)`.
- Save: new facts are valid. Counters `serviceActs`, `giveCount`, `receiveCount` default to 0 for old saves.
- Text: about 160 new strings in `src/content/strings.en.ts` (`strings`, `storyText`, `waveText`, `speakerLabels`). `strings.end` now reads softly and points to the city. `strings.leave` added.

## Lists
- Story ids: merchant, child, dark, giver, receiver, guide, beetle, finale.
- Spot ids: waystone, tree, desire, reflection, return (slice, same text, radius, condition, hold); beetle-observe, crate, crate-drop, merchant, child, coin, dark, giver, receiver, exchange-door, guide, finale, finale-reflect.
- Zone ids (data): dark-district, exchange-street. The app keeps city, tree, market. Rules Z-city, Z-tree, Z-market also answer `zone-enter` with those ids.
- Rule ids: R1 to R12; Z-city, Z-tree, Z-market, Z-exchange-street, Z-dark-district; M-fear-seen; M-<signalId> (second and later rules of one id get -b, -c, ...) for crate, crate-lift, crate-no, crate-drop, merchant, gift-accept, gift-decline, child, coin, child-search, child-listen, child-walk, child-return, child-give, child-keep, dark, dark-listen, dark-leave, giver, giver-rest, giver-silent, giver-accept, giver-decline, receiver, receiver-offer, receiver-respect, exchange-door, guide, guide-tea, guide-decline, beetle-observe, beetle-letgo, beetle-stay, finale, finale-write, finale-sit, finale-reflect, M-enough; M-exchange-choice, -spot, -zone-enter, -story-closed, -reflection-done.
- Facts: all 40 in `FACTS` (`src/state/worldStore.ts`) are set by a rule (tested).

## Flow notes
- Merchant: crate-lift sets CRATE_CARRIED, SERVICE_OFFERED, serviceActs+1. Spot crate-drop sets GIFT_OFFERED. Spot merchant opens the gift.
- Child: CHILD_LISTENED means "the talk is done" (listen path or coin handed back). The give offer stays until CHILD_GIVEN.
- Beetle: let go sets BEETLE_RELEASED and ATTACHMENT_TRANSFORMED in one step (attachment -0.3).
- Finale: spot `finale` (hold) needs the 6 facts. It sets FINANCE_MVP_COMPLETE and FINALE_SEEN, then opens story finale/end. Choice finale-write opens panel prompt `enough`. Spot finale-reflect reopens it. Rule M-enough (signal reflection-done, id enough) sets ENOUGH_REFLECTION_SAVED.
- EXCHANGE_UNDERSTOOD: checked on choice, spot, zone-enter, story-closed, reflection-done. Set once.
- If give and receive were lived before the guide, the guide shows the `open` step and no tea (receive is already done).

## Verified
- `npm run typecheck`, `npm run lint`, `npm test` (164 tests, 25 files), `npm run build`: pass.
- New tests: `tests/mvp-stories.spec.ts`, `mvp-journey.spec.ts`, `narrative-data.spec.ts`, `content-mvp.spec.ts`, `state-mvp.spec.ts`, helper `mvp-harness.ts`.
- Orders proved to reach FINANCE_MVP_COMPLETE: (1) slice, beetle, guide tea, merchant, child, dark, giver, receiver, water; (2) stories first (receiver, dark, guide), reflection skipped, then beetle, water; (3) merchant and child first, water last; (4) all gifts declined except guide tea; (5) child walked away; (6) give through child only, service through crate. Order 1 also reloads after every step and keeps the exact state.
- No browser check was done. Nothing was run on a phone.

## Open issues and notes for the lead
- `tests/e2e/journey.spec.ts` line 108 expects "end of this first part". `strings.end` no longer says that. Update that line.
- R7 has no `signalId` (kept so old tests pass). It needs MONEY_REFLECTION_SAVED false, so an `enough` signal cannot trigger it. B2 may send id `money`.
- `src/creatures/beetle.ts` shows the beetle only for state `attached`. States observed, released, transformed need B4. `chainState` `free` needs B4 (inner feature shows the chain only for `attached`).
- `storyDone` takes `(state, storyId)`.
- Choices overlap in two places by design: child-give and child-keep appear in three steps.
