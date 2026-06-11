'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SignaturePadProps {
  /** 確認簽名後回傳 dataURL（image/png base64） */
  onConfirm: (dataUrl: string) => void;
  onCancel?: () => void;
  /** 簽名區高度 px，預設 200 */
  height?: number;
}

/**
 * 電子簽名元件（canvas + Pointer Events，零外部相依）。
 * 用於完工 / 簽核留證；輸出 PNG dataURL，可再上傳為工單附件。
 */
const SignaturePad: React.FC<SignaturePadProps> = ({ onConfirm, onCancel, height = 200 }) => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const t = (zh: string, en: string) => (language === 'en' ? en : zh);

  // 依裝置 devicePixelRatio 設定 canvas 解析度，避免模糊
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#111827';
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    lastPoint.current = getPoint(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const p = getPoint(e);
    if (ctx && lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      setHasInk(true);
    }
    lastPoint.current = p;
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    lastPoint.current = null;
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch {}
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasInk(false);
    }
  };

  const confirm = () => {
    if (!hasInk || !canvasRef.current) return;
    onConfirm(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height, touchAction: 'none' }}
          className="block rounded-lg"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center">
        {t('請在上方框內簽名', 'Please sign in the box above')}
      </p>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={clear}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {t('清除', 'Clear')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t('取消', 'Cancel')}
          </button>
        )}
        <button
          type="button"
          onClick={confirm}
          disabled={!hasInk}
          className="flex-1 py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
        >
          {t('確認簽名', 'Confirm')}
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
