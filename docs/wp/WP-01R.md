# WP-01R: Contract review → tag `contracts-v1`

- Model: ChatGPT session model.
- Wave: 0.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: 01.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: review notes fixed, tag set.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-01R.md and docs/decisions/WP-01R.md. State proof and open checks.
