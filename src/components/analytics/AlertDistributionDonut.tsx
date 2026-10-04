import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertStatPoint } from '../../types/monitoring';

interface AlertDistributionDonutProps {
  data: AlertStatPoint[];
}

export const AlertDistributionDonut: React.FC<AlertDistributionDonutProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64 w-full">
      <div className="h-full w-full sm:w-1/2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as AlertStatPoint;
                  return (
                    <div className="bg-command-card border border-command-border p-2 rounded-lg shadow-xl font-mono text-xs">
                      <span className="text-white font-bold block">{item.name}</span>
                      <span className="text-cyan-400 block">{item.value} alerts ({Math.round((item.value / Math.max(total, 1)) * 100)}%)</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#080B11" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-white">{total}</span>
          <span className="text-[10px] font-mono text-command-muted uppercase">Incidents</span>
        </div>
      </div>

      {/* Legend Column */}
      <div className="w-full sm:w-1/2 space-y-2 font-mono text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-command-muted">
            <div className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate text-gray-200">{item.name}</span>
            </div>
            <span className="font-bold text-white ml-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
