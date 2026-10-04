"""Fast optical-flow tracking seeded by Gemma's sampled-frame detections."""

from __future__ import annotations

import cv2
import numpy as np

from gemma_pipeline import normalized_box_to_pixels


class OpticalFlowTracker:
    """Propagate person boxes between Gemma calls; this does not identify faces."""

    TRACK_WIDTH = 480
    MAX_FEATURES_PER_PERSON = 40
    MIN_TRACKED_FEATURES = 3

    def __init__(self):
        self.previous_gray = None
        self.tracks = []
        self.next_id = 1

    @classmethod
    def to_gray(cls, frame):
        height, width = frame.shape[:2]
        scale = min(1.0, cls.TRACK_WIDTH / width)
        if scale < 1.0:
            frame = cv2.resize(
                frame,
                (cls.TRACK_WIDTH, max(1, int(height * scale))),
                interpolation=cv2.INTER_AREA,
            )
        return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    def _features_in_box(self, gray, box):
        x1, y1, x2, y2 = box
        mask = np.zeros_like(gray)
        inset_x = max(1, int((x2 - x1) * 0.12))
        inset_y = max(1, int((y2 - y1) * 0.12))
        inner = (x1 + inset_x, y1 + inset_y, x2 - inset_x, y2 - inset_y)
        if inner[2] <= inner[0] or inner[3] <= inner[1]:
            inner = box
        cv2.rectangle(mask, (inner[0], inner[1]), (inner[2], inner[3]), 255, -1)
        points = cv2.goodFeaturesToTrack(
            gray,
            maxCorners=self.MAX_FEATURES_PER_PERSON,
            qualityLevel=0.01,
            minDistance=3,
            mask=mask,
            blockSize=5,
        )
        return points

    def seed(self, persons, sampled_frame):
        """Start tracks from validated Gemma boxes on the exact analyzed frame."""
        gray = self.to_gray(sampled_frame)
        frame_h, frame_w = gray.shape[:2]
        self.tracks = []
        for person in persons:
            box = normalized_box_to_pixels(person["box_2d"], frame_w, frame_h)
            points = self._features_in_box(gray, box)
            if points is None or len(points) < self.MIN_TRACKED_FEATURES:
                continue
            self.tracks.append({"id": self.next_id, "box": box, "points": points, "lost": False})
            self.next_id += 1
        self.previous_gray = gray
        return len(self.tracks)

    def update_gray(self, gray):
        """Move boxes using sparse Lucas-Kanade optical flow on a grayscale frame."""
        if self.previous_gray is None:
            self.previous_gray = gray
            return
        frame_h, frame_w = gray.shape[:2]
        for track in self.tracks:
            points = track["points"]
            if track["lost"] or points is None or len(points) < self.MIN_TRACKED_FEATURES:
                track["lost"] = True
                continue
            next_points, status, _error = cv2.calcOpticalFlowPyrLK(
                self.previous_gray,
                gray,
                points,
                None,
                winSize=(21, 21),
                maxLevel=3,
                criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 20, 0.03),
            )
            if next_points is None or status is None:
                track["lost"] = True
                continue
            good = status.reshape(-1).astype(bool)
            old = points.reshape(-1, 2)[good]
            new = next_points.reshape(-1, 2)[good]
            if len(new) < self.MIN_TRACKED_FEATURES:
                track["lost"] = True
                continue
            deltas = new - old
            dx, dy = np.median(deltas, axis=0)
            x1, y1, x2, y2 = track["box"]
            box_w, box_h = x2 - x1, y2 - y1
            # Reject implausible jumps from mismatched features or occlusion.
            if abs(dx) > max(box_w * 0.6, 50) or abs(dy) > max(box_h * 0.6, 50):
                track["lost"] = True
                continue
            x1 = int(round(np.clip(x1 + dx, 0, max(frame_w - 1, 0))))
            y1 = int(round(np.clip(y1 + dy, 0, max(frame_h - 1, 0))))
            x2 = int(round(np.clip(x1 + box_w, x1 + 1, frame_w)))
            y2 = int(round(np.clip(y1 + box_h, y1 + 1, frame_h)))
            track["box"] = (x1, y1, x2, y2)
            track["points"] = new.reshape(-1, 1, 2).astype(np.float32)
        self.previous_gray = gray

    def update(self, frame):
        self.update_gray(self.to_gray(frame))

    def boxes(self, width, height):
        """Return active track IDs and boxes mapped to the requested frame size."""
        if self.previous_gray is None:
            return []
        track_h, track_w = self.previous_gray.shape[:2]
        scale_x, scale_y = width / track_w, height / track_h
        active = []
        for track in self.tracks:
            if track["lost"]:
                continue
            x1, y1, x2, y2 = track["box"]
            active.append((
                track["id"],
                int(x1 * scale_x), int(y1 * scale_y),
                min(int(x2 * scale_x), width - 1),
                min(int(y2 * scale_y), height - 1),
            ))
        return active

    def preserve_ids(self, previous_boxes):
        """Reuse IDs across a new Gemma sample when current boxes overlap."""
        current = [track for track in self.tracks if not track["lost"]]
        matches = []
        for new_index, track in enumerate(current):
            x1, y1, x2, y2 = track["box"]
            for old_id, ox1, oy1, ox2, oy2 in previous_boxes:
                intersection = max(0, min(x2, ox2) - max(x1, ox1)) * max(
                    0, min(y2, oy2) - max(y1, oy1)
                )
                area_new = (x2 - x1) * (y2 - y1)
                area_old = (ox2 - ox1) * (oy2 - oy1)
                union = area_new + area_old - intersection
                overlap = intersection / union if union > 0 else 0
                if overlap >= 0.15:
                    matches.append((overlap, new_index, old_id))
        used_new, used_old = set(), set()
        for _overlap, new_index, old_id in sorted(matches, reverse=True):
            if new_index not in used_new and old_id not in used_old:
                current[new_index]["id"] = old_id
                used_new.add(new_index)
                used_old.add(old_id)
