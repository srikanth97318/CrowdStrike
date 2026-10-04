import React from 'react';
import { useMonitorStore } from '../../store/monitorStore';
import { VideoSourceSelector } from './VideoSourceSelector';
import { MonitoringVideo } from './MonitoringVideo';
import { SourceStatus } from './SourceStatus';
import { CameraSelector } from './CameraSelector';

interface LiveCameraPanelProps {
  compact?: boolean;
}

export const LiveCameraPanel: React.FC<LiveCameraPanelProps> = ({ compact: _compact = false }) => {
  const { sourceType } = useMonitorStore();

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden shadow-lg border border-command-border bg-command-card">
      {/* If a source is selected, render top Source Status & Camera Selector strip */}
      {sourceType !== null && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-command-surface border-b border-command-border">
          <div className="flex-1">
            <SourceStatus />
          </div>
          {sourceType === 'camera' && (
            <div className="px-3.5 py-1.5 border-t sm:border-t-0 sm:border-l border-command-border">
              <CameraSelector />
            </div>
          )}
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="w-full">
        {sourceType === null ? (
          <VideoSourceSelector />
        ) : (
          <MonitoringVideo />
        )}
      </div>
    </div>
  );
};
