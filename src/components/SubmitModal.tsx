'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPmAttachment } from '@/services/api';
import SignaturePad from './SignaturePad';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
  /** 工單號；提供時，簽名會上傳為該工單附件 */
  workOrderId?: string;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmit, workOrderId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [showPad, setShowPad] = useState(false);
  const { language } = useLanguage();

  // 翻譯
  const translations = {
    title: { zh: '提交工單', en: 'Submit Work Order' },
    commentLabel: { zh: '評論（選填）', en: 'Comment (Optional)' },
    placeholder: { zh: '請輸入評論...', en: 'Enter your comment...' },
    cancel: { zh: '取消', en: 'Cancel' },
    submit: { zh: '提交', en: 'Submit' },
    submitting: { zh: '提交中...', en: 'Submitting...' },
    signature: { zh: '簽名（選填）', en: 'Signature (Optional)' },
    addSignature: { zh: '新增簽名', en: 'Add signature' },
    reSign: { zh: '重新簽名', en: 'Re-sign' },
    signed: { zh: '已簽名', en: 'Signed' },
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // 若有簽名且有工單號，先上傳簽名為附件（失敗不阻擋提交，僅記錄）
      if (signature && workOrderId) {
        try {
          await uploadPmAttachment({
            fileName: `signature_${workOrderId}_${Date.now()}.png`,
            fileType: 'image/png',
            fileContent: signature,
            description: language === 'en' ? 'Completion signature' : '完工簽名',
            wonum: workOrderId,
          });
        } catch (e) {
          console.error('簽名上傳失敗:', e);
        }
      }
      await onSubmit(comment);
      setComment('');
      setSignature(null);
    } catch (error) {
      console.error('Error submitting work order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* 對話框 */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-auto">
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
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('placeholder')}
            />
          </div>

          {/* 簽名區 */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('signature')}
            </label>
            {showPad ? (
              <SignaturePad
                height={180}
                onConfirm={(dataUrl) => {
                  setSignature(dataUrl);
                  setShowPad(false);
                }}
                onCancel={() => setShowPad(false)}
              />
            ) : signature ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signature} alt="signature" className="h-16 border border-gray-200 rounded bg-white" />
                <span className="text-sm text-green-600">✓ {t('signed')}</span>
                <button
                  type="button"
                  onClick={() => setShowPad(true)}
                  className="text-sm text-teal-600 underline"
                >
                  {t('reSign')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPad(true)}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"
              >
                ✍️ {t('addSignature')}
              </button>
            )}
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
