import os
import time
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
from ultralytics import YOLO

class YOLODetector:
    """
    Production-grade YOLOv8 person detector.
    Reuses the detection, grid mapping, and threshold logic from detect_final.py.
    """
    PERSON_CLASS_ID = 0

    def __init__(self, model_path: str = "yolov8n.pt"):
        # Resolve model path (look in current dir, backend/, or let ultralytics load it)
        if not os.path.exists(model_path):
            alt_path = os.path.join(os.path.dirname(__file__), "..", "..", model_path)
            if os.path.exists(alt_path):
                model_path = alt_path

        print(f"[YOLO] Initializing YOLODetector with weights: {model_path}")
        self.model = YOLO(model_path)
        self.is_ready = True
        print("[YOLO] YOLODetector ready for real-time person inference.")

    def detect(
        self,
        frame: np.ndarray,
        conf: float = 0.4,
        grid_size: int = 4,
        hot_threshold: int = 2,
        max_people: int = 20,
        inference_size: int = 640,
    ) -> Dict[str, Any]:
        """
        Runs person detection on frame and computes spatial metrics.
        Scales bounding box coordinates back to the original frame dimensions.
        """
        start_time = time.time()
        orig_h, orig_w = frame.shape[:2]

        if orig_h == 0 or orig_w == 0:
            return {
                "type": "detection",
                "timestamp": time.time(),
                "people_count": 0,
                "confidence": 0.0,
                "detections": [],
                "frame_width": 0,
                "frame_height": 0,
                "grid": [],
                "hot_cells": [],
                "overcrowd": False,
                "threshold": max_people,
                "processing_time_ms": 0.0,
                "yolo_active": self.is_ready,
            }

        # Optimized inference scaling: maintain aspect ratio with max dimension = inference_size
        scale = min(inference_size / orig_w, inference_size / orig_h)
        if scale < 1.0:
            inf_w = int(orig_w * scale)
            inf_h = int(orig_h * scale)
            inf_frame = cv2.resize(frame, (inf_w, inf_h), interpolation=cv2.INTER_LINEAR)
            scale_x = orig_w / inf_w
            scale_y = orig_h / inf_h
        else:
            inf_frame = frame
            scale_x = 1.0
            scale_y = 1.0

        # Execute YOLO inference strictly for Class 0 (Person)
        results = self.model(
            inf_frame,
            classes=[self.PERSON_CLASS_ID],
            conf=conf,
            verbose=False,
        )

        detections: List[Dict[str, Any]] = []
        confidences: List[float] = []

        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                cls_id = int(box.cls[0])
                if cls_id != self.PERSON_CLASS_ID:
                    continue

                c = float(box.conf[0])
                rx1, ry1, rx2, ry2 = map(float, box.xyxy[0])

                # Scale coordinates back to original frame size
                x1 = int(rx1 * scale_x)
                y1 = int(ry1 * scale_y)
                x2 = int(rx2 * scale_x)
                y2 = int(ry2 * scale_y)

                # Clamp to frame boundary
                x1 = max(0, min(orig_w - 1, x1))
                y1 = max(0, min(orig_h - 1, y1))
                x2 = max(x1 + 1, min(orig_w, x2))
                y2 = max(y1 + 1, min(orig_h, y2))

                detections.append({
                    "class": "person",
                    "confidence": round(c, 3),
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                })
                confidences.append(c)

        # ── Spatial Grid and Feet Mapping (matching detect_final.py) ──────────
        cell_w = max(orig_w // grid_size, 1)
        cell_h = max(orig_h // grid_size, 1)
        grid_counts = np.zeros((grid_size, grid_size), dtype=int)

        for d in detections:
            # Map person's feet to grid cell
            cx = (d["x1"] + d["x2"]) // 2
            cy = d["y2"]
            col = min(cx // cell_w, grid_size - 1)
            row = min(cy // cell_h, grid_size - 1)
            grid_counts[row, col] += 1

        hot_cells = []
        for r in range(grid_size):
            for c in range(grid_size):
                count = int(grid_counts[r, c])
                if count >= hot_threshold:
                    hot_cells.append({"row": r, "col": c, "count": count})

        person_count = len(detections)
        overcrowd = person_count >= max_people
        avg_conf = float(np.mean(confidences)) if confidences else 0.0
        elapsed_ms = round((time.time() - start_time) * 1000, 1)

        return {
            "type": "detection",
            "timestamp": time.time(),
            "people_count": person_count,
            "confidence": round(avg_conf, 3),
            "detections": detections,
            "frame_width": orig_w,
            "frame_height": orig_h,
            "grid": grid_counts.tolist(),
            "hot_cells": hot_cells,
            "overcrowd": overcrowd,
            "threshold": max_people,
            "hot_threshold": hot_threshold,
            "processing_time_ms": elapsed_ms,
            "yolo_active": True,
        }

# Global shared detector singleton
_detector_instance: Optional[YOLODetector] = None

def get_yolo_detector(model_path: str = "yolov8n.pt") -> YOLODetector:
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = YOLODetector(model_path)
    return _detector_instance
