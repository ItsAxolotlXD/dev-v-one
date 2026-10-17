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
  ExternalLink
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { FluentSearchIcon } from './FluentIcons';

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

  // Additional matching app aspects when searching
  const matchingAspects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return appAspects.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 3);
  }, [searchQuery, appAspects]);

  if (!isOpen) return null;

  return (
    <div
      key="windows-search-copilot-flyout"
      className={`context-menu copilot-flyout-container absolute top-full left-0 right-0 w-full z-[999] select-none text-white font-sans overflow-hidden ${
        settings.windowsAppSdkPreview
          ? 'rounded-[18px] mt-2 !bg-[#2f2926]/95 !border !border-white/[0.1] !backdrop-blur-none shadow-[0_22px_55px_rgba(0,0,0,0.65)]'
          : isPill
            ? 'rounded-[18px] mt-2 shadow-[0_22px_55px_rgba(0,0,0,0.65)] border border-white/[0.1] bg-[#2f2926]/95 backdrop-blur-2xl'
            : 'rounded-[18px] mt-2 shadow-[0_22px_55px_rgba(0,0,0,0.65)] border border-white/[0.1] bg-[#2f2926]/95 backdrop-blur-2xl'
      } p-2.5 pb-3 flex flex-col`}
      style={{
        backdropFilter: settings.windowsAppSdkPreview ? 'none' : 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: settings.windowsAppSdkPreview ? 'none' : 'blur(32px) saturate(160%)',
        backgroundColor: settings.windowsAppSdkPreview ? '#2b2b2b' : undefined,
        animation: 'none',
        transform: 'none',
      }}
    >
      {/* ================= MODE 1: WINDOWS SEARCH FLYOUT (MATCHING USER SCREENSHOT) ================= */}
      {activeMode === 'search' ? (
        <div className="flex flex-col space-y-1" style={{ animation: 'none', transform: 'none' }}>
          {/* Recent Search History Rows (No animation, instant hover response) */}
          {displayedHistory.map((item) => (
            <div
              key={item}
              onClick={() => handleItemClick(item)}
              style={{ animation: 'none', transform: 'none' }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] hover:bg-white/[0.08] active:bg-white/[0.12] cursor-pointer group text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Black Square Icon with White History Clock Glyphs */}
                <div className="w-9 h-9 rounded-[10px] bg-[#161414] flex items-center justify-center shrink-0 border border-white/[0.08] shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
                  <History className="w-4 h-4 text-white stroke-[1.8]" />
                </div>

                {/* Clean label matching lowercase reference */}
                <span className="text-[13px] sm:text-[13.5px] font-normal text-neutral-800 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white truncate">
                  {item}
                </span>
              </div>

              {/* Discreet Remove from History Button on Hover */}
              <button
                type="button"
                onClick={(e) => handleRemoveHistoryItem(e, item)}
                title="Xóa khỏi lịch sử"
                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded cursor-pointer shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* App Aspect Results (when typing query) */}
          {searchQuery.trim() && matchingAspects.map((aspect) => (
            <div
              key={aspect.id}
              onClick={() => {
                aspect.onSelect();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] hover:bg-white/[0.08] active:bg-white/[0.12] cursor-pointer group text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-[6px] bg-black dark:bg-[#0c0d0e] flex items-center justify-center shrink-0 border border-white/[0.08] shadow-xs overflow-hidden">
                  {aspect.logo ? (
                    <img src={aspect.logo} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <FluentSearchIcon className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] sm:text-[13.5px] font-normal text-neutral-800 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white truncate">
                    {aspect.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 capitalize">
                    {aspect.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Ask Copilot Row (Optional AI Query row when typing or available) */}
          {searchQuery.trim() && (
            <div
              onClick={() => handleAskCopilot(searchQuery)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] cursor-pointer group text-left mt-0.5 pt-1 border-t border-black/5 dark:border-white/5"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-[10px] bg-[#161414] flex items-center justify-center shrink-0 border border-white/[0.08] shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
                  <CopilotRibbonIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] sm:text-[13.5px] font-normal text-neutral-800 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white truncate">
                    Hỏi Copilot: "{searchQuery}"
                  </span>
                  <span className="text-[11px] text-[#0078d4] dark:text-[#4cc2ff] font-medium flex items-center gap-1">
                    <span>Trò chuyện với AI</span>
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
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
