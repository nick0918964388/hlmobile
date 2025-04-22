'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import WorkReport from '@/components/WorkReport';
import CMActual from '@/components/CMActual';
import SubmitModal from '@/components/SubmitModal';
import CancelModal from '@/components/CancelModal';
import api, { getManagerList } from '@/services/api';

export default function CMDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'actual' | 'report'>('info');
  const [resourceComplete, setResourceComplete] = useState(false);
  const [actualCheckComplete, setActualCheckComplete] = useState(false);
  const [expanded, setExpanded] = useState({
    assets: false,
    abnormalType: false,
    workConditions: false
  });
  const [selectedStaff, setSelectedStaff] = useState<{
    owner: string;
    lead: string;
    supervisor: string;
  }>({
    owner: '',
    lead: '',
    supervisor: ''
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // 添加數據變更狀態
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // 添加原始數據狀態
  const [originalStaff, setOriginalStaff] = useState<{
    owner: string;
    lead: string;
    supervisor: string;
  }>({
    owner: '',
    lead: '',
    supervisor: ''
  });
  const [originalStartTime, setOriginalStartTime] = useState('');
  const [originalEndTime, setOriginalEndTime] = useState('');
  
  // 可編輯欄位狀態
  const [editableFields, setEditableFields] = useState({
    description: '',
    assets: '',
    abnormalType: ''
  });
  
  // 原始可編輯欄位狀態，用於比較
  const [originalEditableFields, setOriginalEditableFields] = useState({
    description: '',
    assets: '',
    abnormalType: ''
  });
  
  // 編輯狀態追蹤
  const [editing, setEditing] = useState({
    description: false,
    assets: false,
    abnormalType: false
  });

  // 新增API數據相關狀態
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [managerList, setManagerList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 異常類型選項
  const abnormalOptions = [
    'Efficiency Decrease',
    'Failure Shutdown',
    'Abnormal Vibration',
    'Abnormal Noise',
    'Leakage',
    'Component Damage'
  ];

  // 時間格式轉換函數 - ISO格式轉換為datetime-local輸入框格式
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // 轉換為 YYYY-MM-DDThh:mm 格式，保留原始時區
      return date.toISOString().slice(0, 16);
    } catch (e) {
      console.error('日期格式轉換錯誤:', e);
      return '';
    }
  };

  // 新增Actual表單變更處理函數
  const [actualFormChanged, setActualFormChanged] = useState(false);
  
  // 新增Report頁表單狀態變更追蹤
  const [reportFormChanged, setReportFormChanged] = useState(false);
  
  // 新增狀態來儲存Actual頁面的表單數據
  const [actualFormData, setActualFormData] = useState<{
    failureDetails: string;
    repairMethod: string;
    isCompleted: boolean;
    downtimeHours: number | string;
    downtimeMinutes: number | string;
  }>({
    failureDetails: '',
    repairMethod: '',
    isCompleted: false,
    downtimeHours: 0,
    downtimeMinutes: 0
  });

  // 新增資源數據狀態
  const [resourcesData, setResourcesData] = useState<{
    labor: any[];
    materials: any[];
    tools: any[];
  }>({
    labor: [],
    materials: [],
    tools: []
  });

  // 從API獲取工單詳情數據
  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      try {
        setIsLoading(true);
        console.log("開始獲取CM工單詳情:", params.id);
        console.log("MOCK_DATA環境變數:", process.env.NEXT_PUBLIC_USE_MOCK_DATA);
        console.log("當前環境:", process.env.NODE_ENV);
        
        // 調用API獲取工單詳情
        const response = await api.cm.getWorkOrderDetail(params.id);
        console.log("獲取到CM工單詳情:", response);
        
        if (response) {
          // 設置工單詳情數據
          setWorkOrder(response);
          
          // 初始化可編輯欄位
          setEditableFields({
            description: response.description || '',
            assets: response.assets || '',
            abnormalType: response.abnormalType || ''
          });
          
          setOriginalEditableFields({
            description: response.description || '',
            assets: response.assets || '',
            abnormalType: response.abnormalType || ''
          });
          
          // 設置維護時間
          if (response.startTime || response.endTime) {
            const newStartTime = formatDateForInput(response.startTime) || '';
            const newEndTime = formatDateForInput(response.endTime) || '';
            
            console.log("設置開始時間:", response.startTime, "->", newStartTime);
            console.log("設置結束時間:", response.endTime, "->", newEndTime);
            
            setStartTime(newStartTime);
            setEndTime(newEndTime);
            setOriginalStartTime(newStartTime);
            setOriginalEndTime(newEndTime);
          }
          
          // 設置選中的負責人員
          const staffData = {
            owner: response.owner || '',
            lead: response.lead || '',
            supervisor: response.supervisor || ''
          };
          
          setSelectedStaff(staffData);
          setOriginalStaff(staffData);
          
          // 設置Actual頁面的表單數據
          if (response.failureDetails !== undefined || 
              response.repairMethod !== undefined || 
              response.downtimeHours !== undefined ||
              response.downtimeMinutes !== undefined) {
            console.log("設置Actual表單數據:", {
              failureDetails: response.failureDetails,
              repairMethod: response.repairMethod,
              isCompleted: response.isCompleted,
              downtimeHours: response.downtimeHours,
              downtimeMinutes: response.downtimeMinutes
            });
            
            setActualFormData({
              failureDetails: response.failureDetails || '',
              repairMethod: response.repairMethod || '',
              isCompleted: response.isCompleted || false,
              downtimeHours: response.downtimeHours || 0,
              downtimeMinutes: response.downtimeMinutes || 0
            });
          }
          
          // 獲取設備選項和人員列表
          const fetchAdditionalData = async () => {
            try {
              console.log("開始獲取額外資料");
              
              // 使用靜態模擬數據代替API調用
              const mockEquipOptions = [
                { id: 'P1THC-ZERO-C01', name: 'CUP ZEROC01 Zero Generator', location: 'F15/00203W02' },
                { id: 'P3PLUMP-P-LOADZNG03A', name: 'Pump XXXXXXXX', location: 'F15/00203W02' },
                { id: 'P4AIR-COMP-01', name: 'Air Compressor 01', location: 'F15/00204W01' }
              ];
              console.log("使用模擬設備選項:", mockEquipOptions);
              setEquipmentOptions(mockEquipOptions);
              
              // 獲取人員列表
              // const staff = await api.cm.getStaffList();
              // console.log("人員列表:", staff);
              // setStaffList(staff);
              
              // 使用靜態模擬數據代替API調用
              const mockStaffList = [
                { id: 'EMP001', name: '張三', role: '技術員' },
                { id: 'EMP002', name: '李四', role: '維護工程師' },
                { id: 'EMP003', name: '王五', role: '資深技術員' }
              ];
              console.log("使用模擬人員列表:", mockStaffList);
              setStaffList(mockStaffList);
              
              try {
                // 獲取管理人員列表
                console.log("開始獲取管理人員列表...");
                const manager = await getManagerList();
                console.log("管理人員列表獲取成功:", manager);
                setManagerList(manager);
              } catch (managerError) {
                console.error("獲取管理人員列表失敗:", managerError);
                // 使用一般員工列表作為備用選項
                console.log("使用模擬人員列表作為管理人員備用選項");
                setManagerList(mockStaffList.map((s: { id: string; name: string; role: string }) => ({...s, role: '員工'})));
              }
              
              console.log("額外資料獲取完成");
            } catch (error) {
              console.error('獲取額外數據失敗:', error);
            }
          };
          
          fetchAdditionalData();
        } else {
          console.error('API返回空的工單詳情');
          setError('工單詳情不存在或已被刪除');
        }
      } catch (error) {
        console.error('獲取工單詳情失敗:', error);
        setError('無法加載工單詳情，請稍後重試');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [params.id]);

  // 監控數據變更狀態
  useEffect(() => {
    // 使用 requestAnimationFrame 確保在一個渲染周期後再檢查
    // 這樣即使其他 useState 更新後觸發了這個 effect，也能確保最新的 save 操作優先
    const checkChanges = () => {
      // 檢查人員數據是否變更
      const isStaffChanged = JSON.stringify(selectedStaff) !== JSON.stringify(originalStaff);
      
      // 檢查時間數據是否變更
      const isTimeChanged = startTime !== originalStartTime || endTime !== originalEndTime;
      
      // 檢查可編輯欄位是否變更
      const isFieldsChanged = JSON.stringify(editableFields) !== JSON.stringify(originalEditableFields);
      
      // 如果是保存操作剛剛完成（isDirty 為 false），則不要覆蓋它
      if (!isDirty && (isStaffChanged || isTimeChanged || isFieldsChanged || actualFormChanged || reportFormChanged)) {
        // 這可能是由於剛剛進行了數據重置或保存操作
        // 我們應該延遲執行對 isDirty 的更新，確保保存操作的設置優先
        return;
      }
      
      // 更新整體數據變更狀態 (實際組件的變更狀態由handleActualFormChange控制)
      if (activeTab === 'info') {
        setIsDirty(isStaffChanged || isTimeChanged || isFieldsChanged);
      } else if (activeTab === 'actual') {
        setIsDirty(actualFormChanged);
      } else if (activeTab === 'report') {
        setIsDirty(reportFormChanged);
      }
    };
    
    // 使用下一次渲染幀來執行檢查
    const frameId = requestAnimationFrame(checkChanges);
    
    // 清理函數
    return () => cancelAnimationFrame(frameId);
  }, [
    selectedStaff, 
    startTime, 
    endTime, 
    editableFields, 
    originalStaff, 
    originalStartTime, 
    originalEndTime, 
    originalEditableFields, 
    activeTab, 
    actualFormChanged,
    reportFormChanged,
    isDirty // 加入 isDirty 作為依賴，這樣可以檢測它的變化
  ]);

  const handleActualFormChange = (isDirty: boolean) => {
    setActualFormChanged(isDirty);
    
    // 當在actual頁簽時，直接使用actual表單的變更狀態
    if (activeTab === 'actual') {
      setIsDirty(isDirty);
    }
  };
  
  // 處理Report頁表單變更
  const handleReportFormChange = (isDirty: boolean) => {
    setReportFormChanged(isDirty);
    
    // 當在report頁簽時，直接使用report表單的變更狀態
    if (activeTab === 'report') {
      setIsDirty(isDirty);
    }
  };
  
  // 處理Actual表單數據變更
  const handleActualFormDataChange = (formData: {
    failureDetails: string;
    repairMethod: string;
    isCompleted: boolean;
    downtimeHours: number | string;
    downtimeMinutes: number | string;
  }) => {
    setActualFormData(formData);
  };

  // 工單狀態翻譯
  const statusTranslations = {
    WAPPR: {
      zh: '等待核准',
      en: 'Waiting for Approval'
    },
    WMATL: {
      zh: '等待物料',
      en: 'Waiting for Material'
    },
    WSCH: {
      zh: '等待排程',
      en: 'Waiting to be Scheduled'
    },
    WSCHED: {
      zh: '等待排程',
      en: 'Waiting to be Scheduled'
    },
    WPCOND: {
      zh: '等待工廠條件',
      en: 'Waiting for Plant Condition'
    },
    APPR: {
      zh: '已核准',
      en: 'Approved'
    },
    INPRG: {
      zh: '進行中',
      en: 'In Progress'
    },
    CAN: {
      zh: '已取消',
      en: 'Canceled'
    },
    COMP: {
      zh: '已完成',
      en: 'Complete'
    },
    CLOSE: {
      zh: '已關閉',
      en: 'Closed'
    }
  };

  // 文字翻譯對照表
  const translations = {
    pageTitle: {
      zh: '故障維修',
      en: 'Corrective Maintenance'
    },
    save: {
      zh: '保存',
      en: 'Save'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    submit: {
      zh: '呈核',
      en: 'Submit'
    },
    status: {
      zh: '狀態',
      en: 'Status'
    },
    openTime: {
      zh: '開單時間 |',
      en: 'Open Time |'
    },
    factoryCategory: {
      zh: '廠區 | 類別：',
      en: 'Factory | Category:'
    },
    description: {
      zh: '說明：',
      en: 'Description:'
    },
    asset: {
      zh: '資產：',
      en: 'Asset:'
    },
    location: {
      zh: '位置：',
      en: 'Location:'
    },
    equipmentType: {
      zh: '設備類型：',
      en: 'Equipment Type:'
    },
    maintenanceType: {
      zh: '修復類別：',
      en: 'Maintenance Type:'
    },
    abnormalType: {
      zh: '異常樣式：',
      en: 'Abnormal Type:'
    },
    workConditions: {
      zh: '工作條件：',
      en: 'Work Conditions:'
    },
    costCenter: {
      zh: '成本中心：',
      en: 'Cost Center:'
    },
    longTermMaintenance: {
      zh: '長期保養維修申請：',
      en: 'Long-term Maintenance Request:'
    },
    reportTime: {
      zh: '通報時間：',
      en: 'Report Time:'
    },
    reportPerson: {
      zh: '通報人員：',
      en: 'Reported By:'
    },
    placeholder: {
      zh: '請輸入...',
      en: 'Please enter...'
    },
    required: {
      zh: '必填',
      en: 'Required'
    },
    resource: {
      zh: '資源',
      en: 'Resource'
    },
    info: {
      zh: '資訊',
      en: 'Info'
    },
    actual: {
      zh: '實際',
      en: 'Actual'
    },
    report: {
      zh: '報表',
      en: 'Report'
    },
    loading: {
      zh: '加載中...',
      en: 'Loading...'
    },
    error: {
      zh: '發生錯誤',
      en: 'An error occurred'
    },
    startTime: {
      zh: '開始時間',
      en: 'Start Time'
    },
    endTime: {
      zh: '結束時間',
      en: 'End Time'
    },
    responsibleStaff: {
      zh: '負責人員',
      en: 'Responsible Staff'
    },
    selectStaff: {
      zh: '選擇人員',
      en: 'Select staff'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const handleGoBack = () => {
    router.back();
  };

  // 更新保存功能以使用API
  const handleSave = async () => {
    try {
      // 格式化日期時間為ISO標準格式
      const formatDateToISO = (dateTimeStr: string): string => {
        if (!dateTimeStr) return '';
        
        try {
          // 處理時區差異，使用戶看到的時間與API發送的時間保持一致
          // 首先解析輸入的本地時間
          const localDate = new Date(dateTimeStr);
          
          // 獲取當地時區偏移量（分鐘）
          const offsetMinutes = localDate.getTimezoneOffset();
          
          // 創建一個新的日期，保持用戶輸入的時間不變，但正確調整為UTC
          // 由於getTimezoneOffset()返回的是本地時間與UTC的差異（分鐘），正數表示本地時間落後於UTC
          // 所以我們需要減去這個值來得到正確的UTC時間
          const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60000);
          
          return adjustedDate.toISOString();
        } catch (e) {
          console.error('日期格式轉換錯誤:', e);
          return '';
        }
      };
      
      // 準備要保存的數據
      const saveData = {
        id: params.id,
        description: editableFields.description,
        assets: editableFields.assets,
        abnormalType: editableFields.abnormalType,
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        owner: selectedStaff.owner,
        lead: selectedStaff.lead,
        supervisor: selectedStaff.supervisor,
        // 添加Actual頁面的表單數據
        failureDetails: actualFormData.failureDetails,
        repairMethod: actualFormData.repairMethod,
        downtimeHours: actualFormData.downtimeHours,
        downtimeMinutes: actualFormData.downtimeMinutes,
        isCompleted: actualFormData.isCompleted,
        // 添加Report頁面的資源數據
        resources: resourcesData
      };
      
      console.log('保存CM工單數據:', saveData);
      
      // 調用API保存數據
      const result = await api.cm.saveWorkOrder(saveData);
      
      // 保存成功後，先更新原始數據狀態
      // 這樣當 useEffect 執行時，比較新舊數據會得出「沒有變更」的結果
      setOriginalEditableFields({...editableFields});
      setOriginalStaff({...selectedStaff});
      setOriginalStartTime(startTime);
      setOriginalEndTime(endTime);
      
      // 確保 useState 是同步的
      const updatedOriginalFields = {...editableFields};
      const updatedOriginalStaff = {...selectedStaff};
      const updatedOriginalStartTime = startTime;
      const updatedOriginalEndTime = endTime;
      
      // 直接設置所有變更狀態為 false
      setIsDirty(false);
      setActualFormChanged(false);
      setReportFormChanged(false);
      
      // 顯示成功訊息
      alert(language === 'zh' ? '保存成功' : 'Save successful');
    } catch (error) {
      console.error('Error saving work order:', error);
      // 保存失敗時，顯示錯誤訊息，但不重置isDirty狀態
      // 這樣保存按鈕仍然可以點擊，用戶可以重試
      alert(language === 'zh' ? '保存失敗，請重試' : 'Save failed, please try again');
      // 不設置 setIsDirty(false)，按鈕保持可點擊狀態
    }
  };

  const handleComplete = () => {
    setShowSubmitModal(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const handleResourceCompleteChange = (isComplete: boolean, resources?: {
    labor: any[];
    materials: any[];
    tools: any[];
    hasNewResources?: boolean;
  }) => {
    setResourceComplete(isComplete);
    
    // 保存資源數據
    if (resources) {
      console.log('接收到Report頁資源數據:', resources);
      setResourcesData({
        labor: resources.labor || [],
        materials: resources.materials || [],
        tools: resources.tools || []
      });
    }
  };

  const handleActualCheckCompleteChange = (isComplete: boolean) => {
    setActualCheckComplete(isComplete);
  };

  // 工單狀態顯示
  const getStatusDisplay = () => {
    if (!workOrder) return '';
    const status = workOrder.status as keyof typeof statusTranslations;
    return statusTranslations[status]?.[language] || status;
  };

  // 工單狀態顏色
  const getStatusColor = () => {
    if (!workOrder) return 'bg-gray-500';
    
    switch (workOrder.status) {
      case 'WAPPR':
      case 'WMATL':
      case 'WSCH':
      case 'WSCHED':
      case 'WPCOND':
        return 'bg-yellow-500';
      case 'APPR':
      case 'INPRG':
        return 'bg-blue-500';
      case 'COMP':
        return 'bg-green-500';
      case 'CLOSE':
        return 'bg-gray-500';
      case 'CAN':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 檢查是否所有必填欄位都已填寫
  const isMaintenanceInfoComplete = () => {
    return startTime && 
           endTime && 
           selectedStaff.owner &&
           selectedStaff.lead &&
           selectedStaff.supervisor;
  };

  // 保存單個欄位並關閉編輯
  const saveField = async (field: 'description' | 'assets' | 'abnormalType') => {
    try {
      // 印出當前欄位的值，以便檢查
      console.log(`Saving field ${field} with value:`, editableFields[field]);
      
      // 特別處理 abnormalType 欄位
      if (field === 'abnormalType') {
        console.log('Special handling for abnormal type field:', editableFields.abnormalType);
        if (!editableFields.abnormalType) {
          alert(language === 'zh' ? '請選擇異常類型' : 'Please select an abnormal type');
          return;
        }
      }
      
      // 確保值不為undefined
      const fieldValue = editableFields[field] || '';
      
      // 準備要保存的欄位數據
      const fieldData = {
        id: params.id,
        [field]: fieldValue
      };
      
      // 印出將發送的數據
      console.log('Data being sent to API:', fieldData);
      console.log('Field value type:', typeof fieldValue);
      
      // 調用API保存特定欄位
      await api.cm.saveWorkOrderField(fieldData);
      
      // 關閉編輯狀態
      setEditing({...editing, [field]: false});
      
      // 先保存當前的值，確保後續操作使用的是更新後的值
      const updatedFields = {
        ...originalEditableFields,
        [field]: fieldValue
      };
      
      // 更新原始欄位值
      setOriginalEditableFields(updatedFields);
      
      // 檢查是否還有其他未保存的變更
      const hasOtherChanges = 
        JSON.stringify(updatedFields) !== JSON.stringify(editableFields) ||
        JSON.stringify(selectedStaff) !== JSON.stringify(originalStaff) ||
        JSON.stringify(startTime) !== JSON.stringify(originalStartTime) ||
        JSON.stringify(endTime) !== JSON.stringify(originalEndTime);
      
      // 如果已經沒有變更，設置 isDirty 為 false
      setIsDirty(hasOtherChanges);
      
      // 操作成功的提示
      console.log(`Field ${field} saved successfully with value: "${fieldValue}"`);
      
    } catch (error) {
      console.error(`Failed to save field ${field}:`, error);
      alert(language === 'zh' ? `保存失敗，請重試` : `Save failed, please try again`);
    }
  };

  // 取消編輯並重置為原始值
  const cancelEdit = (field: 'description' | 'assets' | 'abnormalType') => {
    setEditableFields({
      ...editableFields, 
      [field]: originalEditableFields[field]
    });
    setEditing({...editing, [field]: false});
  };

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 處理提交工單請求
  const handleSubmitWorkOrder = async (comment: string) => {
    try {
      setIsSubmitting(true);
      // 呼叫 API 提交工單
      const result = await api.cm.submitWorkOrder(params.id, comment);
      
      console.log('Work order submitted successfully:', result);
      
      // 更新成功狀態
      setSubmitSuccess(true);
      setShowSubmitModal(false);
      
      // 顯示成功訊息
      alert(language === 'zh' ? '工單已成功提交核簽！' : 'Work order has been submitted for approval!');
      
      // 返回 CM 列表頁面
      router.push('/cm');
    } catch (error) {
      console.error('Error submitting work order:', error);
      alert(language === 'zh' ? '提交工單失敗，請重試。' : 'Failed to submit work order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理取消工單
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // 處理工單取消提交
  const handleCancelWorkOrder = async (reason: string) => {
    try {
      setIsCancelling(true);
      // 呼叫 API 取消工單
      const result = await api.cm.cancelWorkOrder(params.id, reason);
      
      console.log('Work order cancelled successfully:', result);
      
      // 顯示成功訊息
      alert(language === 'zh' ? '工單已成功取消！' : 'Work order has been cancelled successfully!');
      
      // 關閉確認對話框
      setShowCancelModal(false);
      
      // 返回 CM 列表頁面
      router.push('/cm');
    } catch (error) {
      console.error('Error cancelling work order:', error);
      alert(language === 'zh' ? '取消工單失敗，請重試。' : 'Failed to cancel work order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // 如果正在加載，顯示加載中
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  // 如果發生錯誤，顯示錯誤訊息
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500">{error}</div>
        <button 
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {language === 'zh' ? '返回' : 'Go Back'}
        </button>
      </div>
    );
  }

  // 如果工單不存在
  if (!workOrder) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500">{t('error')}</div>
        <button 
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {language === 'zh' ? '返回' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 頂部固定區域 */}
      <div className="flex-none bg-white">
        {/* 標題列 */}
        <div className="h-14 flex items-center px-4 border-b">
          <button onClick={handleGoBack} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="ml-4 text-xl font-medium truncate">{workOrder.id}</div>
          <div className="flex-1"></div>
          <div className="flex space-x-2">
            <button 
              onClick={handleCancelClick}
              className="border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button 
              onClick={handleSave} 
              disabled={!isDirty}
              className={`border px-3 py-1 rounded ${
                isDirty 
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50" 
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
            >
              {t('save')}
            </button>
            <button onClick={handleComplete} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              {t('submit')}
            </button>
          </div>
        </div>

        {/* 工單狀態 */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${getStatusColor()}`}></span>
            <span>{getStatusDisplay()}</span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 - 可滾動 */}
      <div className="flex-1 overflow-auto">
        {/* 基本資訊頁面 */}
        {activeTab === 'info' && (
          <div className="bg-white">
            <div className="divide-y">
              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('openTime')}</div>
                <div className="flex-1">{workOrder.openTime}</div>
                <div className="text-red-500 font-medium">{workOrder.creator}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('factoryCategory')}</div>
                <div className="flex-1">{workOrder.systemCode} {workOrder.equipmentCode}</div>
              </div>

              {/* 可編輯的描述欄位 */}
              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('description')}</div>
                <div className="flex-1">
                  {editing.description ? (
                    <div className="relative">
                      <textarea
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                        value={editableFields.description}
                        onChange={(e) => setEditableFields({...editableFields, description: e.target.value})}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button 
                          className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => cancelEdit('description')}
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => saveField('description')}
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                      onClick={() => setEditing({...editing, description: true})}
                    >
                      <div className="flex-1">{editableFields.description}</div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* 可編輯的資產欄位 */}
              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('asset')}</div>
                <div className="flex-1">
                  {editing.assets ? (
                    <div className="relative">
                      <select
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                        value={editableFields.assets}
                        onChange={(e) => setEditableFields({...editableFields, assets: e.target.value})}
                        autoFocus
                      >
                        {equipmentOptions.map((equipment: any) => (
                          <option key={equipment.id} value={equipment.id}>
                            {equipment.id} - {equipment.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button 
                          className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => cancelEdit('assets')}
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => saveField('assets')}
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                      onClick={() => setEditing({...editing, assets: true})}
                    >
                      <div className="flex-1">
                        {editableFields.assets}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('location')}</div>
                <div className="flex-1">{workOrder.location}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('equipmentType')}</div>
                <div className="flex-1">{workOrder.equipmentType}</div>
              </div>

              {/* 可編輯的異常類型欄位 */}
              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('abnormalType')}</div>
                <div className="flex-1">
                  {editing.abnormalType ? (
                    <div className="relative">
                      <select
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                        value={editableFields.abnormalType}
                        onChange={(e) => {
                          console.log('選擇異常類型值:', e.target.value);
                          setEditableFields({...editableFields, abnormalType: e.target.value});
                        }}
                        autoFocus
                      >
                        <option value="">Please select abnormal type</option>
                        {abnormalOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-xs text-gray-500">
                        Current selected: {editableFields.abnormalType || '(None)'}
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button 
                          className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => cancelEdit('abnormalType')}
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            console.log('點擊保存按鈕，異常類型值:', editableFields.abnormalType);
                            saveField('abnormalType');
                          }}
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                      onClick={() => setEditing({...editing, abnormalType: true})}
                    >
                      <div className="flex-1">
                        {editableFields.abnormalType || '(Please select abnormal type)'}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('reportTime')}</div>
                <div className="flex-1">{workOrder.reportTime}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('reportPerson')}</div>
                <div className="flex-1 text-red-500 font-medium">{workOrder.reportPerson}</div>
              </div>
            </div>

            {/* 維修時間和負責人員 */}
            <div className="p-4 space-y-4 border-t">
              {/* 時間快速設置按鈕 */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 font-medium">{language === 'zh' ? '快速時間設置:' : 'Quick Time Set:'}</div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      // 創建一個新的日期對象
                      const now = new Date();
                      // 調整為UTC+8時區，加上8小時
                      const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                      const startTimeValue = utc8Now.toISOString().slice(0, 16);
                      // 加1小時
                      const endTimeValue = new Date(utc8Now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setStartTime(startTimeValue);
                      setEndTime(endTimeValue);
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title={language === 'zh' ? '設置為當前時間 + 1小時 (UTC+8)' : 'Set current time + 1 hour (UTC+8)'}
                  >
                    <span className="text-xs font-semibold">+1h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 創建一個新的日期對象
                      const now = new Date();
                      // 調整為UTC+8時區，加上8小時
                      const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                      const startTimeValue = utc8Now.toISOString().slice(0, 16);
                      // 加2小時
                      const endTimeValue = new Date(utc8Now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setStartTime(startTimeValue);
                      setEndTime(endTimeValue);
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title={language === 'zh' ? '設置為當前時間 + 2小時 (UTC+8)' : 'Set current time + 2 hours (UTC+8)'}
                  >
                    <span className="text-xs font-semibold">+2h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 創建一個新的日期對象
                      const now = new Date();
                      // 調整為UTC+8時區，加上8小時
                      const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                      const startTimeValue = utc8Now.toISOString().slice(0, 16);
                      // 加4小時
                      const endTimeValue = new Date(utc8Now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setStartTime(startTimeValue);
                      setEndTime(endTimeValue);
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title={language === 'zh' ? '設置為當前時間 + 4小時 (UTC+8)' : 'Set current time + 4 hours (UTC+8)'}
                  >
                    <span className="text-xs font-semibold">+4h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 創建一個新的日期對象
                      const now = new Date();
                      // 調整為UTC+8時區，加上8小時
                      const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                      const startTimeValue = utc8Now.toISOString().slice(0, 16);
                      // 加8小時
                      const endTimeValue = new Date(utc8Now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setStartTime(startTimeValue);
                      setEndTime(endTimeValue);
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title={language === 'zh' ? '設置為當前時間 + 8小時 (UTC+8)' : 'Set current time + 8 hours (UTC+8)'}
                  >
                    <span className="text-xs font-semibold">+8h</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('startTime')}
                    {!startTime && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                      startTime 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('endTime')}
                    {!endTime && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                      endTime 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              
              {/* 負責人員欄位 - 更新為與PM工單相同的三個角色 */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {language === 'zh' ? '負責人' : 'Owner'}
                  {!selectedStaff.owner && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff.owner 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff.owner || ''}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, owner: e.target.value }))}
                >
                  <option value="">{language === 'zh' ? '選擇負責人' : 'Select owner'}</option>
                  {managerList.map((manager: any) => (
                    <option key={`owner-${manager.id}`} value={manager.id}>
                      {manager.id} - {manager.name} {manager.role ? `(${manager.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {language === 'zh' ? '主導人員' : 'Lead'}
                  {!selectedStaff.lead && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff.lead 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff.lead || ''}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, lead: e.target.value }))}
                >
                  <option value="">{language === 'zh' ? '選擇主導人員' : 'Select lead'}</option>
                  {managerList.map((manager: any) => (
                    <option key={`lead-${manager.id}`} value={manager.id}>
                      {manager.id} - {manager.name} {manager.role ? `(${manager.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {language === 'zh' ? '監督人員' : 'Supervisor'}
                  {!selectedStaff.supervisor && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff.supervisor 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff.supervisor || ''}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, supervisor: e.target.value }))}
                >
                  <option value="">{language === 'zh' ? '選擇監督人員' : 'Select supervisor'}</option>
                  {managerList.map((manager: any) => (
                    <option key={`supervisor-${manager.id}`} value={manager.id}>
                      {manager.id} - {manager.name} {manager.role ? `(${manager.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ActualCheck 元件 */}
        {activeTab === 'actual' && (
          <CMActual 
            cmId={params.id} 
            onCompleteStatusChange={handleActualCheckCompleteChange}
            onFormChange={handleActualFormChange}
            onFormDataChange={handleActualFormDataChange}
            initialData={workOrder ? {
              failureDetails: workOrder.failureDetails,
              repairMethod: workOrder.repairMethod,
              isCompleted: workOrder.isCompleted,
              downtimeHours: workOrder.downtimeHours,
              downtimeMinutes: workOrder.downtimeMinutes
            } : undefined}
          />
        )}

        {/* Resource 頁面 */}
        {activeTab === 'report' && (
          <WorkReport 
            workOrderId={params.id}
            onCompleteStatusChange={handleResourceCompleteChange}
            onFormChange={handleReportFormChange}
            resources={workOrder?.resources}
            initialReportItems={workOrder?.reportItems}
          />
        )}
      </div>

      {/* 底部空白區，防止內容被固定的底部標籤頁遮擋 */}
      <div className="h-24"></div>

      {/* 底部固定按鈕 */}
      <div className="flex-none bg-blue-600 text-white fixed bottom-0 left-0 right-0">
        <div className="grid grid-cols-3 divide-x divide-white/30">
          <button 
            className={`py-4 text-center hover:bg-blue-700 ${activeTab === 'info' ? 'bg-blue-800' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <div className="flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <svg 
                  className={`w-6 h-6 ${isMaintenanceInfoComplete() ? 'text-green-400' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isMaintenanceInfoComplete() && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span>{t('info')}</span>
            </div>
          </button>
          
          <button 
            className={`py-4 text-center hover:bg-blue-700 ${activeTab === 'actual' ? 'bg-blue-800' : ''}`}
            onClick={() => setActiveTab('actual')}
          >
            <div className="flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <svg 
                  className={`w-6 h-6 ${actualCheckComplete ? 'text-green-400' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actualCheckComplete && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span>{t('actual')}</span>
            </div>
          </button>

          <button 
            className={`py-4 text-center hover:bg-blue-700 ${activeTab === 'report' ? 'bg-blue-800' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <div className="flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <svg 
                  className={`w-6 h-6 ${resourceComplete ? 'text-green-400' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {resourceComplete && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span>{t('report')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitWorkOrder}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancel={handleCancelWorkOrder}
      />
    </div>
  );
} 