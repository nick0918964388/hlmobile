'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ActualCheck from '@/components/ActualCheck';
import WorkReport from '@/components/WorkReport';
import SubmitModal from '@/components/SubmitModal';
import api, { PMWorkOrderDetail, Manager, CheckItem, LaborResource, MaterialResource, ToolResource, getManagerList } from '@/services/api';
import { isWorkOrderEditable, getWorkOrderNonEditableReason } from '@/utils/workOrderUtils';

export default function PMDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('info');
  const [selectedStaff, setSelectedStaff] = useState({
    owner: '',
    lead: '',
    supervisor: ''
  });
  const [maintenanceTime, setMaintenanceTime] = useState({
    startDate: '',
    endDate: ''
  });
  const [actualCheckComplete, setActualCheckComplete] = useState(false);
  const [resourceComplete, setResourceComplete] = useState(false);
  const [expanded, setExpanded] = useState({
    assets: false,
    abnormalType: false,
    maintenanceType: false,
    workConditions: false
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [workOrder, setWorkOrder] = useState<PMWorkOrderDetail | null>(null);
  const [updatedCheckItems, setUpdatedCheckItems] = useState<CheckItem[]>([]);
  const [updatedResources, setUpdatedResources] = useState<{
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  } | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [originalStaff, setOriginalStaff] = useState({
    owner: '',
    lead: '',
    supervisor: ''
  });
  const [originalTime, setOriginalTime] = useState({
    startDate: '',
    endDate: ''
  });

  // 新增工單是否可編輯狀態
  const [isEditable, setIsEditable] = useState(true);
  // 新增不可編輯的提示信息
  const [nonEditableReason, setNonEditableReason] = useState('');

  // 從API獲取工單詳情數據
  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.pm.getWorkOrderDetail(params.id);
        
        if (response) {
          // 設置工單詳情數據
          setWorkOrder(response);
          
          // 檢查工單是否可編輯
          const canEdit = isWorkOrderEditable(response.status);
          setIsEditable(canEdit);
          
          if (!canEdit) {
            setNonEditableReason(getWorkOrderNonEditableReason(response.status));
          }
          
          // 設置維護時間
          if (response.startTime || response.endTime) {
            const newStartTime = response.startTime ? formatDateForInput(response.startTime) : '';
            const newEndTime = response.endTime ? formatDateForInput(response.endTime) : '';
            
            setMaintenanceTime({
              startDate: newStartTime,
              endDate: newEndTime
            });
          }
          
          // 設置選中的負責人員
          setSelectedStaff({
            owner: response.owner || '',
            lead: response.lead || '',
            supervisor: response.supervisor || ''
          });
        }
      } catch (error) {
        console.error('獲取工單詳情失敗', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [params.id]);

  // 使用API獲取管理人員列表
  const [managerList, setManagerList] = useState<Manager[]>([]);
  
  useEffect(() => {
    const fetchManagerList = async () => {
      try {
        const managers = await api.manager.getManagerList();
        setManagerList(managers);
      } catch (err) {
        console.error('Error fetching manager list:', err);
      }
    };
    
    fetchManagerList();
  }, []);

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

  // 轉換datetime-local輸入框值為ISO格式
  const convertInputDateToISO = (inputDate: string): string => {
    if (!inputDate) return '';
    
    try {
      // 處理時區差異，使用戶看到的時間與API發送的時間保持一致
      // 首先解析輸入的本地時間
      const localDate = new Date(inputDate);
      
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
      zh: '預防性維護',
      en: 'Preventive Maintenance'
    },
    save: {
      zh: '保存',
      en: 'Save'
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
    route: {
      zh: '路線：',
      en: 'Route:'
    },
    equipmentType: {
      zh: '設備類型：',
      en: 'Equipment Type:'
    },
    reportTime: {
      zh: '通報時間：',
      en: 'Report Time:'
    },
    reportPerson: {
      zh: '通報人員：',
      en: 'Reported By:'
    },
    owner: {
      zh: '擁有者',
      en: 'Owner'
    },
    lead: {
      zh: '領導者',
      en: 'Lead'
    },
    supervisor: {
      zh: '主管',
      en: 'Supervisor'
    },
    selectOwner: {
      zh: '選擇擁有者',
      en: 'Select owner'
    },
    selectLead: {
      zh: '選擇領導者',
      en: 'Select lead'
    },
    selectSupervisor: {
      zh: '選擇主管',
      en: 'Select supervisor'
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
    photoRecord: {
      zh: '拍照記錄',
      en: 'Photo Record'
    },
    loading: {
      zh: '載入中...',
      en: 'Loading...'
    },
    error: {
      zh: '載入錯誤',
      en: 'Error loading data'
    },
    info: {
      zh: '基本信息',
      en: 'Basic Information'
    },
    actual: {
      zh: '實際檢查',
      en: 'Actual Check'
    },
    report: {
      zh: '工作報告',
      en: 'Work Report'
    },
    basicInfo: {
      zh: '基本信息',
      en: 'Basic Information'
    },
    staffInfo: {
      zh: '人員信息',
      en: 'Staff Information'
    },
    maintenanceTime: {
      zh: '維護時間',
      en: 'Maintenance Time'
    },
    startTime: {
      zh: '開始時間',
      en: 'Start Time'
    },
    endTime: {
      zh: '結束時間',
      en: 'End Time'
    },
    pleaseSelect: {
      zh: '請選擇',
      en: 'Please select'
    },
    noData: {
      zh: '沒有數據',
      en: 'No data'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const handleGoBack = () => {
    // 直接確保localStorage中的tab值是最新的（確保當pmActiveTab值為有效值，如'assignToMe'時不被意外覆蓋）
    const currentTab = localStorage.getItem('pmActiveTab');
    if (currentTab && ['approved', 'inprogress', 'assignToMe', 'others'].includes(currentTab)) {
      console.log('保留當前tab:', currentTab);
    } else {
      // 如果沒有有效的tab值或localStorage為空，則設置為'assignToMe'
      localStorage.setItem('pmActiveTab', 'assignToMe');
      console.log('設置tab為assignToMe');
    }
    router.back();
  };

  const handleSave = async () => {
    // 工單不可編輯時，禁止保存
    if (!isEditable) {
      alert(nonEditableReason);
      return;
    }
    
    // 原有的保存邏輯
    try {
      if (!workOrder) return;
      
      setIsSubmitting(true);
      
      // 將時間轉換為ISO格式
      const startISO = maintenanceTime.startDate ? convertInputDateToISO(maintenanceTime.startDate) : '';
      const endISO = maintenanceTime.endDate ? convertInputDateToISO(maintenanceTime.endDate) : '';
      
      // 準備更新數據
      const updateData: Partial<PMWorkOrderDetail> = {
        id: workOrder.id,
        status: workOrder.status,
        owner: selectedStaff.owner,
        lead: selectedStaff.lead,
        supervisor: selectedStaff.supervisor,
        startTime: startISO,
        endTime: endISO
      };
      
      // 如果有更新的檢查項目，添加到更新數據中
      if (updatedCheckItems) {
        updateData.checkItems = updatedCheckItems;
      }
      
      // 如果有更新的資源項目，添加到更新數據中
      if (updatedResources) {
        updateData.resources = updatedResources;
      }
      
      // 調用API更新工單
      const updatedWorkOrder = await api.pm.updateWorkOrder(params.id, updateData);
      
      // 更新數據
      setWorkOrder(updatedWorkOrder);
      setIsDirty(false);
      
      // 顯示保存成功的訊息
      alert(language === 'zh' ? '保存成功' : 'Save successful');
    } catch (error) {
      console.error('保存失敗', error);
      alert(language === 'zh' ? '保存失敗，請稍後再試' : 'Save failed, please try again later');
    } finally {
      setIsSubmitting(false);
    }
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
        if (!maintenanceTime.startDate) validationErrors.push(language === 'zh' ? '開始時間未填寫' : 'Start time is required');
        if (!maintenanceTime.endDate) validationErrors.push(language === 'zh' ? '結束時間未填寫' : 'End time is required');
        if (!selectedStaff.owner) validationErrors.push(language === 'zh' ? '負責人未選擇' : 'Owner is required');
        if (!selectedStaff.lead) validationErrors.push(language === 'zh' ? '主導人員未選擇' : 'Lead is required');
        if (!selectedStaff.supervisor) validationErrors.push(language === 'zh' ? '監督人員未選擇' : 'Supervisor is required');
        
        // 2. 檢查 Actual 頁面的項目
        if (workOrder.checkItems && workOrder.checkItems.length > 0 && !actualCheckComplete) {
          validationErrors.push(language === 'zh' ? 'Actual頁面的檢查項目尚未全部完成' : 'Check items in Actual tab are not completed');
        }
        
        // 3. 檢查 Resource 頁面至少要有一個 labor 資源
        const hasLabor = (updatedResources?.labor && updatedResources.labor.length > 0) || 
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
        const result = await api.pm.submitWorkOrder(params.id, '', workOrder.status);
        console.log('Work order approved successfully:', result);
        alert(language === 'zh' ? '工單已成功核准！' : 'Work order has been approved!');
        router.push('/pm');
      } else if (workOrder.status === 'APPR') {
        // APPR 狀態：直接呼叫API，不開啟dialog
        setIsSubmitting(true);
        const result = await api.pm.submitWorkOrder(params.id, '', workOrder.status);
        console.log('Work order started successfully:', result);
        alert(language === 'zh' ? '已開始工作！' : 'Work started!');
        router.push('/pm');
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

  // 處理提交工單請求
  const handleSubmitWorkOrder = async (comment: string) => {
    try {
      if (!workOrder) return;
      
      // 添加提交前的檢查邏輯
      const validationErrors = [];
      
      // 只在INPRG狀態下檢查必填項，APPR狀態不需檢查
      if (workOrder.status === 'INPRG') {
        // 1. 檢查 Info 頁面的必填欄位
        if (!maintenanceTime.startDate) validationErrors.push(language === 'zh' ? '開始時間未填寫' : 'Start time is required');
        if (!maintenanceTime.endDate) validationErrors.push(language === 'zh' ? '結束時間未填寫' : 'End time is required');
        if (!selectedStaff.owner) validationErrors.push(language === 'zh' ? '負責人未選擇' : 'Owner is required');
        if (!selectedStaff.lead) validationErrors.push(language === 'zh' ? '主導人員未選擇' : 'Lead is required');
        if (!selectedStaff.supervisor) validationErrors.push(language === 'zh' ? '監督人員未選擇' : 'Supervisor is required');
        
        // 2. 檢查 Actual 頁面的項目
        if (workOrder.checkItems && workOrder.checkItems.length > 0 && !actualCheckComplete) {
          validationErrors.push(language === 'zh' ? 'Actual頁面的檢查項目尚未全部完成' : 'Check items in Actual tab are not completed');
        }
        
        // 3. 檢查 Resource 頁面至少要有一個 labor 資源
        const hasLabor = (updatedResources?.labor && updatedResources.labor.length > 0) || 
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
      const result = await api.pm.submitWorkOrder(params.id, comment, workOrder.status);
      
      console.log('Work order submitted successfully:', result);
      
      // 更新成功狀態
      setSubmitSuccess(true);
      setShowSubmitModal(false);
      
      // 顯示成功訊息
      alert(language === 'zh' ? '工單已成功提交核簽！' : 'Work order has been submitted for approval!');
      
      // 返回 PM 列表頁面
      router.push('/pm');
    } catch (error) {
      console.error('Error submitting work order:', error);
      alert(language === 'zh' ? `提交工單失敗：${error instanceof Error ? error.message : '未知錯誤'}` : `Failed to submit work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
    return maintenanceTime.startDate && 
           maintenanceTime.endDate && 
           selectedStaff.owner &&
           selectedStaff.lead &&
           selectedStaff.supervisor;
  };

  // ActualCheck完成狀態變更處理函數，儲存更新後的檢查項目
  const handleActualCheckCompleteChange = (isComplete: boolean, checkItems?: CheckItem[]) => {
    setActualCheckComplete(isComplete);
    // 只有當checkItems存在且與當前的updatedCheckItems不同時才更新
    if (checkItems && JSON.stringify(checkItems) !== JSON.stringify(updatedCheckItems)) {
      setUpdatedCheckItems(checkItems);
    }
  };

  const handleResourceCompleteChange = (isComplete: boolean, resources?: {
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  }) => {
    setResourceComplete(isComplete);
    
    // 如果資源數據存在，則更新
    if (resources) {
      setUpdatedResources(resources);
    }
  };

  // 添加一個useEffect來處理頁面切換時檢查完成狀態
  useEffect(() => {
    // 當切換到actual頁簽時，檢查工單的checkItems是否全部完成
    if (activeTab === 'actual' && workOrder && workOrder.checkItems) {
      const isComplete = workOrder.checkItems.every(item => item.result !== '');
      setActualCheckComplete(isComplete);
    }
  }, [activeTab, workOrder]);

  // 監控數據變更狀態
  useEffect(() => {
    // 檢查人員數據是否變更
    const isStaffChanged = JSON.stringify(selectedStaff) !== JSON.stringify(originalStaff);
    
    // 檢查時間數據是否變更
    const isTimeChanged = JSON.stringify(maintenanceTime) !== JSON.stringify(originalTime);
    
    // 檢查檢查項目是否變更
    const isCheckItemsChanged = updatedCheckItems.length > 0;
    
    // 檢查資源是否變更
    const isResourcesChanged = !!updatedResources;
    
    // 更新整體數據變更狀態
    setIsDirty(isStaffChanged || isTimeChanged || isCheckItemsChanged || isResourcesChanged);
  }, [selectedStaff, maintenanceTime, updatedCheckItems, updatedResources, originalStaff, originalTime]);

  // 顯示載入中或錯誤狀態
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="text-red-500 text-xl">{t('error')}</div>
        <p className="mt-2 text-gray-600">{error?.message || 'No data available'}</p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
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
            
            {/* 不可編輯提示 */}
            {!isEditable && (
              <span className="ml-2 text-sm text-red-500">{nonEditableReason}</span>
            )}
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

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('description')}</div>
                <div className="flex-1">{workOrder.description}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('asset')}</div>
                <div className="flex-1">{workOrder.assets}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('location')}</div>
                <div className="flex-1">{workOrder.location}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('route')}</div>
                <div className="flex-1">{workOrder.route}</div>
              </div>

              <div className="flex px-4 py-3">
                <div className="w-28 text-gray-600">{t('equipmentType')}</div>
                <div className="flex-1">{workOrder.equipmentType}</div>
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
                <div className="text-sm text-gray-600 font-medium">Quick Time Set:</div>
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
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 1 hour (UTC+8)"
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
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 2 hours (UTC+8)"
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
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 4 hours (UTC+8)"
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
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 8 hours (UTC+8)"
                  >
                    <span className="text-xs font-semibold">+8h</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Start Time
                    {!maintenanceTime.startDate && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                      maintenanceTime.startDate 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={maintenanceTime.startDate}
                    onChange={(e) => setMaintenanceTime(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    End Time
                    {!maintenanceTime.endDate && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                      maintenanceTime.endDate 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    value={maintenanceTime.endDate}
                    onChange={(e) => setMaintenanceTime(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t('owner')}
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
                  value={selectedStaff.owner}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, owner: e.target.value }))}
                >
                  <option value="">{t('selectOwner')}</option>
                  {managerList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.id} - {staff.name}
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
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff.lead 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff.lead}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, lead: e.target.value }))}
                >
                  <option value="">{t('selectLead')}</option>
                  {managerList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.id} - {staff.name}
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
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff.supervisor 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff.supervisor}
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, supervisor: e.target.value }))}
                >
                  <option value="">{t('selectSupervisor')}</option>
                  {managerList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.id} - {staff.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ActualCheck 組件 */}
        {activeTab === 'actual' && (
          <ActualCheck 
            workOrderId={params.id} 
            onCompleteStatusChange={handleActualCheckCompleteChange}
            initialCheckItems={workOrder.checkItems}
            assets={workOrder.assets}
            route={workOrder.route}
            attachments={workOrder.attachments}
          />
        )}

        {/* Work Report 頁面 */}
        {activeTab === 'report' && (
          <WorkReport 
            workOrderId={params.id} 
            onCompleteStatusChange={handleResourceCompleteChange}
            initialReportItems={workOrder.reportItems}
            resources={workOrder.resources}
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
              <span>Info</span>
            </div>
          </button>
          
          <button 
            className={`py-4 text-center ${
              activeTab === 'actual' 
                ? 'bg-blue-800' 
                : 'hover:bg-blue-700'
            } ${
              (!workOrder.checkItems || workOrder.checkItems.length === 0) 
                ? 'opacity-70 cursor-not-allowed' 
                : ''
            }`}
            onClick={() => {
              if (workOrder.checkItems && workOrder.checkItems.length > 0) {
                setActiveTab('actual');
              }
            }}
            disabled={!workOrder.checkItems || workOrder.checkItems.length === 0}
          >
            <div className="flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <svg 
                  className={`w-6 h-6 ${
                    actualCheckComplete 
                      ? 'text-green-400' 
                      : (!workOrder.checkItems || workOrder.checkItems.length === 0) 
                        ? 'text-white/70' 
                        : 'text-white'
                  }`} 
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
              <span>Actual</span>
              {(!workOrder.checkItems || workOrder.checkItems.length === 0) && (
                <span className="text-xs text-white/70">No check items</span>
              )}
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
              <span>{t('resource')}</span>
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
    </div>
  );
} 