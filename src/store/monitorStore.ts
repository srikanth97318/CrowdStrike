import { create } from 'zustand';
import {
  CameraDevice,
  DetectionSettings,
  GemmaAssessment,
  HotCell,
  MonitoringAlert,
  TelegramState,
  BoundingBox,
  LiveTelemetryFrame,
  MonitoringState,
  SystemEvent,
} from '../types/monitoring';
import {
  VideoSourceType,
  VideoSourceStatus,
  CameraPermissionState,
  VideoProcessingState,
  CameraDeviceItem,
  DetectionResult,
} from '../types/video';
import {
  DetectionBox,
  DetectionResponse,
  StreamMetrics,
} from '../services/detectionWebSocket';
import {
  AVAILABLE_CAMERAS,
  DEFAULT_SETTINGS,
} from '../utils/constants';
import {
  INITIAL_ALERTS,
  INITIAL_GEMMA_ASSESSMENT,
  INITIAL_EVENTS,
  generateGridCounts,
  generateMockBoxes,
} from '../services/mockData';
import { soundController } from '../utils/audio';
import { CameraService } from '../services/cameraService';
import { VideoService } from '../services/videoService';

interface MonitorStore {
  // Mode & Operational Security Status
  mode: 'demo' | 'live';
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'demo' | 'error';
  monitoringStatus: MonitoringState;
  cameraStatus: 'connected' | 'disconnected';
  yoloStatus: 'active' | 'standby' | 'error';
  gemmaStatus: 'active' | 'standby' | 'error';
  isMonitoring: boolean;
  activeCamera: CameraDevice;
  cameras: CameraDevice[];

  // Real-time Video Input System State
  sourceType: VideoSourceType | null;
  sourceStatus: VideoSourceStatus;
  cameraStream: MediaStream | null;
  selectedCameraId: string | null;
  availableCameras: CameraDeviceItem[];
  videoFile: File | null;
  videoUrl: string | null;
  videoProcessingState: VideoProcessingState;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  cameraPermissionState: CameraPermissionState;
  errorMessage: string | null;
  uploadProgress: number;
  isRealBackendDetection: boolean;

  // Real-time Telemetry (Mandatory Metrics)
  peopleCount: number;
  previousPeopleCount: number;
  peopleChange: number;
  crowdThreshold: number;
  hotThreshold: number;
  gridSize: number;
  grid: number[][];
  hotZones: HotCell[];
  overcrowdAlert: boolean;
  densityAlert: boolean;
  fps: number;

  // Separated Confidence Scores (Mandatory Distinction)
  detectionConfidence: number; // YOLO detection confidence (e.g. 0.947)
  confidence: number;          // Alias for detectionConfidence
  aiConfidence: number;        // Gemma analysis confidence (e.g. 0.92)

  detector: 'yolo' | 'gemma' | 'yolo+gemma';
  boxes: BoundingBox[];
  lastUpdated: string;

  // AI & External Integrations
  aiAnalysis: GemmaAssessment;
  telegramStatus: TelegramState;

  // Alerts Management & Event Feed
  alerts: MonitoringAlert[];
  events: SystemEvent[];
  unreadAlertsCount: number;

  // Settings
  settings: DetectionSettings;

  // Overlay Visibility Toggles
  showHeatmap: boolean;
  showGrid: boolean;
  showBoxes: boolean;
  showHotHighlights: boolean;
  audioMuted: boolean;

