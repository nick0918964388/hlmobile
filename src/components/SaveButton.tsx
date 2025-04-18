'use client';

import React from 'react';

interface SaveButtonProps {
  // 是否已變更
  isDirty: boolean;
  // 是否正在保存
  isSaving: boolean;
  // 保存操作
  onSave: () => Promise<void>;
  // 按鈕文字
  label?: string;
  // 保存中文字
  savingLabel?: string;
  // 按鈕類別
  className?: string;
  // 禁用按鈕的條件
  disabled?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  isDirty,
  isSaving,
  onSave,
  label = '保存',
  savingLabel = '保存中...',
  className = '',
  disabled = false
}) => {
  // 基本按鈕類別
  const baseClasses = 'px-4 py-2 rounded-md text-white font-medium transition-all duration-200';
  
  // 啟用狀態的類別
  const enabledClasses = 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800';
  
  // 禁用狀態的類別
  const disabledClasses = 'bg-gray-400 cursor-not-allowed opacity-60';
  
  // 保存中狀態的類別
  const savingClasses = 'bg-blue-500 cursor-wait';
  
  // 決定按鈕的類別
  const buttonClasses = `${baseClasses} ${
    isSaving 
      ? savingClasses 
      : !isDirty || disabled 
        ? disabledClasses 
        : enabledClasses
  } ${className}`;

  // 處理按鈕點擊
  const handleClick = async () => {
    if (!isDirty || isSaving || disabled) {
      return;
    }
    
    await onSave();
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      disabled={!isDirty || isSaving || disabled}
    >
      {isSaving ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {savingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default SaveButton; 