# WP-19a: Browser test driver and smoke check

- Added `tests/e2e/driver.ts` and `tests/e2e/smoke.spec.ts`.
- The driver reads only `window.__lw.read()`.
- Movement uses real key events or browser touch events. It never sets game state or save data.
- The touch path uses two fingers for Move and Run. Act uses a separate press or hold.
- Steering reads the camera direction. It slows touch input near each target.
- The driver checks the stopped position. It reports a blocked path with its coordinates.
- Holds keep real input down until the world changes. This supports slow software rendering.
- The smoke check covers boot, movement, touch target size, pause, inert controls and resume.
- Type check, lint, 71 unit tests and build passed on the merged source.
- Desktop and touch smoke checks passed with native Intel Iris Xe D3D11 [Direct3D 11].
- The two smoke checks took 11.4 seconds in one serial run.
- Earlier runs used slow software rendering and active hot reload. The final checks used stable root code.
- No page or console error occurred in the two smoke checks.
- A browser touch check is not a real phone check.
