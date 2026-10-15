import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  AlarmClock, 
  Globe2, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Volume2, 
  VolumeX, 
  Flag, 
  Sun, 
  Moon, 
  ChevronRight, 
  X, 
  Sparkles,
  Bell,
  BellOff
} from 'lucide-react';
import { FluentClockIcon, FluentClockColorIcon, FluentSearchIcon } from '../components/FluentIcons';

interface AlarmItem {
  id: string;
  time: string; // "06:30"
  label: string;
  enabled: boolean;
  repeatDays: string[]; // ["T2", "T3", "T4", "T5", "T6"]
  sound: 'chime' | 'digital' | 'radar';
}

interface WorldCity {
  id: string;
  city: string;
  country: string;
  timezone: string; // e.g. "Asia/Tokyo"
  offsetHours: number; // relative to UTC+7 (Vietnam)
}

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    time: '06:30',
    label: 'Chào buổi sáng & Tập thể dục',
    enabled: true,
    repeatDays: ['T2', 'T3', 'T4', 'T5', 'T6'],
    sound: 'chime'
  },
  {
    id: 'alarm-2',
    time: '18:55',
    label: 'Đón xem Thời sự 19h VTV1 HD',
    enabled: true,
    repeatDays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    sound: 'radar'
  },
  {
    id: 'alarm-3',
    time: '23:00',
    label: 'Nghỉ ngơi & Đọc sách',
    enabled: false,
    repeatDays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    sound: 'digital'
  }
];

