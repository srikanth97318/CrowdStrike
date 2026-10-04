import React, { useState, useEffect } from 'react';
import { Camera, Cpu, Wifi, WifiOff } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

export const DiagnosticsBar: React.FC = () => {
  const {
    sourceType,
    isMonitoring,
    isBackendConnected,
    isYoloActive,
    streamMetrics,
  } = useMonitorStore();

  const [timeAgo, setTimeAgo] = useState<string>('—');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!streamMetrics.lastDetectionTime) {
        setTimeAgo('—');
        return;
      }
      const diff = Math.max(0, Date.now() - streamMetrics.lastDetectionTime);
      if (diff < 1000) {
        setTimeAgo(`${diff}ms ago`);
      } else {
        setTimeAgo(`${(diff / 1000).toFixed(1)}s ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 500);
    return () => clearInterval(interval);
  }, [streamMetrics.lastDetectionTime]);

  if (!sourceType || !isMonitoring) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-3.5 py-1.5 bg-black/90 border-t border-command-border/60 text-[10px] font-mono text-command-dim select-none">
      {/* Diagnostics Left */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
        {/* Camera Status */}
        <div className="flex items-center gap-1.5">
          <Camera size={11} className={sourceType === 'camera' ? 'text-emerald-400' : 'text-cyan-400'} />
          <span className="text-command-muted">Camera:</span>
          <span className="text-emerald-400 font-bold">CONNECTED</span>
        </div>

        <span className="text-zinc-700">|</span>

        {/* Backend Status */}
        <div className="flex items-center gap-1.5">
          {isBackendConnected ? (
            <>
              <Wifi size={11} className="text-cyan-400" />
              <span className="text-command-muted">Backend:</span>
              <span className="text-cyan-400 font-bold">CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff size={11} className="text-red-400" />
              <span className="text-command-muted">Backend:</span>
              <span className="text-red-400 font-bold">DISCONNECTED</span>
            </>
          )}
        </div>

        <span className="text-zinc-700">|</span>

        {/* YOLO Status */}
        <div className="flex items-center gap-1.5">
          <Cpu size={11} className={isYoloActive ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-command-muted">YOLO:</span>
          <span className={isYoloActive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isYoloActive ? 'PROCESSING' : isBackendConnected ? 'STANDBY' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Diagnostics Right: Telemetry Counts & Latency */}
      <div className="flex items-center gap-x-3.5 text-zinc-400">
        <div>
          <span>Sent: </span>
          <span className="text-white font-semibold">{streamMetrics.framesSent}</span>
        </div>

        <div>
          <span>Processed: </span>
          <span className="text-white font-semibold">{streamMetrics.framesProcessed}</span>
        </div>

        <div>
          <span>FPS: </span>
          <span className="text-cyan-300 font-bold">{streamMetrics.fps || '0.0'}</span>
        </div>

        {streamMetrics.latencyMs > 0 && (
          <div>
            <span>Latency: </span>
            <span className="text-cyan-300">{streamMetrics.latencyMs}ms</span>
          </div>
        )}

        <div className="hidden sm:block">
          <span>Last: </span>
          <span className="text-gray-300">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};
