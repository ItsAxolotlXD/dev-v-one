import React from 'react';

const MAIL_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w08Tu7AUdI6LLJeWquYKJiNuuzCnVN.png';
const CALENDAR_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EOTmadFpTcD8ViTHEiYhPMCbFvwgFn.png';

type ProductivityTabProps = { kind: 'mail' | 'calendar' };

export function ProductivityTab({ kind }: ProductivityTabProps) {
  const isMail = kind === 'mail';
  const title = isMail ? 'Mail' : 'Calendar';
  const description = isMail ? 'Your messages and inbox will appear here.' : 'Your schedule and upcoming events will appear here.';
  const icon = isMail ? MAIL_ICON : CALENDAR_ICON;

  return (
    <main className="min-h-full flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-[24px] border border-white/10 bg-white/70 dark:bg-[#282c31]/80 backdrop-blur-xl p-8 text-center shadow-xl">
        <img src={icon} alt="" className="mx-auto size-20 object-contain" />
        <h1 className="mt-5 text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      </section>
    </main>
  );
}
