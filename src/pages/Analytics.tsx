import React, { useState } from 'react';
import {
  Calendar,
  Download,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Gauge,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatsSummary } from '../components/analytics/StatsSummary';
import { PeopleCountChart } from '../components/analytics/PeopleCountChart';
import { CrowdDensityChart } from '../components/analytics/CrowdDensityChart';
import { AlertFrequencyChart } from '../components/analytics/AlertFrequencyChart';
import { AlertDistributionDonut } from '../components/analytics/AlertDistributionDonut';
import {
  generateTimeSeriesData,
  MOCK_ALERT_DISTRIBUTION,
  MOCK_ALERT_FREQUENCY,
} from '../services/mockData';
import { useMonitorStore } from '../store/monitorStore';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | 'today' | '7d'>('1h');
  const { crowdThreshold, detectionConfidence, alerts } = useMonitorStore();

  const pointsCount = timeRange === '15m' ? 15 : timeRange === '1h' ? 24 : timeRange === 'today' ? 36 : 48;
  const timeSeriesData = generateTimeSeriesData(pointsCount, crowdThreshold);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Time,PeopleCount,DensityPercent,Threshold,CapacityPercent\n' +
      timeSeriesData.map((d) => `${d.time},${d.count},${d.density}%,${d.threshold},${d.capacityRate}%`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crowdguard-analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Time-Range Filters & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-command-surface p-4 rounded-xl border border-command-border">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Historical Crowd Analytics</h2>
          <p className="text-xs text-command-muted font-mono mt-0.5">
            Statistical flow telemetry, congestion surges, and alert distribution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-command-card p-1 rounded-lg border border-command-border text-xs font-mono">
            <span className="text-command-dim px-2 flex items-center gap-1">
              <Calendar size={12} />
            </span>
            {(['15m', '1h', 'today', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded transition uppercase ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-command-muted hover:text-white'
                }`}
              >
                {r === '15m' ? 'LAST 15 MIN' : r === '1h' ? 'LAST HOUR' : r === 'today' ? 'TODAY' : 'LAST 7 DAYS'}
              </button>
            ))}
          </div>

          {/* Export Report CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            icon={<Download size={13} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Mandatory Analytics KPI Cards */}
      <StatsSummary
        peakCount={38}
        averageCount={17}
        peakDensityPercent={92}
        totalAlerts={alerts.length}
        criticalAlerts={criticalCount}
        avgConfidence={detectionConfidence}
      />

      {/* 3. Primary Charts Row: People Count & Crowd Density Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: People Count Over Time (Line Chart with Threshold) */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title={`People Count Over Time — ${timeRange.toUpperCase()}`}
              subtitle="Temporal volume trend compared with safety capacity threshold"
              icon={<TrendingUp size={18} />}
            />
            <PeopleCountChart data={timeSeriesData} threshold={crowdThreshold} />
          </Card>
        </div>

        {/* Chart 2: Crowd Density Over Time (Area Chart) */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title={`Crowd Density Over Time — ${timeRange.toUpperCase()}`}
              subtitle="Temporal facility occupancy and density percentage"
              icon={<Gauge size={18} />}
            />
            <CrowdDensityChart data={timeSeriesData} />
          </Card>
        </div>
      </div>

      {/* 4. Secondary Charts Row: Alert Frequency & Alert Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Alert Frequency (Bar Chart) */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title="Alert Frequency"
              subtitle="Hourly distribution of safety incidents"
              icon={<Activity size={18} />}
            />
            <AlertFrequencyChart data={MOCK_ALERT_FREQUENCY} />
          </Card>
        </div>

        {/* Chart 4: Alert Severity Distribution (Donut Chart) */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title="Alert Severity Distribution"
              subtitle="Incident proportion by category"
              icon={<PieIcon size={18} />}
            />
            <AlertDistributionDonut data={MOCK_ALERT_DISTRIBUTION} />
          </Card>
        </div>
      </div>
    </div>
  );
};
