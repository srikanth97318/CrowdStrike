import React from 'react';
import {
  Users,
  Sliders,
  Flame,
  Gauge,
  BrainCircuit,
  BellRing,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card } from '../ui/Card';

export const MetricCards: React.FC = () => {
  const {
    peopleCount,
    crowdThreshold,
    hotZones,
    confidence,
    alerts,
    overcrowdAlert,
    densityAlert,
  } = useMonitorStore();

  const capacityPercent = Math.min(100, Math.round((peopleCount / crowdThreshold) * 100));
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;
  const isOver = peopleCount >= crowdThreshold;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. PEOPLE DETECTED */}
      <Card
        glow={isOver ? 'red' : 'none'}
        className={`relative overflow-hidden ${
          isOver ? 'bg-red-950/20 border-red-500/50' : ''
        }`}
      >
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            People Detected
          </span>
          <div className={`p-1.5 rounded-lg ${isOver ? 'bg-red-500/20 text-red-400' : 'bg-command-surface text-cyan-400'}`}>
            <Users size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isOver ? 'text-red-400' : 'text-white'}`}>
            {peopleCount}
          </span>
          <span className="text-xs text-command-dim font-mono">live</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
          {isOver ? (
            <span className="text-red-400 font-bold flex items-center gap-1">
              OVER THRESHOLD
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              +4.2% vs prev 10m
            </span>
          )}
          <span className="text-command-dim">{capacityPercent}% cap</span>
        </div>
      </Card>

      {/* 2. CROWD THRESHOLD */}
      <Card>
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            Crowd Threshold
          </span>
          <div className="p-1.5 rounded-lg bg-command-surface text-cyan-400">
            <Sliders size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {crowdThreshold}
          </span>
          <span className="text-xs text-command-dim font-mono">max</span>
        </div>

        <div className="mt-3">
          <div className="w-full bg-command-surface h-1.5 rounded-full overflow-hidden border border-command-border">
            <div
              className={`h-full transition-all duration-300 ${
                isOver ? 'bg-red-500' : capacityPercent > 80 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 3. DENSITY STATUS */}
      <Card
        glow={overcrowdAlert ? 'red' : densityAlert ? 'amber' : 'none'}
        className={densityAlert && !overcrowdAlert ? 'bg-amber-950/20 border-amber-500/40' : ''}
      >
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            Density Status
          </span>
          <div className={`p-1.5 rounded-lg ${overcrowdAlert ? 'text-red-400 bg-red-500/20' : densityAlert ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20'}`}>
            <Gauge size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            overcrowdAlert ? 'text-red-400' : densityAlert ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {overcrowdAlert ? 'CRITICAL' : densityAlert ? 'HIGH' : 'NORMAL'}
          </span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-command-muted flex items-center justify-between">
          <span>{overcrowdAlert ? 'Gate Congested' : densityAlert ? 'Cluster Forming' : 'Even Flow'}</span>
          <span className={`h-2 w-2 rounded-full ${overcrowdAlert ? 'bg-red-400 animate-ping' : densityAlert ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </div>
      </Card>

      {/* 4. HOT ZONES */}
      <Card glow={hotZones.length > 0 ? 'amber' : 'none'}>
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            Hot Zones
          </span>
          <div className={`p-1.5 rounded-lg ${hotZones.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-command-surface text-cyan-400'}`}>
            <Flame size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${hotZones.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {hotZones.length}
          </span>
          <span className="text-xs text-command-dim font-mono">cells</span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-command-muted">
          {hotZones.length > 0 ? (
            <span className="text-amber-400 font-medium">Exceeds density limit</span>
          ) : (
            <span className="text-command-dim">No high-density cells</span>
          )}
        </div>
      </Card>

      {/* 5. AI CONFIDENCE */}
      <Card>
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            AI Confidence
          </span>
          <div className="p-1.5 rounded-lg bg-command-surface text-cyan-400">
            <BrainCircuit size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-command-muted flex items-center justify-between">
          <span className="text-cyan-400">YOLOv8 + Gemma</span>
          <span className="text-command-dim">verified</span>
        </div>
      </Card>

      {/* 6. ALERTS TODAY */}
      <Card glow={criticalAlertsCount > 0 ? 'red' : 'none'}>
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400">
            Alerts Today
          </span>
          <div className={`p-1.5 rounded-lg ${criticalAlertsCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-command-surface text-cyan-400'}`}>
            <BellRing size={16} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {alerts.length}
          </span>
          <span className="text-xs text-command-dim font-mono">total</span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono flex items-center justify-between">
          <span className="text-red-400 font-semibold">{criticalAlertsCount} Critical</span>
          <span className="text-command-dim">{alerts.length - criticalAlertsCount} Warning</span>
        </div>
      </Card>
    </div>
  );
};
