import React from 'react';
import { Camera, ChevronDown } from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';

export const CameraSelector: React.FC = () => {
  const {
    sourceType,
    availableCameras,
    selectedCameraId,
    selectCameraSource,
  } = useMonitorStore();

  if (sourceType !== 'camera') return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <span className="text-command-dim flex items-center gap-1">
        <Camera size={13} className="text-cyan-400" />
        <span className="hidden sm:inline">DEVICE:</span>
      </span>

      {availableCameras.length > 1 ? (
        <div className="relative">
          <select
            value={selectedCameraId || (availableCameras[0]?.deviceId ?? '')}
            onChange={(e) => selectCameraSource(e.target.value)}
            className="appearance-none bg-command-surface border border-command-border hover:border-cyan-500/50 rounded px-2.5 py-1 pr-6 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {availableCameras.map((device, idx) => (
              <option key={device.deviceId || idx} value={device.deviceId} className="bg-command-card text-white">
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-command-muted pointer-events-none"
          />
        </div>
      ) : (
        <span className="text-gray-300 font-semibold px-2 py-0.5 rounded bg-command-surface border border-command-border">
          {availableCameras[0]?.label || 'Default Integrated Camera'}
        </span>
      )}
    </div>
  );
};
