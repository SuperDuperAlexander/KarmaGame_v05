# Light Within v0.1

- All work uses ChatGPT agents.
- The first part ends at the attached beetle.
- Final art is not ready.
- The game uses local test models and code shapes.
- Saved words stay on this device.
- The game does not score your words.

## Play

- Open PowerShell in `D:\MyDrive\ALEXANDER\PROJEKTE\KarmaGame_v05`.
- Run `npm ci` on a new copy.
- Run `npm run assets:sync`.
- Run `npm run dev`.
- Open `http://127.0.0.1:5186/`.
- Use `W`, `A`, `S` and `D` to move.
- Hold `Shift` to run.
- Drag the view to turn the camera.
- Press `E` at a prompt.
- Hold `E` at the tree light to change worlds.
- Press `Esc` to pause.
- On a phone, first touch the view to show the stick.
- Use `Run` and `Act` on the right.
- Hold `Act` at the tree light to change worlds.
- Use `Simple` if the view is slow.

## First part

1. Take the package at the stone.
2. Go through the gate.
3. Go to the tree light.
4. Hold to look within.
5. Go to the package by the root.
6. Press `Reflect`.
7. Write your words and press `Save`, or press `Skip`.
8. Go to the light by the trunk.
9. Hold to return.
10. Go to the market, to the right of the tree.
11. Act at the shining object.
12. See the thought.
13. Go back to the tree light.
14. Hold to look within.
15. See the beetle on the right.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run assets:check`
- `npm run test:e2e`

- Browser tests use real keys and touch.
- The read-only test hook cannot change game state.
- Windows tests use the PC graphics chip.
- Set `$env:LW_SOFTWARE='1'` before a browser test to use software graphics.
- Software speed is not phone speed.

## Phone check still needed

- Use the same Wi-Fi as this PC.
- Keep `npm run dev` open.
- Open `http://192.168.0.160:5186/?debug` on the phone.
- This address was read from Vite in this run.
- It can change when the PC joins another network.
- Play the whole first part.
- Check the camera at a wall.
- Check `Save` and reload.
- Check the new walk and run bends.
- Record the phone name and speed in `docs/reports/WP-20.md`.
- The phone target is 30 frames per second.
- This check has not been done.

## Local tools

- `?debug` shows frame speed and draw counts.
- `?viewer` lists assets and missing mapped names.
- `?assets=placeholder` forces all code shapes.
- `?safe` starts with simple effects.
- `?test` adds the read-only hook in the dev build.
- The production build has no test hook.
- Drop model files in `3D Models/assets/`.
- Change the matching entry in `src/assets/registry/index.ts`.
- Run `npm run assets:sync` after a model change.
- `python tools/rig/generate_rig_v2.py` rebuilds the local rig.
- `python tools/rig/validate_rig_v2.py` checks that rig.

## Work record

- Active plan: `docs/PLAN.md`.
- Task list: `docs/work-packages.json`.
- Task briefs: `docs/wp/`.
- Task reports: `docs/reports/`.
- Main choices: `DEVELOPMENT_DECISIONS.md`.
- Art status: `docs/assets/ASSET_STATUS.md`.
- Final part report: `docs/reports/WP-22.md`.
