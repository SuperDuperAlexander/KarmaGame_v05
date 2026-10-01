"""Add local clips and hand sockets to the proven player rig. No remote tools."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "character-rig-test/public/player_rigged_test.glb"
OUTPUT = ROOT / "3D Models/assets/characters/player_rigged_v2.glb"
SEED = ROOT / "character-rig-test/rig_character.py"
CLIPS = ("Idle", "Walk", "Run", "Interact", "LookAround")

spec = importlib.util.spec_from_file_location("local_rig_seed", SEED)
assert spec and spec.loader
rig = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rig)


def read_checked(path: Path) -> tuple[dict, bytearray]:
    raw = path.read_bytes()
    if len(raw) < 28:
        raise ValueError("GLB is too short")
    magic, version, length = struct.unpack_from("<4sII", raw)
    if (magic, version, length) != (b"glTF", 2, len(raw)):
        raise ValueError("Invalid GLB header")
    offset, kinds = 12, []
    while offset < len(raw):
        if offset + 8 > len(raw):
            raise ValueError("Missing chunk header")
        size, kind = struct.unpack_from("<II", raw, offset)
        offset += 8
        if size % 4 or offset + size > len(raw):
            raise ValueError("Invalid GLB chunk")
        kinds.append(kind)
        offset += size
    if kinds != [0x4E4F534A, 0x004E4942]:
        raise ValueError("Expected JSON then binary chunks")
    return rig.read_glb(path)


def samples(duration: float, intervals: int = 64) -> list[float]:
    # At least 30 keys per second. Multiples of four retain exact contact marks.
    intervals = max(intervals, 4 * math.ceil(duration * 30 / 4))
    return [duration * i / intervals for i in range(intervals + 1)]


def idle_pose():
    rotations = {name: (0., 0., 0., 1.) for name, _, _ in rig.BONES}
    for side, sign in (("Left", 1), ("Right", -1)):
        rotations[side + "UpperArm"] = rig.shoulder(0, sign)
        rotations[side + "LowerArm"] = rig.elbow_rotation(.18, sign)
        rotations[side + "UpperLeg"] = rig.quat_axis((0, 0, 1), -sign * rig.LEG_INWARD)
        rotations[side + "Foot"] = rig.quat_axis((0, 0, 1), sign * rig.LEG_INWARD)
    hip = rig.BONES[rig.INDEX["Hips"]][2]
    leg = rig.BONES[rig.INDEX["LeftUpperLeg"]][2]
    foot = rig.BONES[rig.INDEX["LeftFoot"]][2]
    raise_y = (1-math.cos(rig.LEG_INWARD)) * (foot[1]-leg[1]) + math.sin(rig.LEG_INWARD) * (foot[0]-leg[0])
    return rotations, (hip[0], hip[1] + raise_y, hip[2])


def foot_path(cycle: float, reach: float, lift: float):
    u = cycle % 1
    if u <= .5:
        return .14, reach * (1-4*u)
    swing = (u-.5)*2
    # Same Hermite path as the tested rig, with matched lift-off/touchdown speed.
    z = (-reach * (2*swing**3-3*swing**2+1)
         -2*reach * (swing**3-2*swing**2+swing)
         +reach * (-2*swing**3+3*swing**2)
         -2*reach * (swing**3-swing**2))
    return .14 + lift * math.sin(math.pi*swing)**2, z


def locomotion(doc: dict, blob: bytearray, name: str, speed: float, reach: float, drop: float, lift: float):
    # Contact moves 2*reach in half a cycle. World motion supplies the speed.
    duration = 4*reach/speed
    times = samples(duration)
    rotations = {bone: [] for bone, _, _ in rig.BONES}
    hips = []
    origin = rig.BONES[rig.INDEX["Hips"]][2]
    for t in times:
        phase = 2*math.pi*t/duration
        swing = math.cos(phase)
        current, _ = idle_pose()
        current["Spine"] = rig.quat_axis((0, 1, 0), .025*swing)
        current["Chest"] = rig.quat_axis((0, 1, 0), -.04*swing)
        hip_drop = drop*swing*swing
        hips.append((.006*math.sin(phase), origin[1]-hip_drop, origin[2]))
        for side, sign in (("Left", 1), ("Right", -1)):
            cycle = t/duration + (0 if sign == 1 else .5)
            ankle_y, forward = foot_path(cycle, reach, lift)
            thigh, knee, foot = rig.leg_pose(side, hip_drop, ankle_y, forward)
            current[side+"UpperLeg"] = rig.quat_mul(rig.quat_axis((0, 0, 1), -sign*rig.LEG_INWARD), rig.quat_x(thigh))
            current[side+"LowerLeg"] = rig.quat_x(knee)
            current[side+"Foot"] = rig.quat_mul(rig.quat_x(foot), rig.quat_axis((0, 0, 1), sign*rig.LEG_INWARD))
            arm_swing = (.30 if name == "Walk" else .42)*sign*swing
            current[side+"UpperArm"] = rig.shoulder(arm_swing, sign)
            current[side+"LowerArm"] = rig.elbow_rotation((.30 if name == "Walk" else .55)+.06*sign*swing, sign)
        for bone in rotations:
            rotations[bone].append(current[bone])
    rig.write_clip(doc, blob, name, times, rotations, {"Hips": hips})
    doc["animations"][-1]["extras"] = {"loop": True, "authoredSpeed": speed, "halfReach": reach, "footLift": lift, "cycleDuration": duration, "stepsPerSecond": 2/duration, "rootMotion": False}


def action(doc: dict, blob: bytearray, name: str, duration: float):
    times = samples(duration)
    rotations = {bone: [] for bone, _, _ in rig.BONES}
    hips = []
    for t in times:
        pose, hip = idle_pose()
        progress = t/duration
        envelope = math.sin(math.pi*progress)**2
        if name == "Interact":
            pose["RightUpperArm"] = rig.shoulder(-.75*envelope, -1)
            pose["RightLowerArm"] = rig.elbow_rotation(.18+.65*envelope, -1)
            pose["Spine"] = rig.quat_x(.035*envelope)
            pose["Head"] = rig.quat_x(.08*envelope)
        else:
            yaw = math.sin(2*math.pi*progress)
            pose["Head"] = rig.quat_axis((0, 1, 0), .40*yaw)
            pose["Neck"] = rig.quat_axis((0, 1, 0), .10*yaw)
            pose["Spine"] = rig.quat_axis((0, 1, 0), .025*yaw)
        for bone in rotations:
            rotations[bone].append(pose[bone])
        hips.append(hip)
    rig.write_clip(doc, blob, name, times, rotations, {"Hips": hips})
    doc["animations"][-1]["extras"] = {"loop": name == "LookAround", "rootMotion": False}


def write_glb(doc: dict, blob: bytearray, output: Path):
    doc["buffers"][0]["byteLength"] = len(blob)
    raw = json.dumps(doc, separators=(",", ":")).encode()
    raw += b" "*(-len(raw) % 4)
    blob.extend(b"\0"*(-len(blob) % 4))
    size = 12+8+len(raw)+8+len(blob)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(struct.pack("<4sII", b"glTF", 2, size)+struct.pack("<II", len(raw), 0x4E4F534A)+raw+struct.pack("<II", len(blob), 0x004E4942)+blob)


def generate(output: Path = OUTPUT):
    if output.resolve() == SOURCE.resolve():
        raise ValueError("The proven source must stay unchanged")
    if not output.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError("Output must stay in this project")
    doc, blob = read_checked(SOURCE)
    assert [clip["name"] for clip in doc["animations"]] == ["Idle", "Walk"]
    assert len(doc["skins"][0]["joints"]) == 17
    doc["animations"] = [doc["animations"][0]]
    doc["animations"][0]["extras"] = {"loop": True, "rootMotion": False}
    nodes = {node["name"]: i for i, node in enumerate(doc["nodes"]) if "name" in node}
    for side, grip in (("Left", "leftHandGrip"), ("Right", "rightHandGrip")):
        assert grip not in nodes
        doc["nodes"][nodes[side+"Hand"]].setdefault("children", []).append(len(doc["nodes"]))
        doc["nodes"].append({"name": grip, "translation": [0, -.04, .02], "extras": {"purpose": "runtime hand socket", "review": "temporary; package grip needs visual check"}})
    locomotion(doc, blob, "Walk", 2.8, .31, .08, .10)
    locomotion(doc, blob, "Run", 4.6, .38, .13, .14)
    action(doc, blob, "Interact", 1.0)
    action(doc, blob, "LookAround", 3.0)
    doc["asset"]["generator"] = "KarmaGame tools/rig/generate_rig_v2.py; local tested rig seed"
    doc.setdefault("extras", {})["rigV2"] = {"status": "temporary", "sourceSHA256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "humanBendReview": False, "notes": "Short legs need fast steps at target speeds. Mesh, images and weights are unchanged."}
    write_glb(doc, blob, output)
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    result = generate(args.output)
    print(f"Wrote {result}; {result.stat().st_size} bytes; clips: {', '.join(CLIPS)}")
