import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, Minus, Pencil, Redo2, RotateCcw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface InkSpaceProps {
  navigate?: (route: string) => void;
}

type Tool = 'pen' | 'eraser';

export const InkSpace: React.FC<InkSpaceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#4cc2ff');
  const [size, setSize] = useState(4);
  const [zoom, setZoom] = useState(1);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const context = canvas.getContext('2d');
    context?.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = getPoint(event);
    context.save();
    context.scale(zoom, zoom);
    context.strokeStyle = tool === 'eraser' ? '#121212' : color;
    context.lineWidth = tool === 'eraser' ? size * 4 : size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.restore();
    lastPointRef.current = point;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#121212';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#121212] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#1e293b] text-[#4cc2ff]"><Pencil className="size-4" /></div>
          <div><h1 className="text-sm font-semibold">Ink Canvas</h1><p className="text-[11px] text-white/45">Infinite canvas</p></div>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button type="button" aria-label="Pen" onClick={() => setTool('pen')} className={`rounded-lg p-2 ${tool === 'pen' ? 'bg-[#4cc2ff]/20 text-[#4cc2ff]' : 'text-white/60 hover:bg-white/10'}`}><Pencil className="size-4" /></button>
          <button type="button" aria-label="Eraser" onClick={() => setTool('eraser')} className={`rounded-lg p-2 ${tool === 'eraser' ? 'bg-[#4cc2ff]/20 text-[#4cc2ff]' : 'text-white/60 hover:bg-white/10'}`}><Eraser className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-white/10" />
          <input aria-label="Ink color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="size-7 cursor-pointer rounded border-0 bg-transparent" />
          <label className="flex items-center gap-1 px-2 text-[11px] text-white/50"><Minus className="size-3" /><input aria-label="Brush size" type="range" min="1" max="18" value={size} onChange={(event) => setSize(Number(event.target.value))} className="w-20 accent-[#4cc2ff]" /></label>
          <button type="button" aria-label="Clear canvas" onClick={clearCanvas} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><Trash2 className="size-4" /></button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#0d0d0d] p-6">
        <div className="relative min-h-[720px] min-w-[1100px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl" style={{ backgroundImage: 'radial-gradient(#ffffff18 1px, transparent 1px)', backgroundSize: `${24 * zoom}px ${24 * zoom}px` }}>
          <canvas ref={canvasRef} className="absolute inset-0 size-full touch-none cursor-crosshair" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={() => { drawingRef.current = false; }} onPointerCancel={() => { drawingRef.current = false; }} />
        </div>
      </div>
      <footer className="flex h-11 shrink-0 items-center justify-between border-t border-white/10 px-4 text-xs text-white/45">
        <span>Draw, sketch, and capture ideas on an infinite canvas</span>
        <div className="flex items-center gap-1"><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))} className="rounded p-1.5 hover:bg-white/10"><ZoomOut className="size-4" /></button><span className="w-10 text-center">{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2, value + 0.1))} className="rounded p-1.5 hover:bg-white/10"><ZoomIn className="size-4" /></button><button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="ml-1 rounded p-1.5 hover:bg-white/10"><RotateCcw className="size-4" /></button><Redo2 className="ml-2 size-4 opacity-30" /></div>
      </footer>
    </main>
  );
};
