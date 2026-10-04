import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Eye, ShieldAlert } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertModal } from '../alerts/AlertModal';
import { MonitoringAlert } from '../../types/monitoring';

export const ActiveAlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, acknowledgeAlert, resolveAlert } = useMonitorStore();
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null);

  // Take top 3 active or recent alerts
  const displayAlerts = alerts.slice(0, 3);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Active Safety Alerts"
        subtitle="Live Incident Dispatch Feed"
        icon={<Bell size={18} />}
        action={
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>View All ({alerts.length})</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
          </button>
        }
      />

      <div className="flex-1 space-y-2.5">
        {displayAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-command-muted">
            No active safety alerts. Telemetry nominal.
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition flex items-center justify-between gap-3 text-xs ${
                alert.severity === 'critical'
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                  : 'bg-command-surface border-command-border hover:border-command-muted'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`mt-0.5 p-1 rounded ${alert.severity === 'critical' ? 'text-red-400 bg-red-500/20' : 'text-amber-400 bg-amber-500/20'}`}>
                  <ShieldAlert size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white uppercase text-[11px] truncate">
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                    <Badge
                      variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-300 truncate text-[11px] mt-0.5">
                    {alert.description}
                  </p>
                  <span className="text-[10px] font-mono text-command-dim">
                    {alert.location} • {alert.timestamp}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAlert(alert)}
                className="shrink-0 p-1.5 rounded-md bg-command-card text-command-muted hover:text-white border border-command-border hover:border-cyan-500 transition text-[11px] font-mono flex items-center gap-1"
              >
                <Eye size={12} />
                <span className="hidden sm:inline">VIEW</span>
              </button>
            </div>
          ))
        )}
      </div>

      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
      />
    </Card>
  );
};
