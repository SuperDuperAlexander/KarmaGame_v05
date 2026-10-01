"""Check the rigged test GLB against the source GLB."""
from __future__ import annotations

from collections import Counter
import math
import struct

from rig_character import BONES, INDEX, OUTPUT, SOURCE, read_glb


def data(doc: dict, blob: bytearray, accessor_index: int) -> bytes:
    item = doc["accessors"][accessor_index]
    view = doc["bufferViews"][item["bufferView"]]
    size = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[item["componentType"]]
    width = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[item["type"]]
    start = view.get("byteOffset", 0) + item.get("byteOffset", 0)
    length = item["count"] * size * width
    assert view.get("byteStride", size * width) == size * width
    return bytes(blob[start:start + length])


def multiply(a: tuple, b: tuple) -> tuple:
    x, y, z, w = a
    X, Y, Z, W = b
    return (w*X+x*W+y*Z-z*Y, w*Y-x*Z+y*W+z*X,
            w*Z+x*Y-y*X+z*W, w*W-x*X-y*Y-z*Z)


def rotate(vector: tuple, quaternion: tuple) -> tuple:
    inverse = tuple(-n for n in quaternion[:3]) + (quaternion[3],)
    return multiply(multiply(quaternion, (*vector, 0)), inverse)[:3]


