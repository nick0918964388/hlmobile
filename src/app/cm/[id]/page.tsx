'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import WorkReport from '@/components/WorkReport';
import CMActual from '@/components/CMActual';
import SubmitModal from '@/components/SubmitModal';
import CancelModal from '@/components/CancelModal';
import api, { CMWorkOrderDetail, Manager, CheckItem, LaborResource, MaterialResource, ToolResource, getManagerList } from '@/services/api';
import { isWorkOrderEditable, getWorkOrderNonEditableReason } from '@/utils/workOrderUtils';

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
  
  // 新增編輯狀態追踪
  const [editing, setEditing] = useState({
    description: false,
    assets: false,
    abnormalType: false
  });
  
  // 新增工單是否可編輯狀態
  const [isEditable, setIsEditable] = useState(true);
  // 新增不可編輯的提示信息
  const [nonEditableReason, setNonEditableReason] = useState('');
  
  // 新增API數據相關狀態
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [managerList, setManagerList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 添加 isSubmitting 狀態
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 添加模態對話框相關狀態
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
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

  // 添加從datetime-local輸入框格式轉換為ISO格式的函數
  const convertInputDateToISO = (inputDate: string): string => {
    if (!inputDate) return '';
    
    try {
      const date = new Date(inputDate);
      return date.toISOString();
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
          
          // 檢查工單是否可編輯
          const canEdit = isWorkOrderEditable(response.status);
          setIsEditable(canEdit);
          
          if (!canEdit) {
            setNonEditableReason(getWorkOrderNonEditableReason(response.status));
          }
          
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
          
          // 設置Actual頁籤數據
          const actualData = {
            failureDetails: response.failureDetails || '',
            repairMethod: response.repairMethod || '',
            isCompleted: !!response.isCompleted,
            downtimeHours: response.downtimeHours !== undefined ? String(response.downtimeHours) : '0',
            downtimeMinutes: response.downtimeMinutes !== undefined ? String(response.downtimeMinutes) : '0'
          };
          
          console.log("設置Actual頁籤數據:", actualData);
          setActualFormData(actualData);
          
          // 從工單詳情中直接獲取資源數據，不需要再次呼叫 API
          if (response.resources) {
            console.log("使用工單詳情中的資源數據:", response.resources);
            setResourcesData(response.resources);
          }
        }
      } catch (error) {
        console.error("獲取工單詳情失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [params.id]);

  // 獲取管理人員列表（用於owner、lead、supervisor選擇）
  useEffect(() => {
    const fetchManagerList = async () => {
      try {
        console.log("開始獲取管理人員列表");
        // 使用與PM工單相同的API獲取管理人員列表
        const managers = await getManagerList();
        console.log("獲取到管理人員列表:", managers);
        setManagerList(managers);
      } catch (error) {
        console.error("獲取管理人員列表失敗:", error);
      }
    };

    fetchManagerList();
  }, []);

  // 監控數據變更狀態
  useEffect(() => {
    // 簡化檢查邏輯，直接比較核心數據
    const isStaffChanged = JSON.stringify(selectedStaff) !== JSON.stringify(originalStaff);
    const isTimeChanged = startTime !== originalStartTime || endTime !== originalEndTime;
    const isFieldsChanged = JSON.stringify(editableFields) !== JSON.stringify(originalEditableFields);

    // 根據當前標籤頁和對應的表單變更狀態來決定 isDirty
    let newIsDirty = false;
    if (activeTab === 'info') {
      newIsDirty = isStaffChanged || isTimeChanged || isFieldsChanged;
    } else if (activeTab === 'actual') {
      newIsDirty = actualFormChanged;
    } else if (activeTab === 'report') {
      newIsDirty = reportFormChanged;
    }

    // 只有在計算出的新狀態與當前狀態不同時才更新
    // 避免在保存後立即因 originalStaff 等更新而觸發不必要的 isDirty 狀態變化
    if (newIsDirty !== isDirty) {
       // 使用 requestAnimationFrame 可能有助於避免某些渲染時序問題
       const frameId = requestAnimationFrame(() => {
         setIsDirty(newIsDirty);
       });
       return () => cancelAnimationFrame(frameId);
    }

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
    isDirty // 仍然保留 isDirty，以便在 newIsDirty !== isDirty 條件下觸發更新
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
    WFA: {
      zh: '等待核准',
      en: 'Waiting for Approval'
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
    },
    basicInfo: {
      zh: '基本信息',
      en: 'Basic Information'
    },
    workOrderId: {
      zh: '工單號碼',
      en: 'Work Order ID'
    },
    equipmentId: {
      zh: '設備號碼',
      en: 'Equipment ID'
    },
    equipmentName: {
      zh: '設備名稱',
      en: 'Equipment Name'
    },
    assets: {
      zh: '故障設備',
      en: 'Assets'
    },
    pleaseSelect: {
      zh: '請選擇',
      en: 'Please Select'
    },
    mechanical: {
      zh: '機械',
      en: 'Mechanical'
    },
    electrical: {
      zh: '電氣',
      en: 'Electrical'
    },
    hydraulic: {
      zh: '液壓',
      en: 'Hydraulic'
    },
    pneumatic: {
      zh: '氣動',
      en: 'Pneumatic'
    },
    other: {
      zh: '其他',
      en: 'Other'
    },
    maintenanceTime: {
      zh: '維護時間',
      en: 'Maintenance Time'
    },
    owner: {
      zh: '負責人',
      en: 'Owner'
    },
    lead: {
      zh: '主導人員',
      en: 'Lead'
    },
    supervisor: {
      zh: '監督人員',
      en: 'Supervisor'
    },
    staffInfo: {
      zh: '人員資訊',
      en: 'Staff Information'
    },
    noData: {
      zh: '無數據',
      en: 'No Data'
    },
    cancelWorkOrder: {
      zh: '取消工單',
      en: 'Cancel Work Order'
    },
    cancelWorkOrderConfirm: {
      zh: '確定要取消此工單嗎？',
      en: 'Are you sure you want to cancel this work order?'
    },
    submitWorkOrder: {
      zh: '提交工單',
      en: 'Submit Work Order'
    },
    submitWorkOrderConfirm: {
      zh: '確定要提交此工單嗎？',
      en: 'Are you sure you want to submit this work order?'
    },
    ownerToLead: {
      zh: '由負責人指定領班',
      en: 'Assign Lead by Owner'
    },
    leaderToSupervisor: {
      zh: '由領班指定現場主管',
      en: 'Assign Supervisor by Leader'
    },
    systemEngineer: {
      zh: '指定人員',
      en: 'Assigned To'
    },
  };

  const t = (key: keyof typeof translations) => {
    if (!translations[key]) {
      console.warn(`翻譯鍵 "${key}" 不存在`);
      return String(key);
    }
    const currentLanguage = language || 'zh'; // 使用默認語言 'zh'
    return translations[key][currentLanguage] || String(key);
  };

  const handleGoBack = () => {
    // 直接返回上一頁，不需要對activeTab做任何處理
    // localStorage中的cmActiveTab完全由list頁面管理
    router.back();
  };

  // 保存欄位編輯
  const startEditing = (field: 'description' | 'assets' | 'abnormalType') => {
    // 如果工單不可編輯，則不允許開始編輯
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    setEditing({...editing, [field]: true});
  };
  
  // 保存單個欄位並關閉編輯
  const saveField = async (field: 'description' | 'assets' | 'abnormalType') => {
    // 如果工單不可編輯，則不允許保存
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
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
      
      // 顯示成功訊息
      // alert(language === 'zh' ? '欄位已保存' : 'Field saved');
      
    } catch (error) {
      console.error(`Error saving field ${field}:`, error);
      alert(language === 'zh' ? '保存失敗，請稍後再試' : 'Save failed, please try again later');
      // 如果保存失敗，但不要關閉編輯狀態
    }
  };
  
  // 取消編輯
  const cancelEditing = (field: 'description' | 'assets' | 'abnormalType') => {
    // 重設為原始值
    setEditableFields({
      ...editableFields,
      [field]: originalEditableFields[field]
    });
    // 關閉編輯狀態
    setEditing({...editing, [field]: false});
  };

  // 處理整個表單保存
  const handleSave = async () => {
    // 如果工單不可編輯，則不允許保存
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    try {
      if (!workOrder) return;
      
      setIsSubmitting(true);
      
      // 準備更新數據
      const updateData: any = {
        id: workOrder.id
      };
      
      // 如果時間有變更，添加到更新數據中
      if (startTime !== originalStartTime) {
        updateData.startTime = startTime ? convertInputDateToISO(startTime) : null;
      }
      
      if (endTime !== originalEndTime) {
        updateData.endTime = endTime ? convertInputDateToISO(endTime) : null;
      }
      
      // 如果人員數據有變更，添加到更新數據中
      if (JSON.stringify(selectedStaff) !== JSON.stringify(originalStaff)) {
        updateData.owner = selectedStaff.owner;
        updateData.lead = selectedStaff.lead;
        updateData.supervisor = selectedStaff.supervisor;
      }
      
      // 如果actual表單數據有變更，添加到更新數據中
      if (actualFormData && activeTab === 'actual') {
        updateData.failureDetails = actualFormData.failureDetails;
        updateData.repairMethod = actualFormData.repairMethod;
        updateData.isCompleted = actualFormData.isCompleted;
        updateData.downtimeHours = actualFormData.downtimeHours;
        updateData.downtimeMinutes = actualFormData.downtimeMinutes;
      }
      
      // 調用API更新工單
      await api.cm.updateWorkOrder(params.id, updateData);
      
      // 記錄新的原始值，用於檢測變更
      setOriginalStartTime(startTime);
      setOriginalEndTime(endTime);
      setOriginalStaff({...selectedStaff});
      
      // 重置變更狀態
      setIsDirty(false);
      setIsSubmitting(false);
      
      // 顯示成功訊息
      alert(language === 'zh' ? '保存成功' : 'Save successful');
      
    } catch (error) {
      console.error('保存失敗', error);
      alert(language === 'zh' ? '保存失敗，請稍後再試' : 'Save failed, please try again later');
      setIsSubmitting(false);
    }
  };

  // 工單狀態顯示
  const getStatusDisplay = () => {
    if (!workOrder) return '';
    const status = workOrder.status as keyof typeof statusTranslations;
    // 始終返回英文狀態，不考慮當前語言設置
    return statusTranslations[status]?.en || status;
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

  // 建立一個新的函數來處理狀態特定的按鈕文字
  const getActionButtonText = () => {
    if (!workOrder) return '';
    
    switch (workOrder.status) {
      case 'WSCH':
      case 'WAPPR':
        return language === 'zh' ? '核准' : 'Approve';
      case 'APPR':
        return language === 'zh' ? '開始工作' : 'Start work';
      case 'INPRG':
        return language === 'zh' ? '提交' : 'Submit';
      default:
        return language === 'zh' ? '提交' : 'Submit';
    }
  };

  // 修改現有的handleComplete函數來處理不同的工單狀態
  const handleComplete = async () => {
    if (!workOrder) return;
    
    try {
      // 添加提交前的檢查邏輯
      const validationErrors = [];
      
      // 只在INPRG狀態下檢查必填項，APPR狀態不需檢查
      if (workOrder.status === 'INPRG') {
        // 1. 檢查 Info 頁面的必填欄位
        if (!startTime) validationErrors.push(language === 'zh' ? '開始時間未填寫' : 'Start time is required');
        if (!endTime) validationErrors.push(language === 'zh' ? '結束時間未填寫' : 'End time is required');
        if (!selectedStaff.owner) validationErrors.push(language === 'zh' ? '負責人未選擇' : 'Owner is required');
        if (!selectedStaff.lead) validationErrors.push(language === 'zh' ? '主導人員未選擇' : 'Lead is required');
        if (!selectedStaff.supervisor) validationErrors.push(language === 'zh' ? '監督人員未選擇' : 'Supervisor is required');
        
        // 2. 檢查 Actual 頁面的項目
        if (workOrder.checkItems && workOrder.checkItems.length > 0 && !actualCheckComplete) {
          validationErrors.push(language === 'zh' ? 'Actual頁面的檢查項目尚未全部完成' : 'Check items in Actual tab are not completed');
        }
        
        // 3. 檢查 Resource 頁面至少要有一個 labor 資源
        const hasLabor = (resourcesData?.labor && resourcesData.labor.length > 0) || 
                        (workOrder.resources?.labor && workOrder.resources.labor.length > 0);
        
        if (!hasLabor) {
          validationErrors.push(language === 'zh' ? '至少需要輸入一項人員工時' : 'At least one labor resource is required');
        }
      }
      
      // 顯示驗證錯誤
      if (validationErrors.length > 0) {
        alert(language === 'zh' ? 
          `提交前請完成以下必填項：\n${validationErrors.join('\n')}` : 
          `Please complete the following required items before submission:\n${validationErrors.join('\n')}`
        );
        return;
      }
      
      // 通過驗證後繼續原有的提交邏輯
      if (workOrder.status === 'WSCH' || workOrder.status === 'WAPPR') {
        // WSCH 或 WAPPR 狀態：直接呼叫API，不開啟dialog
        setIsSubmitting(true);
        const result = await api.cm.submitWorkOrder(params.id, '', workOrder.status);
        console.log('Work order approved successfully:', result);
        alert(language === 'zh' ? '工單已成功核准！' : 'Work order has been approved!');
        router.push('/cm');
      } else if (workOrder.status === 'APPR') {
        // APPR 狀態：直接呼叫API，不開啟dialog
        setIsSubmitting(true);
        const result = await api.cm.submitWorkOrder(params.id, '', workOrder.status);
        console.log('Work order started successfully:', result);
        alert(language === 'zh' ? '已開始工作！' : 'Work started!');
        router.push('/cm');
      } else if (workOrder.status === 'INPRG') {
        // INPRG 狀態：保持原有行為，開啟 dialog
        setShowSubmitModal(true);
      } else {
        // 其他狀態：開啟 dialog
        setShowSubmitModal(true);
      }
    } catch (error) {
      console.error('Error in complete action:', error);
      alert(language === 'zh' ? `操作失敗：${error instanceof Error ? error.message : '未知錯誤'}` : `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (workOrder.status === 'WSCH' || workOrder.status === 'WAPPR' || workOrder.status === 'APPR') {
        setIsSubmitting(false);
      }
    }
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

  // 處理提交工單請求
  const handleSubmitWorkOrder = async (comment: string) => {
    try {
      if (!workOrder) return;
      
      // 添加提交前的檢查邏輯
      const validationErrors = [];
      
      // 只在INPRG狀態下檢查必填項，APPR狀態不需檢查
      if (workOrder.status === 'INPRG') {
        // 1. 檢查 Info 頁面的必填欄位
        if (!startTime) validationErrors.push(language === 'zh' ? '開始時間未填寫' : 'Start time is required');
        if (!endTime) validationErrors.push(language === 'zh' ? '結束時間未填寫' : 'End time is required');
        if (!selectedStaff.owner) validationErrors.push(language === 'zh' ? '負責人未選擇' : 'Owner is required');
        if (!selectedStaff.lead) validationErrors.push(language === 'zh' ? '主導人員未選擇' : 'Lead is required');
        if (!selectedStaff.supervisor) validationErrors.push(language === 'zh' ? '監督人員未選擇' : 'Supervisor is required');
        
        // 2. 檢查 Actual 頁面的項目
        if (workOrder.checkItems && workOrder.checkItems.length > 0 && !actualCheckComplete) {
          validationErrors.push(language === 'zh' ? 'Actual頁面的檢查項目尚未全部完成' : 'Check items in Actual tab are not completed');
        }
        
        // 3. 檢查 Resource 頁面至少要有一個 labor 資源
        const hasLabor = (resourcesData?.labor && resourcesData.labor.length > 0) || 
                        (workOrder.resources?.labor && workOrder.resources.labor.length > 0);
        
        if (!hasLabor) {
          validationErrors.push(language === 'zh' ? '至少需要輸入一項人員工時' : 'At least one labor resource is required');
        }
      }
      
      // 顯示驗證錯誤
      if (validationErrors.length > 0) {
        setIsSubmitting(false);
        setShowSubmitModal(false);
        alert(language === 'zh' ? 
          `提交前請完成以下必填項：\n${validationErrors.join('\n')}` : 
          `Please complete the following required items before submission:\n${validationErrors.join('\n')}`
        );
        return;
      }
      
      setIsSubmitting(true);
      // 呼叫 API 提交工單，並傳遞工單狀態
      const result = await api.cm.submitWorkOrder(params.id, comment, workOrder.status);
      
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
      alert(language === 'zh' ? `提交工單失敗：${error instanceof Error ? error.message : '未知錯誤'}` : `Failed to submit work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      alert(language === 'zh' ? `取消工單失敗：${error instanceof Error ? error.message : '未知錯誤'}` : `Failed to cancel work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              disabled={!isDirty || !isEditable}
              className={`border px-3 py-1 rounded ${
                isDirty && isEditable 
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50" 
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
            >
              {t('save')}
            </button>
            <button 
              onClick={handleComplete} 
              disabled={isSubmitting || !isEditable}
              className={`bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 ${(isSubmitting || !isEditable) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting 
                ? (language === 'zh' ? '處理中...' : 'Processing...') 
                : getActionButtonText()
              }
            </button>
          </div>
        </div>

        {/* 工單狀態 */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${getStatusColor()}`}></span>
            <span>{getStatusDisplay()}</span>
            
            {/* 不可編輯提示 - 強制使用英文 */}
            {!isEditable && (
              <span className="ml-2 text-sm text-red-500">{'Work order status is Waiting for Approval (WFA), cannot modify any content'}</span>
            )}
          </div>
        </div>
      </div>

      {/* 主要內容區域 - 可滾動 */}
      <div className="flex-1 overflow-auto">
        {/* 載入中 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : workOrder ? (
          <>
            {/* 頁籤內容 */}
            <div className="p-4">
              {/* Info頁籤 */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* 基本信息卡片 */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="divide-y">
                      {/* 工單號碼 */}
                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('workOrderId')}</div>
                        <div className="flex-1">{workOrder.id}</div>
                      </div>
                      
                      {/* 故障設備 - 可編輯 */}
                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('assets')}</div>
                        <div className="flex-1">
                          {editing.assets ? (
                            <div className="flex flex-col">
                              <textarea
                                className="w-full border rounded px-3 py-2 mb-2"
                                value={editableFields.assets}
                                onChange={(e) => setEditableFields({...editableFields, assets: e.target.value})}
                                rows={3}
                                disabled={!isEditable}
                              ></textarea>
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => cancelEditing('assets')} 
                                  className="border px-3 py-1 rounded hover:bg-gray-50"
                                >
                                  {t('cancel')}
                                </button>
                                <button 
                                  onClick={() => saveField('assets')} 
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                  {t('save')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                              onClick={() => isEditable && startEditing('assets')}
                            >
                              <div className="flex-1">
                                {editableFields.assets}
                              </div>
                              {isEditable && (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 移除工單描述部分 */}

                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('location')}</div>
                        <div className="flex-1">{workOrder.location}</div>
                      </div>

                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('equipmentType')}</div>
                        <div className="flex-1">{workOrder.equipmentType}</div>
                      </div>

                      {/* 添加指定人員欄位 */}
                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('systemEngineer')}</div>
                        <div className="flex-1">{workOrder.systemEngineer || '-'}</div>
                      </div>

                      {/* 可編輯的異常類型欄位 */}
                      <div className="flex px-4 py-3">
                        <div className="w-28 text-gray-600">{t('abnormalType')}</div>
                        <div className="flex-1">
                          {editing.abnormalType ? (
                            <div className="flex flex-col">
                              <select
                                className="w-full border rounded px-3 py-2 mb-2"
                                value={editableFields.abnormalType}
                                onChange={(e) => setEditableFields({...editableFields, abnormalType: e.target.value})}
                                disabled={!isEditable}
                              >
                                <option value="">{t('pleaseSelect')}</option>
                                <option value="機械">{t('mechanical')}</option>
                                <option value="電氣">{t('electrical')}</option>
                                <option value="液壓">{t('hydraulic')}</option>
                                <option value="氣動">{t('pneumatic')}</option>
                                <option value="其他">{t('other')}</option>
                              </select>
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => cancelEditing('abnormalType')} 
                                  className="border px-3 py-1 rounded hover:bg-gray-50"
                                >
                                  {t('cancel')}
                                </button>
                                <button 
                                  onClick={() => saveField('abnormalType')} 
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                  {t('save')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                              onClick={() => isEditable && startEditing('abnormalType')}
                            >
                              <div className="flex-1">
                                {editableFields.abnormalType || t('pleaseSelect')}
                              </div>
                              {isEditable && (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 人員信息卡片 */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('owner')}
                            {!selectedStaff.owner && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <select
                            className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                              selectedStaff.owner 
                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            value={selectedStaff.owner}
                            onChange={(e) => {
                              setSelectedStaff({...selectedStaff, owner: e.target.value});
                              setIsDirty(true);
                            }}
                            disabled={!isEditable}
                          >
                            <option value="">{t('pleaseSelect')}</option>
                            {managerList.map((manager: any) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('lead')}
                            {!selectedStaff.lead && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <select
                            className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                              selectedStaff.lead 
                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            value={selectedStaff.lead}
                            onChange={(e) => {
                              setSelectedStaff({...selectedStaff, lead: e.target.value});
                              setIsDirty(true);
                            }}
                            disabled={!isEditable}
                          >
                            <option value="">{t('pleaseSelect')}</option>
                            {managerList.map((manager: any) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('supervisor')}
                            {!selectedStaff.supervisor && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <select
                            className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                              selectedStaff.supervisor 
                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            value={selectedStaff.supervisor}
                            onChange={(e) => {
                              setSelectedStaff({...selectedStaff, supervisor: e.target.value});
                              setIsDirty(true);
                            }}
                            disabled={!isEditable}
                          >
                            <option value="">{t('pleaseSelect')}</option>
                            {managerList.map((manager: any) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 維護時間卡片 */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4">
                      {/* 添加時間快速設置按鈕 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600 font-medium">{language === 'zh' ? '快速設置時間:' : 'Quick Time Set:'}</div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              // 創建一個新的日期對象
                              const now = new Date();
                              // 調整為UTC+8時區，加上8小時
                              const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                              const startDateTime = utc8Now.toISOString().slice(0, 16);
                              // 加1小時
                              const endDateTime = new Date(utc8Now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16);
                              
                              setStartTime(startDateTime);
                              setEndTime(endDateTime);
                              setIsDirty(true);
                            }}
                            className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                            title="Set current time + 1 hour (UTC+8)"
                            disabled={!isEditable}
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
                              const startDateTime = utc8Now.toISOString().slice(0, 16);
                              // 加2小時
                              const endDateTime = new Date(utc8Now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
                              
                              setStartTime(startDateTime);
                              setEndTime(endDateTime);
                              setIsDirty(true);
                            }}
                            className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                            title="Set current time + 2 hours (UTC+8)"
                            disabled={!isEditable}
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
                              const startDateTime = utc8Now.toISOString().slice(0, 16);
                              // 加4小時
                              const endDateTime = new Date(utc8Now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
                              
                              setStartTime(startDateTime);
                              setEndTime(endDateTime);
                              setIsDirty(true);
                            }}
                            className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                            title="Set current time + 4 hours (UTC+8)"
                            disabled={!isEditable}
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
                              const startDateTime = utc8Now.toISOString().slice(0, 16);
                              // 加8小時
                              const endDateTime = new Date(utc8Now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
                              
                              setStartTime(startDateTime);
                              setEndTime(endDateTime);
                              setIsDirty(true);
                            }}
                            className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                            title="Set current time + 8 hours (UTC+8)"
                            disabled={!isEditable}
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
                            onChange={(e) => {
                              setStartTime(e.target.value);
                              setIsDirty(true);
                            }}
                            disabled={!isEditable}
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
                            onChange={(e) => {
                              setEndTime(e.target.value);
                              setIsDirty(true);
                            }}
                            disabled={!isEditable}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actual頁籤 */}
              {activeTab === 'actual' && (
                <CMActual 
                  cmId={workOrder.id}
                  onCompleteStatusChange={handleActualCheckCompleteChange}
                  onFormChange={handleActualFormChange}
                  onFormDataChange={handleActualFormDataChange}
                  initialData={{
                    failureDetails: workOrder.failureDetails,
                    repairMethod: workOrder.repairMethod,
                    isCompleted: workOrder.isCompleted,
                    downtimeHours: workOrder.downtimeHours,
                    downtimeMinutes: workOrder.downtimeMinutes
                  }}
                  equipmentName={workOrder.equipmentName}
                  abnormalType={workOrder.abnormalType}
                />
              )}

              {/* Resource頁籤 */}
              {activeTab === 'report' && (
                <WorkReport
                  workOrderId={workOrder.id}
                  resources={resourcesData}
                  onCompleteStatusChange={handleResourceCompleteChange}
                  onFormChange={handleReportFormChange}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">{t('noData')}</div>
          </div>
        )}
      </div>

      {/* 底部空白區，防止內容被固定的底部標籤頁遮擋 */}
      <div className="h-24"></div>

      {/* 底部固定按鈕 - 與PM工單樣式保持一致 */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

      {/* 取消工單確認對話框 */}
      {showCancelModal && (
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelWorkOrder}
        />
      )}
      
      {/* 提交工單確認對話框 */}
      {showSubmitModal && (
        <SubmitModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmitWorkOrder}
        />
      )}
    </div>
  );
} 