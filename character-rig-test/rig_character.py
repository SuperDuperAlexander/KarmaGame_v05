"""Make a small glTF skin and two test clips for the supplied A-pose model.

This is a fixed-landmark proof of concept, not a general humanoid detector.
No Blender or third-party Python packages are needed.
"""
from __future__ import annotations

import json
import math
import struct
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "player_simple_opt.glb"
OUTPUT = HERE / "public" / "player_rigged_test.glb"

# Metres. The model faces +Z and has its feet at Y=0.
# A person checked these joint marks against the source model once.
BONES = [
    ("Hips", None, (0.00, 0.91, 0.06)),
    ("Spine", "Hips", (0.00, 1.05, 0.04)),
    ("Chest", "Spine", (0.00, 1.23, 0.04)),
    ("Neck", "Chest", (0.00, 1.37, 0.07)),
    ("Head", "Neck", (0.00, 1.48, 0.11)),
    ("LeftUpperArm", "Chest", (0.18, 1.26, 0.06)),
    ("LeftLowerArm", "LeftUpperArm", (0.30, 1.04, 0.07)),
    ("LeftHand", "LeftLowerArm", (0.40, 0.79, 0.09)),
    ("RightUpperArm", "Chest", (-0.18, 1.26, 0.06)),
    ("RightLowerArm", "RightUpperArm", (-0.30, 1.04, 0.07)),
    ("RightHand", "RightLowerArm", (-0.40, 0.79, 0.09)),
    ("LeftUpperLeg", "Hips", (0.11, 0.88, 0.105)),
    ("LeftLowerLeg", "LeftUpperLeg", (0.15, 0.49, 0.075)),
    ("LeftFoot", "LeftLowerLeg", (0.16, 0.14, 0.035)),
    ("RightUpperLeg", "Hips", (-0.11, 0.88, 0.105)),
    ("RightLowerLeg", "RightUpperLeg", (-0.15, 0.49, 0.075)),
    ("RightFoot", "RightLowerLeg", (-0.16, 0.14, 0.035)),
]
INDEX = {b[0]: i for i, b in enumerate(BONES)}
WALK_DURATION = .96
STEP_REACH = .31
LEG_INWARD = .09


def clamp01(v: float) -> float:
    return max(0.0, min(1.0, v))


def smooth(a: float, b: float, x: float) -> float:
    t = clamp01((x - a) / (b - a))
    return t * t * (3.0 - 2.0 * t)


def between(points: list[tuple[str, float]], x: float) -> dict[str, float]:
    """Two neighbouring bones; x grows from the first mark to the last."""
    if x <= points[0][1]:
        return {points[0][0]: 1.0}
    for (name_a, a), (name_b, b) in zip(points, points[1:]):
        if x <= b:
            t = smooth(a, b, x)
            return {name_a: 1.0 - t, name_b: t}
    return {points[-1][0]: 1.0}


def weights(x: float, y: float, z: float) -> tuple[bytes, bytes]:
    side = "Left" if x >= 0 else "Right"
    ax = abs(x)
    body = between([
        ("Hips", 0.94), ("Spine", 1.06), ("Chest", 1.22),
        ("Neck", 1.38), ("Head", 1.47),
    ], y)
    # Rigid thigh/shin shafts. Only the joint areas blend between bones.
    # The boots stay on the foot bone, below the ankle blend.
    ankle = smooth(.18, .24, y)
    knee = smooth(.43, .55, y)
    hip = smooth(.83, .96, y)
    leg = {side + "Foot": 1 - ankle,
           side + "LowerLeg": ankle * (1 - knee),
           side + "UpperLeg": ankle * knee * (1 - hip),
           "Hips": ankle * knee * hip}
    # Blend only near the elbow and wrist, along the A-pose arm axis.
    progress = ((ax - .18) * .22 + (1.26 - y) * .47 + (z - .06) * .03) / (.22**2 + .47**2 + .03**2)
    elbow = smooth(.40, .57, progress)
    wrist = smooth(.92, 1.04, progress)
    arm = {side + "UpperArm": 1 - elbow,
           side + "LowerArm": elbow * (1 - wrist), side + "Hand": wrist}

    # Keep clothes and the backpack on the body. The arm region starts at
    # the shoulder and ends below the fingertips. The leg blend ends at hips.
    arm_edge = .155 + .025 * (1 - smooth(.72, .88, y))
    arm_amount = smooth(arm_edge, 0.235, ax)
    arm_amount *= 1.0 - smooth(1.29, 1.37, y)
    arm_amount *= smooth(0.58, 0.68, y)
    arm_amount *= smooth(-0.12, -0.01, z)
    leg_amount = (1.0 - smooth(0.88, 1.01, y)) * smooth(0.015, 0.075, ax)
    if y < 0.72:
        leg_amount = 1.0
    # The outer arm must never inherit thigh motion at the hand's height.
    leg_amount *= 1.0 - arm_amount
    body_amount = 1.0 - arm_amount - leg_amount

    combined: dict[str, float] = {}
    for group, scale in ((body, body_amount), (leg, leg_amount), (arm, arm_amount)):
        for name, value in group.items():
            combined[name] = combined.get(name, 0.0) + value * scale
    top = sorted(combined.items(), key=lambda p: p[1], reverse=True)[:4]
    total = sum(v for _, v in top)
    raw = [round(v / total * 255) for _, v in top]
    raw[0] += 255 - sum(raw)
    return (bytes([INDEX[name] for name, _ in top] + [0] * (4 - len(top))),
            bytes(raw + [0] * (4 - len(raw))))