  // Actions
  setMode: (mode: 'demo' | 'live') => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected' | 'demo' | 'error') => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  toggleMonitoring: () => void;
  setActiveCamera: (id: string) => void;
  updateTelemetry: (payload: Partial<LiveTelemetryFrame>) => void;
  updateSettings: (settings: Partial<DetectionSettings>) => void;
  setCrowdThreshold: (threshold: number) => void;
  setHotThreshold: (threshold: number) => void;
  setDetectionConfidenceThreshold: (conf: number) => void;
  addAlert: (alert: Omit<MonitoringAlert, 'id'>) => void;
  addEvent: (event: Omit<SystemEvent, 'id'>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  clearResolvedAlerts: () => void;
  toggleOverlay: (overlay: 'heatmap' | 'grid' | 'boxes' | 'highlights') => void;
  toggleAudioMute: () => void;
  resetSettings: () => void;

  // Real-time YOLOv8 Camera Pipeline
  realtimeDetections: DetectionBox[];
  frameDimensions: { width: number; height: number };
  streamMetrics: StreamMetrics;
  isBackendConnected: boolean;
  isYoloActive: boolean;

  // Video & Camera Source Actions
  selectVideoFile: (file: File) => void;
  selectCameraSource: (deviceId?: string) => Promise<void>;
  switchSource: () => void;
  setPlaybackState: (playing: boolean) => void;
  setVideoCurrentTime: (time: number) => void;
  setVideoDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stopCameraStream: () => void;
  setDetectionResult: (result: Partial<DetectionResult>, isRealBackend: boolean) => void;
  setRealDetectionResults: (res: DetectionResponse) => void;
  setStreamMetrics: (metrics: StreamMetrics) => void;
  resetDetections: () => void;
  setAvailableCameras: (cameras: CameraDeviceItem[]) => void;
  retryCameraPermission: () => Promise<void>;
  setUploadProgress: (progress: number) => void;
  setVideoProcessingState: (state: VideoProcessingState) => void;
}

const initialGridData = generateGridCounts(DEFAULT_SETTINGS.gridSize, 18, DEFAULT_SETTINGS.hotThreshold);
const initialBoxes = generateMockBoxes(18, DEFAULT_SETTINGS.gridSize, initialGridData.grid);

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  mode: 'demo',
  connectionStatus: 'demo',
  monitoringStatus: 'DEMO_MODE',
  cameraStatus: 'connected',
  yoloStatus: 'active',
  gemmaStatus: 'active',
  isMonitoring: true,
  activeCamera: AVAILABLE_CAMERAS[0],
  cameras: AVAILABLE_CAMERAS,

  // Real-time Video Input System Initial State
  sourceType: null, // Null initially: prompts user with [ PROVIDE A VIDEO ] or [ USE MY CAMERA ]
  sourceStatus: 'idle',
  cameraStream: null,
  selectedCameraId: null,
  availableCameras: [],
  videoFile: null,
  videoUrl: null,
  videoProcessingState: 'unloaded',
  isPlaying: true,
  isMuted: true,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  cameraPermissionState: 'prompt',
  errorMessage: null,
  uploadProgress: 0,
  isRealBackendDetection: false,

  // Real-time YOLOv8 Camera Pipeline
  realtimeDetections: [],
  frameDimensions: { width: 640, height: 480 },
  streamMetrics: {
    framesSent: 0,
    framesProcessed: 0,
    fps: 0,
    latencyMs: 0,
    lastDetectionTime: 0,
    isBackendConnected: false,
    isYoloActive: false,
  },
  isBackendConnected: false,
  isYoloActive: false,

  peopleCount: 18,
  previousPeopleCount: 15,
  peopleChange: 3,
  crowdThreshold: DEFAULT_SETTINGS.maxPeople,
  hotThreshold: DEFAULT_SETTINGS.hotThreshold,
  gridSize: DEFAULT_SETTINGS.gridSize,
  grid: initialGridData.grid,
  hotZones: initialGridData.hotCells,
  overcrowdAlert: false,
  densityAlert: initialGridData.hotCells.length > 0,
  fps: 28,

  // Separate confidence values
  detectionConfidence: 0.947,
  confidence: 0.947,
  aiConfidence: 0.92,

  detector: 'yolo',
  boxes: initialBoxes,
  lastUpdated: '10:42:18',

  aiAnalysis: INITIAL_GEMMA_ASSESSMENT,
  telegramStatus: {
    connected: false,
    crowdAlertsEnabled: true,
    densityAlertsEnabled: true,
    cooldownSec: 20,
  },

  alerts: INITIAL_ALERTS,
  events: INITIAL_EVENTS,
  unreadAlertsCount: 2,

  settings: DEFAULT_SETTINGS,

  showHeatmap: false,
  showGrid: true,
  showBoxes: true,
  showHotHighlights: false,
  audioMuted: true,

