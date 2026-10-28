import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Plus, 
  Trash2, 
  Heart, 
  Grid,
  Tv, 
  Tv2, 
  Volume2, 
  VolumeX, 
  Calendar,
  Headphones, 
  Sparkles, 
  Type, 
  Bookmark,
  FileDown, 
  StickyNote, 
  Play, 
  Pause, 
  RotateCcw, 
  Globe, 
  Bell,
  ArrowUpRight, 
  QrCode, 
  CreditCard, 
  History, 
  Shield,
  PlusSquare, 
  RefreshCw, 
  Users, 
  MessageCircle,
  Brush, 
  Eraser, 
  Palette,
  Camera, 
  Timer, 
  Sliders, 
  Image as ImageIcon,
  Maximize, 
  Repeat, 
  Newspaper, 
  Folder, 
  Sun, 
  Moon, 
  HelpCircle,
  Check
} from 'lucide-react';
import { Channel, NewsArticle } from '../types';
import { useSettings } from '../hooks/useSettings';
import { FluentSearchIcon } from './FluentIcons';

interface ControlBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  currentChannel?: Channel;
  onOpenAddStream?: () => void;
  onOpenSummarize?: (article?: NewsArticle) => void;
  onOpenTextToSpeech?: (article?: NewsArticle) => void;
  onOpenFindWords?: () => void;
  onOpenSpotlight?: () => void;
  onOpenHelp?: () => void;
  onToggleStickyNote?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  currentRoute,
  navigate,
  currentChannel,
  onOpenAddStream,
  onOpenSummarize,
  onOpenTextToSpeech,
  onOpenFindWords,
  onOpenSpotlight,
  onOpenHelp,
  onToggleStickyNote
}) => {
  const { settings, updateSetting } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vone_control_bar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState<string>(() => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Master clock ticker for control bar (h:mm style, integer font)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClockTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close more menu when changing route
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [currentRoute]);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('vone_control_bar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Check if control bar should be visible:
  // Must have insider flag enabled, and route CANNOT be Tiles tab!
  const isTilesRoute = currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles';
  if (!settings.controlBar || isTilesRoute) {
    return null;
  }

  // Dispatch custom actions to active page
  const dispatchPageAction = (action: string, payload?: any) => {
    window.dispatchEvent(new CustomEvent('vone:controlbar-action', { 
      detail: { action, payload, route: currentRoute } 
    }));
  };

  // Determine Tab Configuration and Contextual Actions
  const isPhotosRoute = currentRoute === '/photos' || currentRoute === '/gallery';
  const isTvRoute = currentRoute === '/live-tv';
  const isNewsRoute = currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/');
  const isNotesRoute = currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table';
  const isClockRoute = currentRoute === '/clock' || currentRoute === '/alarm' || currentRoute === '/stopwatch' || currentRoute === '/timer' || currentRoute === '/world-clock';
  const isBankRoute = currentRoute === '/swift-bank' || currentRoute === '/bank' || currentRoute === '/swiftbank';
  const isSocialRoute = currentRoute === '/swift' || currentRoute === '/friends';
  const isPaintRoute = currentRoute === '/ms-paint' || currentRoute === '/paint';
  const isCameraRoute = currentRoute === '/camera';
  const isVlcRoute = currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player';
  const isBrowserRoute = currentRoute === '/edge' || currentRoute === '/browser';
  const isSettingsRoute = currentRoute === '/settings';
  const isHomeRoute = currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home';

  // Upper Capsule Primary Action (Share/Export/Specialized)
  const renderUpperAction = () => {
    if (isPhotosRoute) {
      return {
        id: 'photos-share',
        icon: Share2,
        label: 'Chia sẻ bộ sưu tập',
        onClick: () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Đã sao chép liên kết Thư viện ảnh!');
          }
        }
      };
    }
    if (isTvRoute) {
      return {
        id: 'tv-share',
        icon: Share2,
        label: 'Chia sẻ kênh TV',
        onClick: () => {
          if (navigator.clipboard) {
            const url = `${window.location.origin}/live-tv?channel=${currentChannel?.slug || 'vtv1'}`;
            navigator.clipboard.writeText(url);
            showNotification(`Đã sao chép liên kết ${currentChannel?.name || 'Kênh TV'}!`);
          }
        }
      };
    }
    if (isNewsRoute) {
      return {
        id: 'news-share',
        icon: Share2,
        label: 'Chia sẻ tin tức',
        onClick: () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Đã sao chép liên kết bài báo!');
          }
        }
      };
    }
    if (isNotesRoute) {
      return {
        id: 'notes-share',
        icon: Share2,
        label: 'Xuất văn bản DOCX',
        onClick: () => {
          dispatchPageAction('notes-export-docx');
          showNotification('Đang chuẩn bị xuất tài liệu...');
        }
      };
    }
    if (isPaintRoute) {
      return {
        id: 'paint-share',
        icon: Share2,
        label: 'Lưu bản vẽ ảnh PNG',
        onClick: () => {
          dispatchPageAction('paint-download');
          showNotification('Đang lưu bản vẽ về máy...');
        }
      };
    }
    return {
      id: 'default-share',
      icon: Share2,
      label: 'Chia sẻ liên kết',
      onClick: () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          showNotification('Đã sao chép liên kết trang!');
        }
      }
    };
  };

  const upperAction = renderUpperAction();

  // Contextual Main Pill Actions
  interface ControlItem {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    shortcut?: string;
    isActive?: boolean;
    isHighlighted?: boolean;
    onClick: () => void;
  }

  const getTabControls = (): ControlItem[] => {
    if (isPhotosRoute) {
      return [
        {
          id: 'photo-import',
          icon: Plus,
          label: 'Nhập ảnh / Video (+)',
          shortcut: 'Ctrl+U',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('gallery-import');
          }
        },
        {
          id: 'photo-delete',
          icon: Trash2,
          label: 'Xoá phương tiện',
          shortcut: 'Del',
          onClick: () => {
            dispatchPageAction('gallery-delete');
          }
        },
        {
          id: 'photo-favorites',
          icon: Heart,
          label: 'Ảnh yêu thích',
          onClick: () => {
            dispatchPageAction('gallery-favorites');
          }
        },
        {
          id: 'photo-density',
          icon: Grid,
          label: 'Đổi cỡ lưới ảnh',
          onClick: () => {
            dispatchPageAction('gallery-density');
          }
        },
        {
          id: 'photo-search',
          icon: FluentSearchIcon,
          label: 'Tìm kiếm ảnh',
          shortcut: 'Ctrl+F',
          onClick: () => {
            dispatchPageAction('gallery-search');
          }
        }
      ];
    }

    if (isTvRoute) {
      return [
        {
          id: 'tv-channels',
          icon: Tv,
          label: 'Danh sách kênh TV',
          onClick: () => {
            dispatchPageAction('tv-toggle-channels');
            showNotification('Mở danh sách kênh');
          }
        },
        {
          id: 'tv-add-stream',
          icon: Plus,
          label: 'Thêm luồng phát (+)',
          isHighlighted: true,
          onClick: () => {
            if (onOpenAddStream) onOpenAddStream();
            else dispatchPageAction('tv-add-stream');
          }
        },
        {
          id: 'tv-schedule',
          icon: Calendar,
          label: 'Lịch phát sóng EPG',
          onClick: () => {
            navigate('/schedule');
          }
        },
        {
          id: 'tv-aspect',
          icon: Tv2,
          label: `Tỷ lệ ${settings.streamAspectRatio === '16:9' ? '4:3' : '16:9'}`,
          onClick: () => {
            const next = settings.streamAspectRatio === '16:9' ? '4:3' : '16:9';
            updateSetting('streamAspectRatio', next);
            showNotification(`Đã chuyển tỷ lệ sang ${next}`);
          }
        },
        {
          id: 'tv-audio-toggle',
          icon: Volume2,
          label: 'Bật/Tắt âm thanh',
          onClick: () => {
            dispatchPageAction('tv-toggle-mute');
          }
        }
      ];
    }

    if (isNewsRoute) {
      return [
        {
          id: 'news-tts',
          icon: Headphones,
          label: 'Đọc bằng AI (TTS)',
          isHighlighted: true,
          onClick: () => {
            if (onOpenTextToSpeech) onOpenTextToSpeech();
          }
        },
        {
          id: 'news-summarize',
          icon: Sparkles,
          label: 'Tóm tắt bài báo AI',
          onClick: () => {
            if (onOpenSummarize) onOpenSummarize();
          }
        },
        {
          id: 'news-find-words',
          icon: FluentSearchIcon,
          label: 'Tìm từ ngữ trong bài',
          shortcut: 'Ctrl+F',
          onClick: () => {
            if (onOpenFindWords) onOpenFindWords();
          }
        },
        {
          id: 'news-font-size',
          icon: Type,
          label: 'Chỉnh cỡ chữ đọc báo',
          onClick: () => {
            dispatchPageAction('news-toggle-fontsize');
            showNotification('Điều chỉnh cỡ chữ');
          }
        },
        {
          id: 'news-bookmarks',
          icon: Bookmark,
          label: 'Tin lưu trữ',
          onClick: () => {
            dispatchPageAction('news-bookmarks');
            showNotification('Tin đã lưu');
          }
        }
      ];
    }

    if (isNotesRoute) {
      return [
        {
          id: 'notes-new',
          icon: Plus,
          label: 'Tạo ghi chú mới (+)',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('notes-new');
            showNotification('Tạo ghi chú mới');
          }
        },
        {
          id: 'notes-export-pdf',
          icon: FileDown,
          label: 'Xuất định dạng PDF',
          onClick: () => {
            dispatchPageAction('notes-export-pdf');
          }
        },
        {
          id: 'notes-sticky',
          icon: StickyNote,
          label: 'Widget Sticky Note',
          onClick: () => {
            if (onToggleStickyNote) {
              onToggleStickyNote();
            } else {
              window.dispatchEvent(new CustomEvent('vone:toggle-sticky-note'));
            }
          }
        },
        {
          id: 'notes-search',
          icon: FluentSearchIcon,
          label: 'Tìm ghi chú',
          onClick: () => {
            dispatchPageAction('notes-search');
          }
        },
        {
          id: 'notes-delete',
          icon: Trash2,
          label: 'Xoá ghi chú này',
          onClick: () => {
            dispatchPageAction('notes-delete');
          }
        }
      ];
    }

    if (isClockRoute) {
      return [
        {
          id: 'clock-new-alarm',
          icon: Plus,
          label: 'Thêm báo thức mới (+)',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('clock-new-alarm');
            showNotification('Thêm báo thức mới');
          }
        },
        {
          id: 'clock-stopwatch',
          icon: Play,
          label: 'Bấm giờ Bắt đầu/Tạm dừng',
          onClick: () => {
            dispatchPageAction('clock-toggle-stopwatch');
          }
        },
        {
          id: 'clock-reset',
          icon: RotateCcw,
          label: 'Đặt lại đồng hồ bấm giờ',
          onClick: () => {
            dispatchPageAction('clock-reset-stopwatch');
          }
        },
        {
          id: 'clock-world',
          icon: Globe,
          label: 'Giờ quốc tế (World Clock)',
          onClick: () => {
            navigate('/world-clock');
          }
        },
        {
          id: 'clock-alarms',
          icon: Bell,
          label: 'Danh sách báo thức',
          onClick: () => {
            navigate('/alarm');
          }
        }
      ];
    }

    if (isBankRoute) {
      return [
        {
          id: 'bank-transfer',
          icon: ArrowUpRight,
          label: 'Chuyển khoản nhanh',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('bank-transfer');
            showNotification('Mở chuyển tiền nhanh');
          }
        },
        {
          id: 'bank-qr',
          icon: QrCode,
          label: 'Quét mã QR Pay',
          onClick: () => {
            dispatchPageAction('bank-scan-qr');
          }
        },
        {
          id: 'bank-cards',
          icon: CreditCard,
          label: 'Quản lý thẻ & Số dư',
          onClick: () => {
            dispatchPageAction('bank-cards');
          }
        },
        {
          id: 'bank-history',
          icon: History,
          label: 'Lịch sử giao dịch',
          onClick: () => {
            dispatchPageAction('bank-history');
          }
        },
        {
          id: 'bank-security',
          icon: Shield,
          label: 'Khoá thẻ / An toàn',
          onClick: () => {
            dispatchPageAction('bank-security');
            showNotification('Trạng thái bảo mật thẻ: An toàn');
          }
        }
      ];
    }

    if (isSocialRoute) {
      return [
        {
          id: 'social-new-post',
          icon: PlusSquare,
          label: 'Đăng bài viết mới (+)',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('social-new-post');
            showNotification('Tạo bài viết mới');
          }
        },
        {
          id: 'social-refresh',
          icon: RefreshCw,
          label: 'Làm mới bảng tin',
          onClick: () => {
            dispatchPageAction('social-refresh');
            showNotification('Bảng tin đã được làm mới');
          }
        },
        {
          id: 'social-friends',
          icon: Users,
          label: 'Danh sách bạn bè',
          onClick: () => {
            navigate('/friends');
          }
        },
        {
          id: 'social-messages',
          icon: MessageCircle,
          label: 'Tin nhắn / Chat',
          onClick: () => {
            dispatchPageAction('social-messages');
          }
        },
        {
          id: 'social-liked',
          icon: Heart,
          label: 'Bài viết đã thích',
          onClick: () => {
            dispatchPageAction('social-liked');
          }
        }
      ];
    }

    if (isPaintRoute) {
      return [
        {
          id: 'paint-brush',
          icon: Brush,
          label: 'Bút vẽ (Brush)',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('paint-brush');
            showNotification('Đã chọn Bút vẽ');
          }
        },
        {
          id: 'paint-eraser',
          icon: Eraser,
          label: 'Tẩy xoá (Eraser)',
          onClick: () => {
            dispatchPageAction('paint-eraser');
            showNotification('Đã chọn Tẩy xoá');
          }
        },
        {
          id: 'paint-palette',
          icon: Palette,
          label: 'Bảng màu sắc',
          onClick: () => {
            dispatchPageAction('paint-palette');
          }
        },
        {
          id: 'paint-undo',
          icon: RotateCcw,
          label: 'Hoàn tác nét vẽ',
          onClick: () => {
            dispatchPageAction('paint-undo');
          }
        },
        {
          id: 'paint-clear',
          icon: Trash2,
          label: 'Xoá toàn bộ khung vẽ',
          onClick: () => {
            dispatchPageAction('paint-clear');
          }
        }
      ];
    }

    if (isCameraRoute) {
      return [
        {
          id: 'camera-capture',
          icon: Camera,
          label: 'Chụp ảnh ngay',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('camera-snap');
          }
        },
        {
          id: 'camera-flip',
          icon: RefreshCw,
          label: 'Đổi máy ảnh Trước/Sau',
          onClick: () => {
            dispatchPageAction('camera-flip');
          }
        },
        {
          id: 'camera-timer',
          icon: Timer,
          label: 'Hẹn giờ chụp (3s / 10s)',
          onClick: () => {
            dispatchPageAction('camera-timer');
          }
        },
        {
          id: 'camera-filters',
          icon: Sliders,
          label: 'Bộ lọc màu sắc',
          onClick: () => {
            dispatchPageAction('camera-filters');
          }
        },
        {
          id: 'camera-gallery',
          icon: ImageIcon,
          label: 'Mở Thư viện ảnh',
          onClick: () => {
            navigate('/photos');
          }
        }
      ];
    }

    if (isVlcRoute) {
      return [
        {
          id: 'vlc-play',
          icon: Play,
          label: 'Phát / Tạm dừng',
          isHighlighted: true,
          onClick: () => {
            dispatchPageAction('vlc-toggle-play');
          }
        },
        {
          id: 'vlc-boost',
          icon: Volume2,
          label: 'Khuếch đại âm thanh 200%',
          onClick: () => {
            dispatchPageAction('vlc-audio-boost');
            showNotification('Khuếch đại âm lượng 200%');
          }
        },
        {
          id: 'vlc-snapshot',
          icon: Camera,
          label: 'Chụp ảnh màn hình video',
          onClick: () => {
            dispatchPageAction('vlc-snapshot');
            showNotification('Đã lưu ảnh chụp khung hình');
          }
        },
        {
          id: 'vlc-fullscreen',
          icon: Maximize,
          label: 'Toàn màn hình',
          onClick: () => {
            dispatchPageAction('vlc-fullscreen');
          }
        },
        {
          id: 'vlc-repeat',
          icon: Repeat,
          label: 'Lặp lại video',
          onClick: () => {
            dispatchPageAction('vlc-repeat');
          }
        }
      ];
    }

    if (isSettingsRoute) {
      return [
        {
          id: 'settings-theme',
          icon: settings.theme === 'light' ? Moon : Sun,
          label: `Chuyển sang ${settings.theme === 'light' ? 'Ban đêm (Dark)' : 'Ban ngày (Light)'}`,
          isHighlighted: true,
          onClick: () => {
            const next = settings.theme === 'light' ? 'dark' : 'light';
            updateSetting('theme', next);
            showNotification(`Đã chuyển giao diện sang ${next === 'light' ? 'Ban ngày' : 'Ban đêm'}`);
          }
        },
        {
          id: 'settings-glass',
          icon: Sparkles,
          label: `Spatial Glass: ${settings.spatialGlass ? 'Bật' : 'Tắt'}`,
          onClick: () => {
            const next = !settings.spatialGlass;
            updateSetting('spatialGlass', next);
            showNotification(`Spatial Glass: ${next ? 'Đang bật' : 'Đã tắt'}`);
          }
        },
        {
          id: 'settings-font',
          icon: Sliders,
          label: 'Cỡ chữ hệ thống',
          onClick: () => {
            const next = (settings.fontScale + 1) % 5;
            updateSetting('fontScale', next);
            showNotification(`Cỡ chữ hệ thống: mức ${next + 1}/5`);
          }
        },
        {
          id: 'settings-reset',
          icon: RotateCcw,
          label: 'Khôi phục cài đặt gốc',
          onClick: () => {
            if (confirm('Khôi phục toàn bộ cài đặt về mặc định?')) {
              localStorage.removeItem('waves_system_settings');
              window.location.reload();
            }
          }
        },
        {
          id: 'settings-help',
          icon: HelpCircle,
          label: 'Trợ giúp & Hướng dẫn',
          onClick: () => {
            if (onOpenHelp) onOpenHelp();
          }
        }
      ];
    }

    if (isHomeRoute) {
      return [
        {
          id: 'home-tv',
          icon: Tv,
          label: 'Mở Truyền hình Live TV',
          isHighlighted: true,
          onClick: () => {
            navigate('/live-tv');
          }
        },
        {
          id: 'home-news',
          icon: Newspaper,
          label: 'Mở Bản tin & Thời sự',
          onClick: () => {
            navigate('/news');
          }
        },
        {
          id: 'home-photos',
          icon: ImageIcon,
          label: 'Mở Thư viện Ảnh & Video',
          onClick: () => {
            navigate('/photos');
          }
        },
        {
          id: 'home-files',
          icon: Folder,
          label: 'Trình quản lý Tập tin',
          onClick: () => {
            navigate('/file-explorer');
          }
        },
        {
          id: 'home-search',
          icon: FluentSearchIcon,
          label: 'Tìm kiếm Spotlight (Cmd+K)',
          shortcut: 'Ctrl+K',
          onClick: () => {
            if (onOpenSpotlight) onOpenSpotlight();
          }
        }
      ];
    }

    // Default Fallback Contextual Controls
    return [
      {
        id: 'default-home',
        icon: Plus,
        label: 'Tác vụ mới (+)',
        isHighlighted: true,
        onClick: () => {
          showNotification('Tác vụ mới');
        }
      },
      {
        id: 'default-refresh',
        icon: RefreshCw,
        label: 'Làm mới nội dung',
        onClick: () => {
          window.location.reload();
        }
      },
      {
        id: 'default-help',
        icon: HelpCircle,
        label: 'Trợ giúp',
        onClick: () => {
          if (onOpenHelp) onOpenHelp();
        }
      },
      {
        id: 'default-fullscreen',
        icon: Maximize,
        label: 'Toàn màn hình',
        onClick: () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      },
      {
        id: 'default-search',
        icon: FluentSearchIcon,
        label: 'Tìm kiếm Spotlight',
        shortcut: 'Ctrl+K',
        onClick: () => {
          if (onOpenSpotlight) onOpenSpotlight();
        }
      }
    ];
  };

  const controls = getTabControls();

  // If collapsed, display an unobtrusive sleek handle tab at the right edge (Dạng pill)
  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none">
        <button
          id="sparkos-control-bar-handle"
          type="button"
          onClick={toggleCollapsed}
          title="Mở thanh điều khiển (Control bar)"
          style={{ 
            borderRadius: '9999px 0 0 9999px',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            borderRight: 'none',
            color: '#ffffff'
          }}
          className="group flex items-center justify-center w-8 h-14 shadow-lg transition-all hover:w-9"
        >
          <ChevronLeft 
            style={{ color: '#ffffff', stroke: '#ffffff' }}
            className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" 
          />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Control Bar Container */}
      <aside 
        id="sparkos-control-bar"
        aria-label="Tab Control Bar"
        className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-200"
      >
        {/* 1. White Clock in h:mm style, integer font (placed above go back button) */}
        <div
          title={`Thời gian: ${clockTime}`}
          className="control-bar-standalone-clock flex items-center justify-center shadow-md shadow-black/10 select-none px-2.5 py-1 text-white"
          style={{ 
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            color: '#ffffff'
          }}
        >
          <span 
            className="text-[12px] font-bold text-white tracking-wider tabular-nums font-mono select-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {clockTime}
          </span>
        </div>

        {/* 2. Collapse / Go back Toggle Circular Button with icon flipped (ChevronLeft) */}
        <button
          type="button"
          onClick={toggleCollapsed}
          title="Thu gọn thanh điều khiển"
          className="control-bar-standalone-circle aspect-square flex items-center justify-center shadow-md shadow-black/10 transition-transform active:scale-95 group relative"
          style={{ 
            borderRadius: '9999px',
            width: 40,
            height: 40,
            minWidth: 40,
            minHeight: 40,
            aspectRatio: '1 / 1',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            color: '#ffffff'
          }}
        >
          <ChevronLeft 
            style={{ color: '#ffffff', stroke: '#ffffff' }}
            className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" 
          />
          {/* Tooltip to the left (Dạng pill) */}
          <span 
            className="control-bar-pill-btn pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-white"
            style={{ 
              borderRadius: '9999px',
              background: 'rgba(20, 24, 30, 0.75)', 
              backdropFilter: 'blur(4px)', 
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              color: '#ffffff'
            }}
          >
            Thu gọn
          </span>
        </button>

        {/* 3. Circular Search Button (Moved to below Go back button) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSpotlight) {
              onOpenSpotlight();
            } else {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }
          }}
          title="Tìm kiếm Spotlight (Ctrl+K)"
          className="control-bar-standalone-circle aspect-square flex items-center justify-center shadow-md shadow-black/10 transition-transform active:scale-95 group relative"
          style={{ 
            borderRadius: '9999px',
            width: 40,
            height: 40,
            minWidth: 40,
            minHeight: 40,
            aspectRatio: '1 / 1',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            color: '#ffffff'
          }}
        >
          <FluentSearchIcon className="w-5 h-5" />
          {/* Tooltip to the left (Dạng pill) */}
          <span 
            className="control-bar-pill-btn pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-white"
            style={{ 
              borderRadius: '9999px',
              background: 'rgba(20, 24, 30, 0.75)', 
              backdropFilter: 'blur(4px)', 
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              color: '#ffffff'
            }}
          >
            Tìm kiếm (Ctrl+K)
          </span>
        </button>

        {/* 4. Upper Capsule: More Options (...) with flyout menu (Nút chia sẻ trang đã được xóa) */}
        <div 
          className="control-bar-capsule relative w-12 py-1.5 px-1 rounded-full shadow-lg shadow-black/10 flex flex-col items-center gap-1"
          style={{ 
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)'
          }}
        >
          {/* More Options Button (...) (Nút đơn dạng circle, mặc định bỏ nền) */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(prev => !prev)}
            title="Thêm tuỳ chọn"
            className={`control-bar-circle-btn relative group rounded-full aspect-square flex items-center justify-center transition-all active:scale-90 ${isMoreMenuOpen ? 'selected' : ''}`}
            style={{ 
              borderRadius: '9999px',
              width: 40,
              height: 40,
              minWidth: 40,
              minHeight: 40,
              aspectRatio: '1 / 1',
              background: isMoreMenuOpen ? 'rgba(255, 255, 255, 0.25)' : 'transparent', 
              border: isMoreMenuOpen ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
              color: '#ffffff'
            }}
          >
            <MoreHorizontal 
              style={{ color: '#ffffff', stroke: '#ffffff' }}
              className="w-5 h-5 transition-colors" 
            />
            {/* Tooltip to the left (Dạng pill) */}
            <span 
              className="control-bar-pill-btn pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-white"
              style={{ 
                borderRadius: '9999px',
                background: 'rgba(20, 24, 30, 0.75)', 
                backdropFilter: 'blur(4px)', 
                WebkitBackdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                color: '#ffffff'
              }}
            >
              Thêm tuỳ chọn...
            </span>
          </button>

          {/* More Options Flyout Menu (Có opacity và blur giống control bar) */}
          {isMoreMenuOpen && (
            <div 
              style={{ 
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.10)', 
                backdropFilter: 'blur(2px)', 
                WebkitBackdropFilter: 'blur(2px)',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                color: '#ffffff'
              }}
              className="control-bar-more-menu absolute right-full mr-3 top-2 w-60 p-2 shadow-2xl text-xs z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10">
                Menu tác vụ nhanh
              </div>

              {isPhotosRoute && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      dispatchPageAction('gallery-import');
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Plus style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Nhập ảnh & Video mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatchPageAction('gallery-delete');
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 style={{ color: '#f87171', stroke: '#f87171' }} className="w-5 h-5 shrink-0" />
                    <span>Bật chọn / Xoá ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatchPageAction('gallery-density');
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Grid style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Thay đổi kích thước lưới</span>
                  </button>
                </>
              )}

              {isTvRoute && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddStream) onOpenAddStream();
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Plus style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Thêm luồng URL m3u8</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/schedule');
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Calendar style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Xem lịch phát sóng EPG</span>
                  </button>
                </>
              )}

              {isNewsRoute && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTextToSpeech) onOpenTextToSpeech();
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Headphones style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Phát giọng đọc AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenSummarize) onOpenSummarize();
                      setIsMoreMenuOpen(false);
                    }}
                    className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
                  >
                    <Sparkles style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                    <span>Tóm tắt bài báo thông minh</span>
                  </button>
                </>
              )}

              {/* Universal shortcuts (Dạng pill) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSpotlight) onOpenSpotlight();
                  setIsMoreMenuOpen(false);
                }}
                className="control-bar-pill-btn flex items-center justify-between px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
              >
                <div className="flex items-center gap-2.5">
                  <FluentSearchIcon className="w-5 h-5 shrink-0" />
                  <span>Tìm kiếm Spotlight</span>
                </div>
                <kbd className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">Ctrl+K</kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/settings');
                  setIsMoreMenuOpen(false);
                }}
                className="control-bar-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full text-left transition-colors text-white hover:bg-white/15"
              >
                <Sliders style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-5 h-5 shrink-0" />
                <span>Cài đặt hệ thống</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Lower Long Capsule (Dạng pill, opacity 10%, blur 2px): Contextual Action Buttons - các nút đơn bên trong dạng circle, mặc định bỏ nền */}
        <div 
          className="control-bar-capsule relative w-12 py-2.5 px-1 rounded-full shadow-lg shadow-black/10 flex flex-col items-center gap-2"
          style={{ 
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.10)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)'
          }}
        >
          {controls.map((ctrl) => {
            const Icon = ctrl.icon;
            const isSelected = activeButtonId === ctrl.id || ctrl.isActive;

            return (
              <button
                key={ctrl.id}
                type="button"
                onClick={() => {
                  setActiveButtonId(ctrl.id);
                  ctrl.onClick();
                  setTimeout(() => setActiveButtonId(null), 300);
                }}
                className={`control-bar-circle-btn relative group rounded-full aspect-square flex items-center justify-center transition-all active:scale-90 ${isSelected ? 'selected' : ''}`}
                style={{ 
                  borderRadius: '9999px',
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  aspectRatio: '1 / 1',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'transparent', 
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
                  boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                  color: '#ffffff'
                }}
                title={ctrl.label}
              >
                <Icon 
                  style={{ color: '#ffffff', stroke: '#ffffff' }}
                  className="w-5 h-5 transition-colors" 
                />

                {/* Left Floating Tooltip (Dạng pill) */}
                <div 
                  className="control-bar-pill-btn pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-white"
                  style={{ 
                    borderRadius: '9999px',
                    background: 'rgba(20, 24, 30, 0.75)', 
                    backdropFilter: 'blur(4px)', 
                    WebkitBackdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    color: '#ffffff'
                  }}
                >
                  <span>{ctrl.label}</span>
                  {ctrl.shortcut && (
                    <kbd className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15 font-mono">
                      {ctrl.shortcut}
                    </kbd>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Floating Action Feedback Toast (Dạng pill) */}
      {toastMessage && (
        <div 
          className="control-bar-pill-btn fixed bottom-20 right-16 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-white"
          style={{ 
            borderRadius: '9999px',
            background: 'rgba(20, 24, 30, 0.75)', 
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            color: '#ffffff'
          }}
        >
          <Check style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
