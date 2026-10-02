# WP-B2: Story panel, data-driven spots and zones, app wiring

- Model: Claude Sonnet. Wave 1 of Phase B. Needs: WP-B0 (done). Runs in parallel with WP-B1.
- Read first: `docs/wp/_COMMON_FINISH.md`, `docs/PLAN_MVP.md`, `GAME_MASTER_SPEC.md` §3, §10.2, §11.3, §11.4, `AGENTS.md` (scope stop lifted for Phase B by the user on 2026-10-02).
- Read the contracts: `src/contracts/ui.ts`, `src/contracts/story.ts`, `src/contracts/state.ts`, `src/contracts/visual.ts` (`WorldView.act`, `WorldView.actorPosition`), `src/content/places.ts`, `src/narrative/index.ts` (stub surface from the lead; WP-B1 fills it with real data under the same names).
- Owns: `src/ui/`, `src/interaction/`, `src/app/app.ts` (lead grant: effect wiring, commands, hints; keep the boot, save and transition flow), `src/thought-waves/` (actor position and tone only), tests `tests/ui*.spec.ts`, `tests/interaction*.spec.ts`, `tests/waves*.spec.ts`.
- Do not edit narrative, state, rules, strings, world or contract files. Need a new string? Use a clear temporary label in your own file and list it in the report; WP-B1 owns `strings.en.ts`.

## Tasks

1. Story panel in `src/ui/`: shows `StoryView` (speaker, up to 3 lines, choice buttons, a "Leave" button). Plain text only (`textContent`). Buttons at least 48×48 CSS px, inside safe areas, never over the touch stick. Keys: `1`–`3` choose, `E` picks the first choice, `Esc` leaves. Input to the player is locked while the panel is open (use the existing input lock). Focus handling and `aria` roles like the reflection panel. Reduced motion: no slide.
2. `ui.story(view|null)` implements the contract. `UiCommands.choose` and `leaveStory` already dispatch `choice` and `story-closed` in `app.ts`; keep that. Send the open story id with `story-closed` as `id`.
3. Interaction: replace the hard-coded spots and zones in `src/interaction/interaction.ts` with the data from `src/narrative/index.ts` (`spots`, `zones`) and `src/content/places.ts`, evaluated with `matchesCondition` from `src/rules/ruleEngine.ts`. Press spots send `{type: spot.signal, id: spot.signalId ?? spot.id}`; zones send `{type:'zone-enter', id}`. While the stub lists are empty, keep today's slice spots and zones working (fallback to the current behaviour), so the slice e2e passes before WP-B1 merges.
4. `app.ts` effect wiring: `story` → build `StoryView` from `stories[story].steps[step]` and `speakerNames`, call `ui.story`; `story-end` → `ui.story(null)`; `act` → `manager.current.world.act?.(actor, action)`; `wave` with `actor` → position from `world.actorPosition?.(actor)`, colour by `tone` (spec §10.2: attachment warm gold, fear cold blue-violet, service soft green or warm white); `counter` is applied by the rule engine (check; if not, report it); `panel` with `prompt:'enough'` → reflection panel with the enough question, saved under prompt id `enough`, then dispatch `{type:'reflection-done', id: prompt}`. Money reflection keeps `id:'money'`.
5. Hints: replace `hintFor` in `app.ts` with `nextHint(state, world)` from `src/narrative/index.ts`. Update the hint after every rule run, not only on scene change.
6. The rule engine must apply `counter` effects to `state.counters` — this is in `src/rules/` (WP-B1). If it is missing, report it; do not edit it.

## Done when

- Unit tests for the panel (plain text, button size, keys, leave), data-driven spots and zones (enter once per crossing, condition gating), and the effect wiring with a fake world.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass.
- `npm run test:e2e` passes (slice journeys, desktop and touch), with your own `LW_PORT`.
- Commit on your branch with prefix `WP-B2:`.
