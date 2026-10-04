import {
  MonitoringAlert,
  GemmaAssessment,
  BoundingBox,
  HotCell,
  TimeSeriesPoint,
  ZoneDensityPoint,
  AlertStatPoint,
  SystemEvent,
  AlertFrequencyPoint,
  DensityLevel,
} from '../types/monitoring';

export const INITIAL_ALERTS: MonitoringAlert[] = [
  {
    id: 'alt-101',
    timestamp: '10:42:18',
    type: 'OVERCROWD',
    severity: 'critical',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 24,
    threshold: 20,
    location: 'North Concourse Turnstiles',
    description: '24 people detected exceeding safety threshold (20 people). Bottleneck forming at turnstiles.',
    status: 'active',
    suggestedAction: 'Human operator review recommended: verify Gate 1 turnstile flow.',
  },
  {
    id: 'alt-102',
    timestamp: '10:39:07',
    type: 'HIGH_DENSITY',
    severity: 'warning',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 5,
    threshold: 2,
    location: 'Zone A (Row 2 / Column 3)',
    description: 'Local concentration reached 5 people in cell [2, 3] exceeding hot threshold (2).',
    status: 'active',
    suggestedAction: 'Inspect Row 2 / Col 3 corridor for localized stoppage.',
  },
  {
    id: 'alt-103',
    timestamp: '10:35:22',
    type: 'AI_SAFETY_REVIEW',
    severity: 'warning',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 19,
    threshold: 20,
    location: 'East Corridor Escalator Base',
    description: 'Gemma 4 vision detected cluster approaching escalator entry. Moderate congestion likelihood.',
    status: 'acknowledged',
    suggestedAction: 'Operator check recommended: ensure escalator descent remains clear.',
  },
  {
    id: 'alt-104',
    timestamp: '10:31:09',
    type: 'OVERCROWD',
    severity: 'critical',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 22,
    threshold: 20,
    location: 'Main Entry Vestibule',
    description: 'Temporary surge from arriving charter transit. Cleared within 90 seconds.',
    status: 'resolved',
    resolvedAt: '10:32:45',
    suggestedAction: 'Human operator acknowledged and cleared.',
  },
  {
    id: 'alt-105',
    timestamp: '10:24:14',
    type: 'HIGH_DENSITY',
    severity: 'warning',
    camera: 'Camera 02 — East Atrium',
    peopleCount: 4,
    threshold: 2,
    location: 'Zone B (Row 3 / Column 4)',
    description: 'Cluster of 4 people formed near atrium information kiosk.',
    status: 'resolved',
    resolvedAt: '10:28:00',
    suggestedAction: 'Kiosk queue cleared.',
  },
  {
    id: 'alt-106',
    timestamp: '10:18:50',
    type: 'SYSTEM_WARNING',
    severity: 'info',
    camera: 'Camera 02 — East Atrium',
    peopleCount: 14,
    threshold: 20,
    location: 'Camera 02 Hardware Stream',
    description: 'Brief frame drop detected during optical auto-exposure recalibration. Recovered automatically.',
    status: 'resolved',
    resolvedAt: '10:19:10',
    suggestedAction: 'Telemetry nominal.',
  },
  {
    id: 'alt-107',
    timestamp: '10:11:03',
    type: 'OVERCROWD',
    severity: 'critical',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 25,
    threshold: 20,
    location: 'North Concourse Gate 1',
    description: 'Severe ingress surge detected upon morning express train arrival.',
    status: 'resolved',
    resolvedAt: '10:15:30',
    suggestedAction: 'Additional turnstiles activated.',
  },
  {
    id: 'alt-108',
    timestamp: '10:04:19',
    type: 'HIGH_DENSITY',
    severity: 'warning',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 4,
    threshold: 2,
    location: 'Zone C (Row 1 / Column 2)',
    description: 'Localized grouping near ticket validation readers.',
    status: 'resolved',
    resolvedAt: '10:07:22',
  },
  {
    id: 'alt-109',
    timestamp: '09:55:40',
    type: 'AI_SAFETY_REVIEW',
    severity: 'warning',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 18,
    threshold: 20,
    location: 'West Baggage Corridor',
    description: 'AI advisory: crowd formation near secondary exit fire door.',
    status: 'resolved',
    resolvedAt: '09:59:12',
  },
  {
    id: 'alt-110',
    timestamp: '09:42:15',
    type: 'OVERCROWD',
    severity: 'critical',
    camera: 'Camera 01 — Main Entrance',
    peopleCount: 23,
    threshold: 20,
    location: 'North Concourse Gate 1',
    description: 'Exceeded maximum threshold during transit changeover.',
    status: 'resolved',
    resolvedAt: '09:47:00',
  },
  // Additional historical alerts bringing total to 27 (4 critical, 12 warning, 11 resolved)
  ...Array.from({ length: 17 }).map((_, i) => ({
    id: `alt-hist-${i + 1}`,
    timestamp: `0${8 - Math.floor(i / 6)}:${(50 - (i * 3) % 50).toString().padStart(2, '0')}:12`,
    type: (i % 3 === 0 ? 'HIGH_DENSITY' : i % 3 === 1 ? 'AI_SAFETY_REVIEW' : 'SYSTEM_WARNING') as any,
    severity: (i % 3 === 0 ? 'warning' : i % 3 === 1 ? 'warning' : 'info') as any,
    camera: i % 2 === 0 ? 'Camera 01 — Main Entrance' : 'Camera 02 — East Atrium',
    peopleCount: 12 + (i % 7),
    threshold: 20,
    location: `Corridor Sector ${String.fromCharCode(65 + (i % 4))}`,
    description: `Historical surveillance record: telemetry checkpoint ${i + 1} logged and verified.`,
    status: 'resolved' as const,
    resolvedAt: 'Automatic record archive',
  })),
];

