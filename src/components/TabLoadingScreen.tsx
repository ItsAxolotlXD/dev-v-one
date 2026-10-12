import React from 'react';
import { 
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
  FluentPhotosColorIcon,
  FluentEdgeIcon,
  FluentCameraIcon
} from './FluentIcons';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ route = '', className = '' }) => {
  const getTabMeta = (r: string) => {
    const cleanRoute = (r || '').split('?')[0].split('#')[0];

    if (cleanRoute === '/edge' || cleanRoute === '/browser') {
      return {
        title: 'Microsoft Edge',
        icon: <FluentEdgeIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/copilot') {
      return {
        title: 'Copilot',
        icon: (
          <img
            src="https://upload.wikimedia.org/wikipedia/vi/a/aa/Microsoft_Copilot_Icon.svg"
            alt="Copilot"
            className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-contain drop-shadow-md select-none"
          />
        )
      };
    }

    if (cleanRoute === '/file-explorer' || cleanRoute === '/files') {
      return {
        title: 'File Explorer',
        icon: <FluentFileExplorerIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/live-tv' || cleanRoute === '/watch') {
      return {
        title: 'Watch & Live TV',
        icon: <FluentWatchIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/notes' || cleanRoute === '/write' || cleanRoute === '/present' || cleanRoute === '/table') {
      return {
        title: 'Notes',
        icon: <FluentNotesIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/gallery' || cleanRoute === '/photos') {
      return {
        title: 'Gallery',
        icon: <FluentPhotosColorIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/camera') {
      return {
        title: 'Camera',
        icon: <FluentCameraIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/paint' || cleanRoute === '/ms-paint') {
      return {
        title: 'Paint',
        icon: <FluentPaintIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/craftmine') {
      return {
        title: 'Craftmine',
        icon: <FluentCraftmineIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/task-manager') {
      return {
        title: 'Task Manager',
        icon: <FluentTaskManagerIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/widgets') {
      return {
        title: 'Widgets',
        icon: <FluentWidgetsIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/news' || cleanRoute.startsWith('/news/')) {
      return {
        title: 'Tin tức',
        icon: <FluentNewsIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/channels') {
      return {
        title: 'Kênh truyền hình',
        icon: <FluentLiveTvIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/favorites') {
      return {
        title: 'Kênh yêu thích',
        icon: <FluentWatchIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/settings') {
      return {
        title: 'Cài đặt',
        icon: <FluentSettingsIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/updates') {
      return {
        title: 'Cập nhật',
        icon: <FluentUpdatesIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    if (cleanRoute === '/search') {
      return {
        title: 'Tìm kiếm',
        icon: <FluentSearchIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
      };
    }

    return {
      title: 'V-One (Dev)',
      icon: <FluentHomeIcon className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-black dark:text-white drop-shadow-md select-none" />
    };
  };

  const meta = getTabMeta(route);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={meta.title}
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-12 select-none my-auto pointer-events-none ${className}`}
    >
      {/* Icon only: Không nền, không tên tab, không text đang tải, hiệu ứng zoom-in nhẹ */}
      <div className="flex items-center justify-center splash-icon-zoom-in">
        {meta.icon}
      </div>
    </div>
  );
};
