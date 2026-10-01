# WP-A4: Final asset swap (repeat per asset)

- Model: ChatGPT session model.
- Wave: later.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: see plan.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: diff = one registry entry + one GLB.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-A4.md and docs/decisions/WP-A4.md. State proof and open checks.
