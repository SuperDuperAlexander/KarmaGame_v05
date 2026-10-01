# WP-18a: Slice rule data + headless journey test

- Model: ChatGPT session model.
- Wave: 2.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: 02.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: journey passes in both orders (tree first / market first); one wave after reload.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-18a.md and docs/decisions/WP-18a.md. State proof and open checks.
