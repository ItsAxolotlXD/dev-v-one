import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  ChevronRight,
  Tv,
  Newspaper,
  Layers,
  Smile,
  Bold
} from 'lucide-react';
import { useSystemTasks } from '../context/SystemTasksContext';
import { SpinningRing } from '../components/SpinningRing';
import { sparkOSResetOobeEvent } from '../components/SparkOSBootSetup';

export const COPILOT_ICON_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7bX9C6ZMjpXAbn0eXLI2Wk6ZhwUwk0.png';

const POPULAR_EMOJIS = [
  '😀', '😂', '😍', '🎉', '🚀', '✨', '💡', '🔥', 
  '👍', '❤️', '👏', '🤖', '🌟', '📌', '💬', '🔍', 
  '⚙️', '💻', '📱', '📝', '🇻🇳', '🎯', '💯', '☕'
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface CopilotPageProps {
  navigate?: (route: string) => void;
  embedded?: boolean;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({ navigate, embedded = false }) => {
  const { isTaskRunning, restartTask } = useSystemTasks();
  const isCopilotRunning = isTaskRunning('task-copilot');

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Xin chào! Tôi là **Copilot** - trợ lý AI đồng hành của bạn trên **Sparkle (Dev)**. Tôi có thể giúp bạn tìm kiếm kênh truyền hình, đọc và tóm tắt tin tức thời sự từ VnExpress, giải đáp thắc mắc hoặc hỗ trợ các công cụ văn phòng Notes & Sticky Notes. Bạn muốn tìm hiểu gì hôm nay? ✨',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Auto-scroll to bottom of messages
  useEffect(() => {
    const messageList = chatEndRef.current?.parentElement;
    messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle URL query parameter (e.g. from TopBar /find or /search redirect)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('query') || params.get('q');
      if (q && q.trim()) {
        const queryClean = q.trim();
        // Clear param from URL cleanly
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => {
          handleSendMessage(queryClean);
        }, 150);
      }
    } catch {}
  }, []);

  // Handle Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận dạng giọng nói trực tiếp.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (!isCopilotRunning) return;
    const message = (textToSend || inputVal).trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    if (/^\/oobe\s+reset$/i.test(message)) {
      const confirmation: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: embedded ? 'Đang khởi động lại OOBE của SparkOS…' : 'Lệnh này chỉ hoạt động trong Copilot bên trong SparkOS.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmation]);
      if (embedded) window.setTimeout(() => window.dispatchEvent(new Event(sparkOSResetOobeEvent)), 650);
      return;
    }

    setIsLoading(true);

    const isSearchCmd = /^\/(find|search)\b/i.test(message);
    const searchKeyword = isSearchCmd ? message.replace(/^\/(find|search)\s*/i, '').trim() : '';

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
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
      console.warn('Copilot error:', err);
      let fallbackText = '';
      if (isSearchCmd && searchKeyword) {
        fallbackText = `🔍 **Kết quả tìm kiếm Copilot cho:** "${searchKeyword}"\n\n` +
          `• 📺 **Kênh truyền hình & Live TV:** Khám phá chuyên mục Live TV với hơn 100+ kênh chuẩn HD.\n` +
          `• 📰 **Tin tức VnExpress:** Cập nhật tin thời sự mới nhất với tính năng AI Summarize.\n` +
          `• ⚙️ **Ứng dụng Sparkle (Dev) phù hợp:** Swift Bank (ngân hàng số), Clock (báo thức & giờ thế giới), Notes, Widgets.\n` +
          `• 💡 Bạn có thể bấm vào các thẻ gợi ý bên dưới hoặc chuyển sang tab Channels để xem nhanh!`;
      } else {
        fallbackText = `Chào bạn! Tôi đã ghi nhận yêu cầu: "${message}". Bạn có thể sử dụng **/find <từ khóa>** hoặc **/search <từ khóa>** để tìm kiếm mọi dữ liệu trong Sparkle (Dev), xem tab Watch để xem kênh Live TV, mở Widgets để cập nhật tin tức VnExpress thời gian thực hoặc kiểm tra Task Manager!`;
      }

      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: fallbackText,
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

  const QUICK_PROMPTS = [
    { label: 'Gợi ý các kênh truyền hình nổi bật', query: 'Gợi ý cho tôi các kênh truyền hình nổi bật hôm nay trên Sparkle (Dev)' },
    { label: 'Tin tức nóng nhất từ VnExpress', query: 'Tóm tắt tin tức thời sự nóng nhất hôm nay từ VnExpress' },
    { label: 'Hướng dẫn sử dụng Widgets Dashboard', query: 'Hướng dẫn cách xem Bảng tiện ích Widgets Dashboard và tin tức thời gian thực' },
    { label: 'Quản lý tiến trình trong Task Manager', query: 'Task Manager trong Sparkle (Dev) có những tiến trình gì và hoạt động ra sao?' },
  ];

  // Helper to render bold markdown and formatting
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

  // Toggle bold formatting
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

  // Insert emoji
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


  return (
    <div className={`w-full ${embedded ? 'h-full min-h-0' : 'h-[calc(100vh-3.5rem)]'} bg-transparent text-[#111827] dark:text-[#f3f4f6] flex flex-col p-3 sm:px-6 sm:pt-4 sm:pb-3 select-none font-sans overflow-hidden`}>
      {/* 1. Header Banner */}
      <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center p-2 shrink-0 border border-black/10 dark:border-white/15 shadow-xs">
            <img
              src={COPILOT_ICON_SRC}
              alt="Microsoft Copilot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
                Copilot
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                isCopilotRunning 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}>
                {isCopilotRunning ? 'Runtime Active' : 'Runtime Stopped'}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              Trợ lý AI thông minh tích hợp trên Sparkle (Dev) • Sẵn sàng tìm kiếm, tóm tắt và đồng hành cùng bạn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleResetChat}
            className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#111827] dark:text-white border border-black/10 dark:border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cuộc trò chuyện mới"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đoạn chat mới</span>
          </button>
        </div>
      </div>

      {/* 2. Warning Banner if Copilot Runtime is Terminated */}
      {!isCopilotRunning && (
        <div className="max-w-4xl w-full mx-auto my-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="text-xs">
              <strong className="font-semibold">Copilot Runtime Engine đã bị dừng</strong> trong Task Manager.
            </div>
          </div>
          <button
            type="button"
            onClick={() => restartTask('task-copilot')}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Khởi động lại Runtime
          </button>
        </div>
      )}

      {/* 3. Messages Chat Area (Internal scroll, does not cause input to scroll) */}
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col my-2 select-text overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse self-end max-w-[85%] sm:max-w-[75%]' : 'self-start max-w-[95%] sm:max-w-[85%]'}`}
            >
              {!isUser ? (
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#25282c] border border-black/10 dark:border-white/10 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    src={COPILOT_ICON_SRC}
                    alt="Copilot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#0078d4] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  Bạn
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13.5px] leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0078d4] text-white rounded-tr-xs'
                      : 'bg-white/80 dark:bg-[#22252a]/80 border border-black/10 dark:border-white/10 text-[#111827] dark:text-[#f3f4f6] backdrop-blur-md rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{renderFormattedText(msg.text)}</p>
                </div>

                <div className={`flex items-center gap-2 px-1 text-[10px] text-neutral-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                      title="Sao chép câu trả lời"
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 self-start max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#25282c] border border-black/10 dark:border-white/10 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={COPILOT_ICON_SRC}
                alt="Copilot"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#22252a]/80 border border-black/10 dark:border-white/10 rounded-tl-xs flex items-center gap-2 text-xs text-neutral-500">
              <SpinningRing size={16} strokeWidth={2.5} color="#0078d4" />
              <span>Copilot đang suy nghĩ và phản hồi...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 4. Suggested Prompts Chips */}
      {messages.length <= 2 && (
        <div className="max-w-4xl w-full mx-auto mb-2 flex items-center gap-2 flex-wrap shrink-0">
          <div className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
            <span>Gợi ý:</span>
          </div>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!isCopilotRunning || isLoading}
              onClick={() => handleSendMessage(item.query)}
              className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5 select-none"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* 5. Bottom Pinned Input Area: styled like Let's chat Copilot with Emoji & Bold */}
      <div className="max-w-4xl w-full mx-auto shrink-0 select-none pt-2 border-t border-black/10 dark:border-white/10 relative">
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-2 z-50 p-2.5 rounded-xl bg-white dark:bg-[#202428] border border-black/15 dark:border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              <span>Biểu tượng cảm xúc (Emoji)</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-w-[280px]">
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-lg cursor-pointer transition-transform hover:scale-120"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          id="copilot-search-box"
          className="fluent-search-box group relative w-full h-8 sm:h-8.5 bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10 flex items-center px-3.5 gap-2 rounded-[8px] transition-all focus-within:ring-1 focus-within:ring-[#0078d4]/30 dark:focus-within:ring-[#4cc2ff]/30 focus-within:border-b-2 focus-within:border-b-[#005fb8] dark:focus-within:border-b-[#4cc2ff]"
        >
          {/* Left Text Format Tools: Bold & Emoji */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleBold}
              className="p-1.5 rounded-[4px] hover:bg-black/10 dark:hover:bg-white/10 text-[#6b7280] dark:text-neutral-300 transition-colors cursor-pointer flex items-center justify-center font-bold"
              title="In đậm chữ (Ctrl+B / **in đậm**)"
            >
              <Bold className="w-3.5 h-3.5 stroke-[2.75]" />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center justify-center ${
                showEmojiPicker
                  ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff]'
                  : 'hover:bg-black/10 dark:hover:bg-white/10 text-[#6b7280] dark:text-neutral-300'
              }`}
              title="Chèn biểu cảm Emoji"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 shrink-0" />

          {/* Main Input Text */}
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
            disabled={!isCopilotRunning}
            placeholder={
              !isCopilotRunning
                ? 'Copilot Runtime Engine đã bị dừng trong Task Manager'
                : isListening
                ? 'Đang nghe... Hãy nói yêu cầu của bạn'
                : "Let's chat or use /search"
            }
            className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#9ca3af] outline-none border-none py-1 pr-16 no-fluent-line"
          />

          {/* Right Action Icons matching Let's chat Copilot with outline mic */}
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Dừng lắng nghe' : 'Nói với Copilot'}
              className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'border border-rose-500 text-rose-500 bg-rose-500/10 animate-pulse'
                  : 'text-[#71717a] dark:text-neutral-300 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={1.75} />
              ) : (
                <Mic className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={1.75} />
              )}
            </button>

            <button
              type="submit"
              disabled={!isCopilotRunning || !inputVal.trim() || isLoading}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center justify-center ${
                !isCopilotRunning || !inputVal.trim() || isLoading
                  ? 'opacity-30 cursor-not-allowed text-neutral-400'
                  : 'text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/10'
              }`}
              title="Gửi câu hỏi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>


        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-2 pt-1.5 pb-0.5">
          <span>Copilot được tiếp sức bởi Google Gemini AI & VnExpress Real-time Data</span>
          <div className="flex items-center gap-3">
            {navigate && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/live-tv')}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Tv className="w-3 h-3" />
                  <span>Kênh TV</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/widgets')}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3 h-3" />
                  <span>Widgets</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
