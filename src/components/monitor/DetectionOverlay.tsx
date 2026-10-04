import React, { useRef, useEffect } from 'react';
import { useMonitorStore } from '../../store/monitorStore';

interface DetectionOverlayProps {
  videoElement?: HTMLVideoElement | null;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ videoElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    realtimeDetections,
    frameDimensions,
    showBoxes,
    showGrid,
    gridSize,
    isMonitoring,
    overcrowdAlert,
  } = useMonitorStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    if (!isMonitoring || cw === 0 || ch === 0) {
      return;
    }

    // Determine optical letterbox / pillarbox offset relative to <video>
    let renderedW = cw;
    let renderedH = ch;
    let offsetX = 0;
    let offsetY = 0;

    if (videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      const vw = videoElement.videoWidth;
      const vh = videoElement.videoHeight;
      const videoRatio = vw / vh;
      const containerRatio = cw / ch;

      if (containerRatio > videoRatio) {
        // Pillarbox: video is narrower than container (black bars on left/right)
        renderedH = ch;
        renderedW = ch * videoRatio;
        offsetX = (cw - renderedW) / 2;
      } else {
        // Letterbox: video is wider than container (black bars on top/bottom)
        renderedW = cw;
        renderedH = cw / videoRatio;
        offsetY = (ch - renderedH) / 2;
      }
    }

    // 1. Grid Overlay (if toggled)
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      const cellW = renderedW / gridSize;
      const cellH = renderedH / gridSize;

      for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(offsetX + i * cellW, offsetY);
        ctx.lineTo(offsetX + i * cellW, offsetY + renderedH);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * cellH);
        ctx.lineTo(offsetX + renderedW, offsetY + i * cellH);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Real YOLOv8 Bounding Boxes
    if (!showBoxes || realtimeDetections.length === 0) {
      return;
    }

    const fw = frameDimensions.width || 640;
    const fh = frameDimensions.height || 480;

    realtimeDetections.forEach((box) => {
      // Map coordinates back to rendered video viewport
      const normX1 = box.x1 / fw;
      const normY1 = box.y1 / fh;
      const normX2 = box.x2 / fw;
      const normY2 = box.y2 / fh;

      const bx = offsetX + normX1 * renderedW;
      const by = offsetY + normY1 * renderedH;
      const bw = (normX2 - normX1) * renderedW;
      const bh = (normY2 - normY1) * renderedH;

      // Primary Bounding Box
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = overcrowdAlert ? '#ef4444' : '#00E5FF';
      ctx.fillStyle = overcrowdAlert ? 'rgba(239, 68, 68, 0.18)' : 'rgba(0, 229, 255, 0.12)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Corner accent brackets
      const cLen = Math.min(10, bw / 4, bh / 4);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + cLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cLen, by);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cLen, by + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cLen);
      ctx.stroke();

      // Confidence badge tag
      const labelText = `PERSON ${Math.round(box.confidence * 100)}%`;
      ctx.font = 'bold 11px monospace';
      const textMetrics = ctx.measureText(labelText);
      const tagW = textMetrics.width + 10;
      const tagH = 18;
      const tagY = Math.max(0, by - tagH);

      ctx.fillStyle = overcrowdAlert ? '#dc2626' : '#0891b2';
      ctx.fillRect(bx, tagY, tagW, tagH);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(labelText, bx + 5, tagY + 13);
    });
  }, [
    realtimeDetections,
    frameDimensions,
    showBoxes,
    showGrid,
    gridSize,
    isMonitoring,
    overcrowdAlert,
    videoElement,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
    />
  );
};
