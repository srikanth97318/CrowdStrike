import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertTriangle, Flame, Eye, Cpu, CheckCircle } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';

export const LiveEventFeed: React.FC = () => {
  const { events } = useMonitorStore();

  const getEventIcon = (type: string, severity: string) => {
    switch (type) {
      case 'OVERCROWD':
        return <AlertTriangle size={14} className="text-red-400" />;
      case 'HIGH_DENSITY':
        return <Flame size={14} className="text-amber-400" />;
      case 'AI_REVIEW':
        return <Eye size={14} className="text-cyan-400" />;
      case 'RESOLVED':
        return <CheckCircle size={14} className="text-emerald-400" />;
      case 'SYSTEM':
      default:
        return <Cpu size={14} className={severity === 'safe' ? 'text-emerald-400' : 'text-command-dim'} />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'safe':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'info':
      default:
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Live Security Event Feed"
        subtitle="Real-time optical audit trail"
        icon={<Radio size={18} className="animate-pulse" />}
        action={
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            AUTO-STREAM
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto max-h-[320px] pr-1 space-y-2 font-mono text-xs">
        <AnimatePresence initial={false}>
          {events.slice(0, 10).map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2.5 rounded-lg bg-command-surface border border-command-border/80 hover:border-command-muted transition-colors flex items-start gap-2.5"
            >
              <div className="mt-0.5 p-1 rounded bg-command-card border border-command-border shrink-0">
                {getEventIcon(evt.type, evt.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(evt.severity)}`}>
                    {evt.title}
                  </span>
                  <span className="text-[10px] text-command-dim whitespace-nowrap">
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-gray-200 mt-1 leading-snug break-words">
                  {evt.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};
