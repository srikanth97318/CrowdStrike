import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesPoint } from '../../types/monitoring';

interface CrowdDensityChartProps {
  data: TimeSeriesPoint[];
}

export const CrowdDensityChart: React.FC<CrowdDensityChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3F" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#4D5D75"
            fontSize={11}
            tickLine={false}
            fontFamily="monospace"
          />
          <YAxis
            stroke="#4D5D75"
            fontSize={11}
            tickLine={false}
            fontFamily="monospace"
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as TimeSeriesPoint;
                return (
                  <div className="bg-command-card border border-command-border p-2.5 rounded-lg shadow-xl font-mono text-xs">
                    <span className="text-command-muted block text-[10px]">{item.time}</span>
                    <span className="text-amber-400 font-bold block text-sm">
                      Density Index: {item.density}%
                    </span>
                    <span className="text-[10px] text-command-dim block">
                      Capacity Utilization: {item.capacityRate}%
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="density"
            stroke="#F59E0B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#densityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
