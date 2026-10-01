# WP-19b: Full browser journey

## Final merged run (2026-10-02)

- All six browser checks passed in 4.8 minutes after the final view fixes.
- All four full cases now keep state, speed and end-view files in `docs/evidence/`.
- Normal desktop steady samples used at most 43 draw calls and 74,819 triangles.
- Normal touch steady samples used at most 25 draw calls and 66,194 triangles.
- No case had a page error, console error or POST [send-data] request.
- `docs/evidence/journey-summary.json` holds the final case totals.
- Earlier run numbers and pending rerun notes below are history.
- The final run used a PC graphics chip.
- Real phone checks remain open.

- Added `tests/e2e/journey.spec.ts`.
- The suite runs normal and placeholder assets on desktop and a 390 by 844 touch screen.
- The test receives the package, enters the city, finds the tree and holds to enter the inner world.
- It opens reflection with Act. It saves literal text with angle brackets.
- It reloads and checks saved words, world and position.
- It returns, visits the market and checks exactly one thought wave.
- It enters the inner world again and checks the attached beetle and all eight facts.
- It checks attachment at 0.45 and eight steps per world change.
- The final reload must keep facts and words. It must show no new wave.
- Tests check for page errors, console errors and POST [send-data] network requests.
- The test saves an end screenshot and a read-only state report.
- Type check, lint, 71 unit tests and build passed on the merged source.
- All four full journeys passed with native Intel Iris Xe D3D11 [Direct3D 11]. Each took about one minute.
- Desktop placeholder final view: 59.9 FPS [frames per second], 24 draw calls, 10,622 triangles.
- Touch placeholder final view: 60.0 FPS, 20 draw calls, 7,342 triangles.
- Desktop normal final view: 59.9 FPS, 17 draw calls, 46,676 triangles.
- Touch normal final view: 60.0 FPS, 16 draw calls, 43,676 triangles.
- Normal city and market views stayed near 58 to 60 FPS. Their highest sample had 43 draw calls and 74,819 triangles.
- Cold arrival reads ran before steady frame data. Do not use them as a steady speed check.
- The normal touch journey checked that the cached second inner switch took no more than two seconds.
- Every case had zero page errors, zero console errors and zero POST requests.
- Normal cases kept `attached-beetle.png`, `final-read.json` and `zone-stats.json` in separate `test-results` folders.
- First placeholder runs kept end screenshots and console metrics. The final whole-suite run must keep their JSON [JavaScript Object Notation] files too.
- Test-only final view now stops at `(5.5, -2.4)` so the player does not cover the beetle.
- The lead must rerun the whole suite after final visual fixes.
- Native desktop graphics and a browser touch screen do not prove real phone speed.
