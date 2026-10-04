import React from 'react';
import { ShieldAlert, Download, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { AlertsTable } from '../components/alerts/AlertsTable';
import { AlertTimeline } from '../components/alerts/AlertTimeline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMonitorStore } from '../store/monitorStore';

export const Alerts: React.FC = () => {
  const { alerts, clearResolvedAlerts } = useMonitorStore();

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const warningAlerts = alerts.filter((a) => a.severity === 'warning').length;
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved').length;

  const handleExportAlerts = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Type,Severity,Camera,Location,PeopleCount,Threshold,Status\n' +
      alerts.map((a) => `"${a.id}","${a.timestamp}","${a.type}","${a.severity}","${a.camera}","${a.location}",${a.peopleCount},${a.threshold},"${a.status}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crowdguard-incidents-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-command-surface p-4 rounded-xl border border-command-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Incident & Advisory Register</h2>
            <p className="text-xs text-command-muted font-mono mt-0.5">
              Auditable log of threshold overages, hot zones, and Gemma 4 vision advisories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={clearResolvedAlerts}
            icon={<Trash2 size={13} />}
          >
            Clear Resolved
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportAlerts}
            icon={<Download size={13} />}
          >
            Export Log (CSV)
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Mandatory 4 Summary Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
        {/* TOTAL ALERTS */}
        <Card className="p-3 sm:p-4 hover:border-cyan-500/40">
          <div className="flex items-center justify-between text-command-muted mb-1 text-xs">
            <span>TOTAL ALERTS</span>
            <Bell size={15} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalAlerts}</div>
          <div className="text-[10px] text-command-dim mt-1">Logged Events</div>
        </Card>

        {/* CRITICAL */}
        <Card className="p-3 sm:p-4 hover:border-red-500/50 bg-red-950/20 border-red-500/30">
          <div className="flex items-center justify-between text-red-300 mb-1 text-xs">
            <span>CRITICAL</span>
            <ShieldAlert size={15} className="text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{criticalAlerts}</div>
          <div className="text-[10px] text-red-300/80 mt-1">Immediate Overcrowd Surges</div>
        </Card>

        {/* WARNING */}
        <Card className="p-3 sm:p-4 hover:border-amber-500/50 bg-amber-950/20 border-amber-500/30">
          <div className="flex items-center justify-between text-amber-300 mb-1 text-xs">
            <span>WARNING</span>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{warningAlerts}</div>
          <div className="text-[10px] text-amber-300/80 mt-1">High-Density Clusters</div>
        </Card>

        {/* RESOLVED */}
        <Card className="p-3 sm:p-4 hover:border-emerald-500/50 bg-emerald-950/20 border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-300 mb-1 text-xs">
            <span>RESOLVED</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{resolvedAlerts}</div>
          <div className="text-[10px] text-emerald-300/80 mt-1">Cleared Interventions</div>
        </Card>
      </div>

      {/* 3. Main Content: Alerts Table and Visual Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <AlertsTable showFilters={true} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AlertTimeline />

          {/* Operator Policy Box */}
          <div className="p-4 rounded-xl bg-command-surface border border-command-border text-xs text-command-muted space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[11px] font-mono">
              <CheckCheck size={14} /> Safety Operator Guidelines
            </div>
            <p className="text-[11px] leading-relaxed">
              When an overcrowding alert is marked as resolved, verify physical camera clearance on the Live Monitor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
