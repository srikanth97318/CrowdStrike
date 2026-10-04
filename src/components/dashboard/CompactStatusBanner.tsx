import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Radio, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Button } from '../ui/Button';

export const CompactStatusBanner: React.FC = () => {
  const navigate = useNavigate();
  const { activeCamera, isMonitoring, overcrowdAlert, densityAlert } = useMonitorStore();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-command-surface via-command-card to-command-surface border border-command-border p-5 lg:p-6 shadow-command">
      {/* Background subtle glowing radial */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Active Camera Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Radio size={14} className={isMonitoring ? 'text-emerald-400 animate-pulse' : 'text-command-dim'} />
              LIVE MONITORING
            </span>
            <span className="text-command-dim">•</span>
            <span className="text-xs font-mono text-command-muted flex items-center gap-1">
              <Camera size={13} className="text-command-muted" />
              {activeCamera.name}
            </span>
            <span className="text-command-dim">•</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
              overcrowdAlert
                ? 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse'
                : densityAlert
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              ● {overcrowdAlert ? 'OVERCROWD ALERT' : densityAlert ? 'HOT SPOTS DETECTED' : 'ACTIVE & NORMAL'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-command-muted">
            <span className="text-gray-200 font-medium">Surveillance Active:</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-cyan-400" /> Crowd Density
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-cyan-400" /> Overcrowding Thresholds
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-cyan-400" /> High-Density Hot Zones
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" /> Safety Anomalies
            </span>
          </div>
        </div>

        {/* Right: Quick Action to open live monitor */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/monitor')}
            icon={<ArrowUpRight size={17} />}
            className="w-full sm:w-auto"
          >
            Open Live Monitor
          </Button>
        </div>
      </div>
    </div>
  );
};
