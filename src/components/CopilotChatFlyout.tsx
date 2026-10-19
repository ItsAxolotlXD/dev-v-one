import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  History,
  X,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  MessageCircle,
  AppWindow,
  ChevronRight,
  Newspaper,
  Settings2,
  Tv,
  Wrench,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { AppTabIcon, FluentSearchIcon } from './FluentIcons';
import type { AppTabIconName } from './FluentIcons';
import { STORE_APPS } from '../data/storeApps';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface CopilotChatFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  appAspects: Array<{
    id: string;
    title: string;
    type: string;
    keywords?: string;
    logo?: string;
    onSelect: () => void;
  }>;
  navigate: (route: string) => void;
}

// Default 5 Windows Search History items matching the reference image exactly
const DEFAULT_HISTORY_ITEMS: Array<{ id: string; query: string; route?: string }> = [
  { id: 'h-1', query: 'minecraft preview for windows', route: '/craftmine' },
  { id: 'h-2', query: 'mail and calendar', route: '/schedule' },
  { id: 'h-3', query: 'calculator', route: '/clock' },
  { id: 'h-4', query: 'microsoft maps', route: '/widgets' },
  { id: 'h-5', query: 'notepad', route: '/notes' },
];

const SEARCH_APP_ITEMS = [
  ...STORE_APPS.map((app) => ({
    id: app.id,
    name: app.name,
    route: app.route,
    icon: (app.icon === 'craftmine' || app.icon === 'photopea' ? 'home' : app.icon) as AppTabIconName,
    customIcon: false,
  })),
  { id: 'copilot', name: 'Copilot', route: '/copilot', icon: 'home' as const, customIcon: true },
];

const ROUTE_SHORTCUTS: Record<string, string> = {
  'minecraft preview for windows': '/craftmine',
  'mail and calendar': '/schedule',
  'calculator': '/clock',
  'microsoft maps': '/widgets',
  'notepad': '/notes',
  'craftmine': '/craftmine',
  'schedule': '/schedule',
  'notes': '/notes',
  'clock': '/clock',
  'widgets': '/widgets',
  'live tv': '/live-tv',
  'watch': '/live-tv',
  'channels': '/channels',
  'news': '/news',
  'articles': '/news',
  'photos': '/photos',
  'camera': '/camera',
  'vlc': '/vlc',
  'photopea': '/photopea',
  'cookbook': '/cookbook',
  'swift bank': '/swift-bank',
  'swift social': '/swift-social',
  'task manager': '/task-manager',
  'settings': '/settings',
};

// Microsoft Copilot Ribbon Icon
const CopilotRibbonIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M16.5 4.5a3.5 3.5 0 0 0-4.9 0l-5.6 5.6a3.5 3.5 0 0 0 0 4.9l1.4 1.4a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8l-.7-.7 2.1-2.1a1 1 0 0 0 0-1.4l-.7-.7z" 
      fill="url(#c-flyout-grad-1)" 
    />
    <path 
      d="M7.5 19.5a3.5 3.5 0 0 0 4.9 0l5.6-5.6a3.5 3.5 0 0 0 0-4.9l-1.4-1.4a2 2 0 0 0-2.8 0l-5.6 5.6a2 2 0 0 0 0 2.8l.7.7-2.1 2.1a1 1 0 0 0 0 1.4l.7.7z" 
      fill="url(#c-flyout-grad-2)" 
    />
    <defs>
      <linearGradient id="c-flyout-grad-1" x1="6" y1="4" x2="18" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#3b82f6" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="c-flyout-grad-2" x1="18" y1="20" x2="6" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb923c" />
        <stop offset="0.5" stopColor="#f43f5e" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

