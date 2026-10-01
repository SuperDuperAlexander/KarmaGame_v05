# WP-19b: E2E journeys desktop + mobile

- Model: ChatGPT session model.
- Wave: 3.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: 18b, 19a.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: 15 steps with real input; one wave after reload; beetle `attached`; 0 errors; no network POST.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-19b.md and docs/decisions/WP-19b.md. State proof and open checks.
