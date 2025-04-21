'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason: string) => Promise<void>;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onCancel }) => {
  const [reason, setReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const { language } = useLanguage();

  // 翻譯
  const translations = {
    title: {
      zh: '取消工單',
      en: 'Cancel Work Order'
    },
    reasonLabel: {
      zh: '取消原因（必填）',
      en: 'Cancellation Reason (Required)'
    },
    placeholder: {
      zh: '請輸入取消原因...',
      en: 'Enter cancellation reason...'
    },
    cancel: {
      zh: '返回',
      en: 'Back'
    },
    confirm: {
      zh: '確認取消',
      en: 'Confirm Cancellation'
    },
    cancelling: {
      zh: '處理中...',
      en: 'Processing...'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  if (!isOpen) return null;

  const handleCancelSubmit = async () => {
    if (!reason.trim()) {
      alert(language === 'zh' ? '請輸入取消原因' : 'Please enter a cancellation reason');
      return;
    }

    try {
      setIsCancelling(true);
      await onCancel(reason);
      setReason('');
    } catch (error) {
      console.error('Error cancelling work order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 對話框 */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-red-600">{t('title')}</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reasonLabel')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('placeholder')}
            />
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isCancelling}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleCancelSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            disabled={isCancelling || !reason.trim()}
          >
            {isCancelling ? t('cancelling') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal; 