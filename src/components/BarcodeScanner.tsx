'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// BarcodeDetector 非標準 TS lib 型別，於此宣告最小介面
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

interface BarcodeScannerProps {
  /** 掃到條碼/QR 時回傳值（回傳後自動關閉相機） */
  onDetect: (value: string) => void;
  onCancel: () => void;
}

/**
 * 條碼 / QR 掃描元件。優先用瀏覽器原生 BarcodeDetector（Chrome / Android）。
 * 不支援時（如 iOS Safari）顯示提示並提供手動輸入，確保降級可用。
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetect, onCancel }) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string>('');
  const [manual, setManual] = useState('');
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const t = (zh: string, en: string) => (language === 'en' ? en : zh);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    const detector = new window.BarcodeDetector!({
      formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'codabar', 'data_matrix'],
    });

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0 && codes[0].rawValue) {
              stop();
              onDetect(codes[0].rawValue.trim());
              return;
            }
          } catch {
            /* 單幀偵測失敗忽略，續掃 */
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      } catch (e) {
        setError(t('無法開啟相機，請確認權限', 'Cannot access camera, check permissions'));
      }
    };
    start();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const close = () => {
    stop();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h3 className="text-white text-center mb-3">{t('掃描條碼 / QR Code', 'Scan barcode / QR')}</h3>

        {supported ? (
          <>
            <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-8 border-2 border-teal-400 rounded-lg pointer-events-none" />
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            <p className="text-gray-300 text-xs mt-2 text-center">
              {t('將條碼對準框內', 'Align the barcode within the frame')}
            </p>
          </>
        ) : (
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              {t('此裝置不支援相機掃描，請手動輸入代碼：', 'Camera scanning not supported, enter code manually:')}
            </p>
            <div className="flex gap-2">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder={t('輸入代碼', 'Enter code')}
              />
              <button
                type="button"
                onClick={() => manual.trim() && onDetect(manual.trim())}
                className="px-4 py-2 bg-teal-600 text-white rounded-md"
              >
                {t('確定', 'OK')}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={close}
          className="w-full mt-4 py-2 px-4 rounded-md text-white border border-white/40 hover:bg-white/10"
        >
          {t('取消', 'Cancel')}
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
