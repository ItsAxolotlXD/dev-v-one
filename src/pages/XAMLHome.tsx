import React from 'react';
import { ChevronRight, ChevronDown, Folder, Monitor, Download, FileText, Image, Music, Film } from 'lucide-react';
import { Channel } from '../types';

interface XAMLHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

const quickAccess = [
  { label: 'Desktop', icon: Monitor, color: 'text-cyan-400', date: '3/26/2023 10:35 AM' },
  { label: 'Downloads', icon: Download, color: 'text-emerald-400', date: '3/3/2023 8:57 AM' },
  { label: 'Documents', icon: FileText, color: 'text-slate-300', date: '3/23/2023 3:06 PM', selected: true },
  { label: 'Pictures', icon: Image, color: 'text-sky-400', date: '3/31/2023 7:29 AM' },
  { label: 'Music', icon: Music, color: 'text-rose-300', date: '2/25/2023 1:54 PM' },
  { label: 'Videos', icon: Film, color: 'text-purple-400', date: '2/2/2023 11:46 AM' },
];

export const XAMLHome: React.FC<XAMLHomeProps> = ({ channels, onSelectChannel }) => {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-1 pb-10 text-[#e8e8e8] font-sans">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-1 py-1 text-[13px] font-normal">
          <ChevronDown className="size-3 text-[#bdbdbd]" />
          <span>Quick access</span>
        </div>

        <div className="flex flex-col">
          {quickAccess.map(({ label, icon: Icon, color, date, selected }) => (
            <div key={label} className={`grid min-h-9 grid-cols-[1fr_155px] items-center px-1 text-[13px] ${selected ? 'bg-[#171717]' : 'hover:bg-[#111111]'}`}>
              <div className="flex items-center gap-2">
                <Icon className={`size-4 ${color}`} strokeWidth={1.5} />
                <span>{label}</span>
              </div>
              <span className="text-[#d0d0d0]">{date}</span>
            </div>
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
              <button key={channel.id} type="button" onClick={() => onSelectChannel(channel)} className="grid min-h-11 grid-cols-[34px_1fr_155px] items-center gap-1 border-b border-[#111] px-1 text-left text-[13px] hover:bg-[#171717]">
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
