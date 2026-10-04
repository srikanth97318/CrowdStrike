import React, { useRef, useEffect } from 'react';
import { useMonitorStore } from '../../store/monitorStore';
import { detectionWebSocketClient } from '../../services/detectionWebSocket';

interface VideoFilePlayerProps {
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
}

export const VideoFilePlayer: React.FC<VideoFilePlayerProps> = ({ onVideoRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureIntervalRef = useRef<any>(null);

  const {
    videoUrl,
    isPlaying,
    isMuted,
    volume,
    isMonitoring,
    setVideoCurrentTime,
    setVideoDuration,
    setRealDetectionResults,
    setStreamMetrics,
    resetDetections,
  } = useMonitorStore();

  // Connect video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    onVideoRef?.(video);

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration || 0);
    };

    const handleTimeUpdate = () => {
      setVideoCurrentTime(video.currentTime || 0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onVideoRef, setVideoDuration, setVideoCurrentTime]);

  // Sync playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => console.warn('[VideoPlayer] Play interrupted:', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Sync audio/volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  // Unified Real-time WebSocket Detection Stream (/ws/camera)
  useEffect(() => {
    if (!isMonitoring || !isPlaying || !videoUrl) {
      return;
    }

    console.log('[VideoFile] Starting real-time YOLOv8 detection on video file...');
    detectionWebSocketClient.connect();

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

      if (detectionWebSocketClient.isBusy()) {
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !offscreenCtx) return;

      const targetWidth = Math.min(640, vw);
      const targetHeight = Math.round(targetWidth * (vh / vw));

      if (offscreenCanvas.width !== targetWidth || offscreenCanvas.height !== targetHeight) {
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
      }

      offscreenCtx.drawImage(video, 0, 0, targetWidth, targetHeight);

      offscreenCanvas.toBlob(
        (blob) => {
          if (blob && isMonitoring && isPlaying) {
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
      resetDetections();
    };
  }, [
    isMonitoring,
    isPlaying,
    videoUrl,
    setRealDetectionResults,
    setStreamMetrics,
    resetDetections,
  ]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        playsInline
        loop
        autoPlay
        muted={isMuted}
        className="w-full h-full object-contain"
        aria-label="Provided Video Playback"
      />
    </div>
  );
};
