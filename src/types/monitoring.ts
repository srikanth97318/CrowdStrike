export type AlertSeverity = 'critical' | 'warning' | 'info' | 'safe';

export type AlertType = 
  | 'OVERCROWD'
  | 'HIGH_DENSITY'
  | 'AI_SAFETY_REVIEW'
  | 'CAMERA_ERROR'
  | 'BACKEND_ERROR'
  | 'SYSTEM_WARNING';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type MonitoringState = 
  | 'LIVE'
  | 'PAUSED'
  | 'STOPPED'
  | 'CONNECTING'
  | 'BACKEND_OFFLINE'
  | 'DEMO_MODE';

export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface BoundingBox {
  id: string;
  x1: number; // 0 - 1000 normalized
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  label: string;
  color?: string;
}

export interface HotCell {
  zoneName: string; // e.g. "ZONE A"
  row: number;
  col: number;
  count: number;
  densityLevel: DensityLevel;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 'OVERCROWD' | 'HIGH_DENSITY' | 'AI_REVIEW' | 'SYSTEM' | 'RESOLVED';
  title: string;
  detail: string;
  severity: AlertSeverity;
}

export interface GemmaAssessment {
  status: 'active' | 'standby' | 'error' | 'analyzing';
  severity: 'low' | 'moderate' | 'high';
  confidence: number;
  observation: string;
  recommendedCheck: string;
  lastUpdated: string;
  error?: string;
}

export interface TelegramState {
  connected: boolean;
  crowdAlertsEnabled: boolean;
  densityAlertsEnabled: boolean;
  cooldownSec: number;
}

export interface MonitoringAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  camera: string;
  peopleCount: number;
  threshold: number;
  location: string;
  description: string;
  status: AlertStatus;
  suggestedAction?: string;
  resolvedAt?: string;
}

export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'standby' | 'offline';
  fps: number;
  resolution: string;
  type: 'live' | 'webcam' | 'file' | 'simulation';
  isDefault?: boolean;
}

export interface DetectionSettings {
  confThreshold: number;
  gridSize: number;
  maxPeople: number;
  hotThreshold: number;
  heatmapAlpha: number;
  detector: 'yolo' | 'gemma';
  gemmaEnabled: boolean;
  gemmaModel: string;
  gemmaInterval: number;
  telegramEnabled: boolean;
  telegramCrowdAlerts: boolean;
  telegramDensityAlerts: boolean;
  telegramCooldown: number;
  apiUrl: string;
  wsUrl: string;
  audioAlertsEnabled: boolean;
}

export interface LiveTelemetryFrame {
  timestamp: string;
  people_count: number;
  previous_count?: number;
  people_change?: number;
  threshold: number;
  overcrowd: boolean;
  hot_cells: HotCell[];
  grid: number[][];
  confidence: number;
  detector: 'yolo' | 'gemma' | 'yolo+gemma';
  fps: number;
  boxes?: BoundingBox[];
  gemma?: {
    status: 'active' | 'standby' | 'error';
    severity: 'low' | 'moderate' | 'high';
    confidence: number;
    observation: string;
    recommended_check: string;
  };
  telegram?: {
    enabled: boolean;
    crowd_alerts?: boolean;
    density_alerts?: boolean;
    cooldown?: number;
  };
}

export interface AnalyticsSummary {
  peakPeopleCount: number;
  averagePeopleCount: number;
  peakDensityPercent: number;
  peakDensityZone: string;
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  resolvedAlerts: number;
  averageConfidence: number;
  monitoringHours: number;
}

export interface TimeSeriesPoint {
  time: string;
  count: number;
  density: number;
  threshold: number;
  capacityRate: number;
  hotCellsCount: number;
}

export interface ZoneDensityPoint {
  zone: string;
  count: number;
  maxCapacity: number;
  status: 'normal' | 'moderate' | 'high';
}

export interface AlertStatPoint {
  name: string;
  value: number;
  color: string;
}

export interface AlertFrequencyPoint {
  hour: string;
  critical: number;
  warning: number;
  info: number;
}
