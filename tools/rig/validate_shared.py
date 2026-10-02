"""Validate the shared-rig characters: file data, limits, clips, contact math.

This does not prove visual bends. A person must check them in the game.
    python tools/rig/validate_shared.py --report tools/rig/validation-shared.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import struct

import fit_marks as fm
from generate_rig_v2 import ROOT, read_checked, rig
from rig_shared import CLIPS, Body, load_marks, player_rig_with
from validate_rig_v2 import data, layout

BONE_NAMES = [b[0] for b in rig.BONES]


def rotate(vector, q):
    return rig.quat_mul(rig.quat_mul(q, (*vector, 0)), tuple(-n for n in q[:3]) + (q[3],))[:3]


def validate(name: str, output: Path | None = None):
    marks = load_marks(name)
    source_path = fm.CHAR_DIR / marks["source"]
    output = output or fm.CHAR_DIR / marks["output"]
    source, original = read_checked(source_path)
    doc, blob = read_checked(output)
    layout(doc, blob)
    assert output.stat().st_size <= 3 * 1024 * 1024, "File is over 3 MB"
    assert blob[:len(original)] == original, "Original mesh/image bytes changed"
    stripped = json.loads(json.dumps(doc["meshes"]))
    for item in stripped[0]["primitives"]:
        item["attributes"].pop("JOINTS_0"), item["attributes"].pop("WEIGHTS_0")
    assert stripped == source["meshes"], "Original meshes changed"
    for key in ("materials", "images", "textures", "samplers"):
        assert doc.get(key) == source.get(key), f"Original {key} changed"
    extras = doc["extras"]["rigShared"]
    assert extras["humanBendReview"] is False and extras["status"] == "temporary"
    assert extras["sourceSHA256"] == hashlib.sha256(source_path.read_bytes()).hexdigest()
    assert extras["marks"] == {k: list(v) for k, v in marks["marks"].items()}, "Marks file changed; run rig_shared.py again"
    assert [c["name"] for c in doc["animations"]] == list(CLIPS)
    names = {node.get("name"): i for i, node in enumerate(doc["nodes"])}
    # Same bones, same names, same parents as the player rig.
    skin = doc["skins"][0]
    assert [doc["nodes"][j]["name"] for j in skin["joints"]] == BONE_NAMES
    assert len(skin["joints"]) == 17 <= 45
    for bone, parent, _ in rig.BONES:
        if parent:
            assert names[bone] in doc["nodes"][names[parent]]["children"], f"Bad parent {bone}"
    for side, grip in (("Left", "leftHandGrip"), ("Right", "rightHandGrip")):
        assert sum(n.get("name") == grip for n in doc["nodes"]) == 1
        assert names[grip] in doc["nodes"][names[side + "Hand"]]["children"]
        node = doc["nodes"][names[grip]]
        assert "mesh" not in node and "skin" not in node
    assert not any("scale" in n for n in doc["nodes"]), "Scale on a node"
    primitive = doc["meshes"][0]["primitives"][0]
    weights = data(doc, blob, primitive["attributes"]["WEIGHTS_0"])
    joints = data(doc, blob, primitive["attributes"]["JOINTS_0"])
    assert len(joints) == len(weights)
    assert all(j < 17 for j in joints)
    assert all(sum(weights[i:i + 4]) == 255 for i in range(0, len(weights), 4))
    used = {joints[i + k] for i in range(0, len(joints), 4) for k in range(4) if weights[i + k]}
    assert used == set(range(17)), "A bone has no weight"
    body = Body(marks)
    result = {"character": name, "file": output.name, "status": "temporary", "humanBendReview": False,
              "sourceSHA256": extras["sourceSHA256"], "outputSHA256": hashlib.sha256(output.read_bytes()).hexdigest(),
              "bytes": output.stat().st_size, "bones": 17,
              "vertices": doc["accessors"][primitive["attributes"]["POSITION"]]["count"],
              "triangles": doc["accessors"][primitive["indices"]]["count"] // 3,
              "weightsPerVertex": 4, "materials": len(doc["materials"]), "measuredHeight": marks["measuredHeight"],
              "targetHeight": marks["targetHeight"], "legScale": body.k, "grips": ["leftHandGrip", "rightHandGrip"], "clips": []}
    ankle = body.ankle_y
    skin_nodes = set(skin["joints"])
    for clip in doc["animations"]:
        targets = {(c["target"]["node"], c["target"]["path"]) for c in clip["channels"]}
        assert len(targets) == len(clip["channels"]), "Duplicate tracks"
        assert all((n, "rotation") in targets for n in skin_nodes), "Missing reset track"
        assert all(n in skin_nodes and p in ("rotation", "translation") for n, p in targets), "Scale or foreign track"
        curves, time_keys = {}, None
        for channel in clip["channels"]:
            sample = clip["samplers"][channel["sampler"]]
            assert sample.get("interpolation", "LINEAR") == "LINEAR"
            times = [t[0] for t in struct.iter_unpack("<f", data(doc, blob, sample["input"]))]
            assert times[0] == 0 and all(math.isfinite(t) for t in times)
            assert all(b > a for a, b in zip(times, times[1:]))
            time_keys = time_keys or times
            assert time_keys == times, "Different clip clocks"
            path = channel["target"]["path"]
            values = list(struct.iter_unpack("<4f" if path == "rotation" else "<3f", data(doc, blob, sample["output"])))
            assert len(values) == len(times) and all(math.isfinite(v) for row in values for v in row)
            if path == "rotation":
                assert all(abs(sum(q * q for q in row) - 1) < 1e-5 for row in values), "Bad quaternion"
            else:
                assert channel["target"]["node"] == names["Hips"], "Unexpected movement track"
                assert max(r[0] for r in values) - min(r[0] for r in values) < .013 * body.k + 1e-6
                assert max(r[2] for r in values) - min(r[2] for r in values) < 1e-6, "Root travel"
            assert max(abs(a - b) for a, b in zip(values[0], values[-1])) < 1e-6, "Loop or action has a jump"
            curves[(channel["target"]["node"], path)] = values
        assert clip["extras"]["loop"] is (clip["name"] != "Interact")
        assert clip["extras"]["rootMotion"] is False
        if clip["name"] != "Idle":
            assert max(b - a for a, b in zip(time_keys, time_keys[1:])) <= 1 / 30 + .00001, "Under 30 keys per second"
        details = {"name": clip["name"], "seconds": time_keys[-1], "keys": len(time_keys), "loop": clip["extras"]["loop"]}
        for side in ("Left", "Right"):
            assert all(q[0] < 0 for q in curves[(names[side + "LowerArm"], "rotation")]), "An elbow bends backwards"
        if clip["name"] == "Interact":
            assert max(abs(r[0]) for r in curves[(names["RightUpperArm"], "rotation")]) > .3, "Interact has no reach"
            assert max(abs(r[0]) for r in curves[(names["RightLowerArm"], "rotation")]) > .3
        if clip["name"] in ("Walk", "Run"):
            expected = 2.8 if clip["name"] == "Walk" else 4.6
            ex = clip["extras"]
            reach = ex["halfReach"]
            assert ex["authoredWorldSpeed"] == expected
            assert abs(ex["authoredSpeed"] * body.norm - expected) < 1e-9
            assert abs(4 * reach / time_keys[-1] - ex["authoredSpeed"]) < 1e-6
            assert abs(reach - (.31 if clip["name"] == "Walk" else .38) * body.k) < 1e-9, "Reach does not scale with leg length"
            max_knee = max_error = 0.
            with player_rig_with(marks["marks"], body):
                for side, phase in (("Left", 0), ("Right", .5)):
                    ids = [names[side + p] for p in ("UpperLeg", "LowerLeg", "Foot")]
                    hip, knee, foot = [rig.BONES[rig.INDEX[side + p]][2] for p in ("UpperLeg", "LowerLeg", "Foot")]
                    hips0 = rig.BONES[rig.INDEX["Hips"]][2]
                    stance_x = None
                    for i, hips in enumerate(curves[(names["Hips"], "translation")]):
                        upper, lower, boot = [curves[(n, "rotation")][i] for n in ids]
                        knee_angle = 2 * math.atan2(lower[0], lower[3])
                        assert 0 <= knee_angle < math.radians(110), "Bad knee angle"
                        max_knee = max(max_knee, knee_angle)
                        lower_world = rig.quat_mul(upper, lower)
                        boot_world = rig.quat_mul(lower_world, boot)
                        assert max(abs(v) for v in boot_world[:3]) < 1e-5, "Boot sole tilts"
                        l1 = rotate(tuple(knee[k] - hip[k] for k in range(3)), upper)
                        l2 = rotate(tuple(foot[k] - knee[k] for k in range(3)), lower_world)
                        pos = tuple(hip[k] + hips[k] - hips0[k] + l1[k] + l2[k] for k in range(3))
                        assert pos[1] >= ankle - 1e-5, "Foot below floor"
                        stance_x = pos[0] if stance_x is None else stance_x
                        assert abs(pos[0] - stance_x) < .013 * body.k + 1e-4, "Feet wander sideways"
                        cycle = (i / (len(time_keys) - 1) + phase) % 1
                        if cycle <= .5:
                            err = abs(pos[2] - (hip[2] + reach * (1 - 4 * cycle)))
                            max_error = max(max_error, err, abs(pos[1] - ankle))
                            assert max_error < 1e-5, "Bad exported stance contact"
                        if abs(cycle - .75) < 1e-6:
                            assert pos[1] > ankle + .05 * body.k, "Swing does not clear floor"
            details.update(authoredWorldSpeed=expected, halfReach=reach, stepsPerSecond=2 / time_keys[-1],
                           maxKneeDegrees=math.degrees(max_knee), maxContactError=max_error)
        result["clips"].append(details)
    assert max(abs(q[1]) for q in curves[(names["Head"], "rotation")]) > .15, "LookAround has no head turn"
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("names", nargs="*")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    reports = [validate(n) for n in (args.names or fm.CHARACTERS)]
    text = json.dumps(reports, indent=2)
    if args.report:
        assert args.report.resolve().is_relative_to(ROOT.resolve())
        args.report.write_text(text + "\n", encoding="utf-8")
    print(text if args.names else f"{len(reports)} characters pass")
