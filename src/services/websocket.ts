export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type TelemetryCallback = (data: any) => void;
export type StatusCallback = (status: WebSocketStatus) => void;

export class MonitoringWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private telemetryListeners = new Set<TelemetryCallback>();
  private statusListeners = new Set<StatusCallback>();
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;
  private pingInterval: any = null;

  constructor(url: string = 'ws://localhost:8000/ws/monitor') {
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

  public onTelemetry(cb: TelemetryCallback): () => void {
    this.telemetryListeners.add(cb);
    return () => this.telemetryListeners.delete(cb);
  }

  public onStatusChange(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.notifyStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.notifyStatus('connected');
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.telemetryListeners.forEach((fn) => fn(data));
        } catch (e) {
          console.warn('[WS] Malformed telemetry message:', e);
        }
      };

      this.ws.onerror = () => {
        this.notifyStatus('error');
      };

      this.ws.onclose = () => {
        this.stopPing();
        this.notifyStatus('disconnected');
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.notifyStatus('error');
      this.scheduleReconnect();
    }
  }

  public sendFrame(base64Data: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'frame', image: base64Data }));
      return true;
    }
    return false;
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus('disconnected');
  }

  private notifyStatus(status: WebSocketStatus): void {
    this.statusListeners.forEach((fn) => fn(status));
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isExplicitlyClosed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }
}

export const realtimeClient = new MonitoringWebSocketClient();
