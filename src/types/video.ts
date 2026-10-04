export type VideoSourceType = 'video' | 'camera';

export type VideoSourceStatus =
  | 'idle'
  | 'requesting'
  | 'connected'
  | 'processing'
  | 'paused'
  | 'stopped'
  | 'error';

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type VideoProcessingState = 'unloaded' | 'ready' | 'uploading' | 'processing' | 'error';

export interface CameraDeviceItem {
  deviceId: string;
  label: string;
  groupId?: string;
}

export interface DetectionItem {
  id: string;
  x1: number; // 0 - 1000 normalized coordinate
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  label: string;
  trackId?: number;
}

export interface DetectionResult {
  people_count: number;
  confidence: number;
  boxes: DetectionItem[];
  fps: number;
  overcrowd: boolean;
  detector: string;
  isRealDetection: boolean;
  timestamp: string;
}

export interface VideoSourceState {
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
  isMonitoring: boolean;
  cameraPermissionState: CameraPermissionState;
  errorMessage: string | null;
  uploadProgress: number;
  backendConnected: boolean;
  isRealBackendDetection: boolean;
}