def main() -> None:
    source, source_blob = read_glb(SOURCE)
    rigged, rigged_blob = read_glb(OUTPUT)
    a = source["meshes"][0]["primitives"][0]
    b = rigged["meshes"][0]["primitives"][0]
    for key in ("POSITION", "NORMAL", "TEXCOORD_0"):
        assert data(source, source_blob, a["attributes"][key]) == data(rigged, rigged_blob, b["attributes"][key])
    assert data(source, source_blob, a["indices"]) == data(rigged, rigged_blob, b["indices"])
    assert source["materials"] == rigged["materials"]
    assert source["images"] == rigged["images"]
    assert source_blob[:source["buffers"][0]["byteLength"]] == rigged_blob[:source["buffers"][0]["byteLength"]]
    assert len(rigged["skins"][0]["joints"]) == len(BONES) == 17
    assert [animation["name"] for animation in rigged["animations"]] == ["Idle", "Walk"]
    for animation in rigged["animations"]:
        assert animation["channels"] and animation["samplers"]
        assert all(channel["target"]["node"] in rigged["skins"][0]["joints"] for channel in animation["channels"])
    joints = data(rigged, rigged_blob, b["attributes"]["JOINTS_0"])
    weights = data(rigged, rigged_blob, b["attributes"]["WEIGHTS_0"])
    assert len(joints) == len(weights) == 46588 * 4
    assert all(value < 17 for value in joints)
    assert all(sum(weights[i:i + 4]) == 255 for i in range(0, len(weights), 4))
    influences = Counter(joints[i + k] for i in range(0, len(joints), 4)
                         for k in range(4) if weights[i + k])
    assert all(influences[index] > 0 for index in range(17))
    positions = data(rigged, rigged_blob, b["attributes"]["POSITION"])
    checked_arm_vertices = 0
    checked_leg_vertices = 0
    for i, (x, y, z) in enumerate(struct.iter_unpack('<3f', positions)):
        if abs(x) > .30 and .68 < y < 1.10 and z > -.01:
            checked_arm_vertices += 1
            assert all(5 <= joints[i*4+k] <= 10 for k in range(4) if weights[i*4+k]), 'The outer arm has a body or leg weight.'
        # Test the actual exported skin, away from the joint blend areas.
        if y < .18 or (.25 < y < .40) or (.57 < y < .70 and abs(x) < .23):
            side = 'Left' if x >= 0 else 'Right'
            part = 'Foot' if y < .18 else ('LowerLeg' if y < .40 else 'UpperLeg')
            own_weight = sum(weights[i*4+k] for k in range(4) if joints[i*4+k] == INDEX[side + part])
            assert own_weight >= 253, 'A boot or leg shaft bends away from its joint.'
            checked_leg_vertices += 1
    assert checked_arm_vertices > 500
    assert checked_leg_vertices > 1000
    for clip in rigged["animations"]:
        targets = {(c['target']['node'], c['target']['path']) for c in clip['channels']}
        assert all((2 + index, 'rotation') in targets for index in range(17)), 'A clip cannot reset every joint during a fade.'
        for c in clip['channels']:
            bone = c['target']['node'] - 2
            if c['target']['path'] == 'rotation' and bone in (INDEX['LeftLowerArm'], INDEX['RightLowerArm']):
                output = clip['samplers'][c['sampler']]['output']
                # Forward elbow flex has a negative X component on this rig.
                assert all(q[0] < 0 for q in struct.iter_unpack('<4f', data(rigged, rigged_blob, output))), 'An elbow bends backwards.'
        if clip['name'] == 'Walk':
            curves = {(c['target']['node'] - 2, c['target']['path']):
                      list(struct.iter_unpack('<4f' if c['target']['path'] == 'rotation' else '<3f',
                           data(rigged, rigged_blob, clip['samplers'][c['sampler']]['output'])))
                      for c in clip['channels']}
            for values in curves.values():
                assert all(abs(a-b) < 1e-6 for a, b in zip(values[0], values[-1])), 'The walk loop has a jump.'
            for side, offset in (('Left', 0), ('Right', .5)):
                thigh_index, knee_index, foot_index = [INDEX[side + part] for part in ('UpperLeg', 'LowerLeg', 'Foot')]
                hip, knee, foot = [BONES[index][2] for index in (thigh_index, knee_index, foot_index)]
                knee_angles = []
                for i, hips in enumerate(curves[(INDEX['Hips'], 'translation')]):
                    angles = [2*math.atan2(curves[(index, 'rotation')][i][0], curves[(index, 'rotation')][i][3])
                              for index in (thigh_index, knee_index, foot_index)]
                    thigh_angle, flex, foot_angle = angles
                    knee_angles.append(flex)
                    assert flex >= 0, 'A knee bends backwards.'
                    # Forward kinematics from exported keys, not from the generator solver.
                    upper_q, lower_q, foot_q = [curves[(index, 'rotation')][i] for index in (thigh_index, knee_index, foot_index)]
                    lower_world = multiply(upper_q, lower_q)
                    foot_world = multiply(lower_world, foot_q)
                    assert max(abs(n) for n in foot_world[:3]) < 1e-5, 'A stance boot loses its flat sole.'
                    link1 = rotate(tuple(knee[k]-hip[k] for k in range(3)), upper_q)
                    link2 = rotate(tuple(foot[k]-knee[k] for k in range(3)), lower_world)
                    ankle = tuple(hip[k] + hips[k] - BONES[INDEX['Hips']][2][k] + link1[k] + link2[k] for k in range(3))
                    ankle_y, ankle_z = ankle[1:]
                    assert .08 < abs(ankle[0]) < .12, 'A walk foot moves too far to the side.'
                    u = (i/(len(curves[(INDEX['Hips'], 'translation')])-1) + offset) % 1
                    assert ankle_y >= .13999, 'A foot sinks below the floor.'
                    if u <= .5:
                        assert abs(ankle_y-.14) < 1e-5, 'A stance foot floats.'
                        assert abs(ankle_z - (hip[2] + .31*(1-4*u))) < 1e-5, 'A stance step has uneven speed.'
                    if abs(u-.75) < 1e-6:
                        assert ankle_y > .23, 'A swing foot does not clear the floor.'
                assert math.radians(50) < max(knee_angles) < math.radians(85), 'The swing knee has too little or too much bend.'
    for view in rigged["bufferViews"]:
        assert view.get("byteOffset", 0) + view["byteLength"] <= len(rigged_blob)
    print(f"PASS: source data unchanged; {len(BONES)} bones; two complete clips; weights sum to 1; {checked_arm_vertices} arm vertices have no leg weights; {checked_leg_vertices} boot/leg vertices keep their shape; knees bend forwards; stance feet stay on the floor; swing feet lift 10 cm; loop has no jump")


if __name__ == "__main__":
    main()
