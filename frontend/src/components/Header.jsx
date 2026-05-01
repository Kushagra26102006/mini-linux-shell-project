import React from 'react';
import { TerminalSquare, Plus, Search, Moon, Sun, Cpu, X, Command } from 'lucide-react';

const Header = ({ tabs, activeTab, onTabChange, onAddTab, onRemoveTab, theme, onThemeToggle }) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-14 flex items-center px-5 gap-4 z-50 border-b flex-shrink-0 transition-colors duration-300 ${
        isDark
          ? 'bg-[#0d0d0d] border-white/5'
          : 'bg-white border-[#e2e8f0] shadow-saas-sm'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 min-w-max">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isDark ? 'bg-terminal-text/10' : 'bg-saas-primary/10'
        }`}>
          <TerminalSquare size={15} className={isDark ? 'text-terminal-text' : 'text-saas-primary'} />
        </div>
        <span className={`text-[13px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-saas-text-primary'}`}>
          MiniShell
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
          isDark ? 'bg-terminal-text/10 text-terminal-text' : 'bg-saas-primary/10 text-saas-primary'
        }`}>v4</span>
      </div>

      {/* Divider */}
      <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-[#e2e8f0]'}`} />

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-grow overflow-x-auto hide-scrollbar min-w-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap border flex-shrink-0 ${
              activeTab === tab.id
                ? isDark
                  ? 'bg-terminal-text/10 border-terminal-text/20 text-terminal-text'
                  : 'bg-saas-primary/8 border-saas-primary/20 text-saas-primary'
                : isDark
                  ? 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                  : 'border-transparent text-saas-text-secondary hover:text-saas-text-primary hover:bg-saas-surface'
            }`}
          >
            <TerminalSquare size={11} />
            <span>{tab.name}</span>
            {tabs.length > 1 && (
              <X
                size={11}
                className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-red-500 transition-all"
                onClick={(e) => onRemoveTab(e, tab.id)}
              />
            )}
          </button>
        ))}
        <button
          onClick={onAddTab}
          title="New Terminal (Ctrl+T)"
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${
            isDark
              ? 'text-white/30 hover:text-white hover:bg-white/8'
              : 'text-saas-text-muted hover:text-saas-text-primary hover:bg-saas-surface'
          }`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Spotlight Search */}
      <div className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer focus-ring w-52 ${
        isDark
          ? 'bg-white/4 border-white/8 hover:border-white/15'
          : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
      }`}>
        <Search size={13} className={isDark ? 'text-white/30' : 'text-saas-text-muted'} />
        <span className={`text-[12px] flex-grow ${isDark ? 'text-white/25' : 'text-saas-text-muted'}`}>
          Search commands...
        </span>
        <kbd className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${
          isDark ? 'bg-white/5 border-white/10 text-white/25' : 'bg-white border-[#e2e8f0] text-saas-text-muted'
        }`}>⌘K</kbd>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={onThemeToggle}
        title="Toggle Theme"
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-150 ${
          isDark
            ? 'bg-white/4 border-white/8 text-white/50 hover:text-white hover:bg-white/10'
            : 'bg-white border-[#e2e8f0] text-saas-text-secondary hover:text-saas-text-primary hover:border-[#cbd5e1]'
        } shadow-saas-sm`}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </header>
  );
};

export default Header;
