import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronRight,
  Check
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface GlobalContextMenuProps {
  navigate: (route: string) => void;
  onOpenSearch?: () => void;
  onOpenTools?: () => void;
  onOpenDeveloperMode?: () => void;
}

type ActiveSubmenu = 'navigate' | 'apps' | 'tiles' | null;

export const GlobalContextMenu: React.FC<GlobalContextMenuProps> = ({
  navigate,
  onOpenSearch,
  onOpenTools,
  onOpenDeveloperMode,
}) => {
  const { settings, updateSetting } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [openSubmenu, setOpenSubmenu] = useState<ActiveSubmenu>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const submenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setOpenSubmenu(null);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // If right-clicked on a live tile, let the live tile context menu take precedence
      const isTile = Boolean((e.target as HTMLElement)?.closest?.('[data-is-live-tile="true"]'));
      if (isTile) {
        closeMenu();
        return;
      }

      // Show custom Windows 10/Photos style sharp context menu
      e.preventDefault();

      const selection = window.getSelection()?.toString();
      setHasSelection(Boolean(selection && selection.length > 0));

      const menuWidth = 240;
      const menuHeight = 490;
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
      setOpenSubmenu(null);
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
      // Alt+Enter Settings
      if (e.altKey && e.key === 'Enter') {
        navigate('/settings');
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
  }, [closeMenu, navigate]);

  if (!isOpen) return null;

  // Actions
  const handleCopy = () => {
    const text = window.getSelection()?.toString();
    if (text) {
      navigator.clipboard.writeText(text);
      showToast('Đã sao chép văn bản vào bộ nhớ tạm');
    }
    closeMenu();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast('Đã bật chế độ Toàn màn hình');
    } else {
      document.exitFullscreen().catch(() => {});
      showToast('Đã thoát chế độ Toàn màn hình');
    }
    closeMenu();
  };

  const handleBack = () => {
    window.history.back();
    closeMenu();
  };

  const handleForward = () => {
    window.history.forward();
    closeMenu();
  };

  const handleReload = () => {
    window.location.reload();
    closeMenu();
  };

  const handlePinCurrentToTiles = () => {
    window.dispatchEvent(new CustomEvent('vplay-open-pin-tile'));
    // If not on tiles, navigate to tiles
    if (window.location.pathname !== '/tiles') {
      navigate('/tiles');
    }
    showToast('Mở trình ghim nội dung vào Live Tiles');
    closeMenu();
  };

  const handleToggleLiveTilesHome = () => {
    const nextVal = !settings.liveTilesHome;
    updateSetting('liveTilesHome', nextVal);
    showToast(nextVal ? 'Đã bật Live Tiles Home (Start Screen)' : 'Đã chuyển về Giao diện Trang chủ chuẩn');
    closeMenu();
  };

  const handleToggleTheme = () => {
    const currentTheme = settings.theme || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateSetting('theme', nextTheme);
    showToast(`Đã chuyển sang giao diện ${nextTheme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}`);
    closeMenu();
  };

  const handleSubmenuEnter = (type: ActiveSubmenu) => {
    if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    setOpenSubmenu(type);
  };

  const handleSubmenuLeave = () => {
    submenuTimerRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 220);
  };

  // Check if submenu should expand to the left
  const isNearRightEdge = position.x + 240 + 230 > window.innerWidth;

  return (
    <>
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2 bg-[#2d2d2d] text-white border border-[#4c4c4c] rounded-none text-xs font-semibold shadow-2xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#a78bfa]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Modern Sharp Rectangular Context Menu (Design style from reference image) */}
      <div
        ref={menuRef}
        id="metro-global-context-menu"
        className="fixed z-[99999] w-[236px] select-none rounded-none py-2 text-[#e5e5e5] bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] font-sans text-[13.5px] context-menu-slide-down"
        style={{
          top: position.y,
          left: position.x,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Điều hướng (Navigate Submenu) */}
        <div
          className="relative"
          onMouseEnter={() => handleSubmenuEnter('navigate')}
          onMouseLeave={handleSubmenuLeave}
        >
          <button
            type="button"
            className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 flex items-center justify-between rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 ${
              openSubmenu === 'navigate'
                ? 'bg-[#5d4b75] text-white'
                : 'hover:bg-[#3d3d3d] hover:text-white'
            }`}
          >
            <span>Điều hướng</span>
            <ChevronRight className="w-4 h-4 opacity-75" />
          </button>

          {openSubmenu === 'navigate' && (
            <div
              onMouseEnter={() => handleSubmenuEnter('navigate')}
              onMouseLeave={handleSubmenuLeave}
              className={`absolute top-0 z-[100000] w-[232px] rounded-none py-2 bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] context-menu-slide-down ${
                isNearRightEdge ? 'right-full -mr-[1px]' : 'left-full -ml-[1px]'
              }`}
            >
              {[
                { label: 'Trang chủ (Home)', route: '/' },
                { label: 'Kênh truyền hình (Live TV)', route: '/live-tv' },
                { label: 'Start Live Tiles (Panorama)', route: '/tiles' },
                { label: 'Bảng tiện ích (Widgets)', route: '/widgets' },
                { label: 'Tin tức thời sự (News)', route: '/news' },
                { label: 'Microsoft Store', route: '/store' },
                { label: 'Trợ lý AI Copilot', route: '/copilot' },
              ].map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    navigate(item.route);
                    closeMenu();
                  }}
                  className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Tiện ích & Ứng dụng (Apps & Tools Submenu) */}
        <div
          className="relative"
          onMouseEnter={() => handleSubmenuEnter('apps')}
          onMouseLeave={handleSubmenuLeave}
        >
          <button
            type="button"
            className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 flex items-center justify-between rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 ${
              openSubmenu === 'apps'
                ? 'bg-[#5d4b75] text-white'
                : 'hover:bg-[#3d3d3d] hover:text-white'
            }`}
          >
            <span>Tiện ích & Ứng dụng</span>
            <ChevronRight className="w-4 h-4 opacity-75" />
          </button>

          {openSubmenu === 'apps' && (
            <div
              onMouseEnter={() => handleSubmenuEnter('apps')}
              onMouseLeave={handleSubmenuLeave}
              className={`absolute top-0 z-[100000] w-[232px] rounded-none py-2 bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] context-menu-slide-down ${
                isNearRightEdge ? 'right-full -mr-[1px]' : 'left-full -ml-[1px]'
              }`}
            >
              {[
                { label: 'Ghi chú văn bản (Notes)', route: '/notes' },
                { label: 'Bảng vẽ (MSPaint)', route: '/paint' },
                { label: 'Trình phát VLC Player', route: '/vlc' },
                { label: 'Máy tính (Calculator)', route: '/calculator' },
                { label: 'Máy ảnh (Camera)', route: '/camera' },
                { label: 'Trình duyệt Edge', route: '/edge' },
                { label: 'Quản lý tác vụ (Task Manager)', route: '/task-manager' },
                { label: 'Lịch phát sóng (EPG)', route: '/schedule' },
              ].map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    navigate(item.route);
                    closeMenu();
                  }}
                  className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Tùy biến Live Tiles & Giao diện (Tiles & Personalization Submenu) */}
        <div
          className="relative"
          onMouseEnter={() => handleSubmenuEnter('tiles')}
          onMouseLeave={handleSubmenuLeave}
        >
          <button
            type="button"
            className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 flex items-center justify-between rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 ${
              openSubmenu === 'tiles'
                ? 'bg-[#5d4b75] text-white'
                : 'hover:bg-[#3d3d3d] hover:text-white'
            }`}
          >
            <span>Tùy biến Tiles & Giao diện</span>
            <ChevronRight className="w-4 h-4 opacity-75" />
          </button>

          {openSubmenu === 'tiles' && (
            <div
              onMouseEnter={() => handleSubmenuEnter('tiles')}
              onMouseLeave={handleSubmenuLeave}
              className={`absolute top-0 z-[100000] w-[236px] rounded-none py-2 bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] context-menu-slide-down ${
                isNearRightEdge ? 'right-full -mr-[1px]' : 'left-full -ml-[1px]'
              }`}
            >
              <button
                type="button"
                onClick={handlePinCurrentToTiles}
                className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
              >
                Ghim vào Live Tiles...
              </button>
              <button
                type="button"
                onClick={handleToggleLiveTilesHome}
                className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
              >
                <span>Live Tiles Home</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-[#444] text-neutral-200">
                  {settings.liveTilesHome ? 'BẬT' : 'TẮT'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleToggleTheme}
                className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
              >
                <span>Chế độ Sáng / Tối</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-[#444] text-neutral-200">
                  {settings.theme === 'light' ? 'Sáng' : 'Tối'}
                </span>
              </button>
              <div className="border-t border-[#444444] my-2 mx-2.5" />
              <button
                type="button"
                onClick={() => {
                  navigate('/tiles');
                  closeMenu();
                }}
                className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#a78bfa] font-medium rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
              >
                Mở màn hình Live Tiles
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[#444444] my-2 mx-2.5" />

        {/* 4. Quay lại (Back) */}
        <button
          type="button"
          onClick={handleBack}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
        >
          <span>Quay lại</span>
          <span className="text-[11px] text-[#999]">Alt+Left</span>
        </button>

        {/* 5. Tiếp theo (Forward) */}
        <button
          type="button"
          onClick={handleForward}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
        >
          <span>Tiến tới</span>
          <span className="text-[11px] text-[#999]">Alt+Right</span>
        </button>

        {/* 6. Tải lại trang (Reload) */}
        <button
          type="button"
          onClick={handleReload}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
        >
          <span>Tải lại trang</span>
          <span className="text-[11px] text-[#999]">Ctrl+R</span>
        </button>

        {/* 7. Sao chép (Copy) */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasSelection}
          className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 rounded-none transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between ${
            hasSelection
              ? 'hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] cursor-pointer'
              : 'text-[#777] cursor-default'
          }`}
        >
          <span>Sao chép</span>
          <span className="text-[11px] text-[#888]">Ctrl+C</span>
        </button>

        {/* Separator */}
        <div className="border-t border-[#444444] my-2 mx-2.5" />

        {/* 8. Ghim nhanh vào Live Tiles */}
        <button
          type="button"
          onClick={handlePinCurrentToTiles}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
        >
          Ghim vào Live Tiles
        </button>

        {/* 9. Toàn màn hình (Fullscreen) */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
        >
          <span>Toàn màn hình</span>
          <span className="text-[11px] text-[#999]">F11</span>
        </button>

        {/* 10. Cài đặt hệ thống (Settings) */}
        <button
          type="button"
          onClick={() => {
            navigate('/settings');
            closeMenu();
          }}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
        >
          <span>Cài đặt hệ thống</span>
          <span className="text-[11px] text-[#999]">Alt+Enter</span>
        </button>

        {/* 11. Giới thiệu (About) */}
        <button
          type="button"
          onClick={() => {
            navigate('/about');
            closeMenu();
          }}
          className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100"
        >
          Thông tin V-Play
        </button>
      </div>
    </>
  );
};
