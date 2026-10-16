import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Copy, 
  Tv, 
  Search, 
  Wrench, 
  Settings, 
  Maximize2, 
  Minimize2,
  Code2
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface GlobalContextMenuProps {
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenTools: () => void;
  onOpenDeveloperMode?: () => void;
}

export const GlobalContextMenu: React.FC<GlobalContextMenuProps> = ({
  navigate,
  onOpenSearch,
  onOpenTools,
  onOpenDeveloperMode,
}) => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // If user right-clicks on standard input or editable area where browser native menu is essential, we can still allow or enhance
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      
      // Prevent default right-click to show the WebView context menu
      e.preventDefault();

      const selection = window.getSelection()?.toString();
      setHasSelection(Boolean(selection && selection.length > 0));

      const menuWidth = 230;
      const menuHeight = 310;
      let posX = e.clientX;
      let posY = e.clientY;

      if (posX + menuWidth > window.innerWidth) {
        posX = Math.max(10, window.innerWidth - menuWidth - 10);
      }
      if (posY + menuHeight > window.innerHeight) {
        posY = Math.max(10, window.innerHeight - menuHeight - 10);
      }

      setPosition({ x: posX, y: posY });
      setIsOpen(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      closeMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = window.getSelection()?.toString();
    if (text) {
      navigator.clipboard.writeText(text);
    }
    closeMenu();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    closeMenu();
  };

  const isWebViewSdk = settings.windowsAppSdkPreview;

  return (
    <div
      ref={menuRef}
      id="webview-global-context-menu"
      className={`context-menu custom-context-menu fixed z-[99999] w-[220px] select-none rounded-[6px] p-1 text-[#f3f3f3] shadow-[0_12px_32px_rgba(0,0,0,0.65)] ${
        isWebViewSdk
          ? '!bg-[#2b2b2b] !border-0 !border-none !backdrop-blur-none !opacity-100'
          : 'bg-[#2b2b2b]/95 backdrop-blur-xl border border-white/10'
      }`}
      style={{
        top: position.y,
        left: position.x,
        backgroundColor: '#2b2b2b',
        border: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        opacity: 1,
        animation: 'none',
        transition: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Navigation History Row */}
      <div className="grid grid-cols-3 gap-0.5 pb-1 mb-1 border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            window.history.back();
            closeMenu();
          }}
          title="Quay lại"
          className="h-8 rounded-[4px] flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.14] text-[#f3f3f3] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
        </button>
        <button
          type="button"
          onClick={() => {
            window.history.forward();
            closeMenu();
          }}
          title="Tiếp theo"
          className="h-8 rounded-[4px] flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.14] text-[#f3f3f3] cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 stroke-[1.8]" />
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
            closeMenu();
          }}
          title="Tải lại trang"
          className="h-8 rounded-[4px] flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.14] text-[#f3f3f3] cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 stroke-[1.8]" />
        </button>
      </div>

      {/* Copy if selected */}
      {hasSelection && (
        <>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Sao chép</span>
            </div>
            <span className="text-[10px] text-neutral-400">Ctrl+C</span>
          </button>
          <div className="my-1 border-t border-white/[0.08]" />
        </>
      )}

      {/* Primary Navigation Shortcuts */}
      <button
        type="button"
        onClick={() => {
          navigate('/live-tv');
          closeMenu();
        }}
        className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Tv className="w-3.5 h-3.5 stroke-[1.75] text-[#4cc2ff]" />
          <span>Xem truyền hình</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          closeMenu();
          onOpenSearch();
        }}
        className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Search className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Tìm kiếm thông minh</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          closeMenu();
          onOpenTools();
        }}
        className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Wrench className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Công cụ & Tiện ích</span>
        </div>
      </button>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* Screen & System */}
      <button
        type="button"
        onClick={handleToggleFullscreen}
        className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 stroke-[1.75]" /> : <Maximize2 className="w-3.5 h-3.5 stroke-[1.75]" />}
          <span>{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</span>
        </div>
        <span className="text-[10px] text-neutral-400">F11</span>
      </button>

      <button
        type="button"
        onClick={() => {
          navigate('/settings');
          closeMenu();
        }}
        className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Settings className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Cài đặt hệ thống</span>
        </div>
      </button>

      {onOpenDeveloperMode && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onOpenDeveloperMode();
          }}
          className="w-full h-8 px-2.5 rounded-[4px] flex items-center justify-between text-[12.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Kiểm tra phần tử</span>
          </div>
          <span className="text-[10px] text-neutral-400">F12</span>
        </button>
      )}
    </div>
  );
};