def read_glb(path: Path) -> tuple[dict, bytearray]:
    data = path.read_bytes()
    magic, version, size = struct.unpack_from("<4sII", data)
    assert (magic, version, size) == (b"glTF", 2, len(data))
    off = 12
    chunks = {}
    while off < len(data):
        length, kind = struct.unpack_from("<II", data, off)
        off += 8
        chunks[kind] = data[off:off + length]
        off += length
    return json.loads(chunks[0x4E4F534A]), bytearray(chunks[0x004E4942])


def append_view(doc: dict, blob: bytearray, data: bytes, target: int | None = None) -> int:
    blob.extend(b"\0" * (-len(blob) % 4))
    view = {"buffer": 0, "byteOffset": len(blob), "byteLength": len(data)}
    if target:
        view["target"] = target
    doc["bufferViews"].append(view)
    blob.extend(data)
    return len(doc["bufferViews"]) - 1


def accessor(doc: dict, view: int, component: int, count: int, kind: str,
             **extra: object) -> int:
    doc["accessors"].append({"bufferView": view, "componentType": component,
                             "count": count, "type": kind, **extra})
    return len(doc["accessors"]) - 1


def quat_x(angle: float) -> tuple[float, float, float, float]:
    return (math.sin(angle / 2), 0.0, 0.0, math.cos(angle / 2))


def quat_axis(axis: tuple[float, float, float], angle: float) -> tuple[float, float, float, float]:
    length = math.sqrt(sum(v * v for v in axis))
    scale = math.sin(angle / 2) / length
    return (*[v * scale for v in axis], math.cos(angle / 2))


def quat_mul(a: tuple, b: tuple) -> tuple[float, float, float, float]:
    x, y, z, w = a
    X, Y, Z, W = b
    return (w*X + x*W + y*Z - z*Y, w*Y - x*Z + y*W + z*X,
            w*Z + x*Y - y*X + z*W, w*W - x*X - y*Y - z*Z)


def shoulder(swing: float, side: int) -> tuple:
    # Lower the source A-pose arms, then swing in the forward/back plane.
    return quat_mul(quat_x(swing), quat_axis((0, 0, 1), -side * .32))


def elbow_rotation(flex: float, side: int) -> tuple:
    # This local hinge maps to the forward bend axis after shoulder lowering.
    return quat_axis((math.cos(.32), side * math.sin(.32), 0), -flex)


def walk_foot(cycle: float) -> tuple[float, float]:
    """Ankle height and forward offset; half the cycle stays on the floor."""
    u = cycle % 1.0
    if u <= .5:
        return .14, STEP_REACH * (1 - 4 * u)
    s = (u - .5) * 2
    # The swing has the same horizontal speed at lift-off and touchdown.
    z = (-STEP_REACH * (2*s**3 - 3*s**2 + 1)
         - 2 * STEP_REACH * (s**3 - 2*s**2 + s)
         + STEP_REACH * (-2*s**3 + 3*s**2)
         - 2 * STEP_REACH * (s**3 - s**2))
    return .14 + .10 * math.sin(math.pi * s)**2, z


