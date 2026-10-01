# WP-A1 decisions

- Added repeatable asset sync and binary GLB checks for header, chunks, accessors, geometry, texture sizes, nodes, clips and skins. Broken approved jobs fail the check.
- Use the frozen contract in `src/contracts/visual.ts`.
- Keep game roots separate from asset transforms.
- Use modern `LoadAssetContainerAsync` and `instantiateModelsToScene` for one source load per scene.
- Use deep imports. Load the glTF 2.0 loader only on first file use.
- Final art needs browser, shape and phone proof before approval.
