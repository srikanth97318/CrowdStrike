# 🛡️ CrowdGuard AI — Real-time Crowd Intelligence & Safety Platform

A command-center dashboard built for optical crowd monitoring, spatial density heatmap visualization, YOLOv8 person detection, and Gemma 4 vision safety advisory review.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Zustand**, and **Recharts**.

---
https://drive.google.com/file/d/1SOi-pb3FK8QNELM1xXqk0xI1orvAI6L3/view?usp=sharing

## 🚀 Key Features

- **Surveillance Command Center (`/dashboard`)**:
  - Live video viewport with HUD overlays (FPS counter, detection model, timestamp, count badges).
  - 6 Real-time KPI Metric Cards: People Detected, Crowd Threshold, Density Status, Hot Zones, AI Confidence, Alerts Today.
  - Spatial Crowd Density Map ($N \times N$ cells) with Jet Colormap matching `detect_final.py`.
  - Matrix Distribution Grid with animated count transitions and hot-cell alerts.
  - Gemma 4 Vision Advisory panel with human review safeguards.
  - Dual Detection Engine (YOLOv8 + Gemma) & Telegram Bot status integration.

- **Dedicated Live Monitor (`/monitor`)**:
  - High-resolution camera viewport with interactive layer toggles: Heatmap Layer, Spatial Grid, YOLO Bounding Boxes, High-Density Highlights.
  - Play / Pause surveillance control, Frame Snapshot export (PNG), and Fullscreen mode.
  - Interactive parameter controls: Overcrowd limit, Hot-cell density, Spatial grid size ($2\times2$ to $8\times8$), Detection confidence, and Heatmap alpha.

- **Historical Crowd Analytics (`/analytics`)**:
  - Temporal area chart of crowd count vs safety threshold.
  - Zonal facility density comparison (horizontal bar chart).
  - Categorical alert distribution (donut chart).
  - Time-range filters (15m, 1h, Today, 7d) and one-click CSV report export.

- **Incident & Advisory Register (`/alerts`)**:
  - Searchable and filterable table of safety alerts (Overcrowd surges, High-density zones, AI advisories, System warnings).
  - Incident details modal with recommended human operator actions.
  - One-click alert acknowledgment and resolution.

- **System Architecture & Parameters (`/settings`)**:
  - Direct control of runtime CLI parameters (`--conf`, `--grid`, `--hot`, `--max_people`, `--alpha`, `--detector`, `--gemma_model`, `--gemma_interval`).
  - Seamless toggle between **DEMO MODE (Simulation)** and **LIVE BACKEND (FastAPI)**.
  - Built-in Web Audio API operator alert chime toggle.

---

## 💻 How to Run the Frontend

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Quick Start
```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start development server
npm run dev
```

The application will be live at:
👉 **`http://localhost:5173`**

### Production Build
```bash
npm run build
npm run preview
```

---

## ⚡ How Demo Mode Works

When you launch the frontend, it defaults to **DEMO MODE**:
1. **Realistic Crowd Simulation**: Dynamically models pedestrians entering and leaving the facility (fluctuating realistically between 14 and 25 people).
2. **Dynamic Overcrowding Alerts**: When the simulated count meets or exceeds the configured threshold (default: 20), the command center triggers the critical red state, displays an overlay banner, and logs a high-priority alert.
3. **Spatial Hot Zones**: When any grid cell exceeds the configured hot threshold (default: 2), the cell is highlighted with a red outline and a `HIGH DENSITY ZONE` badge.
4. **Gemma 4 Advisory Rotation**: Rotates through realistic scene observations with recommended checks for human safety operators.
5. **No Backend Required**: You can test, showcase, and demonstrate the entire platform offline at hackathons or presentations without running Python.

A status chip in the top header and sidebar clearly indicates `[DEMO MODE]` or `[LIVE BACKEND]`.

---

## 🔌 How to Connect the Python Backend

We have provided a ready-to-run FastAPI server in `backend/api_server.py`.

### 1. Install Python Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Credentials (Optional)
Create a `.env` file in `backend/` or the root with your secrets:
```dotenv
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
GEMINI_API_KEY=your_gemini_api_key
```
*(Secrets are kept strictly on the backend and are NEVER exposed to the frontend).*

### 3. Start the FastAPI Detection & Telemetry Server
```bash
python backend/api_server.py
# or: uvicorn backend.api_server:app --host 0.0.0.0 --port 8000
```
*(The backend runs on `http://localhost:8000` with dedicated binary camera streaming at `ws://localhost:8000/ws/camera` and telemetry at `ws://localhost:8000/ws/monitor`).*

### 4. Real-time Camera & Video Detection
In the **Live Monitor** (`/monitor`):
- Click **USE MY CAMERA** to stream browser webcam frames directly to YOLOv8 over WebSocket.
- Or click **PROVIDE A VIDEO** to upload an MP4/WebM video file for live frame-by-frame inference.
- Real bounding boxes (`PERSON {confidence}%`), live counts, and diagnostics (FPS, latency) render instantaneously with sub-100ms latency.
- Crowd threshold alerts trigger automatically when detected count exceeds your safety limit.

