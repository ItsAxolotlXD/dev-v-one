import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  RotateCw,
  Trophy,
  Users,
  Bot,
  Shuffle,
  Volume2,
  VolumeX,
  ExternalLink,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Check,
  X,
  ChevronRight,
  Flame,
  Award,
  RefreshCw,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  FluentGamesIcon,
  FluentWheelIcon,
  FluentTicTacToeIcon,
  FluentRpsIcon,
  FluentDrawLogosIcon
} from '../components/FluentIcons';

// ==========================================
// WEB AUDIO SYNTHESIZER (No external audio files needed)
// ==========================================
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext policy fallback
    }
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = this.ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  playMove() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }
}

const sfx = new SoundEffects();

// ==========================================
// PRESET PREVIEWS FOR WHEEL OF FORTUNE
// ==========================================
const WHEEL_PRESETS: { [key: string]: string[] } = {
  'Ăn gì trưa nay?': [
    'Phở Bò',
    'Cơm Tấm',
    'Bún Chả',
    'Bánh Mì',
    'Bún Đậu Mắm Tôm',
    'Gà Rán',
    'Mì Cay',
    'Trà Sữa & Ăn Vặt'
  ],
  'Ai trả tiền?': [
    'Người bên trái',
    'Người bên phải',
    'Chia đều (Campuchia)',
    'Bạn đấy!',
    'Người nhỏ tuổi nhất',
    'Người lớn tuổi nhất',
    'Chủ xị bao trọn gói',
    'Tung đồng xu lại'
  ],
  'Số may mắn 1-10': [
    'Số 1', 'Số 2', 'Số 3', 'Số 4', 'Số 5',
    'Số 6', 'Số 7', 'Số 8', 'Số 9', 'Số 10'
  ],
  'Sự thật hay Thử thách': [
    'Nói 1 bí mật xấu hổ nhất',
    'Hát 1 bài điệp khúc',
    'Kể về mối tình đầu',
    'Gọi điện cho người thứ 5 trong danh bạ',
    'Uống 1 ngụm nước lớn',
    'Tạo dáng siêu mẫu 10 giây',
    'Bắt chước tiếng động vật',
    'Được miễn hình phạt'
  ]
};

const SECTOR_COLORS = [
  '#0078d4', '#e6005a', '#107c41', '#d83b01', '#5c2d91',
  '#008272', '#b4009e', '#004e8c', '#a80000', '#ff8c00',
  '#00b7c3', '#004b50', '#881798', '#10893e', '#e3008c'
];

interface GamesProps {
  navigate?: (route: string) => void;
  initialTab?: 'wheel' | 'tic-tac-toe' | 'rps' | 'logos';
}

