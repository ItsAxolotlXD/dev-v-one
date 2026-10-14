import React, { useState } from 'react';
import { SpinningRing } from '../components/SpinningRing';
import { FluentMinecraftWikiIcon } from '../components/FluentIcons';

export const MinecraftWiki: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] relative bg-[#f4f4f4] dark:bg-[#181818] overflow-hidden">
      {/* Loading Screen matching Fluent Sparkle (Dev) gray styling */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#f3f3f3] dark:bg-[#202020] text-[#111827] dark:text-white transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4">
            <FluentMinecraftWikiIcon className="w-16 h-16 drop-shadow-sm select-none text-neutral-800 dark:text-neutral-100 splash-icon-zoom-in" />
            <SpinningRing size={48} strokeWidth={4.5} color="#0078d4" />
            <div className="text-center mt-2">
              <h2 className="text-sm font-semibold tracking-wide text-neutral-800 dark:text-neutral-100">
                Đang mở Minecraft Wiki...
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Bách khoa toàn thư chính thức về trò chơi Minecraft (minecraft.wiki)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Minecraft Wiki Iframe occupying 100% of the entire tab page without title bar */}
      <iframe
        src="https://minecraft.wiki/"
        title="Official Minecraft Wiki"
        className="w-full h-full min-h-[calc(100vh-64px)] border-none select-auto"
        allow="fullscreen; clipboard-read; clipboard-write"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
