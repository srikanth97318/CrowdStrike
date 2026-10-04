import { CameraDeviceItem } from '../types/video';

export class CameraService {
  /**
   * Checks whether the current browser supports camera access via MediaDevices API.
   */
  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  /**
   * Checks whether the current environment provides a secure context (HTTPS or localhost).
   */
  public static isSecure(): boolean {
    if (typeof window === 'undefined') return false;
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
    return window.isSecureContext || isLocalhost;
  }

  /**
   * Requests camera permission and returns the active MediaStream.
   * STRICTLY requests video only (audio: false). Never accesses microphone.
   */
  public static async requestCamera(deviceId?: string): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error('Real-time camera access is not supported in this browser.');
    }

    if (!this.isSecure()) {
      throw new Error('Camera access requires a secure HTTPS context or localhost.');
    }

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false, // MANDATORY: Do NOT request microphone access
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No camera hardware was detected on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Camera is already in use by another application.');
      } else if (err.name === 'OverconstrainedError') {
        // Fallback to simple unconstrained video
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } else {
        throw new Error(err.message || 'Failed to acquire camera stream.');
      }
    }
  }

  /**
   * Retrieves list of available physical video input devices.
   */
  public static async getAvailableDevices(): Promise<CameraDeviceItem[]> {
    if (!this.isSupported() || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');

      return videoInputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1} (${device.deviceId.slice(0, 5)}...)`,
        groupId: device.groupId,
      }));
    } catch (err) {
      console.warn('[CameraService] enumerateDevices error:', err);
      return [];
    }
  }

  /**
   * Cleanly stops all tracks of a MediaStream to release camera hardware and turn off the indicator light.
   */
  public static stopStream(stream: MediaStream | null): void {
    if (!stream) return;
    try {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    } catch (e) {
      console.error('[CameraService] Error stopping stream tracks:', e);
    }
  }
}
