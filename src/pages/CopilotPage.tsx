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
  Layers
} from 'lucide-react';
import { useSystemTasks } from '../context/SystemTasksContext';
import { SpinningRing } from '../components/SpinningRing';

export const COPILOT_ICON_SRC = 'https://upload.wikimedia.org/wikipedia/vi/a/aa/Microsoft_Copilot_Icon.svg';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface CopilotPageProps {
  navigate?: (route: string) => void;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({ navigate }) => {
  const { isTaskRunning, restartTask } = useSystemTasks();
  const isCopilotRunning = isTaskRunning('task-copilot');

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Xin chào! Tôi là Copilot - trợ lý AI đồng hành của bạn trên V-One (Dev). Tôi có thể giúp bạn tìm kiếm kênh truyền hình, đọc và tóm tắt tin tức thời sự từ VnExpress, giải đáp thắc mắc hoặc hỗ trợ các công cụ văn phòng Notes & Sticky Notes. Bạn muốn tìm hiểu gì hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
    setIsLoading(true);

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
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: `Chào bạn! Tôi đã ghi nhận yêu cầu: "${message}". Bạn có thể sử dụng tab Watch để xem kênh Live TV, mở Widgets để cập nhật tin tức VnExpress thời gian thực hoặc kiểm tra Task Manager!`,
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
    { label: 'Gợi ý các kênh truyền hình nổi bật', query: 'Gợi ý cho tôi các kênh truyền hình nổi bật hôm nay trên V-One (Dev)' },
    { label: 'Tin tức nóng nhất từ VnExpress', query: 'Tóm tắt tin tức thời sự nóng nhất hôm nay từ VnExpress' },
    { label: 'Hướng dẫn sử dụng Widgets Dashboard', query: 'Hướng dẫn cách xem Bảng tiện ích Widgets Dashboard và tin tức thời gian thực' },
    { label: 'Quản lý tiến trình trong Task Manager', query: 'Task Manager trong V-One (Dev) có những tiến trình gì và hoạt động ra sao?' },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent text-[#111827] dark:text-[#f3f4f6] flex flex-col p-3 sm:p-6 md:p-8 select-none font-sans">
      {/* 1. Header Banner */}
      <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center p-2 shrink-0 border border-black/10 dark:border-white/15 shadow-xs">
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
              Trợ lý AI thông minh tích hợp trên V-One (Dev) • Sẵn sàng tìm kiếm, tóm tắt và đồng hành cùng bạn.
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
        <div className="max-w-4xl w-full mx-auto my-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="text-xs sm:text-sm">
              <strong className="font-semibold">Copilot Runtime Engine đã bị dừng</strong> trong Task Manager. Bạn không thể gửi câu hỏi hoặc trò chuyện cho đến khi khởi động lại tiến trình.
            </div>
          </div>
          <button
            type="button"
            onClick={() => restartTask('task-copilot')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Khởi động lại Runtime
          </button>
        </div>
      )}

      {/* 3. Messages Chat Area */}
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col my-4 select-text overflow-y-auto space-y-4 pr-1 min-h-[360px]">
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
                  <p className="whitespace-pre-line break-words">{msg.text}</p>
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
        <div className="max-w-4xl w-full mx-auto mb-3 flex items-center gap-2 flex-wrap shrink-0">
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

      {/* 5. Bottom Input Area */}
      <div className="max-w-4xl w-full mx-auto shrink-0 select-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-white dark:bg-[#22252a] rounded-xl border border-black/15 dark:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-1.5 focus-within:ring-2 focus-within:ring-[#0078d4]/40 transition-all"
        >
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Dừng lắng nghe' : 'Nói với Copilot'}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={!isCopilotRunning}
            placeholder={
              !isCopilotRunning
                ? 'Copilot Runtime Engine đã bị dừng trong Task Manager'
                : isListening
                ? 'Đang nghe... Hãy nói yêu cầu của bạn'
                : "Hỏi Copilot bất cứ điều gì (tin tức, kênh TV, ghi chú...)"
            }
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-[13.5px] text-[#111827] dark:text-white placeholder-neutral-400 outline-none border-none"
          />

          <button
            type="submit"
            disabled={!isCopilotRunning || !inputVal.trim() || isLoading}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              !isCopilotRunning || !inputVal.trim() || isLoading
                ? 'opacity-30 cursor-not-allowed text-neutral-400'
                : 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black hover:opacity-90 shadow-xs'
            }`}
            title="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-2 pt-2">
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
