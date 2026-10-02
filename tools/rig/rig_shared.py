"""Skin any supplied character GLB to the shared 17-bone rig with the five shared clips.

Python standard library only. Input: one source GLB and its marks file
`tools/rig/marks/<name>.json`. Output: `3D Models/assets/characters/<name>_rigged.glb`.
The mesh, material and texture bytes stay as they are. The clips use the same
bone rotations as the player rig. Hip motion, step reach and foot lift scale
with leg length. Walk stays authored for 2.8 m/s and Run for 4.6 m/s.

    python tools/rig/rig_shared.py --all
    python tools/rig/rig_shared.py merchant
"""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import math
from pathlib import Path
import struct

import fit_marks as fm
from generate_rig_v2 import ROOT, read_checked, rig, write_glb

CLIPS = ("Idle", "Walk", "Run", "Interact", "LookAround")
PLAYER_LEG = fm.PLAYER["LeftUpperLeg"][1] - fm.PLAYER["LeftFoot"][1]  # 0.74 m
GRIP_FALLBACK = (0.0, -0.04, 0.02)


def load_marks(name: str) -> dict:
    return json.loads((fm.MARKS_DIR / f"{name}.json").read_text(encoding="utf-8"))


def smooth(a: float, b: float, x: float) -> float:
    return rig.smooth(a, b, x)


