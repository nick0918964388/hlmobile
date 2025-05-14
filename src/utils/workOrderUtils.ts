// 工單工具函數

/**
 * 檢查工單是否可編輯 
 * @param status 工單狀態
 * @returns 返回工單是否可編輯
 */
export const isWorkOrderEditable = (status: string): boolean => {
  // 當工單狀態為WFA時不可編輯
  if (status === 'WFA') {
    return false;
  }
  
  // 其他狀態可編輯
  return true;
};

/**
 * 獲取工單不可編輯的理由
 * @param status 工單狀態
 * @returns 返回工單不可編輯的理由
 */
export const getWorkOrderNonEditableReason = (status: string): string => {
  if (status === 'WFA') {
    return 'Work order status is Waiting for Approval (WFA), cannot modify any content';
  }
  
  return '';
}; 