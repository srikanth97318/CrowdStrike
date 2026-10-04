import React from 'react';
import { Camera, Film, RefreshCw, Shield } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

export const SourceStatus: React.FC = () => {
  const {
    sourceType,
    isMonitoring,
    videoFile,
    isPlaying,
    switchSource,
    isYoloActive,
    isBackendConnected,
  } = useMonitorStore();

  if (!sourceType) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-command-card/90 border-b border-command-border/80 text-xs font-mono">
      {/* Left: Source Type & Live State */}
      <div className="flex items-center gap-2.5">
        {sourceType === 'camera' ? (
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Camera size={15} />
            <span>DEVICE CAMERA</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Film size={15} />
            <span className="truncate max-w-[200px]" title={videoFile?.name || 'Provided Video'}>
              {videoFile ? videoFile.name : 'PROVIDED VIDEO'}
            </span>
          </div>
        )}

        <span className="text-command-border">|</span>

        {/* Dynamic Status Badge */}
        {sourceType === 'camera' ? (
          <div className="flex items-center gap-1.5">
            {isMonitoring ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ● LIVE FEED
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                ● CAMERA OFF
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {isMonitoring && isPlaying ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ● PROCESSING
              </span>
            ) : !isPlaying ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300">
                ● PAUSED
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                ● STOPPED
              </span>
            )}
          </div>
        )}

        {/* Backend Detection Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-command-surface border border-command-border">
          {isYoloActive ? (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              YOLOv8 ACTIVE
            </span>
          ) : isBackendConnected ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              YOLO STANDBY
            </span>
          ) : (
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              YOLO NOT CONNECTED
            </span>
          )}
        </span>
      </div>

      {/* Right: Privacy notice & Switch Source Button */}
      <div className="flex items-center gap-3">
        {sourceType === 'camera' && (
          <span className="hidden lg:flex items-center gap-1 text-[10px] text-command-muted">
            <Shield size={11} className="text-emerald-400" />
            Camera access is used only while monitoring is active
          </span>
        )}

        {/* Switch Source Button */}
        <button
          onClick={switchSource}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-command-surface hover:bg-command-surface/80 border border-command-border hover:border-cyan-500/50 text-gray-200 hover:text-white transition shadow-xs text-[11px]"
          title="Release current source and select a different video or camera"
        >
          <RefreshCw size={11} className="text-cyan-400" />
          <span>Switch Source</span>
        </button>
      </div>
    </div>
  );
};
