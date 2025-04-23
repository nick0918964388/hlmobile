'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPmAttachment, WorkOrderAttachment } from '@/services/api';
import { pmApi } from '@/services/api';
import api from '@/services/api'; // 引入完整的api服務
import { 
  fileToBase64, 
  getFileExtension, 
  extractInfoFromFileName,
  generateAttachmentFileName
} from '@/utils/fileUtils';

interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface CMActualProps {
  cmId: string;
  onCompleteStatusChange?: (isComplete: boolean) => void;
  onFormChange?: (isDirty: boolean) => void;
  onFormDataChange?: (formData: {
    failureDetails: string;
    repairMethod: string;
    isCompleted: boolean;
    downtimeHours: number | string;
    downtimeMinutes: number | string;
  }) => void;
  initialData?: {
    failureDetails?: string;
    repairMethod?: string;
    isCompleted?: boolean;
    downtimeHours?: number | string;
    downtimeMinutes?: number | string;
  };
  equipmentName?: string; // 新增：用於LLM提示
  abnormalType?: string;  // 新增：用於LLM提示
}

export default function CMActual({ cmId, onCompleteStatusChange, onFormChange, onFormDataChange, initialData, equipmentName, abnormalType }: CMActualProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    failureDetails: '',
    repairMethod: '',
    isCompleted: false,
    downtimeHours: '0',
    downtimeMinutes: '0'
  });
  const [expandedMedia, setExpandedMedia] = useState<Media | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const initializedRef = useRef(false);
  
  // 新增用於跟踪原始表單數據
  const [originalFormData, setOriginalFormData] = useState({
    failureDetails: '',
    repairMethod: '',
    isCompleted: false,
    downtimeHours: '0',
    downtimeMinutes: '0'
  });
  const [originalMedia, setOriginalMedia] = useState<Media[]>([]);

  // --- 新增 Suggestion 相關狀態 ---
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false); // 追蹤焦點
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 用於 debounce

  // 檢測表單內容變更
  useEffect(() => {
    // 檢查表單是否有變更
    const isDataChanged = 
      formData.failureDetails !== originalFormData.failureDetails ||
      formData.repairMethod !== originalFormData.repairMethod ||
      formData.isCompleted !== originalFormData.isCompleted ||
      formData.downtimeHours !== originalFormData.downtimeHours ||
      formData.downtimeMinutes !== originalFormData.downtimeMinutes ||
      media.length !== originalMedia.length;
    
    // 通知父組件表單變更狀態
    onFormChange?.(isDataChanged);
  }, [formData, media, originalFormData, originalMedia, onFormChange]);

  // Check completion status when form content changes
  useEffect(() => {
    const isComplete = formData.failureDetails.trim() !== '' && formData.repairMethod.trim() !== '';
    onCompleteStatusChange?.(isComplete);
    
    // Save to localStorage
    const dataToSave = {
      formData,
      media
    };
    localStorage.setItem(`cmActual_${cmId}`, JSON.stringify(dataToSave));
  }, [formData, media, cmId, onCompleteStatusChange]);

  // Load saved data or use initial data from API
  useEffect(() => {
    // 避免重複初始化
    if (initializedRef.current) return;
    
    // 首先檢查是否有從API返回的初始數據
    if (initialData) {
      console.log('從API接收到初始數據:', initialData);
      
      const initialFormData = {
        failureDetails: initialData.failureDetails || '',
        repairMethod: initialData.repairMethod || '',
        isCompleted: initialData.isCompleted || false,
        downtimeHours: initialData.downtimeHours !== undefined ? String(initialData.downtimeHours) : '0',
        downtimeMinutes: initialData.downtimeMinutes !== undefined ? String(initialData.downtimeMinutes) : '0'
      };
      
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      initializedRef.current = true;
      return; // 如果有初始數據，優先使用它，跳過localStorage
    }
    
    // 如果沒有初始數據，再從localStorage中嘗試加載
    const savedData = localStorage.getItem(`cmActual_${cmId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const loadedFormData = parsedData.formData || { 
          failureDetails: '', 
          repairMethod: '', 
          isCompleted: false,
          downtimeHours: '0',
          downtimeMinutes: '0'
        };
        const loadedMedia = parsedData.media || [];
        
        setFormData(loadedFormData);
        setMedia(loadedMedia);
        
        // 保存原始數據用於比較
        setOriginalFormData(loadedFormData);
        setOriginalMedia(loadedMedia);
        initializedRef.current = true;
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [cmId, initialData]);

  // 添加useEffect將表單數據傳回父組件
  useEffect(() => {
    // 將表單數據傳遞給父組件
    onFormDataChange?.(formData);
  }, [formData, onFormDataChange]);

  // 從服務器獲取附件
  const fetchAttachments = async () => {
    try {
      console.log(`正在獲取工單 ${cmId} 的附件...`);
      // 直接使用pmApi.getWorkOrderAttachments
      const attachments = await pmApi.getWorkOrderAttachments(cmId);
      console.log(`成功獲取 ${attachments.length} 個附件`);
      
      // 將附件轉換為媒體格式並更新狀態
      if (attachments && attachments.length > 0) {
        // 過濾出關聯到task10的附件，或檢查文件名模式是否包含task10
        const relevantAttachments = attachments.filter(attachment => {
          // 檢查是否明確設置為task10
          if (attachment.checkItemId === 'task10') return true;
          
          // 嘗試從檔案名解析 - 使用工具函數
          if (attachment.fileName && attachment.fileName.startsWith('CI_')) {
            const [_, extractedItemId] = extractInfoFromFileName(attachment.fileName);
            return extractedItemId === 'task10';
          }
          
          return false;
        });
        
        console.log(`過濾出 ${relevantAttachments.length} 個與task10相關的附件`);
        
        const mediaFromAttachments = relevantAttachments.map((attachment: WorkOrderAttachment) => {
          // 判斷附件類型是圖片還是影片
          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(attachment.fileName);
          const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(attachment.fileName);
          
          // 如果不是圖片或影片則跳過
          if (!isImage && !isVideo) return null;
          
          return {
            id: attachment.id.toString(),
            type: isImage ? 'image' as const : 'video' as const,
            url: attachment.url
          };
        }).filter(item => item !== null) as Media[];
        
        setMedia(mediaFromAttachments);
        setOriginalMedia(mediaFromAttachments);
      }
    } catch (error) {
      console.error('獲取附件失敗:', error);
    }
  };
  
  // 組件初始化時載入附件
  useEffect(() => {
    if (cmId) {
      fetchAttachments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmId]); // 不添加fetchAttachments為依賴，避免無限重新渲染

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';
    
    const newFormData = {
      ...formData,
      [name]: isCheckbox 
        ? (e.target as HTMLInputElement).checked 
        : isNumber 
          ? value  // 保持字符串，不再轉換為數字
          : value
    };
    
    setFormData(newFormData);
  };

  const triggerFileInput = (type: 'image' | 'video') => {
    setMediaType(type);
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // 在UI上顯示媒體
      const newMedia: Media = {
        id: `media_${Date.now()}`,
        type: mediaType,
        url
      };
      
      setMedia([...media, newMedia]);
      
      // 準備上傳至服務器
      // 固定使用task10作為checkItemId
      const checkItemId = 'task10';
      // 使用簡單數字"0"作為資產序號
      const assetSequence = '0';
      const serialNumber = (Date.now() % 1000).toString().padStart(3, '0');
      
      // 生成檔案名稱 - 使用工具函數
      const extension = getFileExtension(file.name);
      const fileName = generateAttachmentFileName(assetSequence, checkItemId, serialNumber, extension);
      
      // 轉換成 base64 - 使用工具函數
      const base64Content = await fileToBase64(file);
      
      // 準備 API 參數
      const attachmentData = {
        fileName,
        fileType: file.type,
        fileContent: base64Content,
        description: `CM工單 ${cmId} 的附件`,
        wonum: cmId,
        checkItemId,
        assetSeq: assetSequence,
        photoSeq: serialNumber
      };
      
      // 呼叫 API 上傳附件
      const result = await uploadPmAttachment(attachmentData);
      console.log('附件上傳結果:', result);
      
    } catch (error) {
      console.error('上傳附件失敗:', error);
    }
    
    // Clear input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeMedia = (mediaId: string) => {
    // 從本地狀態中刪除媒體
    setMedia(media.filter(m => m.id !== mediaId));
    
    // 如果存在擴展媒體並且ID匹配，關閉預覽
    if (expandedMedia?.id === mediaId) {
      setExpandedMedia(null);
    }
    
    // 注意：目前API可能沒有提供刪除已上傳附件的功能
    // 如果後續需要實現，可以在此添加刪除附件的API調用
    console.log(`媒體項目 ${mediaId} 已從本地移除，但可能仍存在於服務器上`);
  };

  const openCamera = (type: 'image' | 'video') => {
    setMediaType(type);
    if (type === 'image') {
      fileInputRef.current?.setAttribute('capture', 'environment');
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.setAttribute('capture', 'environment');
      videoInputRef.current?.click();
    }
    
    // 注意：實際拍攝的圖片/影片會通過 handleFileChange 函數處理上傳
  };

  // --- 新增 Suggestion 生成處理函數 ---
  const handleGenerateSuggestion = useCallback(async (currentText: string) => {
    if (!currentText || currentText.length < 10) { // 至少輸入10個字符才觸發
      setSuggestion(null);
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestion(null); // 清除舊建議

    try {
      // 構建提示詞 (要求補全)
      const prompt = `請根據以下已有的故障描述，提供接續的建議文字，約20字左右，以英文呈現 (只需要建議的部分，不要重複前面的文字):
已輸入描述: "${currentText}"

建議的接續文字:`;

      const result = await api.cm.generateFailureDescription(prompt);
      
      if (result && result.response) {
        const generatedSuggestion = result.response.trim();
        // 簡單過濾，避免建議只是重複輸入的內容
        if (generatedSuggestion && !currentText.endsWith(generatedSuggestion.substring(0, 10))) { 
          setSuggestion(generatedSuggestion);
        }
      } else {
        throw new Error('未能從API獲取有效的建議');
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestionError(error instanceof Error ? error.message : '生成建議時發生錯誤');
    } finally {
      setIsSuggesting(false);
    }
  }, [equipmentName, abnormalType]); // 依賴項

  // --- 使用 useEffect 和 Debounce 觸發建議 --- 
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (formData.failureDetails && isTextareaFocused) { // 僅在有焦點且有內容時觸發
      suggestionTimeoutRef.current = setTimeout(() => {
        handleGenerateSuggestion(formData.failureDetails);
      }, 700); // 700ms延遲
    }
    
    // 清理函數
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [formData.failureDetails, isTextareaFocused, handleGenerateSuggestion]);

  // --- 接受建議的函數 ---
  const acceptSuggestion = () => {
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        // 在現有文字後添加建議，如果需要空格，可以加上
        failureDetails: prev.failureDetails + (prev.failureDetails.endsWith(' ') ? '' : ' ') + suggestion 
      }));
      setSuggestion(null); // 清除建議
      setSuggestionError(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Hidden file inputs */}
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

        {/* Expanded media preview */}
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
                  alt="Expanded"
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

        <form>
          <div className="space-y-6">
            {/* Failure Description */}
            <div className="mb-4">
              <label htmlFor="failureDetails" className="block text-sm font-medium text-gray-700 mb-1">故障描述</label>
              <div className="relative">
                <textarea
                  id="failureDetails"
                  name="failureDetails"
                  value={formData.failureDetails}
                  onChange={handleChange}
                  onFocus={() => setIsTextareaFocused(true)} // 設置焦點狀態
                  onBlur={() => setTimeout(() => setIsTextareaFocused(false), 200)} // 稍長延遲失去焦點，以便點擊建議
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={4}
                  placeholder="詳細描述故障情況... (輸入時自動產生建議)"
                />
                {/* --- 顯示建議、載入中或錯誤信息 (調整樣式) --- */}
                {(isSuggesting || suggestion || suggestionError) && isTextareaFocused && (
                  // 移除邊框、背景、內邊距，調整文字顏色和位置
                  <div className="mt-1 text-sm relative">
                    {isSuggesting && (
                      <span className="text-gray-400 italic">正在產生建議...</span>
                    )}
                    {suggestionError && (
                      <span className="text-red-500">錯誤: {suggestionError}</span>
                    )}
                    {suggestion && !isSuggesting && !suggestionError && (
                      <div className="text-gray-500"> {/* 使用淺色文字 */} 
                        {/* <span>建議:</span> */}
                        <span 
                          className="hover:bg-gray-200 px-1 py-1 cursor-pointer rounded inline-block"
                          onClick={acceptSuggestion} // 點擊文字本身也能接受
                          title="點擊接受建議"
                        >
                           {suggestion}
                        </span>
                        {/* 保留接受按鈕作為備用 */}
                        {/* <button 
                          type="button" 
                          onClick={acceptSuggestion}
                          className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          接受 (Tab)
                        </button> */}
                      </div>
                    )}
                     {/* 保持關閉按鈕 */}
                     {(suggestion || suggestionError) && (
                       <button 
                          type="button" 
                          onClick={() => { setSuggestion(null); setSuggestionError(null); }} // 關閉按鈕
                          className="absolute top-0 right-1 text-gray-400 hover:text-gray-600 p-0.5"
                          aria-label="關閉建議"
                          title="關閉建議"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Downtime Reporting */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Downtime Duration
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-2 space-y-3 sm:space-y-0">
                <div className="flex items-center relative">
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(0, parseInt(formData.downtimeHours || '0'));
                        setFormData({ ...formData, downtimeHours: String(newValue - 1) });
                      }}
                      className="px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      name="downtimeHours"
                      min="0"
                      value={formData.downtimeHours}
                      onChange={handleChange}
                      className="w-16 px-2 py-2 border-0 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = parseInt(formData.downtimeHours || '0') + 1;
                        setFormData({ ...formData, downtimeHours: String(newValue) });
                      }}
                      className="px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="ml-2 mr-4">hours</span>
                  {parseInt(formData.downtimeHours || '0') > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, downtimeHours: '0' })}
                      className="absolute -right-2 -top-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-xs text-gray-700"
                      title="Clear"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center relative">
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(0, parseInt(formData.downtimeMinutes || '0'));
                        setFormData({ ...formData, downtimeMinutes: String(newValue - 1) });
                      }}
                      className="px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      name="downtimeMinutes"
                      min="0"
                      max="59"
                      value={formData.downtimeMinutes}
                      onChange={handleChange}
                      className="w-16 px-2 py-2 border-0 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.min(59, parseInt(formData.downtimeMinutes || '0') + 1);
                        setFormData({ ...formData, downtimeMinutes: String(newValue) });
                      }}
                      className="px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="ml-2">minutes</span>
                  {parseInt(formData.downtimeMinutes || '0') > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, downtimeMinutes: '0' })}
                      className="absolute -right-2 -top-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-xs text-gray-700"
                      title="Clear"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Repair Method */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Repair Method
              </label>
              <textarea
                name="repairMethod"
                rows={4}
                value={formData.repairMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the repair method and solution"
              ></textarea>
            </div>

            {/* Photo/Video Upload */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-lg font-medium text-gray-700">
                  Photos/Videos
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => triggerFileInput('image')}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => openCamera('image')}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Media preview */}
              {media.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {media.map((item) => (
                    <div key={item.id} className="relative group">
                      <div
                        className="h-20 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => setExpandedMedia(item)}
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
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
                      <button
                        onClick={() => removeMedia(item.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion Confirmation */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  id="is-completed"
                  name="isCompleted"
                  type="checkbox"
                  checked={formData.isCompleted}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is-completed" className="ml-2 block text-sm text-gray-700">
                  I confirm that the issue has been fixed and the equipment is functioning normally
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 