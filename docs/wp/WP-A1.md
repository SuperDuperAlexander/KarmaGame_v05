# WP-A1: Asset validator + sync (seed: `check_asset.py`)

- Model: ChatGPT session model.
- Wave: 1.
- Read: AGENTS.md, GAME_MASTER_SPEC.md, docs/PLAN.md, docs/3D_ASSET_GENERATION_MASTER.md.
- Needs: see plan.
- Ownership: use the module map in docs/PLAN.md. Lead owns shared files.
- Use the types in src/contracts. Report a needed change before changing them.
- Scope: the slice ends at the attached beetle.
- Done when: `assets:sync` idempotent; `assets:check` prints table, non-zero exit on broken `final` asset.
- Checks: npm run typecheck; npm run lint; npm test; npm run build. Add browser or asset checks where needed.
- Hand-off: docs/reports/WP-A1.md and docs/decisions/WP-A1.md. State proof and open checks.
