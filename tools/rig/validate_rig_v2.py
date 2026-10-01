"""Validate file data, clips and contact math. This does not prove visual bends."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import struct

from generate_rig_v2 import CLIPS, OUTPUT, ROOT, SOURCE, read_checked, rig

SIZES = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
WIDTHS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT2": 4, "MAT3": 9, "MAT4": 16}


def data(doc, blob, index):
    item = doc["accessors"][index]
    view = doc["bufferViews"][item["bufferView"]]
    size = SIZES[item["componentType"]]*WIDTHS[item["type"]]
    start = view.get("byteOffset", 0)+item.get("byteOffset", 0)
    stride = view.get("byteStride", size)
    return b"".join(blob[start+i*stride:start+i*stride+size] for i in range(item["count"]))


def rotate(vector, quaternion):
    inverse = tuple(-n for n in quaternion[:3])+(quaternion[3],)
    return rig.quat_mul(rig.quat_mul(quaternion, (*vector, 0)), inverse)[:3]


def layout(doc, blob):
    assert doc["asset"]["version"] == "2.0"
    assert len(doc["buffers"]) == 1 and "uri" not in doc["buffers"][0]
    declared = doc["buffers"][0]["byteLength"]
    assert declared <= len(blob) <= declared+3
    for view in doc["bufferViews"]:
        assert view["buffer"] == 0
        assert isinstance(view["byteLength"], int) and view["byteLength"] >= 0
        assert 0 <= view.get("byteOffset", 0) <= declared
        assert view.get("byteOffset", 0)+view["byteLength"] <= declared
    for item in doc["accessors"]:
        assert "sparse" not in item
        assert isinstance(item["count"], int) and item["count"] > 0
        view = doc["bufferViews"][item["bufferView"]]
        width = SIZES[item["componentType"]]*WIDTHS[item["type"]]
        stride = view.get("byteStride", width)
        offset = item.get("byteOffset", 0)
        assert stride >= width and offset >= 0
        assert offset+(item["count"]-1)*stride+width <= view["byteLength"]
    parents = {}
    for index, node in enumerate(doc["nodes"]):
        for child in node.get("children", []):
            assert isinstance(child, int) and 0 <= child < len(doc["nodes"])
            assert child not in parents
            parents[child] = index
    for index in parents:
        trail = set()
        while index in parents:
            assert index not in trail, "Node cycle"
            trail.add(index)
            index = parents[index]
    for image in doc.get("images", []):
        assert "uri" not in image, "External image"
        assert image["bufferView"] < len(doc["bufferViews"])


def validate(output: Path = OUTPUT):
    source, original = read_checked(SOURCE)
    doc, blob = read_checked(output)
    layout(doc, blob)
    assert blob[:len(original)] == original, "Original mesh/image/weight bytes changed"
    for name in ("meshes", "materials", "images", "textures", "samplers", "skins"):
        assert doc.get(name) == source.get(name), f"Original {name} changed"
    assert [clip["name"] for clip in doc["animations"]] == list(CLIPS)
    assert doc["extras"]["rigV2"]["humanBendReview"] is False
    assert doc["extras"]["rigV2"]["sourceSHA256"] == hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    for field in ("channels", "samplers"):
        assert doc["animations"][0][field] == source["animations"][0][field], "Original Idle changed"
    names = {node.get("name"): index for index, node in enumerate(doc["nodes"])}
    for side, name in (("Left", "leftHandGrip"), ("Right", "rightHandGrip")):
        assert sum(node.get("name") == name for node in doc["nodes"]) == 1
        grip = names[name]
        assert grip in doc["nodes"][names[side+"Hand"]]["children"]
        assert doc["nodes"][grip]["translation"] == [0, -.04, .02]
        assert "mesh" not in doc["nodes"][grip] and "skin" not in doc["nodes"][grip]
    skin_nodes = set(doc["skins"][0]["joints"])
    assert len(skin_nodes) == 17
    primitive = doc["meshes"][0]["primitives"][0]
    weights = data(doc, blob, primitive["attributes"]["WEIGHTS_0"])
    joints = data(doc, blob, primitive["attributes"]["JOINTS_0"])
    assert len(joints) == len(weights)
    assert all(joint < 17 for joint in joints)
    assert all(sum(weights[i:i+4]) == 255 for i in range(0, len(weights), 4))
    assert all(any(joints[i+k] == bone and weights[i+k] for i in range(0, len(joints), 4) for k in range(4)) for bone in range(17))
    result = {"status": "temporary", "humanBendReview": False, "sourceSHA256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "outputSHA256": hashlib.sha256(output.read_bytes()).hexdigest(), "bytes": output.stat().st_size, "bones": 17, "vertices": doc["accessors"][primitive["attributes"]["POSITION"]]["count"], "triangles": doc["accessors"][primitive["indices"]]["count"]//3, "materials": len(doc["materials"]), "grips": ["leftHandGrip", "rightHandGrip"], "clips": []}
    for clip in doc["animations"]:
        targets = {(channel["target"]["node"], channel["target"]["path"]) for channel in clip["channels"]}
        assert len(targets) == len(clip["channels"]), "Duplicate tracks"
        assert all((node, "rotation") in targets for node in skin_nodes), "Missing reset track"
        assert all(node in skin_nodes and path in ("rotation", "translation") for node, path in targets)
        curves, time_keys = {}, None
        for channel in clip["channels"]:
            sample = clip["samplers"][channel["sampler"]]
            assert sample.get("interpolation", "LINEAR") == "LINEAR"
            times = [t[0] for t in struct.iter_unpack("<f", data(doc, blob, sample["input"]))]
            assert times[0] == 0 and all(math.isfinite(t) for t in times)
            assert all(b > a for a, b in zip(times, times[1:]))
            if time_keys is None:
                time_keys = times
            assert time_keys == times, "Different clip clocks"
            path = channel["target"]["path"]
            values = list(struct.iter_unpack("<4f" if path == "rotation" else "<3f", data(doc, blob, sample["output"])))
            assert len(values) == len(times)
            assert all(math.isfinite(value) for row in values for value in row)
            if path == "rotation":
                assert all(abs(sum(q*q for q in row)-1) < 1e-5 for row in values), "Bad quaternion"
            else:
                assert channel["target"]["node"] == names["Hips"], "Unexpected movement track"
                assert max(row[0] for row in values)-min(row[0] for row in values) < .013
                assert max(row[2] for row in values)-min(row[2] for row in values) < 1e-6, "Root travel"
            # Both action clips also end at their start pose for a clean fade.
            assert max(abs(a-b) for a, b in zip(values[0], values[-1])) < 1e-6, "Loop or action has a jump"
            curves[(channel["target"]["node"], path)] = values
        assert time_keys is not None
        assert clip["extras"]["loop"] is (clip["name"] != "Interact")
        if clip["name"] != "Idle":
            assert max(b-a for a, b in zip(time_keys, time_keys[1:])) <= 1/30+.00001
        details = {"name": clip["name"], "seconds": time_keys[-1], "keys": len(time_keys), "loop": clip["extras"]["loop"]}
        for side in ("Left", "Right"):
            elbows = curves[(names[side+"LowerArm"], "rotation")]
            assert all(q[0] < 0 for q in elbows), "An elbow bends backwards"
        if clip["name"] == "Interact":
            shoulders = curves[(names["RightUpperArm"], "rotation")]
            assert max(abs(row[0]) for row in shoulders) > .3, "Interact has no reach"
            assert max(abs(row[0]) for row in curves[(names["RightLowerArm"], "rotation")]) > .3, "Interact has no elbow action"
        if clip["name"] in ("Walk", "Run"):
            expected = 2.8 if clip["name"] == "Walk" else 4.6
            reach = clip["extras"]["halfReach"]
            assert clip["extras"]["authoredSpeed"] == expected
            assert abs(4*reach/time_keys[-1]-expected) < .00001
            max_knee, max_error = 0., 0.
            for side, phase in (("Left", 0), ("Right", .5)):
                bone_ids = [names[side+part] for part in ("UpperLeg", "LowerLeg", "Foot")]
                hip, knee, foot = [rig.BONES[rig.INDEX[side+part]][2] for part in ("UpperLeg", "LowerLeg", "Foot")]
                for i, hips in enumerate(curves[(names["Hips"], "translation")]):
                    upper, lower, boot = [curves[(node, "rotation")][i] for node in bone_ids]
                    knee_angle = 2*math.atan2(lower[0], lower[3])
                    assert 0 <= knee_angle < math.radians(110), "Bad knee angle"
                    max_knee = max(max_knee, knee_angle)
                    lower_world = rig.quat_mul(upper, lower)
                    boot_world = rig.quat_mul(lower_world, boot)
                    assert max(abs(v) for v in boot_world[:3]) < 1e-5, "Boot sole tilts"
                    link1 = rotate(tuple(knee[k]-hip[k] for k in range(3)), upper)
                    link2 = rotate(tuple(foot[k]-knee[k] for k in range(3)), lower_world)
                    ankle = tuple(hip[k]+hips[k]-rig.BONES[rig.INDEX["Hips"]][2][k]+link1[k]+link2[k] for k in range(3))
                    assert .08 < abs(ankle[0]) < .12
                    assert ankle[1] >= .13999, "Foot below floor"
                    cycle = (i/(len(time_keys)-1)+phase) % 1
                    if cycle <= .5:
                        error = abs(ankle[2]-(hip[2]+reach*(1-4*cycle)))
                        max_error = max(max_error, error, abs(ankle[1]-.14))
                        assert max_error < 1e-5, "Bad exported stance contact"
                    if abs(cycle-.75) < 1e-6:
                        assert ankle[1] > .23, "Swing does not clear floor"
            details.update(authoredSpeed=expected, halfReach=reach, stepsPerSecond=2/time_keys[-1], maxKneeDegrees=math.degrees(max_knee), maxContactError=max_error)
        result["clips"].append(details)
    assert max(abs(q[1]) for q in curves[(names["Head"], "rotation")]) > .15, "LookAround has no head turn"
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=OUTPUT)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    report = validate(args.input)
    text = json.dumps(report, indent=2)
    if args.report:
        if not args.report.resolve().is_relative_to(ROOT.resolve()):
            raise ValueError("Report must stay in this project")
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(text+"\n", encoding="utf-8")
    print(text)