def leg_pose(side: str, hip_drop: float, ankle_y: float, forward: float) -> tuple[float, float, float]:
    """Solve two leg links offline. The knee always points forward.

    Joint nodes keep their source rest axes. Export local X rotations,
    with a flat foot. Babylon.js only needs the baked clip.
    """
    hip = BONES[INDEX[side + "UpperLeg"]][2]
    knee = BONES[INDEX[side + "LowerLeg"]][2]
    foot = BONES[INDEX[side + "Foot"]][2]
    a = math.hypot(knee[1] - hip[1], knee[2] - hip[2])
    b = math.hypot(foot[1] - knee[1], foot[2] - knee[2])
    # A small inward rotation narrows the source A-pose stance. Account for
    # its vertical change so the foot still touches the floor.
    down = (hip[1] - hip_drop - ankle_y - math.sin(LEG_INWARD) * abs(foot[0]-hip[0])) / math.cos(LEG_INWARD)
    distance = math.hypot(down, forward)
    assert abs(a - b) < distance < a + b, "The walk foot is out of reach."
    direction = math.atan2(-forward, down)
    bend = math.acos(max(-1, min(1, (a*a + b*b - distance*distance) / (2*a*b))))
    flex = math.pi - bend
    offset = math.acos(max(-1, min(1, (a*a + distance*distance - b*b) / (2*a*distance))))
    rest_thigh = math.atan2(hip[2] - knee[2], hip[1] - knee[1])
    rest_shin = math.atan2(knee[2] - foot[2], knee[1] - foot[1])
    thigh = direction - offset - rest_thigh
    shin = flex + rest_thigh - rest_shin
    return thigh, shin, -thigh - shin


def write_clip(doc: dict, blob: bytearray, name: str, times: list[float],
               rotations: dict[str, list[tuple]], translations: dict[str, list[tuple]] | None = None) -> None:
    tview = append_view(doc, blob, struct.pack("<" + "f" * len(times), *times))
    tacc = accessor(doc, tview, 5126, len(times), "SCALAR", min=[min(times)], max=[max(times)])
    channels = []
    samplers = []
    tracks = [(bone, "rotation", "VEC4", curve) for bone, curve in rotations.items()]
    tracks += [(bone, "translation", "VEC3", curve) for bone, curve in (translations or {}).items()]
    for bone, path, kind, curve in tracks:
        assert len(curve) == len(times)
        values = [n for value in curve for n in value]
        view = append_view(doc, blob, struct.pack("<" + "f" * len(values), *values))
        out = accessor(doc, view, 5126, len(times), kind)
        channels.append({"sampler": len(samplers),
                         "target": {"node": 2 + INDEX[bone], "path": path}})
        samplers.append({"input": tacc, "output": out, "interpolation": "LINEAR"})
    doc.setdefault("animations", []).append({"name": name, "channels": channels, "samplers": samplers})


