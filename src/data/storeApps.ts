import type { AppTabIconName } from '../components/FluentIcons';

export type StoreAppIcon = AppTabIconName | 'mail' | 'calendar' | 'craftmine' | 'photopea';

export interface StoreApp {
  id: string;
  name: string;
  publisher: string;
  category: 'Productivity' | 'Social' | 'Entertainment' | 'Creativity' | 'Utilities';
  description: string;
  rating: string;
  size: string;
  icon: StoreAppIcon;
  route: string;
  aliases: string[];
  accent: string;
  featured?: boolean;
}

export const STORE_APPS: StoreApp[] = [
  { id: 'mail', name: 'Mail', publisher: 'Microsoft', category: 'Productivity', description: 'Keep all your messages together and stay on top of what matters.', rating: '4.7', size: '24 MB', icon: 'mail', route: '/mail', aliases: ['/mail'], accent: '#1473d2', featured: true },
  { id: 'calendar', name: 'Calendar', publisher: 'Microsoft', category: 'Productivity', description: 'Plan your day, manage events, and keep every date in view.', rating: '4.6', size: '18 MB', icon: 'calendar', route: '/calendar', aliases: ['/calendar'], accent: '#4d8cf5' },
  { id: 'swift-bank', name: 'Swift Bank', publisher: 'Sparkle', category: 'Utilities', description: 'A friendly digital banking experience for your everyday money.', rating: '4.8', size: '32 MB', icon: 'bank', route: '/swift-bank', aliases: ['/swift-bank', '/bank', '/swiftbank'], accent: '#00a88f' },
  { id: 'swift-social', name: 'Swift Social', publisher: 'Sparkle', category: 'Social', description: 'Catch up with your communities and share what is happening.', rating: '4.5', size: '48 MB', icon: 'social', route: '/swift', aliases: ['/swift', '/swift-social', '/social'], accent: '#7b61ff', featured: true },
  { id: 'people', name: 'People', publisher: 'Sparkle', category: 'Social', description: 'Keep up with friends and see who is around.', rating: '4.4', size: '21 MB', icon: 'people', route: '/friends', aliases: ['/friends', '/ban-be'], accent: '#e44f91' },
  { id: 'edge', name: 'Microsoft Edge', publisher: 'Microsoft', category: 'Utilities', description: 'Browse the web with a fast, familiar browser experience.', rating: '4.8', size: '86 MB', icon: 'edge', route: '/edge', aliases: ['/edge', '/browser'], accent: '#0aa6a6', featured: true },
  { id: 'watch', name: 'Watch', publisher: 'Sparkle', category: 'Entertainment', description: 'Explore live channels and jump into the latest broadcasts.', rating: '4.6', size: '42 MB', icon: 'watch', route: '/live-tv', aliases: ['/live-tv'], accent: '#e74235' },
  { id: 'fandom', name: 'Fandom', publisher: 'Sparkle', category: 'Entertainment', description: 'Discover stories, brands, and the worlds fans love.', rating: '4.5', size: '27 MB', icon: 'articles', route: '/logos-fandom', aliases: ['/logos-fandom', '/logos-wiki', '/fandom'], accent: '#7348ce' },
  { id: 'wiki', name: 'Minecraft Wiki', publisher: 'Sparkle', category: 'Entertainment', description: 'A handy encyclopedia for blocks, crafting, and adventures.', rating: '4.7', size: '29 MB', icon: 'craftmine', route: '/minecraft-wiki', aliases: ['/minecraft-wiki', '/mc-wiki', '/wiki'], accent: '#63a53b' },
  { id: 'notes', name: 'Notes', publisher: 'Microsoft', category: 'Productivity', description: 'Capture quick thoughts, lists, and ideas in one place.', rating: '4.6', size: '15 MB', icon: 'notes', route: '/notes', aliases: ['/notes', '/write', '/present', '/table'], accent: '#e7b930' },
  { id: 'gallery', name: 'Gallery', publisher: 'Microsoft', category: 'Creativity', description: 'Browse your favorite moments and collections.', rating: '4.7', size: '36 MB', icon: 'gallery', route: '/photos', aliases: ['/photos', '/gallery'], accent: '#4d88e8' },
  { id: 'camera', name: 'Camera', publisher: 'Microsoft', category: 'Creativity', description: 'Take a quick photo or capture a moment from your camera.', rating: '4.3', size: '22 MB', icon: 'camera', route: '/camera', aliases: ['/camera'], accent: '#1889c9' },
  { id: 'paint', name: 'Paint', publisher: 'Microsoft', category: 'Creativity', description: 'Sketch, color, and bring simple ideas to life.', rating: '4.6', size: '31 MB', icon: 'paint', route: '/ms-paint', aliases: ['/ms-paint', '/paint'], accent: '#e36b38' },
  { id: 'ink-canvas', name: 'Ink Canvas', publisher: 'Sparkle', category: 'Creativity', description: 'Make room for freeform notes, drawings, and inspiration.', rating: '4.5', size: '19 MB', icon: 'inkCanvas', route: '/ink-space', aliases: ['/ink-space', '/inkspace', '/ink-canvas', '/inkcanvas'], accent: '#7966d9' },
  { id: 'calculator', name: 'Calculator', publisher: 'Microsoft', category: 'Utilities', description: 'A versatile calculator for everyday and scientific work.', rating: '4.8', size: '12 MB', icon: 'calculator', route: '/calculator', aliases: ['/calculator', '/calc'], accent: '#3276c7' },
  { id: 'snipping-tool', name: 'Snipping Tool', publisher: 'Microsoft', category: 'Utilities', description: 'Capture, crop, and share a quick screenshot.', rating: '4.5', size: '17 MB', icon: 'snippingTool', route: '/snipping-tool', aliases: ['/snipping-tool', '/snip', '/snipping'], accent: '#338b9b' },
  { id: 'craftmine', name: 'Craftmine', publisher: 'Sparkle', category: 'Entertainment', description: 'Explore a creative block-built world and make it your own.', rating: '4.7', size: '64 MB', icon: 'craftmine', route: '/craftmine', aliases: ['/craftmine'], accent: '#51a24a', featured: true },
  { id: 'photopea', name: 'Photopea', publisher: 'Photopea', category: 'Creativity', description: 'Edit images and layered designs right in your browser.', rating: '4.8', size: '38 MB', icon: 'photopea', route: '/photopea', aliases: ['/photopea', '/photoshop'], accent: '#2785c7' },
];

export function getStoreAppForRoute(path: string): StoreApp | undefined {
  const pathname = path.split('?')[0].split('#')[0];
  return STORE_APPS.find((app) => app.aliases.includes(pathname));
}
