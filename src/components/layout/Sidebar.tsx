import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Activity,
  Cpu,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { mode, overcrowdAlert, unreadAlertsCount, isMonitoring, setMode } = useMonitorStore();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitor', label: 'Live Monitor', icon: Radio, pulse: isMonitoring },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeVariant: overcrowdAlert ? ('critical' as const) : ('warning' as const),
    },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-command-surface border-r border-command-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-command-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
              <Shield size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider text-white">CROWDGUARD</span>
                <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-command-muted font-mono tracking-tight">REAL-TIME SAFETY INTEL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-command-dim">
            Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-command-card text-white border border-command-border shadow-sm'
                      : 'text-command-muted hover:text-white hover:bg-command-card/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`transition-colors ${
                          isActive ? 'text-accent-cyan' : 'text-command-muted group-hover:text-white'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.pulse && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {item.badge !== undefined && (
                        <Badge variant={item.badgeVariant} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Quick Engine Telemetry pill */}
          <div className="pt-6 px-3">
            <div className="p-3 rounded-lg bg-command-card/80 border border-command-border text-xs space-y-2">
              <div className="flex items-center justify-between text-command-muted">
                <span className="font-mono text-[11px] flex items-center gap-1.5">
                  <Cpu size={12} className="text-cyan-400" /> ENGINE
                </span>
                <span className="font-mono text-[11px] text-white">YOLOv8 + Gemma</span>
              </div>
              <div className="flex items-center justify-between text-command-muted">
                <span className="font-mono text-[11px] flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" /> INFERENCE
                </span>
                <span className="font-mono text-[11px] text-emerald-400">~28 FPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector and System Status */}
        <div className="p-3 border-t border-command-border space-y-3">
          {/* Mode Switcher */}
          <div className="p-2 rounded-lg bg-command-card border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-command-dim">Data Source</span>
              <button
                onClick={() => setMode(mode === 'demo' ? 'live' : 'demo')}
                className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                title="Toggle between Simulated Demo Mode and Real FastAPI Backend"
              >
                <Zap size={10} />
                Switch to {mode === 'demo' ? 'Live API' : 'Demo'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${mode === 'demo' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-white font-medium">
                  {mode === 'demo' ? 'DEMO SIMULATION' : 'LIVE BACKEND'}
                </span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${mode === 'demo' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {mode === 'demo' ? 'MOCK' : 'WS:8000'}
              </span>
            </div>
          </div>

          {/* Operator Profile */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-command-border flex items-center justify-center text-command-muted font-mono text-xs">
                OP
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-command-surface" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate flex items-center gap-1">
                <span>Watch Lead 01</span>
                <UserCheck size={11} className="text-cyan-400 shrink-0" />
              </div>
              <p className="text-[10px] text-command-muted truncate">Safety Operations Desk</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
