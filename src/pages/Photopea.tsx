import React, { useState } from 'react';
import { ExternalLink, RotateCw, Maximize2, Minimize2, Image as ImageIcon } from 'lucide-react';
import { SpinningRing } from '../components/SpinningRing';
import { FluentPhotopeaColorIcon } from '../components/FluentIcons';

export const Photopea: React.FC = () => {
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
      className={`w-full flex flex-col bg-[#f3f3f3] dark:bg-[#202020] transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100vh-64px)] min-h-[580px] rounded-[10px] overflow-hidden border border-black/10 dark:border-white/10 shadow-sm'
      }`}
    >
      {/* Top toolbar for Photopea tab */}
      <div className="h-10 px-3 sm:px-4 bg-white dark:bg-[#272727] border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
          <FluentPhotopeaColorIcon className="w-4 h-4 shrink-0 rounded" />
          <span className="font-semibold tracking-wide">Photopea</span>
          <span className="hidden sm:inline text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">
            Trình chỉnh sửa ảnh chuyên nghiệp (PSD, AI, Sketch, PDF)
          </span>
          <span className="text-[10px] text-black/60 dark:text-neutral-400 font-normal">
            photopea.com
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse ml-0.5" />
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://www.photopea.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Mở trong tab mới"
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleReload}
            title="Tải lại trang"
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className="flex-1 relative w-full h-full bg-[#1e1e1e]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f3f3f3] dark:bg-[#202020] text-[#111827] dark:text-white space-y-3">
            <SpinningRing size={52} strokeWidth={5} color="#0078d4" />
            <div className="text-center">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                Đang tải Photopea...
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Chỉnh sửa đồ họa vector & bitmap trên trình duyệt
              </p>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="https://www.photopea.com/"
          title="Photopea Online Photo Editor"
          className="w-full h-full border-none"
          allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};
