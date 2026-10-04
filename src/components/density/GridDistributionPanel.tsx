import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';

export const GridDistributionPanel: React.FC = () => {
  const { gridSize, grid, hotThreshold, peopleCount } = useMonitorStore();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Crowd Distribution Matrix"
        subtitle={`Matrix grid_counts[${gridSize}][${gridSize}]`}
        icon={<LayoutGrid size={18} />}
        action={
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            Total: {peopleCount} pax
          </span>
        }
      />

      <div className="flex-1 flex flex-col justify-center overflow-x-auto py-2">
        <div className="min-w-[260px] mx-auto border border-command-border rounded-lg overflow-hidden bg-command-surface font-mono">
          {/* Header Row */}
          <div className="grid border-b border-command-border bg-command-card text-[11px] text-command-muted font-bold text-center"
               style={{ gridTemplateColumns: `40px repeat(${gridSize}, 1fr)` }}>
            <div className="p-2 border-r border-command-border text-command-dim">#</div>
            {Array.from({ length: gridSize }).map((_, c) => (
              <div key={c} className="p-2 border-r last:border-r-0 border-command-border">
                C{c + 1}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {Array.from({ length: gridSize }).map((_, r) => (
            <div
              key={r}
              className="grid border-b last:border-b-0 border-command-border text-center text-xs"
              style={{ gridTemplateColumns: `40px repeat(${gridSize}, 1fr)` }}
            >
              <div className="p-2.5 bg-command-card/50 border-r border-command-border text-[11px] text-command-muted font-bold flex items-center justify-center">
                R{r + 1}
              </div>

              {Array.from({ length: gridSize }).map((_, c) => {
                const count = grid && grid[r] ? grid[r][c] : 0;
                const isHot = count >= hotThreshold;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`p-2.5 border-r last:border-r-0 border-command-border flex items-center justify-center transition-colors relative ${
                      isHot ? 'bg-red-500/20 text-red-300 font-bold' : count > 0 ? 'text-gray-100 hover:bg-command-card' : 'text-command-dim'
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={count}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="inline-block"
                      >
                        {count}
                      </motion.span>
                    </AnimatePresence>

                    {isHot && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-400" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-command-border/60 text-xs font-mono text-command-muted flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px]">
          <AlertCircle size={12} className="text-amber-400" />
          <span>Hot zone rule: count ≥ {hotThreshold}</span>
        </span>
        <span className="text-[11px] text-command-dim">Foot coordinate mapping</span>
      </div>
    </Card>
  );
};
