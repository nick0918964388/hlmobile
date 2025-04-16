'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();

  // 翻譯
  const translations = {
    title: {
      zh: '提交工單',
      en: 'Submit Work Order'
    },
    commentLabel: {
      zh: '評論（選填）',
      en: 'Comment (Optional)'
    },
    placeholder: {
      zh: '請輸入評論...',
      en: 'Enter your comment...'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    submit: {
      zh: '提交',
      en: 'Submit'
    },
    submitting: {
      zh: '提交中...',
      en: 'Submitting...'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(comment);
      setComment('');
    } catch (error) {
      console.error('Error submitting work order:', error);
    } finally {
      setIsSubmitting(false);
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
          <h3 className="text-lg font-medium">{t('title')}</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('commentLabel')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('placeholder')}
            />
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal; 