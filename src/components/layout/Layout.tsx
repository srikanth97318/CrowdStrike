import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useMonitorStore } from '../../store/monitorStore';
import { useMonitoring } from '../../hooks/useMonitoring';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const navigate = useNavigate();

  // Initialize monitoring telemetry hook
  useMonitoring();

  const { overcrowdAlert, peopleCount, crowdThreshold } = useMonitorStore();

  return (
    <div className="min-h-screen bg-command-bg text-gray-100 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Global Critical Overcrowd Alert Floating Toast/Banner */}
        <AnimatePresence>
          {overcrowdAlert && !dismissBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/80 border-b border-red-500/50 backdrop-blur-md px-4 py-2.5 z-30"
            >
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 text-red-200">
                  <div className="p-1 rounded bg-red-600/30 border border-red-500 text-red-400 animate-pulse">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase tracking-wide mr-2">
                      CRITICAL ALERT — OVERCROWD DETECTED:
                    </span>
                    <span className="font-mono text-red-300 font-semibold">{peopleCount} people detected</span>
                    <span className="text-red-400/80 ml-2">(Threshold: {crowdThreshold})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/monitor')}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-danger-glow"
                  >
                    <span>VIEW LIVE CAMERA</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => setDismissBanner(true)}
                    className="text-red-400 hover:text-white p-1 rounded hover:bg-red-900/40"
                    title="Dismiss alert banner"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Professional Command Footer */}
        <footer className="border-t border-command-border/60 py-4 px-6 text-center text-xs text-command-muted/70 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>CrowdGuard AI Command Center v2.4 • Optical Intelligence Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-command-dim">
            <span>YOLOv8 Local Inference</span>
            <span>•</span>
            <span>Gemma 4 Advisory Protocol</span>
            <span>•</span>
            <span>Human Review Mandate</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
