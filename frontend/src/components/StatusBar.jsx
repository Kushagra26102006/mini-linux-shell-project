import React, { useState, useEffect } from 'react';
import { Wifi, Clock, Shield, Database, Activity, Circle, Zap } from 'lucide-react';

const Separator = ({ isDark }) => (
  <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-[#e2e8f0]'}`} />
);

const StatusItem = ({ icon: Icon, label, accent, isDark }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-medium ${
    accent
      ? isDark ? 'text-terminal-text' : 'text-saas-primary'
      : isDark ? 'text-white/30' : 'text-saas-text-muted'
  }`}>
    <Icon size={9} />
    <span>{label}</span>
  </div>
);

const StatusBar = ({ isConnected, theme }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const isDark = theme === 'dark';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className={`h-7 flex-shrink-0 flex items-center px-4 gap-3 border-t z-50 transition-colors duration-300 ${
      isDark
        ? 'bg-[#080808] border-white/5'
        : 'bg-[#f8fafc] border-[#e2e8f0]'
    }`}>
      {/* Left */}
      <div className="flex items-center gap-3 flex-grow">
        {/* Connection Status */}
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${
          isConnected
            ? isDark ? 'text-terminal-text' : 'text-saas-success'
            : 'text-saas-error'
        }`}>
          <Circle
            size={6}
            className={`fill-current ${isConnected ? 'animate-pulse' : ''}`}
          />
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>

        <Separator isDark={isDark} />
        <StatusItem icon={Wifi} label="WIFI: ON" isDark={isDark} />
        <Separator isDark={isDark} />
        <StatusItem icon={Database} label="VFS: PERSISTENT" isDark={isDark} />
        <Separator isDark={isDark} />
        <StatusItem icon={Shield} label="ENC: AES-256" isDark={isDark} />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <StatusItem icon={Activity} label="LOAD: 0.34" isDark={isDark} />
        <Separator isDark={isDark} />
        <StatusItem icon={Zap} label="MiniShell v4" accent isDark={isDark} />
        <Separator isDark={isDark} />
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold tabular-nums ${
          isDark ? 'text-white/50' : 'text-saas-text-secondary'
        }`}>
          <Clock size={9} />
          {time}
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
