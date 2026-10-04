import React from 'react';
import { Clock, ShieldAlert, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';

export const AlertTimeline: React.FC = () => {
  const { alerts } = useMonitorStore();

  const timelineAlerts = alerts.slice(0, 6);

  const getMarker = (severity: string, status: string) => {
    if (status === 'resolved') {
      return {
        icon: <CheckCircle2 size={13} className="text-emerald-400" />,
        color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
        badge: '🟢 RESOLVED',
        badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      };
    }
    switch (severity) {
      case 'critical':
        return {
          icon: <ShieldAlert size={13} className="text-red-400 animate-pulse" />,
          color: 'border-red-500 bg-red-500/10 text-red-400',
          badge: '🔴 CRITICAL',
          badgeColor: 'text-red-400 border-red-500/40 bg-red-500/15',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={13} className="text-amber-400" />,
          color: 'border-amber-500 bg-amber-500/10 text-amber-400',
          badge: '🟠 WARNING',
          badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        };
      case 'info':
      default:
        return {
          icon: <Eye size={13} className="text-cyan-400" />,
          color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
          badge: '🔵 AI REVIEW',
          badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
        };
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Incident Timeline"
        subtitle="Chronological sequence of safety interventions"
        icon={<Clock size={18} />}
      />

      <div className="flex-1 relative pl-6 pr-2 py-2 space-y-4 font-mono text-xs">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-command-border/80" />

        {timelineAlerts.map((alert) => {
          const marker = getMarker(alert.severity, alert.status);
          return (
            <div key={alert.id} className="relative group flex items-start gap-3">
              {/* Timeline Node Dot */}
              <div className={`absolute -left-6 mt-1 h-5 w-5 rounded-full border flex items-center justify-center bg-command-card z-10 ${marker.color}`}>
                {marker.icon}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 bg-command-surface p-2.5 rounded-lg border border-command-border/70 hover:border-command-muted transition">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${marker.badgeColor}`}>
                    {marker.badge}
                  </span>
                  <span className="text-[10px] text-command-dim">{alert.timestamp}</span>
                </div>

                <div className="mt-1.5 font-bold text-white text-xs truncate">
                  {alert.description.split('.')[0]}
                </div>

                <div className="flex items-center justify-between text-[10px] text-command-muted mt-1">
                  <span>{alert.location}</span>
                  <span className="text-cyan-400 font-bold">{alert.peopleCount} pax</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
