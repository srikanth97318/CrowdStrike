import React from 'react';
import { Users, TrendingUp, Gauge, Activity, ShieldAlert, Target } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatsSummaryProps {
  peakCount: number;
  averageCount: number;
  peakDensityPercent: number;
  totalAlerts: number;
  criticalAlerts: number;
  avgConfidence: number;
  peakZone?: string;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  peakCount,
  averageCount,
  peakDensityPercent,
  totalAlerts,
  criticalAlerts,
  avgConfidence,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. PEAK PEOPLE COUNT */}
      <Card className="p-3 sm:p-4 hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">PEAK PEOPLE</span>
          <Users size={14} className="text-cyan-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-white">{peakCount}</div>
        <div className="text-[10px] font-mono text-command-dim mt-1">Recorded Surge</div>
      </Card>

      {/* 2. AVERAGE PEOPLE COUNT */}
      <Card className="p-3 sm:p-4 hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">AVG PEOPLE</span>
          <TrendingUp size={14} className="text-cyan-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-white">{averageCount}</div>
        <div className="text-[10px] font-mono text-command-dim mt-1">Mean Volume</div>
      </Card>

      {/* 3. PEAK DENSITY */}
      <Card className="p-3 sm:p-4 hover:border-amber-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">PEAK DENSITY</span>
          <Gauge size={14} className="text-amber-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-amber-300">{peakDensityPercent}%</div>
        <div className="text-[10px] font-mono text-command-dim mt-1">Spatial Maximum</div>
      </Card>

      {/* 4. TOTAL ALERTS */}
      <Card className="p-3 sm:p-4 hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">TOTAL ALERTS</span>
          <Activity size={14} className="text-cyan-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-white">{totalAlerts}</div>
        <div className="text-[10px] font-mono text-command-dim mt-1">Logged Events</div>
      </Card>

      {/* 5. CRITICAL ALERTS */}
      <Card className="p-3 sm:p-4 hover:border-red-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">CRITICAL</span>
          <ShieldAlert size={14} className="text-red-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-red-400">{criticalAlerts}</div>
        <div className="text-[10px] font-mono text-command-dim mt-1">Immediate Checks</div>
      </Card>

      {/* 6. AVERAGE DETECTION CONFIDENCE */}
      <Card className="p-3 sm:p-4 hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-command-muted mb-1 text-[11px] font-mono">
          <span className="truncate">AVG CONFIDENCE</span>
          <Target size={14} className="text-cyan-400 shrink-0" />
        </div>
        <div className="text-2xl font-black font-mono text-cyan-400">
          {(avgConfidence * 100).toFixed(1)}%
        </div>
        <div className="text-[10px] font-mono text-command-dim mt-1">YOLOv8 Class 0</div>
      </Card>
    </div>
  );
};
