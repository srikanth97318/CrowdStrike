import { CameraDevice, DetectionSettings } from '../types/monitoring';

export const APP_NAME = 'CrowdGuard AI';
export const APP_TAGLINE = 'Real-time Crowd Intelligence & Safety Platform';

export const DEFAULT_SETTINGS: DetectionSettings = {
  confThreshold: 0.4,
  gridSize: 4,
  maxPeople: 20,
  hotThreshold: 2,
  heatmapAlpha: 0.4,
  detector: 'yolo',
  gemmaEnabled: true,
  gemmaModel: 'gemma-4-26b-a4b-it',
  gemmaInterval: 10,
  telegramEnabled: true,
  telegramCrowdAlerts: true,
  telegramDensityAlerts: true,
  telegramCooldown: 20,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000/ws/monitor',
  audioAlertsEnabled: false,
};

export const AVAILABLE_CAMERAS: CameraDevice[] = [
  {
    id: 'cam-01',
    name: 'Camera 01 — Main Entrance',
    location: 'North Concourse Gate 1',
    status: 'online',
    fps: 28,
    resolution: '1920x1080',
    type: 'live',
    isDefault: true,
  },
  {
    id: 'cam-02',
    name: 'Camera 02 — East Atrium',
    location: 'Central Plaza Corridor',
    status: 'online',
    fps: 30,
    resolution: '1920x1080',
    type: 'live',
  },
  {
    id: 'cam-webcam',
    name: 'Camera 03 — Local Webcam (Device 0)',
    location: 'Workstation USB Video',
    status: 'standby',
    fps: 30,
    resolution: '1280x720',
    type: 'webcam',
  },
  {
    id: 'cam-file',
    name: 'Camera 04 — Recorded Footage (crowd.mp4)',
    location: 'Video Analysis File',
    status: 'standby',
    fps: 25,
    resolution: '1920x1080',
    type: 'file',
  },
];

export const JET_COLOR_RAMP = [
  { stop: 0.0, r: 0, g: 0, b: 255 },     // Blue
  { stop: 0.35, r: 0, g: 255, b: 255 },  // Cyan
  { stop: 0.65, r: 255, g: 255, b: 0 },  // Yellow
  { stop: 1.0, r: 255, g: 0, b: 0 },     // Red
];
