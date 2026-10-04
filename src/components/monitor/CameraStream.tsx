import React, { useRef, useEffect } from 'react';
import { useMonitorStore } from '../../store/monitorStore';
import { detectionWebSocketClient } from '../../services/detectionWebSocket';

interface CameraStreamProps {
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({ onVideoRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureIntervalRef = useRef<any>(null);

  const {
    cameraStream,
    isMonitoring,
    setRealDetectionResults,
    setStreamMetrics,
    resetDetections,
  } = useMonitorStore();

  // 1. Attach MediaStream to <video> element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (cameraStream) {
      console.log('[Camera] Attaching MediaStream to video element.');
      video.srcObject = cameraStream;
      video.play().catch((err) => {
        console.warn('[Camera] Autoplay prevented:', err);
      });
    } else {
      video.srcObject = null;
    }

    onVideoRef?.(video);

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [cameraStream, onVideoRef]);

  // 2. Real-time WebSocket Detection Stream (/ws/camera)
  useEffect(() => {
    if (!isMonitoring || !cameraStream) {
      detectionWebSocketClient.disconnect();
      resetDetections();
      return;
    }

    console.log('[Camera] Starting real-time YOLOv8 detection pipeline via WebSocket...');
    detectionWebSocketClient.connect();

    // Register listeners for real YOLO detection responses
    const unregisterDetection = detectionWebSocketClient.onDetection((result) => {
      setRealDetectionResults(result);
    });

    const unregisterMetrics = detectionWebSocketClient.onMetrics((metrics) => {
      setStreamMetrics(metrics);
    });

    // Hidden offscreen canvas for controlled frame extraction (8 FPS = 125ms)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    captureIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) {
        return;
      }

      // Check if WebSocket is busy awaiting previous YOLO inference (backpressure)
      if (detectionWebSocketClient.isBusy()) {
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !offscreenCtx) return;

      // Downscale to max 640px width for low latency
      const targetWidth = Math.min(640, vw);
      const targetHeight = Math.round(targetWidth * (vh / vw));

      if (offscreenCanvas.width !== targetWidth || offscreenCanvas.height !== targetHeight) {
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
      }

      offscreenCtx.drawImage(video, 0, 0, targetWidth, targetHeight);

      offscreenCanvas.toBlob(
        (blob) => {
          if (blob && isMonitoring) {
            detectionWebSocketClient.sendFrame(blob);
          }
        },
        'image/jpeg',
        0.75
      );
    }, 125);

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      unregisterDetection();
      unregisterMetrics();
      detectionWebSocketClient.disconnect();
      resetDetections();
    };
  }, [
    isMonitoring,
    cameraStream,
    setRealDetectionResults,
    setStreamMetrics,
    resetDetections,
  ]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        aria-label="Live Camera Video Stream"
      />
    </div>
  );
};
