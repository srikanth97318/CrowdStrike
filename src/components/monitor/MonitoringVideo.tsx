import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMonitorStore } from '../../store/monitorStore';
import { CameraStream } from './CameraStream';
import { VideoFilePlayer } from './VideoFilePlayer';
import { DetectionOverlay } from './DetectionOverlay';
import { MonitoringOverlay } from './MonitoringOverlay';
import { VideoControls } from './VideoControls';
import { DiagnosticsBar } from './DiagnosticsBar';

export const MonitoringVideo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    sourceType,
    setPlaybackState,
    setVideoCurrentTime,
  } = useMonitorStore();

  const handleVideoRef = useCallback((el: HTMLVideoElement | null) => {
    setVideoElement(el);
  }, []);

  const handlePlayPause = () => {
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play().then(() => setPlaybackState(true)).catch((e) => console.warn(e));
    } else {
      videoElement.pause();
      setPlaybackState(false);
    }
  };

  const handleRestart = () => {
    if (!videoElement) return;
    videoElement.currentTime = 0;
    setVideoCurrentTime(0);
    videoElement.play().then(() => setPlaybackState(true)).catch((e) => console.warn(e));
  };

  const handleSeek = (time: number) => {
    if (!videoElement) return;
    videoElement.currentTime = time;
    setVideoCurrentTime(time);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl border border-command-border bg-black overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Viewport Area */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {sourceType === 'camera' ? (
          <CameraStream onVideoRef={handleVideoRef} />
        ) : (
          <VideoFilePlayer onVideoRef={handleVideoRef} />
        )}

        {/* Real-time Overlays */}
        <DetectionOverlay videoElement={videoElement} />
        <MonitoringOverlay />
      </div>

      {/* Real-time Technical Diagnostics Status Bar */}
      <DiagnosticsBar />

      {/* Integrated Control Toolbar */}
      <VideoControls
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        onSeek={handleSeek}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
};
