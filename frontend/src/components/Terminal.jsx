import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ChevronRight,
  Copy, Check, Zap, Command, TerminalSquare
} from 'lucide-react';
import { socket } from '../socket';
import NanoEditor from './NanoEditor';

/* ══════════════════════════════════════════
   BANNERS (outside component to avoid re-creation)
══════════════════════════════════════════ */
const DARK_BANNER = `
 ███╗   ███╗██╗███╗   ██╗██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
 ████╗ ████║██║████╗  ██║██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
 ██╔████╔██║██║██╔██╗ ██║██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝ 
 ██║╚██╔╝██║██║██║╚██╗██║██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗ 
 ██║ ╚═╝ ██║██║██║ ╚████║██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
 ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝

    MiniShell v4.0  ·  Type 'help' to see all commands
`;

const LIGHT_BANNER = `MiniShell v4.0 — Professional Virtual Linux Terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type 'help' to see 50+ available commands.
Use Tab or → to autocomplete  ·  ↑↓ for history
`;

/* ══════════════════════════════════════════
   TypingText
══════════════════════════════════════════ */
const TypingText = ({ text, type, theme }) => {
  const isDark = theme === 'dark';
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!text) { setDisplayed(''); return; }
    if (text.length > 300) { setDisplayed(text); return; }
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 1);
    return () => clearInterval(timer);
  }, [text]);

  const renderHighlighted = (content) => {
    // Basic heuristics for ls coloring: 
    // Folders end with /, files usually have dots.
    const parts = content.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (!part.trim()) return part;
      if (part.endsWith('/')) {
        return <span key={idx} className="text-purple-500 font-bold">{part}</span>;
      }
      if (part.includes('.')) {
        return <span key={idx} className={isDark ? 'text-slate-400' : 'text-slate-500'}>{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <pre className={`whitespace-pre-wrap font-terminal text-[12.5px] leading-relaxed select-text ${
      type === 'error'
        ? 'text-red-500'
        : isDark ? 'text-white/80' : 'text-slate-800'
    }`}>
      {type === 'output' ? renderHighlighted(displayed) : displayed}
    </pre>
  );
};

/* ══════════════════════════════════════════
   CommandBlock — Bubble style
══════════════════════════════════════════ */
const CommandBlock = ({ item, theme }) => {
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const ts = new Date(item.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Command input row ── */
  if (item.type === 'command') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className={`rounded-xl p-3 border ${
          isDark
            ? 'bg-[#00ff4108] border-[#00ff4115]'
            : 'bg-blue-50/60 border-blue-100'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold font-terminal ${
              isDark ? 'text-terminal-text/60' : 'text-blue-500'
            }`}>
              {item.path}
            </span>
            <ChevronRight size={10} className={isDark ? 'text-white/15' : 'text-slate-300'} />
          </div>
          <span className={`text-[9px] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{ts}</span>
        </div>
        <span className={`font-terminal text-[13px] font-semibold ${
          isDark ? 'text-white/90' : 'text-blue-600'
        }`}>
          $ {item.content}
        </span>
      </motion.div>
    );
  }

  /* ── Output / error row ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="group relative pl-1"
    >
      <TypingText text={item.content} type={item.type} theme={theme} />

      {/* Copy button — only shows on hover if there's enough content */}
      {item.content && item.content.trim().length > 5 && (
        <button
          onClick={handleCopy}
          title="Copy output"
          className={`absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-all duration-150 ${
            isDark
              ? 'bg-white/5 border-white/8 text-white/40 hover:text-white'
              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 shadow-sm'
          }`}
        >
          {copied
            ? <><Check size={9} className="text-green-500" /> Copied!</>
            : <><Copy size={9} /> Copy</>
          }
        </button>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   Autocomplete Dropdown
══════════════════════════════════════════ */
const AutocompleteDropdown = ({ suggestions, onSelect, theme }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={`absolute bottom-full mb-2 left-0 right-0 rounded-xl border overflow-hidden z-50 ${
        isDark
          ? 'bg-[#111] border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.6)]'
          : 'bg-white border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]'
      }`}
    >
      <div className={`px-2 py-1.5 border-b text-[9px] font-semibold uppercase tracking-wider ${
        isDark ? 'border-white/5 text-white/20' : 'border-slate-100 text-slate-400'
      }`}>
        Suggestions
      </div>
      <div className="p-1.5 max-h-48 overflow-y-auto">
        {suggestions.slice(0, 10).map((s, i) => (
          <button
            key={i}
            onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-terminal transition-colors ${
              isDark
                ? 'text-white/60 hover:bg-white/5 hover:text-terminal-text'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Zap size={10} className={isDark ? 'text-terminal-text/40' : 'text-blue-400'} />
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   MAIN TERMINAL
══════════════════════════════════════════ */
const Terminal = ({ theme }) => {
  const isDark = theme === 'dark';

  const [history, setHistory] = useState([
    { type: 'output', content: isDark ? DARK_BANNER : LIGHT_BANNER, timestamp: Date.now() }
  ]);
  const [input, setInput]           = useState('');
  const [currentPath, setCurrentPath] = useState('~');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ghostText, setGhostText]   = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [nanoState, setNanoState]   = useState(null); // { filename, content }

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  /* ── Socket events (stable handler refs) ── */
  useEffect(() => {
    const onOutput = (data) => {
      setIsLoading(false);
      if (data.clear) {
        setHistory([]);
        return;
      }
      if (data.reboot) {
        window.location.reload();
        return;
      }
      if (data.matrix) {
        setHistory(p => [...p, { type: 'output', content: "Entering the Matrix...", timestamp: Date.now() }]);
        // Could add a cool effect here if desired
      }
      if (data.nano) {
        setNanoState({ filename: data.filename, content: data.content });
      }
      if (data.output) setHistory(p => [...p, { type: 'output', content: data.output, timestamp: Date.now() }]);
      if (data.error)  setHistory(p => [...p, { type: 'error',  content: data.error,  timestamp: Date.now() }]);
      if (data.path)   setCurrentPath(data.path.replace('/home/user', '~'));
    };

    const onAutoComplete = (data) => {
      const matches = data.matches || [];
      setSuggestions(matches);
      if (matches.length > 0) {
        // Ghost text: use the current input's last word at the time this fires
        setInput(prev => {
          const lastWord = prev.split(' ').pop();
          const m = matches[0];
          if (lastWord && m.startsWith(lastWord)) {
            setGhostText(m.slice(lastWord.length));
          } else {
            setGhostText('');
          }
          return prev; // don't modify input
        });
      } else {
        setGhostText('');
      }
    };

    socket.on('output', onOutput);
    socket.on('autoCompleteResponse', onAutoComplete);

    return () => {
      socket.off('output', onOutput);
      socket.off('autoCompleteResponse', onAutoComplete);
    };
  }, []); // stable — no dependencies

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  /* ── Execute command ── */
  const executeCommand = useCallback((cmd) => {
    cmd = cmd.trim();
    if (!cmd) return;

    setHistory(p => [...p, {
      type: 'command',
      content: cmd,
      path: currentPath,
      timestamp: Date.now()
    }]);

    const [c, ...args] = cmd.split(' ');

    // Handle clear locally for instant feedback
    if (c === 'clear') {
      setHistory([]);
      setInput('');
      setGhostText('');
      return;
    }

    socket.emit('command', { command: c, args });
    setCmdHistory(p => [cmd, ...p]);
    setHistIdx(-1);
    setInput('');
    setGhostText('');
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(true);
  }, [currentPath]);

  /* ── Keyboard shortcuts ── */
  const handleKeyDown = (e) => {
    // Global shortcuts
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      return;
    }
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setHistory(p => [...p, { type: 'output', content: '^C', timestamp: Date.now() }]);
      setInput('');
      setGhostText('');
      setIsLoading(false);
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      executeCommand(input);
      return;
    }

    // Accept ghost text / autocomplete
    if (ghostText && (e.key === 'Tab' || e.key === 'ArrowRight')) {
      e.preventDefault();
      setInput(prev => prev + ghostText);
      setGhostText('');
      setShowSuggestions(false);
      return;
    }

    // Tab without ghost text — just hide suggestions
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
      setGhostText('');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next < 0 ? '' : (cmdHistory[next] ?? ''));
      setGhostText('');
      return;
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setGhostText('');
    }
  };

  /* ── Input change ── */
  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setHistIdx(-1);

    if (val.trim()) {
      socket.emit('autoComplete', { partial: val.split(' ').pop() });
      setShowSuggestions(true);
    } else {
      setGhostText('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /* ── Select autocomplete item ── */
  const handleSelect = (s) => {
    const parts = input.split(' ');
    parts[parts.length - 1] = s;
    setInput(parts.join(' '));
    setGhostText('');
    setShowSuggestions(false);
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  /* ── Drag & Drop ── */
  const handleDrop = (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        socket.emit('command', { command: 'touch', args: [file.name], content: ev.target.result });
      };
      reader.readAsText(file);
    });
  };

  return (
    <div
      className={`flex flex-col h-full transition-colors duration-300 ${
        isDark ? 'bg-[#0d0d0d]' : 'bg-slate-50'
      }`}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      {isDark && <div className="cyber-grid" />}

      {/* ── Nano Editor Overlay ── */}
      <AnimatePresence>
        {nanoState && (
          <NanoEditor
            theme={theme}
            filename={nanoState.filename}
            initialContent={nanoState.content}
            onClose={() => setNanoState(null)}
            onSave={(content) => {
              socket.emit('saveFile', { filename: nanoState.filename, content });
              setNanoState(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Output Area ── */}
      <div
        ref={scrollRef}
        className={`flex-grow overflow-y-auto p-5 z-10 space-y-2.5 ${
          isDark ? 'dark-scroll' : 'saas-scroll'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {history.map((item, idx) => (
            <CommandBlock key={idx} item={item} theme={theme} />
          ))}
        </AnimatePresence>

        {/* Shimmer loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-1 px-1"
          >
            <Loader2
              size={13}
              className={`animate-spin flex-shrink-0 ${
                isDark ? 'text-terminal-text/50' : 'text-blue-400'
              }`}
            />
            <div className="space-y-2 flex-grow">
              <div className="h-2 w-56 rounded-full shimmer" />
              <div className="h-2 w-36 rounded-full shimmer" />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-1.5 z-20">
        <div className={`relative rounded-2xl border transition-all duration-200 ${
          isDark
            ? 'bg-white/[0.03] border-white/10 hover:border-white/18 focus-within:border-terminal-text/25'
            : 'bg-white border-slate-200 hover:border-slate-300 focus-within:border-blue-400 shadow-[0_4px_20px_rgba(0,0,0,0.07)] focus-within:shadow-[0_4px_24px_rgba(37,99,235,0.12)]'
        }`}>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length >= 1 && (
              <AutocompleteDropdown
                key="autocomplete"
                suggestions={suggestions}
                onSelect={handleSelect}
                theme={theme}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-4 py-3">
            {/* Prompt */}
            <span className={`font-terminal text-[12px] font-semibold flex-shrink-0 whitespace-nowrap ${
              isDark ? 'text-terminal-text' : 'text-blue-600'
            }`}>
              {currentPath}&nbsp;$
            </span>

            {/* Input + ghost text overlay */}
            <div className="relative flex-grow min-w-0">
              {/* Ghost layer */}
              <div
                className="absolute inset-0 flex items-center pointer-events-none overflow-hidden"
                aria-hidden
              >
                {/* Mirror real input (invisible) to push ghost to correct position */}
                <span className="font-terminal text-[13px] invisible whitespace-pre max-w-full">
                  {input || ' '}
                </span>
                {ghostText && (
                  <span className={`font-terminal text-[13px] whitespace-pre ${
                    isDark ? 'text-white/18' : 'text-slate-300'
                  }`}>
                    {ghostText}
                  </span>
                )}
                {/* Blinking cursor — only show when input is empty */}
                {!input && (
                  <span className={`absolute left-0 w-[2px] h-4 rounded-sm animate-blink ${
                    isDark ? 'bg-terminal-text' : 'bg-blue-500'
                  }`} />
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                className={`relative w-full bg-transparent border-none outline-none font-terminal text-[13px] caret-transparent ${
                  isDark ? 'text-white/90' : 'text-slate-800'
                }`}
                placeholder={input ? '' : 'Type a command…'}
              />
            </div>

            {/* Run Button */}
            <button
              onClick={() => executeCommand(input)}
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150 ${
                input.trim() && !isLoading
                  ? isDark
                    ? 'bg-terminal-text/12 text-terminal-text hover:bg-terminal-text/20 border border-terminal-text/15'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                  : isDark
                    ? 'bg-white/[0.03] text-white/15 border border-white/5 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {isLoading
                ? <Loader2 size={11} className="animate-spin" />
                : <Command size={11} />
              }
              {isLoading ? 'Running…' : 'Run'}
            </button>
          </div>
        </div>

        {/* Keyboard hint strip */}
        <div className={`flex items-center gap-4 mt-2 px-1 text-[10px] select-none ${
          isDark ? 'text-white/12' : 'text-slate-400'
        }`}>
          {[
            ['↑↓', 'History'],
            ['Tab', 'Complete'],
            ['Ctrl+L', 'Clear'],
            ['Ctrl+C', 'Interrupt'],
          ].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <kbd className={`font-terminal text-[9px] px-1 py-0.5 rounded border ${
                isDark ? 'border-white/10 bg-white/4' : 'border-slate-200 bg-white'
              }`}>{key}</kbd>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
