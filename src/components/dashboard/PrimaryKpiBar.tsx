import React from 'react';
import {
  Target,
  Sliders,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card } from '../ui/Card';

export const PrimaryKpiBar: React.FC = () => {
  const {
    peopleCount,
    crowdThreshold,
    detectionConfidence,
    overcrowdAlert,
    settings,
    setCrowdThreshold,
  } = useMonitorStore();

  const isOver = peopleCount >= crowdThreshold;
  const capacityPercent = Math.min(100, Math.round((peopleCount / crowdThreshold) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. AI INTELLIGENCE & DETECTION CONFIDENCE */}
      <Card className="relative overflow-hidden hover:border-cyan-500/50">
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-xs font-mono tracking-wider uppercase font-bold text-gray-300 flex items-center gap-1.5">
            <Target size={15} className="text-cyan-400" />
            AI Intelligence & Detection
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Gemma AI ● ACTIVE
          </span>
        </div>

        {/* Confidence Value & Ring Visual */}
        <div className="flex items-center justify-between mt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-cyan-400">
                {(detectionConfidence * 100).toFixed(1)}
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400/80">%</span>
            </div>
            <span className="text-[10px] font-mono text-command-muted block mt-0.5">
              Vision Floor: {(settings.confThreshold * 100).toFixed(0)}%
            </span>
          </div>

          {/* Visual Mini Progress Gauge */}
          <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-command-surface"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-500"
                strokeDasharray={`${detectionConfidence * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-cyan-300">GEMMA</span>
          </div>
        </div>

        {/* Confidence Bar Meter & Technical Architecture Details */}
        <div className="mt-3 pt-2.5 border-t border-command-border/60">
          <div className="w-full bg-command-surface h-1.5 rounded-full overflow-hidden border border-command-border">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${detectionConfidence * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono mt-1">
            <span className="text-gray-300">
              AI Reasoning: <strong className="text-cyan-400">Gemma 4</strong>
            </span>
            <span className="text-command-dim">
              Vision Detection: <strong className="text-gray-300">YOLOv8</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* 2. CROWD THRESHOLD (MANDATORY KPI WITH QUICK TUNING) */}
      <Card
        glow={overcrowdAlert ? 'red' : 'none'}
        className={`relative overflow-hidden transition-all duration-300 ${
          overcrowdAlert ? 'bg-red-950/20 border-red-500/60' : 'hover:border-cyan-500/50'
        }`}
      >
        <div className="flex items-center justify-between text-command-muted mb-2">
          <span className="text-xs font-mono tracking-wider uppercase font-bold text-gray-300 flex items-center gap-1.5">
            <Sliders size={15} className="text-cyan-400" />
            Crowd Threshold
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
            isOver
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-command-surface text-command-muted border border-command-border'
          }`}>
            LIMIT: {crowdThreshold} PEOPLE
          </span>
        </div>

        {/* Current vs Threshold ratio */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
              isOver ? 'text-red-400' : 'text-white'
            }`}>
              {peopleCount}
            </span>
            <span className="text-xl font-bold font-mono text-command-muted">/ {crowdThreshold}</span>
          </div>

          <div className="text-right">
            <span className={`text-xs font-mono font-bold ${isOver ? 'text-red-400' : 'text-cyan-400'}`}>
              {capacityPercent}%
            </span>
            <span className="text-[10px] text-command-dim font-mono block">capacity</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3 pt-2.5 border-t border-command-border/60">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white font-bold">{peopleCount}</span>
            <div className="flex-1 bg-command-surface h-2 rounded-full overflow-hidden border border-command-border">
              <div
                className={`h-full transition-all duration-300 ${
                  isOver ? 'bg-red-500' : capacityPercent > 80 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <span className="text-command-muted">{crowdThreshold}</span>
          </div>

          {/* Quick Threshold Adjust Buttons */}
          <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-1 border-t border-command-border/40">
            <span className="text-command-dim">Quick Limit:</span>
            <div className="flex items-center gap-1">
              {[15, 20, 25, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setCrowdThreshold(val)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                    crowdThreshold === val
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-command-surface text-command-muted hover:text-white border border-command-border'
                  }`}
                  title={`Set threshold to ${val}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