export const INITIAL_EVENTS: SystemEvent[] = [
  {
    id: 'evt-1',
    timestamp: '10:42:18',
    type: 'OVERCROWD',
    title: 'OVERCROWD ALERT',
    detail: '24 people detected exceeding safety threshold (20 people)',
    severity: 'critical',
  },
  {
    id: 'evt-2',
    timestamp: '10:42:04',
    type: 'HIGH_DENSITY',
    title: 'HIGH DENSITY ZONE',
    detail: 'Zone B (Row 3 / Column 4) exceeded hot threshold (4 people)',
    severity: 'warning',
  },
  {
    id: 'evt-3',
    timestamp: '10:41:52',
    type: 'AI_REVIEW',
    title: 'AI VISION ANALYSIS',
    detail: 'Gemma identified elevated crowd concentration near Gate 1 turnstiles',
    severity: 'warning',
  },
  {
    id: 'evt-4',
    timestamp: '10:41:20',
    type: 'SYSTEM',
    title: 'SURVEILLANCE ACTIVE',
    detail: 'Optical stream running at 28 FPS with YOLOv8 person detector',
    severity: 'info',
  },
  {
    id: 'evt-5',
    timestamp: '10:39:10',
    type: 'RESOLVED',
    title: 'ALERT RESOLVED',
    detail: 'Previous Zone A density alert cleared by operator',
    severity: 'safe',
  },
];

export const INITIAL_GEMMA_ASSESSMENT: GemmaAssessment = {
  status: 'active',
  severity: 'moderate',
  confidence: 0.92,
  observation: 'High crowd concentration detected near the east entrance turnstiles. Ingress flow constricted.',
  recommendedCheck: 'Inspect the east entrance for potential congestion. Human review recommended.',
  lastUpdated: '8s ago',
};

// Generates an N×N grid populated based on peopleCount and cluster hotspots
export function generateGridCounts(n: number, peopleCount: number, hotThreshold: number): { grid: number[][]; hotCells: HotCell[] } {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let remaining = peopleCount;

  // Primary cluster center around [1, 2] (Row 2, Col 3)
  const centerR = Math.min(1, n - 1);
  const centerC = Math.min(2, n - 1);

  // Allocate cluster
  const clusterAlloc = Math.min(remaining, Math.max(hotThreshold + 2, Math.floor(peopleCount * 0.42)));
  grid[centerR][centerC] = clusterAlloc;
  remaining -= clusterAlloc;

  // Secondary cluster at [2, 3] or [0, 1]
  if (remaining > 0 && n > 2) {
    const secR = Math.min(2, n - 1);
    const secC = Math.min(3, n - 1);
    const secAlloc = Math.min(remaining, Math.max(hotThreshold + 1, Math.floor(remaining * 0.45)));
    grid[secR][secC] = secAlloc;
    remaining -= secAlloc;
  }

  // Tertiary cluster
  if (remaining > 0 && n > 1) {
    const tertAlloc = Math.min(remaining, Math.max(hotThreshold, Math.floor(remaining * 0.4)));
    grid[0][1] = tertAlloc;
    remaining -= tertAlloc;
  }

  // Distribute rest realistically
  let attempts = 0;
  while (remaining > 0 && attempts < 100) {
    attempts++;
    const r = Math.floor(Math.random() * n);
    const c = Math.floor(Math.random() * n);
    grid[r][c]++;
    remaining--;
  }

  // Find hot cells and name them (Zone A, Zone B, Zone C, etc.)
  const rawHot: { r: number; c: number; count: number }[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] >= hotThreshold) {
        rawHot.push({ r, c, count: grid[r][c] });
      }
    }
  }

  // Sort descending by count
  rawHot.sort((a, b) => b.count - a.count);

  const hotCells: HotCell[] = rawHot.map((item, idx) => {
    let densityLevel: DensityLevel = 'low';
    if (item.count >= hotThreshold + 3) densityLevel = 'critical';
    else if (item.count >= hotThreshold + 1) densityLevel = 'high';
    else if (item.count >= hotThreshold) densityLevel = 'medium';

    return {
      zoneName: `ZONE ${String.fromCharCode(65 + idx)}`,
      row: item.r,
      col: item.c,
      count: item.count,
      densityLevel,
    };
  });

  return { grid, hotCells };
}

