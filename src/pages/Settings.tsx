import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Send,
  Volume2,
  Server,
  RotateCcw,
  Save,
  CheckCircle2,
  Shield,
  Radio,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useMonitorStore } from '../store/monitorStore';
import { apiService } from '../services/api';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    mode,
    setMode,
    setConnectionStatus,
  } = useMonitorStore();

  const [form, setForm] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      apiService.setBaseUrl(form.apiUrl);
      const res = await apiService.getStatus();
      setTestResult(`Success: Connected to ${res.version} (Detector: ${res.detector})`);
      setConnectionStatus('connected');
    } catch {
      setTestResult('Notice: Backend offline or unreachable at this address. Falling back gracefully to Demo Mode.');
      setConnectionStatus('demo');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-command-surface p-4 rounded-xl border border-command-border">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">System Parameters & Model Architecture</h2>
          <p className="text-xs text-command-muted font-mono mt-0.5">
            Configure YOLOv8 confidence, spatial grid, Gemma 4 advisory intervals, and Telegram webhook dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              resetSettings();
              setForm(settings);
            }}
            icon={<RotateCcw size={13} />}
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Save size={13} />}
          >
            Save Parameters
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={16} /> Parameters saved and applied to active surveillance loop.
        </div>
      )}

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Detection Settings */}
        <Card>
          <CardHeader
            title="Optical Detection Engine"
            subtitle="YOLOv8 Parameters (--conf, --grid, --hot, --max_people, --alpha)"
            icon={<Sliders size={18} />}
          />

          <div className="space-y-4 text-xs font-mono">
            {/* Primary Detector Mode */}
            <div>
              <label className="text-command-muted block mb-1.5 font-bold uppercase text-[11px]">
                Primary Person Detector (--detector)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, detector: 'yolo' })}
                  className={`p-2 rounded-lg border text-center transition ${
                    form.detector === 'yolo'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-command-surface text-command-muted border-command-border hover:text-white'
                  }`}
                >
                  YOLOv8 (Fast Local)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, detector: 'gemma' })}
                  className={`p-2 rounded-lg border text-center transition ${
                    form.detector === 'gemma'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-command-surface text-command-muted border-command-border hover:text-white'
                  }`}
                >
                  Gemma 4 (Cloud Vision)
                </button>
              </div>
            </div>

            {/* Confidence Threshold */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Confidence Threshold (--conf):</span>
                <span className="text-white font-bold">{(form.confThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={form.confThreshold}
                onChange={(e) => setForm({ ...form, confThreshold: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>

            {/* Grid Size */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Grid Dimension N (--grid):</span>
                <span className="text-white font-bold">{form.gridSize} × {form.gridSize} cells</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={form.gridSize}
                onChange={(e) => setForm({ ...form, gridSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>

            {/* Overcrowding Threshold */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Overcrowd Alert Threshold (--max_people):</span>
                <span className="text-red-400 font-bold">{form.maxPeople} people</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={form.maxPeople}
                onChange={(e) => setForm({ ...form, maxPeople: parseInt(e.target.value) })}
                className="w-full accent-red-500 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>

            {/* Hot Zone Threshold */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>High-Density Hot Cell Threshold (--hot):</span>
                <span className="text-amber-400 font-bold">{form.hotThreshold} people/cell</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={form.hotThreshold}
                onChange={(e) => setForm({ ...form, hotThreshold: parseInt(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>

            {/* Heatmap Alpha */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Heatmap Overlay Alpha (--alpha):</span>
                <span className="text-white font-bold">{form.heatmapAlpha}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={form.heatmapAlpha}
                onChange={(e) => setForm({ ...form, heatmapAlpha: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 2. AI Intelligence Settings (Gemma 4) */}
        <Card>
          <CardHeader
            title="AI Vision Safety Review"
            subtitle="Google Gen AI SDK & Tool Calling (--gemma, --gemma_model, --gemma_interval)"
            icon={<Sparkles size={18} />}
          />

          <div className="space-y-4 text-xs font-mono">
            {/* Gemma Enabled Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-command-surface border border-command-border">
              <div>
                <span className="font-bold text-white block">Enable Gemma 4 Advisory</span>
                <span className="text-[10px] text-command-muted">Sampled raw frames sent to Gemini API</span>
              </div>
              <input
                type="checkbox"
                checked={form.gemmaEnabled}
                onChange={(e) => setForm({ ...form, gemmaEnabled: e.target.checked })}
                className="h-5 w-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Gemma Model Selection */}
            <div>
              <label className="text-command-muted block mb-1">Gemma Model ID (--gemma_model):</label>
              <select
                value={form.gemmaModel}
                onChange={(e) => setForm({ ...form, gemmaModel: e.target.value })}
                className="w-full bg-command-surface border border-command-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (Recommended Default)</option>
                <option value="gemma-4-31b-it">gemma-4-31b-it (High Capacity)</option>
              </select>
            </div>

            {/* Analysis Interval */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Sampling Interval (--gemma_interval):</span>
                <span className="text-cyan-400 font-bold">{form.gemmaInterval} seconds</span>
              </div>
              <input
                type="range"
                min="2"
                max="60"
                step="2"
                value={form.gemmaInterval}
                onChange={(e) => setForm({ ...form, gemmaInterval: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-command-dim block mt-1">
                Background thread execution preserves high video frame rates.
              </span>
            </div>

            {/* Audio Alerts Setting */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-command-surface border border-command-border">
              <div className="flex items-center gap-2.5">
                <Volume2 size={16} className="text-cyan-400" />
                <div>
                  <span className="font-bold text-white block">Acoustic Incident Chime</span>
                  <span className="text-[10px] text-command-muted">Synthesizer beeps upon critical alerts</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.audioAlertsEnabled}
                onChange={(e) => setForm({ ...form, audioAlertsEnabled: e.target.checked })}
                className="h-5 w-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded bg-command-surface border border-command-border text-[11px] text-command-dim flex items-center gap-2">
              <Shield size={14} className="text-cyan-400 shrink-0" />
              <span>Gemma actions are strictly allowlisted to human notifications.</span>
            </div>
          </div>
        </Card>

        {/* 3. Notifications & Telegram Card */}
        <Card>
          <CardHeader
            title="Notification Dispatch"
            subtitle="Telegram Bot API Integration"
            icon={<Send size={18} />}
          />

          <div className="space-y-4 text-xs font-mono">
            {/* Telegram Enabled */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-command-surface border border-command-border">
              <div>
                <span className="font-bold text-white block">Telegram Dispatch Active</span>
                <span className="text-[10px] text-command-muted">Uses backend .env credentials</span>
              </div>
              <input
                type="checkbox"
                checked={form.telegramEnabled}
                onChange={(e) => setForm({ ...form, telegramEnabled: e.target.checked })}
                className="h-5 w-5 accent-emerald-400 rounded cursor-pointer"
              />
            </div>

            {/* Alert Flags */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-surface border border-command-border">
                <span className="text-gray-300">Overcrowd Alerts</span>
                <input
                  type="checkbox"
                  checked={form.telegramCrowdAlerts}
                  onChange={(e) => setForm({ ...form, telegramCrowdAlerts: e.target.checked })}
                  className="accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-surface border border-command-border">
                <span className="text-gray-300">Density Zone Alerts</span>
                <input
                  type="checkbox"
                  checked={form.telegramDensityAlerts}
                  onChange={(e) => setForm({ ...form, telegramDensityAlerts: e.target.checked })}
                  className="accent-cyan-400"
                />
              </div>
            </div>

            {/* Cooldown */}
            <div>
              <div className="flex justify-between text-command-muted mb-1">
                <span>Alert Cooldown Window:</span>
                <span className="text-white font-bold">{form.telegramCooldown} sec</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={form.telegramCooldown}
                onChange={(e) => setForm({ ...form, telegramCooldown: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-command-surface rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-command-border text-[11px] text-command-muted">
              <span className="text-white font-bold block mb-1">🔒 Security Compliance Note</span>
              BOT_TOKEN, CHAT_ID, and GEMINI_API_KEY remain isolated within backend server environment files (.env).
            </div>
          </div>
        </Card>

        {/* 4. Backend Architecture & Network */}
        <Card>
          <CardHeader
            title="Backend Architecture & API"
            subtitle="FastAPI REST & WebSocket Endpoints"
            icon={<Server size={18} />}
          />

          <div className="space-y-4 text-xs font-mono">
            {/* Mode Selector */}
            <div className="p-3 rounded-lg bg-command-surface border border-command-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Active Data Mode</span>
                <Badge variant={mode === 'demo' ? 'warning' : 'safe'} dot>
                  {mode === 'demo' ? 'DEMO SIMULATION' : 'LIVE BACKEND'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('demo')}
                  className={`p-2 rounded border text-center transition ${
                    mode === 'demo'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                      : 'bg-command-card text-command-muted border-command-border'
                  }`}
                >
                  Demo Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`p-2 rounded border text-center transition ${
                    mode === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-command-card text-command-muted border-command-border'
                  }`}
                >
                  Live Backend (API)
                </button>
              </div>
            </div>

            {/* REST Base URL */}
            <div>
              <label className="text-command-muted block mb-1">FastAPI REST Server URL:</label>
              <input
                type="text"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                className="w-full bg-command-surface border border-command-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* WebSocket URL */}
            <div>
              <label className="text-command-muted block mb-1">WebSocket Telemetry URL:</label>
              <input
                type="text"
                value={form.wsUrl}
                onChange={(e) => setForm({ ...form, wsUrl: e.target.value })}
                className="w-full bg-command-surface border border-command-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleTestConnection}
                loading={testingConnection}
                icon={<Radio size={14} />}
                className="w-full"
              >
                Test Backend Connection
              </Button>
            </div>

            {testResult && (
              <div className="p-2.5 rounded bg-command-surface border border-command-border text-[11px] font-mono text-cyan-300">
                {testResult}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
