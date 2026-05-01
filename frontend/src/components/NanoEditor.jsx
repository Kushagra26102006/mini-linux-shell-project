import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Terminal as TerminalIcon } from 'lucide-react';

const NanoEditor = ({ filename, initialContent, onSave, onClose, theme }) => {
  const isDark = theme === 'dark';
  const [content, setContent] = useState(initialContent || '');

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      onSave(content);
    }
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`absolute inset-0 z-50 flex flex-col rounded-xl overflow-hidden border ${
        isDark ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className={isDark ? 'text-terminal-text' : 'text-blue-500'} />
          <span className={`text-xs font-terminal font-semibold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
            NANO 4.0 — {filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(content)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <Save size={12} />
            Save (Ctrl+O)
          </button>
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              isDark ? 'hover:bg-red-500/10 text-red-400/60 hover:text-red-400' : 'hover:bg-red-50 text-red-400/60 hover:text-red-500'
            }`}
          >
            <X size={12} />
            Exit (Ctrl+X)
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`flex-grow p-4 font-terminal text-sm resize-none outline-none bg-transparent ${
          isDark ? 'text-white/90 caret-terminal-text' : 'text-slate-800 caret-blue-500'
        }`}
        spellCheck={false}
      />

      {/* Footer Info */}
      <div className={`px-4 py-1.5 text-[9px] border-t uppercase tracking-widest ${
        isDark ? 'bg-white/2 border-white/5 text-white/20' : 'bg-slate-50/50 border-slate-100 text-slate-300'
      }`}>
        [ Lines: {content.split('\n').length} | Words: {content.trim() ? content.trim().split(/\s+/).length : 0} ]
      </div>
    </motion.div>
  );
};

export default NanoEditor;
