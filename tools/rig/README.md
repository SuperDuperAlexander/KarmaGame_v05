# Local player rig v2

- Run from the project root.
- This uses the local proven rig and local Python math.
- It needs Python 3.9 or later.
- It does not need Blender or a paid job.
- It keeps the tested file unchanged.

```powershell
python tools/rig/generate_rig_v2.py
python tools/rig/validate_rig_v2.py --report tools/rig/validation-v2.json
python tools/rig/test_rig_v2.py
```

- Input: `character-rig-test/public/player_rigged_test.glb`.
- Output: `3D Models/assets/characters/player_rigged_v2.glb`.
- Clips: `Idle`, `Walk`, `Run`, `Interact`, `LookAround`.
- Walk fits 2.8 meters per second.
- Run fits 4.6 meters per second.
- `Interact` plays once. The other clips loop.
- Grips: `leftHandGrip`, `rightHandGrip`.
- Each grip is a child of its hand joint.
- Both grips use local position `(0, -0.04, 0.02)`.
- The file stays temporary.
- Short legs need fast steps at these game speeds.
- A person must check bends, foot slip and package grip in the game.
- The local check measures exported keys. It does not prove motion between keys in the game.
