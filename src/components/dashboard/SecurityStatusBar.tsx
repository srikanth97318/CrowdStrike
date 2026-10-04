import React from 'react';
import { Shield, Camera, Cpu, Eye, Send, Radio } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

export const SecurityStatusBar: React.FC = () => {
  const {
    monitoringStatus,
    cameraStatus,
    yoloStatus,
    gemmaStatus,
    telegramStatus,
    activeCamera,
    fps,
    peopleCount,
    detectionConfidence,
  } = useMonitorStore();

  return (
    <div className="bg-command-surface border border-command-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm">
      {/* Left: Security Command Status Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* System Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-200 font-bold uppercase tracking-wider text-[11px]">
            SYSTEM ONLINE
          </span>
          <span className="text-[10px] text-cyan-400 px-1 rounded bg-cyan-500/10 border border-cyan-500/20">
            {monitoringStatus}
          </span>
        </div>

        {/* Camera Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Camera size={13} className={cameraStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'} />
          <span className="text-gray-300">
            {cameraStatus === 'connected' ? 'CAMERA CONNECTED' : 'CAMERA DISCONNECTED'}
          </span>
          <span className="text-command-dim text-[10px]">({activeCamera.id.toUpperCase()})</span>
        </div>

        {/* YOLO Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Cpu size={13} className="text-cyan-400" />
          <span className="text-gray-300">
            YOLO {yoloStatus === 'active' ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-cyan-400 text-[10px]">~{fps} FPS</span>
        </div>

        {/* Gemma Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Eye size={13} className={gemmaStatus === 'active' ? 'text-cyan-400' : 'text-slate-500'} />
          <span className="text-gray-300">
            GEMMA {gemmaStatus === 'active' ? 'ACTIVE' : 'OFFLINE'}
          </span>
          <span className="text-command-dim text-[10px]">Advisory Mode</span>
        </div>

        {/* Telegram Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Send size={13} className={telegramStatus.connected ? 'text-emerald-400' : 'text-command-dim'} />
          <span className="text-gray-300">
            TELEGRAM {telegramStatus.connected ? 'CONNECTED' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Right: Live Telemetry Snapshot */}
      <div className="hidden lg:flex items-center gap-4 text-command-muted text-[11px]">
        <div className="flex items-center gap-1.5">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <span>COUNT: <strong className="text-white">{peopleCount}</strong></span>
        </div>
        <div className="text-command-dim">|</div>
        <div>
          <span>YOLO CONF: <strong className="text-cyan-400">{(detectionConfidence * 100).toFixed(1)}%</strong></span>
        </div>
        <div className="text-command-dim">|</div>
        <div className="text-command-dim flex items-center gap-1">
          <Shield size={11} className="text-cyan-400" />
          <span>ENCRYPTED COMMAND FEED</span>
        </div>
      </div>
    </div>
  );
};
