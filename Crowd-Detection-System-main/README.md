# 🚨 AI Crowd Detection & Heatmap Monitoring System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-red?style=for-the-badge)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-green?style=for-the-badge&logo=opencv)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

### Gemma 4 Person Detection • Vision Analysis • Human-Reviewed Safety Alerts

---

Use **Gemma 4** to detect people in sampled camera frames, estimate normalized bounding boxes, and assess crowd safety. YOLOv8 remains available as a faster local detector. Gemma can also select an allowlisted action: continue monitoring or request a human safety-operator review through Telegram.

⭐ If you like this project, don't forget to star the repository!

</div>

---

# ✨ Features

- 👤 Sampled-frame person detection and boxes using Gemma 4, or local YOLOv8
- 📊 Live Crowd Counting
- 🔥 Dynamic Heatmap Generation
- 🚨 Overcrowding Detection
- 📍 High Density Zone Detection
- 📲 Telegram Alert Notifications
- 🎥 Webcam & Video Support
- ⚙ Adjustable Detection Thresholds
- 🟢 Lightweight & Fast Inference
- 📈 Grid-Based Crowd Density Analysis
- 👁️ Optional Gemma 4 visual analysis of sampled camera frames
- 🧭 Combined reasoning over visual evidence and YOLO counts/hotspots
- 🧰 Gemma function calls select from validated, allowlisted safety actions
- 🧑‍✈️ Human-review notifications only; no automatic physical controls or emergency-service calls
- ⚡ Gemma runs in a background worker so camera inference and display continue during API calls

---

# 🏗 Project Architecture

```text
       Camera / Video
             │
       ┌─────┴─────────────┐
       ▼                   ▼
 YOLOv8 detector      Gemma 4 vision
 local / optional     sampled frames
       │                   │
       └─────────┬─────────┘
                 ▼
         Counts + heatmap
                 │
       Gemma safety reasoning
                 ▼
        Validated action policy
         ┌────────┴─────────┐
         ▼                  ▼
 Continue monitoring   Request human review
                            │
                       Telegram alert
```

---

# 🖥 Output

## Live Detection

✔ Person Detection

✔ Crowd Counter

✔ Heatmap Overlay

✔ High Density Highlight

✔ Telegram Alerts

---

# ⚡ Tech Stack

| Technology | Usage |
|------------|-------|
| Python | Programming Language |
| YOLOv8 | Person Detection |
| OpenCV | Image Processing |
| NumPy | Matrix Operations |
| Requests | Telegram API |
| Python-dotenv | Environment Variables |
| Google Gen AI SDK | Gemma 4 image analysis, reasoning, and tool calls |

---

# 📂 Project Structure

```
AI-Crowd-Detection-System
│
├── detect_final.py
├── requirements.txt
├── README.md
├── .gitignore
├── heatmap.png
```


---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/shahjinay22/Crowd-Detection-System.git
```

Move into project

```bash
cd Crowd-Detection-System
```

Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ▶ Run

### Webcam

```bash
python detect_final.py --video 0
```

### Video

```bash
python detect_final.py --video crowd.mp4
```

### Gemma 4 vision and safety-action mode

Gemma inspects a sampled, unmodified camera frame along with YOLO's person count, configured crowd threshold, and hot grid cells. It uses tool calling to choose between `continue_monitoring` and `notify_safety_operator`. The application validates the returned fields and executes only the notification tool. Notifications are limited to one per minute. YOLO's normal Telegram threshold alerts remain available independently.

When enabled, sampled frames are sent to Google's Gemini API using the selected Gemma model. Choose an appropriate camera/privacy policy before enabling cloud vision analysis. API requests run in one background worker; Gemma's analysis is not real time and must not be treated as an emergency detection guarantee. Operator review is required before taking action.

Add credentials to a local `.env` file (it is ignored by Git):

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
```

The Gemini API key enables frame analysis. Telegram credentials enable operator notifications and the existing threshold alerts. To use Gemma as the person detector, run:

```bash
python detect_final.py --video 0 --detector gemma
```

Gemma returns estimated person boxes from sampled images. The default sampling interval in Gemma detector mode is 2 seconds; each request sends a camera frame to Google's API and detection updates depend on API latency. Counts and boxes may be less consistent than YOLO and are not a real-time safety guarantee. Older Gemma boxes are marked stale and excluded from counts. API failures leave the video display running; in Gemma detector mode, detection counts pause until a new result arrives.

The supported API model IDs are `gemma-4-26b-a4b-it` (default) and `gemma-4-31b-it`; choose with `--gemma_model`. For Gemma safety analysis alongside YOLO, use `--detector yolo --gemma --gemma_interval 10`.

Gemma 4 does not have a 9B variant. Google lists 9B under Gemma 2; the current Gemma 4 family includes E2B, E4B, 12B, 26B A4B, and 31B variants. Use YOLO when you need local, frame-by-frame detection; Gemma mode is sampled and API-dependent.

---

# ⚙ Command Line Options

| Parameter | Description |
|-----------|-------------|
| --video | Webcam or Video Path |
| --model | YOLO Model |
| --conf | Detection Confidence |
| --grid | Grid Size |
| --hot | High Density Threshold |
| --max_people | Overcrowding Threshold |
| --detector | Person detector: `gemma` (sampled API vision) or `yolo` (local real-time detection; default) |
| --gemma | Add Gemma vision review and allowlisted operator-notification actions alongside YOLO |
| --gemma_model | Gemma API model ID (default: `gemma-4-26b-a4b-it`) |
| --gemma_interval | Seconds between sampled frames (default: 2 for Gemma detector, 10 for YOLO plus Gemma) |

Example

```bash
python detect_final.py --video crowd.mp4 --grid 5 --hot 3 --max_people 20
```

---

# 🚨 Alert System

## High Density Zone

Whenever a grid cell exceeds the configured threshold, it is highlighted in **Red** and an alert is generated.

## Overcrowding Alert

If the total number of detected people exceeds the configured limit, the system instantly sends a **Telegram Notification**.

Example

```
🚨 OVERCROWD ALERT

People Detected : 25

Threshold : 20

Time : 2026-07-01
```

---

# 📊 Heatmap Legend

🔵 Low Density

🟡 Medium Density

🔴 High Density

---

# 🎯 Applications

🏟 Stadium Monitoring

🚉 Railway Stations

🏫 College Campus

🏥 Hospitals

🛍 Shopping Malls

🎤 Concerts

🏭 Industrial Safety

🚦 Smart City Surveillance

---

# 🚀 Future Improvements

- Multi-Camera Support
- Cloud Dashboard
- Face Recognition
- Audio Alarm
- Database Logging
- Web Dashboard
- AI Crowd Prediction
- Mobile App Integration

---

# 🤝 Contributing

Contributions are welcome!

Fork the repository.

Create your feature branch.

Commit your changes.

Push to your branch.

Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Made with ❤️ using Python, YOLOv8 and OpenCV

⭐ Star this repository if you found it useful!

</div>
