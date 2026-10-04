import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const LiveInspectorPanel: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    peopleCount,
    crowdThreshold,
    hotZones,
    confidence,
    aiAnalysis,
    alerts,
    isMonitoring,
    toggleMonitoring,
    settings,
    updateSettings,
    overcrowdAlert,
    densityAlert,
  } = useMonitorStore();

  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 1. CURRENT STATUS CARD */}
      <Card>
        <CardHeader
          title="Current Telemetry"
          subtitle="Real-time optical stream metrics"
          icon={<Cpu size={18} />}
          action={
            <Badge
              variant={overcrowdAlert ? 'critical' : densityAlert ? 'warning' : 'safe'}
              dot
              pulse
              size="sm"
            >
              {overcrowdAlert ? 'OVER CAPACITY' : densityAlert ? 'HOT SPOTS' : 'NOMINAL'}
            </Badge>
          }
        />

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">People</span>
            <span className={`text-xl font-bold ${overcrowdAlert ? 'text-red-400' : 'text-white'}`}>
              {peopleCount} <span className="text-xs text-command-dim">/ {crowdThreshold}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">Density</span>
            <span className={`text-base font-bold uppercase ${
              overcrowdAlert ? 'text-red-400' : densityAlert ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {overcrowdAlert ? 'CRITICAL' : densityAlert ? 'HIGH' : 'NORMAL'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">Hot Zones</span>
            <span className={`text-base font-bold ${hotZones.length > 0 ? 'text-amber-400' : 'text-white'}`}>
              {hotZones.length} cells
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border">
            <span className="text-[10px] text-command-muted uppercase block">AI Confidence</span>
            <span className="text-base font-bold text-cyan-400">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Start / Stop Monitoring Toggle */}
        <div className="mt-3 pt-3 border-t border-command-border/60">
          <Button
            variant={isMonitoring ? 'danger' : 'primary'}
            size="md"
            onClick={toggleMonitoring}
            icon={isMonitoring ? <Pause size={15} /> : <Play size={15} />}
            className="w-full"
          >
            {isMonitoring ? 'STOP SURVEILLANCE' : 'START SURVEILLANCE'}
          </Button>
        </div>
      </Card>

      {/* 2. AI VISION REVIEW */}
      <Card>
        <CardHeader
          title="AI Vision Review"
          subtitle="Gemma 4 Advisory Analysis"
          icon={<Eye size={18} />}
          action={
            <Badge variant="cyan" size="sm" dot>
              {aiAnalysis.status.toUpperCase()}
            </Badge>
          }
        />

        <div className="space-y-2.5 text-xs">
          <p className="text-gray-200 leading-relaxed font-sans bg-command-surface p-2.5 rounded-md border border-command-border/60">
            "{aiAnalysis.observation}"
          </p>

          <div className="p-2.5 rounded-md bg-cyan-950/20 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <span className="font-bold uppercase text-[10px] block text-cyan-400 mb-0.5">
              HUMAN REVIEW CHECK:
            </span>
            "{aiAnalysis.recommendedCheck}"
          </div>
        </div>
      </Card>

      {/* 3. RECENT ALERTS */}
      <Card>
        <CardHeader
          title="Recent Alerts"
          subtitle="Live event queue"
          icon={<AlertTriangle size={18} />}
        />

        <div className="space-y-2">
          {recentAlerts.length === 0 ? (
            <p className="text-xs font-mono text-command-muted py-2 text-center">No recent alerts</p>
          ) : (
            recentAlerts.map((alt) => (
              <div
                key={alt.id}
                className="p-2 rounded-md bg-command-surface border border-command-border text-xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${alt.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <span className="font-mono font-bold text-white text-[11px] truncate">
                      {alt.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-command-dim block truncate mt-0.5">
                    {alt.timestamp} • {alt.location}
                  </span>
                </div>
                <Badge
                  variant={alt.severity === 'critical' ? 'critical' : 'warning'}
                  size="sm"
                >
                  {alt.peopleCount} pax
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 4. REAL-TIME THRESHOLD CONTROLS */}
      <Card>
        <CardHeader
          title="Runtime Thresholds"
          subtitle="Direct parameter tuning"
          icon={<Sliders size={18} />}
        />

        <div className="space-y-3.5 text-xs font-mono">
          {/* Crowd Threshold Slider */}
          <div>
            <div className="flex justify-between text-command-muted mb-1">
              <span>Overcrowd Limit:</span>
              <span className="text-white font-bold">{settings.maxPeople} people</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={settings.maxPeople}
              onChange={(e) => updateSettings({ maxPeople: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
            />
          </div>

          {/* Hot-Zone Threshold Slider */}
          <div>
            <div className="flex justify-between text-command-muted mb-1">
              <span>Hot-Cell Density:</span>
              <span className="text-amber-400 font-bold">{settings.hotThreshold} people/cell</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.hotThreshold}
              onChange={(e) => updateSettings({ hotThreshold: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
            />
          </div>

          {/* Grid Size Slider */}
          <div>
            <div className="flex justify-between text-command-muted mb-1">
              <span>Spatial Grid Size:</span>
              <span className="text-white font-bold">{settings.gridSize}×{settings.gridSize}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={settings.gridSize}
              onChange={(e) => updateSettings({ gridSize: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full pt-2 flex items-center justify-between text-[11px] text-command-muted hover:text-white border-t border-command-border/60"
          >
            <span>Advanced Configuration</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-command-border/40 text-xs">
              {/* Detection Confidence */}
              <div>
                <div className="flex justify-between text-command-muted mb-1">
                  <span>Detection Confidence:</span>
                  <span className="text-white font-bold">{(settings.confThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={settings.confThreshold}
                  onChange={(e) => updateSettings({ confThreshold: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
                />
              </div>

              {/* Heatmap Alpha */}
              <div>
                <div className="flex justify-between text-command-muted mb-1">
                  <span>Heatmap Opacity (Alpha):</span>
                  <span className="text-white font-bold">{settings.heatmapAlpha}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={settings.heatmapAlpha}
                  onChange={(e) => updateSettings({ heatmapAlpha: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
                />
              </div>

              {/* Detector Mode */}
              <div>
                <span className="text-command-muted block mb-1">Primary Detector:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ detector: 'yolo' })}
                    className={`py-1.5 rounded border text-xs font-mono transition ${
                      settings.detector === 'yolo'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-command-surface text-command-muted border-command-border'
                    }`}
                  >
                    YOLOv8
                  </button>
                  <button
                    onClick={() => updateSettings({ detector: 'gemma' })}
                    className={`py-1.5 rounded border text-xs font-mono transition ${
                      settings.detector === 'gemma'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-command-surface text-command-muted border-command-border'
                    }`}
                  >
                    Gemma 4
                  </button>
                </div>
              </div>

              <div className="p-2 rounded bg-command-surface border border-command-border text-[10px] text-command-muted flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                Parameters synchronize with detect_final.py CLI arguments.
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
