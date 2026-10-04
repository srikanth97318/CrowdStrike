import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesPoint } from '../../types/monitoring';

interface PeopleCountChartProps {
  data: TimeSeriesPoint[];
  threshold: number;
}

export const PeopleCountChart: React.FC<PeopleCountChartProps> = ({ data, threshold }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="peopleColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
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
            domain={[0, (dataMax: number) => Math.max(dataMax + 5, threshold + 8)]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as TimeSeriesPoint;
                const isOver = item.count >= threshold;
                return (
                  <div className="bg-command-card border border-command-border p-2.5 rounded-lg shadow-xl font-mono text-xs">
                    <span className="text-command-muted block text-[10px]">{item.time}</span>
                    <span className={`text-sm font-bold block ${isOver ? 'text-red-400' : 'text-cyan-400'}`}>
                      {item.count} people detected
                    </span>
                    <span className="text-[10px] text-command-dim block">
                      Capacity: {item.capacityRate}% (Limit: {threshold})
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={threshold}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Threshold (${threshold})`,
              fill: '#EF4444',
              fontSize: 10,
              position: 'insideTopRight',
              fontFamily: 'monospace',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#00E5FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#peopleColor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