class Body:
    """Numbers derived from the marks. One place for all scale rules."""

    def __init__(self, data: dict):
        self.data = data
        self.marks = {k: tuple(v) for k, v in data["marks"].items()}
        self.height = data["measuredHeight"]
        self.s = self.height / fm.PLAYER_HEIGHT           # mesh scale against the player mesh
        self.norm = data["targetHeight"] / self.height      # registry height normalisation
        m = self.marks
        self.hip_y = m["LeftUpperLeg"][1]
        self.ankle_y = m["LeftFoot"][1]
        self.knee_y = m["LeftLowerLeg"][1]
        self.leg = self.hip_y - self.ankle_y
        self.k = self.leg / PLAYER_LEG                      # clip scale by leg length (mesh units)
        params = data.get("params", {})
        foot_x = abs(m["LeftFoot"][0])
        hip_x = abs(m["LeftUpperLeg"][0])
        # Narrow the splayed A-pose stance. For the player this gives 0.09 rad.
        self.inward = params.get("legInward", math.atan2(foot_x - 0.85 * hip_x, self.leg))
        sh, hand = m["LeftUpperArm"], m["LeftHand"]
        self.arm_angle = math.atan2(hand[0] - sh[0], sh[1] - hand[1])
        self.arm_lower = params.get("armLower", 0.73 * self.arm_angle)
        self.arm_hw = data.get("armHalfWidth", 0.04 * self.s)
        self.separate_y = params.get("legsSeparateY", self.hip_y - 0.16 * self.s)

    # --- weights ---------------------------------------------------------------
    def body_points(self):
        m, s = self.marks, self.s
        pts = [("Hips", m["Hips"][1] + 0.03 * s), ("Spine", m["Spine"][1] + 0.01 * s),
               ("Chest", m["Chest"][1] - 0.01 * s), ("Neck", m["Neck"][1] + 0.01 * s),
               ("Head", m["Head"][1] - 0.01 * s)]
        assert all(b[1] > a[1] for a, b in zip(pts, pts[1:])), "Bone heights must rise"
        return pts

    def prepare(self):
        s, m = self.s, self.marks
        self.points = self.body_points()
        self.arms = {}
        for side, sign in (("Left", 1), ("Right", -1)):
            sh = m[side + "UpperArm"]
            el = m[side + "LowerArm"]
            hd = m[side + "Hand"]
            d = tuple(hd[i] - sh[i] for i in range(3))
            n2 = sum(v * v for v in d)
            te = sum((el[i] - sh[i]) * d[i] for i in range(3)) / n2
            self.arms[side] = (sign, sh, d, n2, te, (abs(hd[0]) - abs(sh[0])) / (sh[1] - hd[1]))

    def weights(self, x: float, y: float, z: float) -> tuple[bytes, bytes]:
        s, m = self.s, self.marks
        side = "Left" if x >= 0 else "Right"
        ax = abs(x)
        body = rig.between(self.points, y)
        ankle = smooth(self.ankle_y + 0.04 * s, self.ankle_y + 0.10 * s, y)
        knee = smooth(self.knee_y - 0.06 * s, self.knee_y + 0.06 * s, y)
        hip = smooth(self.hip_y - 0.05 * s, self.hip_y + 0.08 * s, y)
        leg = {side + "Foot": 1 - ankle,
               side + "LowerLeg": ankle * (1 - knee),
               side + "UpperLeg": ankle * knee * (1 - hip),
               "Hips": ankle * knee * hip}
        sign, sh, d, n2, te, slope = self.arms[side]
        # Work on the mirrored side: own side is +x. Progress along the arm axis
        # (shoulder 0, hand mark 1). Same idea as the player rig.
        p = (ax - abs(sh[0]), y - sh[1], z - sh[2])
        progress = (p[0] * sign * d[0] + p[1] * d[1] + p[2] * d[2]) / n2
        elbow = smooth(te - 0.09, te + 0.08, progress)
        wrist = smooth(0.92, 1.04, progress)
        arm = {side + "UpperArm": 1 - elbow, side + "LowerArm": elbow * (1 - wrist), side + "Hand": wrist}
        # Arm region: right of the arm axis (horizontal distance), between shoulder and below hand.
        axis_x = abs(sh[0]) + (sh[1] - y) * slope
        grow = max(0.0, min(1.0, (sh[1] - y) / max(1e-6, sh[1] - m[side + "Hand"][1])))
        half = max(self.arm_hw * 1.4, 0.04 * s) * (1 + 0.8 * (1 - grow))
        inner = max(axis_x - 1.2 * half, abs(sh[0]) * 0.85)
        arm_amount = smooth(inner, max(inner + 0.02 * s, axis_x - 0.3 * half), ax)
        arm_amount *= 1.0 - smooth(sh[1] + 0.03 * s, sh[1] + 0.11 * s, y)
        hand_y = m[side + "Hand"][1]
        arm_amount *= smooth(hand_y - 0.21 * s, hand_y - 0.11 * s, y)
        leg_amount = (1.0 - smooth(self.hip_y - 0.03 * s, self.hip_y + 0.10 * s, y)) * smooth(0.015 * s, 0.075 * s, ax)
        if y < self.separate_y:
            leg_amount = 1.0
        leg_amount *= 1.0 - arm_amount
        body_amount = 1.0 - arm_amount - leg_amount
        combined: dict[str, float] = {}
        for group, scale in ((body, body_amount), (leg, leg_amount), (arm, arm_amount)):
            for name, value in group.items():
                combined[name] = combined.get(name, 0.0) + value * scale
        top = sorted(combined.items(), key=lambda pair: pair[1], reverse=True)[:4]
        total = sum(v for _, v in top)
        raw = [round(v / total * 255) for _, v in top]
        raw[0] += 255 - sum(raw)
        return (bytes([rig.INDEX[name] for name, _ in top] + [0] * (4 - len(top))),
                bytes(raw + [0] * (4 - len(raw))))

    # --- clips -----------------------------------------------------------------
    def shoulder(self, swing: float, sign: int):
        return rig.quat_mul(rig.quat_x(swing), rig.quat_axis((0, 0, 1), -sign * self.arm_lower))

    def elbow(self, flex: float, sign: int):
        return rig.quat_axis((math.cos(self.arm_lower), sign * math.sin(self.arm_lower), 0), -flex)

    def idle_pose(self):
        r = {name: (0., 0., 0., 1.) for name, _, _ in rig.BONES}
        for side, sign in (("Left", 1), ("Right", -1)):
            r[side + "UpperArm"] = self.shoulder(0, sign)
            r[side + "LowerArm"] = self.elbow(.18, sign)
            r[side + "UpperLeg"] = rig.quat_axis((0, 0, 1), -sign * self.inward)
            r[side + "Foot"] = rig.quat_axis((0, 0, 1), sign * self.inward)
        hip = self.marks["Hips"]
        leg = self.marks["LeftUpperLeg"]
        foot = self.marks["LeftFoot"]
        raise_y = (1 - math.cos(self.inward)) * (foot[1] - leg[1]) + math.sin(self.inward) * (foot[0] - leg[0])
        return r, (hip[0], hip[1] + raise_y, hip[2])

    def foot_path(self, cycle: float, reach: float, lift: float):
        u = cycle % 1
        if u <= .5:
            return self.ankle_y, reach * (1 - 4 * u)
        t = (u - .5) * 2
        z = (-reach * (2*t**3 - 3*t**2 + 1) - 2*reach * (t**3 - 2*t**2 + t)
             + reach * (-2*t**3 + 3*t**2) - 2*reach * (t**3 - t**2))
        return self.ankle_y + lift * math.sin(math.pi * t)**2, z

    def locomotion(self, doc, blob, name, speed, base_reach, base_drop, base_lift):
        k = self.k
        reach, drop, lift = base_reach * k, base_drop * k, base_lift * k
        # World speed after registry normalisation must equal `speed`.
        model_speed = speed / self.norm
        duration = 4 * reach / model_speed
        times = samples(duration)
        rotations = {bone: [] for bone, _, _ in rig.BONES}
        hips = []
        origin = self.marks["Hips"]
        for t in times:
            phase = 2 * math.pi * t / duration
            swing = math.cos(phase)
            cur, _ = self.idle_pose()
            cur["Spine"] = rig.quat_axis((0, 1, 0), .025 * swing)
            cur["Chest"] = rig.quat_axis((0, 1, 0), -.04 * swing)
            hip_drop = drop * swing * swing
            hips.append((.006 * k * math.sin(phase), origin[1] - hip_drop, origin[2]))
            for side, sign in (("Left", 1), ("Right", -1)):
                cycle = t / duration + (0 if sign == 1 else .5)
                ankle_y, forward = self.foot_path(cycle, reach, lift)
                thigh, knee, foot = rig.leg_pose(side, hip_drop, ankle_y, forward)
                inward = rig.quat_axis((0, 0, 1), -sign * self.inward)
                cur[side + "UpperLeg"] = rig.quat_mul(inward, rig.quat_x(thigh))
                cur[side + "LowerLeg"] = rig.quat_x(knee)
                cur[side + "Foot"] = rig.quat_mul(rig.quat_x(foot), rig.quat_axis((0, 0, 1), sign * self.inward))
                cur[side + "UpperArm"] = self.shoulder((.30 if name == "Walk" else .42) * sign * swing, sign)
                cur[side + "LowerArm"] = self.elbow((.30 if name == "Walk" else .55) + .06 * sign * swing, sign)
            for bone in rotations:
                rotations[bone].append(cur[bone])
        rig.write_clip(doc, blob, name, times, rotations, {"Hips": hips})
        doc["animations"][-1]["extras"] = {
            "loop": True, "authoredSpeed": model_speed, "authoredWorldSpeed": speed, "halfReach": reach,
            "footLift": lift, "hipDrop": drop, "cycleDuration": duration, "stepsPerSecond": 2 / duration,
            "legScale": k, "rootMotion": False}

    def action(self, doc, blob, name, duration):
        times = samples(duration)
        rotations = {bone: [] for bone, _, _ in rig.BONES}
        hips = []
        for t in times:
            pose, hip = self.idle_pose()
            progress = t / duration
            envelope = math.sin(math.pi * progress)**2
            if name == "Interact":
                pose["RightUpperArm"] = self.shoulder(-.75 * envelope, -1)
                pose["RightLowerArm"] = self.elbow(.18 + .65 * envelope, -1)
                pose["Spine"] = rig.quat_x(.035 * envelope)
                pose["Head"] = rig.quat_x(.08 * envelope)
            else:
                yaw = math.sin(2 * math.pi * progress)
                pose["Head"] = rig.quat_axis((0, 1, 0), .40 * yaw)
                pose["Neck"] = rig.quat_axis((0, 1, 0), .10 * yaw)
                pose["Spine"] = rig.quat_axis((0, 1, 0), .025 * yaw)
            for bone in rotations:
                rotations[bone].append(pose[bone])
            hips.append(hip)
        rig.write_clip(doc, blob, name, times, rotations, {"Hips": hips})
        doc["animations"][-1]["extras"] = {"loop": name == "LookAround", "rootMotion": False}

    def idle(self, doc, blob):
        times = [i / 8 for i in range(17)]
        base, hip0 = self.idle_pose()
        rotations = {bone: [] for bone, _, _ in rig.BONES}
        hips = []
        for t in times:
            breath = math.sin(math.pi * t)
            pose = dict(base)
            pose["Spine"] = rig.quat_x(.009 * breath)
            pose["Chest"] = rig.quat_x(-.007 * breath)
            pose["Head"] = rig.quat_x(.005 * breath)
            for side, sign in (("Left", 1), ("Right", -1)):
                pose[side + "UpperArm"] = self.shoulder(.012 * breath, sign)
            for bone in rotations:
                rotations[bone].append(pose[bone])
            hips.append(hip0)
        rig.write_clip(doc, blob, "Idle", times, rotations, {"Hips": hips})
        doc["animations"][-1]["extras"] = {"loop": True, "rootMotion": False}


