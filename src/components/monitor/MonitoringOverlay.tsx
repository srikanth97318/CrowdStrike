import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

export const MonitoringOverlay: React.FC = () => {
  const {
    sourceType,
    isMonitoring,
    isPlaying,
    peopleCount,
    crowdThreshold,
    overcrowdAlert,
    detectionConfidence,
    fps,
    videoFile,
    isYoloActive,
    isBackendConnected,
  } = useMonitorStore();

  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Bar Overlay */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left Live Status */}
        <div className="flex items-center gap-2">
          {sourceType === 'camera' ? (
            isMonitoring ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600/90 text-white font-mono text-xs font-bold tracking-wider shadow-lg border border-red-500/40">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                ● LIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-black/75 text-zinc-400 font-mono text-xs border border-zinc-700">
                ● PAUSED
              </span>
            )
          ) : isMonitoring && isPlaying ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600/90 text-white font-mono text-xs font-bold tracking-wider shadow-lg border border-cyan-400/40">
              <span className="h-2 w-2 rounded-full bg-cyan-200 animate-pulse" />
              ● VIDEO
            </span>
          ) : !isPlaying ? (
            <span className="px-2.5 py-1 rounded bg-black/75 text-amber-300 font-mono text-xs border border-amber-500/30">
              ● PAUSED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-black/75 text-zinc-400 font-mono text-xs border border-zinc-700">
              ● PROCESSING
            </span>
          )}
        </div>

        {/* Overcrowding Alert Banner in center */}
        {overcrowdAlert && (
          <div className="animate-pulse bg-red-600/95 text-white px-3 py-1 rounded border border-white font-mono text-xs font-bold shadow-danger-glow flex items-center gap-1.5 tracking-wider">
            <AlertTriangle size={14} />
            <span>OVERCROWDING: {peopleCount} PEOPLE (MAX {crowdThreshold})</span>
          </div>
        )}

        {/* Top-Right Source Label */}
        <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs border border-command-border/80 text-cyan-400 font-mono text-xs font-bold tracking-wide">
          {sourceType === 'camera' ? 'DEVICE CAMERA' : videoFile ? videoFile.name.toUpperCase() : 'VIDEO INPUT'}
        </div>
      </div>

      {/* Bottom Bar Overlay */}
      <div className="flex items-end justify-between gap-3 text-xs font-mono">
        {/* Bottom-Left Telemetry Box */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-black/85 backdrop-blur-xs border border-command-border/80 text-white shadow-lg space-y-1">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-command-muted uppercase">PEOPLE:</span>
              <span className={`text-base font-bold ${overcrowdAlert ? 'text-red-400' : 'text-white'}`}>
                {peopleCount}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-command-muted uppercase">CONFIDENCE:</span>
              <span className="text-cyan-400 font-bold">
                {peopleCount > 0 ? `${(detectionConfidence * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-zinc-800 text-[11px] text-command-dim">
            <div className="flex items-center gap-1">
              <span>YOLO:</span>
              {isYoloActive ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              ) : (
                <span className="text-amber-400 font-bold">
                  {isBackendConnected ? 'STANDBY' : 'NOT CONNECTED'}
                </span>
              )}
            </div>

            <span className="text-zinc-700">|</span>
            <span>FPS: {fps}</span>
          </div>
        </div>

        {/* Bottom-Right Clock */}
        <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs border border-command-border/80 text-zinc-400 text-[10px] font-mono">
          {timestamp}
        </div>
      </div>
    </div>
  );
};
