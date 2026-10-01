# WP-19a: E2E harness + autopilot (real keys) + smoke test

- Model: ChatGPT session model.
- Wave: 2.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: 07.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: harness + smoke pass desktop + mobile viewport.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-19a.md and docs/decisions/WP-19a.md. State proof and open checks.