export const Games: React.FC<GamesProps> = ({ navigate, initialTab = 'wheel' }) => {
  const [activeTab, setActiveTab] = useState<'wheel' | 'tic-tac-toe' | 'rps' | 'logos'>(initialTab);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync initial tab when changed from props/url
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const toggleSound = () => {
    sfx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-28 pt-2 select-none">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#005fb8] to-[#4cc2ff] flex items-center justify-center text-white shadow-md">
              <FluentGamesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
                Games & Giải Trí
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#9CA3AF]">
                Tập hợp các mini game tương tác mượt mà và thử thách trí nhớ
              </p>
            </div>
          </div>
        </div>

        {/* Top Sound Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                : 'bg-black/5 dark:bg-white/5 text-neutral-400 border-dashed border-neutral-300 dark:border-neutral-700'
            }`}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Tabs Switcher styled in Fluent Design */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-black/10 dark:border-white/10 pb-2">
        {[
          { id: 'wheel', label: 'Vòng quay may mắn (Wheel of Fortune)', icon: FluentWheelIcon },
          { id: 'tic-tac-toe', label: 'Cờ Ca-rô (Tic-Tac-Toe)', icon: FluentTicTacToeIcon },
          { id: 'rps', label: 'Kéo Búa Bao (Rock Paper Scissors)', icon: FluentRpsIcon },
          { id: 'logos', label: 'Draw Logos From Memory', icon: FluentDrawLogosIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                if (navigate) {
                  const query = tab.id === 'wheel' ? '/games/wheel' : `/games/${tab.id}`;
                  window.history.replaceState(null, '', query);
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Games Content */}
      <div className="pt-1">
        {activeTab === 'wheel' && <WheelOfFortuneGame />}
        {activeTab === 'tic-tac-toe' && <TicTacToeGame />}
        {activeTab === 'rps' && <RockPaperScissorsGame />}
        {activeTab === 'logos' && <DrawLogosFromMemoryTab />}
      </div>
    </div>
  );
};

// ==========================================
// 1. WHEEL OF FORTUNE (VÒNG QUAY MAY MẮN)
// ==========================================
const WheelOfFortuneGame: React.FC = () => {
  const [optionsText, setOptionsText] = useState<string>(
    WHEEL_PRESETS['Ăn gì trưa nay?'].join('\n')
  );
  const [spinDuration, setSpinDuration] = useState<number>(5); // default 5 seconds
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickAngleRef = useRef<number>(0);

  // Parse lines: each Enter / newline is an option
  const options = useMemo(() => {
    return optionsText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [optionsText]);

  // Draw wheel on canvas
  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    if (options.length === 0) {
      // Empty wheel state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2d3239';
      ctx.fill();
      ctx.strokeStyle = '#4cc2ff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Nhập ít nhất 2 lựa chọn', centerX, centerY);
      return;
    }

    const arcSize = (Math.PI * 2) / options.length;

    // Outer decorative glow circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#4cc2ff';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#4cc2ff';
    ctx.stroke();
    ctx.restore();

    // Draw individual sectors
    options.forEach((opt, idx) => {
      const startAngle = rotation + idx * arcSize;
      const endAngle = startAngle + arcSize;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Color sector
      const color = SECTOR_COLORS[idx % SECTOR_COLORS.length];
      ctx.fillStyle = color;
      ctx.fill();

      // Border between sectors
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw option text along sector radius
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      // Truncate long text
      const maxText = opt.length > 18 ? opt.slice(0, 16) + '...' : opt;
      ctx.fillText(maxText, radius - 24, 5);
      ctx.restore();
    });

    // Outer ring dots
    for (let i = 0; i < options.length * 2; i++) {
      const dotAngle = rotation + (i * Math.PI) / options.length;
      const dotX = centerX + (radius + 2) * Math.cos(dotAngle);
      const dotY = centerY + (radius + 2) * Math.sin(dotAngle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Center circular hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#1b1f24';
    ctx.fill();
    ctx.strokeStyle = '#4cc2ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center icon/symbol
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#4cc2ff';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [options]);

  // Spin the wheel
  const startSpin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);

    // Random target winner
    const winningIndex = Math.floor(Math.random() * options.length);
    const arcSize = (Math.PI * 2) / options.length;

    // In trigonometry on Canvas, 0 radians is at 3 o'clock (right).
    // The pointer arrow is at the top (12 o'clock, which is -Math.PI / 2 or 3 * Math.PI / 2).
    // Target sector center should align with 3 * Math.PI / 2.
    const targetSectorAngle = 3 * Math.PI / 2 - (winningIndex * arcSize + arcSize / 2);

    // Add multiple full spins (e.g. 5 to 10 full turns) based on duration
    const fullSpins = Math.max(4, Math.floor(spinDuration * 1.8));
    const startRotation = currentRotationRef.current % (Math.PI * 2);
    const targetDelta = fullSpins * Math.PI * 2 + (targetSectorAngle - (startRotation % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2);

    const totalDurationMs = spinDuration * 1000;
    const startTime = performance.now();

    // Deceleration easing function: easeOutCubic
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      const easedProgress = easeOutCubic(progress);

      const currentRotation = startRotation + targetDelta * easedProgress;
      currentRotationRef.current = currentRotation;
      drawWheel(currentRotation);

      // Play tick sound whenever rotation crosses an option sector
      const currentTickSector = Math.floor((currentRotation * options.length) / (Math.PI * 2));
      if (currentTickSector !== lastTickAngleRef.current) {
        lastTickAngleRef.current = currentTickSector;
        sfx.playTick();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalWinner = options[winningIndex];
        setWinner(finalWinner);
        setShowWinnerModal(true);
        sfx.playWin();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleApplyPreset = (name: string) => {
    if (isSpinning) return;
    const preset = WHEEL_PRESETS[name];
    if (preset) {
      setOptionsText(preset.join('\n'));
    }
  };

  const handleShuffle = () => {
    if (isSpinning || options.length < 2) return;
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    setOptionsText(shuffled.join('\n'));
  };

  const handleRemoveWinner = () => {
    if (!winner) return;
    const newOptions = options.filter((item) => item !== winner);
    setOptionsText(newOptions.join('\n'));
    setShowWinnerModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Wheel Canvas & Controls */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm relative overflow-hidden">
        {/* Pointer indicator at the top */}
        <div className="relative flex flex-col items-center z-20">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-md -mb-3 transition-transform animate-bounce" />
        </div>

        {/* Canvas container */}
        <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Spin Button */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <button
            type="button"
            disabled={isSpinning || options.length < 2}
            onClick={startSpin}
            className={`flex-1 min-w-[160px] h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isSpinning || options.length < 2
                ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-[#005fb8] to-[#0078d4] hover:from-[#0066cc] hover:to-[#0082e6] text-white active:scale-[0.98]'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang quay ({spinDuration}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>QUAY NGAY!</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSpinning || options.length < 2}
            onClick={handleShuffle}
            className="h-12 px-4 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="Xáo trộn thứ tự các ô trên vòng quay"
          >
            <Shuffle className="w-4 h-4" />
            <span>Xáo trộn</span>
          </button>
        </div>

        {/* Last Winner Banner */}
        {winner && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center w-full max-w-md">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Kết quả vừa quay:</span>
            <div className="text-lg font-black text-amber-500 dark:text-amber-300 tracking-wide mt-0.5">
              🎉 {winner}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Customization & Enter newline settings */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. Enter newline option input container */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <span>Tùy chỉnh danh sách lựa chọn</span>
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Mỗi lần <b>Enter</b> xuống dòng là 1 option mới
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
              {options.length} lựa chọn
            </span>
          </div>

          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            disabled={isSpinning}
            placeholder="Nhập các lựa chọn tại đây...&#10;Mỗi dòng 1 lựa chọn&#10;Ví dụ:&#10;Phở Bò&#10;Cơm Tấm&#10;Bún Chả"
            rows={8}
            className="w-full p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4] dark:focus:ring-[#4cc2ff] font-medium leading-relaxed resize-y"
          />

          {/* 2. Adjustable spin duration */}
          <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span>Thời gian quay:</span>
              <span className="text-[#0078d4] dark:text-[#4cc2ff] font-bold">{spinDuration} giây</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={spinDuration}
              disabled={isSpinning}
              onChange={(e) => setSpinDuration(Number(e.target.value))}
              className="w-full accent-[#0078d4] dark:accent-[#4cc2ff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Nhanh (2s)</span>
              <span>Tiêu chuẩn (5s)</span>
              <span>Hồi hộp (15s)</span>
            </div>
          </div>
        </div>

        {/* 3. Preset Templates */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm space-y-2.5">
          <div className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
            Mẫu vòng quay có sẵn
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(WHEEL_PRESETS).map((presetName) => (
              <button
                key={presetName}
                type="button"
                disabled={isSpinning}
                onClick={() => handleApplyPreset(presetName)}
                className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-left text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer truncate"
              >
                🎯 {presetName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Winner Congratulations Modal */}
      <AnimatePresence>
        {showWinnerModal && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#252830] border border-black/10 dark:border-white/15 p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl shadow-inner animate-pulse">
                🏆
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Lựa chọn chiến thắng!
                </div>
                <div className="text-2xl font-black text-[#111827] dark:text-white mt-1 break-words">
                  {winner}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Tuyệt vời!
                </button>
                <button
                  type="button"
                  onClick={handleRemoveWinner}
                  className="w-full py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Xóa lựa chọn này khỏi vòng quay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 2. TIC-TAC-TOE (CỜ CA-RÔ 3x3)
// ==========================================
type BoardState = (string | null)[];

const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve'); // pve = vs Bot, pvp = 2 players
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [scores, setScores] = useState({ p1: 0, p2: 0, draw: 0 });

  // Check winning lines
  const checkWinner = (squares: BoardState): { winner: string | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return { winner: null, line: null };
  };

  const { winner, line: winningLine } = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  // Minimax Algorithm for unbeatable Bot
  const minimax = (squares: BoardState, depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(squares);
    if (res.winner === 'O') return 10 - depth;
    if (res.winner === 'X') return depth - 10;
    if (squares.every((sq) => sq !== null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          best = Math.max(best, minimax(squares, depth + 1, false));
          squares[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          best = Math.min(best, minimax(squares, depth + 1, true));
          squares[i] = null;
        }
      }
      return best;
    }
  };

  // Bot makes move
  const makeBotMove = (currentBoard: BoardState) => {
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (available.length === 0) return;

    let chosenIdx: number;

    if (botDifficulty === 'easy') {
      // Random move
      chosenIdx = available[Math.floor(Math.random() * available.length)];
    } else if (botDifficulty === 'medium') {
      // 50% Minimax, 50% Random
      if (Math.random() < 0.5) {
        chosenIdx = available[Math.floor(Math.random() * available.length)];
      } else {
        chosenIdx = getBestMove(currentBoard, available);
      }
    } else {
      // Unbeatable Hard (Minimax)
      chosenIdx = getBestMove(currentBoard, available);
    }

    const nextBoard = [...currentBoard];
    nextBoard[chosenIdx] = 'O';
    setBoard(nextBoard);
    setIsXNext(true);
    sfx.playMove();

    const result = checkWinner(nextBoard);
    if (result.winner === 'O') {
      setScores((prev) => ({ ...prev, p2: prev.p2 + 1 }));
      sfx.playWin();
    } else if (nextBoard.every((c) => c !== null)) {
      setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
    }
  };

  const getBestMove = (squares: BoardState, available: number[]) => {
    let bestScore = -Infinity;
    let move = available[0];
    for (const idx of available) {
      squares[idx] = 'O';
      const score = minimax(squares, 0, false);
      squares[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    }
    return move;
  };

  // Human player click
  const handleCellClick = (idx: number) => {
    if (board[idx] || winner || isDraw) return;
    if (gameMode === 'pve' && !isXNext) return; // Wait for bot

    const nextBoard = [...board];
    const currentSymbol = isXNext ? 'X' : 'O';
    nextBoard[idx] = currentSymbol;
    setBoard(nextBoard);
    sfx.playMove();

    const res = checkWinner(nextBoard);
    if (res.winner) {
      if (res.winner === 'X') {
        setScores((prev) => ({ ...prev, p1: prev.p1 + 1 }));
      } else {
        setScores((prev) => ({ ...prev, p2: prev.p2 + 1 }));
      }
      sfx.playWin();
      return;
    }

    if (nextBoard.every((c) => c !== null)) {
      setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
      return;
    }

    if (gameMode === 'pve') {
      setIsXNext(false);
      setTimeout(() => {
        makeBotMove(nextBoard);
      }, 350);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const resetAllScores = () => {
    resetGame();
    setScores({ p1: 0, p2: 0, draw: 0 });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm">
      {/* 1. Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setGameMode('pve');
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              gameMode === 'pve'
                ? 'bg-white dark:bg-[#282c31] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Đấu với Bot (1 Người)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode('pvp');
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              gameMode === 'pvp'
                ? 'bg-white dark:bg-[#282c31] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2 Người chơi</span>
          </button>
        </div>

        {gameMode === 'pve' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 font-medium">Độ khó Bot:</span>
            {(['easy', 'medium', 'hard'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setBotDifficulty(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  botDifficulty === lvl
                    ? 'bg-[#0078d4] text-white'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'Vừa' : 'Khó (Minimax)'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Scoreboard Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider">
            {gameMode === 'pve' ? 'Bạn (X)' : 'Người chơi 1 (X)'}
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-300 mt-0.5">{scores.p1}</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
            Hòa
          </div>
          <div className="text-2xl font-black text-neutral-600 dark:text-neutral-300 mt-0.5">{scores.draw}</div>
        </div>

        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
            {gameMode === 'pve' ? 'Bot AI (O)' : 'Người chơi 2 (O)'}
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-300 mt-0.5">{scores.p2}</div>
        </div>
      </div>

      {/* 3. Turn Status Indicator */}
      <div className="text-center">
        {winner ? (
          <div className="text-base font-bold text-emerald-500 animate-pulse">
            🎉 Chiến thắng: {winner === 'X' ? (gameMode === 'pve' ? 'Bạn đã thắng!' : 'Người chơi 1 thắng!') : (gameMode === 'pve' ? 'Bot AI đã thắng!' : 'Người chơi 2 thắng!')}
          </div>
        ) : isDraw ? (
          <div className="text-base font-bold text-amber-500">
            🤝 Trận đấu hòa!
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Đến lượt:{' '}
            <span className={isXNext ? 'text-[#0078d4] dark:text-[#4cc2ff] font-bold' : 'text-[#f43f5e] font-bold'}>
              {isXNext ? (gameMode === 'pve' ? 'Bạn (X)' : 'Người chơi 1 (X)') : (gameMode === 'pve' ? 'Bot AI đang nghĩ (O)...' : 'Người chơi 2 (O)')}
            </span>
          </div>
        )}
      </div>

      {/* 4. 3x3 Grid Board */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] sm:max-w-[360px] mx-auto aspect-square">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={!!cell || !!winner || isDraw || (gameMode === 'pve' && !isXNext)}
              onClick={() => handleCellClick(idx)}
              className={`rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all cursor-pointer ${
                isWinningCell
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg scale-[1.03]'
                  : cell
                  ? 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10'
                  : 'bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-[#0078d4]/40 active:scale-95'
              } ${cell === 'X' ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-[#f43f5e]'}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* 5. Bottom Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={resetGame}
          className="px-5 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ván mới</span>
        </button>

        <button
          type="button"
          onClick={resetAllScores}
          className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          Đặt lại tỷ số
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. KÉO BÚA BAO (ROCK PAPER SCISSORS)
// ==========================================
type RPSChoice = 'rock' | 'paper' | 'scissors';

const RPS_DETAILS: Record<RPSChoice, { label: string; icon: string; beats: RPSChoice }> = {
  rock: { label: 'Búa', icon: '✊', beats: 'scissors' },
  paper: { label: 'Bao', icon: '✋', beats: 'rock' },
  scissors: { label: 'Kéo', icon: '✌️', beats: 'paper' },
};

const RockPaperScissorsGame: React.FC = () => {
  const [mode, setMode] = useState<'bot' | 'pvp'>('bot');
  const [p1Choice, setP1Choice] = useState<RPSChoice | null>(null);
  const [p2Choice, setP2Choice] = useState<RPSChoice | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [result, setResult] = useState<'p1' | 'p2' | 'draw' | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draw: 0 });
  const [history, setHistory] = useState<{ p1: RPSChoice; p2: RPSChoice; result: string }[]>([]);

  // PVP two-player secret selection step
  const [pvpStep, setPvpStep] = useState<'p1_turn' | 'p2_turn' | 'reveal'>('p1_turn');

  const determineWinner = (c1: RPSChoice, c2: RPSChoice): 'p1' | 'p2' | 'draw' => {
    if (c1 === c2) return 'draw';
    if (RPS_DETAILS[c1].beats === c2) return 'p1';
    return 'p2';
  };

  const handlePlayBot = (choice: RPSChoice) => {
    if (isShaking) return;
    setP1Choice(choice);
    setIsShaking(true);
    setResult(null);

    // Countdown / shake effect
    let count = 0;
    const interval = setInterval(() => {
      sfx.playTick();
      count++;
      if (count >= 3) {
        clearInterval(interval);
        const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
        const botPick = choices[Math.floor(Math.random() * choices.length)];
        setP2Choice(botPick);
        setIsShaking(false);

        const outcome = determineWinner(choice, botPick);
        setResult(outcome);

        if (outcome === 'p1') {
          setScores((prev) => ({ ...prev, p1: prev.p1 + 1 }));
          sfx.playWin();
        } else if (outcome === 'p2') {
          setScores((prev) => ({ ...prev, p2: prev.p2 + 1 }));
        } else {
          setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
        }

        setHistory((prev) => [
          { p1: choice, p2: botPick, result: outcome },
          ...prev.slice(0, 7)
        ]);
      }
    }, 320);
  };

  // 2-player Pass & Play handlers
  const handlePvpP1Select = (choice: RPSChoice) => {
    setP1Choice(choice);
    setPvpStep('p2_turn');
    sfx.playMove();
  };

  const handlePvpP2Select = (choice: RPSChoice) => {
    setP2Choice(choice);
    setPvpStep('reveal');
    sfx.playTick();

    if (p1Choice) {
      const outcome = determineWinner(p1Choice, choice);
      setResult(outcome);
      if (outcome === 'p1') {
        setScores((prev) => ({ ...prev, p1: prev.p1 + 1 }));
        sfx.playWin();
      } else if (outcome === 'p2') {
        setScores((prev) => ({ ...prev, p2: prev.p2 + 1 }));
        sfx.playWin();
      } else {
        setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
      }
      setHistory((prev) => [
        { p1: p1Choice, p2: choice, result: outcome },
        ...prev.slice(0, 7)
      ]);
    }
  };

  const resetPvpRound = () => {
    setP1Choice(null);
    setP2Choice(null);
    setResult(null);
    setPvpStep('p1_turn');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm">
      {/* 1. Mode Selector */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('bot');
              resetPvpRound();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'bot'
                ? 'bg-white dark:bg-[#282c31] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Đấu với Bot</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('pvp');
              resetPvpRound();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'pvp'
                ? 'bg-white dark:bg-[#282c31] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2 Người (Pass & Play)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setScores({ p1: 0, p2: 0, draw: 0 });
            setHistory([]);
            resetPvpRound();
          }}
          className="text-xs text-neutral-400 hover:text-rose-500 transition-colors"
        >
          Đặt lại tỷ số
        </button>
      </div>

      {/* 2. Scoreboard Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider">
            {mode === 'bot' ? 'Bạn' : 'Người chơi 1'}
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-300 mt-0.5">{scores.p1}</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
            Hòa
          </div>
          <div className="text-2xl font-black text-neutral-600 dark:text-neutral-300 mt-0.5">{scores.draw}</div>
        </div>

        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
            {mode === 'bot' ? 'Bot' : 'Người chơi 2'}
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-300 mt-0.5">{scores.p2}</div>
        </div>
      </div>

      {/* 3. Duel Arena Arena View */}
      <div className="p-6 rounded-2xl bg-black/5 dark:bg-black/25 border border-black/5 dark:border-white/10 flex items-center justify-around text-center">
        {/* P1 Side */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-neutral-500">{mode === 'bot' ? 'Bạn' : 'Người chơi 1'}</div>
          <div className={`w-24 h-24 rounded-2xl bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 flex items-center justify-center text-5xl shadow-md ${
            isShaking ? 'animate-bounce' : ''
          }`}>
            {isShaking ? '✊' : p1Choice ? RPS_DETAILS[p1Choice].icon : '❓'}
          </div>
          <div className="text-sm font-bold text-[#111827] dark:text-white">
            {p1Choice ? RPS_DETAILS[p1Choice].label : 'Chưa chọn'}
          </div>
        </div>

        {/* Center VS Indicator */}
        <div className="space-y-1">
          <span className="text-2xl font-black text-neutral-400 italic">VS</span>
          {result && (
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              result === 'p1'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : result === 'p2'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {result === 'p1' ? 'P1 Thắng!' : result === 'p2' ? (mode === 'bot' ? 'Bot Thắng!' : 'P2 Thắng!') : 'Hòa nhau!'}
            </div>
          )}
        </div>

        {/* P2 Side */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-neutral-500">{mode === 'bot' ? 'Bot AI' : 'Người chơi 2'}</div>
          <div className={`w-24 h-24 rounded-2xl bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 flex items-center justify-center text-5xl shadow-md ${
            isShaking ? 'animate-bounce' : ''
          }`}>
            {isShaking ? '✊' : p2Choice && (mode === 'bot' || pvpStep === 'reveal') ? RPS_DETAILS[p2Choice].icon : '❓'}
          </div>
          <div className="text-sm font-bold text-[#111827] dark:text-white">
            {p2Choice && (mode === 'bot' || pvpStep === 'reveal') ? RPS_DETAILS[p2Choice].label : 'Chưa chọn'}
          </div>
        </div>
      </div>

      {/* 4. Action Buttons based on Mode */}
      {mode === 'bot' ? (
        <div className="space-y-2 text-center">
          <div className="text-xs font-semibold text-neutral-500">Nhấn để ra đòn:</div>
          <div className="grid grid-cols-3 gap-3">
            {(['rock', 'paper', 'scissors'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                disabled={isShaking}
                onClick={() => handlePlayBot(choice)}
                className="p-4 rounded-2xl bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 hover:border-[#0078d4] dark:hover:border-[#4cc2ff] active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-sm"
              >
                <span className="text-4xl">{RPS_DETAILS[choice].icon}</span>
                <span className="text-xs font-bold text-[#111827] dark:text-white">{RPS_DETAILS[choice].label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* PVP 2 Player Turn Mechanism */
        <div className="space-y-3">
          {pvpStep === 'p1_turn' && (
            <div className="space-y-2 text-center">
              <div className="text-xs font-bold text-[#0078d4] dark:text-[#4cc2ff]">
                👤 Người chơi 1: Chọn bí mật (Người chơi 2 quay đi!)
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handlePvpP1Select(choice)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 hover:border-[#0078d4] cursor-pointer flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="text-4xl">{RPS_DETAILS[choice].icon}</span>
                    <span className="text-xs font-bold text-[#111827] dark:text-white">{RPS_DETAILS[choice].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pvpStep === 'p2_turn' && (
            <div className="space-y-2 text-center">
              <div className="text-xs font-bold text-[#f43f5e]">
                👤 Người chơi 2: Chọn bí mật của bạn!
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handlePvpP2Select(choice)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 hover:border-[#f43f5e] cursor-pointer flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="text-4xl">{RPS_DETAILS[choice].icon}</span>
                    <span className="text-xs font-bold text-[#111827] dark:text-white">{RPS_DETAILS[choice].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pvpStep === 'reveal' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={resetPvpRound}
                className="px-6 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Vòng tiếp theo
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Match History */}
      {history.length > 0 && (
        <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Lịch sử các ván gần nhất:
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  h.result === 'p1'
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
                    : h.result === 'p2'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'bg-neutral-500/10 border-neutral-500/20 text-neutral-500'
                }`}
              >
                <span>{RPS_DETAILS[h.p1].icon}</span>
                <span className="text-[10px] text-neutral-400">vs</span>
                <span>{RPS_DETAILS[h.p2].icon}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. DRAW LOGOS FROM MEMORY (WEB VIEW TAB)
// ==========================================
const DrawLogosFromMemoryTab: React.FC = () => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const TARGET_URL = 'https://neal.fun/logos-from-memory/';

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(TARGET_URL, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-2xl bg-white dark:bg-[#1f2329] border border-black/10 dark:border-white/10 shadow-sm overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full min-h-[720px]'
      }`}
    >
      {/* Top Browser Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/5 dark:bg-black/30 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
            <Palette className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
            <span className="truncate max-w-[240px] sm:max-w-md">https://neal.fun/logos-from-memory/</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Tải lại trang game"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            className="px-2.5 py-1 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Mở trong tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mở ngoài tab</span>
          </button>
        </div>
      </div>

      {/* Information Banner */}
      <div className="px-4 py-2 bg-sky-500/10 border-b border-sky-500/20 text-sky-800 dark:text-sky-300 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="truncate">
            Thử thách vẽ lại các logo nổi tiếng thế giới (Apple, Starbucks, Android, BMW...) hoàn toàn từ trí nhớ!
          </span>
        </div>
        <button
          type="button"
          onClick={handleOpenExternal}
          className="underline font-semibold hover:text-sky-600 shrink-0 text-[11px]"
        >
          Mở tab mới nếu bị chặn
        </button>
      </div>

      {/* Main WebView IFrame */}
      <div className="relative flex-1 w-full min-h-[620px] bg-white">
        <iframe
          key={iframeKey}
          src={TARGET_URL}
          title="Draw Logos From Memory - Neal.fun"
          className="w-full h-full min-h-[620px] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Games;
