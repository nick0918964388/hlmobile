// useDataSave 的純函式工具：dirty 判斷與變更欄位擷取

// 判斷當前資料是否與原始資料不同（深度比較）
export function isDataDirty<T>(data: T | null, originalData: T | null): boolean {
  if (data === null || originalData === null) {
    return false;
  }
  // 使用 JSON 序列化進行深度比較
  return JSON.stringify(data) !== JSON.stringify(originalData);
}

// 擷取相對於原始資料有變更的欄位
export function getChangedFields<T extends Record<string, any>>(
  data: T,
  originalData: T
): Partial<T> {
  const changedFields: Partial<T> = {};
  const dataKeys = Object.keys(data) as Array<keyof T>;

  for (const key of dataKeys) {
    if (JSON.stringify(data[key]) !== JSON.stringify(originalData[key])) {
      changedFields[key] = data[key];
    }
  }

  return changedFields;
}
