import React from 'react';
import { Cpu, Send, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ModelStatusCard: React.FC = () => {
  const { settings, telegramStatus } = useMonitorStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Detection Engine Card */}
      <Card>
        <CardHeader
          title="Detection Engine"
          subtitle="Dual Computer Vision Architecture"
          icon={<Cpu size={18} />}
          action={
            <Badge variant="safe" dot size="sm">
              ACTIVE
            </Badge>
          }
        />

        <div className="space-y-3 font-mono text-xs">
          {/* YOLOv8 Status */}
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <div>
                <span className="font-bold text-white">YOLOv8 Local</span>
                <span className="text-[10px] text-command-muted block">Real-time Local Inference</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-cyan-400 font-bold">Conf: {settings.confThreshold}</span>
              <span className="text-[10px] text-command-dim block">Class 0: Person</span>
            </div>
          </div>

          {/* Gemma 4 Vision Status */}
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${settings.gemmaEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <div>
                <span className="font-bold text-white">Gemma 4 Vision</span>
                <span className="text-[10px] text-command-muted block">{settings.gemmaModel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-cyan-400 font-bold">Every {settings.gemmaInterval}s</span>
              <span className="text-[10px] text-command-dim block">Tool: notify_safety</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-command-muted border-t border-command-border/60">
            <span className="flex items-center gap-1">
              <Sliders size={12} className="text-cyan-400" />
              <span>Pipeline: YOLOv8 + Gemma 4</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Synchronized
            </span>
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
