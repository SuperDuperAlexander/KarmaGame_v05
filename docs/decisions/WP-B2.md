# WP-B2 decisions

- The story panel is a dialog on the modal backdrop. It is top-aligned with 170 px free at the bottom. This keeps the touch stick clear.
- Leave closes the panel first, then sends `story-closed`. So the panel never stays open if no rule answers.
- Choice buttons stay enabled after a press. The rule engine decides the next step.
- Slice zones stay in code. They send the old signals, and the old rules need them. Data zones add to them.
- Data spots replace the slice spots when the list is not empty. A mixed list would give two prompts on one place.
- The nearest spot wins when two spots overlap.
- The wave tone is an extra optional argument on the wave service. No contract change was made. The lead can add it later.
- The hint is set after every dispatch from `nextHint`. A `hint` effect from a rule can still set text after it.
- Story effect code is in `src/ui/storyEffects.ts` so it can be tested without the engine.
- Fake DOM in `tests/ui-story.spec.ts` because the project has no jsdom.
