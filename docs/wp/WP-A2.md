# WP-A2: Asset status doc + generation manifest (22 jobs, name conflicts)

- Model: ChatGPT session model.
- Wave: 0.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: see plan.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: all 22 jobs + conflicts listed; manifest matches 3D doc §11.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-A2.md and docs/decisions/WP-A2.md. State proof and open checks.
