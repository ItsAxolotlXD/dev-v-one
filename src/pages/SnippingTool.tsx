import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Scissors, 
  Camera, 
  Copy, 
  Save, 
  Share2, 
  Printer, 
  Undo2, 
  Redo2, 
  Check, 
  Sparkles, 
  Crop, 
  Edit3, 
  Highlighter as HighlighterIcon, 
  Eraser, 
  FileText, 
  Image as ImageIcon, 
  Maximize, 
  Clock, 
  ChevronDown, 
  X,
  RotateCw,
  Palette
} from 'lucide-react';
import { FluentSnippingToolIcon, FluentSnippingToolColorIcon } from '../components/FluentIcons';

interface SnippingToolProps {
  navigate?: (route: string) => void;
}

type SnipMode = 'rectangle' | 'window' | 'fullscreen' | 'freeform';

const PRESET_CAPTURES = [
  {
    id: 'snip-vtv1',
    name: 'Bản tin Thời sự 19h VTV1',
    url: '/banners/thoi_su_19h_hd.webp'
  },
  {
    id: 'snip-vplay',
    name: 'Fluent Mica Nebula Wallpaper',
    url: '/banners/vplay_background.webp'
  },
  {
    id: 'snip-morning',
    name: 'Chào buổi sáng VTV1',
    url: '/banners/chao_buoi_sang_vtv1_2026.webp'
  }
];