def main() -> None:
    doc, blob = read_glb(SOURCE)
    assert len(doc["meshes"]) == 1 and len(doc["meshes"][0]["primitives"]) == 1
    assert not doc.get("skins") and not doc.get("animations")
    primitive = doc["meshes"][0]["primitives"][0]
    position = doc["accessors"][primitive["attributes"]["POSITION"]]
    view = doc["bufferViews"][position["bufferView"]]
    assert position["componentType"] == 5126 and position["type"] == "VEC3"
    start = view.get("byteOffset", 0) + position.get("byteOffset", 0)
    stride = view.get("byteStride", 12)
    count = position["count"]

    # Coincident vertices get the same influence, even across UV seams.
    known: dict[tuple[float, float, float], tuple[bytes, bytes]] = {}
    joints = bytearray()
    skin_weights = bytearray()
    for i in range(count):
        xyz = struct.unpack_from("<3f", blob, start + stride * i)
        key = tuple(round(v, 5) for v in xyz)
        pair = known.setdefault(key, weights(*xyz))
        joints.extend(pair[0])
        skin_weights.extend(pair[1])
    jview = append_view(doc, blob, joints, 34962)
    wview = append_view(doc, blob, skin_weights, 34962)
    primitive["attributes"]["JOINTS_0"] = accessor(doc, jview, 5121, count, "VEC4")
    primitive["attributes"]["WEIGHTS_0"] = accessor(doc, wview, 5121, count, "VEC4", normalized=True)

    # Add joint nodes as siblings of the mesh. The source mesh stays intact.
    assert len(doc["nodes"]) == 2
    doc["nodes"][0].setdefault("children", []).append(2)
    for name, parent, absolute in BONES:
        origin = (0.0, 0.0, 0.0) if parent is None else BONES[INDEX[parent]][2]
        local = [round(absolute[i] - origin[i], 6) for i in range(3)]
        doc["nodes"].append({"name": name, "translation": local})
    for index, (_, parent, _) in enumerate(BONES):
        if parent is not None:
            doc["nodes"][2 + INDEX[parent]].setdefault("children", []).append(2 + index)

    matrices = []
    for _, _, (x, y, z) in BONES:
        matrices.extend((1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1))
    mview = append_view(doc, blob, struct.pack("<" + "f" * len(matrices), *matrices))
    macc = accessor(doc, mview, 5126, len(BONES), "MAT4")
    doc["skins"] = [{"name": "PlayerHumanoid", "inverseBindMatrices": macc,
                      "skeleton": 2, "joints": list(range(2, 2 + len(BONES)))}]
    doc["nodes"][1]["skin"] = 0

    # Both clips own the same tracks so a fade also resets elbows and hands.
    identity = (0.0, 0.0, 0.0, 1.0)
    idle_times = [i / 8 for i in range(17)]
    idle_rotations = {name: [identity] * len(idle_times) for name, _, _ in BONES}
    for i, t in enumerate(idle_times):
        breath = math.sin(math.pi * t)
        idle_rotations["Spine"][i] = quat_x(.009 * breath)
        idle_rotations["Chest"][i] = quat_x(-.007 * breath)
        idle_rotations["Head"][i] = quat_x(.005 * breath)
        for side, sign in (("Left", 1), ("Right", -1)):
            idle_rotations[side + "UpperArm"][i] = shoulder(.012 * breath, sign)
            idle_rotations[side + "LowerArm"][i] = elbow_rotation(.18, sign)
            idle_rotations[side + "UpperLeg"][i] = quat_axis((0, 0, 1), -sign * LEG_INWARD)
            idle_rotations[side + "Foot"][i] = quat_axis((0, 0, 1), sign * LEG_INWARD)
    hips_position = BONES[INDEX["Hips"]][2]
    # Raising the hips 1.5 mm keeps the narrowed idle feet on the floor.
    leg = BONES[INDEX['LeftUpperLeg']][2]
    foot = BONES[INDEX['LeftFoot']][2]
    idle_raise = (1-math.cos(LEG_INWARD)) * (foot[1]-leg[1]) + math.sin(LEG_INWARD) * (foot[0]-leg[0])
    idle_hips = (hips_position[0], hips_position[1] + idle_raise, hips_position[2])
    write_clip(doc, blob, "Idle", idle_times, idle_rotations,
               {"Hips": [idle_hips] * len(idle_times)})

    # 0.62 m in 0.48 s matches the scene's 1.3 m/s movement speed.
    duration = WALK_DURATION
    walk_times = [duration * i / 64 for i in range(65)]
    walk_rotations = {name: [identity] * len(walk_times) for name, _, _ in BONES}
    hip_positions = []
    for i, t in enumerate(walk_times):
        phase = 2 * math.pi * t / duration
        swing = math.cos(phase)
        walk_rotations["Spine"][i] = quat_axis((0, 1, 0), .025 * swing)
        walk_rotations["Chest"][i] = quat_axis((0, 1, 0), -.04 * swing)
        hip_drop = .08 * swing**2
        hip_positions.append((.006 * math.sin(phase), hips_position[1] - hip_drop, hips_position[2]))
        for side, sign in (("Left", 1), ("Right", -1)):
            leg_swing = sign * swing
            cycle = t / duration + (0 if sign == 1 else .5)
            ankle_y, forward = walk_foot(cycle)
            thigh, knee, foot = leg_pose(side, hip_drop, ankle_y, forward)
            inward = quat_axis((0, 0, 1), -sign * LEG_INWARD)
            walk_rotations[side + "UpperLeg"][i] = quat_mul(inward, quat_x(thigh))
            walk_rotations[side + "LowerLeg"][i] = quat_x(knee)
            walk_rotations[side + "Foot"][i] = quat_mul(quat_x(foot), quat_axis((0, 0, 1), sign * LEG_INWARD))
            walk_rotations[side + "UpperArm"][i] = shoulder(.30 * leg_swing, sign)
            walk_rotations[side + "LowerArm"][i] = elbow_rotation(.30 + .06 * leg_swing, sign)
    write_clip(doc, blob, "Walk", walk_times, walk_rotations, {"Hips": hip_positions})
    doc["buffers"][0]["byteLength"] = len(blob)
    doc.setdefault("asset", {})["generator"] = "KarmaGame character-rig-test/rig_character.py"
    raw_json = json.dumps(doc, separators=(",", ":")).encode()
    raw_json += b" " * (-len(raw_json) % 4)
    blob.extend(b"\0" * (-len(blob) % 4))
    length = 12 + 8 + len(raw_json) + 8 + len(blob)
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_bytes(struct.pack("<4sII", b"glTF", 2, length)
                       + struct.pack("<II", len(raw_json), 0x4E4F534A) + raw_json
                       + struct.pack("<II", len(blob), 0x004E4942) + blob)
    print(f"{OUTPUT}: {count:,} vertices, {len(BONES)} bones, Idle + Walk, {length:,} bytes")


if __name__ == "__main__":
    main()
