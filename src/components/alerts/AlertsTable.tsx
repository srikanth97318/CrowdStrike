import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Radio,
  Calendar,
} from 'lucide-react';
import { MonitoringAlert } from '../../types/monitoring';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertModal } from './AlertModal';
import { useMonitorStore } from '../../store/monitorStore';

interface AlertsTableProps {
  limit?: number;
  showFilters?: boolean;
}

export const AlertsTable: React.FC<AlertsTableProps> = ({
  limit,
  showFilters = true,
}) => {
  const navigate = useNavigate();
  const { alerts, acknowledgeAlert, resolveAlert } = useMonitorStore();
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'recent'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = limit || 10;

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    // Type & Status filter
    if (filterType === 'critical' && alert.severity !== 'critical') return false;
    if (filterType === 'warning' && alert.severity !== 'warning') return false;
    if (filterType === 'ai_review' && alert.type !== 'AI_SAFETY_REVIEW') return false;
    if (filterType === 'system' && !['SYSTEM_WARNING', 'CAMERA_ERROR', 'BACKEND_ERROR'].includes(alert.type)) return false;
    if (filterType === 'resolved' && alert.status !== 'resolved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        alert.description.toLowerCase().includes(q) ||
        alert.location.toLowerCase().includes(q) ||
        alert.camera.toLowerCase().includes(q) ||
        alert.type.toLowerCase().includes(q) ||
        alert.severity.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'OVERCROWD': return 'OVERCROWDING';
      case 'HIGH_DENSITY': return 'HIGH-DENSITY ZONE';
      case 'AI_SAFETY_REVIEW': return 'AI SAFETY REVIEW';
      case 'CAMERA_ERROR': return 'CAMERA ERROR';
      case 'BACKEND_ERROR': return 'BACKEND ERROR';
      case 'SYSTEM_WARNING': return 'SYSTEM WARNING';
      default: return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-command-surface p-3.5 rounded-xl border border-command-border">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-command-muted" />
            <input
              type="text"
              placeholder="Search by zone, camera, incident description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-command-card border border-command-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-command-dim focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date/Time Filter */}
            <div className="flex items-center gap-1 bg-command-card px-2 py-1 rounded-lg border border-command-border text-xs font-mono">
              <Calendar size={12} className="text-command-dim" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-gray-300 focus:outline-none text-[11px] font-mono cursor-pointer"
              >
                <option value="all" className="bg-command-card text-white">All Windows</option>
                <option value="today" className="bg-command-card text-white">Today</option>
                <option value="recent" className="bg-command-card text-white">Last Hour</option>
              </select>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <span className="text-command-dim flex items-center gap-1 mr-1">
                <Filter size={12} />
              </span>
              {[
                { id: 'all', label: 'ALL' },
                { id: 'critical', label: 'CRITICAL' },
                { id: 'warning', label: 'WARNING' },
                { id: 'ai_review', label: 'AI REVIEW' },
                { id: 'system', label: 'SYSTEM' },
                { id: 'resolved', label: 'RESOLVED' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilterType(f.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                    filterType === f.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-command-card text-command-muted border border-command-border hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Alert Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-command-border bg-command-card">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-command-border bg-command-surface text-[11px] font-mono text-command-muted uppercase tracking-wider">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Camera</th>
              <th className="py-3 px-4">People</th>
              <th className="py-3 px-4">Zone / Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-command-border/60">
            {paginatedAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-command-muted font-mono">
                  No safety alerts matching current criteria.
                </td>
              </tr>
            ) : (
              paginatedAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-command-surface/50 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-gray-300 whitespace-nowrap">
                    {alert.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : alert.severity === 'safe' ? 'safe' : 'info'}
                      dot
                      size="sm"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {getTypeLabel(alert.type)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-command-muted truncate max-w-[160px]" title={alert.camera}>
                    {alert.camera.split('—')[0]}
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white">{alert.peopleCount}</span>
                    <span className="text-command-dim text-[10px]"> / {alert.threshold}</span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-200 max-w-[200px] truncate" title={alert.location}>
                    {alert.location}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={alert.status === 'resolved' ? 'safe' : alert.status === 'acknowledged' ? 'info' : 'warning'}
                      size="sm"
                    >
                      {alert.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                        icon={<Eye size={12} />}
                      >
                        Details
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/monitor')}
                        icon={<Radio size={12} />}
                        title="View Live Monitor"
                      >
                        Monitor
                      </Button>

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="p-1.5 rounded text-command-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="Mark as Resolved"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alerts Card View (Mobile) */}
      <div className="md:hidden space-y-3">
        {paginatedAlerts.length === 0 ? (
          <div className="py-8 text-center text-command-muted font-mono text-xs bg-command-card rounded-xl border border-command-border">
            No safety alerts matching current criteria.
          </div>
        ) : (
          paginatedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-command-card border border-command-border space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-sm">
                  {getTypeLabel(alert.type)}
                </span>
                <Badge
                  variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
                  size="sm"
                  dot
                >
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>

              <p className="text-command-muted line-clamp-2">{alert.description}</p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-command-dim pt-1 border-t border-command-border/60">
                <span>Time: <strong className="text-gray-200">{alert.timestamp}</strong></span>
                <span>People: <strong className="text-white">{alert.peopleCount} pax</strong></span>
                <span className="col-span-2 truncate">Location: <strong className="text-gray-200">{alert.location}</strong></span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-command-border/60">
                <Badge
                  variant={alert.status === 'resolved' ? 'safe' : alert.status === 'acknowledged' ? 'info' : 'warning'}
                  size="sm"
                >
                  {alert.status.toUpperCase()}
                </Badge>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAlert(alert)}
                    icon={<Eye size={12} />}
                  >
                    Details
                  </Button>
                  {alert.status !== 'resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-command-muted pt-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAlerts.length)} of{' '}
            {filteredAlerts.length} events
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-command-card border border-command-border disabled:opacity-30 hover:text-white"
            >
              Prev
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-command-card border border-command-border disabled:opacity-30 hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
      />
    </div>
  );
};