const PRESET_WORLD_CITIES: WorldCity[] = [
  { id: 'city-tokyo', city: 'Tokyo', country: 'Nhật Bản', timezone: 'Asia/Tokyo', offsetHours: 2 },
  { id: 'city-london', city: 'London', country: 'Vương quốc Anh', timezone: 'Europe/London', offsetHours: -6 },
  { id: 'city-ny', city: 'New York', country: 'Hoa Kỳ', timezone: 'America/New_York', offsetHours: -11 },
  { id: 'city-paris', city: 'Paris', country: 'Pháp', timezone: 'Europe/Paris', offsetHours: -5 },
  { id: 'city-sydney', city: 'Sydney', country: 'Úc', timezone: 'Australia/Sydney', offsetHours: 3 },
  { id: 'city-la', city: 'Los Angeles', country: 'Hoa Kỳ', timezone: 'America/Los_Angeles', offsetHours: -14 },
  { id: 'city-seoul', city: 'Seoul', country: 'Hàn Quốc', timezone: 'Asia/Seoul', offsetHours: 2 },
  { id: 'city-singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', offsetHours: 1 },
  { id: 'city-dubai', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', offsetHours: -3 }
];

interface ClockAppProps {
  navigate?: (route: string) => void;
}

export const ClockApp: React.FC<ClockAppProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'alarm' | 'world' | 'stopwatch' | 'timer'>('alarm');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Alarms State
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_clock_alarms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ALARMS;
  });

  const [isNewAlarmModalOpen, setIsNewAlarmModalOpen] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Báo thức mới');
  const [newAlarmDays, setNewAlarmDays] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6']);
  const [newAlarmSound, setNewAlarmSound] = useState<'chime' | 'digital' | 'radar'>('chime');

  // Ringing alarm modal simulation
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  // World Clock State
  const [worldCities, setWorldCities] = useState<WorldCity[]>(() => {
    try {
      const saved = localStorage.getItem('vone_world_clock_cities');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_WORLD_CITIES.slice(0, 5);
  });
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Stopwatch State
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<number | null>(null);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(300); // 5 mins in seconds
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInputH, setTimerInputH] = useState(0);
  const [timerInputM, setTimerInputM] = useState(5);
  const [timerInputS, setTimerInputS] = useState(0);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live master clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarms trigger
      const currentHHMM = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const currentDay = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][now.getDay()];

      alarms.forEach((a) => {
        if (a.enabled && a.time === currentHHMM && a.repeatDays.includes(currentDay) && now.getSeconds() === 0) {
          triggerAlarmSound();
          setRingingAlarm(a);
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [alarms]);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('vone_clock_alarms', JSON.stringify(alarms));
      localStorage.setItem('vone_world_clock_cities', JSON.stringify(worldCities));
    } catch {}
  }, [alarms, worldCities]);

  // Audio Synthesizer for Alarm and Timer
  const triggerAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      [0, 0.25, 0.5, 0.75].forEach((t) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + t);
        osc.frequency.exponentialRampToValueAtTime(1320, now + t + 0.15);
        gain.gain.setValueAtTime(0.4, now + t);
        gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.15);
      });
    } catch {}
  };

  // Stopwatch Loop
  useEffect(() => {
    if (stopwatchRunning) {
      const startTime = performance.now() - stopwatchTime;
      const interval = setInterval(() => {
        setStopwatchTime(performance.now() - startTime);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [stopwatchRunning]);

  // Timer Loop
  useEffect(() => {
    if (timerRunning) {
      const timer = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerRunning(false);
            triggerAlarmSound();
            showToast('Hết giờ hẹn! ⏰');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerRunning]);

  // Helper format stopwatch (mm:ss.ms)
  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  // Helper format countdown timer (hh:mm:ss)
  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stopwatch Lap statistics
  const bestLapIndex = useMemo(() => {
    if (laps.length < 2) return -1;
    let min = Infinity;
    let minIdx = -1;
    laps.forEach((l, idx) => {
      if (l < min) {
        min = l;
        minIdx = idx;
      }
    });
    return minIdx;
  }, [laps]);

  const worstLapIndex = useMemo(() => {
    if (laps.length < 2) return -1;
    let max = -Infinity;
    let maxIdx = -1;
    laps.forEach((l, idx) => {
      if (l > max) {
        max = l;
        maxIdx = idx;
      }
    });
    return maxIdx;
  }, [laps]);

  // Filter available cities for World Clock
  const availableCities = useMemo(() => {
    return PRESET_WORLD_CITIES.filter((c) => {
      const notAdded = !worldCities.some((wc) => wc.id === c.id);
      const match = c.city.toLowerCase().includes(citySearchQuery.toLowerCase()) || c.country.toLowerCase().includes(citySearchQuery.toLowerCase());
      return notAdded && match;
    });
  }, [worldCities, citySearchQuery]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#1b1f24] text-[#F3F4F6] select-none font-sans pb-16">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#16191f] border-b border-white/10 px-4 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <FluentClockIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Báo Thức & Đồng Hồ
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Quản lý báo thức cá nhân, giờ quốc tế các quốc gia và đồng hồ bấm giờ chuẩn xác
              </p>
            </div>
          </div>

          {/* Current Local Time Display in Header */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <div className="text-right">
              <div className="text-lg font-black text-white font-mono leading-none">
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="bg-[#14171d] border-b border-white/10 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-2 py-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'alarm', label: 'Báo thức (Alarm)', icon: AlarmClock },
            { id: 'world', label: 'Đồng hồ thế giới (World Clock)', icon: Globe2 },
            { id: 'stopwatch', label: 'Bấm giờ (Stopwatch)', icon: Clock },
            { id: 'timer', label: 'Hẹn giờ (Timer)', icon: Timer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0078d4] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENTS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* ================= TAB 1: BÁO THỨC ================= */}
        {activeTab === 'alarm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Danh Sách Báo Thức</h2>
                <p className="text-xs text-neutral-400">Tự động phát âm thanh chuông khi đến giờ đã hẹn</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerAlarmSound}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Kiểm tra âm thanh chuông báo thức"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Thử chuông</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewAlarmModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm báo thức</span>
                </button>
              </div>
            </div>

            {/* Alarms Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alarm.enabled
                      ? 'bg-gradient-to-br from-[#1e2530] to-[#161a22] border-white/20 shadow-lg'
                      : 'bg-[#14171d]/60 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl font-black font-mono text-white tracking-tight">
                        {alarm.time}
                      </div>
                      <div className="text-xs font-semibold text-neutral-300 mt-1">
                        {alarm.label}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        setAlarms((prev) =>
                          prev.map((a) => (a.id === alarm.id ? { ...a, enabled: !a.enabled } : a))
                        );
                        showToast(alarm.enabled ? 'Đã tắt báo thức' : 'Đã bật báo thức');
                      }}
                      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        alarm.enabled ? 'bg-[#0078d4]' : 'bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5 text-[11px] text-neutral-400">
                    <div className="flex gap-1 font-semibold">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                        <span
                          key={d}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            alarm.repeatDays.includes(d) ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-neutral-600'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAlarms((prev) => prev.filter((a) => a.id !== alarm.id));
                        showToast('Đã xóa báo thức');
                      }}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Xóa báo thức này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ĐỒNG HỒ THẾ GIỚI ================= */}
        {activeTab === 'world' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Múi Giờ Thế Giới</h2>
                <p className="text-xs text-neutral-400">Xem và so sánh giờ địa phương với các thủ đô và thành phố quốc tế</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCityModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm thành phố</span>
              </button>
            </div>

            {/* Local Time Card (Hà Nội, Việt Nam) */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#005fb8] to-[#0078d4] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Sun className="w-8 h-8 text-amber-300 animate-spin-slow" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-200">Giờ hiện tại của bạn</div>
                  <div className="text-2xl font-black text-white mt-0.5">Hà Nội, Việt Nam</div>
                  <div className="text-xs text-sky-100">Múi giờ Đông Dương (ICT • UTC+7)</div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow">
                  {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-sky-100 mt-1 font-medium">
                  {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* World Cities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {worldCities.map((city) => {
                // Compute city time
                const cityTime = new Date(currentTime.getTime() + city.offsetHours * 3600 * 1000);
                const isDay = cityTime.getHours() >= 6 && cityTime.getHours() < 18;

                return (
                  <div
                    key={city.id}
                    className="p-5 rounded-2xl bg-[#14171d] border border-white/10 hover:border-sky-500/40 transition-colors shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          {isDay ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
                          <span>{city.country}</span>
                        </div>
                        <div className="text-lg font-bold text-white mt-0.5">{city.city}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setWorldCities((prev) => prev.filter((c) => c.id !== city.id));
                          showToast(`Đã xóa ${city.city} khỏi danh sách`);
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                        title="Xóa thành phố này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-black font-mono text-white">
                          {cityTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {cityTime.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                        </div>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-sky-400 border border-white/10">
                        {city.offsetHours >= 0 ? `+${city.offsetHours}` : city.offsetHours} giờ so với VN
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BẤM GIỜ ================= */}
        {activeTab === 'stopwatch' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div>
              <h2 className="text-base font-bold text-white">Đồng Hồ Bấm Giờ (Stopwatch)</h2>
              <p className="text-xs text-neutral-400">Độ chính xác mili-giây, hỗ trợ ghi vòng không giới hạn</p>
            </div>

            {/* Large Digital Display */}
            <div className="py-10 rounded-3xl bg-gradient-to-b from-[#14171d] to-[#0f1217] border border-white/10 shadow-2xl">
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {formatStopwatch(stopwatchTime)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!stopwatchRunning ? (
                <button
                  type="button"
                  onClick={() => setStopwatchRunning(true)}
                  className="px-6 py-2.5 rounded-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Bắt đầu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStopwatchRunning(false)}
                  className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Tạm dừng</span>
                </button>
              )}

              <button
                type="button"
                disabled={!stopwatchRunning && stopwatchTime === 0}
                onClick={() => {
                  if (stopwatchRunning) {
                    setLaps((prev) => [stopwatchTime, ...prev]);
                  } else {
                    setStopwatchTime(0);
                    setLaps([]);
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {stopwatchRunning ? (
                  <>
                    <Flag className="w-4 h-4" />
                    <span>Ghi vòng</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Đặt lại</span>
                  </>
                )}
              </button>
            </div>

            {/* Laps Table */}
            {laps.length > 0 && (
              <div className="bg-[#14171d] border border-white/10 rounded-2xl p-4 text-xs max-h-60 overflow-y-auto">
                <div className="flex justify-between font-semibold text-neutral-400 pb-2 border-b border-white/10 text-[11px]">
                  <span>Vòng #</span>
                  <span>Thời gian chia</span>
                  <span>Thời gian tích lũy</span>
                </div>
                <div className="divide-y divide-white/5">
                  {laps.map((lap, idx) => {
                    const lapNumber = laps.length - idx;
                    const prevLap = laps[idx + 1] || 0;
                    const splitTime = lap - prevLap;
                    const isBest = idx === bestLapIndex;
                    const isWorst = idx === worstLapIndex;

                    return (
                      <div
                        key={idx}
                        className={`py-2 flex justify-between font-mono ${
                          isBest ? 'text-emerald-400 font-bold' : isWorst ? 'text-rose-400 font-bold' : 'text-neutral-200'
                        }`}
                      >
                        <span>
                          Vòng {lapNumber} {isBest ? '⚡ Nhanh nhất' : isWorst ? '🐢 Chậm nhất' : ''}
                        </span>
                        <span>{formatStopwatch(splitTime)}</span>
                        <span>{formatStopwatch(lap)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: HẸN GIỜ ĐẾM NGƯỢC ================= */}
        {activeTab === 'timer' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div>
              <h2 className="text-base font-bold text-white">Đồng Hồ Hẹn Giờ (Timer)</h2>
              <p className="text-xs text-neutral-400">Đếm ngược thời gian cho nấu ăn, học tập, xem phim và làm việc</p>
            </div>

            {/* Circular Timer Visual Display */}
            <div className="py-8 rounded-3xl bg-gradient-to-b from-[#14171d] to-[#0f1217] border border-white/10 shadow-2xl flex flex-col items-center justify-center">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/10 fill-none"
                  />
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={565.48}
                    strokeDashoffset={
                      565.48 - (565.48 * (timerDuration > 0 ? timerRemaining / timerDuration : 0))
                    }
                    strokeLinecap="round"
                    className="text-[#0078d4] fill-none transition-all duration-500"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                    {formatTimer(timerRemaining)}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1">
                    {timerRunning ? 'Đang đếm ngược' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: '1 phút', sec: 60 },
                { label: '3 phút', sec: 180 },
                { label: '5 phút', sec: 300 },
                { label: '10 phút', sec: 600 },
                { label: '15 phút', sec: 900 },
                { label: '25 phút (Pomodoro)', sec: 1500 },
              ].map((p) => (
                <button
                  key={p.sec}
                  type="button"
                  onClick={() => {
                    setTimerDuration(p.sec);
                    setTimerRemaining(p.sec);
                    setTimerRunning(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={() => setTimerRunning(true)}
                  className="px-6 py-2.5 rounded-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Bắt đầu hẹn giờ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimerRunning(false)}
                  className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Tạm dừng</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerRemaining(timerDuration);
                }}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL: TẠO BÁO THỨC MỚI */}
      {isNewAlarmModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161a22] border border-white/20 rounded-2xl shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base">Thêm Báo Thức Mới</h3>
              <button
                type="button"
                onClick={() => setIsNewAlarmModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Giờ báo thức (HH:mm):</label>
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="w-full bg-[#1e2530] border border-white/10 rounded-xl px-3 py-2 text-xl font-bold font-mono text-center text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Tên báo thức:</label>
                <input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  className="w-full bg-[#1e2530] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1.5">Lặp lại các ngày:</label>
                <div className="flex gap-1 justify-between">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => {
                    const isSelected = newAlarmDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setNewAlarmDays((prev) =>
                            isSelected ? prev.filter((item) => item !== d) : [...prev, d]
                          );
                        }}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                          isSelected ? 'bg-[#0078d4] text-white' : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsNewAlarmModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const newAlarm: AlarmItem = {
                    id: `alarm-${Date.now()}`,
                    time: newAlarmTime,
                    label: newAlarmLabel || 'Báo thức',
                    enabled: true,
                    repeatDays: newAlarmDays.length > 0 ? newAlarmDays : ['T2', 'T3', 'T4', 'T5', 'T6'],
                    sound: newAlarmSound
                  };
                  setAlarms((prev) => [...prev, newAlarm]);
                  setIsNewAlarmModalOpen(false);
                  showToast(`Đã đặt báo thức lúc ${newAlarmTime}`);
                }}
                className="flex-1 py-2 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Lưu Báo Thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: THÊM THÀNH PHỐ MÚI GIỜ */}
      {isAddCityModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161a22] border border-white/20 rounded-2xl shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base">Thêm Thành Phố Múi Giờ</h3>
              <button
                type="button"
                onClick={() => setIsAddCityModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="group relative flex items-center gap-2 h-8.5 bg-black/5 dark:bg-[#1e2530] border border-black/10 dark:border-white/10 rounded-[8px] px-3 text-xs transition-all focus-within:ring-1 focus-within:ring-[#0078d4]/30 dark:focus-within:ring-[#4cc2ff]/30 focus-within:border-b-2 focus-within:border-b-[#005fb8] dark:focus-within:border-b-[#4cc2ff]">
              <FluentSearchIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm thành phố hoặc dùng /search..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-white placeholder-neutral-400 no-fluent-line"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs">
              {availableCities.length === 0 ? (
                <div className="py-6 text-center text-neutral-500">
                  Không còn thành phố nào phù hợp
                </div>
              ) : (
                availableCities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setWorldCities((prev) => [...prev, c]);
                      setIsAddCityModalOpen(false);
                      showToast(`Đã thêm ${c.city} vào Đồng hồ thế giới`);
                    }}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white">{c.city}</div>
                      <div className="text-[10px] text-neutral-400">{c.country}</div>
                    </div>
                    <span className="font-mono text-sky-400 text-[11px]">
                      {c.offsetHours >= 0 ? `+${c.offsetHours}` : c.offsetHours}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CHUÔNG BÁO THỨC ĐANG REO */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1e2530] to-[#12151b] border-2 border-sky-400 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-bounce-short">
            <div className="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto animate-pulse">
              <AlarmClock className="w-10 h-10" />
            </div>

            <div>
              <div className="text-4xl font-black font-mono text-white tracking-tight">
                {ringingAlarm.time}
              </div>
              <h3 className="text-base font-bold text-white mt-2">{ringingAlarm.label}</h3>
              <p className="text-xs text-neutral-400 mt-1">Đến giờ theo lịch báo thức của bạn!</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRingingAlarm(null);
                  showToast('Đã hoãn báo thức 5 phút');
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-neutral-300"
              >
                Hoãn 5 phút
              </button>
              <button
                type="button"
                onClick={() => {
                  setRingingAlarm(null);
                  showToast('Đã tắt chuông báo thức');
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white shadow-lg"
              >
                Tắt Báo Thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#161a22] text-white border border-sky-500/40 px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ClockApp;
