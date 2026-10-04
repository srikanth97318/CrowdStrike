import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Square,
  Activity,
  Grid,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

interface VideoControlsProps {
  onPlayPause: () => void;
  onRestart: () => void;
  onSeek: (time: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  onPlayPause,
  onRestart,
  onSeek,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const {
    sourceType,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    volume,
    setVolume,
    toggleMute,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    showGrid,
    showBoxes,
    toggleOverlay,
    gridSize,
  } = useMonitorStore();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-command-card/95 border-t border-command-border px-4 py-3 flex flex-col gap-2.5 z-20">
      {/* 1. Seek scrubber (for video files) */}
      {sourceType === 'video' && duration > 0 && (
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-gray-300 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-command-surface rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <span className="text-command-muted w-10">{formatTime(duration)}</span>
        </div>
      )}

      {/* 2. Control Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Playback & Volume */}
        <div className="flex items-center gap-2">
          {/* Play / Pause button */}
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg bg-command-surface hover:bg-cyan-500/20 text-white hover:text-cyan-300 border border-command-border transition flex items-center gap-1.5 text-xs font-mono"
            title={isPlaying ? 'Pause Feed' : 'Play Feed'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Restart button (video only) */}
          {sourceType === 'video' && (
            <button
              onClick={onRestart}
              className="p-2 rounded-lg bg-command-surface hover:bg-command-card text-command-muted hover:text-white border border-command-border transition text-xs font-mono"
              title="Restart Video to 0:00"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {/* Volume & Mute (video only) */}
          {sourceType === 'video' && (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg bg-command-surface text-command-muted hover:text-white border border-command-border transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) toggleMute();
                }}
                className="w-16 h-1 bg-command-surface rounded appearance-none cursor-pointer accent-cyan-400 hidden md:block"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          )}

          {/* Overlay Toggles: Grid & Boxes */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-command-border">
            <button
              onClick={() => toggleOverlay('grid')}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition ${
                showGrid
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-command-surface text-command-muted border-command-border hover:text-white'
              }`}
              title="Toggle Grid Lines"
            >
              <Grid size={12} /> Grid ({gridSize}×{gridSize})
            </button>

            <button
              onClick={() => toggleOverlay('boxes')}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition ${
                showBoxes
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-command-surface text-command-muted border-command-border hover:text-white'
              }`}
              title="Toggle YOLO Bounding Boxes"
            >
              <Square size={12} /> Boxes
            </button>
          </div>
        </div>

        {/* Right: Monitoring Active Toggle & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* START / STOP MONITORING Button */}
          {isMonitoring ? (
            <button
              onClick={stopMonitoring}
              className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 hover:text-red-300 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-danger-glow"
              title="Stop active optical crowd analysis"
            >
              <Square size={13} className="fill-current" />
              <span>STOP MONITORING</span>
            </button>
          ) : (
            <button
              onClick={startMonitoring}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-safe-glow"
              title="Start active optical crowd analysis"
            >
              <Activity size={13} />
              <span>START MONITORING</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-command-surface hover:bg-command-card text-command-muted hover:text-white border border-command-border transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
