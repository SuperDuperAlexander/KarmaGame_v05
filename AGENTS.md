# Work rules

- Use only ChatGPT models. The lead runs the work and checks each hand-off.
- Work only inside `D:\MyDrive\ALEXANDER\PROJEKTE\KarmaGame_v05`.
- Do not copy code from another project. Local rig code and npm packages are allowed.
- Read `GAME_MASTER_SPEC.md`, `Begin Vertical Slice v0.1.md`, `docs/PLAN.md`, and `docs/3D_ASSET_GENERATION_MASTER.md`.
- Stop game scope at the attached beetle. Do not build the later story.
- Keep free 3D movement. Keep game entities separate from visuals.
- Put all runtime asset paths in `src/assets/registry/`.
- Use deep Babylon imports. Load the glTF loader only when needed.
- Keep state, rules, save, reflection and narrative free of Babylon imports.
- Keep answers on the device. Never score them. Use plain text in the UI.
- The lead owns package files, contracts, app, scene shells, root HTML and this file.
- Each helper uses its own branch and worktree under `_worktrees/`.
- Use a junction from worktree `node_modules` to root `node_modules`.
- Edit only assigned files. Put changes to shared rules in the hand-off report.
- Write `docs/reports/WP-<id>.md` and `docs/decisions/WP-<id>.md`.
- Run type check, lint, unit tests and build before merge. The lead runs browser checks.
- Do not claim a phone check from a browser test. Do not mark an asset final without proof.
- Do not start paid asset jobs or copy newer models from other projects.
- Google Drive sync state is unknown. Keep workers at three or fewer. Use separate worktrees.

# User reports

- Use ASD-STE100 [Simplified Technical English].
- Use short bullets, small words and short sentences.
- Say what changed, which checks passed and what the user must do next.
- Expand short forms in brackets. Keep paths and commands exact.
