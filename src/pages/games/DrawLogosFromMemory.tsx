import React, { useState } from 'react';
import { ExternalLink, RotateCw, Maximize2, Minimize2, Palette, Sparkles, AlertCircle } from 'lucide-react';
import { SpinningRing } from '../../components/SpinningRing';
import { FluentDrawLogosIcon } from '../../components/FluentIcons';

export const DrawLogosFromMemory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`w-full flex flex-col bg-[#f3f3f3] dark:bg-[#1a1c20] transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100vh-64px)] min-h-[580px] rounded-[10px] overflow-hidden border border-black/10 dark:border-white/10 shadow-sm'
      }`}
    >
      {/* Top toolbar for Draw Logos From Memory */}
      <div className="h-11 px-3 sm:px-4 bg-white dark:bg-[#272727] border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-black dark:text-white min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center text-white shrink-0">
            <FluentDrawLogosIcon className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-wide truncate">Draw Logos From Memory</span>
          <span className="hidden md:inline text-[11px] text-neutral-500 dark:text-neutral-400 font-normal truncate">
            Thử thách vẽ logo từ trí nhớ (neal.fun)
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shrink-0" />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="https://neal.fun/logos-from-memory/"
            target="_blank"
            rel="noopener noreferrer"
            title="Mở trong tab mới"
            className="px-2.5 py-1 rounded-[6px] text-xs font-medium flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mở ngoài</span>
          </a>
          <button
            type="button"
            onClick={handleReload}
            title="Tải lại trang"
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main WebView container */}
      <div className="relative flex-1 w-full h-full bg-[#f8f9fa] dark:bg-[#111317] overflow-hidden">
        {/* Loading overlay with Fluent spinning ring */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f3f4f6] dark:bg-[#1f2228] gap-3">
            <SpinningRing size={40} strokeWidth={4} color="#4cc2ff" />
            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
              <span>Đang kết nối web view Draw Logos From Memory...</span>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="https://neal.fun/logos-from-memory/"
          title="Draw Logos From Memory"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write; fullscreen"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </div>
    </div>
  );
};
