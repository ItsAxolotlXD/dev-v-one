import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Globe, Monitor, Plane, ShieldCheck, UserRound, Wifi } from 'lucide-react';

const setupStorageKey = 'sparkos-oobe-profile';
export const sparkOSResetOobeEvent = 'sparkos:reset-oobe';

export function resetSparkOSSetup(): void {
  try {
    window.localStorage.removeItem(setupStorageKey);
  } catch {
    // Keep reset usable when browser storage is unavailable.
  }
}
const regions = ['Australia', 'Canada', 'France', 'Germany', 'Japan', 'Singapore', 'United Kingdom', 'United States', 'Vietnam'];
const setupSteps = ['Region', 'Keyboard', 'Network', 'Account', 'Device name', 'Experience', 'Privacy', 'Ready'];
const experiences = [
  { name: 'Personal', detail: 'Everyday browsing, communication, and entertainment.' },
  { name: 'School', detail: 'Study, research, and stay organized.' },
  { name: 'Work', detail: 'Focus on collaboration and productivity.' },
  { name: 'Gaming', detail: 'Make room for games and streaming.' },
];

interface SparkOSBootSetupProps {
  onComplete: () => void;
}

export function hasSparkOSSetup(): boolean {
  try {
    return Boolean(window.localStorage.getItem(setupStorageKey));
  } catch {
    return false;
  }
}

