# Gemma 4 Crowd Safety Monitor

A camera and video crowd-monitoring prototype powered by **Gemma 4** through the Gemini API. Gemma is the project's only detection and reasoning model: it inspects sampled frames, estimates visible people and their locations, assesses crowd risk, and recommends whether a human operator should review the scene.

The application turns Gemma's validated person boxes into a count, configurable spatial grid, density heatmap, and rate-limited Telegram advisories. It does not use YOLO or another detection model.

## Problem

Crowd operators need a quick way to see how many people appear in an area, where the denser groups are, and when a human should inspect a scene. This prototype combines sampled visual analysis with a spatial heatmap and a human-review notification path.

## Why Gemma 4

Gemma 4 is the core visual perception and reasoning model, rather than a text-only report writer after another model performs detection. For every sampled image, Gemma returns one structured function call containing estimated person boxes, a count, crowding and risk assessments, an allowed action, and an explanation. The app validates that result and calculates grid occupancy from the boxes.

The default Gemini API model ID is `gemma-4-26b-a4b-it`. The API's currently documented Gemma 4 model IDs are `gemma-4-26b-a4b-it` and `gemma-4-31b-it`. See Google's [Gemma API guide](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api) and [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4).

## Architecture

```text
Webcam or video
       │
       ▼
Sample one frame (default every 2 seconds)
       │
       ▼
       Gemma 4 vision + reasoning (Gemini API)
       │
       ▼
Structured analysis function call
       │
       ├── Estimated person boxes and count
       ├── Risk, crowding, observations, reason
       └── continue_monitoring | notify_safety_operator
       │
       ▼
Validate response and reject stale results
       │
       ▼
Convert boxes → count grid cells → density heatmap
       │
       ├── Reseed optical-flow tracks from Gemma boxes
       ├── Propagate boxes across live frames between API results
       ├── Display live tracks beside the sampled image, grid, and risk
       └── Human operator advisory by Telegram (optional)
```

## How it works

1. Open a webcam or video file with OpenCV.
2. Copy an unmodified frame every `--sample-interval` seconds and submit it to a single background worker. No overlapping Gemma requests are made; the video display continues while a request is running. Per-frame reasoning uses Gemma's minimal thinking setting to reduce latency.
3. Send the image and crowd-monitoring prompt to Gemma 4. The model returns a `report_crowd_analysis` function call with machine-readable arguments. If the function call is missing, malformed, or invalid, the frame result is rejected.
4. Validate the count, each bounding box, risk level, crowding flag, text fields, and recommended action. `people_count` must equal the number of accepted boxes. Allowed risk levels are `low`, `moderate`, and `high`; allowed actions are `continue_monitoring` and `notify_safety_operator`.
5. Convert each normalized `[ymin, xmin, ymax, xmax]` box (coordinates from 0 to 1000) to frame pixels. The app assigns each box center to a grid cell and calculates the per-cell counts itself.
6. Seed OpenCV sparse optical-flow tracks from Gemma's person boxes. Track the visible features on every camera frame and draw moving boxes and temporary track IDs on the live pane. The app replays a short, downsampled frame history when a delayed Gemma response arrives, so it can catch the boxes up from the analyzed sample to the present frame.
7. Show the live camera and live optical-flow tracks beside the exact sampled frame Gemma analyzed. The sample pane includes Gemma's original boxes, grid heatmap, count, risk, observation, and sample age. Older samples remain visible as historical analysis, never painted over a newer live frame.
8. Send a human-review advisory if Gemma recommends one or if configured count/density thresholds are reached. All Telegram advisories share a 60-second cooldown.

## Safety and limitations

- Gemma analyzes **sampled frames**, not every video frame. Results depend on API latency and can lag behind the live scene.
- Old analysis remains available in the sample pane for inspection, but only results captured within 15 seconds can trigger current alerts.
- Counts and boxes are model estimates and can be wrong. Invalid outputs are rejected; delayed valid outputs remain labeled with their sample age. A temporary API error does not create substitute detections.
- Live optical-flow boxes follow image features inside Gemma's boxes; they are not a second person detector or persistent biometric identity system. Tracks can drift or be lost during occlusion, large motion, or appearance changes and are refreshed by new Gemma samples.
- Camera samples are sent to Google's Gemini API. Use the system only where that data handling is appropriate.
- Telegram messages are human-review advisories. The application does not control equipment, contact emergency services, or make verified emergency determinations.
- This is a prototype, not a guaranteed safety-monitoring system. Do not use it as the sole basis for safety decisions.

## Requirements and installation

Python 3.10 or newer is recommended.

```bash
git clone https://github.com/srikanth97318/CrowdStrike.git
cd CrowdStrike/Crowd-Detection-System-main
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows PowerShell, activate the environment with `.venv\Scripts\Activate.ps1` instead of the `source` command.

## Configuration

Copy `.env.example` to `.env` and fill in credentials on your own machine. `.env` is ignored by Git.

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
GEMMA_MODEL=gemma-4-26b-a4b-it
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
```

`GEMINI_API_KEY` is required. `GEMMA_MODEL` defaults to `gemma-4-26b-a4b-it`. Telegram variables are optional; without both, advisories are shown in the console only.

If the window reports a Gemini API error, read the full `[GEMMA]` error in the terminal. The app displays the HTTP status and sanitized API message; common causes are an invalid or blocked key (`401`), missing permission (`403`), unavailable model (`404`), or quota/rate limit (`429`). If a key was pasted into chat, a screenshot, or a public repository, revoke it in Google AI Studio and put a newly created key in `.env` before retrying. Never paste the new key into chat or commit `.env`.

## Run

Webcam:

```bash
python detect_final.py --video 0 --detector gemma
```

Video file:

```bash
python detect_final.py --video path/to/video.mp4 --detector gemma
```

Example with a slower sampling cadence and stricter density threshold:

```bash
python detect_final.py --video 0 --detector gemma --sample-interval 3 --grid 4 --hot 3 --max_people 25
```

## Options

| Option | Default | Purpose |
| --- | ---: | --- |
| `--video` | `0` | Webcam index or video file path |
| `--detector` | `gemma` | Gemma 4 is the only detection model |
| `--gemma-model` | `GEMMA_MODEL` or `gemma-4-26b-a4b-it` | Supported Gemma 4 API model ID |
| `--sample-interval` | `2` | Minimum seconds between submitted frames; a slow request can increase the actual interval |
| `--grid` | `4` | Square grid dimension (`4` creates a 4×4 grid) |
| `--hot` | `2` | People in one cell that trigger a high-density advisory |
| `--max_people` | `20` | Count that triggers a crowd advisory |
| `--alpha` | `0.4` | Heatmap opacity from 0 to 1 |

The older `--gemma_interval` and `--gemma_model` spellings remain as CLI aliases.

## Example advisory

```text
Crowd Safety Advisory — Gemma 4
People detected (estimate): 23
Risk level: HIGH
Crowd observation: Several people appear close together near the center.
Recommended action: Human operator review
This is an AI advisory, not an automatic emergency determination.
```

## Tests

Run the standard-library test suite from this directory:

```bash
python -m unittest discover -s tests -v
```

The tests cover structured response parsing, malformed outputs, count and coordinate validation, allowed risk/actions, pixel conversion, grid assignment, stale-result handling, and synthetic optical-flow movement. They do not call Gemini or require credentials.
