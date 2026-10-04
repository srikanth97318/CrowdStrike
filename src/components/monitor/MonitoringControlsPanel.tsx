import React, { useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Camera,
  Upload,
  Cpu,
  Eye,
  Sliders,
  Flame,
  Layers,
  Grid,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';

export const MonitoringControlsPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isMonitoring,
    monitoringStatus,
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    activeCamera,
    cameras,
    setActiveCamera,
    settings,
    updateSettings,
    crowdThreshold,
    setCrowdThreshold,
    setHotThreshold,
    setDetectionConfidenceThreshold,
  } = useMonitorStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await apiService.uploadVideo(file);
      } catch {
        // Fallback in demo mode
      }
      setActiveCamera('cam-file');
    }
  };

  return (
    <Card className="flex flex-col space-y-5">
      <CardHeader
        title="Monitoring Controls"
        subtitle="Live camera orchestration & parameter tuning"
        icon={<Sliders size={18} />}
        action={
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isMonitoring ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {monitoringStatus}
          </span>
        }
      />

      {/* 1. Surveillance Execution Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-bold uppercase text-command-muted tracking-wider block">
          Surveillance Execution State
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Start / Stop */}
          <Button
            variant={isMonitoring ? 'danger' : 'primary'}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            icon={isMonitoring ? <Square size={13} /> : <Play size={13} />}
          >
            {isMonitoring ? 'STOP MONITORING' : 'START MONITORING'}
          </Button>

          {/* Pause / Resume */}
          <Button
            variant="secondary"
            size="sm"
            onClick={isMonitoring ? pauseMonitoring : resumeMonitoring}
            icon={isMonitoring ? <Pause size={13} /> : <RefreshCw size={13} />}
          >
            {isMonitoring ? 'PAUSE' : 'RESUME'}
          </Button>
        </div>
      </div>

      {/* 2. Camera Source Selector */}
      <div className="space-y-2 pt-2 border-t border-command-border/60">
        <label className="text-[11px] font-mono font-bold uppercase text-command-muted tracking-wider flex items-center justify-between">
          <span>Camera Feeds</span>
          <span className="text-[10px] text-cyan-400 font-normal">{activeCamera.name}</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setActiveCamera(cam.id)}
              className={`p-2 rounded-lg border text-left text-xs font-mono transition flex items-center gap-2 ${
                activeCamera.id === cam.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                  : 'bg-command-surface text-command-muted border-command-border hover:text-white'
              }`}
            >
              <Camera size={13} className={activeCamera.id === cam.id ? 'text-cyan-400' : 'text-command-dim'} />
              <span className="truncate">{cam.name.split('—')[0].trim()}</span>
            </button>
          ))}

          {/* Upload Video Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg border text-left text-xs font-mono bg-command-surface text-command-muted border-command-border hover:text-white transition flex items-center gap-2 col-span-2"
          >
            <Upload size={13} className="text-cyan-400" />
            <span>Upload Custom Video File (.mp4 / .avi)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />
        </div>
      </div>

      {/* 3. AI & Vision Architecture Selector */}
      <div className="space-y-2 pt-2 border-t border-command-border/60">
        <label className="text-[11px] font-mono font-bold uppercase text-command-muted tracking-wider block">
          AI & Vision Architecture
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings({ detector: 'yolo' })}
            className={`p-2 rounded-lg border text-center text-xs font-mono transition flex flex-col items-center justify-center gap-0.5 ${
              settings.detector === 'yolo'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-cyan-glow'
                : 'bg-command-surface text-command-muted border-command-border hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Cpu size={14} />
              <span>YOLOv8 Local</span>
            </div>
            <span className="text-[9px] text-command-dim font-normal">Real-Time Vision</span>
          </button>

          <button
            onClick={() => updateSettings({ detector: 'gemma' })}
            className={`p-2 rounded-lg border text-center text-xs font-mono transition flex flex-col items-center justify-center gap-0.5 ${
              settings.detector === 'gemma'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-cyan-glow'
                : 'bg-command-surface text-command-muted border-command-border hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Eye size={14} />
              <span>Gemma 4 Vision</span>
            </div>
            <span className="text-[9px] text-cyan-400/80 font-normal">Scene Intelligence</span>
          </button>
        </div>
      </div>

      {/* 4. Interactive Configuration Sliders (All affect central state immediately) */}
      <div className="space-y-3.5 pt-2 border-t border-command-border/60 text-xs font-mono">
        {/* Detection Confidence Slider */}
        <div>
          <div className="flex justify-between text-command-muted mb-1">
            <span className="flex items-center gap-1">
              <Cpu size={12} className="text-cyan-400" /> DETECTION CONFIDENCE:
            </span>
            <span className="text-white font-bold">{settings.confThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={settings.confThreshold}
            onChange={(e) => setDetectionConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* Crowd Threshold Slider */}
        <div>
          <div className="flex justify-between text-command-muted mb-1">
            <span className="flex items-center gap-1">
              <Sliders size={12} className="text-red-400" /> CROWD THRESHOLD:
            </span>
            <span className="text-red-400 font-bold">{crowdThreshold} people</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={crowdThreshold}
            onChange={(e) => setCrowdThreshold(parseInt(e.target.value))}
            className="w-full accent-red-500 h-1.5 bg-command-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* High-Density Threshold Slider */}
        <div>
          <div className="flex justify-between text-command-muted mb-1">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-amber-400" /> HIGH-DENSITY THRESHOLD:
            </span>
            <span className="text-amber-400 font-bold">{settings.hotThreshold} people/cell</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={settings.hotThreshold}
            onChange={(e) => setHotThreshold(parseInt(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* Grid Size Slider */}
        <div>
          <div className="flex justify-between text-command-muted mb-1">
            <span className="flex items-center gap-1">
              <Grid size={12} className="text-cyan-400" /> GRID SIZE:
            </span>
            <span className="text-white font-bold">{settings.gridSize} × {settings.gridSize}</span>
          </div>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={settings.gridSize}
            onChange={(e) => updateSettings({ gridSize: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* Heatmap Opacity Slider */}
        <div>
          <div className="flex justify-between text-command-muted mb-1">
            <span className="flex items-center gap-1">
              <Layers size={12} className="text-cyan-400" /> HEATMAP OPACITY:
            </span>
            <span className="text-white font-bold">{settings.heatmapAlpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="1.00"
            step="0.05"
            value={settings.heatmapAlpha}
            onChange={(e) => updateSettings({ heatmapAlpha: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
};
