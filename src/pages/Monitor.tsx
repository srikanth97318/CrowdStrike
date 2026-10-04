import React from 'react';
import { PrimaryKpiBar } from '../components/dashboard/PrimaryKpiBar';
import { LiveCameraPanel } from '../components/monitor/LiveCameraPanel';
import { MonitoringControlsPanel } from '../components/monitor/MonitoringControlsPanel';
import { GridDistributionPanel } from '../components/density/GridDistributionPanel';
import { LiveInspectorPanel } from '../components/monitor/LiveInspectorPanel';

export const Monitor: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Primary KPI Bar */}
      <PrimaryKpiBar />

      {/* Primary Video Feed + Right Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Large Optical Surveillance Canvas & Spatial Matrix Grid */}
        <div className="lg:col-span-8 space-y-6">
          <LiveCameraPanel compact={false} />
          <GridDistributionPanel />
        </div>

        {/* Right (4 cols): Dedicated Monitoring Controls & Live Inspector */}
        <div className="lg:col-span-4 space-y-6">
          <MonitoringControlsPanel />
          <LiveInspectorPanel />
        </div>
      </div>
    </div>
  );
};
