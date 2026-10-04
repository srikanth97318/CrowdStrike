import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Clock,
  Shield,
} from 'lucide-react';
import { useMonitorStore } from '../../store/monitorStore';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    unreadAlertsCount,
    overcrowdAlert,
  } = useMonitorStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return '';
      case '/monitor': return 'Live Optical Surveillance';
      case '/analytics': return 'Crowd Flow & Volume Analytics';
      case '/alerts': return 'Incident Log & Safety Advisories';
      case '/settings': return 'System Parameters & AI Pipeline';
      default: return '';
    }
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-20 h-16 bg-command-surface/90 backdrop-blur-md border-b border-command-border px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Brand Identity / Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-command-muted hover:text-white rounded-lg hover:bg-command-card lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
              <Shield size={18} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                Crowd<span className="text-cyan-400">Guard</span> AI
              </span>
              <span className="text-[10px] text-command-muted font-mono tracking-tight hidden sm:block">
                Autonomous Safety Operations
              </span>
            </div>
          </div>

          {pageTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-command-border/80">
              <span className="text-xs font-semibold text-gray-300 font-mono">
                {pageTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Clean System Status, Live Clock, Notifications, Operator Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Clean System Status */}
        <Badge variant="safe" dot pulse className="font-mono text-xs font-semibold px-2.5 py-1">
          SYSTEM ONLINE
        </Badge>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-command-card border border-command-border font-mono text-xs text-command-muted">
          <Clock size={13} className="text-cyan-400" />
          <span className="text-gray-200 font-medium">{currentTime}</span>
          <span className="text-command-dim text-[10px]">|</span>
          <span className="text-[11px] text-gray-400">{currentDate}</span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className={`relative p-2 rounded-lg border transition ${
            overcrowdAlert
              ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
              : 'bg-command-card border-command-border text-command-muted hover:text-white'
          }`}
          aria-label="View Safety Alerts"
          title="Incident Alerts"
        >
          <Bell size={17} />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Operator Avatar */}
        <div
          className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-400/40 flex items-center justify-center text-white font-bold text-xs shadow-cyan-glow cursor-default select-none"
          title="Operator: CG Command Unit"
        >
          CG
        </div>
      </div>
    </header>
  );
};
