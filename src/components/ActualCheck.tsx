import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckItem as ApiCheckItem, uploadPmAttachment, WorkOrderAttachment } from '@/services/api';
import { 
  fileToBase64, 
  getFileExtension, 
  getAssetSequenceNumber, 
  extractInfoFromFileName,
  generateAttachmentFileName
} from '@/utils/fileUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface CheckItem {
  id: string;
  sequence: number;
  title: string;
  standard: string;
  status: 'v' | 'x' | 'na' | '';
  note?: string;
  media: Media[];
  assetNum?: string;
  compositeId?: string;
  wonum?: string;
}

interface AssetGroup {
  assetNum: string;
  assetName: string;
  checkItems: CheckItem[];
  isExpanded: boolean;
  sequence: number;
}

interface ActualCheckProps {
  workOrderId: string;
  onCompleteStatusChange?: (isComplete: boolean, checkItems: ApiCheckItem[]) => void;
  initialCheckItems?: ApiCheckItem[];
  assets?: string;
  route?: string;
  attachments?: WorkOrderAttachment[];
  isEditable?: boolean;
  nonEditableReason?: string;
}

// 防抖函數
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

const ActualCheck: React.FC<ActualCheckProps> = ({ 
  workOrderId, 
  onCompleteStatusChange, 
  initialCheckItems,
  assets,
  route,
  attachments,
  isEditable = true,
  nonEditableReason = ''
}) => {
  const mapApiCheckItemsToInternal = (apiItems?: ApiCheckItem[]): CheckItem[] => {
    if (!apiItems || apiItems.length === 0) {
      return [];
    }
    
    console.log('API檢查項目:', apiItems);
    
    return apiItems.map((item, index) => {
      const assetNum = item.assetNum || 'Default';
      console.log(`處理API檢查項目: ID=${item.id}, assetNum=${assetNum}`);
      
      return {
        id: item.id,
        sequence: index,
        title: item.name,
        standard: item.standard,
        status: item.result as ('v' | 'x' | 'na' | ''),
        note: item.remarks,
        media: [],
        assetNum: assetNum,
        compositeId: `${item.id}_${assetNum}`,
        wonum: item.wonum || workOrderId
      };
    });
  };

  const [checkItems, setCheckItems] = useState<CheckItem[]>(() => 
    mapApiCheckItemsToInternal(initialCheckItems)
  );
  
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [isMultiAssetMode, setIsMultiAssetMode] = useState<boolean>(false);

  const [expandedMedia, setExpandedMedia] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // 追踪之前的檢查項目狀態
  const prevCheckItemsRef = useRef<string>('');

  // 增加計數器，用於生成附件檔名中的流水號
  const [attachmentCounters, setAttachmentCounters] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (checkItems.length > 0) {
      const assetNums = [...new Set(checkItems.map(item => item.assetNum || 'Default'))];
      
      const isMultiAsset = assetNums.length > 1 || !!route;
      setIsMultiAssetMode(isMultiAsset);
      
      if (isMultiAsset) {
        const groupedItems: { [key: string]: CheckItem[] } = {};
        checkItems.forEach(item => {
          const assetNum = item.assetNum || 'Unknown';
          if (!groupedItems[assetNum]) {
            groupedItems[assetNum] = [];
          }
          groupedItems[assetNum].push(item);
        });
        
        const expandedAssetNums = new Set(
          assetGroups
            .filter(group => group.isExpanded)
            .map(group => group.assetNum)
        );
        
        const groups: AssetGroup[] = Object.entries(groupedItems).map(([assetNum, items], index) => {
          const firstSequence = items.length > 0 ? Math.floor(items[0].sequence / 10) * 10 : 0;
          
          const sortedItems = [...items].sort((a, b) => a.sequence - b.sequence);
          
          const isExpanded = expandedAssetNums.has(assetNum) || 
                            (expandedAssetNums.size === 0 && index === 0);
          
          return {
            assetNum,
            assetName: assetNum === 'Unknown' || assetNum === 'Default' ? 'General Inspection Items' : `Equipment ${assetNum}`,
            checkItems: sortedItems,
            isExpanded: isExpanded,
            sequence: firstSequence
          };
        });
        
        groups.sort((a, b) => a.sequence - b.sequence);
        
        setAssetGroups(groups);
      } else {
        const sortedItems = [...checkItems].sort((a, b) => a.sequence - b.sequence);
        
        setAssetGroups([{
          assetNum: assets || 'Default',
          assetName: assets || 'Equipment Inspection',
          checkItems: sortedItems,
          isExpanded: true,
          sequence: 0
        }]);
      }
    }
  }, [checkItems, route, assets]);

  useEffect(() => {
    setCheckItems(mapApiCheckItemsToInternal(initialCheckItems));
  }, [initialCheckItems]);

  // 確保在初始渲染時就計算和通知完成狀態
  useEffect(() => {
    // 在初始渲染時檢查是否所有項目都已完成
    if (checkItems.length > 0) {
      const isComplete = checkItems.every(item => item.status !== '');
      
      const apiCheckItems: ApiCheckItem[] = checkItems.map(item => ({
        id: item.id,
        name: item.title,
        standard: item.standard,
        result: item.status,
        remarks: item.note || '',
        assetNum: item.assetNum,
        wonum: item.wonum
      }));
      
      // 馬上通知父組件初始狀態
      onCompleteStatusChange?.(isComplete, apiCheckItems);
    }
  }, []); // 只在初始渲染時執行一次

  // 分離檢查狀態和筆記的更新
  useEffect(() => {
    if (checkItems.length > 0) {
      const isComplete = checkItems.every(item => item.status !== '');
      
      const apiCheckItems: ApiCheckItem[] = checkItems.map(item => ({
        id: item.id,
        name: item.title,
        standard: item.standard,
        result: item.status,
        remarks: item.note || '',
        assetNum: item.assetNum,
        wonum: item.wonum
      }));
      
      // 檢查是否真的需要更新，只有當status變化時才立即通知
      const statusesOnly = checkItems.map(item => ({ id: item.id, status: item.status }));
      const statusesString = JSON.stringify(statusesOnly);
      
      // 使用完整項目的字符串來追蹤所有變化
      const checkItemsString = JSON.stringify(apiCheckItems);
      
      // 如果狀態或完整內容變化了，則更新
      if (checkItemsString !== prevCheckItemsRef.current) {
        prevCheckItemsRef.current = checkItemsString;
        onCompleteStatusChange?.(isComplete, apiCheckItems);
      }
    }
  }, [checkItems, onCompleteStatusChange, workOrderId]);

  // 修改防抖函數為獨立函數，不需要在每次渲染時重新創建
  const debounceMap = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});

  const handleNoteChange = (itemId: string, assetNum: string, note: string) => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    // 清除先前的防抖計時器
    if (debounceMap.current[compositeId]) {
      clearTimeout(debounceMap.current[compositeId]);
    }

    // 設置新的防抖計時器
    debounceMap.current[compositeId] = setTimeout(() => {
      const updatedItems = checkItems.map(item => {
        if (item.compositeId === compositeId) {
          return { ...item, note };
        }
        return item;
      });
      
      setCheckItems(updatedItems);
      updateAssetGroupWithItems(updatedItems);
    }, 300);
  };

  // 為每個textarea創建ref
  const textareaRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({});

  const handleStatusChange = (itemId: string, assetNum: string, newStatus: 'v' | 'x' | 'na') => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        const status = item.status === newStatus ? '' as const : newStatus;
        return { ...item, status };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    
    updateAssetGroupWithItems(updatedItems);
  };
  
  const updateAssetGroupWithItems = (updatedItems: CheckItem[]) => {
    setAssetGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        checkItems: updatedItems.filter(item => 
          (item.assetNum || 'Default') === group.assetNum
        )
      }))
    );
  };
  
  const toggleAssetGroup = (assetNum: string) => {
    setAssetGroups(groups =>
      groups.map(group =>
        group.assetNum === assetNum
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const triggerFileInput = (itemId: string, assetNum: string, type: 'image' | 'video') => {
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    setMediaType(type);
    setActiveItemId(`${assetNum}_${itemId}`);
    
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    if (!activeItemId || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    try {
      // 解析 activeItemId (格式: itemId_assetNum)
      const [itemId, assetNum] = activeItemId.split('_');
      
      // 取得所有資產編號
      const availableAssets = [...new Set(checkItems.map(item => item.assetNum || 'Default'))].filter(num => 
        num && num !== 'Default' && num !== 'Unknown'
      );
      
      // 獲取要用於assetSeq的資產號 - 使用工具函數
      const assetSequence = getAssetSequenceNumber(assetNum, availableAssets);
      
      // 生成流水號
      const counterKey = `${assetSequence}_${itemId}`;
      const currentCounter = attachmentCounters[counterKey] || 0;
      const newCounter = currentCounter + 1;
      
      // 更新計數器狀態
      setAttachmentCounters(prev => ({
        ...prev,
        [counterKey]: newCounter
      }));
      
      // 流水號補零至三位數
      const serialNumber = newCounter.toString().padStart(3, '0');
      
      // 生成檔案名稱 - 使用工具函數
      const extension = getFileExtension(file.name);
      const fileName = generateAttachmentFileName(assetSequence, itemId, serialNumber, extension);
      
      // 轉換成 base64 - 使用工具函數
      const base64Content = await fileToBase64(file);
      
      // 準備 API 參數
      const attachmentData = {
        fileName,
        fileType: file.type,
        fileContent: base64Content,
        description: `檢查項目 ${itemId} 的照片`,
        wonum: workOrderId,
        checkItemId: itemId,
        assetSeq: assetSequence,
        photoSeq: serialNumber
      };
      
      // 呼叫 API 上傳附件
      const result = await uploadPmAttachment(attachmentData);
      console.log('附件上傳結果:', result);
      
      // 繼續原有的邏輯：更新 UI 顯示
      const updatedItems = checkItems.map(item => {
        if (item.compositeId === activeItemId) {
          return {
            ...item,
            media: [...item.media, {
              id: `${Date.now()}`,
              type: mediaType,
              url
            }]
          };
        }
        return item;
      });
      
      setCheckItems(updatedItems);
      updateAssetGroupWithItems(updatedItems);
      
    } catch (error) {
      console.error('上傳附件失敗:', error);
      // 即使上傳失敗，仍然在本地顯示圖片
      const updatedItems = checkItems.map(item => {
        if (item.compositeId === activeItemId) {
          return {
            ...item,
            media: [...item.media, {
              id: `${Date.now()}`,
              type: mediaType,
              url
            }]
          };
        }
        return item;
      });
      
      setCheckItems(updatedItems);
      updateAssetGroupWithItems(updatedItems);
    }
    
    e.target.value = '';
  };

  const removeMedia = (itemId: string, assetNum: string, mediaId: string) => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        return {
          ...item,
          media: item.media.filter(m => m.id !== mediaId)
        };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
    
    if (expandedMedia?.id === mediaId) {
      setExpandedMedia(null);
    }
  };

  const openCamera = (itemId: string, assetNum: string, type: 'image' | 'video') => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    setActiveItemId(compositeId);
    setMediaType(type);
    
    if (type === 'image') {
      fileInputRef.current?.setAttribute('capture', 'environment');
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.setAttribute('capture', 'environment');
      videoInputRef.current?.click();
    }
  };

  const hasStatus = (item: CheckItem) => item.status !== '';
  
  const handleMarkAllAsChecked = (assetNum?: string) => {
    const targetItems = checkItems.filter(item => !assetNum || item.assetNum === assetNum);
    
    const allMarkedAsV = targetItems.every(item => item.status === 'v');
    
    const updatedItems = checkItems.map(item => {
      if (!assetNum || item.assetNum === assetNum) {
        return { ...item, status: allMarkedAsV ? '' as const : 'v' as const };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
  };
  
  const getAssetGroupStatus = (group: AssetGroup) => {
    const total = group.checkItems.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0, statusCounts: { v: 0, x: 0, na: 0 } };
    
    const completed = group.checkItems.filter(item => item.status !== '').length;
    const percentage = Math.round((completed / total) * 100);
    
    const statusCounts = {
      v: group.checkItems.filter(item => item.status === 'v').length,
      x: group.checkItems.filter(item => item.status === 'x').length,
      na: group.checkItems.filter(item => item.status === 'na').length
    };
    
    return { completed, total, percentage, statusCounts };
  };

  const getAssetGroupStatusStyle = (status: ReturnType<typeof getAssetGroupStatus>) => {
    if (status.percentage === 100) {
      if (status.statusCounts?.x > 0) {
        return 'bg-red-50 border-l-4 border-l-red-500';
      } else if (status.statusCounts?.na === status.total) {
        return 'bg-green-50 border-l-4 border-l-green-500';
      } else {
        return 'bg-green-50 border-l-4 border-l-green-500';
      }
    }
    return '';
  };

  // 處理附件並將它們分配給對應的檢查項目
  useEffect(() => {
    if (attachments && attachments.length > 0 && checkItems.length > 0) {
      // 添加除錯信息
      console.log('附件數據:', attachments);
      console.log('檢查項目數據:', checkItems);

      const updatedItems = [...checkItems];
      
      // 輸出所有資產組的assetNum，方便除錯
      console.log('可用的資產編號:');
      const availableAssetNums = [...new Set(updatedItems.map(item => item.assetNum || 'Default'))];
      console.log(availableAssetNums);
      
      // 將附件分配給對應的檢查項目
      attachments.forEach(attachment => {
        const { checkItemId, photoSeq } = attachment;
        // 使用 let 來宣告 assetSeqToUse，以便我們可以修改它
        let assetSeqToUse = attachment.assetSeq || '0';
        console.log(`處理附件: ${attachment.fileName}, checkItemId: ${checkItemId}, assetSeq: ${assetSeqToUse}`);
        
        let targetItemId = checkItemId || '';
        
        // 嘗試從附件的數據中獲取正確的檢查項目ID
        if (targetItemId.includes('.')) {
          // 如果 checkItemId 包含副檔名，需要清理
          targetItemId = targetItemId.split('.')[0];
        }
        
        // 從檔名解析資訊 - 使用工具函數
        if (attachment.fileName) {
          const [extractedAssetSeq, extractedItemId] = extractInfoFromFileName(attachment.fileName);
          
          console.log(`從檔名提取: 資產序號=${extractedAssetSeq}, 項目ID=${extractedItemId}`);
          
          // 當API返回的checkItemId為空或包含非數字字符時，使用從檔名提取的值
          if (!targetItemId || !/^\d+$/.test(targetItemId)) {
            targetItemId = extractedItemId;
          }
          
          // 確保assetSeq有正確的值
          if ((!assetSeqToUse || assetSeqToUse === '0') && extractedAssetSeq !== '0') {
            // 使用從檔名提取的資產序號
            assetSeqToUse = extractedAssetSeq;
          }
        }
        
        console.log(`最終使用的參數: 檢查項目ID=${targetItemId}, 資產序號=${assetSeqToUse}`);
        
        // 現在嘗試找出對應的檢查項目
        if (targetItemId) {
          // 映射資產序號到實際資產編號
          // 假設assetSeq="1"對應第一個資產，assetSeq="2"對應第二個資產
          const availableAssets = [...new Set(updatedItems.map(item => item.assetNum || 'Default'))].filter(num => 
            num && num !== 'Default' && num !== 'Unknown'
          );
          availableAssets.sort(); // 確保有序
          
          // 根據assetSeq和可用資產數量來判斷應該使用哪個資產
          let targetAssetNum = 'Default';
          const seqNumber = parseInt(assetSeqToUse, 10);
          
          if (!isNaN(seqNumber) && seqNumber > 0 && availableAssets.length >= seqNumber) {
            // assetSeq從1開始計數，陣列索引從0開始
            targetAssetNum = availableAssets[seqNumber - 1];
            console.log(`資產序號${assetSeqToUse}映射到資產編號: ${targetAssetNum}`);
          } else if (assetSeqToUse === '0' && availableAssets.length > 0) {
            // 如果assetSeq為0，預設使用第一個資產
            targetAssetNum = availableAssets[0];
            console.log(`資產序號0預設映射到第一個資產: ${targetAssetNum}`);
          }
          
          console.log(`尋找檢查項目ID=${targetItemId}，目標資產=${targetAssetNum}`);
          
          // 嚴格匹配，優先嘗試ID和資產號都匹配
          let itemIndex = updatedItems.findIndex(item => {
            const idMatches = item.id === targetItemId;
            const assetMatches = item.assetNum === targetAssetNum;
            return idMatches && assetMatches;
          });
          
          console.log(`嚴格匹配結果 (ID=${targetItemId} 和 資產=${targetAssetNum}): ${itemIndex}`);
          
          // 如果嚴格匹配失敗，根據不同情況進行備選匹配
          if (itemIndex === -1) {
            // 如果提供了明確的資產序號但找不到對應項，先嘗試用ID匹配任何資產
            if (seqNumber > 0) {
              // 嘗試在目標資產中找相同ID的任何項目
              itemIndex = updatedItems.findIndex(item => 
                item.id === targetItemId && item.assetNum === targetAssetNum
              );
              console.log(`在目標資產中按ID匹配: ${itemIndex}`);
              
              // 如果仍找不到，則嘗試在所有資產中按ID匹配
              if (itemIndex === -1) {
                itemIndex = updatedItems.findIndex(item => item.id === targetItemId);
                console.log(`所有資產中按ID匹配: ${itemIndex}`);
              }
            } else {
              // 如果assetSeq為0或未提供，直接按ID匹配
              itemIndex = updatedItems.findIndex(item => item.id === targetItemId);
              console.log(`僅按ID匹配: ${itemIndex}`);
            }
          }
          
          if (itemIndex !== -1) {
            // 檢查該媒體是否已存在
            const mediaExists = updatedItems[itemIndex].media.some(m => 
              m.url === attachment.url || m.id === attachment.id.toString()
            );
            
            if (!mediaExists) {
              console.log(`添加附件到項目: ${updatedItems[itemIndex].id}, 資產: ${updatedItems[itemIndex].assetNum}`);
              
              // 判斷是圖片還是視頻
              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(attachment.fileName);
              const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(attachment.fileName);
              
              if (isImage || isVideo) {
                updatedItems[itemIndex].media.push({
                  id: attachment.id.toString(),
                  type: isImage ? 'image' : 'video',
                  url: attachment.url
                });
                
                console.log('成功添加附件');
              }
            } else {
              console.log('附件已存在，跳過');
            }
          } else {
            console.log('沒有找到匹配的檢查項目，放棄處理此附件');
          }
        }
      });
      
      setCheckItems(updatedItems);
      updateAssetGroupWithItems(updatedItems);
    }
  }, [attachments, checkItems.length]);

  // 處理檢查項目結果變更
  const handleResultChange = (compositeId: string, result: string) => {
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        return { ...item, status: result as ('v' | 'x' | 'na' | '') };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
  };

  // 處理檢查項目備註變更
  const handleRemarkChange = (compositeId: string, remark: string) => {
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        return { ...item, note: remark };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
  };

  // 刪除媒體項目
  const handleDeleteMedia = (itemCompositeId: string, mediaId: string) => {
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === itemCompositeId) {
        return {
          ...item,
          media: item.media.filter(media => media.id !== mediaId)
        };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleFileChange}
      />

      {expandedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setExpandedMedia(null)}
              className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-800 z-10"
            >
              ✕
            </button>
            {expandedMedia.type === 'image' ? (
              <img
                src={expandedMedia.url}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={expandedMedia.url}
                controls
                className="max-w-full max-h-[90vh]"
              />
            )}
          </div>
        </div>
      )}

      <div className="mx-auto p-4 max-w-4xl">
        {!isMultiAssetMode && checkItems.length > 0 && checkItems.some(item => item.assetNum) && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => handleMarkAllAsChecked()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {checkItems.every(item => item.status === 'v') ? 'Unmark All' : 'Mark All as Passed'}
            </button>
          </div>
        )}
        
        {assetGroups.map((group, groupIndex) => {
          const status = getAssetGroupStatus(group);
          const statusStyle = getAssetGroupStatusStyle(status);
          
          return (
            <div key={group.assetNum} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <div 
                className={`p-4 border-b border-gray-200 flex justify-between items-center ${statusStyle}`}
              >
                <div className="flex-1 cursor-pointer" onClick={() => toggleAssetGroup(group.assetNum)}>
                  <h2 className="text-lg font-medium text-gray-800">
                    {assetGroups.length > 1 ? `${(groupIndex + 1).toString().padStart(2, '0')}. ${group.assetName}` : group.assetName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {status.completed} / {status.total} items completed ({status.percentage}%)
                    {status.completed > 0 && status.statusCounts && (
                      <span className="ml-2">
                        {status.statusCounts.v > 0 && (
                          <span className="text-green-600 mr-2">V: {status.statusCounts.v}</span>
                        )}
                        {status.statusCounts.x > 0 && (
                          <span className="text-red-600 mr-2">X: {status.statusCounts.x}</span>
                        )}
                        {status.statusCounts.na > 0 && (
                          <span className="text-gray-500">N/A: {status.statusCounts.na}</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {group.checkItems.length > 0 && group.assetNum && group.assetNum !== 'Default' && group.assetNum !== 'Unknown' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllAsChecked(group.assetNum);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {group.checkItems.every(item => item.status === 'v') ? 'Unmark V' : 'All V'}
                    </button>
                  )}
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className={`h-full rounded-full ${
                        status.statusCounts && status.statusCounts.x > 0 
                          ? 'bg-red-500' 
                          : status.statusCounts && status.statusCounts.na === status.total 
                            ? 'bg-gray-500' 
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAssetGroup(group.assetNum);
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {group.isExpanded && (
                <div className="p-4">
                  <div className="space-y-6">
                    {group.checkItems.map((item) => (
                      <div key={item.compositeId || item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className={`p-4 ${hasStatus(item) ? (
                          item.status === 'v' 
                            ? 'bg-green-50 border-l-4 border-l-green-500' 
                            : item.status === 'x' 
                              ? 'bg-red-50 border-l-4 border-l-red-500' 
                              : 'bg-gray-50 border-l-4 border-l-gray-500'
                        ) : 'bg-white'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-medium text-gray-800">
                                {item.id}. {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.standard}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResultChange(item.compositeId || '', 'v');
                                }}
                                className={`rounded-md px-2 py-1 text-xs font-medium ${
                                  item.status === 'v'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                V
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResultChange(item.compositeId || '', 'x');
                                }}
                                className={`rounded-md px-2 py-1 text-xs font-medium ${
                                  item.status === 'x'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                X
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResultChange(item.compositeId || '', 'na');
                                }}
                                className={`rounded-md px-2 py-1 text-xs font-medium ${
                                  item.status === 'na'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>

                          {item.status && (
                            <div className="mt-4">
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  key={item.id + '-notes'}
                                  rows={2}
                                  defaultValue={item.note || ''}
                                  onChange={(e) => handleRemarkChange(item.compositeId || '', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Add any relevant notes or observations"
                                ></textarea>
                              </div>

                              <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Media
                                </label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerFileInput(item.id, item.assetNum || 'Default', 'image');
                                    }}
                                    className={`px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs hover:bg-blue-100 flex items-center ${!isEditable ? 'border-gray-300 text-gray-400 cursor-not-allowed' : ''}`}
                                    disabled={!isEditable}
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upload Image
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openCamera(item.id, item.assetNum || 'Default', 'image');
                                    }}
                                    className={`px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs hover:bg-blue-100 flex items-center ${!isEditable ? 'border-gray-300 text-gray-400 cursor-not-allowed' : ''}`}
                                    disabled={!isEditable}
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Take Photo
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerFileInput(item.id, item.assetNum || 'Default', 'video');
                                    }}
                                    className={`px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs hover:bg-blue-100 flex items-center ${!isEditable ? 'border-gray-300 text-gray-400 cursor-not-allowed' : ''}`}
                                    disabled={!isEditable}
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Upload Video
                                  </button>
                                </div>
                              </div>

                              {item.media.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  {item.media.map((media) => (
                                    <div key={media.id} className="relative group">
                                      <div
                                        className="h-20 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedMedia(media);
                                        }}
                                      >
                                        {media.type === 'image' ? (
                                          <img
                                            src={media.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-gray-800">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      {isEditable && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMedia(item.compositeId || '', media.id);
                                          }}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActualCheck; 