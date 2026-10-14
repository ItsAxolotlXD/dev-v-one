import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  X, 
  ArrowLeft,
  ArrowRight,
  Mic, 
  MicOff,
  Search,
  ExternalLink,
  ChevronRight,
  FolderArchive,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemTasks } from '../context/SystemTasksContext';
import { useSettings } from '../hooks/useSettings';

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

// 1. Yellow Zip Folder Icon matching reference Windows Search
const ZipFolderIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L12 5h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" fill="#f59e0b" />
    <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="#fbbf24" />
    <rect x="9.5" y="7" width="2" height="10" fill="#fef3c7" rx="0.5" />
    <line x1="9.5" y1="8.5" x2="11.5" y2="8.5" stroke="#b45309" strokeWidth="1" />
    <line x1="9.5" y1="10.5" x2="11.5" y2="10.5" stroke="#b45309" strokeWidth="1" />
    <line x1="9.5" y1="12.5" x2="11.5" y2="12.5" stroke="#b45309" strokeWidth="1" />
    <line x1="9.5" y1="14.5" x2="11.5" y2="14.5" stroke="#b45309" strokeWidth="1" />
    <rect x="9" y="15.5" width="3" height="2.5" rx="0.5" fill="#d97706" />
  </svg>
);

// 2. Speech Bubble with lines icon matching reference Ask Copilot row
const AskCopilotBubbleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-[#0078d4] dark:text-[#4cc2ff]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <line x1="8" y1="10.5" x2="14" y2="10.5" strokeLinecap="round" />
    <line x1="8" y1="14" x2="12.5" y2="14" strokeLinecap="round" />
  </svg>
);

// 3. Microsoft Copilot Ribbon Icon with vivid authentic gradient
const CopilotRibbonIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M16.5 4.5a3.5 3.5 0 0 0-4.9 0l-5.6 5.6a3.5 3.5 0 0 0 0 4.9l1.4 1.4a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8l-.7-.7 2.1-2.1a1 1 0 0 0 0-1.4l-.7-.7z" 
      fill="url(#c-grad-1)" 
    />
    <path 
      d="M7.5 19.5a3.5 3.5 0 0 0 4.9 0l5.6-5.6a3.5 3.5 0 0 0 0-4.9l-1.4-1.4a2 2 0 0 0-2.8 0l-5.6 5.6a2 2 0 0 0 0 2.8l.7.7-2.1 2.1a1 1 0 0 0 0 1.4l.7.7z" 
      fill="url(#c-grad-2)" 
    />
    <defs>
      <linearGradient id="c-grad-1" x1="6" y1="4" x2="18" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#3b82f6" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="c-grad-2" x1="18" y1="20" x2="6" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb923c" />
        <stop offset="0.5" stopColor="#f43f5e" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. Spectacles / Copilot Vision Glasses Icon
const GlassesIcon: React.FC<{ className?: string }> = ({ className = "w-4.5 h-4.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <circle cx="6.5" cy="13.5" r="3.5" />
    <circle cx="17.5" cy="13.5" r="3.5" />
    <path d="M10 13.5h4" strokeLinecap="round" />
    <path d="M3.2 12.5 4.8 7.5" strokeLinecap="round" />
    <path d="M20.8 12.5 19.2 7.5" strokeLinecap="round" />
  </svg>
);

// 5. Artwork logo tile matching sparkle experience Artwork PNG
const ArtworkPngIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className={`${className} rounded-[4px] bg-white p-0.5 flex flex-col items-center justify-center shrink-0 shadow-xs border border-black/10 dark:border-white/20`}>
    <div className="flex items-center gap-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
    </div>
    <span className="text-[6.5px] font-black text-black leading-none mt-0.5 tracking-tighter">SE</span>
  </div>
);

// 6. Photo thumbnail matching team shot JPG
const TeamShotThumbnail: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className={`${className} rounded-[4px] overflow-hidden shrink-0 border border-black/10 dark:border-white/20 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center`}>
    <img
      src="/banners/thoi_su_19h.webp"
      alt="Preview"
      onError={(e) => {
        (e.target as HTMLElement).style.display = 'none';
      }}
      className="w-full h-full object-cover"
    />
    <ImageIcon className="w-3.5 h-3.5 text-neutral-400 absolute" style={{ zIndex: 0 }} />
  </div>
);

