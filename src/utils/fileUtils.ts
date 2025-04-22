/**
 * 檔案工具函數
 */

/**
 * 將檔案轉換為 base64 格式
 * @param file 檔案物件
 * @returns Promise<string> base64編碼的檔案內容
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // 去除 base64 前綴 (例如 "data:image/png;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('轉換失敗'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 獲取檔案副檔名
 * @param filename 檔案名稱
 * @returns string 檔案副檔名
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * 從資產編號獲取簡單的資產序號
 * @param assetNum 資產編號
 * @param availableAssets 可用的資產編號列表
 * @returns string 簡單的資產序號
 */
export const getAssetSequenceNumber = (assetNum: string, availableAssets: string[] = []): string => {
  // 如果沒有資產編號或為Default，返回"0"
  if (!assetNum || assetNum === 'Default' || assetNum === 'Unknown') {
    return '0';
  }
  
  // 確保有序
  const sortedAssets = [...availableAssets].filter(num => 
    num && num !== 'Default' && num !== 'Unknown'
  ).sort();
  
  // 獲取資產在列表中的索引+1作為序號
  const index = sortedAssets.indexOf(assetNum);
  if (index !== -1) {
    return (index + 1).toString(); // 資產序號從1開始
  }
  
  // 如果找不到資產，返回"0"
  return '0';
};

/**
 * 從檔名提取資產序號和檢查項目ID
 * @param fileName 檔案名稱
 * @returns [assetSeq, itemId] 資產序號和檢查項目ID
 */
export const extractInfoFromFileName = (fileName: string): [string, string] => {
  if (!fileName || !fileName.startsWith('CI_')) {
    return ['0', ''];
  }
  
  const parts = fileName.split('_');
  if (parts.length < 3) {
    return ['0', ''];
  }
  
  // 提取資產序號（確保是數字）
  let assetSeq = parts[1];
  if (!/^\d+$/.test(assetSeq)) {
    // 如果包含非數字，嘗試提取數字部分
    const numMatch = assetSeq.match(/^\d+/);
    assetSeq = numMatch ? numMatch[0] : '0';
  }
  
  // 提取檢查項目ID
  const itemId = parts.length >= 4 ? parts[2] : parts[1];
  
  return [assetSeq, itemId];
};

/**
 * 生成附件檔名
 * @param assetSeq 資產序號
 * @param itemId 檢查項目ID
 * @param serialNumber 流水號
 * @param extension 檔案副檔名
 * @returns string 格式化的檔名
 */
export const generateAttachmentFileName = (
  assetSeq: string,
  itemId: string,
  serialNumber: string,
  extension: string
): string => {
  return `CI_${assetSeq}_${itemId}_${serialNumber}.${extension}`;
}; 