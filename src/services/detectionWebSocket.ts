export interface DetectionBox {
  class: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionResponse {
  type: string;
  timestamp: number;
  people_count: number;
  confidence: number;
  detections: DetectionBox[];
  frame_width: number;
  frame_height: number;
  grid: number[][];
  hot_cells: Array<{ row: number; col: number; count: number }>;
  overcrowd: boolean;
  threshold: number;
  hot_threshold: number;
  processing_time_ms: number;
  yolo_active: boolean;
  gemma?: {
    status: string;
    observation: string;
    severity: 'low' | 'moderate' | 'high';
    confidence: number;
    recommendedCheck: string;
    lastUpdated: string;
  };
  gemma_status?: 'active' | 'standby' | 'error';
  gemma_model?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface StreamMetrics {
  framesSent: number;
  framesProcessed: number;
  fps: number;
  latencyMs: number;
  lastDetectionTime: number;
  isBackendConnected: boolean;
  isYoloActive: boolean;
}

type DetectionListener = (result: DetectionResponse) => void;
type StatusListener = (status: ConnectionStatus) => void;
type MetricsListener = (metrics: StreamMetrics) => void;

export class DetectionWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private isAwaitingResponse = false;
  private isExplicitlyClosed = false;

  private framesSent = 0;
  private framesProcessed = 0;
  private fps = 0;
  private lastSendTimestamp = 0;
  private latencyMs = 0;
  private lastDetectionTime = 0;
  private fpsWindow: number[] = [];

  private detectionListeners = new Set<DetectionListener>();
  private statusListeners = new Set<StatusListener>();
  private metricsListeners = new Set<MetricsListener>();

  constructor(url: string = 'ws://localhost:8000/ws/camera') {
    this.url = url;
  }

  public setUrl(url: string): void {
    if (this.url !== url) {
      this.url = url;
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        this.disconnect();
        this.connect();
      }
    }
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.notifyStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log('[DetectionWebSocket] Connected to', this.url);
        this.notifyStatus('connected');
        this.notifyMetrics();
      };

      this.ws.onmessage = (event) => {
        this.isAwaitingResponse = false;
        try {
          const data: DetectionResponse = JSON.parse(event.data);
          this.framesProcessed++;

          // Latency calculation
          if (this.lastSendTimestamp > 0) {
            this.latencyMs = Math.round(performance.now() - this.lastSendTimestamp);
          }

          // FPS calculation over last 10 detections
          const now = performance.now();
          this.fpsWindow.push(now);
          if (this.fpsWindow.length > 10) {
            this.fpsWindow.shift();
          }
          if (this.fpsWindow.length > 1) {
            const timeDiffSec = (this.fpsWindow[this.fpsWindow.length - 1] - this.fpsWindow[0]) / 1000;
            if (timeDiffSec > 0) {
              this.fps = +(this.fpsWindow.length / timeDiffSec).toFixed(1);
            }
          }

          this.lastDetectionTime = Date.now();

          // Dispatch result to listeners
          this.detectionListeners.forEach((fn) => fn(data));
          this.notifyMetrics();
        } catch (e) {
          console.error('[DetectionWebSocket] Message parse error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[DetectionWebSocket] Error:', err);
        this.notifyStatus('error');
      };

      this.ws.onclose = () => {
        this.isAwaitingResponse = false;
        if (!this.isExplicitlyClosed) {
          console.log('[DetectionWebSocket] Connection closed unexpectedly');
        }
        this.notifyStatus('disconnected');
        this.notifyMetrics();
      };
    } catch (err) {
      console.error('[DetectionWebSocket] Connection exception:', err);
      this.notifyStatus('error');
    }
  }

  /**
   * Sends binary JPEG blob to Python backend.
   * Implements strict backpressure: drops frame if previous frame is still undergoing inference.
   */
  public sendFrame(blob: Blob): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    // Drop frame if backend has not finished previous frame (low-latency backpressure)
    if (this.isAwaitingResponse) {
      return false;
    }

    this.isAwaitingResponse = true;
    this.lastSendTimestamp = performance.now();
    this.framesSent++;

    blob.arrayBuffer().then((buffer) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(buffer);
      } else {
        this.isAwaitingResponse = false;
      }
    }).catch(() => {
      this.isAwaitingResponse = false;
    });

    return true;
  }

  public isBusy(): boolean {
    return this.isAwaitingResponse;
  }

  public isConnected(): boolean {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  public isYoloActive(): boolean {
    // Active if connected and received detection in last 2.5 seconds
    return this.isConnected() && (Date.now() - this.lastDetectionTime < 2500) && this.framesProcessed > 0;
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.isAwaitingResponse = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus('disconnected');
    this.notifyMetrics();
  }

  public resetCounters(): void {
    this.framesSent = 0;
    this.framesProcessed = 0;
    this.fps = 0;
    this.latencyMs = 0;
    this.fpsWindow = [];
    this.lastDetectionTime = 0;
    this.notifyMetrics();
  }

  public onDetection(cb: DetectionListener): () => void {
    this.detectionListeners.add(cb);
    return () => this.detectionListeners.delete(cb);
  }

  public onStatusChange(cb: StatusListener): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  public onMetrics(cb: MetricsListener): () => void {
    this.metricsListeners.add(cb);
    return () => this.metricsListeners.delete(cb);
  }

  private notifyStatus(status: ConnectionStatus): void {
    this.statusListeners.forEach((fn) => fn(status));
  }

  private notifyMetrics(): void {
    const metrics: StreamMetrics = {
      framesSent: this.framesSent,
      framesProcessed: this.framesProcessed,
      fps: this.fps,
      latencyMs: this.latencyMs,
      lastDetectionTime: this.lastDetectionTime,
      isBackendConnected: this.isConnected(),
      isYoloActive: this.isYoloActive(),
    };
    this.metricsListeners.forEach((fn) => fn(metrics));
  }
}

// Global detection client singleton for camera feed
export const detectionWebSocketClient = new DetectionWebSocketClient();
