export interface BackendHealthResponse {
  online: boolean;
  version?: string;
  detector?: string;
  gemma_status?: string;
  uptime_sec?: number;
}

export interface FrameDetectionResponse {
  timestamp: string;
  people_count: number;
  confidence: number;
  threshold: number;
  overcrowd: boolean;
  boxes: Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence: number;
    label: string;
  }>;
  fps: number;
  detector: string;
  hot_cells?: Array<{ row: number; col: number; count: number }>;
  gemma?: {
    status: string;
    severity: string;
    confidence: number;
    observation: string;
    recommended_check: string;
  };
}

export class ApiService {
  private baseUrl = 'http://localhost:8000';

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async getStatus(): Promise<BackendHealthResponse> {
    return ApiService.checkHealth(this.baseUrl);
  }

  public async uploadVideo(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    return await res.json();
  }

  public static async checkHealth(baseUrl: string = 'http://localhost:8000'): Promise<BackendHealthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${baseUrl}/api/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, ...data };
    } catch {
      return { online: false };
    }
  }

  public static async sendFrameForDetection(
    imageBlob: Blob,
    baseUrl: string = 'http://localhost:8000',
    confThreshold: number = 0.4
  ): Promise<FrameDetectionResponse | null> {
    try {
      const formData = new FormData();
      formData.append('frame', imageBlob, 'frame.jpg');
      formData.append('conf', confThreshold.toString());

      const res = await fetch(`${baseUrl}/api/detect/frame`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async notifyMonitorState(
    active: boolean,
    baseUrl: string = 'http://localhost:8000'
  ): Promise<boolean> {
    try {
      const endpoint = active ? `${baseUrl}/api/monitor/start` : `${baseUrl}/api/monitor/stop`;
      const res = await fetch(endpoint, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
