import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  ListOrdered, 
  Shuffle, 
  Trash2, 
  Check, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Plus, 
  X,
  Share2
} from 'lucide-react';
import { FluentWheelIcon } from '../../components/FluentIcons';

const DEFAULT_OPTIONS = [
  'VTV1 HD',
  'VTV3 HD',
  'HTV7 HD',
  'Ăn Phở Bò',
  'Uống Trà Sữa',
  'Xem Phim Rạp',
  'Chơi Game Sandbox',
  'Trúng Thưởng 100k'
];

const PRESETS: Record<string, string[]> = {
  'Kênh Truyền Hình': ['VTV1 HD', 'VTV2 HD', 'VTV3 HD', 'VTV6 HD', 'HTV7 HD', 'HTV9 HD', 'SCTV1 HD', 'THVL1 HD'],
  'Ăn Gì Hôm Nay': ['Phở Bò', 'Cơm Tấm', 'Bún Chả', 'Bánh Mì', 'Lẩu Thái', 'Trà Sữa Trân Châu', 'Bún Bò Huế', 'Pizza'],
  'Trò Chơi Nhóm': ['Hát một bài', 'Chống đẩy 10 cái', 'Kể một bí mật', 'Nhảy điệu vui nhộn', 'Uống 1 ly nước', 'Được miễn phạt', 'Chọn người tiếp theo', 'Nói câu thả thính'],
  'Con Số May Mắn': ['Số 1', 'Số 2', 'Số 3', 'Số 4', 'Số 5', 'Số 6', 'Số 7', 'Số 8', 'Số 9', 'Số 10']
};

const SLICE_COLORS = [
  '#0078d4', '#107c41', '#d83b01', '#8764b8', 
  '#008272', '#b4009e', '#e3008c', '#004e8c',
  '#ca5010', '#498205', '#038387', '#5c2d91'
];

interface WheelOfFortuneProps {
  navigate?: (route: string) => void;
}