export const CopilotChatFlyout: React.FC<CopilotChatFlyoutProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  appAspects,
  navigate
}) => {
  const { isTaskRunning } = useSystemTasks();
  const { settings } = useSettings();
  const isPill = Boolean(settings.roundedSearchBox);
  const [activeMode, setActiveMode] = useState<'search' | 'copilot'>('search');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onSearchQueryChange(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      speechRecognitionRef.current = recognition;
    }
  }, [onSearchQueryChange]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechRecognitionRef.current) return;
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Ask Copilot Action
  const handleAskCopilot = async (question?: string) => {
    const prompt = (question || searchQuery || 'windows central').trim();
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
        text: `Chào bạn! Tôi là Copilot AI trong giao diện Windows Search. Bạn đang tìm hiểu về "${prompt}". Bạn có thể xem trực tiếp kênh truyền hình trong tab Watch (Live TV), mở Bảng Widgets để cập nhật tin tức thời gian thực, hoặc tra cứu các tùy chọn trong Settings.`,
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

  // Helper to render bold markdown
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

  // Matched items or defaults that mirror Windows Search Copilot layout
  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Default items matching the reference screenshot when empty or generic
    if (!q || q === 'sparkle experience' || q === 'windows central' || q === 'windows') {
      return [
        {
          id: 'item-1',
          title: 'sparkle experience',
          subtitle: 'Do action',
          iconType: 'zip' as const,
          action: () => navigate('/file-explorer')
        },
        {
          id: 'item-2',
          title: 'sparkle experience team shot 2',
          subtitle: 'JPG File',
          iconType: 'jpg' as const,
          action: () => navigate('/photos')
        },
        {
          id: 'item-3',
          title: 'sparkle experience Artwork',
          subtitle: 'PNG File',
          iconType: 'png' as const,
          action: () => navigate('/photos')
        }
      ];
    }

    // Dynamic search matches based on user input
    const matches = appAspects.filter((a) =>
      a.title.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matches.length > 0) {
      return matches.map((m, idx) => {
        let subtitle = 'Tài liệu hệ thống';
        let iconType: 'zip' | 'jpg' | 'png' | 'logo' = 'zip';
        
        if (m.type === 'channel') {
          subtitle = 'Kênh truyền hình trực tiếp';
          iconType = 'logo';
        } else if (m.type === 'news') {
          subtitle = 'Bài viết thời sự JPG';
          iconType = 'jpg';
        } else if (idx === 0) {
          subtitle = 'Do action';
          iconType = 'zip';
        } else if (idx === 1) {
          subtitle = 'JPG File';
          iconType = 'jpg';
        } else {
          subtitle = 'PNG File';
          iconType = 'png';
        }

        return {
          id: m.id,
          title: m.title,
          subtitle,
          iconType,
          logo: m.logo,
          action: m.onSelect
        };
      });
    }

    // Fallback search suggestions
    return [
      {
        id: 'search-fallback-1',
        title: `${searchQuery} (Thư mục tài liệu)`,
        subtitle: 'Do action',
        iconType: 'zip' as const,
        action: () => navigate(`/channels?search=${encodeURIComponent(searchQuery)}`)
      },
      {
        id: 'search-fallback-2',
        title: `${searchQuery} ảnh chụp trực tuyến`,
        subtitle: 'JPG File',
        iconType: 'jpg' as const,
        action: () => navigate('/photos')
      },
      {
        id: 'search-fallback-3',
        title: `${searchQuery} đồ họa & biểu trưng`,
        subtitle: 'PNG File',
        iconType: 'png' as const,
        action: () => navigate('/photos')
      }
    ];
  }, [searchQuery, appAspects, navigate]);

  if (!isOpen) return null;

  return (
    <motion.div
      key="windows-copilot-search-flyout"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
      className="copilot-flyout-container absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[95vw] max-w-[460px] z-[999] rounded-[16px] bg-[#fbfbfb]/85 dark:bg-[#1f1d27]/85 backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-2 sm:p-2.5 flex flex-col gap-1.5 select-none text-[#18181b] dark:text-white font-sans overflow-hidden"
      style={{
        backdropFilter: 'blur(36px) saturate(180%)',
        WebkitBackdropFilter: 'blur(36px) saturate(180%)'
      }}
    >
      {/* ================= MODE 1: SEARCH & COPILOT SUGGESTIONS ================= */}
      {activeMode === 'search' ? (
        <>
          {/* Upper Search Results List */}
          <div className="flex flex-col gap-0.5">
            {/* Dynamic Results (Items 1 - 3) */}
            {displayedItems.map((item, index) => {
              const isFirst = index === 0;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full rounded-[8px] p-2 sm:p-2.5 px-3 flex items-center gap-3 transition-colors cursor-pointer ${
                    isFirst
                      ? 'bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {/* Left Icon */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {item.iconType === 'zip' && <ZipFolderIcon className="w-6 h-6" />}
                    {item.iconType === 'jpg' && <TeamShotThumbnail className="w-6 h-6" />}
                    {item.iconType === 'png' && <ArtworkPngIcon className="w-6 h-6" />}
                    {item.iconType === 'logo' && item.logo && (
                      <img src={item.logo} alt="" className="w-6 h-6 object-contain rounded" />
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="text-[13.5px] font-medium text-[#111827] dark:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[11.5px] text-[#6b7280] dark:text-neutral-400 mt-0.5 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Item 4: Ask Copilot (with speech bubble icon matching leaked reference) */}
            <div
              onClick={() => handleAskCopilot(searchQuery || 'sparkle experience')}
              className="w-full rounded-[8px] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] p-2 sm:p-2.5 px-3 flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <AskCopilotBubbleIcon className="w-5 h-5 text-[#0078d4] dark:text-white group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-[13.5px] font-medium text-[#111827] dark:text-white truncate">
                  {searchQuery.trim() || 'sparkle experience'}
                </div>
                <div className="text-[11.5px] text-[#0078d4] dark:text-[#4cc2ff] font-medium mt-0.5 flex items-center gap-1">
                  <span>Ask Copilot</span>
                  <Sparkles className="w-3 h-3 text-[#0078d4] dark:text-[#4cc2ff]" />
                </div>
              </div>
            </div>

            {/* Item 5: See More Search Results Button */}
            <div className="relative pt-1">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => {
                  onClose();
                  navigate(`/search?q=${encodeURIComponent(searchQuery || 'sparkle experience')}`);
                }}
                className="w-full rounded-[8px] bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] active:bg-black/[0.09] dark:active:bg-white/[0.1] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white text-xs sm:text-[13px] py-2 px-3.5 flex items-center justify-between transition-colors cursor-pointer font-medium border border-black/5 dark:border-white/5"
              >
                <span>See more search results</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              {/* Tooltip matching corner tooltip */}
              {showTooltip && (
                <div className="absolute right-0 bottom-full mb-1 px-2.5 py-1 rounded-[6px] bg-white dark:bg-[#1e1c24] text-[11px] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 shadow-lg pointer-events-none whitespace-nowrap z-50 animate-in fade-in duration-150">
                  See more search results
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ================= MODE 2: ACTIVE COPILOT AI CHAT VIEW ================= */
        <div className="flex flex-col h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-black/10 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('search')}
              className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại tìm kiếm</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-black/5 dark:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-white">
                <CopilotRibbonIcon className="w-4 h-4" />
                <span>Copilot AI</span>
              </div>
              <button
                type="button"
                onClick={() => setMessages([])}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-[6px] text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-[6px] text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                    className={`p-3 rounded-[12px] text-xs sm:text-[13px] leading-relaxed max-w-[88%] ${
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
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 p-2.5 rounded-[10px] bg-[#f4f4f7] dark:bg-[#282534] border border-black/10 dark:border-white/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] animate-ping" />
                <span>Copilot đang tạo phản hồi...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {['Kênh thời sự VTV1', 'Xem truyền hình', 'Bảng tin hôm nay', 'Cài đặt hệ thống'].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAskCopilot(sug)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-[6px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Lower Input Box Card for Copilot Chat (8px radius corner or 100% round pill) */}
          <div className={`${isPill ? 'rounded-full px-4' : 'rounded-[8px]'} bg-[#f4f4f7] dark:bg-[#282534] border border-black/10 dark:border-white/10 p-3 pt-2.5 flex flex-col justify-between shrink-0 shadow-2xs mt-1.5`}>
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
              placeholder="Đặt câu hỏi tiếp theo cho Copilot..."
              className="w-full bg-transparent text-[13.5px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-neutral-500 outline-none border-none py-0.5 no-fluent-line font-normal"
            />

            <div className="flex items-center justify-between mt-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <CopilotRibbonIcon className="w-4 h-4" />
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Hỏi bất cứ điều gì</span>
              </div>

              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                <button
                  type="button"
                  disabled={!searchQuery.trim() || isLoading}
                  onClick={() => handleAskCopilot(searchQuery)}
                  className="p-1 rounded-[6px] bg-[#0078d4] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#106ebe] transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
