import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Lock, 
  Search, 
  Star, 
  Plus, 
  X, 
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Bookmark,
  Globe
} from 'lucide-react';
import { FluentEdgeIcon } from '../components/FluentIcons';
import { SpinningRing } from '../components/SpinningRing';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
}

interface EdgeBrowserProps {
  navigate?: (route: string) => void;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://google.com', icon: '🔍' },
  { name: 'Bing', url: 'https://bing.com', icon: '🔷' },
  { name: 'VnExpress', url: 'https://vnexpress.net', icon: '📰' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { name: 'Wikipedia', url: 'https://vi.wikipedia.org', icon: '📚' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' }
];

export const EdgeBrowser: React.FC<EdgeBrowserProps> = ({ navigate }) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Google',
      url: 'https://google.com',
      history: ['https://google.com'],
      historyIndex: 0
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [addressInput, setAddressInput] = useState<string>('https://google.com');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Convert URLs so Google renders cleanly inside iframe without X-Frame-Options blocking
  const getEffectiveIframeUrl = (url: string) => {
    const trimmed = url.trim();
    if (
      trimmed === 'https://google.com' ||
      trimmed === 'https://www.google.com' ||
      trimmed === 'http://google.com' ||
      trimmed === 'http://www.google.com' ||
      trimmed === 'google.com'
    ) {
      return 'https://www.google.com/webhp?igu=1';
    }
    if (trimmed.startsWith('https://google.com/search') || trimmed.startsWith('https://www.google.com/search')) {
      if (!trimmed.includes('igu=1')) {
        return trimmed.replace('/search?', '/search?igu=1&');
      }
      return trimmed;
    }
    return trimmed;
  };

  // Navigate to URL in active tab
  const goToUrl = (targetUrl: string) => {
    let formatted = targetUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.includes('.') && !formatted.includes(' ')) {
        formatted = `https://${formatted}`;
      } else {
        // Query search
        formatted = `https://www.google.com/search?igu=1&q=${encodeURIComponent(formatted)}`;
      }
    }

