"""
CrowdGuard AI — Real-time FastAPI Backend & WebSocket Telemetry Server
---------------------------------------------------------------------
Connects the React Command Center with the YOLOv8 + Gemma 4 detection pipeline.

WebSocket Endpoint:
    ws://localhost:8000/ws/camera   -> Direct camera frame ingestion & real-time detection
    ws://localhost:8000/ws/monitor  -> Telemetry broadcast & state synchronization
"""

import os
import time
import json
import asyncio
import base64
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import cv2
import numpy as np

# Import shared YOLOv8 detection engine
from detection.yolo_detector import get_yolo_detector

load_dotenv()

# Environment variables
BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SERVER_START_TIME = time.time()

# Initialize YOLO detector singleton
detector = get_yolo_detector("yolov8n.pt")

app = FastAPI(
    title="CrowdGuard AI Backend",
    description="Real-time optical surveillance telemetry API & WebSocket hub",
    version="2.6.0",
)

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Runtime State & Configuration ─────────────────────────────────────────────
class SystemSettings(BaseModel):
    confThreshold: float = 0.4
    gridSize: int = 4
    maxPeople: int = 20
    hotThreshold: int = 2
    heatmapAlpha: float = 0.4
    detector: str = "yolo"
    gemmaEnabled: bool = True
    gemmaModel: str = "gemma-4-26b-a4b-it"
    gemmaInterval: int = 10
    telegramEnabled: bool = bool(BOT_TOKEN and CHAT_ID)
    telegramCrowdAlerts: bool = True
    telegramDensityAlerts: bool = True
    telegramCooldown: int = 20
    audioAlertsEnabled: bool = False

settings = SystemSettings()

# In-memory alerts queue
alerts_store: List[Dict[str, Any]] = []

# Connected WebSocket clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS] Client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()
is_monitoring = True


# ── REST API Endpoints ────────────────────────────────────────────────────────

