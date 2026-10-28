import { Channel } from '../types';

export interface RecallSnapshot {
  id: string;
  timestamp: number;
  timeFormatted: string;
  dateFormatted: string;
  relativeTime: string;
  type: 'search' | 'livetv' | 'article' | 'tab' | 'settings' | 'sparkos' | 'gallery' | 'notes' | 'paint' | 'ink';
  appName: string;
  appId?: string;
  appIcon?: string;
  title: string;
  subtitle?: string;
  durationText: string;
  badgeText: string;
  thumbnail: string;
  route: string;
  searchKeywords?: string;
}

const STORAGE_KEY = 'waves_recall_history';

// Helper for formatting time
function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

// Seed initial realistic snapshots matching the user screenshot
export const SEED_RECALL_SNAPSHOTS: RecallSnapshot[] = [
  {
    id: 'snap-store',
    timestamp: Date.now() - 2 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 2 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '2m ago',
    type: 'tab',
    appName: 'Microsoft Store',
    appId: 'store',
    appIcon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rwSh33P3L1Yzqgl0DKUj5mbVNzFKj1.png',
    title: 'Microsoft Store Preview',
    subtitle: 'Browse featured apps, games and media tools',
    durationText: 'You spent < 1m on this activity recently',
    badgeText: 'Microsoft Store',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    route: '/store',
    searchKeywords: 'store microsoft apps games minecraft'
  },
  {
    id: 'snap-paint',
    timestamp: Date.now() - 6 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 6 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '6m ago',
    type: 'paint',
    appName: 'Paint',
    appId: 'paint',
    appIcon: 'https://winaero.com/blog/wp-content/uploads/2020/04/colorful-fluent-Paint-3D-icon-big.png',
    title: 'Untitled - Paint',
    subtitle: 'Drawing canvas with brush and shape tools',
    durationText: 'You spent < 1m on this activity recently',
    badgeText: 'Untitled - Paint',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    route: '/ms-paint',
    searchKeywords: 'paint canvas draw ms paint'
  },
  {
    id: 'snap-outlook',
    timestamp: Date.now() - 15 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 15 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '15m ago',
    type: 'tab',
    appName: 'Outlook',
    appId: 'mail',
    appIcon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w08Tu7AUdI6LLJeWquYKJiNuuzCnVN.png',
    title: 'Mail - User Demo - Outlook',
    subtitle: 'Inbox: Lịch phát sóng trực tiếp ASIAD 2026',
    durationText: 'You spent < 1m on this activity...',
    badgeText: 'Mail - User Demo - Outlook',
    thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80',
    route: '/mail',
    searchKeywords: 'outlook mail inbox email asiad'
  },
  {
    id: 'snap-livetv-vtv1',
    timestamp: Date.now() - 35 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 35 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '35m ago',
    type: 'livetv',
    appName: 'Live TV',
    appId: 'live-tv',
    appIcon: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Movies%20and%20TV/SVG/ic_fluent_movies_and_tv_24_regular.svg',
    title: 'VTV1 HD - Thời sự 19h',
    subtitle: 'Xem truyền hình trực tiếp chuẩn độ nét cao',
    durationText: 'You spent 18m on this activity recently',
    badgeText: 'VTV1 HD - Live TV',
    thumbnail: '/banners/thoi_su_19h_hd.webp',
    route: '/live-tv?channel=vtv1',
    searchKeywords: 'live tv vtv1 thoi su 19h truyen hinh viet nam'
  },
  {
    id: 'snap-notes',
    timestamp: Date.now() - 65 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 65 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '1h ago',
    type: 'notes',
    appName: 'Notes',
    appId: 'notes',
    appIcon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/post-it-paper-sticky-notes-22390_256-Ck6XAzV1mJhbLfqUSd5fxMeOSMhq0B.png',
    title: 'Ghi chú công việc & Kế hoạch phát sóng',
    subtitle: 'Chỉnh sửa tài liệu và danh sách cần làm',
    durationText: 'You spent 12m on this activity recently',
    badgeText: 'Sticky Notes',
    thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    route: '/notes',
    searchKeywords: 'notes ghi chu documents ke hoach'
  },
  {
    id: 'snap-sparkos',
    timestamp: Date.now() - 110 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 110 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '1h ago',
  type: 'sparkos',
  appName: 'Core OS',
  appId: 'sparkos',
  appIcon: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Desktop/SVG/ic_fluent_desktop_24_regular.svg',
  title: 'Core OS Desktop Experience',
  subtitle: 'Windowed multi-tasking workspace with wallpaper',
  durationText: 'You spent 24m on this activity',
  badgeText: 'Core OS Session',
    thumbnail: '/sparkos-wallpaper.png',
    route: '/sparkos',
    searchKeywords: 'core os desktop windowed workspace he dieu hanh'
  },
  {
    id: 'snap-gallery',
    timestamp: Date.now() - 180 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 180 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '3h ago',
    type: 'gallery',
    appName: 'Gallery',
    appId: 'photos',
    appIcon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-photo-gallery-96-4tJhaieXrtShrMFtc7m5dgGWBP98BO.png',
    title: 'Ảnh chụp Chào Buổi Sáng VTV1',
    subtitle: 'Lưu trữ ảnh trong album Cảnh sắc Việt Nam',
    durationText: 'You spent 5m on this activity',
    badgeText: 'Gallery - Photos',
    thumbnail: '/banners/chao_buoi_sang_vtv1_2026.webp',
    route: '/photos',
    searchKeywords: 'gallery photos anh chup camera vtv1'
  },
  {
    id: 'snap-article',
    timestamp: Date.now() - 240 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 240 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '4h ago',
    type: 'article',
    appName: 'Articles',
    appId: 'news',
    appIcon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1cDnOYLe4OqU4bObf5RNScKEBnWTYu.png',
    title: 'Thị trường công nghệ đón nhận làn sóng AI thế hệ mới',
    subtitle: 'Tin tức thời sự công nghệ số VnExpress',
    durationText: 'You spent 8m on this activity',
    badgeText: 'Articles & News',
    thumbnail: '/banners/thoi_su_19h.webp',
    route: '/news',
    searchKeywords: 'article news tin tuc ai cong nghe'
  },
  {
    id: 'snap-search',
    timestamp: Date.now() - 320 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 320 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '5h ago',
    type: 'search',
    appName: 'Immersive Search',
    appId: 'search',
    appIcon: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Search/SVG/ic_fluent_search_48_regular.svg',
    title: 'Tìm kiếm: Lịch thi đấu thể thao ASIAD 2026',
    subtitle: 'Tra cứu thông tin kênh truyền hình trực tiếp',
    durationText: 'You spent 2m on this activity',
    badgeText: 'Spotlight Search',
    thumbnail: '/banners/asiad_2026.jpg',
    route: '/search?q=ASIAD%202026',
    searchKeywords: 'search tim kiem asiad the thao lich thi dau'
  },
  {
    id: 'snap-settings',
    timestamp: Date.now() - 400 * 60 * 1000,
    timeFormatted: formatTime(new Date(Date.now() - 400 * 60 * 1000)),
    dateFormatted: formatDate(new Date()),
    relativeTime: '6h ago',
    type: 'settings',
    appName: 'Settings',
    appId: 'settings',
    appIcon: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Windows_Settings_icon.svg/3840px-Windows_Settings_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
    title: 'Tùy chỉnh giao diện Fluent & Text Scaling',
    subtitle: 'Cài đặt chế độ tối và hiệu ứng Mica Glass',
    durationText: 'You spent 3m on this activity',
    badgeText: 'Settings',
    thumbnail: '/banners/vplay_background.webp',
    route: '/settings',
    searchKeywords: 'settings cai dat tuy chinh dark mode font scale'
  }
];