    setIsLoading(true);
    setIframeKey(k => k + 1);
    setAddressInput(formatted.replace('igu=1&', '').replace('&igu=1', '').replace('?igu=1', ''));

    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(formatted);
        let title = formatted.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Web';
        if (title.includes('google')) title = 'Google';
        return {
          ...tab,
          url: formatted,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return tab;
    }));
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIdx = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[newIdx];
      setIsLoading(true);
      setIframeKey(k => k + 1);
      setAddressInput(prevUrl.replace('igu=1&', '').replace('&igu=1', '').replace('?igu=1', ''));
      setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, url: prevUrl, historyIndex: newIdx } : tab));
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIdx = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[newIdx];
      setIsLoading(true);
      setIframeKey(k => k + 1);
      setAddressInput(nextUrl.replace('igu=1&', '').replace('&igu=1', '').replace('?igu=1', ''));
      setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, url: nextUrl, historyIndex: newIdx } : tab));
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(k => k + 1);
  };

  const handleHome = () => {
    goToUrl('https://google.com');
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'Google',
      url: 'https://google.com',
      history: ['https://google.com'],
      historyIndex: 0
    };
    setIsLoading(true);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setAddressInput('https://google.com');
    setIframeKey(k => k + 1);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      const nextTab = remaining[0];
      setActiveTabId(nextTab.id);
      setAddressInput(nextTab.url.replace('igu=1&', '').replace('&igu=1', '').replace('?igu=1', ''));
      setIsLoading(true);
      setIframeKey(k => k + 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div
      className={`w-full flex flex-col bg-[#1f2428] text-white select-none font-sans overflow-hidden transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100vh-4rem)] min-h-[580px] rounded-[10px] border border-black/20 dark:border-white/10 shadow-sm'
      }`}
    >
      {/* 1. Microsoft Edge Tab Bar */}
      <div className="h-10 bg-[#161a1e] border-b border-black/30 flex items-end px-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-neutral-400">
          <FluentEdgeIcon className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold text-neutral-300 hidden sm:inline">Edge</span>
        </div>

        {/* Tab Items */}
        <div className="flex items-end gap-1 flex-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setAddressInput(tab.url.replace('igu=1&', '').replace('&igu=1', '').replace('?igu=1', ''));
                  setIsLoading(true);
                  setIframeKey(k => k + 1);
                }}
                className={`group h-8.5 max-w-[200px] min-w-[120px] px-3 rounded-t-[8px] flex items-center justify-between text-xs transition-colors cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-[#252b31] border-white/10 text-white font-medium shadow-sm'
                    : 'bg-[#1b2024] border-transparent text-neutral-400 hover:bg-[#20252a] hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-3.5 h-3.5 text-[#0078d4] shrink-0" />
                  <span className="truncate">{tab.title}</span>
                </div>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-1 rounded hover:bg-white/20 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Đóng tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            type="button"
            onClick={handleNewTab}
            className="p-1.5 mb-1 rounded-[6px] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Tab mới (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Microsoft Edge Navigation & Address Toolbar */}
      <div className="h-11 px-2.5 bg-[#252b31] border-b border-black/20 flex items-center gap-2 shrink-0">
        {/* Navigation Buttons: Back, Forward, Refresh, Home */}
        <div className="flex items-center gap-0.5 text-neutral-300">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeTab.historyIndex <= 0}
            className="p-1.5 rounded-[4px] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1.5 rounded-[4px] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Tiến lên"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
            title="Tải lại trang (F5)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleHome}
            className="p-1.5 rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
            title="Trang chủ (Google)"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / Address Bar matching Let's chat Copilot */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToUrl(addressInput);
          }}
          className="flex-1 h-8 sm:h-8.5 px-3 rounded-[6px] bg-black/5 dark:bg-[#181c20] border border-black/10 dark:border-white/10 focus-within:ring-1 focus-within:ring-[#0078d4]/30 dark:focus-within:ring-[#4cc2ff]/30 focus-within:border-b-2 focus-within:border-b-[#005fb8] dark:focus-within:border-b-[#4cc2ff] flex items-center gap-2 transition-all"
        >
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Nhập URL hoặc tìm kiếm với /search..."
            className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-neutral-400 outline-none border-none py-1 no-fluent-line"
          />
          <button
            type="button"
            onClick={() => setIsBookmarked(prev => !prev)}
            className={`p-1 rounded transition-colors ${
              isBookmarked ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Đánh dấu trang này"
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </form>

        {/* Action Controls: Fullscreen, Open in external tab */}
        <div className="flex items-center gap-1 text-neutral-300">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-[4px] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-[4px] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Mở trong tab mới của trình duyệt"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Bookmarks / Favorites Bar */}
      <div className="h-7 px-3 bg-[#1e2327] border-b border-black/20 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 text-xs text-neutral-300">
        <span className="text-[10px] uppercase font-semibold text-neutral-500 flex items-center gap-1">
          <Bookmark className="w-3 h-3" />
          <span>Yêu thích:</span>
        </span>
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            type="button"
            onClick={() => goToUrl(bm.url)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="text-xs">{bm.icon}</span>
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Browser Viewport Area with real Google iframe (like Craftmine) */}
      <div className="flex-1 relative w-full h-full bg-[#18181b] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f3f3f3] dark:bg-[#1a1e23] text-[#111827] dark:text-white space-y-3">
            <SpinningRing size={52} strokeWidth={5} color="#0078d4" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              Đang tải Google...
            </p>
          </div>
        )}

        <iframe
          key={`${activeTab.id}-${iframeKey}`}
          src={getEffectiveIframeUrl(activeTab.url)}
          title={activeTab.title}
          className="w-full h-full border-none bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; cross-origin-isolated; camera; microphone; geolocation"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* 5. Edge Status Bar */}
      <div className="h-6 px-3 bg-[#161a1e] border-t border-black/30 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Microsoft Defender SmartScreen: Đã bảo vệ</span>
        </div>
        <div className="flex items-center gap-3">
          <span>100%</span>
          <span>Microsoft Edge (Chromium)</span>
        </div>
      </div>
    </div>
  );
};