export function SparkOSBootScreen() {
  return (
    <main aria-label="SparkOS starting" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#05070b] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(21,40,74,.38),transparent_50%)]" />
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative flex flex-col items-center gap-10">
        <div aria-hidden="true" className="grid size-12 grid-cols-2 gap-[3px]">
          <span className="bg-[#5bb9ff]" /><span className="bg-[#2d9cf2]" /><span className="bg-[#2d9cf2]" /><span className="bg-[#1685dc]" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[13px] font-medium tracking-[0.24em] text-white/80">SPARKOS</p>
          <div aria-label="Loading" role="status" className="flex h-6 items-center gap-1.5">
            {Array.from({ length: 5 }, (_, index) => (
              <motion.span key={index} className="size-1.5 rounded-full bg-white/70" animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: index * 0.12 }} />
            ))}
            <span className="sr-only">Starting SparkOS</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export function SparkOSBootSetup({ onComplete }: SparkOSBootSetupProps) {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState('United States');
  const [keyboard, setKeyboard] = useState('US');
  const [network, setNetwork] = useState('Connect later');
  const [userName, setUserName] = useState('Alex');
  const [deviceName, setDeviceName] = useState('SparkOS-PC');
  const [experience, setExperience] = useState('Personal');
  const [privacy, setPrivacy] = useState({ location: true, diagnostics: true, tailored: false });

  useEffect(() => {
    if (step === 3) document.getElementById('sparkos-account-name')?.focus();
    if (step === 4) document.getElementById('sparkos-device-name')?.focus();
  }, [step]);

  const finishSetup = () => {
    try {
      window.localStorage.setItem(setupStorageKey, JSON.stringify({ region, keyboard, network, userName: userName.trim(), deviceName: deviceName.trim(), experience, privacy }));
    } catch {
      // Keep the setup usable when browser storage is unavailable.
    }
    onComplete();
  };

  const continueSetup = () => {
    if (step < setupSteps.length - 1) setStep((current) => current + 1);
    else finishSetup();
  };

  return (
    <main aria-label="SparkOS first-run setup" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#8fa8ce] p-3 text-[#17191d] sm:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(145,204,237,.9),transparent_45%),radial-gradient(ellipse_at_85%_85%,rgba(178,207,231,.9),transparent_44%),linear-gradient(135deg,#8eb5d4,#95a3c5)]" />
      <motion.section initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="relative grid h-[min(720px,calc(100dvh-24px))] w-full max-w-[1450px] grid-cols-1 overflow-hidden rounded-[18px] bg-[#f8faff]/95 shadow-[0_28px_80px_rgba(31,55,91,.24)] sm:h-[min(780px,calc(100dvh-48px))] sm:rounded-[22px] lg:grid-cols-[0.82fr_1.18fr]">
        <aside aria-hidden="true" className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4f8ff] via-[#edf4ff] to-[#e6f0ff] lg:flex">
          <div className="absolute left-[16%] top-[18%] size-64 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-[16%] right-[8%] size-56 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="relative flex h-[420px] w-[390px] items-center justify-center">
            <div className="absolute left-[48px] top-[34px] flex size-[230px] items-center justify-center rounded-full border-[13px] border-[#f5b51b] bg-[#d5edff] shadow-[0_18px_36px_rgba(45,108,165,.15)]">
              <div className="absolute inset-[9px] overflow-hidden rounded-full bg-[#b5dcf5]">
                <Globe aria-hidden="true" className="size-full stroke-[1.2] text-[#2876b8]" />
              </div>
              <span className="absolute -right-3 top-7 h-3 w-12 rotate-[-32deg] rounded-full bg-[#f5b51b]" />
              <span className="absolute -bottom-2 left-8 h-3 w-16 rotate-[32deg] rounded-full bg-[#f5b51b]" />
            </div>
            <div className="absolute bottom-[48px] left-[28px] flex h-[74px] w-[235px] flex-col justify-center gap-2 rounded-[22px] border-[9px] border-[#d6d8dc] bg-white px-4 shadow-md">
              <span className="h-1.5 rounded-full bg-[#e8e9ec]" /><span className="h-1.5 w-4/5 rounded-full bg-[#e8e9ec]" />
            </div>
            <div className="absolute bottom-[29px] left-[12px] h-3 w-[270px] rounded-full bg-[#f6d36c]" />
            <div className="absolute bottom-[18px] left-[16px] h-2 w-[266px] rounded-full bg-[#fff0bb]" />
            <div className="absolute right-[28px] top-[70px] -rotate-[10deg] text-[#d8d9db] drop-shadow-md"><Plane aria-hidden="true" className="size-[108px] fill-current stroke-white stroke-[1.3]" /></div>
            <div className="absolute bottom-[35px] right-[4px] flex h-[126px] w-[136px] items-center justify-center rounded-[14px] border-[8px] border-[#f4ce57] bg-gradient-to-br from-[#258bd1] to-[#0866a8] shadow-[0_18px_30px_rgba(27,91,145,.18)]">
              <BookOpen aria-hidden="true" className="size-[70px] rotate-[-8deg] text-white/90" />
              <span className="absolute -top-6 left-1/2 h-7 w-[64px] -translate-x-1/2 rounded-t-[6px] border-[7px] border-b-0 border-[#f4ce57]" />
            </div>
            <span className="absolute left-2 top-[245px] size-2 rounded-full bg-[#d1d8e3]" />
            <span className="absolute right-[2px] top-[270px] size-2 rounded-full bg-[#d1d8e3]" />
          </div>
        </aside>

        <div className="flex min-h-0 flex-col px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8 xl:px-14 xl:pb-10 xl:pt-12">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="grid size-6 grid-cols-2 gap-[2px]"><i className="bg-[#54aef0]" /><i className="bg-[#3297e2]" /><i className="bg-[#3297e2]" /><i className="bg-[#1378c5]" /></span>
              <span className="text-[12px] font-semibold tracking-[0.15em] text-[#4a5664]">SPARKOS</span>
            </div>
            <span className="text-[11px] text-[#737d89]">Step {step + 1} of {setupSteps.length}</span>
          </div>

          <div className="mb-5 flex gap-1.5" aria-label="Setup progress">
            {setupSteps.map((label, index) => <span key={label} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-[#087bd1]' : 'bg-[#dce3ec]'}`} />)}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                {step === 0 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Let&apos;s get started</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em] text-[#17191d]">Is this the right country or region?</h1>
                    <p className="mb-4 max-w-lg text-[13px] leading-5 text-[#697481]">Your region helps SparkOS set the right language, time, and local preferences.</p>
                    <div role="radiogroup" aria-label="Country or region" className="max-h-[min(36dvh,290px)] overflow-y-auto rounded-lg border border-[#dce2e9] bg-white/70 p-1.5">
                      {regions.map((item) => (
                        <button key={item} role="radio" aria-checked={region === item} type="button" onClick={() => setRegion(item)} className={`flex min-h-10 w-full items-center justify-between rounded-md px-3.5 text-left text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] ${region === item ? 'bg-[#087bd1] text-white shadow-sm' : 'text-[#262d35] hover:bg-[#eaf3fb]'}`}>
                          {item}{region === item && <Check aria-hidden="true" className="size-4" />}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {step === 1 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Typing experience</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em]">Is this the right keyboard layout?</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">Choose the keyboard layout you use. You can add another one later in Settings.</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {['US', 'United Kingdom', 'Vietnamese'].map((layout) => (
                        <button key={layout} type="button" onClick={() => setKeyboard(layout)} aria-pressed={keyboard === layout} className={`flex min-h-[72px] items-center justify-between rounded-xl border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] ${keyboard === layout ? 'border-[#087bd1] bg-[#e9f4ff]' : 'border-[#dce2e9] bg-white/70 hover:bg-white'}`}>
                          <span><span className="block text-[15px] font-medium text-[#20252b]">{layout}</span><span className="mt-1 block text-[11px] text-[#75808d]">{layout === 'US' ? 'English (United States)' : layout === 'Vietnamese' ? 'Vietnamese Telex' : 'English (United Kingdom)'}</span></span>
                          {keyboard === layout && <Check aria-hidden="true" className="size-4 text-[#087bd1]" />}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {step === 2 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Let&apos;s connect you</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em]">Let&apos;s connect to a network</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">A connection helps you get updates and sync your SparkOS experience.</p>
                    <div className="grid gap-2.5">
                      {[{ name: 'SparkOS Wi-Fi', detail: 'Secured · Excellent signal' }, { name: 'Connect later', detail: 'Continue setup without internet' }].map((item) => (
                        <button key={item.name} type="button" onClick={() => setNetwork(item.name)} aria-pressed={network === item.name} className={`flex min-h-[68px] items-center gap-3 rounded-xl border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] ${network === item.name ? 'border-[#087bd1] bg-[#e9f4ff]' : 'border-[#dce2e9] bg-white/70 hover:bg-white'}`}>
                          {item.name === 'Connect later' ? <Globe aria-hidden="true" className="size-5 text-[#087bd1]" /> : <Wifi aria-hidden="true" className="size-5 text-[#087bd1]" />}
                          <span className="flex-1"><span className="block text-[14px] font-medium text-[#20252b]">{item.name}</span><span className="mt-1 block text-[11px] text-[#75808d]">{item.detail}</span></span>
                          {network === item.name && <Check aria-hidden="true" className="size-4 text-[#087bd1]" />}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {step === 3 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Personalize your device</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em]">Who&apos;s going to use this device?</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">Create a local profile name for your SparkOS desktop.</p>
                    <label htmlFor="sparkos-account-name" className="mb-2 block text-[12px] font-medium text-[#404a55]">Your name</label>
                    <div className="flex max-w-md items-center gap-3 rounded-xl border border-[#dce2e9] bg-white/80 px-4 py-3 focus-within:border-[#087bd1] focus-within:ring-2 focus-within:ring-[#087bd1]/15">
                      <UserRound aria-hidden="true" className="size-5 shrink-0 text-[#087bd1]" />
                      <input id="sparkos-account-name" value={userName} onChange={(event) => setUserName(event.target.value)} maxLength={32} className="w-full bg-transparent text-[14px] text-[#20252b] outline-none" placeholder="Enter your name" />
                    </div>
                  </section>
                )}
                {step === 4 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Name your device</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em] text-[#17191d]">Give your PC a name</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">This name helps you recognize your device when sharing or connecting to it.</p>
                    <label htmlFor="sparkos-device-name" className="mb-2 block text-[12px] font-medium text-[#404a55]">Device name</label>
                    <div className="flex max-w-md items-center gap-3 rounded-xl border border-[#dce2e9] bg-white/80 px-4 py-3 focus-within:border-[#087bd1] focus-within:ring-2 focus-within:ring-[#087bd1]/15">
                      <Monitor aria-hidden="true" className="size-5 shrink-0 text-[#087bd1]" />
                      <input id="sparkos-device-name" value={deviceName} onChange={(event) => setDeviceName(event.target.value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24))} maxLength={24} className="w-full bg-transparent text-[14px] text-[#20252b] outline-none" placeholder="SparkOS-PC" />
                    </div>
                    <p className="mt-2 text-[11px] text-[#75808d]">Use up to 24 letters, numbers, or hyphens.</p>
                  </section>
                )}
                {step === 5 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Make it yours</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em] text-[#17191d]">How will you use this device?</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">Choose an experience to personalize your SparkOS setup.</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {experiences.map((item) => (
                        <button key={item.name} type="button" onClick={() => setExperience(item.name)} aria-pressed={experience === item.name} className={`flex min-h-[92px] items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] ${experience === item.name ? 'border-[#087bd1] bg-[#e9f4ff]' : 'border-[#dce2e9] bg-white/70 hover:bg-white'}`}>
                          <span><span className="block text-[14px] font-medium text-[#20252b]">{item.name}</span><span className="mt-1 block text-[11px] leading-4 text-[#75808d]">{item.detail}</span></span>
                          {experience === item.name && <Check aria-hidden="true" className="size-4 shrink-0 text-[#087bd1]" />}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {step === 6 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Choose your privacy settings</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em]">You&apos;re in control</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">Choose what SparkOS can use. You can change these options at any time.</p>
                    <div className="divide-y divide-[#e2e7ed] rounded-xl border border-[#dce2e9] bg-white/75 px-4">
                      {[
                        { key: 'location' as const, title: 'Location services', description: 'Let apps use your approximate location.' },
                        { key: 'diagnostics' as const, title: 'Send optional diagnostics', description: 'Help improve SparkOS by sharing usage details.' },
                        { key: 'tailored' as const, title: 'Personalized experiences', description: 'Use diagnostics to make suggestions more relevant.' },
                      ].map((item) => (
                        <div key={item.key} className="flex min-h-[68px] items-center justify-between gap-4 py-3">
                          <span><span className="block text-[13px] font-medium text-[#20252b]">{item.title}</span><span className="mt-1 block text-[11px] leading-4 text-[#75808d]">{item.description}</span></span>
                          <button type="button" role="switch" aria-checked={privacy[item.key]} aria-label={item.title} onClick={() => setPrivacy((current) => ({ ...current, [item.key]: !current[item.key] }))} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] focus-visible:ring-offset-2 ${privacy[item.key] ? 'bg-[#087bd1]' : 'bg-[#aab4bf]'}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${privacy[item.key] ? 'left-6' : 'left-1'}`} /></button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-[11px] text-[#78828d]"><ShieldCheck aria-hidden="true" className="size-4" />Your choices stay on this device.</p>
                  </section>
                )}
                {step === 7 && (
                  <section aria-labelledby="setup-heading">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#087bd1]">Almost there</p>
                    <h1 id="setup-heading" className="mb-2 text-[clamp(24px,3vw,34px)] font-semibold leading-tight tracking-[-0.035em] text-[#17191d]">Your SparkOS is ready</h1>
                    <p className="mb-5 max-w-lg text-[13px] leading-5 text-[#697481]">Take a moment to review your setup before heading to the desktop.</p>
                    <dl className="divide-y divide-[#e2e7ed] rounded-xl border border-[#dce2e9] bg-white/75 px-4">
                      {[
                        ['Region', region],
                        ['Keyboard', keyboard],
                        ['Network', network],
                        ['Profile', userName.trim()],
                        ['Device name', deviceName.trim()],
                        ['Experience', experience],
                      ].map(([label, value]) => (
                        <div key={label} className="flex min-h-12 items-center justify-between gap-4 py-2 text-[12px]">
                          <dt className="text-[#75808d]">{label}</dt>
                          <dd className="truncate text-right font-medium text-[#20252b]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="mt-5 flex shrink-0 items-center justify-between border-t border-[#e4e9ef] pt-4 sm:mt-6 sm:pt-5">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-[#4c5966] transition-colors hover:bg-[#eaf0f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1]"><ArrowLeft aria-hidden="true" className="size-4" />Back</button>
            ) : <span className="text-[11px] text-[#86909b]">SparkOS setup</span>}
            <button type="button" onClick={continueSetup} disabled={(step === 3 && !userName.trim()) || (step === 4 && !deviceName.trim())} className="inline-flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-lg bg-[#087bd1] px-5 text-[13px] font-medium text-white shadow-[0_4px_12px_rgba(8,123,209,.18)] transition-colors hover:bg-[#006fbe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087bd1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{step === setupSteps.length - 1 ? 'Start SparkOS' : 'Continue'}{step < setupSteps.length - 1 && <ArrowRight aria-hidden="true" className="size-4" />}</button>
          </footer>
        </div>
      </motion.section>
    </main>
  );
}
