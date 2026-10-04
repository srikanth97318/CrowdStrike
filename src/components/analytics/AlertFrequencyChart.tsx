import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AlertFrequencyPoint } from '../../types/monitoring';

interface AlertFrequencyChartProps {
  data: AlertFrequencyPoint[];
}

export const AlertFrequencyChart: React.FC<AlertFrequencyChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3F" vertical={false} />
          <XAxis
            dataKey="hour"
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
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as AlertFrequencyPoint;
                return (
                  <div className="bg-command-card border border-command-border p-2.5 rounded-lg shadow-xl font-mono text-xs space-y-1">
                    <span className="text-white font-bold block">{item.hour} Window</span>
                    <span className="text-red-400 block">Critical: {item.critical}</span>
                    <span className="text-amber-400 block">Warning: {item.warning}</span>
                    <span className="text-cyan-400 block">Advisory/Info: {item.info}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
          />
          <Bar dataKey="critical" name="Critical" fill="#EF4444" radius={[3, 3, 0, 0]} />
          <Bar dataKey="warning" name="Warning" fill="#F59E0B" radius={[3, 3, 0, 0]} />
          <Bar dataKey="info" name="Advisory/Info" fill="#38BDF8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
