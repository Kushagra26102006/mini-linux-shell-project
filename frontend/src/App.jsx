import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import StatusBar from './components/StatusBar';
import { socket } from './socket';

function App() {
  const [tabs, setTabs]         = useState([{ id: 1, name: 'Terminal 1' }]);
  const [activeTab, setActiveTab] = useState(1);
  const [tree, setTree]         = useState(null);
  const [theme, setTheme]       = useState('light');   // ← default LIGHT
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isConnected, setIsConnected]   = useState(socket.connected);
  const isDark = theme === 'dark';

  /* ── Socket ── */
  useEffect(() => {
    socket.emit('getTree');
    socket.on('vfsTree',    (d) => setTree(d));
    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('vfsTree');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  /* ── Global keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // future: open command palette
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Tab management ── */
  const addTab = () => {
    const id = Date.now();
    setTabs(p => [...p, { id, name: `Terminal ${p.length + 1}` }]);
    setActiveTab(id);
  };

  const removeTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[next.length - 1].id);
  };

  /* ── Sidebar resize ── */
  const startResizing = useCallback((e) => {
    e.preventDefault();
    const onMove = (mv) => {
      const w = mv.clientX;
      if (w > 160 && w < 480) setSidebarWidth(w);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  return (
    <div
      className={`flex flex-col h-screen w-full overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#0d0d0d] text-terminal-text' : 'bg-saas-bg text-saas-text-primary'
      }`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* CRT effects only in dark mode */}
      {isDark && (
        <>
          <div className="crt-overlay" />
          <div className="scanline" />
        </>
      )}

      {/* ── Top Navigation Bar ── */}
      <Header
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTab={addTab}
        onRemoveTab={removeTab}
        theme={theme}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      {/* ── Main Content ── */}
      <div className="flex flex-grow overflow-hidden">

        {/* Sidebar */}
        <Sidebar tree={tree} width={sidebarWidth} theme={theme} />

        {/* Resize handle */}
        <div
          onMouseDown={startResizing}
          className={`w-[3px] flex-shrink-0 cursor-col-resize transition-colors duration-150 ${
            isDark
              ? 'bg-white/5 hover:bg-terminal-text/20'
              : 'bg-[#e2e8f0] hover:bg-saas-primary/30'
          }`}
        />

        {/* Terminal panels */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`${activeTab === tab.id ? 'flex' : 'hidden'} flex-col h-full w-full`}
            >
              <Terminal theme={theme} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <StatusBar isConnected={isConnected} theme={theme} />
    </div>
  );
}

export default App;
