import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera as CameraIcon, 
  RotateCcw, 
  SwitchCamera, 
  Timer, 
  Sparkles, 
  Sliders, 
  Check, 
  Image as ImageIcon, 
  ChevronRight,
  Sun,
  Grid as GridIcon,
  Zap,
  ZapOff,
  Video
} from 'lucide-react';
import { FluentCameraIcon } from '../components/FluentIcons';
import { MediaItem } from './PhotosApp';
import { recordRecallActivity } from '../services/recallService';

interface CameraAppProps {
  navigate?: (route: string) => void;
}

export const CameraApp: React.FC<CameraAppProps> = ({ navigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Timer & Flash
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // 0 = off, 3, 5
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  
  // Filter effects
  const [activeFilter, setActiveFilter] = useState<'normal' | 'vivid' | 'warm' | 'bw' | 'vintage' | 'cool'>('normal');
  
  // Recent captured photo
  const [recentPhoto, setRecentPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flashTrigger, setFlashTrigger] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Play shutter sound via Web Audio API
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}
  };

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Trình duyệt không hỗ trợ truy cập Webcam trực tiếp.');
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });

        currentStream = mediaStream;
        setStream(mediaStream);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Camera access issue:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt.'
            : 'Không tìm thấy thiết bị Camera vật lý. Đang mở chế độ mô phỏng ống kính quang học.'
        );
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Capture execution
  const executeCapture = () => {
    setIsCapturing(true);
    setFlashTrigger(true);
    playShutterSound();
    setTimeout(() => setFlashTrigger(false), 200);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) {
      setIsCapturing(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    let width = 1920;
    let height = 1080;
    if (aspectRatio === '4:3') {
      width = 1600;
      height = 1200;
    } else if (aspectRatio === '1:1') {
      width = 1200;
      height = 1200;
    }

    canvas.width = width;
    canvas.height = height;

    // Apply Filter to Canvas Context
    if (activeFilter === 'bw') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
    } else if (activeFilter === 'vivid') {
      ctx.filter = 'saturate(160%) contrast(110%)';
    } else if (activeFilter === 'warm') {
      ctx.filter = 'sepia(35%) saturate(130%) hue-rotate(-15deg)';
    } else if (activeFilter === 'cool') {
      ctx.filter = 'saturate(120%) hue-rotate(25deg)';
    } else if (activeFilter === 'vintage') {
      ctx.filter = 'sepia(50%) contrast(90%) brightness(95%)';
    } else {
      ctx.filter = 'none';
    }

    if (video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      // Draw simulated camera viewfinder scene with date stamp
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0078d4');
      grad.addColorStop(0.5, '#4cc2ff');
      grad.addColorStop(1, '#107c41');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Text watermark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPARKLE (DEV) OPTICAL CAMERA 2026', width / 2, height / 2 - 20);
      ctx.font = '24px sans-serif';
      ctx.fillText(new Date().toLocaleString('vi-VN'), width / 2, height / 2 + 30);
    }

    // Reset filter
    ctx.filter = 'none';

    // Generate Data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setRecentPhoto(dataUrl);
    void recordRecallActivity({ type: 'photo-captured', title: 'Photo captured', source: 'Camera', route: '/camera', metadata: { filter: activeFilter, width, height } });

    // Save directly to localStorage `vone_photos_media` (Gallery storage)
    try {
      const saved = localStorage.getItem('vone_photos_media');
      const list: MediaItem[] = saved ? JSON.parse(saved) : [];

      const newMedia: MediaItem = {
        id: `camera-${Date.now()}`,
        title: `Ảnh chụp Camera ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        type: 'photo',
        url: dataUrl,
        thumbnailUrl: dataUrl,
        size: '3.4 MB',
        resolution: `${width} × ${height}`,
        aspectRatio: Math.round((width / height) * 100) / 100,
        date: new Date().toLocaleDateString('vi-VN'),
        section: 'Hôm nay • 12 tháng 10, 2026',
        album: 'Camera Roll',
        isFavorite: false,
        tags: ['Camera', 'Chụp ảnh', activeFilter.toUpperCase()]
      };

      const updated = [newMedia, ...list];
      localStorage.setItem('vone_photos_media', JSON.stringify(updated));
      showToast('📸 Đã lưu ảnh vào Gallery (Photos)');
    } catch (e) {
      console.error('Save to gallery failed:', e);
    }

    setIsCapturing(false);
  };

  // Handle Shutter Click with Timer
  const handleShutterClick = () => {
    if (isCapturing || countdown !== null) return;

    if (timerSeconds > 0) {
      let count = timerSeconds;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          executeCapture();
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  // Get CSS filter string for live video preview
  const getPreviewFilter = () => {
    switch (activeFilter) {
      case 'bw': return 'grayscale(100%) contrast(120%)';
      case 'vivid': return 'saturate(160%) contrast(110%)';
      case 'warm': return 'sepia(35%) saturate(130%) hue-rotate(-15deg)';
      case 'cool': return 'saturate(120%) hue-rotate(25deg)';
      case 'vintage': return 'sepia(50%) contrast(90%) brightness(95%)';
      default: return 'none';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-[#0f1115] text-white select-none font-sans overflow-hidden relative">
      {/* 1. Camera Top Command Bar */}
      <header className="h-12 px-4 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <FluentCameraIcon className="w-5 h-5 text-[#4cc2ff]" />
          <h1 className="text-sm font-bold tracking-tight text-white">Camera</h1>
        </div>

        {/* Quick Toolbar: Flash, Timer, Grid, Aspect Ratio */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Flash Toggle */}
          <button
            type="button"
            onClick={() => setFlashEnabled(prev => !prev)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              flashEnabled ? 'bg-amber-400/20 text-amber-400' : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title={flashEnabled ? 'Flash: Bật' : 'Flash: Tắt'}
          >
            {flashEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>

          {/* Timer Toggle: Off -> 3s -> 5s */}
          <button
            type="button"
            onClick={() => {
              if (timerSeconds === 0) setTimerSeconds(3);
              else if (timerSeconds === 3) setTimerSeconds(5);
              else setTimerSeconds(0);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              timerSeconds > 0 ? 'bg-[#0078d4] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title="Hẹn giờ chụp"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{timerSeconds === 0 ? 'Tắt' : `${timerSeconds}s`}</span>
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(prev => !prev)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showGrid ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title="Lưới bố cục 3x3"
          >
            <GridIcon className="w-4 h-4" />
          </button>

          {/* Aspect Ratio Toggle */}
          <button
            type="button"
            onClick={() => {
              if (aspectRatio === '16:9') setAspectRatio('4:3');
              else if (aspectRatio === '4:3') setAspectRatio('1:1');
              else setAspectRatio('16:9');
            }}
            className="px-2 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 text-xs font-mono font-medium transition-colors cursor-pointer"
            title="Tỷ lệ khung hình"
          >
            {aspectRatio}
          </button>
        </div>
      </header>

      {/* 2. Main Viewfinder Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {/* Flash White Screen Overlay */}
        {flashTrigger && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 opacity-100" />
        )}

        {/* Countdown Large Badge */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center text-6xl font-bold text-white animate-ping">
              {countdown}
            </div>
          </div>
        )}

        {/* Video / Camera Feed Viewport */}
        <div 
          className="relative max-h-full max-w-full overflow-hidden shadow-2xl transition-all flex items-center justify-center"
          style={{
            aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '4:3' ? '4/3' : '1/1',
            height: aspectRatio === '1:1' ? '75vh' : '82vh'
          }}
        >
          {cameraError ? (
            /* Simulation mode when physical webcam is not active */
            <div className="w-full h-full bg-gradient-to-br from-[#1a2332] via-[#101923] to-[#0d1117] flex flex-col items-center justify-center p-6 text-center text-neutral-300">
              <div className="w-20 h-20 rounded-full bg-[#0078d4]/20 border border-[#0078d4]/40 flex items-center justify-center mb-4 text-[#4cc2ff] animate-pulse">
                <CameraIcon className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Ống kính ảo Sparkle (Dev) Studio</h3>
              <p className="text-xs text-neutral-400 max-w-md mb-4">{cameraError}</p>
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Sẵn sàng chụp & tự động lưu vào Gallery
              </span>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: getPreviewFilter() }}
            />
          )}

          {/* 3x3 Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>
          )}

          {/* Viewfinder Focus Ring Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-white/40 animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>
          </div>
        </div>

        {/* Hidden Canvas for High-Res Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 3. Filter Carousel */}
      <div className="h-12 px-4 bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-white/5">
        <span className="text-[11px] font-semibold text-neutral-400 mr-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#4cc2ff]" />
          <span>Bộ lọc:</span>
        </span>
        {[
          { id: 'normal', name: 'Gốc' },
          { id: 'vivid', name: 'Rực rỡ' },
          { id: 'warm', name: 'Ấm áp' },
          { id: 'cool', name: 'Tươi s��ng' },
          { id: 'bw', name: 'Đen trắng' },
          { id: 'vintage', name: 'Cổ điển' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === f.id
                ? 'bg-[#0078d4] text-white shadow-xs font-semibold'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* 4. Bottom Shutter Bar */}
      <div className="h-20 px-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between shrink-0">
        {/* Left: Recent Captured Photo Thumbnail */}
        <div className="w-24">
          {recentPhoto ? (
            <button
              type="button"
              onClick={() => navigate ? navigate('/photos') : undefined}
              className="group relative w-12 h-12 rounded-[8px] overflow-hidden border-2 border-white/60 hover:border-[#0078d4] transition-all cursor-pointer shadow-md"
              title="Xem ảnh vừa chụp trong Gallery"
            >
              <img
                src={recentPhoto}
                alt="Ảnh vừa chụp"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white drop-shadow-md" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate ? navigate('/photos') : undefined}
              className="w-12 h-12 rounded-[8px] bg-white/10 hover:bg-white/20 border border-white/20 flex flex-col items-center justify-center text-[10px] text-neutral-300 transition-colors cursor-pointer"
              title="Mở Gallery"
            >
              <ImageIcon className="w-4 h-4 mb-0.5" />
              <span>Gallery</span>
            </button>
          )}
        </div>

        {/* Center: Large Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleShutterClick}
            disabled={isCapturing || countdown !== null}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-90 hover:scale-105 disabled:opacity-50"
            title="Chụp ảnh (Space)"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-neutral-200 transition-colors shadow-lg" />
          </button>
        </div>

        {/* Right: Switch Front/Back Camera */}
        <div className="w-24 flex justify-end">
          <button
            type="button"
            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Chuyển đổi Camera Trước / Sau"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-black/90 border border-[#0078d4] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          {navigate && (
            <button
              type="button"
              onClick={() => navigate('/photos')}
              className="ml-2 text-[#4cc2ff] underline font-bold cursor-pointer"
            >
              Mở Gallery ngay
            </button>
          )}
        </div>
      )}
    </div>
  );
};