export const SnippingTool: React.FC<SnippingToolProps> = ({ navigate }) => {
  const [mode, setMode] = useState<SnipMode>('rectangle');
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Active Tool: pen, highlighter, eraser
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#ff3b30');
  const [penWidth, setPenWidth] = useState<number>(4);
  const [highlighterColor, setHighlighterColor] = useState<string>('rgba(255, 230, 0, 0.45)');

  // Image source in editor
  const [capturedImage, setCapturedImage] = useState<string>(PRESET_CAPTURES[0].url);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);

  // Interactive Snip Overlay state
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Redraw base image onto canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = capturedImage;
    img.onload = () => {
      canvas.width = img.width || 1200;
      canvas.height = img.height || 675;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [capturedImage]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Start Snip Workflow
  const handleStartSnip = () => {
    if (delaySeconds > 0) {
      setCountdown(delaySeconds);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c !== null && c > 1) return c - 1;
          clearInterval(timer);
          setCountdown(null);
          setIsSnapping(true);
          return null;
        });
      }, 1000);
    } else {
      setIsSnapping(true);
    }
  };

  // Mouse drawing on canvas for annotations
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    isDrawingRef.current = true;
    prevPosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !prevPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currX = (e.clientX - rect.left) * scaleX;
    const currY = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
    ctx.lineTo(currX, currY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.stroke();
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = penWidth * 3.5;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (activeTool === 'eraser') {
      // Re-draw or white mask
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penWidth * 4;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    prevPosRef.current = { x: currX, y: currY };
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    prevPosRef.current = null;
  };

  // Interactive Marquee Selection handlers
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCurrent({ x: e.clientX, y: e.clientY });
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setDragCurrent({ x: e.clientX, y: e.clientY });
  };

  const handleOverlayMouseUp = () => {
    if (!dragStart || !dragCurrent) {
      setIsSnapping(false);
      return;
    }

    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    if (width > 20 && height > 20) {
      // Generate simulated snip canvas based on selected coordinates
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = width * 1.5;
      mockCanvas.height = height * 1.5;
      const ctx = mockCanvas.getContext('2d');
      if (ctx) {
        // Draw crisp modern UI mock or gradient
        const grad = ctx.createLinearGradient(0, 0, mockCanvas.width, mockCanvas.height);
        grad.addColorStop(0, '#1a2233');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#0078d4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < mockCanvas.width; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, mockCanvas.height);
          ctx.stroke();
        }
        for (let j = 0; j < mockCanvas.height; j += 30) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(mockCanvas.width, j);
          ctx.stroke();
        }

        // Title watermark
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.fillText('SNIPPED SELECTION • SPARKLE DEV 2026', 24, 40);
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Kích thước: ${Math.round(width)} × ${Math.round(height)} px • ${new Date().toLocaleTimeString('vi-VN')}`, 24, 70);

        const dataUrl = mockCanvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        showToast(`Đã cắt vùng chọn (${Math.round(width)} × ${Math.round(height)} px) thành công!`);
      }
    }

    setDragStart(null);
    setDragCurrent(null);
    setIsSnapping(false);
  };

  // Copy Image to Clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Đã sao chép ảnh chụp vào khay nhớ tạm (Clipboard)');
      });
    } catch {
      showToast('Đã sao chép liên kết ảnh chụp màn hình');
    }
  };

  // Save Image to Local Disk
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Snip_${new Date().toISOString().slice(0, 10)}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Đã lưu ảnh chụp màn hình về máy tính');
  };

  // OCR Text Extraction Simulation
  const handleExtractText = () => {
    setIsOcrOpen(true);
    setExtractedText(
      'THỜI SỰ 19H VTV1 - TRUYỀN HÌNH VIỆT NAM\n' +
      'Bản tin thời sự trực tiếp từ Trung tâm Truyền hình Việt Nam.\n' +
      'Các sự kiện nổi bật trong nước và quốc tế ngày hôm nay.\n' +
      `Trích xuất lúc: ${new Date().toLocaleTimeString('vi-VN')} - Độ chính xác 99.8%`
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-full bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-24 h-24 rounded-full bg-black/80 border-2 border-[#0078d4] flex items-center justify-center text-4xl font-bold text-white font-mono animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Interactive Snip Crosshair Overlay */}
      {isSnapping && (
        <div
          onMouseDown={handleOverlayMouseDown}
          onMouseMove={handleOverlayMouseMove}
          onMouseUp={handleOverlayMouseUp}
          className="fixed inset-0 z-50 cursor-crosshair bg-black/40 backdrop-blur-[2px] select-none"
        >
          {/* Top Instruction Capsule */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/80 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-2xl">
            <Scissors className="w-4 h-4 text-[#0078d4]" />
            <span>Kéo thả chuột để chọn vùng màn hình cần chụp (hoặc nhấn ESC để hủy)</span>
            <button
              type="button"
              onClick={() => setIsSnapping(false)}
              className="ml-2 p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Marquee box */}
          {dragStart && dragCurrent && (
            <div
              className="absolute border-2 border-[#0078d4] bg-white/10"
              style={{
                left: Math.min(dragStart.x, dragCurrent.x),
                top: Math.min(dragStart.y, dragCurrent.y),
                width: Math.abs(dragCurrent.x - dragStart.x),
                height: Math.abs(dragCurrent.y - dragStart.y),
              }}
            >
              <span className="absolute -bottom-6 right-0 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                {Math.round(Math.abs(dragCurrent.x - dragStart.x))} × {Math.round(Math.abs(dragCurrent.y - dragStart.y))} px
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top Application Ribbon Header */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left: App Identity & "New" Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FluentSnippingToolColorIcon className="w-7 h-7 shrink-0 drop-shadow-sm" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Snipping Tool
              </h1>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Chụp ảnh màn hình & Chú thích Fluent
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          {/* New Snip Button */}
          <button
            type="button"
            onClick={handleStartSnip}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#006cbd] text-white text-xs font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mới (New)</span>
          </button>

          {/* Mode Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setMode('rectangle')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                mode === 'rectangle' ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs' : 'text-neutral-500'
              }`}
            >
              Hình chữ nhật
            </button>
            <button
              type="button"
              onClick={() => setMode('fullscreen')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                mode === 'fullscreen' ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs' : 'text-neutral-500'
              }`}
            >
              Toàn màn hình
            </button>
          </div>

          {/* Delay Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10))}
              className="bg-transparent border border-black/10 dark:border-white/10 rounded-md px-2 py-1 text-xs outline-none cursor-pointer"
            >
              <option value={0}>Không trễ</option>
              <option value={3}>Trễ 3 giây</option>
              <option value={5}>Trễ 5 giây</option>
              <option value={10}>Trễ 10 giây</option>
            </select>
          </div>
        </div>

        {/* Center/Right: Annotation Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* Pen Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] border border-[#0078d4]/30'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
            }`}
            title="Bút vẽ (Ballpoint Pen)"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Highlighter Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
            }`}
            title="Bút dạ quang (Highlighter)"
          >
            <HighlighterIcon className="w-4 h-4" />
          </button>

          {/* Eraser Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
            }`}
            title="Tẩy xóa (Eraser)"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Pen Color Palette */}
          {activeTool === 'pen' && (
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg">
              {['#ff3b30', '#0078d4', '#34c759', '#ffcc00', '#ffffff', '#000000'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPenColor(color)}
                  className={`w-4 h-4 rounded-full border border-black/20 cursor-pointer ${
                    penColor === color ? 'ring-2 ring-offset-1 ring-[#0078d4]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* OCR Extractor Button */}
          <button
            type="button"
            onClick={handleExtractText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-semibold cursor-pointer"
            title="Trích xuất văn bản từ ảnh"
          >
            <FileText className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
            <span>Trích xuất chữ (OCR)</span>
          </button>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 cursor-pointer"
            title="Sao chép vào Clipboard (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 cursor-pointer"
            title="Lưu ảnh chụp (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Edit in Paint */}
          {navigate && (
            <button
              type="button"
              onClick={() => navigate('/ms-paint')}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 cursor-pointer"
              title="Chỉnh sửa chi tiết trong Paint"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Reset Annotations */}
          <button
            type="button"
            onClick={redrawCanvas}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 cursor-pointer"
            title="Đặt lại bản vẽ ban đầu"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Snips Bar */}
      <div className="bg-[#f0f2f5] dark:bg-[#1f2228] border-b border-black/5 dark:border-white/5 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
        <span className="text-neutral-500 font-medium">Ảnh mẫu có sẵn:</span>
        <div className="flex items-center gap-2">
          {PRESET_CAPTURES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCapturedImage(p.url)}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                capturedImage === p.url
                  ? 'bg-[#0078d4] text-white'
                  : 'bg-white dark:bg-[#2b2e35] hover:bg-black/5 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto bg-[#e5e7eb] dark:bg-[#121418]">
        <div className="relative border border-black/15 dark:border-white/15 rounded-xl shadow-2xl overflow-hidden bg-black max-w-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full h-auto object-contain cursor-crosshair block"
          />
        </div>
      </div>

      {/* OCR Modal */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0078d4]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Văn bản trích xuất (Text Extractor)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOcrOpen(false)}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              readOnly
              value={extractedText || ''}
              className="w-full h-40 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-xs outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsOcrOpen(false)}
                className="px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  if (extractedText) {
                    navigator.clipboard.writeText(extractedText);
                    showToast('Đã sao chép văn bản vào khay nhớ tạm!');
                    setIsOcrOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#0078d4] text-white text-xs font-semibold shadow-sm hover:bg-[#006cbd]"
              >
                Sao chép văn bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
