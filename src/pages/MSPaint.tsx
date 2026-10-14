import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Star, 
  Heart, 
  MessageSquare, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Upload, 
  Trash2, 
  Maximize2, 
  Check, 
  Palette, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { FluentPaintIcon } from '../components/FluentIcons';

interface MSPaintProps {
  navigate?: (route: string) => void;
}

type ToolType = 'pencil' | 'brush' | 'eraser' | 'bucket' | 'picker' | 'text' | 'line' | 'rectangle' | 'rounded-rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'bubble';

type BrushType = 'standard' | 'calligraphy' | 'airbrush' | 'marker' | 'watercolor';

const CLASSIC_PALETTE = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
  '#0078d4', '#4cc2ff', '#107c41', '#d83b01'
];

export const MSPaint: React.FC<MSPaintProps> = ({ navigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tools & Drawing state
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [brushType, setBrushType] = useState<BrushType>('standard');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = useState<string>('#ffffff');
  const [activeColorSlot, setActiveColorSlot] = useState<1 | 2>(1);
  const [fillShape, setFillShape] = useState<boolean>(false);

  // Canvas size & zoom
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(700);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Mouse coords
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Undo / Redo history
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Drawing in progress
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save initial state to history
    const initialData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    setHistory([initialData]);
    setHistoryIndex(0);
  }, []);

  // Save state to undo history
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    // Limit history stack to 30 steps
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
      showToast('Hoàn tác (Undo)');
    }
  }, [history, historyIndex]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
      showToast('Làm lại (Redo)');
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Coordinates helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  // Draw Shape geometry helper
  const drawShape = (
    ctx: CanvasRenderingContext2D, 
    tool: ToolType, 
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    strokeColor: string,
    fillColor: string,
    isFilled: boolean,
    width: number
  ) => {
    ctx.lineWidth = width;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    const w = endX - startX;
    const h = endY - startY;

    switch (tool) {
      case 'line':
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        break;

      case 'rectangle':
        ctx.rect(startX, startY, w, h);
        break;

      case 'rounded-rect':
        const r = Math.min(Math.abs(w), Math.abs(h)) * 0.2;
        ctx.roundRect(startX, startY, w, h, r);
        break;

      case 'circle':
        const rx = Math.abs(w) / 2;
        const ry = Math.abs(h) / 2;
        const cx = startX + w / 2;
        const cy = startY + h / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        break;

      case 'triangle':
        ctx.moveTo(startX + w / 2, startY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(startX, endY);
        ctx.closePath();
        break;

      case 'star': {
        const cx = startX + w / 2;
        const cy = startY + h / 2;
        const outerR = Math.min(Math.abs(w), Math.abs(h)) / 2;
        const innerR = outerR * 0.45;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'heart': {
        const cx = startX + w / 2;
        const topY = startY + h * 0.3;
        ctx.moveTo(cx, endY);
        ctx.bezierCurveTo(startX, endY - h * 0.3, startX, startY, cx, topY);
        ctx.bezierCurveTo(endX, startY, endX, endY - h * 0.3, cx, endY);
        ctx.closePath();
        break;
      }

      case 'bubble':
        ctx.roundRect(startX, startY, w, h * 0.8, 12);
        ctx.moveTo(startX + w * 0.3, startY + h * 0.8);
        ctx.lineTo(startX + w * 0.2, endY);
        ctx.lineTo(startX + w * 0.5, startY + h * 0.8);
        break;
    }

    if (isFilled) {
      ctx.fill();
    }
    ctx.stroke();
  };

  // Flood Fill / Bucket Fill Implementation
  const floodFill = (startX: number, startY: number, fillColorHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Convert hex color to RGBA
    const tempDiv = document.createElement('div');
    tempDiv.style.color = fillColorHex;
    document.body.appendChild(tempDiv);
    const rgbStr = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const rgbMatch = rgbStr.match(/\d+/g);
    if (!rgbMatch) return;
    const fillR = parseInt(rgbMatch[0], 10);
    const fillG = parseInt(rgbMatch[1], 10);
    const fillB = parseInt(rgbMatch[2], 10);

    const startIndex = (startY * width + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];

    if (startR === fillR && startG === fillG && startB === fillB && startA === 255) {
      return;
    }

    // Fast scanline / queue flood fill
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    const matchColor = (idx: number) => {
      const dr = Math.abs(data[idx] - startR);
      const dg = Math.abs(data[idx + 1] - startG);
      const db = Math.abs(data[idx + 2] - startB);
      return dr + dg + db < 32;
    };

    while (queue.length > 0 && queue.length < 500000) {
      const [x, y] = queue.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const pIdx = y * width + x;
      if (visited[pIdx]) continue;
      visited[pIdx] = 1;

      const cIdx = pIdx * 4;
      if (!matchColor(cIdx)) continue;

      data[cIdx] = fillR;
      data[cIdx + 1] = fillG;
      data[cIdx + 2] = fillB;
      data[cIdx + 3] = 255;

      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }

    ctx.putImageData(imgData, 0, 0);
    saveState();
  };

  // Eyedropper / Color Picker Implementation
  const pickColorAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);

    if (activeColorSlot === 1) {
      setPrimaryColor(hex);
    } else {
      setSecondaryColor(hex);
    }
    showToast(`Đã chọn màu: ${hex}`);
    setCurrentTool('pencil');
  };

  // Text tool implementation
  const handleTextStamp = (x: number, y: number) => {
    const text = prompt('Nhập văn bản cần chèn vào hình ảnh:', 'Sparkle Paint');
    if (!text || !text.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `${strokeWidth * 6 + 14}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.fillText(text, x, y);
    saveState();
    showToast('Đã chèn văn bản');
  };

  // Drawing Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    startPosRef.current = coords;
    isDrawingRef.current = true;

    if (currentTool === 'picker') {
      pickColorAt(coords.x, coords.y);
      isDrawingRef.current = false;
      return;
    }

    if (currentTool === 'bucket') {
      floodFill(coords.x, coords.y, primaryColor);
      isDrawingRef.current = false;
      return;
    }

    if (currentTool === 'text') {
      handleTextStamp(coords.x, coords.y);
      isDrawingRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = currentTool === 'eraser' ? strokeWidth * 3 : strokeWidth;
      ctx.strokeStyle = currentTool === 'eraser' ? secondaryColor : primaryColor;

      if (currentTool === 'brush') {
        if (brushType === 'airbrush') {
          ctx.fillStyle = primaryColor;
          for (let i = 0; i < 15; i++) {
            const rad = Math.random() * strokeWidth * 2;
            const ang = Math.random() * Math.PI * 2;
            ctx.fillRect(coords.x + rad * Math.cos(ang), coords.y + rad * Math.sin(ang), 1.5, 1.5);
          }
        } else if (brushType === 'calligraphy') {
          ctx.lineWidth = strokeWidth * 2;
          ctx.lineCap = 'square';
        }
      }

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setCursorPos(coords);

    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      if (brushType === 'airbrush') {
        ctx.fillStyle = primaryColor;
        for (let i = 0; i < 15; i++) {
          const rad = Math.random() * strokeWidth * 2.5;
          const ang = Math.random() * Math.PI * 2;
          ctx.fillRect(coords.x + rad * Math.cos(ang), coords.y + rad * Math.sin(ang), 1.5, 1.5);
        }
      } else {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    } else {
      // Geometric shapes: live preview on temporary canvas or restore last imageData
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
        drawShape(
          ctx, 
          currentTool, 
          startPosRef.current.x, 
          startPosRef.current.y, 
          coords.x, 
          coords.y, 
          primaryColor, 
          secondaryColor, 
          fillShape, 
          strokeWidth
        );
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (['line', 'rectangle', 'rounded-rect', 'circle', 'triangle', 'star', 'heart', 'bubble'].includes(currentTool)) {
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      drawShape(
        ctx, 
        currentTool, 
        startPosRef.current.x, 
        startPosRef.current.y, 
        coords.x, 
        coords.y, 
        primaryColor, 
        secondaryColor, 
        fillShape, 
        strokeWidth
      );
    }

    ctx.closePath();
    saveState();
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (confirm('Bạn có chắc muốn xoá toàn bộ tranh vẽ?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = secondaryColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
      showToast('Đã xoá trắng khung vẽ');
    }
  };

  // Export / Save PNG
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `VOne_Drawing_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã lưu ảnh vẽ về máy tính');
  };

  // Open / Load image from computer
  const handleLoadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize or fit image
        ctx.drawImage(img, 0, 0, Math.min(img.width, canvas.width), Math.min(img.height, canvas.height));
        saveState();
        showToast(`Đã mở tệp ảnh "${file.name}"`);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-transparent text-[#111827] dark:text-[#f3f4f6] select-none font-sans">
      {/* 1. Fluent Paint Ribbon Toolbar */}
      <div className="border-b border-black/10 dark:border-white/10 bg-white/75 dark:bg-[#202429]/75 backdrop-blur-xl p-2 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Group 1: File & Undo/Redo */}
          <div className="flex items-center gap-1 pr-2 border-r border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={handleSaveImage}
              className="px-2.5 py-1.5 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lưu tranh vẽ (Save PNG)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>

            <label className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer" title="Mở ảnh từ máy">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleLoadImage} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
              title="Hoàn tác (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
              title="Làm lại (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearCanvas}
              className="p-1.5 rounded-[6px] hover:bg-rose-500/10 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 transition-colors cursor-pointer"
              title="Xoá trắng (Clear)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 2: Tools (Pencil, Brush, Eraser, Bucket, Eyedropper, Text) */}
          <div className="flex items-center gap-1 pr-2 border-r border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCurrentTool('pencil')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'pencil' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Bút chì (Pencil)"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('brush')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'brush' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Cọ vẽ (Brushes)"
            >
              <FluentPaintIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('eraser')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'eraser' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Tẩy xoá (Eraser)"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('bucket')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'bucket' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Đổ màu (Fill with color)"
            >
              <PaintBucket className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('picker')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'picker' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Hút màu (Color picker)"
            >
              <Pipette className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('text')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'text' ? 'bg-[#0078d4] text-white shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Chèn văn bản (Text)"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Group 3: Geometric Shapes */}
          <div className="flex items-center gap-1 pr-2 border-r border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCurrentTool('line')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'line' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Đường thẳng (Line)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('rectangle')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'rectangle' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Hình chữ nhật (Rectangle)"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('circle')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'circle' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Hình elip / tròn (Circle)"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('triangle')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'triangle' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Tam giác (Triangle)"
            >
              <Triangle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('star')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'star' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Ngôi sao (Star)"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool('heart')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                currentTool === 'heart' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Trái tim (Heart)"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Fill Shape Toggle */}
            <button
              type="button"
              onClick={() => setFillShape(prev => !prev)}
              className={`px-2 py-1 rounded-[6px] text-[11px] font-medium border transition-colors cursor-pointer ${
                fillShape 
                  ? 'bg-[#0078d4]/10 border-[#0078d4] text-[#0078d4] dark:text-[#4cc2ff]' 
                  : 'border-black/10 dark:border-white/10 text-neutral-500'
              }`}
              title="Đổ màu kín hình khối"
            >
              Fill: {fillShape ? 'Bật' : 'Tắt'}
            </button>
          </div>

          {/* Group 4: Stroke Size */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-black/10 dark:border-white/10">
            <span className="text-[11px] text-neutral-400 font-medium">Nét:</span>
            {[1, 3, 6, 12, 24].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setStrokeWidth(size)}
                className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
                  strokeWidth === size 
                    ? 'bg-[#0078d4] text-white font-bold shadow-xs' 
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 text-xs'
                }`}
                title={`Kích thước nét: ${size}px`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: Math.min(size + 2, 14), height: Math.min(size + 2, 14) }}
                />
              </button>
            ))}
          </div>

          {/* Group 5: Color 1 & Color 2 + Palette */}
          <div className="flex items-center gap-2">
            {/* Color 1 & 2 Slots */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveColorSlot(1)}
                className={`flex flex-col items-center p-1 rounded-[6px] border transition-all cursor-pointer ${
                  activeColorSlot === 1 ? 'border-[#0078d4] bg-[#0078d4]/10' : 'border-transparent'
                }`}
                title="Màu 1 (Màu nét vẽ chính)"
              >
                <div
                  className="w-5 h-5 rounded-[4px] border border-black/20 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-[9px] font-semibold mt-0.5">Màu 1</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveColorSlot(2)}
                className={`flex flex-col items-center p-1 rounded-[6px] border transition-all cursor-pointer ${
                  activeColorSlot === 2 ? 'border-[#0078d4] bg-[#0078d4]/10' : 'border-transparent'
                }`}
                title="Màu 2 (Màu nền / tẩy)"
              >
                <div
                  className="w-5 h-5 rounded-[4px] border border-black/20 shadow-2xs"
                  style={{ backgroundColor: secondaryColor }}
                />
                <span className="text-[9px] font-semibold mt-0.5">Màu 2</span>
              </button>
            </div>

            {/* Quick Color Palette Grid */}
            <div className="grid grid-cols-12 gap-1 max-w-[240px]">
              {CLASSIC_PALETTE.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (activeColorSlot === 1) setPrimaryColor(c);
                    else setSecondaryColor(c);
                  }}
                  className="w-4 h-4 rounded-[2px] border border-black/20 hover:scale-115 transition-transform cursor-pointer shadow-2xs"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Custom Color Picker Input */}
            <label className="flex items-center gap-1 p-1 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" title="Chọn màu tự do">
              <Palette className="w-4 h-4 text-neutral-500" />
              <input
                type="color"
                value={activeColorSlot === 1 ? primaryColor : secondaryColor}
                onChange={(e) => {
                  if (activeColorSlot === 1) setPrimaryColor(e.target.value);
                  else setSecondaryColor(e.target.value);
                }}
                className="w-0 h-0 opacity-0 absolute"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 2. Drawing Board Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#dcdcdc] dark:bg-[#181a1d] overflow-auto flex items-center justify-center p-4 sm:p-8 select-none"
      >
        <div 
          className="relative bg-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] border border-neutral-300 dark:border-neutral-700 transition-transform origin-center"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            width: canvasWidth,
            height: canvasHeight
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full block cursor-crosshair bg-white"
          />
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <footer className="h-6 px-4 border-t border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#202429]/70 backdrop-blur-md flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
        <div className="flex items-center gap-4">
          <span>{cursorPos.x}, {cursorPos.y} px</span>
          <span className="hidden sm:inline">Kích thước tranh: {canvasWidth} × {canvasHeight} px</span>
          <span className="hidden md:inline">Công cụ: {currentTool}</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(prev - 25, 25))}
            className="p-0.5 hover:text-black dark:hover:text-white cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono w-10 text-center">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(prev + 25, 300))}
            className="p-0.5 hover:text-black dark:hover:text-white cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="text-[10px] px-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 cursor-pointer ml-1"
          >
            Reset
          </button>
        </div>
      </footer>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 px-3.5 py-2 rounded-lg bg-[#111827] dark:bg-white text-white dark:text-black text-xs font-medium shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