export const CopilotChatFlyout: React.FC<CopilotChatFlyoutProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  appAspects,
  navigate
}) => {
  const { settings } = useSettings();
  const isPill = Boolean(settings.roundedSearchBox);
  const [activeMode, setActiveMode] = useState<'search' | 'copilot'>('search');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAspectId, setSelectedAspectId] = useState<string | null>(null);

  // Search History from localStorage (seeded with default 5 items)
  const [historyItems, setHistoryItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vone_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_HISTORY_ITEMS.map((item) => item.query);
  });

  // ESC to close flyout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Remove single history item
  const handleRemoveHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setHistoryItems((prev) => {
      const next = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem('vone_search_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Click on an item in the flyout
  const handleItemClick = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Save to history top
    setHistoryItems((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('vone_search_history', JSON.stringify(next));
      } catch {}
      return next;
    });

    onClose();

    // Route matching
    const lower = trimmed.toLowerCase();
    if (ROUTE_SHORTCUTS[lower]) {
      navigate(ROUTE_SHORTCUTS[lower]);
      return;
    }

    const matchedAspect = appAspects.find(
      (a) => a.title.toLowerCase() === lower || a.title.toLowerCase().includes(lower)
    );
    if (matchedAspect) {
      matchedAspect.onSelect();
      return;
    }

    navigate(`/channels?search=${encodeURIComponent(trimmed)}`);
  };

  // Handle Ask Copilot Action
  const handleAskCopilot = async (promptQuery?: string) => {
    const prompt = (promptQuery || searchQuery || 'windows').trim();
    if (!prompt || isLoading) return;

    setActiveMode('copilot');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: historyPayload
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || 'Copilot đã tiếp nhận câu hỏi của bạn.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.warn('Copilot request failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: `Chào bạn! Tôi là Copilot AI. Bạn đang tìm hiểu về "${prompt}". Bạn có thể xem trực tiếp kênh truyền hình trong tab Watch (Live TV), mở Bảng Widgets để cập nhật tin tức thời gian thực, hoặc tra cứu các tùy chọn trong Settings.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold underline decoration-[#0078d4]/40 decoration-1">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Filter items based on active search query
  const displayedHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Empty input: render exactly the 5 recent items like the user reference screenshot
      return historyItems.slice(0, 5);
    }
    // Filter matching history
    const matched = historyItems.filter((item) => item.toLowerCase().includes(q));
    if (matched.length > 0) {
      return matched.slice(0, 5);
    }
    return [];
  }, [searchQuery, historyItems]);

  const normalizedQuery = searchQuery.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

  const matchingAspects = useMemo(() => {
    if (!normalizedQuery) return [];
    return appAspects
      .filter((aspect) => {
        const searchableText = `${aspect.title} ${aspect.keywords || ''}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const rank = (title: string) => {
          const normalizedTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
          return normalizedTitle === normalizedQuery ? 0 : normalizedTitle.startsWith(normalizedQuery) ? 1 : 2;
        };
        return rank(a.title) - rank(b.title);
      });
  }, [normalizedQuery, appAspects]);

  const matchingHistory = useMemo(
    () => normalizedQuery ? historyItems.filter((item) => item.toLocaleLowerCase().includes(normalizedQuery)).slice(0, 3) : [],
    [normalizedQuery, historyItems]
  );
  const selectedAspect = matchingAspects.find((aspect) => aspect.id === selectedAspectId) || matchingAspects[0];

  useEffect(() => {
    setSelectedAspectId(matchingAspects[0]?.id || null);
  }, [normalizedQuery, matchingAspects]);

  const handleCopyResult = async () => {
    if (!selectedAspect || !navigator.clipboard) return;
    await navigator.clipboard.writeText(selectedAspect.title);
    setCopiedId(selectedAspect.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  if (!isOpen) return null;

  return (
    <div
      key="windows-search-copilot-flyout"
      className={`context-menu copilot-flyout-container absolute top-full right-auto w-[min(680px,calc(100vw-24px))] max-w-[calc(100vw-24px)] -translate-x-1/2 z-[999] select-none font-sans overflow-hidden max-h-[min(70vh,540px)] mt-2 shadow-[0_18px_45px_rgba(0,0,0,0.28)] flex flex-col ${activeMode === 'search' ? 'copilot-search-results-container' : ''} ${
        activeMode === 'search'
          ? 'rounded-none border border-white/10 bg-[#1b1b1f] text-white'
          : settings.windowsAppSdkPreview
            ? 'rounded-[12px] !border !border-white/[0.12] !bg-[#2b2b2b] text-white'
            : 'rounded-[12px] border border-black/10 dark:border-white/10 bg-white dark:bg-[#202124] text-[#1f2937] dark:text-neutral-100'
      }`}
      style={{
        left: 'calc(50% - 16px)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        backgroundColor: activeMode === 'search' ? '#ffffff' : settings.windowsAppSdkPreview ? '#2b2b2b' : undefined,
        animation: 'none',
      }}
    >
      {/* ================= MODE 1: WINDOWS SEARCH FLYOUT (MATCHING USER SCREENSHOT) ================= */}
      {activeMode === 'search' ? (
        normalizedQuery ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[minmax(0,0.94fr)_minmax(270px,1.06fr)]" style={{ animation: 'none', transform: 'none' }}>
            <div className="min-h-0 overflow-y-auto border-b border-black/10 bg-[#f1f1f1] p-3.5 sm:border-b-0 sm:border-r sm:p-4">
              <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Best match</h2>
              {matchingAspects[0] ? (
                <button
                  type="button"
                  aria-pressed={selectedAspect?.id === matchingAspects[0].id}
                  onClick={() => setSelectedAspectId(matchingAspects[0].id)}
                  className={`group flex w-full items-center gap-3 rounded-none border px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4] ${
                    selectedAspect?.id === matchingAspects[0].id
                      ? 'border-[#a7cce8] bg-[#cce8fa] text-[#1f2937]'
                      : 'border-transparent hover:bg-black/5'
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-none bg-[#0078d4] text-white">
                    {matchingAspects[0].logo ? (
                      <img src={matchingAspects[0].logo} alt="" className="h-6 w-6 object-contain" />
                    ) : (
                      <FluentSearchIcon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{matchingAspects[0].title}</span>
                    <span className="mt-0.5 block text-[11px] text-neutral-600">{matchingAspects[0].type === 'setting' ? 'Setting' : matchingAspects[0].type === 'news' ? 'Article' : matchingAspects[0].type === 'channel' ? 'Channel' : 'App'}</span>
                  </span>
                </button>
              ) : (
                <p className="rounded-sm px-2.5 py-3 text-[13px] text-neutral-600">No matching apps or settings</p>
              )}

              {matchingAspects.length > 1 && (
                <section className="mt-4" aria-label="More matching apps">
                  <h3 className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Apps &amp; settings</h3>
                  <div className="space-y-0.5">
                    {matchingAspects.slice(1, 10).map((aspect) => (
                      <button
                        key={aspect.id}
                        type="button"
                        aria-pressed={selectedAspect?.id === aspect.id}
                        onClick={() => setSelectedAspectId(aspect.id)}
                        className={`group flex w-full items-center gap-2.5 rounded-none px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4] ${
                          selectedAspect?.id === aspect.id
                            ? 'bg-[#cce8fa] text-[#1f2937]'
                            : 'hover:bg-black/5'
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden text-[#0078d4]">
                          {aspect.logo ? <img src={aspect.logo} alt="" className="h-5 w-5 object-contain" /> : aspect.type === 'news' ? <Newspaper className="h-4 w-4" /> : aspect.type === 'channel' ? <Tv className="h-4 w-4" /> : aspect.type === 'setting' ? <Settings2 className="h-4 w-4" /> : aspect.type === 'tool' ? <Wrench className="h-4 w-4" /> : <AppWindow className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px]">{aspect.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {matchingHistory.length > 0 && (
                <section className="mt-4" aria-label="Matching search history">
                  <h3 className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Search history</h3>
                  {matchingHistory.map((item) => (
                    <button key={item} type="button" onClick={() => handleItemClick(item)} className="flex w-full items-center gap-2.5 rounded-none px-2 py-1.5 text-left text-[12px] hover:bg-black/5">
                      <History className="h-4 w-4 shrink-0 text-neutral-500" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </section>
              )}

              <section className="mt-4 border-t border-black/10 pt-3" aria-label="Search the web">
                <h3 className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Search the web</h3>
                <div className="flex flex-col gap-0.5">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Find on web with Google: ${searchQuery}`}
                    className="group flex w-full items-center gap-2.5 rounded-none px-2 py-2 text-left text-[12px] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]"
                  >
                    <Search className="h-4 w-4 shrink-0 text-[#4285f4]" />
                    <span className="min-w-0 flex-1 truncate">Find on web: Google</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  </a>
                  <a
                    href={`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Find on web with Bing: ${searchQuery}`}
                    className="group flex w-full items-center gap-2.5 rounded-none px-2 py-2 text-left text-[12px] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]"
                  >
                    <Search className="h-4 w-4 shrink-0 text-[#008373]" />
                    <span className="min-w-0 flex-1 truncate">Find on web: Bing</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  </a>
                  <button type="button" onClick={() => handleAskCopilot(searchQuery)} className="group flex w-full items-center gap-2.5 rounded-none px-2 py-2 text-left transition-colors hover:bg-black/5">
                    <MessageCircle className="h-4 w-4 shrink-0 text-[#0078d4]" />
                    <span className="min-w-0 flex-1 truncate text-[12px]">Ask Copilot: “{searchQuery}”</span>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#0078d4]" />
                  </button>
                </div>
              </section>
            </div>

            <div className="flex min-h-[230px] min-w-0 flex-col bg-white sm:min-h-[390px]">
              {selectedAspect ? (
                <>
                  <div className="flex flex-1 flex-col items-center justify-center border-b border-black/[0.08] px-5 py-7 text-center">
                    <span className="mb-3 flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[5px] bg-[#0078d4] text-white shadow-sm">
                      {selectedAspect.logo ? (
                        <img src={selectedAspect.logo} alt="" className="h-9 w-9 object-contain" />
                      ) : (
                        selectedAspect.type === 'news' ? <Newspaper className="h-7 w-7" /> : selectedAspect.type === 'channel' ? <Tv className="h-7 w-7" /> : selectedAspect.type === 'setting' ? <Settings2 className="h-7 w-7" /> : selectedAspect.type === 'tool' ? <Wrench className="h-7 w-7" /> : <AppWindow className="h-7 w-7" />
                      )}
                    </span>
                    <h2 className="max-w-full truncate text-[16px] font-medium text-[#222]">{selectedAspect.title}</h2>
                    <p className="mt-0.5 text-[12px] text-neutral-500">{selectedAspect.type === 'setting' ? 'Setting' : selectedAspect.type === 'news' ? 'Article' : selectedAspect.type === 'channel' ? 'Channel' : selectedAspect.type === 'tool' ? 'Tool' : 'App'}</p>
                  </div>

                  <div className="space-y-0.5 p-3 sm:p-4" aria-label="Selected result actions">
                    <button type="button" onClick={() => { selectedAspect.onSelect(); onClose(); }} className="flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left text-[12px] text-[#2b2b2b] transition-colors hover:bg-[#f2f2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]">
                      <ExternalLink className="h-4 w-4 text-[#0078d4]" />
                      <span>Open</span>
                    </button>
                    {selectedAspect.type === 'setting' && (
                      <button type="button" onClick={() => { navigate('/settings'); onClose(); }} className="flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left text-[12px] text-[#2b2b2b] transition-colors hover:bg-[#f2f2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]">
                        <Settings2 className="h-4 w-4 text-[#0078d4]" />
                        <span>App settings</span>
                      </button>
                    )}
                    <button type="button" onClick={() => { navigate(`/search?q=${encodeURIComponent(selectedAspect.title)}`); onClose(); }} className="flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left text-[12px] text-[#2b2b2b] transition-colors hover:bg-[#f2f2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]">
                      <Search className="h-4 w-4 text-[#0078d4]" />
                      <span>Search the web</span>
                    </button>
                    <button type="button" onClick={handleCopyResult} className="flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left text-[12px] text-[#2b2b2b] transition-colors hover:bg-[#f2f2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]">
                      {copiedId === selectedAspect.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#0078d4]" />}
                      <span>{copiedId === selectedAspect.id ? 'Copied' : 'Copy name'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <Search className="mb-3 h-7 w-7 text-neutral-400" />
                  <p className="text-[13px] font-medium">No results found</p>
                  <p className="mt-1 text-[12px] text-neutral-500">Try another search or ask Copilot.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-h-[min(70vh,560px)] overflow-y-auto bg-[#1b1b1f] px-4 pb-5 pt-3 text-white" style={{ animation: 'none', transform: 'none' }}>
            <div className="mb-3 flex items-center gap-2 border-b border-[#d8d8d8] pb-2">
              <FluentSearchIcon className="h-4 w-4 text-[#666]" />
              <span className="text-[13px] text-[#666]">Find Microsoft 365 apps</span>
              <X className="ml-auto h-4 w-4 text-[#777]" />
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 sm:grid-cols-5" aria-label="All apps">
              {SEARCH_APP_ITEMS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleItemClick(app.name)}
                  className="group flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-[6px] px-1 py-2 text-center transition-colors hover:bg-[#f0f0f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[7px] bg-transparent">
                    {app.customIcon ? (
                      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NOuKOqoK8fkffl4Wksr70hn9QFcGsI.png" alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <AppTabIcon name={app.icon} className="h-8 w-8" alt="" />
                    )}
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-tight text-[#252525]">{app.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-[#d8d8d8] pt-3">
              <div className="grid grid-cols-4 gap-x-2 sm:grid-cols-5">
                {displayedHistory.slice(0, 5).map((item) => (
                  <button key={item} type="button" onClick={() => handleItemClick(item)} className="flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-[6px] px-1 py-1 text-center hover:bg-[#f0f0f0]">
                    <History className="h-5 w-5 text-[#666]" />
                    <span className="line-clamp-2 text-[10px] text-[#555]">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        /* ================= MODE 2: ACTIVE COPILOT AI CHAT VIEW ================= */
        <div className="flex flex-col h-[440px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-black/10 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('search')}
              className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại tìm kiếm</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-black/5 dark:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-white">
                <CopilotRibbonIcon className="w-3.5 h-3.5" />
                <span>Copilot AI</span>
              </div>
              <button
                type="button"
                onClick={() => setMessages([])}
                title="Làm mới cuộc trò chuyện"
                className="p-1 rounded-[6px] text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-[6px] text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-[10px] text-xs sm:text-[13px] leading-relaxed max-w-[90%] ${
                      isUser
                        ? 'bg-[#0078d4] text-white rounded-tr-none shadow-xs'
                        : 'bg-[#f4f4f7] dark:bg-[#282534] text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-neutral-400">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Sao chép"
                        className="hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 p-2.5 rounded-[8px] bg-[#f4f4f7] dark:bg-[#282534] border border-black/10 dark:border-white/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] animate-ping" />
                <span>Copilot đang tạo phản hồi...</span>
              </div>
            )}
          </div>

          {/* Bottom Chat Input */}
          <div className="rounded-[8px] bg-black/5 dark:bg-[#282534] border border-black/10 dark:border-white/10 p-2.5 flex items-center justify-between shrink-0 mt-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAskCopilot(searchQuery);
                }
              }}
              placeholder="Hỏi tiếp Copilot..."
              className="w-full bg-transparent text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-neutral-500 outline-none border-none py-0.5 no-fluent-line"
            />
            <button
              type="button"
              disabled={!searchQuery.trim() || isLoading}
              onClick={() => handleAskCopilot(searchQuery)}
              className="p-1 rounded-[6px] bg-[#0078d4] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#106ebe] cursor-pointer shrink-0 ml-1.5"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
