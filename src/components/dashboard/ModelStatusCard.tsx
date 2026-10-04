import React from 'react';
import { Send, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ModelStatusCard: React.FC = () => {
  const { settings, telegramStatus } = useMonitorStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. AI Intelligence & Vision Stack Card */}
      <Card className="border-cyan-500/30 shadow-cyan-glow/20">
        <CardHeader
          title="AI Intelligence & Vision Stack"
          subtitle="Gemma 4 Multimodal Intelligence + YOLOv8"
          icon={<Sparkles size={18} className="text-cyan-400" />}
          action={
            <Badge variant="cyan" dot size="sm">
              POWERED BY GEMMA
            </Badge>
          }
        />

        <div className="space-y-3 font-mono text-xs">
          {/* Primary Showcase: Gemma 4 AI Intelligence */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/40 to-command-surface border border-cyan-500/50 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${settings.gemmaEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                <div>
                  <span className="font-bold text-white text-sm">Gemma 4 AI Intelligence</span>
                  <span className="text-[10px] text-cyan-300 block">{settings.gemmaModel}</span>
                </div>
              </div>
              <Badge variant="cyan" size="sm">
                HEADLINE AI
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-command-muted border-t border-cyan-500/20">
              <div className="flex items-center gap-1 text-gray-300">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
                <span>Scene Analysis</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
                <span>Safety Alerts</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
                <span>Interpretation</span>
              </div>
            </div>
          </div>

          {/* Secondary Vision Detection: YOLOv8 */}
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <div>
                <span className="font-bold text-gray-200">Vision Detection: YOLOv8</span>
                <span className="text-[10px] text-command-dim block">Real-time local frame inference & boxes</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">ACTIVE</span>
              <span className="text-[10px] text-command-dim block">Class 0: Person</span>
            </div>
          </div>

          {/* AI Architecture Pipeline Flow */}
          <div className="p-2 rounded-lg bg-black/40 border border-command-border/50">
            <div className="text-[9px] uppercase tracking-wider text-command-muted font-bold mb-1 flex items-center justify-between">
              <span>Pipeline Dataflow</span>
              <span className="text-cyan-400">Two-Layer Architecture</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-center text-gray-300">
              <div className="px-1.5 py-0.5 rounded bg-command-surface border border-command-border text-command-muted">
                Video Feed
              </div>
              <span className="text-cyan-400 font-bold">→</span>
              <div className="px-1.5 py-0.5 rounded bg-command-surface border border-command-border text-gray-200">
                YOLOv8 Detection
              </div>
              <span className="text-cyan-400 font-bold">→</span>
              <div className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 font-bold">
                Gemma 4 Reasoning
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Telegram Integration Card */}
      <Card>
        <CardHeader
          title="Telegram Alerts"
          subtitle="Bot API Operator Dispatch"
          icon={<Send size={18} />}
          action={
            <Badge variant={telegramStatus.connected ? 'safe' : 'neutral'} dot size="sm">
              {telegramStatus.connected ? 'CONNECTED' : 'STANDBY'}
            </Badge>
          }
        />

        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-command-muted uppercase block">Crowd Alerts</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={13} /> ENABLED
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-command-muted uppercase block">Density Alerts</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={13} /> ENABLED
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border flex items-center justify-between">
            <span className="text-command-muted">Dispatch Cooldown:</span>
            <span className="text-white font-bold">{telegramStatus.cooldownSec} seconds</span>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-command-muted border-t border-command-border/60">
            <span className="flex items-center gap-1 text-command-dim">
              <Shield size={12} className="text-cyan-400" />
              <span>Token Vault: Protected / Server-side</span>
            </span>
            <span className="text-cyan-400">SSL Encrypted</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
