'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/services/api';

interface DataSaveHookProps<T> {
  // 初始資料
  initialData: T | null;
  // 資料變更的回調
  onSave?: (data: Partial<T>) => Promise<void>;
  // API 端點
  endpoint?: string;
}

interface DataSaveHookReturn<T> {
  // 當前資料
  data: T | null;
  // 設置新資料
  setData: (newData: T | ((prev: T | null) => T)) => void;
  // 是否已變更
  isDirty: boolean;
  // 保存資料
  saveData: () => Promise<void>;
  // 重置資料
  resetData: () => void;
  // 保存中狀態
  isSaving: boolean;
  // 錯誤狀態
  error: Error | null;
}

export function useDataSave<T extends Record<string, any>>({
  initialData,
  onSave,
  endpoint
}: DataSaveHookProps<T>): DataSaveHookReturn<T> {
  // 當前資料狀態
  const [data, setData] = useState<T | null>(initialData);
  // 原始資料參考
  const [originalData, setOriginalData] = useState<T | null>(initialData);
  // 保存中狀態
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // 錯誤狀態
  const [error, setError] = useState<Error | null>(null);
  // 是否已變更
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // 當初始資料更新時，同步更新原始資料和當前資料
  useEffect(() => {
    if (initialData !== null) {
      setOriginalData(initialData);
      setData(initialData);
      setIsDirty(false);
    }
  }, [initialData]);

  // 當資料變更時，檢查是否與原始資料不同
  useEffect(() => {
    if (data === null || originalData === null) {
      setIsDirty(false);
      return;
    }

    // 使用 JSON 序列化進行深度比較
    const isDifferent = JSON.stringify(data) !== JSON.stringify(originalData);
    setIsDirty(isDifferent);
  }, [data, originalData]);

  // 在useDataSave.ts中添加資料驗證
  const validateData = (dataToValidate: T): boolean => {
    // 確認必填欄位有值
    if (!dataToValidate.id || !dataToValidate.status) {
      throw new Error("工單ID和狀態為必填項");
    }
    return true;
  };

  // 保存資料方法
  const saveData = useCallback(async () => {
    if (!isDirty || data === null || originalData === null) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 只包含變更的欄位
      const changedFields: Partial<T> = {};
      const dataKeys = Object.keys(data) as Array<keyof T>;
      
      for (const key of dataKeys) {
        if (JSON.stringify(data[key]) !== JSON.stringify(originalData[key])) {
          changedFields[key] = data[key];
        }
      }
      
      // 選擇性地進行資料驗證
      // if (Object.keys(changedFields).length > 0) {
      //   validateData(data);
      // }
      
      if (onSave) {
        await onSave(changedFields);
      } else if (endpoint) {
        await apiRequest(endpoint, 'POST', changedFields);
      } else {
        throw new Error('需要提供 onSave 或 endpoint 參數');
      }

      setOriginalData(data);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('保存資料時發生未知錯誤'));
      console.error('保存資料失敗:', err);
    } finally {
      setIsSaving(false);
    }
  }, [data, isDirty, onSave, endpoint, originalData]);

  // 重置資料方法
  const resetData = useCallback(() => {
    setData(originalData);
    setIsDirty(false);
    setError(null);
  }, [originalData]);

  return {
    data,
    setData,
    isDirty,
    saveData,
    resetData,
    isSaving,
    error
  };
} 