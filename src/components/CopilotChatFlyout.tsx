import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  X, 
  ArrowRight, 
  Tv, 
  Layers, 
  Compass, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Smile,
  Bold
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemTasks } from '../context/SystemTasksContext';

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

const STARTER_PROMPTS = [
  '📰 Tóm tắt tin nổi bật VnExpress hôm nay',
  '📺 Gợi ý kênh truyền hình thời sự & thể thao',
  '📌 Bảng Widgets của V-One (Dev) có những tiện ích gì?',
  '⚡ Task Manager giúp theo dõi tiến trình thế nào?'
];

export const CopilotChatFlyout: React.FC<CopilotChatFlyoutProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  appAspects,
  navigate
}) => {
  const { isTaskRunning, restartTask } = useSystemTasks();
  const isCopilotRunning = isTaskRunning('task-copilot');

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào! Tôi là Copilot AI của **V-One (Dev)**. Bạn có thể hỏi tôi bất cứ điều gì về lịch phát sóng, tin tức thời sự, hướng dẫn tính năng (Live TV, Widgets, Task Manager, Notes) hoặc kiến thức đời sống!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const POPULAR_EMOJIS = ['😀', '😂', '😍', '🎉', '🚀', '✨', '💡', '🔥', '👍', '❤️', '👏', '🤖', '🌟', '📌', '💬', '🔍', '⚙️', '💻'];

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

  const handleToggleBold = () => {
    const input = inputRef.current;
    if (!input) {
      setInputVal(prev => prev ? `${prev} **in đậm**` : '**in đậm**');
      return;
    }
    const start = input.selectionStart ?? inputVal.length;
    const end = input.selectionEnd ?? inputVal.length;
    if (start !== end) {
      const selected = inputVal.substring(start, end);
      const newVal = inputVal.substring(0, start) + `**${selected}**` + inputVal.substring(end);
      setInputVal(newVal);
      setTimeout(() => {
        input.setSelectionRange(start + 2, end + 2);
        input.focus();
      }, 20);
    } else {
      const newVal = inputVal.substring(0, start) + '**in đậm**' + inputVal.substring(end);
      setInputVal(newVal);
      setTimeout(() => {
        input.setSelectionRange(start + 2, start + 8);
        input.focus();
      }, 20);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setInputVal(prev => prev + emoji);
    } else {
      const start = input.selectionStart ?? inputVal.length;
      const end = input.selectionEnd ?? inputVal.length;
      const newVal = inputVal.substring(0, start) + emoji + inputVal.substring(end);
      setInputVal(newVal);
      setTimeout(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      }, 20);
    }
    setShowEmojiPicker(false);
  };


  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Quick matches from app aspects for the search query
  const matchingAspects = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return appAspects.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 4);
  }, [searchQuery, appAspects]);

  const handleSendMessage = async (textToSend?: string) => {
    if (!isCopilotRunning) return;
    const message = (textToSend || inputVal || searchQuery).trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    onSearchQueryChange('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
        text: `Chào bạn! Tôi đã nhận được yêu cầu: "${message}". Bạn có thể truy cập nhanh kênh Live TV, xem Bảng tiện ích Widgets hoặc kiểm tra Task Manager từ thanh điều hướng nhé!`,
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

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Cuộc trò chuyện mới đã bắt đầu! Bạn muốn Copilot giúp gì hôm nay?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      key="copilot-flyout-panel"
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full mt-1.5 left-0 right-0 w-full z-50 bg-white/95 dark:bg-[#1f2328]/95 backdrop-blur-2xl rounded-[12px] border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[580px] h-[520px] overflow-hidden select-text"
      style={{
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)'
      }}
    >
      {/* 1. Header Bar */}
      <div className="px-3.5 py-2.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#fafafa]/80 dark:bg-[#1a1d21]/80 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 p-1 flex items-center justify-center shrink-0 border border-black/10 dark:border-white/10 shadow-xs">
            <img
              src="https://upload.wikimedia.org/wikipedia/vi/a/aa/Microsoft_Copilot_Icon.svg"
              alt="Copilot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-[13px] text-black dark:text-white">
                Copilot
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Gemini
              </span>
            </div>
            <p className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">
              Trò chuyện & tìm kiếm thông minh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {navigate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/copilot');
              }}
              className="text-[11px] font-semibold text-[#0078d4] dark:text-[#4cc2ff] hover:underline px-1.5 py-1 rounded cursor-pointer"
              title="Mở tab Copilot"
            >
              Mở rộng
            </button>
          )}
          <button
            type="button"
            onClick={handleResetChat}
            title="Làm mới cuộc trò chuyện (New topic)"
            className="p-1.5 rounded-[5px] text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Làm mới</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[5px] text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Instant Search Navigation Row (if user has active searchQuery) */}
      {searchQuery.trim() && (
        <div className="px-3 py-2 bg-[#f0f4f9] dark:bg-[#252a30] border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="text-[11px] font-semibold text-[#0078d4] dark:text-[#4cc2ff] mb-1.5 flex items-center justify-between">
            <span>Kết quả tìm kiếm phù hợp với "{searchQuery}":</span>
            <button
              type="button"
              onClick={() => handleSendMessage(searchQuery)}
              className="text-[11px] font-bold text-[#0078d4] dark:text-[#4cc2ff] hover:underline flex items-center gap-1"
            >
              Hỏi Copilot ngay <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {matchingAspects.map((aspect) => (
              <button
                key={aspect.id}
                type="button"
                onClick={() => {
                  aspect.onSelect();
                  onClose();
                }}
                className="px-2.5 py-1 rounded-[5px] bg-white dark:bg-[#1b1f24] hover:bg-[#0078d4] hover:text-white dark:hover:bg-[#4cc2ff] dark:hover:text-black border border-black/10 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                {aspect.logo ? (
                  <img src={aspect.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                ) : (
                  <Compass className="w-3.5 h-3.5" />
                )}
                <span>{aspect.title}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleSendMessage(searchQuery)}
              className="px-2.5 py-1 rounded-[5px] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] text-xs font-semibold flex items-center gap-1 shrink-0 hover:bg-[#0078d4]/20 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Hỏi Copilot: "{searchQuery}"</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div 
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.01]"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-[10px] text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-normal rounded-tr-none'
                      : 'bg-[#f3f4f6] dark:bg-[#282c31] text-[#111827] dark:text-[#f3f4f6] border border-black/5 dark:border-white/10 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</p>
                </div>

                <div className={`flex items-center gap-2 px-1 text-[10px] text-[#6b7280] dark:text-[#9ca3af] ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      title="Sao chép câu trả lời"
                      className="hover:text-black dark:hover:text-white cursor-pointer ml-1"
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
            </div>
          );
        })}

        {/* AI Typing / Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-[10px] bg-[#f3f4f6] dark:bg-[#282c31] border border-black/5 dark:border-white/10 rounded-tl-none flex items-center gap-1.5 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] animate-ping" />
              <span>Copilot đang suy nghĩ câu trả lời...</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Starter Suggestions Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-black/5 dark:border-white/5 bg-[#fafafa]/50 dark:bg-[#1a1d21]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#282c31] hover:bg-[#0078d4]/10 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] border border-black/10 dark:border-white/10 text-[11px] text-[#4b5563] dark:text-[#d1d5db] shrink-0 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 5. Bottom Input Area with Emoji & Bold */}
      <div className="p-2.5 border-t border-black/10 dark:border-white/10 bg-[#fafafa] dark:bg-[#1a1d21] shrink-0 select-none relative">
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-3 z-50 p-2.5 rounded-xl bg-white dark:bg-[#202428] border border-black/15 dark:border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              <span>Chọn biểu cảm</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1 max-w-[240px]">
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="w-7 h-7 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-base cursor-pointer transition-transform hover:scale-120"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isCopilotRunning ? (
          <div className="flex items-center justify-between p-2 rounded-[6px] bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            <span>⚠️ Copilot Runtime Engine đã bị dừng trong Task Manager. Không thể gửi tin nhắn.</span>
            <button
              type="button"
              onClick={() => restartTask('task-copilot')}
              className="px-2.5 py-1 rounded bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-[11px] cursor-pointer shrink-0 ml-2"
            >
              Khởi động lại
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Format Tools */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleBold}
                className="p-1.5 rounded-[4px] hover:bg-black/10 dark:hover:bg-white/10 text-[#6b7280] dark:text-neutral-300 transition-colors cursor-pointer"
                title="In đậm (Ctrl+B / **text**)"
              >
                <Bold className="w-3.5 h-3.5 stroke-[2.75]" />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                  showEmojiPicker
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff]'
                    : 'hover:bg-black/10 dark:hover:bg-white/10 text-[#6b7280] dark:text-neutral-300'
                }`}
                title="Chèn biểu cảm Emoji"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                    e.preventDefault();
                    handleToggleBold();
                  }
                }}
                placeholder="Nhập câu hỏi hoặc yêu cầu cho Copilot..."
                className="w-full h-9 pl-3 pr-4 rounded-[6px] bg-white dark:bg-[#282c31] border border-black/15 dark:border-white/15 text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#9ca3af] outline-none focus:border-[#0078d4] dark:focus:border-[#4cc2ff] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!inputVal.trim() && !searchQuery.trim()}
              className="w-9 h-9 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black flex items-center justify-center shrink-0 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};
