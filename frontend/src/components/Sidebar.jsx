import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  HardDrive, Activity, Cpu, Database, Clock, Filter, RefreshCw
} from 'lucide-react';

/* ── Recursive Tree Item ── */
const TreeItem = ({ item, depth = 0, theme }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isDark = theme === 'dark';
  const isDir = item.type === 'dir';

  const hasChildren = isDir && item.children && Object.keys(item.children).length > 0;

  return (
    <div>
      <div
        className={`group flex items-center gap-2 py-[5px] pr-2 rounded-md cursor-pointer select-none transition-all duration-100 relative ${
          isDark
            ? 'hover:bg-white/5 text-white/60 hover:text-white/90'
            : 'hover:bg-saas-surface text-saas-text-secondary hover:text-saas-text-primary'
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        {/* Expand / collapse icon */}
        <span className="w-3 flex-shrink-0">
          {isDir && hasChildren
            ? isOpen
              ? <ChevronDown size={11} className="opacity-50" />
              : <ChevronRight size={11} className="opacity-50" />
            : null
          }
        </span>

        {/* File / Folder icon */}
        {isDir
          ? isOpen
            ? <FolderOpen size={13} className={isDark ? 'text-terminal-text/70' : 'text-saas-primary'} />
            : <Folder size={13} className={isDark ? 'text-terminal-text/50' : 'text-saas-secondary'} />
          : <FileText size={12} className={isDark ? 'text-white/25' : 'text-saas-text-muted'} />
        }

        {/* Name */}
        <span className="text-[12px] font-medium truncate leading-none">
          {item.name}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {isDir && isOpen && hasChildren && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {Object.values(item.children)
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((child, idx) => (
                <TreeItem key={idx} item={child} depth={depth + 1} theme={theme} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Metric Bar ── */
const MetricBar = ({ label, value, displayValue, color, isDark }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-white/35' : 'text-saas-text-muted'}`}>
        {label}
      </span>
      <span className={`text-[10px] font-semibold tabular-nums ${isDark ? 'text-white/60' : 'text-saas-text-secondary'}`}>
        {displayValue}
      </span>
    </div>
    <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-saas-surface'}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

/* ── Main Sidebar ── */
const Sidebar = ({ tree, width, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`h-full flex flex-col border-r flex-shrink-0 overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-[#e2e8f0]'
      }`}
      style={{ width: `${width}px` }}
    >
      {/* Explorer Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between flex-shrink-0 ${
        isDark ? 'border-white/5' : 'border-[#e2e8f0]'
      }`}>
        <div className="flex items-center gap-2">
          <HardDrive size={12} className={isDark ? 'text-terminal-text/60' : 'text-saas-primary'} />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
            isDark ? 'text-white/40' : 'text-saas-text-muted'
          }`}>Explorer</span>
        </div>
        <button className={`p-1 rounded transition-colors ${
          isDark ? 'text-white/20 hover:text-white/50' : 'text-saas-text-muted hover:text-saas-text-primary'
        }`}>
          <RefreshCw size={11} />
        </button>
      </div>

      {/* File Tree */}
      <div className={`flex-grow overflow-y-auto px-2 py-2 ${isDark ? 'dark-scroll' : 'saas-scroll'}`}>
        {tree ? (
          <TreeItem item={tree} theme={theme} />
        ) : (
          <div className="p-4 space-y-2">
            {[40, 60, 45, 55].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded shimmer" />
                <div className={`h-2.5 rounded shimmer`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status Panel */}
      <div className={`border-t flex-shrink-0 p-4 space-y-4 ${
        isDark ? 'border-white/5 bg-black/20' : 'border-[#e2e8f0] bg-saas-surface/50'
      }`}>
        <div className="flex items-center gap-2">
          <Activity size={11} className={isDark ? 'text-terminal-text/60' : 'text-saas-primary'} />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
            isDark ? 'text-white/40' : 'text-saas-text-muted'
          }`}>System Status</span>
        </div>

        <div className="space-y-3">
          <MetricBar
            label="CPU"
            value={12}
            displayValue="12%"
            color={isDark ? 'bg-terminal-text' : 'bg-saas-primary'}
            isDark={isDark}
          />
          <MetricBar
            label="Memory"
            value={15}
            displayValue="1.2 / 8 GB"
            color={isDark ? 'bg-terminal-cyan/70' : 'bg-saas-secondary'}
            isDark={isDark}
          />
          <MetricBar
            label="Storage"
            value={22}
            displayValue="4.3 / 20 GB"
            color={isDark ? 'bg-terminal-text/60' : 'bg-saas-success'}
            isDark={isDark}
          />
        </div>

        <div className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-white/25' : 'text-saas-text-muted'}`}>
          <Clock size={9} />
          <span>Uptime: 2h 34m</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
