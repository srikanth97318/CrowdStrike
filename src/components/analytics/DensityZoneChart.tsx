import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ZoneDensityPoint } from '../../types/monitoring';

interface DensityZoneChartProps {
  data: ZoneDensityPoint[];
}

export const DensityZoneChart: React.FC<DensityZoneChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3F" horizontal={false} />
          <XAxis
            type="number"
            stroke="#4D5D75"
            fontSize={11}
            tickLine={false}
            fontFamily="monospace"
          />
          <YAxis
            type="category"
            dataKey="zone"
            stroke="#8B9BB4"
            fontSize={11}
            tickLine={false}
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ZoneDensityPoint;
                return (
                  <div className="bg-command-card border border-command-border p-2 rounded-lg shadow-xl font-mono text-xs">
                    <span className="text-white font-bold block">{item.zone}</span>
                    <span className="text-cyan-400 block">{item.count} people / {item.maxCapacity} cap</span>
                    <span className={`text-[10px] uppercase font-bold block ${
                      item.status === 'high' ? 'text-red-400' : item.status === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.status} DENSITY
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => {
              const color = entry.status === 'high' ? '#EF4444' : entry.status === 'moderate' ? '#F59E0B' : '#00E5FF';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
