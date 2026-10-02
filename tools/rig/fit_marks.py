"""Fit the 17 player joint marks to another character mesh.

Steps (Python standard library only):
1. Scale all player marks by measured height ratio.
2. Measure the mesh in slices (arm edge line, leg centres, torso centre).
3. Apply the same measures to the player mesh. The difference between the
   player mark and the player measure is the calibration. It is scaled and
   added to each new measure.
4. Keep hand fixes from `tools/rig/marks/<name>.json` key "overrides".

The result goes to `tools/rig/marks/<name>.json`. A person can edit a mark in
that file and run `rig_shared.py` again. `python fit_marks.py --all` rewrites
the auto values and keeps the overrides.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[2]
CHAR_DIR = ROOT / "3D Models/assets/characters"
MARKS_DIR = Path(__file__).resolve().parent / "marks"
PLAYER_MESH = ROOT / "player_simple_opt.glb"
PLAYER_HEIGHT = 1.70

# name -> (source file, output file, target height in metres)
CHARACTERS = {
    "merchant": ("merchant.glb", "merchant_rigged.glb", 1.75),
    "citizen_female": ("citizen_female.glb", "citizen_female_rigged.glb", 1.68),
    "citizen_male": ("citizen_male.glb", "citizen_male_rigged.glb", 1.78),
    "fear_child": ("fear_child.glb", "fear_child_rigged.glb", 1.25),
    "dark_npc": ("dark_district_npc.glb", "dark_npc_rigged.glb", 1.82),
    "exchange_guide": ("exchange_guide.glb", "exchange_guide_rigged.glb", 1.76),
}

# The player marks. Copied from character-rig-test/rig_character.py at run time.
from generate_rig_v2 import rig  # the test rig module, loaded once
NAMES = [b[0] for b in rig.BONES]
PARENTS = {b[0]: b[1] for b in rig.BONES}
PLAYER = {b[0]: list(b[2]) for b in rig.BONES}


def read_positions(path: Path) -> list[tuple[float, float, float]]:
    doc, blob = rig.read_glb(path)
    primitive = doc["meshes"][0]["primitives"][0]
    accessor = doc["accessors"][primitive["attributes"]["POSITION"]]
    view = doc["bufferViews"][accessor["bufferView"]]
    start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", 12)
    return [struct.unpack_from("<3f", blob, start + stride * i) for i in range(accessor["count"])]


def band(points, y0, y1):
    return [p for p in points if y0 <= p[1] < y1]


def mid(values):
    return (min(values) + max(values)) / 2 if values else None


def cluster_outer(xs, gap):
    """Outermost cluster of sorted-descending values; stops at a gap."""
    xs = sorted(xs, reverse=True)
    out = [xs[0]]
    for v in xs[1:]:
        if out[-1] - v > gap:
            break
        out.append(v)
    return out


def measure(points, s, ankle_y, knee_y):
    """Raw measures in metres for one mesh. `s` is height / 1.70."""
    out: dict = {}
    h = max(p[1] for p in points)
    out["height"] = h
    # --- arms (left = +x). Mirror the right side with a sign.
    for side, sign in (("Left", 1), ("Right", -1)):
        arm = [(sign * p[0], p[1], p[2]) for p in points if sign * p[0] > 0.12 * s and p[1] > 0.3 * h]
        tip = max(arm, key=lambda p: p[0])
        yt = tip[1]
        step = 0.012 * s
        rows = []  # (y, outer x, half width, z centre)
        y = yt + 0.03 * s
        while y < yt + 0.75 * s:
            row = [p for p in arm if y <= p[1] < y + step]
            if len(row) >= 3:
                cl = cluster_outer([p[0] for p in row], 0.025 * s)
                members = [p for p in row if p[0] >= min(cl) - 1e-9]
                rows.append((y + step / 2, max(cl), (max(cl) - min(cl)) / 2, mid([p[2] for p in members]), len(cl) == len(row)))
            y += step
        out[side + "tip"] = (tip[0], yt, tip[2])
        # Forearm rows: the arm is still apart from the body.
        fore = [r for r in rows if r[0] < yt + 0.30 * s]
        hw = sorted(r[2] for r in fore)[len(fore) // 2] if fore else 0.04 * s
        hw = min(max(hw, 0.025 * s), 0.09 * s)
        # Line fit of the outer edge: x = a + b*y over the forearm.
        pts = [(r[0], r[1]) for r in rows if yt + 0.06 * s <= r[0] <= yt + 0.36 * s]
        n = len(pts)
        my = sum(p[0] for p in pts) / n
        mx = sum(p[1] for p in pts) / n
        b = sum((p[0] - my) * (p[1] - mx) for p in pts) / sum((p[0] - my) ** 2 for p in pts)
        a = mx - b * my
        out[side + "arm"] = {"a": a, "b": b, "hw": hw, "zc": mid([r[3] for r in fore])}
    # --- legs
    for side, sign in (("Left", 1), ("Right", -1)):
        for key, (y0, y1) in (("ankle", (ankle_y + 0.06 * s, ankle_y + 0.12 * s)), ("knee", (knee_y - 0.05 * s, knee_y + 0.05 * s))):
            row = [p for p in points if y0 <= p[1] < y1 and 0.02 * s < sign * p[0] < 0.30 * s]
            xs = [sign * p[0] for p in row]
            out[side + key] = (mid(xs), mid([p[2] for p in row]), (max(xs) - min(xs)) / 2)
    # --- crotch: lowest slice above the knee whose centre column is filled.
    crotch = None
    y = 0.30 * h
    while y < 0.62 * h:
        centre = [p for p in points if y <= p[1] < y + 0.01 * s and abs(p[0]) < 0.012 * s]
        if len(centre) >= 3:
            crotch = y
            break
        y += 0.01 * s
    out["crotch"] = crotch
    # --- torso centre z at hip, chest height. Use the centre column only.
    for key, level in (("hipsZ", 0.535 * h), ("chestZ", 0.72 * h)):
        row = [p for p in points if level <= p[1] < level + 0.05 * s and abs(p[0]) < 0.12 * s]
        out[key] = mid([p[2] for p in row])
    row = [p for p in points if 0.90 * h <= p[1] < 0.98 * h]
    out["headZ"] = mid([p[2] for p in row])
    return out


def calibrate_and_fit(points, height, params):
    s = height / PLAYER_HEIGHT
    marks = {n: [v * s for v in PLAYER[n]] for n in NAMES}
    notes = []
    # Height levels. A person can set them in "params" (metres) when the body
    # has other proportions than the player (child, long coat).
    level = {"ankleY": marks["LeftFoot"][1], "kneeY": marks["LeftLowerLeg"][1]}
    level.update({k: v for k, v in params.items() if k in level})
    pm = measure(read_positions(PLAYER_MESH), 1.0, PLAYER["LeftFoot"][1], PLAYER["LeftLowerLeg"][1])
    cm = measure(points, s, level["ankleY"], level["kneeY"])
    # Arms
    for side, sign in (("Left", 1), ("Right", -1)):
        pa, ca = pm[side + "arm"], cm[side + "arm"]
        ps, cs = PLAYER[side + "UpperArm"], PLAYER[side + "Hand"]
        # Axis centre line x = a - hw + b*y (the edge moves inward by half width).
        # The sleeve is wider near the shoulder, so the centre moves inward there.
        def axis_x(arm, y, y_hand=None, y_shoulder=None):
            grow = 1.0
            if y_hand is not None:
                grow = 1.0 + 0.8 * max(0.0, min(1.0, (y - y_hand) / (y_shoulder - y_hand)))
            return arm["a"] - arm["hw"] * grow + arm["b"] * y
        # Shoulder height: scaled player mark. Hand fixes go in "overrides".
        ys = params.get("shoulderY", PLAYER[side + "UpperArm"][1] * s)
        off_h = PLAYER[side + "Hand"][1] - pm[side + "tip"][1]
        yh = cm[side + "tip"][1] + off_h * s
        sx = sign * axis_x(ca, ys, yh, ys)
        hx = sign * axis_x(ca, yh, yh, ys)
        # The arm hangs near the torso. Use the measured forearm centre for all three marks.
        zs = zh = zel = ca["zc"]
        # Keep arm marks near the scaled marks. Wrong slices must not run away.
        marks[side + "UpperArm"] = [sx, ys, zs]
        marks[side + "Hand"] = [hx, yh, zh]
        t = (PLAYER[side + "LowerArm"][1] - PLAYER[side + "UpperArm"][1]) / (PLAYER[side + "Hand"][1] - PLAYER[side + "UpperArm"][1])
        ey = ys + (yh - ys) * t
        marks[side + "LowerArm"] = [sign * axis_x(ca, ey, yh, ys), ey, zel]
    # Legs
    hip_y = marks["LeftUpperLeg"][1]
    if "hipY" in params:
        hip_y = params["hipY"]
    elif cm["crotch"] is not None and pm["crotch"] is not None:
        measured = cm["crotch"] + (PLAYER["LeftUpperLeg"][1] - pm["crotch"]) * s
        if 0.9 * hip_y < measured < 1.1 * hip_y:
            hip_y = measured
            notes.append("hip height from crotch slice")
    for side, sign in (("Left", 1), ("Right", -1)):
        marks[side + "UpperLeg"][1] = hip_y
        ankle_y = level["ankleY"]
        marks[side + "Foot"][1] = ankle_y
        marks[side + "LowerLeg"][1] = params.get("kneeY", ankle_y + (hip_y - ankle_y) * (PLAYER[side + "LowerLeg"][1] - PLAYER[side + "Foot"][1]) / (PLAYER[side + "UpperLeg"][1] - PLAYER[side + "Foot"][1]))
        for key, bone in (("ankle", "Foot"), ("knee", "LowerLeg")):
            px, pz, _ = pm[side + key]
            cx, cz, _ = cm[side + key]
            nx = cx + (abs(PLAYER[side + bone][0]) - px) * s
            nz = cz + (PLAYER[side + bone][2] - pz) * s
            base = abs(marks[side + bone][0])
            if 0.75 * base < nx < 1.3 * base:
                marks[side + bone][0] = sign * nx
            marks[side + bone][2] = nz
        hx = abs(marks[side + "LowerLeg"][0]) * (abs(PLAYER[side + "UpperLeg"][0]) / abs(PLAYER[side + "LowerLeg"][0]))
        marks[side + "UpperLeg"][0] = sign * hx
        marks[side + "UpperLeg"][2] = marks[side + "LowerLeg"][2] + (PLAYER[side + "UpperLeg"][2] - PLAYER[side + "LowerLeg"][2]) * s
    # Hips and Spine follow the leg joints.
    drop = hip_y - PLAYER["LeftUpperLeg"][1] * s
    marks["Hips"][1] += drop
    marks["Spine"][1] = max(marks["Spine"][1] + drop * 0.5, marks["Hips"][1] + 0.08 * s)
    for bone, key in (("Hips", "hipsY"), ("Spine", "spineY"), ("Chest", "chestY"), ("Neck", "neckY"), ("Head", "headY")):
        if key in params:
            marks[bone][1] = params[key]
    # Torso z from the centre column. The player carries a pack, so only shift when
    # the offset to the scaled mark is large.
    shift = None
    if cm["chestZ"] is not None:
        shift = cm["chestZ"] - 0.04 * s
    for bone in ("Hips", "Spine", "Chest", "Neck"):
        marks[bone][2] = PLAYER[bone][2] * s + (shift or 0)
    if cm["headZ"] is not None:
        marks["Head"][2] = cm["headZ"] - 0.02 * s
    # Bones below the Hips keep y order.
    return {k: [round(v, 4) for v in marks[k]] for k in NAMES}, notes, cm


def build(name: str):
    source, output, target = CHARACTERS[name]
    points = read_positions(CHAR_DIR / source)
    height = max(p[1] for p in points)
    assert abs(min(p[1] for p in points)) < 1e-4, "Feet must stand at Y=0"
    path = MARKS_DIR / f"{name}.json"
    overrides, params = {}, {}
    if path.exists():
        old = json.loads(path.read_text(encoding="utf-8"))
        overrides, params = old.get("overrides", {}), old.get("params", {})
    marks, notes, measures = calibrate_and_fit(points, height, params)
    final = {k: list(v) for k, v in marks.items()}
    for bone, value in overrides.items():
        if isinstance(value, dict):  # partial: {"y": 0.5}
            for axis, number in value.items():
                final[bone]["xyz".index(axis)] = number
        else:
            final[bone] = list(value)
    doc = {
        "name": name,
        "source": source,
        "output": output,
        "measuredHeight": round(height, 4),
        "targetHeight": target,
        "armHalfWidth": round((measures["Leftarm"]["hw"] + measures["Rightarm"]["hw"]) / 2, 4),
        "marks": final,
        "auto": marks,
        "params": params,
        "overrides": overrides,
        "notes": notes,
    }
    MARKS_DIR.mkdir(exist_ok=True)
    path.write_text(json.dumps(doc, indent=1) + "\n", encoding="utf-8")
    return doc


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("names", nargs="*")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    for n in (CHARACTERS if args.all or not args.names else args.names):
        d = build(n)
        print(n, d["measuredHeight"], d["notes"])