export function getRecallSnapshots(): RecallSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECALL_SNAPSHOTS));
      return SEED_RECALL_SNAPSHOTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        ...item,
        relativeTime: getRelativeTime(item.timestamp || Date.now())
      }));
    }
    return SEED_RECALL_SNAPSHOTS;
  } catch {
    return SEED_RECALL_SNAPSHOTS;
  }
}

export function logRecallActivity(entry: {
  type: RecallSnapshot['type'];
  appName: string;
  appId?: string;
  appIcon?: string;
  title: string;
  subtitle?: string;
  durationText?: string;
  badgeText?: string;
  thumbnail?: string;
  route: string;
  searchKeywords?: string;
}): void {
  try {
    const existing = getRecallSnapshots();
    const now = new Date();
    
    // Avoid spamming duplicate identical snapshots in a short span (< 10 seconds)
    const recentDuplicate = existing[0];
    if (recentDuplicate && recentDuplicate.route === entry.route && Date.now() - recentDuplicate.timestamp < 10000) {
      return;
    }

    const newSnapshot: RecallSnapshot = {
      id: `recall-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      timeFormatted: formatTime(now),
      dateFormatted: formatDate(now),
      relativeTime: 'Just now',
      type: entry.type,
      appName: entry.appName,
      appId: entry.appId,
      appIcon: entry.appIcon,
      title: entry.title,
      subtitle: entry.subtitle,
      durationText: entry.durationText || 'You spent < 1m on this activity recently',
      badgeText: entry.badgeText || entry.appName,
      thumbnail: entry.thumbnail || '/banners/vplay_background.webp',
      route: entry.route,
      searchKeywords: entry.searchKeywords || `${entry.appName} ${entry.title}`.toLowerCase()
    };

    const updated = [newSnapshot, ...existing.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event so Recall page reacts in real-time
    window.dispatchEvent(new CustomEvent('vone:recall-updated', { detail: newSnapshot }));
  } catch (err) {
    console.warn('[Recall] Error logging activity:', err);
  }
}

export function deleteRecallSnapshot(id: string): void {
  try {
    const existing = getRecallSnapshots();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vone:recall-updated'));
  } catch {}
}

export function clearRecallHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('vone:recall-updated'));
  } catch {}
}
