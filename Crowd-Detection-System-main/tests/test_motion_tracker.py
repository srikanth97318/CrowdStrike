import unittest

import numpy as np

from motion_tracker import OpticalFlowTracker


class OpticalFlowTrackerTests(unittest.TestCase):
    def test_box_follows_motion_between_gemma_samples(self):
        rng = np.random.default_rng(42)
        frame = np.zeros((240, 320, 3), dtype=np.uint8)
        textured_person = rng.integers(20, 240, (80, 70, 3), dtype=np.uint8)
        frame[60:140, 70:140] = textured_person

        tracker = OpticalFlowTracker()
        seeded = tracker.seed([{"box_2d": [250, 218, 583, 437]}], frame)
        self.assertEqual(seeded, 1)
        before = tracker.boxes(320, 240)[0]

        moved_frame = np.zeros_like(frame)
        moved_frame[60:140, 80:150] = textured_person
        tracker.update(moved_frame)
        after = tracker.boxes(320, 240)[0]

        self.assertEqual(after[0], before[0])
        self.assertGreater(after[1], before[1])
        self.assertGreaterEqual(after[1] - before[1], 8)
        self.assertLessEqual(after[1] - before[1], 12)

    def test_empty_detection_clears_tracks(self):
        frame = np.zeros((120, 160, 3), dtype=np.uint8)
        tracker = OpticalFlowTracker()
        tracker.seed([], frame)
        self.assertEqual(tracker.boxes(160, 120), [])

    def test_overlapping_gemma_refresh_preserves_track_id(self):
        rng = np.random.default_rng(7)
        frame = np.zeros((240, 320, 3), dtype=np.uint8)
        frame[60:140, 70:140] = rng.integers(20, 240, (80, 70, 3), dtype=np.uint8)
        persons = [{"box_2d": [250, 218, 583, 437]}]
        tracker = OpticalFlowTracker()
        tracker.seed(persons, frame)
        previous = tracker.boxes(320, 240)

        tracker.seed(persons, frame)
        self.assertNotEqual(tracker.boxes(320, 240)[0][0], previous[0][0])
        tracker.preserve_ids(previous)
        self.assertEqual(tracker.boxes(320, 240)[0][0], previous[0][0])


if __name__ == "__main__":
    unittest.main()
