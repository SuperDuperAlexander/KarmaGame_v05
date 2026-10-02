# Common rules for WP-31 to WP-38

- Read first: `AGENTS.md` (work rules), `docs/PLAN_FINISH.md` (current plan and model use), `GAME_MASTER_SPEC.md` §8, §9, §15, §16, `docs/PLAN.md` (layout and architecture AD-1 to AD-14).
- Concept art (look at it): project root `ChatGPT Image 1 Oct 2026, 15_47_*.png`.
- Scope: the slice ends at the attached beetle. Do not add later story.
- Edit only the files you own. Need another change? Write it in your report. The lead decides.
- Do not change gameplay coordinates, rules, state, save or player text.
- Checks before hand-off: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Run `npm run assets:sync` before browser work. Run `npm run test:e2e` when you change visuals or load code.
- Commit on your branch with prefix `WP-<id>:`. Do not merge. Do not push.
- Hand-off: `docs/reports/WP-<id>.md` (done, how verified, open issues, numbers) and `docs/decisions/WP-<id>.md`.
- Never claim a phone check. Never mark an asset `final`. Use `temporary`.
- Write reports in ASD-STE100 style: short sentences, small words.
