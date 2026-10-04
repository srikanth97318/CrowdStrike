import React from 'react';
import { ShieldAlert, MapPin, Users, Clock, Camera, CheckCircle2 } from 'lucide-react';
import { MonitoringAlert } from '../../types/monitoring';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AlertModalProps {
  alert: MonitoringAlert | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
}) => {
  if (!alert) return null;

  return (
    <Modal
      isOpen={!!alert}
      onClose={onClose}
      title={`${alert.type.replace(/_/g, ' ')} INCIDENT`}
      subtitle={`Incident ID: ${alert.id} • Registered at ${alert.timestamp}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Severity Banner */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-command-surface border border-command-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-command-muted font-mono uppercase">Severity:</span>
            <Badge
              variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
              dot
            >
              {alert.severity.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-command-muted font-mono uppercase">Status:</span>
            <Badge variant={alert.status === 'resolved' ? 'safe' : alert.status === 'acknowledged' ? 'info' : 'warning'}>
              {alert.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-command-surface border border-command-border space-y-1">
            <span className="text-command-dim flex items-center gap-1">
              <Camera size={12} className="text-cyan-400" /> CAMERA FEED
            </span>
            <span className="text-white font-medium block truncate">{alert.camera}</span>
          </div>

          <div className="p-3 rounded-lg bg-command-surface border border-command-border space-y-1">
            <span className="text-command-dim flex items-center gap-1">
              <MapPin size={12} className="text-cyan-400" /> LOCATION / ZONE
            </span>
            <span className="text-white font-medium block truncate">{alert.location}</span>
          </div>

          <div className="p-3 rounded-lg bg-command-surface border border-command-border space-y-1">
            <span className="text-command-dim flex items-center gap-1">
              <Users size={12} className="text-cyan-400" /> MEASURED DENSITY
            </span>
            <span className="text-white font-medium block">
              {alert.peopleCount} pax (Threshold: {alert.threshold})
            </span>
          </div>

          <div className="p-3 rounded-lg bg-command-surface border border-command-border space-y-1">
            <span className="text-command-dim flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" /> TIMESTAMP
            </span>
            <span className="text-white font-medium block">{alert.timestamp}</span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-3.5 rounded-lg bg-command-surface border border-command-border space-y-1.5">
          <span className="text-[11px] font-mono uppercase text-command-dim">Incident Log</span>
          <p className="text-sm text-gray-200">{alert.description}</p>
        </div>

        {/* Suggested Operator Action (Human Review Recommended) */}
        {alert.suggestedAction && (
          <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[10px] tracking-wide">
              <ShieldAlert size={14} /> Recommended Human Action
            </div>
            <p className="text-gray-300 font-mono text-[11px]">{alert.suggestedAction}</p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-command-border flex items-center justify-end gap-2.5">
          {alert.status === 'active' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onAcknowledge(alert.id);
                onClose();
              }}
            >
              Acknowledge Alert
            </Button>
          )}

          {alert.status !== 'resolved' && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle2 size={14} />}
              onClick={() => {
                onResolve(alert.id);
                onClose();
              }}
            >
              Mark as Resolved
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