export const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({ navigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Raw textarea text where each line is an option
  const [rawText, setRawText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sparkle_wheel_options');
      if (saved) return saved;
    } catch {}
    return DEFAULT_OPTIONS.join('\n');
  });

  // Spin duration in seconds (2 to 20s)
  const [duration, setDuration] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sparkle_wheel_duration');
      if (saved) return Number(saved) || 5;
    } catch {}
    return 5;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [removeOnWin, setRemoveOnWin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ name: string; time: string }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animation refs
  const currentRotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Parse options: each line is 1 option
  const options = useMemo(() => {
    return rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [rawText]);

  // Save options and duration
  useEffect(() => {
    try {
      localStorage.setItem('sparkle_wheel_options', rawText);
      localStorage.setItem('sparkle_wheel_duration', String(duration));
    } catch {}
  }, [rawText, duration]);

  // Audio synthesize ticks and victory chime
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch {}
  };

  // Draw the wheel onto Canvas
  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (options.length === 0) {
      // Empty placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2d3748';
      ctx.fill();
      ctx.strokeStyle = '#4cc2ff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Nhập ít nhất 2 lựa chọn', centerX, centerY);
      return;
    }

    const numSlices = options.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const angle = rotation + i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text label on slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = numSlices > 14 ? 'bold 11px sans-serif' : numSlices > 8 ? 'bold 13px sans-serif' : 'bold 15px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const label = options[i];
      const maxTextWidth = radius - 45;
      const truncated = label.length > 20 ? label.slice(0, 19) + '…' : label;
      ctx.fillText(truncated, radius - 15, 0, maxTextWidth);
      ctx.restore();
    }

    // Outer ring shadow and border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center circular badge
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1e1e';
    ctx.fill();
    ctx.strokeStyle = '#4cc2ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);
  };

  // Initial draw & redraw on options change
  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [options]);

  // Handle spin execution
  const handleSpin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const startRotation = currentRotationRef.current % (Math.PI * 2);
    // Multiple full spins (at least 6-10 full rotations) + random offset
    const randomOffset = Math.random() * Math.PI * 2;
    const fullSpins = (Math.floor(Math.random() * 5) + 6) * Math.PI * 2;
    const targetRotation = startRotation + fullSpins + randomOffset;
    const spinDurationMs = duration * 1000;
    const startTime = performance.now();

    let lastTickAngle = startRotation;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDurationMs, 1);

      // Smooth ease-out cubic / quart
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const currentRot = startRotation + (targetRotation - startRotation) * easeOut;
      currentRotationRef.current = currentRot;

      drawWheel(currentRot);

      // Trigger audio clicks when slice borders cross pointer
      const sliceAngle = (Math.PI * 2) / options.length;
      if (Math.abs(currentRot - lastTickAngle) >= sliceAngle) {
        playTickSound();
        lastTickAngle = currentRot;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate winning slice:
        // Arrow is at the right side (angle 0 in standard canvas coordinates)
        // Adjust for slice index
        const normalized = (Math.PI * 2 - (currentRot % (Math.PI * 2))) % (Math.PI * 2);
        const winningIndex = Math.floor(normalized / sliceAngle) % options.length;
        const selectedWinner = options[winningIndex] || options[0];

        setWinner(selectedWinner);
        playVictorySound();
        setHistory((prev) => [
          { name: selectedWinner, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
          ...prev.slice(0, 19)
        ]);

        if (removeOnWin) {
          // Remove winner from options
          setTimeout(() => {
            const nextList = options.filter((_, idx) => idx !== winningIndex);
            setRawText(nextList.join('\n'));
          }, 1500);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Shuffle options
  const handleShuffle = () => {
    if (isSpinning) return;
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    setRawText(shuffled.join('\n'));
    showToast('Đã xáo trộn các lựa chọn');
  };

  // Apply a preset
  const handleApplyPreset = (name: string) => {
    if (isSpinning) return;
    const list = PRESETS[name] || DEFAULT_OPTIONS;
    setRawText(list.join('\n'));
    showToast(`Đã áp dụng mẫu: ${name}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-full bg-black/90 dark:bg-white text-white dark:text-black text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#4cc2ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0078d4] to-[#4cc2ff] flex items-center justify-center text-white shadow-md">
              <FluentWheelIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Wheel of Fortune
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-[10px] font-bold uppercase tracking-wider">
                  Vòng Quay May Mắn
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Tự tạo vòng quay ngẫu nhiên, mỗi lần enter xuống dòng là 1 option và tùy chỉnh thời gian quay.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-[11px] text-neutral-500 font-medium shrink-0 mr-1">Mẫu nhanh:</span>
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition-colors shrink-0 cursor-pointer"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Wheel Studio */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Wheel Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white dark:bg-[#25282e] p-6 sm:p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm relative overflow-hidden">
          {/* Wheel Pointer Indicator (on the right pointing left) */}
          <div className="relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="max-w-full w-[320px] sm:w-[380px] md:w-[420px] h-auto drop-shadow-xl"
            />
            {/* Arrow Pin at Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <polygon points="32,8 32,24 6,16" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* Action Spin Button */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              type="button"
              disabled={isSpinning || options.length < 2}
              onClick={handleSpin}
              className={`px-8 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                isSpinning || options.length < 2
                  ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-[#0078d4] via-[#005fb8] to-[#00458b] text-white hover:brightness-110 active:scale-95 shadow-[#0078d4]/30'
              }`}
            >
              <Play className={`w-5 h-5 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay...' : 'QUAY NGAY!'}</span>
            </button>

            <button
              type="button"
              disabled={isSpinning}
              onClick={handleShuffle}
              title="Xáo trộn lựa chọn"
              className="p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
            </button>
          </div>

          {/* Winner announcement banner */}
          {winner && (
            <div className="mt-5 w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-center animate-bounce-short">
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4" />
                <span>Chúc mừng kết quả</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {winner}
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls & Options Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Editor Card */}
          <div className="bg-white dark:bg-[#25282e] p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Danh Sách Lựa Chọn ({options.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-xs text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa trắng</span>
              </button>
            </div>

            <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
              Mỗi dòng là 1 ô trên vòng quay. Nhấn <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">Enter</kbd> để xuống dòng thêm lựa chọn mới.
            </p>

            {/* Textarea: Enter down line = 1 option */}
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Nhập lựa chọn (mỗi dòng 1 ô)&#10;Ví dụ:&#10;Lựa chọn 1&#10;Lựa chọn 2&#10;Lựa chọn 3"
              rows={8}
              className="w-full p-3.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/40 font-medium leading-relaxed resize-y"
            />

            {/* Duration slider */}
            <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
                  Thời gian quay:
                </span>
                <span className="font-mono font-bold text-[#0078d4] dark:text-[#4cc2ff]">
                  {duration} giây
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#0078d4] dark:accent-[#4cc2ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>Nhanh (2s)</span>
                <span>Chuẩn (5s)</span>
                <span>Hồi hộp (20s)</span>
              </div>
            </div>

            {/* Remove on win option */}
            <label className="flex items-center gap-2.5 pt-1 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeOnWin}
                onChange={(e) => setRemoveOnWin(e.target.checked)}
                className="rounded text-[#0078d4] focus:ring-[#0078d4] cursor-pointer"
              />
              <span>Tự động xóa ô vừa trúng khỏi vòng quay</span>
            </label>
          </div>

          {/* History Card */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-[#25282e] p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Lịch sử kết quả ({history.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  Xóa lịch sử
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {history.map((h, i) => (
                  <div
                    key={`${h.name}-${i}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] text-xs"
                  >
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {h.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