def samples(duration: float, intervals: int = 64) -> list[float]:
    # At least 30 keys per second. Multiples of four keep exact contact marks.
    intervals = max(intervals, 4 * math.ceil(duration * 30 / 4))
    return [duration * i / intervals for i in range(intervals + 1)]


@contextlib.contextmanager
def player_rig_with(marks: dict, body: Body):
    """The player math reads `rig.BONES` and `rig.LEG_INWARD`. Swap them for one run."""
    saved_bones, saved_inward = list(rig.BONES), rig.LEG_INWARD
    rig.BONES[:] = [(n, p, tuple(marks[n])) for n, p, _ in saved_bones]
    rig.LEG_INWARD = body.inward
    try:
        yield
    finally:
        rig.BONES[:] = saved_bones
        rig.LEG_INWARD = saved_inward


def generate(name: str, output: Path | None = None) -> Path:
    data = load_marks(name)
    source = fm.CHAR_DIR / data["source"]
    output = output or fm.CHAR_DIR / data["output"]
    if not output.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError("Output must stay in this project")
    if output.resolve() == source.resolve():
        raise ValueError("The source must stay unchanged")
    body = Body(data)
    body.prepare()
    doc, blob = read_checked(source)
    assert len(doc["meshes"]) == 1 and len(doc["meshes"][0]["primitives"]) == 1
    assert not doc.get("skins") and not doc.get("animations")
    nodes = doc["nodes"]
    mesh_node = next(i for i, n in enumerate(nodes) if "mesh" in n)
    assert mesh_node == 1 and nodes[0].get("children") == [1, 2, 3], "Unexpected source node layout"
    source_grips = {nodes[i]["name"]: nodes[i]["translation"] for i in (2, 3)}
    assert set(source_grips) == {"leftHandGrip", "rightHandGrip"}
    primitive = doc["meshes"][0]["primitives"][0]
    position = doc["accessors"][primitive["attributes"]["POSITION"]]
    view = doc["bufferViews"][position["bufferView"]]
    start = view.get("byteOffset", 0) + position.get("byteOffset", 0)
    stride = view.get("byteStride", 12)
    count = position["count"]
    known: dict[tuple, tuple[bytes, bytes]] = {}
    joints, weights = bytearray(), bytearray()
    for i in range(count):
        xyz = struct.unpack_from("<3f", blob, start + stride * i)
        key = tuple(round(v, 5) for v in xyz)
        if key not in known:
            known[key] = body.weights(*xyz)
        pair = known[key]
        joints.extend(pair[0])
        weights.extend(pair[1])
    primitive["attributes"]["JOINTS_0"] = rig.accessor(doc, rig.append_view(doc, blob, bytes(joints), 34962), 5121, count, "VEC4")
    primitive["attributes"]["WEIGHTS_0"] = rig.accessor(doc, rig.append_view(doc, blob, bytes(weights), 34962), 5121, count, "VEC4", normalized=True)

    # Bones are siblings of the mesh node, as in the player rig. Source grips move to the hands.
    nodes[:] = nodes[:2]
    nodes[0]["children"] = [1, 2]
    bones = [(n, p, tuple(body.marks[n])) for n, p, _ in rig.BONES]
    for bone, parent, absolute in bones:
        origin = (0.0, 0.0, 0.0) if parent is None else body.marks[parent]
        nodes.append({"name": bone, "translation": [round(absolute[i] - origin[i], 6) for i in range(3)]})
    for index, (_, parent, _) in enumerate(bones):
        if parent is not None:
            nodes[2 + rig.INDEX[parent]].setdefault("children", []).append(2 + index)
    matrices = []
    for _, _, (x, y, z) in bones:
        matrices.extend((1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1))
    macc = rig.accessor(doc, rig.append_view(doc, blob, struct.pack("<" + "f" * len(matrices), *matrices)), 5126, len(bones), "MAT4")
    doc["skins"] = [{"name": "SharedHumanoid", "inverseBindMatrices": macc, "skeleton": 2, "joints": list(range(2, 2 + len(bones)))}]
    nodes[1]["skin"] = 0
    grips = {}
    for side, grip in (("Left", "leftHandGrip"), ("Right", "rightHandGrip")):
        hand = body.marks[side + "Hand"]
        want = source_grips[grip]
        local = [round(want[i] - hand[i], 6) for i in range(3)]
        far = math.dist(want, hand)
        if far > 0.12 * body.s:
            local = [round(v * body.s, 6) for v in GRIP_FALLBACK]
        grips[grip] = local
        nodes[2 + rig.INDEX[side + "Hand"]].setdefault("children", []).append(len(nodes))
        nodes.append({"name": grip, "translation": local, "extras": {"purpose": "runtime hand socket", "review": "temporary; grip needs visual check"}})

    with player_rig_with(body.marks, body):
        body.idle(doc, blob)
        body.locomotion(doc, blob, "Walk", 2.8, .31, .08, .10)
        body.locomotion(doc, blob, "Run", 4.6, .38, .13, .14)
        body.action(doc, blob, "Interact", 1.0)
        body.action(doc, blob, "LookAround", 3.0)
    doc["asset"]["generator"] = "KarmaGame tools/rig/rig_shared.py; shared 17-bone rig"
    doc.setdefault("extras", {})["rigShared"] = {
        "status": "temporary", "humanBendReview": False, "character": name,
        "sourceSHA256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "marks": {k: list(v) for k, v in body.marks.items()},
        "measuredHeight": body.height, "targetHeight": data["targetHeight"], "normalize": body.norm,
        "legScale": body.k, "legInward": body.inward, "armLower": body.arm_lower,
        "grips": grips,
        "notes": "Mesh, material and texture are unchanged. Weights come from the marks."}
    write_glb(doc, blob, output)
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("names", nargs="*")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    for n in (fm.CHARACTERS if args.all or not args.names else args.names):
        out = generate(n)
        print(f"{out.name}: {out.stat().st_size:,} bytes")
