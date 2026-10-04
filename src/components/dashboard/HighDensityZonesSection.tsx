import React from 'react';
import { Flame, MapPin, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DensityLevel } from '../../types/monitoring';

export const HighDensityZonesSection: React.FC = () => {
  const { hotZones, hotThreshold, peopleCount } = useMonitorStore();

  const getDensityBadge = (level: DensityLevel) => {
    switch (level) {
      case 'critical':
        return <Badge variant="critical" size="sm" dot pulse>CRITICAL DENSITY</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm" dot>HIGH DENSITY</Badge>;
      case 'medium':
        return <Badge variant="info" size="sm">MEDIUM DENSITY</Badge>;
      case 'low':
      default:
        return <Badge variant="safe" size="sm">LOW DENSITY</Badge>;
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="High-Density Zones"
        subtitle={`Zonal hot-spot breakdown (Threshold: ≥${hotThreshold} people/cell)`}
        icon={<Flame size={18} />}
        action={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-command-muted">Active Clusters:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
              hotZones.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {hotZones.length} {hotZones.length === 1 ? 'ZONE' : 'ZONES'}
            </span>
          </div>
        }
      />

      <div className="flex-1 space-y-3">
        {hotZones.length === 0 ? (
          <div className="py-8 text-center bg-command-surface rounded-lg border border-command-border/60 p-4 space-y-2">
            <ShieldCheck size={28} className="mx-auto text-emerald-400" />
            <p className="text-xs font-mono text-gray-200 font-semibold">All Spatial Grid Cells Nominal</p>
            <p className="text-[11px] font-mono text-command-muted">
              No grid cell exceeds the {hotThreshold} person concentration limit. Foot traffic distributed uniformly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotZones.map((zone) => (
              <div
                key={`${zone.row}-${zone.col}`}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                  zone.densityLevel === 'critical'
                    ? 'bg-red-950/25 border-red-500/60 shadow-danger-glow'
                    : zone.densityLevel === 'high'
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-command-surface border-command-border'
                }`}
              >
                {/* Zone Name & Severity State */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${
                      zone.densityLevel === 'critical'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <AlertTriangle size={15} />
                    </div>
                    <div>
                      <span className="font-mono font-black text-sm text-white tracking-wider">
                        {zone.zoneName}
                      </span>
                      <span className="text-[10px] text-command-muted font-mono block">
                        Quadrant Sector
                      </span>
                    </div>
                  </div>

                  {getDensityBadge(zone.densityLevel)}
                </div>

                {/* Coordinate & People Count */}
                <div className="bg-command-card/80 p-2.5 rounded-md border border-command-border space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-command-muted">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin size={12} className="text-cyan-400" /> Spatial Coordinates:
                    </span>
                    <span className="text-white font-bold">
                      Row {zone.row + 1} / Column {zone.col + 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-command-muted">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Users size={12} className="text-cyan-400" /> Measured Count:
                    </span>
                    <span className={`font-bold ${
                      zone.densityLevel === 'critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {zone.count} people
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-command-dim pt-1 border-t border-command-border/40">
                    <span>Hot Threshold: ≥{hotThreshold}</span>
                    <span>{Math.round((zone.count / peopleCount) * 100)}% of total crowd</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Density State Scale Reference */}
      <div className="mt-4 pt-3 border-t border-command-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-command-muted">
        <span className="text-[11px] text-command-dim">Density Classification Standard:</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">● LOW (&lt;{hotThreshold})</span>
          <span className="flex items-center gap-1 text-cyan-400">● MEDIUM (={hotThreshold})</span>
          <span className="flex items-center gap-1 text-amber-400">● HIGH (&gt;{hotThreshold})</span>
          <span className="flex items-center gap-1 text-red-400">● CRITICAL (&ge;{hotThreshold + 3})</span>
        </div>
      </div>
    </Card>
  );
};
