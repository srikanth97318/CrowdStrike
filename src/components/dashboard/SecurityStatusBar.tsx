import React from 'react';
import { Camera, Cpu, Eye, Send, Radio } from 'lucide-react';
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

        {/* Primary AI: Gemma 4 Intelligence */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/30 border border-cyan-500/40 text-cyan-300">
          <Eye size={13} className="text-cyan-400" />
          <span className="font-bold">
            GEMMA AI: {gemmaStatus === 'active' ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-cyan-400/80 text-[10px] hidden sm:inline">(Gemma 4)</span>
        </div>

        {/* Secondary: YOLOv8 Vision Detection */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Cpu size={13} className="text-emerald-400" />
          <span className="text-gray-300">
            VISION: YOLOv8 {yoloStatus === 'active' ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-cyan-400 text-[10px]">~{fps} FPS</span>
        </div>

        {/* Telegram Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-command-card border border-command-border text-command-muted">
          <Send size={13} className={telegramStatus.connected ? 'text-emerald-400' : 'text-command-dim'} />
          <span className="text-gray-300">
            TELEGRAM {telegramStatus.connected ? 'CONNECTED' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Right: Live Telemetry Snapshot & Powered by Gemma */}
      <div className="hidden lg:flex items-center gap-4 text-command-muted text-[11px]">
        <div className="flex items-center gap-1.5">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <span>PEOPLE: <strong className="text-white">{peopleCount}</strong></span>
        </div>
        <div className="text-command-dim">|</div>
        <div>
          <span>VISION CONF: <strong className="text-cyan-400">{(detectionConfidence * 100).toFixed(1)}%</strong></span>
        </div>
        <div className="text-command-dim">|</div>
        <div className="text-cyan-300 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
          <span>POWERED BY GEMMA</span>
        </div>
      </div>
    </div>
  );
};
