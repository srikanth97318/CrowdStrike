import { useEffect, useRef } from 'react';
import { useMonitorStore } from '../store/monitorStore';
import { realtimeClient } from '../services/websocket';
import { apiService } from '../services/api';
import {
  generateGridCounts,
  generateMockBoxes,
  GEMMA_OBSERVATIONS,
} from '../services/mockData';

export function useMonitoring() {
  const {
    mode,
    isMonitoring,
    settings,
    peopleCount,
    crowdThreshold,
    hotThreshold,
    gridSize,
    updateTelemetry,
    setConnectionStatus,
    addAlert,
    addEvent,
    resolveAlert,
    alerts,
    setMode,
  } = useMonitorStore();

  const lastAlertTimeRef = useRef<{ overcrowd: number; hot: number; gemma: number }>({
    overcrowd: 0,
    hot: 0,
    gemma: 0,
  });

  const activeOvercrowdAlertIdRef = useRef<string | null>('alt-101');
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gemmaCounterRef = useRef<number>(0);
  const peopleTrendRef = useRef<number>(1); // 1 = increasing, -1 = decreasing

  // Switch between LIVE and DEMO mode
  useEffect(() => {
    if (mode === 'live') {
      realtimeClient.setUrl(settings.wsUrl);
      apiService.setBaseUrl(settings.apiUrl);

      const unregisterTelemetry = realtimeClient.onTelemetry((frame: any) => {
        updateTelemetry(frame);
      });

      const unregisterStatus = realtimeClient.onStatusChange((status: any) => {
        setConnectionStatus(status);
      });

      realtimeClient.connect();

      apiService.getStatus().catch(() => {
        setConnectionStatus('error');
      });

      return () => {
        unregisterTelemetry();
        unregisterStatus();
        realtimeClient.disconnect();
      };
    } else {
      setConnectionStatus('demo');
    }
  }, [mode, settings.wsUrl, settings.apiUrl, updateTelemetry, setConnectionStatus]);

  // Demo Mode Simulation Loop
  useEffect(() => {
    if (mode !== 'demo' || !isMonitoring) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      return;
    }

    demoIntervalRef.current = setInterval(() => {
      let nextCount = peopleCount;
      const prevCount = peopleCount;
      const r = Math.random();

      // Cycle between 14 and 25 (overcrowd surge and recovery)
      if (peopleTrendRef.current > 0) {
        if (nextCount >= crowdThreshold + 4) {
          peopleTrendRef.current = -1;
          nextCount -= 1;
        } else {
          nextCount += r > 0.35 ? 1 : r < 0.15 ? -1 : 0;
        }
      } else {
        if (nextCount <= Math.max(12, crowdThreshold - 7)) {
          peopleTrendRef.current = 1;
          nextCount += 1;
        } else {
          nextCount -= r > 0.35 ? 1 : r < 0.15 ? -1 : 0;
        }
      }

      nextCount = Math.max(8, nextCount);
      const peopleChange = nextCount - prevCount;

      // Regenerate Grid & Hot cells
      const { grid, hotCells } = generateGridCounts(gridSize, nextCount, hotThreshold);
      const boxes = generateMockBoxes(nextCount, gridSize, grid);
      const now = Date.now();

      // Dynamic Detection Confidence fluctuation (YOLOv8)
      const detectionConf = Number((0.925 + Math.random() * 0.045).toFixed(3));

      // Overcrowding trigger / resolution cycle
      if (nextCount >= crowdThreshold) {
        if (now - lastAlertTimeRef.current.overcrowd > settings.telegramCooldown * 1000) {
          lastAlertTimeRef.current.overcrowd = now;
          const newAlertId = `alt-${Date.now()}`;
          activeOvercrowdAlertIdRef.current = newAlertId;

          addAlert({
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'OVERCROWD',
            severity: 'critical',
            camera: 'Camera 01 — Main Entrance',
            peopleCount: nextCount,
            threshold: crowdThreshold,
            location: 'North Concourse Gate 1',
            description: `Critical overcrowding detected: ${nextCount} people present (Threshold: ${crowdThreshold}). Turnstile ingress constricted.`,
            status: 'active',
            suggestedAction: 'Human operator check recommended: verify Gate 1 turnstile flow.',
          });
        }
      } else {
        // If count has subsided below threshold, auto-resolve previous overcrowding alert
        if (activeOvercrowdAlertIdRef.current) {
          const activeOverAlert = alerts.find(
            (a) => a.type === 'OVERCROWD' && a.status === 'active'
          );
          if (activeOverAlert) {
            resolveAlert(activeOverAlert.id);
            activeOvercrowdAlertIdRef.current = null;
          }
        }
      }

      // High-density alert trigger (cooldown 20s)
      if (hotCells.length > 0 && now - lastAlertTimeRef.current.hot > settings.telegramCooldown * 1000) {
        lastAlertTimeRef.current.hot = now;
        const worstCell = [...hotCells].sort((a, b) => b.count - a.count)[0];
        addAlert({
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'HIGH_DENSITY',
          severity: 'warning',
          camera: 'Camera 01 — Main Entrance',
          peopleCount: worstCell.count,
          threshold: hotThreshold,
          location: `${worstCell.zoneName} (Row ${worstCell.row + 1} / Column ${worstCell.col + 1})`,
          description: `${worstCell.zoneName} reached ${worstCell.count} occupants exceeding hot threshold (${hotThreshold}). Density level: ${worstCell.densityLevel.toUpperCase()}.`,
          status: 'active',
          suggestedAction: 'Inspect quadrant for localized stoppage.',
        });
      }

      // Periodic Gemma vision evaluation update (every 10s)
      let gemmaData = undefined;
      if (now - lastAlertTimeRef.current.gemma > settings.gemmaInterval * 1000) {
        lastAlertTimeRef.current.gemma = now;
        gemmaCounterRef.current = (gemmaCounterRef.current + 1) % GEMMA_OBSERVATIONS.length;
        const obs = GEMMA_OBSERVATIONS[gemmaCounterRef.current];
        gemmaData = {
          status: 'active' as const,
          severity: obs.severity,
          confidence: obs.confidence,
          observation: obs.observation,
          recommended_check: obs.recommendedCheck,
        };

        if (obs.severity === 'high') {
          addAlert({
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'AI_SAFETY_REVIEW',
            severity: 'warning',
            camera: 'Camera 01 — Main Entrance',
            peopleCount: nextCount,
            threshold: crowdThreshold,
            location: 'East Turnstile Perimeter',
            description: obs.observation,
            status: 'active',
            suggestedAction: obs.recommendedCheck,
          });
        }
      }

      // Dispatch Telemetry Frame to Central Store
      updateTelemetry({
        timestamp: new Date().toISOString(),
        people_count: nextCount,
        previous_count: prevCount,
        people_change: peopleChange,
        threshold: crowdThreshold,
        overcrowd: nextCount >= crowdThreshold,
        hot_cells: hotCells,
        grid,
        confidence: detectionConf,
        detector: settings.detector,
        fps: Math.floor(27 + Math.random() * 4),
        boxes,
        gemma: gemmaData,
        telegram: {
          enabled: settings.telegramEnabled,
          crowd_alerts: settings.telegramCrowdAlerts,
          density_alerts: settings.telegramDensityAlerts,
          cooldown: settings.telegramCooldown,
        },
      });
    }, 1800);

    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [
    mode,
    isMonitoring,
    peopleCount,
    crowdThreshold,
    hotThreshold,
    gridSize,
    settings,
    alerts,
    updateTelemetry,
    addAlert,
    addEvent,
    resolveAlert,
  ]);

  return {
    mode,
    setMode,
  };
}