  setMode: (mode) => {
    set({
      mode,
      connectionStatus: mode === 'demo' ? 'demo' : 'connected',
      monitoringStatus: mode === 'demo' ? 'DEMO_MODE' : 'LIVE',
    });
  },

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  startMonitoring: () => {
    set({
      isMonitoring: true,
      monitoringStatus: get().sourceType === 'camera' ? 'LIVE' : 'DEMO_MODE',
      sourceStatus: 'connected',
    });
    get().addEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SYSTEM',
      title: 'SURVEILLANCE INITIALIZED',
      detail: `Real-time optical pipeline active on ${get().sourceType === 'camera' ? 'Device Camera' : 'Video Input'}.`,
      severity: 'safe',
    });
  },

  stopMonitoring: () => {
    // If camera is running, release camera tracks immediately
    if (get().sourceType === 'camera' && get().cameraStream) {
      CameraService.stopStream(get().cameraStream);
    }
    set({
      isMonitoring: false,
      monitoringStatus: 'STOPPED',
      sourceStatus: 'stopped',
      cameraStatus: 'disconnected',
    });
    get().addEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SYSTEM',
      title: 'SURVEILLANCE TERMINATED',
      detail: 'Monitoring paused and sensor feeds placed on standby.',
      severity: 'warning',
    });
  },

  pauseMonitoring: () => {
    set({
      isMonitoring: false,
      monitoringStatus: 'PAUSED',
      sourceStatus: 'paused',
    });
    get().addEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SYSTEM',
      title: 'SURVEILLANCE PAUSED',
      detail: 'Inference loop suspended temporarily.',
      severity: 'info',
    });
  },

  resumeMonitoring: () => {
    set((state) => ({
      isMonitoring: true,
      monitoringStatus: state.sourceType === 'camera' ? 'LIVE' : 'DEMO_MODE',
      sourceStatus: 'connected',
    }));
    get().addEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SYSTEM',
      title: 'SURVEILLANCE RESUMED',
      detail: 'Real-time inference resumed at normal frame rate.',
      severity: 'safe',
    });
  },

  toggleMonitoring: () => {
    const next = !get().isMonitoring;
    if (next) get().resumeMonitoring();
    else get().pauseMonitoring();
  },

  setActiveCamera: (id: string) => {
    const cam = get().cameras.find((c) => c.id === id);
    if (cam) {
      set({ activeCamera: cam });
      get().addEvent({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'SYSTEM',
        title: 'CAMERA SWITCH',
        detail: `Optical stream switched to ${cam.name}`,
        severity: 'info',
      });
    }
  },

  updateTelemetry: (payload) => {
    const currentSettings = get().settings;
    const maxPeople = payload.threshold ?? currentSettings.maxPeople;
    const hotThreshold = currentSettings.hotThreshold;
    const count = payload.people_count ?? get().peopleCount;
    const prevCount = payload.previous_count ?? get().peopleCount;
    const change = payload.people_change ?? (count - prevCount);
    const isOvercrowd = count >= maxPeople;

    const hotCells: HotCell[] = payload.hot_cells
      ? payload.hot_cells.map((cell: any) => ({
          zoneName: `Row ${cell.row + 1} / Col ${cell.col + 1}`,
          row: cell.row,
          col: cell.col,
          count: cell.count,
          densityLevel: cell.count > hotThreshold * 2 ? 'critical' : 'high',
        }))
      : [];

    const isDensity = hotCells.length > 0;

    // Trigger audio if alarm conditions are met
    if (isOvercrowd && !get().overcrowdAlert) {
      if (!get().audioMuted && currentSettings.audioAlertsEnabled) {
        soundController.playCriticalBeep();
      }
      get().addAlert({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'OVERCROWD',
        severity: 'critical',
        camera: get().sourceType === 'camera' ? 'Device Camera' : 'Video Input',
        peopleCount: count,
        threshold: maxPeople,
        location: 'Active Surveillance Feed',
        description: `People count (${count}) has surpassed safety ceiling of ${maxPeople}.`,
        status: 'active',
        suggestedAction: 'Human operator review recommended: verify entrance corridor congestion.',
      });
    }

    set((state) => ({
      peopleCount: count,
      previousPeopleCount: prevCount,
      peopleChange: change,
      overcrowdAlert: isOvercrowd,
      densityAlert: isDensity,
      hotZones: hotCells.length > 0 ? hotCells : state.hotZones,
      grid: payload.grid ?? state.grid,
      fps: payload.fps ?? state.fps,
      detectionConfidence: payload.confidence ?? state.detectionConfidence,
      confidence: payload.confidence ?? state.confidence,
      boxes: (payload.boxes as BoundingBox[]) ?? state.boxes,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      aiConfidence: payload.gemma?.confidence ?? state.aiConfidence,
    }));
  },

  setCrowdThreshold: (threshold) => {
    get().updateSettings({ maxPeople: threshold });
  },

  setHotThreshold: (threshold) => {
    get().updateSettings({ hotThreshold: threshold });
  },

  setDetectionConfidenceThreshold: (conf) => {
    get().updateSettings({ confThreshold: conf });
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      const { grid, hotCells } = generateGridCounts(merged.gridSize, state.peopleCount, merged.hotThreshold);
      const boxes = generateMockBoxes(state.peopleCount, merged.gridSize, grid);
      const isOver = state.peopleCount >= merged.maxPeople;

      if (isOver && !state.overcrowdAlert) {
        if (!state.audioMuted && merged.audioAlertsEnabled) {
          soundController.playCriticalBeep();
        }
      }

      return {
        settings: merged,
        crowdThreshold: merged.maxPeople,
        hotThreshold: merged.hotThreshold,
        gridSize: merged.gridSize,
        grid,
        hotZones: hotCells,
        boxes,
        overcrowdAlert: isOver,
        densityAlert: hotCells.length > 0,
      };
    });
  },

  addAlert: (alertData) => {
    const newAlert: MonitoringAlert = {
      ...alertData,
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    if (newAlert.severity === 'critical' && !get().audioMuted && get().settings.audioAlertsEnabled) {
      soundController.playCriticalBeep();
    } else if (newAlert.severity === 'warning' && !get().audioMuted && get().settings.audioAlertsEnabled) {
      soundController.playWarningBeep();
    }

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      unreadAlertsCount: state.unreadAlertsCount + 1,
    }));

    get().addEvent({
      timestamp: newAlert.timestamp,
      type: newAlert.type === 'OVERCROWD' ? 'OVERCROWD' : newAlert.type === 'HIGH_DENSITY' ? 'HIGH_DENSITY' : 'AI_REVIEW',
      title: newAlert.type.replace(/_/g, ' '),
      detail: newAlert.description,
      severity: newAlert.severity,
    });
  },

  addEvent: (eventData) => {
    const newEvent: SystemEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    set((state) => ({
      events: [newEvent, ...state.events.slice(0, 30)],
    }));
  },

  acknowledgeAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)),
      unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1),
    }));
  },

  resolveAlert: (id: string) => {
    const alert = get().alerts.find((a) => a.id === id);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved', resolvedAt: nowTime } : a)),
      unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1),
    }));

    if (alert) {
      get().addEvent({
        timestamp: nowTime,
        type: 'RESOLVED',
        title: 'ALERT RESOLVED',
        detail: `${alert.type.replace(/_/g, ' ')} cleared: ${alert.location}`,
        severity: 'safe',
      });
    }
  },

  clearResolvedAlerts: () => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.status !== 'resolved'),
    }));
  },

  toggleOverlay: (overlay) => {
    set((state) => {
      switch (overlay) {
        case 'heatmap': return { showHeatmap: !state.showHeatmap };
        case 'grid': return { showGrid: !state.showGrid };
        case 'boxes': return { showBoxes: !state.showBoxes };
        case 'highlights': return { showHotHighlights: !state.showHotHighlights };
        default: return state;
      }
    });
  },

  toggleAudioMute: () => set((state) => ({ audioMuted: !state.audioMuted })),

  resetSettings: () => {
    set({
      settings: DEFAULT_SETTINGS,
      crowdThreshold: DEFAULT_SETTINGS.maxPeople,
      hotThreshold: DEFAULT_SETTINGS.hotThreshold,
      gridSize: DEFAULT_SETTINGS.gridSize,
    });
  },

  // ── Video & Camera Source Actions ──────────────────────────────────────────

  selectVideoFile: (file: File) => {
    const validation = VideoService.isValidVideoFile(file);
    if (!validation.valid) {
      set({
        errorMessage: validation.error || 'Invalid video file format.',
        sourceStatus: 'error',
      });
      return;
    }

    // Stop any existing camera tracks first
    if (get().cameraStream) {
      CameraService.stopStream(get().cameraStream);
    }
    // Clean up previous blob URL
    if (get().videoUrl) {
      VideoService.revokeObjectUrl(get().videoUrl);
    }

    const objectUrl = VideoService.createObjectUrl(file);

    set({
      sourceType: 'video',
      sourceStatus: 'connected',
      cameraStream: null,
      videoFile: file,
      videoUrl: objectUrl,
      videoProcessingState: 'ready',
      isPlaying: true,
      isMonitoring: true,
      errorMessage: null,
      cameraStatus: 'disconnected',
    });

    get().addEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SYSTEM',
      title: 'VIDEO SOURCE LOADED',
      detail: `File: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      severity: 'safe',
    });
  },

  selectCameraSource: async (deviceId?: string) => {
    // If a video URL exists, clean it up
    if (get().videoUrl) {
      VideoService.revokeObjectUrl(get().videoUrl);
    }

    // If an existing camera stream exists, stop it
    if (get().cameraStream) {
      CameraService.stopStream(get().cameraStream);
    }

    set({
      sourceStatus: 'requesting',
      errorMessage: null,
      cameraPermissionState: 'prompt',
    });

    try {
      const stream = await CameraService.requestCamera(deviceId);
      const devices = await CameraService.getAvailableDevices();

      // Find active deviceId
      const activeTrack = stream.getVideoTracks()[0];
      const activeSettings = activeTrack ? activeTrack.getSettings() : null;
      const activeId = activeSettings?.deviceId || deviceId || (devices[0]?.deviceId ?? 'default');

      set({
        sourceType: 'camera',
        sourceStatus: 'connected',
        cameraStream: stream,
        selectedCameraId: activeId,
        availableCameras: devices,
        videoFile: null,
        videoUrl: null,
        cameraPermissionState: 'granted',
        cameraStatus: 'connected',
        isMonitoring: true,
        errorMessage: null,
      });

      get().addEvent({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'SYSTEM',
        title: 'DEVICE CAMERA CONNECTED',
        detail: `Optical feed connected from ${devices.find(d => d.deviceId === activeId)?.label || 'Integrated Camera'}.`,
        severity: 'safe',
      });
    } catch (err: any) {
      console.error('[Store] Camera selection failed:', err);
      set({
        sourceType: 'camera',
        sourceStatus: 'error',
        cameraStream: null,
        cameraPermissionState: 'denied',
        errorMessage: err.message || 'Camera permission denied or camera unavailable.',
      });
    }
  },

  retryCameraPermission: async () => {
    await get().selectCameraSource(get().selectedCameraId ?? undefined);
  },

  switchSource: () => {
    // Stop all media tracks to turn off camera light
    if (get().cameraStream) {
      CameraService.stopStream(get().cameraStream);
    }
    // Revoke object URL
    if (get().videoUrl) {
      VideoService.revokeObjectUrl(get().videoUrl);
    }

    set({
      sourceType: null,
      sourceStatus: 'idle',
      cameraStream: null,
      videoFile: null,
      videoUrl: null,
      isPlaying: false,
      isMonitoring: false,
      errorMessage: null,
      cameraStatus: 'disconnected',
    });
  },

  setPlaybackState: (playing) => {
    set((state) => ({
      isPlaying: playing,
      sourceStatus: state.sourceType === 'video' ? (playing ? 'processing' : 'paused') : state.sourceStatus,
    }));
  },

  setVideoCurrentTime: (currentTime) => set({ currentTime }),
  setVideoDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  stopCameraStream: () => {
    if (get().cameraStream) {
      CameraService.stopStream(get().cameraStream);
    }
    set({
      cameraStream: null,
      cameraStatus: 'disconnected',
      sourceStatus: 'stopped',
      isMonitoring: false,
    });
  },

  setDetectionResult: (result, isRealBackend) => {
    const state = get();
    const count = result.people_count ?? state.peopleCount;
    const isOver = count >= state.crowdThreshold;

    if (isOver && !state.overcrowdAlert) {
      if (!state.audioMuted && state.settings.audioAlertsEnabled) {
        soundController.playCriticalBeep();
      }
      state.addAlert({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'OVERCROWD',
        severity: 'critical',
        camera: state.sourceType === 'camera' ? 'Device Camera' : 'Video Input',
        peopleCount: count,
        threshold: state.crowdThreshold,
        location: 'Active Surveillance Viewport',
        description: `Crowd count (${count}) has reached or exceeded safety limit (${state.crowdThreshold}).`,
        status: 'active',
        suggestedAction: 'Human operator review recommended: inspect ingress points.',
      });
    }

    set({
      peopleCount: count,
      detectionConfidence: result.confidence ?? state.detectionConfidence,
      confidence: result.confidence ?? state.confidence,
      fps: result.fps ?? state.fps,
      boxes: (result.boxes as BoundingBox[]) ?? state.boxes,
      overcrowdAlert: isOver,
      isRealBackendDetection: isRealBackend,
      detector: 'yolo',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  },

  setRealDetectionResults: (res: DetectionResponse) => {
    const state = get();
    const count = res.people_count;
    const prevCount = state.peopleCount;
    const change = count - prevCount;
    const isOver = res.overcrowd;

    // Trigger alert if newly overcrowding
    if (isOver && !state.overcrowdAlert) {
      if (!state.audioMuted && state.settings.audioAlertsEnabled) {
        soundController.playCriticalBeep();
      }
      state.addAlert({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'OVERCROWD',
        severity: 'critical',
        camera: state.sourceType === 'camera' ? 'Device Camera' : 'Video Input',
        peopleCount: count,
        threshold: res.threshold,
        location: 'Live Optical Stream',
        description: `Crowd count (${count}) has surpassed safety ceiling of ${res.threshold}.`,
        status: 'active',
        suggestedAction: 'Human operator review recommended: verify crowd ingress.',
      });
    } else if (!isOver && state.overcrowdAlert) {
      // Crowd returned to normal
      state.addEvent({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'RESOLVED',
        title: 'CROWD CONDITION RESOLVED',
        detail: `People count (${count}) is below safety threshold (${res.threshold}).`,
        severity: 'safe',
      });
    }

    // Convert detections to BoundingBox format for any components reading boxes
    const mappedBoxes: BoundingBox[] = res.detections.map((d, i) => {
      const x1 = Math.round((d.x1 / res.frame_width) * 1000);
      const y1 = Math.round((d.y1 / res.frame_height) * 1000);
      const x2 = Math.round((d.x2 / res.frame_width) * 1000);
      const y2 = Math.round((d.y2 / res.frame_height) * 1000);

      return {
        id: `real-box-${i + 1}`,
        x1,
        y1,
        x2,
        y2,
        confidence: d.confidence,
        label: `Person ${Math.round(d.confidence * 100)}%`,
      };
    });

    const hotCells: HotCell[] = res.hot_cells.map((cell) => ({
      zoneName: `Row ${cell.row + 1} / Col ${cell.col + 1}`,
      row: cell.row,
      col: cell.col,
      count: cell.count,
      densityLevel: cell.count > res.hot_threshold * 2 ? 'critical' : 'high',
    }));

    set({
      peopleCount: count,
      previousPeopleCount: prevCount,
      peopleChange: change,
      detectionConfidence: count > 0 ? res.confidence : 0,
      confidence: count > 0 ? res.confidence : 0,
      fps: res.processing_time_ms > 0 ? +(1000 / res.processing_time_ms).toFixed(1) : state.fps,
      overcrowdAlert: isOver,
      densityAlert: hotCells.length > 0,
      grid: res.grid || state.grid,
      hotZones: hotCells,
      boxes: mappedBoxes,
      realtimeDetections: res.detections,
      frameDimensions: { width: res.frame_width, height: res.frame_height },
      isRealBackendDetection: true,
      yoloStatus: 'active',
      isYoloActive: true,
      isBackendConnected: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  },

  setStreamMetrics: (streamMetrics: StreamMetrics) => {
    set({
      streamMetrics,
      isBackendConnected: streamMetrics.isBackendConnected,
      isYoloActive: streamMetrics.isYoloActive,
      yoloStatus: streamMetrics.isYoloActive ? 'active' : 'standby',
      fps: streamMetrics.fps > 0 ? streamMetrics.fps : get().fps,
    });
  },

  resetDetections: () => {
    set({
      peopleCount: 0,
      previousPeopleCount: 0,
      peopleChange: 0,
      detectionConfidence: 0,
      confidence: 0,
      realtimeDetections: [],
      boxes: [],
      overcrowdAlert: false,
      densityAlert: false,
      hotZones: [],
    });
  },

  setAvailableCameras: (availableCameras) => set({ availableCameras }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setVideoProcessingState: (videoProcessingState) => set({ videoProcessingState }),
}));
