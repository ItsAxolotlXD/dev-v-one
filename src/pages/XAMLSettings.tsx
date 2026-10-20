import React from 'react';
import { Settings } from './Settings';

interface XAMLSettingsProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenUpdate?: () => void;
  onOpenOfficeTool?: (tool: string) => void;
}

export const XAMLSettings: React.FC<XAMLSettingsProps> = (props) => (
  <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-1 pb-10 font-sans text-[#e8e8e8]">
    <div className="mx-auto w-full max-w-5xl [&_h1]:text-[#e8e8e8] [&_p]:text-[#9a9a9a] [&_input]:border-[#2a2a2a] [&_input]:bg-[#111111] [&_input]:text-[#e8e8e8]">
      <Settings {...props} />
    </div>
  </section>
);
