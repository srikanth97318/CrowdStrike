import React from 'react';
import { PrimaryKpiBar } from '../components/dashboard/PrimaryKpiBar';
import { LiveCameraPanel } from '../components/monitor/LiveCameraPanel';
import { GridDistributionPanel } from '../components/density/GridDistributionPanel';
import { GemmaVisionPanel } from '../components/ai/GemmaVisionPanel';
import { ActiveAlertsCard } from '../components/dashboard/ActiveAlertsCard';
import { LiveEventFeed } from '../components/dashboard/LiveEventFeed';
import { AlertTimeline } from '../components/alerts/AlertTimeline';
import { ModelStatusCard } from '../components/dashboard/ModelStatusCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Primary Mandatory KPI Metrics (YOLO Detection Confidence & Crowd Threshold) */}
      <PrimaryKpiBar />

      {/* 2. Main Center Surveillance & Spatial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Live Optical Viewport & Spatial Matrix Grid */}
        <div className="lg:col-span-8 space-y-6">
          <LiveCameraPanel compact />
          <GridDistributionPanel />
        </div>

        {/* Right Column (4 cols): AI Vision, Active Alerts, Live Event Feed & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <GemmaVisionPanel />
          <ActiveAlertsCard />
          <LiveEventFeed />
          <AlertTimeline />
          <ModelStatusCard />
        </div>
      </div>
    </div>
  );
};
