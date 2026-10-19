import React from 'react';
import { 
  AppTabIcon,
  FluentHomeIcon, 
  FluentWatchIcon,
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentNotesIcon, 
  FluentSearchIcon,
  FluentSettingsIcon,
  FluentCraftmineIcon,
  FluentUpdatesIcon,
  FluentTaskManagerIcon,
  FluentWidgetsIcon,
  FluentFileExplorerIcon,
  FluentPaintIcon,
  FluentPhotosIcon,
  FluentEdgeIcon,
  FluentCameraIcon,
  FluentSwiftBankIcon,
  FluentClockIcon,
  FluentVlcIcon,
  FluentPhotopeaIcon,
  FluentScheduleIcon,
  FluentCookbookIcon,
  FluentSwiftSocialIcon,
  FluentFriendsIcon,
  FluentLogosFandomIcon,
  FluentMinecraftWikiIcon,
  FluentCalculatorIcon,
  FluentSnippingToolIcon,
  FluentFeedbackHubIcon
} from './FluentIcons';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ route = '', className = '' }) => {
  const getTabMeta = (r: string) => {
    const cleanRoute = (r || '').split('?')[0].split('#')[0];
    const iconClass = "w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-neutral-800 dark:text-neutral-100 drop-shadow-sm select-none splash-icon-zoom-in";

    if (cleanRoute === '/edge' || cleanRoute === '/browser') {
      return {
        title: 'Microsoft Edge',
        icon: <AppTabIcon name="edge" className={iconClass} />
      };
    }

    if (cleanRoute === '/copilot') {
      return {
        title: 'Copilot',
        icon: (
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sWuIr1HhLnODRgmQp2xPwRYP3JmvRu.png"
            alt="Copilot"
            className={`${iconClass} object-contain`}
          />
        )
      };
    }

    if (cleanRoute === '/file-explorer' || cleanRoute === '/files') {
      return {
        title: 'File Explorer',
        icon: <AppTabIcon name="fileExplorer" className={iconClass} />
      };
    }

    if (cleanRoute === '/live-tv' || cleanRoute === '/watch') {
      return {
        title: 'Watch & Live TV',
        icon: <AppTabIcon name="watch" className={iconClass} />
      };
    }

    if (cleanRoute === '/notes' || cleanRoute === '/write' || cleanRoute === '/present' || cleanRoute === '/table') {
      return {
        title: 'Notes',
        icon: <AppTabIcon name="notes" className={iconClass} />
      };
    }

    if (cleanRoute === '/gallery' || cleanRoute === '/photos') {
      return {
        title: 'Gallery',
        icon: <AppTabIcon name="gallery" className={iconClass} />
      };
    }

    if (cleanRoute === '/camera') {
      return {
        title: 'Camera',
        icon: <AppTabIcon name="camera" className={iconClass} />
      };
    }

    if (cleanRoute === '/paint' || cleanRoute === '/ms-paint') {
      return {
        title: 'Paint',
        icon: <AppTabIcon name="paint" className={iconClass} />
      };
    }

    if (cleanRoute === '/ink-space' || cleanRoute === '/inkspace' || cleanRoute === '/ink-canvas' || cleanRoute === '/inkcanvas') {
      return {
        title: 'Ink Canvas',
        icon: <AppTabIcon name="inkCanvas" className={iconClass} />
      };
    }

    if (cleanRoute === '/swift-bank' || cleanRoute === '/bank' || cleanRoute === '/swiftbank') {
      return {
        title: 'Swift Bank',
        icon: <AppTabIcon name="bank" className={iconClass} />
      };
    }

    if (cleanRoute === '/vlc' || cleanRoute === '/vlc-player' || cleanRoute === '/media-player') {
      return {
        title: 'VLC Media Player',
        icon: <FluentVlcIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/photopea' || cleanRoute === '/photoshop') {
      return {
        title: 'Photopea',
        icon: <FluentPhotopeaIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/logos-fandom' || cleanRoute === '/logos-wiki' || cleanRoute === '/fandom') {
      return {
        title: 'Logos Fandom',
        icon: <FluentLogosFandomIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/calculator' || cleanRoute === '/calc') {
      return {
        title: 'Calculator',
        icon: <AppTabIcon name="calculator" className={iconClass} />
      };
    }

    if (cleanRoute === '/snipping-tool' || cleanRoute === '/snip' || cleanRoute === '/snipping') {
      return {
        title: 'Snipping Tool',
        icon: <AppTabIcon name="snippingTool" className={iconClass} />
      };
    }

    if (cleanRoute === '/feedback-hub' || cleanRoute === '/feedback') {
      return {
        title: 'Feedback Hub',
        icon: <AppTabIcon name="feedback" className={iconClass} />
      };
    }

    if (cleanRoute === '/minecraft-wiki' || cleanRoute === '/mc-wiki' || cleanRoute === '/wiki') {
      return {
        title: 'Minecraft Wiki',
        icon: <FluentMinecraftWikiIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/schedule' || cleanRoute === '/tv-guide' || cleanRoute === '/epg' || cleanRoute === '/lich-phat-song') {
      return {
        title: 'Lịch phát sóng',
        icon: <FluentScheduleIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/cookbook' || cleanRoute === '/recipes' || cleanRoute === '/nau-an') {
      return {
        title: 'Cookbook',
        icon: <FluentCookbookIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/swift' || cleanRoute === '/swift-social' || cleanRoute === '/social') {
      return {
        title: 'Swift Social',
        icon: <AppTabIcon name="social" className={iconClass} />
      };
    }

    if (cleanRoute === '/friends' || cleanRoute === '/ban-be') {
      return {
        title: 'Bạn bè & Cộng đồng',
        icon: <AppTabIcon name="people" className={iconClass} />
      };
    }

    if (cleanRoute === '/craftmine') {
      return {
        title: 'Craftmine',
        icon: <FluentCraftmineIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/task-manager') {
      return {
        title: 'Task Manager',
        icon: <AppTabIcon name="taskManager" className={iconClass} />
      };
    }

    if (cleanRoute === '/widgets') {
      return {
        title: 'Widgets',
        icon: <AppTabIcon name="widgets" className={iconClass} />
      };
    }

    if (cleanRoute === '/news' || cleanRoute.startsWith('/news/')) {
      return {
        title: 'Tin tức',
        icon: <AppTabIcon name="articles" className={iconClass} />
      };
    }

    if (cleanRoute === '/channels') {
      return {
        title: 'Kênh truyền hình',
        icon: <FluentLiveTvIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/favorites') {
      return {
        title: 'Kênh yêu thích',
        icon: <AppTabIcon name="watch" className={iconClass} />
      };
    }

    if (cleanRoute === '/settings') {
      return {
        title: 'Cài đặt',
        icon: <AppTabIcon name="settings" className={iconClass} />
      };
    }

    if (cleanRoute === '/updates') {
      return {
        title: 'Cập nhật',
        icon: <AppTabIcon name="updates" className={iconClass} />
      };
    }

    if (cleanRoute === '/search') {
      return {
        title: 'Tìm kiếm',
        icon: <FluentSearchIcon className={iconClass} />
      };
    }

    if (cleanRoute === '/clock' || cleanRoute === '/alarm' || cleanRoute === '/timer' || cleanRoute === '/stopwatch') {
      return {
        title: 'Clock',
        icon: <FluentClockIcon className={iconClass} />
      };
    }

    return {
      title: 'Sparkle (Dev)',
      icon: <AppTabIcon name="home" className={iconClass} />
    };
  };

  const meta = getTabMeta(route);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={meta.title}
      className={`w-full h-full flex-1 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-12 select-none my-auto pointer-events-none bg-[#f3f4f6] dark:bg-[#202024] text-neutral-800 dark:text-neutral-100 rounded-tl-[10px] ${className}`}
    >
      {/* Icon outline with smooth zoom animation on neutral gray background */}
      <div className="flex items-center justify-center">
        {meta.icon}
      </div>
    </div>
  );
};