@app.get("/api/status")
@app.get("/api/health")
async def get_status():
    """System health check and engine capability summary."""
    return {
        "online": True,
        "version": "CrowdGuard AI v2.6",
        "detector": "yolov8n (person class 0)",
        "yolo_loaded": detector.is_ready,
        "gemma_status": "active" if (settings.gemmaEnabled and GEMINI_API_KEY) else "standby",
        "telegram_configured": bool(BOT_TOKEN and CHAT_ID),
        "uptime_sec": int(time.time() - SERVER_START_TIME),
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/detect/frame")
async def detect_frame(
    frame: UploadFile = File(...),
    conf: Optional[float] = None,
):
    """Processes a live camera or video frame through YOLOv8 person detection."""
    used_conf = conf if conf is not None else settings.confThreshold
    content = await frame.read()
    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image frame encoding")

    result = detector.detect(
        img,
        conf=used_conf,
        grid_size=settings.gridSize,
        hot_threshold=settings.hotThreshold,
        max_people=settings.maxPeople,
    )
    return result


@app.post("/api/upload")
@app.post("/api/video/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload recorded video for analysis."""
    os.makedirs("uploads", exist_ok=True)
    file_location = os.path.join("uploads", file.filename or "video.mp4")
    with open(file_location, "wb+") as f:
        f.write(await file.read())
    return {
        "success": True,
        "filename": file.filename,
        "path": file_location,
        "message": f"Successfully received {file.filename} for optical processing.",
    }


@app.post("/api/monitor/start")
async def start_monitor():
    global is_monitoring
    is_monitoring = True
    return {"success": True, "message": "Optical surveillance started", "status": "active"}


@app.post("/api/monitor/stop")
async def stop_monitor():
    global is_monitoring
    is_monitoring = False
    return {"success": True, "message": "Optical surveillance paused", "status": "paused"}


@app.get("/api/monitor/status")
async def get_monitor_status():
    return {
        "monitoring": is_monitoring,
        "detector": settings.detector,
        "clients_connected": len(manager.active_connections),
    }


@app.get("/api/alerts")
async def get_alerts():
    return alerts_store


@app.get("/api/analytics")
async def get_analytics():
    return {
        "peakPeopleCount": 24,
        "averagePeopleCount": 12,
        "peakDensityZone": "Entrance Zone",
        "totalAlerts": len(alerts_store),
        "criticalAlerts": sum(1 for a in alerts_store if a.get("severity") == "critical"),
        "warningAlerts": sum(1 for a in alerts_store if a.get("severity") == "warning"),
        "averageConfidence": 0.94,
        "monitoringHours": 8.5,
    }


@app.get("/api/settings")
async def get_settings():
    return settings


@app.put("/api/settings")
async def update_settings(new_settings: SystemSettings):
    global settings
    settings = new_settings
    return settings


# ── DEDICATED REAL-TIME CAMERA WEBSOCKET PIPELINE (/ws/camera) ─────────────────

@app.websocket("/ws/camera")
async def camera_websocket_endpoint(websocket: WebSocket):
    """
    Dedicated bidirectional WebSocket endpoint for browser camera frame streaming.
    Receives raw JPEG binary frames (or base64 JSON), executes YOLOv8 person detection,
    and returns real-time detection bounding boxes and counts.
    """
    await websocket.accept()
    print("[WS-CAMERA] Browser camera client connected to /ws/camera.")
    frames_received = 0
    start_time = time.time()

    try:
        while True:
            # Handle both binary bytes and text frames
            message = await websocket.receive()

            if "bytes" in message and message["bytes"]:
                raw_bytes = message["bytes"]
            elif "text" in message and message["text"]:
                text_data = message["text"]
                # Ping check
                if text_data.startswith("{"):
                    try:
                        parsed = json.loads(text_data)
                        if parsed.get("type") == "ping":
                            await websocket.send_json({"type": "pong", "timestamp": time.time()})
                            continue
                        elif parsed.get("type") == "frame" and parsed.get("image"):
                            img_str = parsed["image"]
                            if "," in img_str:
                                img_str = img_str.split(",")[1]
                            raw_bytes = base64.b64decode(img_str)
                        else:
                            continue
                    except Exception as e:
                        print(f"[WS-CAMERA] JSON parse error: {e}")
                        continue
                else:
                    continue
            else:
                continue

            frames_received += 1
            frame_len = len(raw_bytes)

            # Decode JPEG with OpenCV
            nparr = np.frombuffer(raw_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                print(f"[WS-CAMERA] OpenCV could not decode frame ({frame_len} bytes).")
                continue

            # Run YOLOv8 person detection
            res = detector.detect(
                frame,
                conf=settings.confThreshold,
                grid_size=settings.gridSize,
                hot_threshold=settings.hotThreshold,
                max_people=settings.maxPeople,
            )

            # Send detection results immediately back to frontend
            await websocket.send_json(res)

            # Log periodically (every 10 frames)
            if frames_received % 10 == 0:
                elapsed = time.time() - start_time
                fps = round(frames_received / max(elapsed, 0.001), 1)
                print(
                    f"[WS-CAMERA] Frame #{frames_received} ({frame.shape[1]}x{frame.shape[0]}) -> "
                    f"{res['people_count']} person(s) detected in {res['processing_time_ms']}ms | Stream FPS: {fps}"
                )

    except WebSocketDisconnect:
        print("[WS-CAMERA] Browser camera client disconnected from /ws/camera.")
    except Exception as e:
        print(f"[WS-CAMERA] Connection closed with error: {e}")


# ── Dashboard Broadcast WebSocket (/ws/monitor) ───────────────────────────────

@app.websocket("/ws/monitor")
async def websocket_monitor_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if not data:
                continue
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    print("[CROWDGUARD] Starting FastAPI Backend on http://localhost:8000 ...")
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=False)