// Generates bounding boxes mapped in normalized coordinates (0-1000)
export function generateMockBoxes(_peopleCount: number, n: number, grid: number[][]): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  const cellW = 1000 / n;
  const cellH = 1000 / n;

  let idCounter = 1;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const count = grid[r][c];
      for (let i = 0; i < count; i++) {
        const boxW = 55 + Math.floor(Math.random() * 25);
        const boxH = 110 + Math.floor(Math.random() * 45);

        const offsetX = (c * cellW) + Math.random() * Math.max(10, cellW - boxW);
        const offsetY = (r * cellH) + Math.random() * Math.max(10, cellH - boxH);

        const conf = 0.86 + Math.random() * 0.12;
        boxes.push({
          id: `box-${idCounter++}`,
          x1: Math.floor(offsetX),
          y1: Math.floor(offsetY),
          x2: Math.floor(offsetX + boxW),
          y2: Math.floor(offsetY + boxH),
          confidence: Number(conf.toFixed(2)),
          label: `Person ${(conf * 100).toFixed(0)}%`,
          color: '#00E5FF',
        });
      }
    }
  }

  return boxes;
}

// Generate realistic time-series for analytics
export function generateTimeSeriesData(points = 24, maxPeople = 20): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const now = Date.now();
  const step = (60 * 60 * 1000) / points;

  const baseCounts = [14, 15, 16, 17, 18, 19, 21, 24, 25, 23, 20, 18, 17, 16, 18, 20, 22, 23, 21, 19, 18, 18, 19, 18];

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - 1 - i) * step);
    const count = baseCounts[i % baseCounts.length];
    const capacityRate = Math.round((count / maxPeople) * 100);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count,
      density: Math.min(100, Math.round(capacityRate * 0.92)),
      threshold: maxPeople,
      capacityRate,
      hotCellsCount: count >= maxPeople ? 3 : count > 15 ? 2 : 1,
    });
  }
  return data;
}

// Alert Frequency Bar Chart Data (Hourly)
export const MOCK_ALERT_FREQUENCY: AlertFrequencyPoint[] = [
  { hour: '06:00', critical: 0, warning: 1, info: 1 },
  { hour: '07:00', critical: 1, warning: 2, info: 0 },
  { hour: '08:00', critical: 2, warning: 3, info: 1 },
  { hour: '09:00', critical: 1, warning: 4, info: 0 },
  { hour: '10:00', critical: 3, warning: 2, info: 0 },
  { hour: '11:00', critical: 0, warning: 2, info: 1 },
];

export const MOCK_ZONE_DATA: ZoneDensityPoint[] = [
  { zone: 'North Gate 1', count: 9, maxCapacity: 10, status: 'high' },
  { zone: 'East Turnstiles', count: 7, maxCapacity: 8, status: 'high' },
  { zone: 'Central Concourse', count: 4, maxCapacity: 12, status: 'normal' },
  { zone: 'Escalator B-1', count: 5, maxCapacity: 6, status: 'moderate' },
  { zone: 'South Baggage Area', count: 2, maxCapacity: 10, status: 'normal' },
  { zone: 'West Exit Hall', count: 1, maxCapacity: 8, status: 'normal' },
];

export const MOCK_ALERT_DISTRIBUTION: AlertStatPoint[] = [
  { name: 'Overcrowding Alert', value: 8, color: '#EF4444' },
  { name: 'High Density Zone', value: 14, color: '#F59E0B' },
  { name: 'AI Safety Advisory', value: 6, color: '#38BDF8' },
  { name: 'System Hardware/FPS', value: 2, color: '#64748B' },
];

export const GEMMA_OBSERVATIONS = [
  {
    severity: 'moderate' as const,
    confidence: 0.92,
    observation: 'High crowd concentration detected near the east entrance turnstiles. Ingress flow constricted.',
    recommendedCheck: 'Inspect the east entrance for potential congestion. Human review recommended.',
  },
  {
    severity: 'high' as const,
    confidence: 0.95,
    observation: 'Persistent dense cluster observed around Gate 1 ingress. Ingress pace slowed noticeably.',
    recommendedCheck: 'Human review recommended: verify ingress turnstile operations.',
  },
  {
    severity: 'low' as const,
    confidence: 0.89,
    observation: 'Pedestrian flow proceeding normally across all camera grid quadrants. Uniform spacing.',
    recommendedCheck: 'Routine monitoring active. No intervention indicated.',
  },
  {
    severity: 'moderate' as const,
    confidence: 0.91,
    observation: 'Sub-group grouping at central information kiosk. Marginal density elevation in quadrant 2.',
    recommendedCheck: 'Monitor central concourse kiosk perimeter.',
  },
];
