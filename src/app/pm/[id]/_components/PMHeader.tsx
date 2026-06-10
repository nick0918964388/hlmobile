'use client';

import { PMWorkOrderDetail } from '@/services/api';

interface PMHeaderProps {
  workOrder: PMWorkOrderDetail;
  language: 'zh' | 'en';
  isDirty: boolean;
  isEditable: boolean;
  isSubmitting: boolean;
  nonEditableReason: string;
  saveLabel: string;
  actionButtonText: string;
  statusDisplay: string;
  statusColor: string;
  onGoBack: () => void;
  onSave: () => void;
  onComplete: () => void;
}

export default function PMHeader({
  workOrder,
  language,
  isDirty,
  isEditable,
  isSubmitting,
  nonEditableReason,
  saveLabel,
  actionButtonText,
  statusDisplay,
  statusColor,
  onGoBack,
  onSave,
  onComplete,
}: PMHeaderProps) {
  return (
    <div className="flex-none bg-white">
      {/* 標題列 */}
      <div className="h-14 flex items-center px-4 border-b">
        <button onClick={onGoBack} className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-4 text-xl font-medium truncate">{workOrder.id}</div>
        <div className="flex-1"></div>
        <div className="flex space-x-2">
          <button
            onClick={onSave}
            disabled={!isDirty || !isEditable}
            className={`border px-3 py-1 rounded ${
              isDirty && isEditable
                ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                : "border-gray-300 text-gray-300 cursor-not-allowed"
            }`}
          >
            {saveLabel}
          </button>
          <button
            onClick={onComplete}
            disabled={isSubmitting || !isEditable}
            className={`bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 ${(isSubmitting || !isEditable) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting
              ? (language === 'zh' ? '處理中...' : 'Processing...')
              : actionButtonText
            }
          </button>
        </div>
      </div>

      {/* 工單狀態 */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${statusColor}`}></span>
          <span>{statusDisplay}</span>

          {/* 不可編輯提示 */}
          {!isEditable && (
            <span className="ml-2 text-sm text-red-500">{nonEditableReason}</span>
          )}
        </div>
      </div>
    </div>
  );
}
