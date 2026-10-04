import React from 'react';
import { ShieldAlert, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const GemmaVisionPanel: React.FC = () => {
  const { aiAnalysis, aiConfidence, settings, gemmaStatus } = useMonitorStore();

  const getSeverityBadge = () => {
    switch (aiAnalysis.severity) {
      case 'high':
        return <Badge variant="critical" dot>HIGH ADVISORY</Badge>;
      case 'moderate':
        return <Badge variant="warning" dot>MODERATE ADVISORY</Badge>;
      case 'low':
      default:
        return <Badge variant="safe" dot>ROUTINE FLOW</Badge>;
    }
  };

  return (
    <Card className="flex flex-col border-cyan-500/40 shadow-cyan-glow/20">
      <CardHeader
        title="✦ GEMMA AI INTELLIGENCE"
        subtitle={`Gemma 4 Multimodal Reasoning (${settings.gemmaModel})`}
        icon={<Sparkles size={18} className="text-cyan-400" />}
        action={
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${gemmaStatus === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
              {gemmaStatus === 'active' ? 'GEMMA 4 ACTIVE' : 'GEMMA STANDBY'}
            </span>
          </div>
        }
      />

      <div className="flex-1 space-y-4">
        {/* Assessment Statement Banner */}
        <div className="p-3.5 rounded-lg bg-command-surface border border-command-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-command-muted uppercase text-[10px] tracking-wider">
              Latest Visual Observation
            </span>
            {getSeverityBadge()}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed font-sans">
            "{aiAnalysis.observation}"
          </p>
        </div>

        {/* Recommended Operator Action (Strictly Advisory) */}
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wide uppercase text-[10px]">
            <ShieldAlert size={13} />
            <span>Recommended Operator Action (Advisory Only)</span>
          </div>
          <p className="text-gray-300 font-mono text-[11px]">
            "{aiAnalysis.recommendedCheck}"
          </p>
        </div>

        {/* AI Metrics Row */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-mono">
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">Confidence</span>
            <span className="text-base font-bold text-cyan-400">
              {(aiConfidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">Severity</span>
            <span className={`text-base font-bold uppercase ${
              aiAnalysis.severity === 'high' ? 'text-red-400' : aiAnalysis.severity === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {aiAnalysis.severity}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">Last Analysis</span>
            <span className="text-xs font-semibold text-gray-200 flex items-center justify-center gap-1 mt-1">
              <Clock size={11} className="text-command-dim" />
              {aiAnalysis.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Compliance Notice & Powered by Gemma Branding */}
      <div className="mt-4 pt-3 border-t border-command-border/60 flex items-center justify-between text-[11px] text-command-muted font-mono">
        <div className="flex items-center gap-1.5 text-[10px]">
          <CheckCircle size={12} className="text-cyan-400 shrink-0" />
          <span>Human-in-the-loop decision support</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
          Powered by Gemma
        </span>
      </div>
    </Card>
  );
};
