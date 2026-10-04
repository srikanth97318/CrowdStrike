import React from 'react';
import { Flame, Layers, Info } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';

export const HeatmapPanel: React.FC = () => {
  const { gridSize, grid, hotThreshold, hotZones, settings } = useMonitorStore();

  // Find maximum count for scaling color ratios
  let maxCount = 1;
  if (grid) {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r] && grid[r][c] > maxCount) {
          maxCount = grid[r][c];
        }
      }
    }
  }

  // Map density count to Jet colormap background & border
  const getCellStyles = (count: number, isHot: boolean) => {
    if (count === 0) {
      return {
        bg: 'bg-command-surface/60',
        border: 'border-command-border/40',
        text: 'text-command-dim',
      };
    }

    if (isHot) {
      return {
        bg: 'bg-red-600/35 animate-pulse',
        border: 'border-red-500 ring-2 ring-red-500/40',
        text: 'text-white font-extrabold',
      };
    }

    const ratio = count / Math.max(maxCount, 1);
    if (ratio > 0.6) {
      return {
        bg: 'bg-amber-500/30',
        border: 'border-amber-500/60',
        text: 'text-amber-200 font-bold',
      };
    } else if (ratio > 0.3) {
      return {
        bg: 'bg-cyan-500/25',
        border: 'border-cyan-500/50',
        text: 'text-cyan-200 font-medium',
      };
    } else {
      return {
        bg: 'bg-blue-600/20',
        border: 'border-blue-500/40',
        text: 'text-blue-200',
      };
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Crowd Density Map"
        subtitle={`Spatial Grid: ${gridSize}×${gridSize} cells (Alpha: ${settings.heatmapAlpha})`}
        icon={<Layers size={18} />}
        action={
          <span className="text-xs font-mono text-command-muted flex items-center gap-1">
            <Flame size={14} className={hotZones.length > 0 ? 'text-amber-400' : 'text-command-dim'} />
            <span className={hotZones.length > 0 ? 'text-amber-400 font-semibold' : ''}>
              {hotZones.length} Hot {hotZones.length === 1 ? 'Cell' : 'Cells'}
            </span>
          </span>
        }
      />

      {/* Grid Container */}
      <div className="flex-1 flex flex-col justify-center my-2">
        <div
          className="grid gap-2 aspect-square max-w-[380px] mx-auto w-full p-2 bg-command-surface rounded-lg border border-command-border"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => {
              const count = grid && grid[r] ? grid[r][c] : 0;
              const isHot = count >= hotThreshold;
              const styles = getCellStyles(count, isHot);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-md border p-2 flex flex-col items-center justify-center transition-all duration-300 ${styles.bg} ${styles.border} group`}
                >
                  <span className={`font-mono text-base sm:text-lg ${styles.text}`}>
                    {count}
                  </span>

                  {/* Hot Badge */}
                  {isHot && (
                    <span className="absolute -top-2 px-1 py-0.2 rounded bg-red-600 text-white font-mono text-[9px] font-bold uppercase tracking-tight shadow-danger-glow scale-90 sm:scale-100">
                      HOT
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-command-dim mt-0.5 opacity-70">
                    r{r + 1}c{c + 1}
                  </span>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-command-card text-white text-[11px] font-mono px-2 py-1 rounded shadow-xl border border-command-border whitespace-nowrap">
                      Row {r + 1} • Col {c + 1}: {count} {count === 1 ? 'person' : 'people'}
                      {isHot && <span className="text-red-400 block font-bold">HIGH DENSITY (≥{hotThreshold})</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Colormap Legend (matching detect_final.py) */}
      <div className="pt-3 border-t border-command-border/60 flex items-center justify-between text-xs font-mono text-command-muted">
        <span className="flex items-center gap-1.5">
          <Info size={12} className="text-command-dim" />
          <span>Threshold: ≥{hotThreshold} people/cell</span>
        </span>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 border border-white/20" /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400 border border-white/20" /> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500 border border-white/20" /> High
          </span>
        </div>
      </div>
    </Card>
  );
};
