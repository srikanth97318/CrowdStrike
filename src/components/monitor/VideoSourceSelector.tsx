import React, { useState, useRef } from 'react';
import {
  Film,
  Camera,
  AlertTriangle,
  Shield,
  ArrowRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { VideoService } from '../../services/videoService';
import { CameraService } from '../../services/cameraService';

export const VideoSourceSelector: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewStep, setViewStep] = useState<'selection' | 'camera-permission'>('selection');

  const {
    selectVideoFile,
    selectCameraSource,
    retryCameraPermission,
    cameraPermissionState,
    errorMessage,
    sourceStatus,
  } = useMonitorStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      selectVideoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      selectVideoFile(file);
    }
  };

  const handleStartCameraFlow = () => {
    if (!CameraService.isSupported()) {
      alert('Real-time camera access is not supported in this browser.');
      return;
    }
    setViewStep('camera-permission');
  };

  const handleConfirmCameraAccess = async () => {
    await selectCameraSource();
  };

  return (
    <div className="relative w-full aspect-video bg-command-bg border border-command-border rounded-xl overflow-hidden flex flex-col justify-center items-center p-4 sm:p-8">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#162235_1px,transparent_1px),linear-gradient(to_bottom,#162235_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={VideoService.ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* VIEW: CAMERA PERMISSION STEP */}
      {viewStep === 'camera-permission' && (
        <div className="relative z-10 max-w-md w-full bg-command-card/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-6 sm:p-8 text-center shadow-cyan-glow">
          {cameraPermissionState === 'denied' ? (
            <div>
              <div className="h-14 w-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold font-mono text-white mb-2">
                CAMERA ACCESS DENIED
              </h3>
              <p className="text-xs text-command-muted mb-4 font-mono leading-relaxed">
                Camera permission is required to use real-time camera monitoring.
              </p>
              {errorMessage && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 font-mono mb-6 text-left">
                  {errorMessage}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={retryCameraPermission}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} />
                  <span>TRY AGAIN</span>
                </button>
                <button
                  onClick={() => setViewStep('selection')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-command-surface hover:bg-command-card border border-command-border text-command-muted hover:text-white font-mono text-xs transition"
                >
                  Back to Sources
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="h-14 w-14 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto mb-4 animate-pulse">
                <Camera size={28} />
              </div>
              <h3 className="text-lg font-bold font-mono text-white mb-2">
                CAMERA ACCESS
              </h3>
              <p className="text-xs text-gray-300 font-mono mb-4 leading-relaxed">
                Your browser will ask for permission to access your camera.
              </p>

              <div className="p-3 rounded-lg bg-command-surface border border-command-border/80 text-[11px] text-command-muted font-mono text-left mb-6 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Shield size={14} />
                  <span>Privacy Notice:</span>
                </div>
                <p>
                  • Camera access is used <span className="text-white font-bold">only while monitoring is active</span>.
                </p>
                <p>
                  • Microphone and audio are <span className="text-white font-bold">strictly disabled</span>.
                </p>
                <p>
                  • Video frames are processed locally or streamed to your private YOLO detection engine.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleConfirmCameraAccess}
                  disabled={sourceStatus === 'requesting'}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider transition shadow-cyan-glow flex items-center justify-center gap-2"
                >
                  {sourceStatus === 'requesting' ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>REQUESTING PERMISSION...</span>
                    </>
                  ) : (
                    <>
                      <span>CONTINUE</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setViewStep('selection')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-command-surface hover:bg-command-card border border-command-border text-command-muted hover:text-white font-mono text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SOURCE SELECTION (DEFAULT) */}
      {viewStep === 'selection' && (
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
          {/* Main Title Banner */}
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 inline-block mb-2">
              Optical Input Interface
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              LIVE MONITOR
            </h2>
            <p className="text-xs sm:text-sm text-command-muted font-mono mt-1">
              Choose your video source:
            </p>
          </div>

          {/* Error banner if upload/format failed */}
          {errorMessage && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TWO PRIMARY VISUALLY EQUAL OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* OPTION 1: PROVIDE A VIDEO */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer p-6 flex flex-col items-center justify-between text-center bg-command-card/80 hover:bg-command-card/95 ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                  : 'border-command-border hover:border-cyan-500/60 hover:shadow-cyan-glow'
              }`}
            >
              <div className="w-full flex flex-col items-center">
                <div className="h-16 w-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400/60 flex items-center justify-center text-cyan-400 mb-4 transition shadow-xs">
                  <Film size={32} className="group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-base font-bold font-mono text-white tracking-wide mb-1">
                  PROVIDE A VIDEO
                </h3>
                <p className="text-xs text-command-muted font-mono mb-4 max-w-[240px]">
                  Drag & drop your video here, or browse from disk
                </p>

                {/* Formats Pills */}
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {['.MP4', '.WEBM', '.MOV', '.AVI', '.MKV'].map((ext) => (
                    <span
                      key={ext}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-command-surface border border-command-border text-command-dim"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 rounded-lg bg-command-surface group-hover:bg-cyan-500/20 border border-command-border group-hover:border-cyan-500/50 text-xs font-mono font-bold text-gray-200 group-hover:text-cyan-300 transition flex items-center justify-center gap-2"
              >
                <FolderOpen size={14} />
                <span>Browse Files</span>
              </button>
            </div>

            {/* OPTION 2: USE MY CAMERA */}
            <div
              onClick={handleStartCameraFlow}
              className="group relative rounded-xl border-2 border-command-border hover:border-emerald-500/60 hover:shadow-safe-glow transition-all duration-200 cursor-pointer p-6 flex flex-col items-center justify-between text-center bg-command-card/80 hover:bg-command-card/95"
            >
              <div className="w-full flex flex-col items-center">
                <div className="h-16 w-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-400/60 flex items-center justify-center text-emerald-400 mb-4 transition shadow-xs">
                  <Camera size={32} className="group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-base font-bold font-mono text-white tracking-wide mb-1">
                  USE MY CAMERA
                </h3>
                <p className="text-xs text-command-muted font-mono mb-4 max-w-[240px]">
                  Stream live optical video directly from your webcam
                </p>

                {/* Hardware Capabilities */}
                <div className="p-2.5 rounded-lg bg-command-surface border border-command-border/60 text-[11px] font-mono text-command-dim mb-4 w-full text-center">
                  <span className="text-emerald-400 font-semibold">● 720p / 1080p Optical Sensor</span>
                  <div className="text-[10px] text-command-muted mt-0.5">Zero storage • Instant streaming</div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCameraFlow();
                }}
                className="w-full py-2.5 rounded-lg bg-command-surface group-hover:bg-emerald-500/20 border border-command-border group-hover:border-emerald-500/50 text-xs font-mono font-bold text-gray-200 group-hover:text-emerald-300 transition flex items-center justify-center gap-2"
              >
                <Camera size={14} />
                <span>Use Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
