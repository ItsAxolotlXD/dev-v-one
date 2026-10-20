import React from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { AppTabIcon } from '../components/FluentIcons';
import { Channel } from '../types';

interface XAMLHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNavigate: (route: string) => void;
}

const quickAccess = [
  { label: 'Home', route: '/', icon: 'home' as const },
  { label: 'Articles', route: '/news', icon: 'articles' as const },
  { label: 'Updates', route: '/updates', icon: 'updates' as const },
  { label: 'Widgets', route: '/widgets', icon: 'widgets' as const },
  { label: 'Store', route: '/store', icon: 'store' as const },
  { label: 'SparkOS', route: '/sparkos', icon: 'sparkos' as const },
];

export const XAMLHome: React.FC<XAMLHomeProps> = ({ channels, onSelectChannel, onNavigate }) => {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-1 pb-10 text-[#e8e8e8] font-sans">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-1 py-1 text-[13px] font-normal">
          <ChevronDown className="size-3 text-[#bdbdbd]" />
          <span>Quick access</span>
        </div>

        <div className="flex flex-col">
          {quickAccess.map(({ label, route, icon }) => (
            <button key={label} type="button" onClick={() => onNavigate(route)} className="grid min-h-9 cursor-default grid-cols-[1fr_155px] items-center px-1 text-left text-[13px] hover:bg-[#111111]">
              <div className="flex items-center gap-2">
                <AppTabIcon name={icon} className="size-4 shrink-0" />
                <span>{label}</span>
              </div>
              <span className="text-[#777]">App</span>
            </button>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[13px]">
          <ChevronDown className="size-3 text-[#bdbdbd]" />
          <span>Favorites</span>
        </div>
        <div className="flex min-h-8 items-center gap-2 px-1 text-[13px]">
          <Folder className="size-4 text-[#8d8d8d]" strokeWidth={1.5} />
          <span className="text-[#dedede]">No Items</span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-[13px]">
          <ChevronRight className="size-3 text-[#bdbdbd]" />
          <span>Recent</span>
        </div>

        <div className="mt-5 border-t border-[#202020] pt-3">
          <div className="mb-1 flex items-center gap-1 text-[13px]">
            <ChevronDown className="size-3 text-[#bdbdbd]" />
            <span>Live channels</span>
            <span className="ml-1 text-[11px] text-[#777]">{channels.length}</span>
          </div>
          <div className="flex flex-col">
            {channels.map((channel) => (
              <button key={channel.id} type="button" onClick={() => onSelectChannel(channel)} className="grid min-h-11 cursor-default grid-cols-[34px_1fr_155px] items-center gap-1 px-1 text-left text-[13px] hover:bg-[#171717]">
                <span className="flex size-7 items-center justify-center">
                  <img src={channel.logo} alt="" className="max-h-6 max-w-7 object-contain" referrerPolicy="no-referrer" />
                </span>
                <span className="truncate text-[#ededed]">{channel.name}</span>
                <span className="truncate text-[#8f8f8f]">{channel.currentProgram?.title || channel.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
