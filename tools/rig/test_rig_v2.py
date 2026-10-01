"""File regression checks for the local rig runner."""
from __future__ import annotations

import hashlib
from pathlib import Path
import tempfile
import unittest

from generate_rig_v2 import OUTPUT, ROOT, SOURCE, generate, read_checked, write_glb
from validate_rig_v2 import validate


class RigChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="rig-check-", dir=ROOT / "tools/rig")
        self.folder = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def changed(self, mutate):
        doc, blob = read_checked(OUTPUT)
        mutate(doc)
        output = self.folder / "changed.glb"
        write_glb(doc, blob, output)
        return output

    def test_repeat_output_keeps_proven_source(self):
        before = SOURCE.read_bytes()
        first = generate(self.folder / "first.glb")
        second = generate(self.folder / "second.glb")
        self.assertEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual(hashlib.sha256(first.read_bytes()).hexdigest(), validate(first)["outputSHA256"])
        self.assertEqual(before, SOURCE.read_bytes())

    def test_reject_truncated_binary(self):
        output = self.folder / "cut.glb"
        output.write_bytes(OUTPUT.read_bytes()[:-4])
        with self.assertRaises(ValueError):
            validate(output)

    def test_reject_wrong_clip_name(self):
        output = self.changed(lambda doc: doc["animations"][2].update(name="RunWrong"))
        with self.assertRaises(AssertionError):
            validate(output)

    def test_reject_wrong_speed(self):
        output = self.changed(lambda doc: doc["animations"][1]["extras"].update(authoredSpeed=1.3))
        with self.assertRaises(AssertionError):
            validate(output)

    def test_reject_bad_loop_flag(self):
        output = self.changed(lambda doc: doc["animations"][2]["extras"].update(loop=False))
        with self.assertRaises(AssertionError):
            validate(output)

    def test_reject_detached_hand_grip(self):
        def detach(doc):
            names = {node.get("name"): i for i, node in enumerate(doc["nodes"])}
            doc["nodes"][names["LeftHand"]]["children"].remove(names["leftHandGrip"])
        with self.assertRaises(AssertionError):
            validate(self.changed(detach))

    def test_proven_source_cannot_be_overwritten(self):
        with self.assertRaises(ValueError):
            generate(SOURCE)


if __name__ == "__main__":
    unittest.main()
