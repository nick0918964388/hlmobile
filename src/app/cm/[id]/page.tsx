'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import WorkReport from '@/components/WorkReport';
import CMActual from '@/components/CMActual';
import SubmitModal from '@/components/SubmitModal';
import api from '@/services/api';

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
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [maintenanceTime, setMaintenanceTime] = useState({
    startDate: '',
    endDate: ''
  });
  
  // 添加數據變更狀態
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // 添加原始數據狀態
  const [originalStaff, setOriginalStaff] = useState<string>('');
  const [originalTime, setOriginalTime] = useState({
    startDate: '',
    endDate: ''
  });
  
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
  
  // 異常類型選項
  const abnormalOptions = [
    'Efficiency Decrease',
    'Failure Shutdown',
    'Abnormal Vibration',
    'Abnormal Noise',
    'Leakage',
    'Component Damage'
  ];

  // 模擬從API獲取的工單數據
  const workOrder = {
    id: params.id,
    status: 'WAPPR', // 使用標準工單狀態
    openTime: '2020/11/29 14:31',
    creator: 'MAX_NICK',
    systemCode: 'F15',
    equipmentCode: '002003V01',
    description: 'Pump efficiency decrease',
    assets: 'P3PLUMP-P-LOADZNG03A',
    location: 'F15/00203W02',
    equipmentType: 'Pump',
    abnormalType: 'Efficiency Decrease',
    maintenanceType: 'Emergency Equipment Repair',
    workConditions: '必填',
    costCenter: '',
    longTermMaintenance: false,
    reportTime: '2020/11/29 14:31',
    reportPerson: 'MAX_NICK'
  };

  // 設備類型選項 - 模擬數據
  const equipmentOptions = [
    { id: 'P1THC-ZERO-C01', name: 'CUP ZEROC01 Zero Generator', location: 'F15/00203W02' },
    { id: 'P3PLUMP-P-LOADZNG03A', name: 'Pump XXXXXXXX', location: 'F15/00203W02' },
    { id: 'P4AIR-COMP-01', name: 'Air Compressor 01', location: 'F15/00204W01' }
  ];

  // 初始化可編輯欄位
  useEffect(() => {
    const fields = {
      description: workOrder.description,
      assets: workOrder.assets,
      abnormalType: workOrder.abnormalType
    };
    
    setEditableFields(fields);
    setOriginalEditableFields(fields);
    
    // 初始化時間和人員原始數據
    setOriginalTime(maintenanceTime);
    setOriginalStaff(selectedStaff);
  }, [workOrder.description, workOrder.assets, workOrder.abnormalType]);

  // 監控數據變更狀態
  useEffect(() => {
    // 檢查人員數據是否變更
    const isStaffChanged = selectedStaff !== originalStaff;
    
    // 檢查時間數據是否變更
    const isTimeChanged = JSON.stringify(maintenanceTime) !== JSON.stringify(originalTime);
    
    // 檢查可編輯欄位是否變更
    const isFieldsChanged = JSON.stringify(editableFields) !== JSON.stringify(originalEditableFields);
    
    // 檢查資源是否變更 (根據情況判斷)
    
    // 更新整體數據變更狀態
    setIsDirty(isStaffChanged || isTimeChanged || isFieldsChanged);
  }, [selectedStaff, maintenanceTime, editableFields, originalStaff, originalTime, originalEditableFields]);

  // 模擬員工列表
  const staffList = [
    { id: 'EMP001', name: 'John Smith' },
    { id: 'EMP002', name: 'Mary Johnson' },
    { id: 'EMP003', name: 'David Lee' },
    { id: 'EMP004', name: 'Sarah Chen' },
  ];

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
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSave = () => {
    console.log('Saving work order with editable fields:', editableFields);
    // 實現保存邏輯
    
    // 保存成功後，更新原始數據狀態
    setOriginalEditableFields({...editableFields});
    setOriginalStaff(selectedStaff);
    setOriginalTime({...maintenanceTime});
    
    // 重置變更狀態
    setIsDirty(false);
  };

  const handleComplete = () => {
    setShowSubmitModal(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const handleResourceCompleteChange = (isComplete: boolean) => {
    setResourceComplete(isComplete);
  };

  const handleActualCheckCompleteChange = (isComplete: boolean) => {
    setActualCheckComplete(isComplete);
  };

  // 工單狀態顯示
  const getStatusDisplay = () => {
    const status = workOrder.status as keyof typeof statusTranslations;
    return statusTranslations[status]?.[language] || status;
  };

  // 工單狀態顏色
  const getStatusColor = () => {
    switch (workOrder.status) {
      case 'WAPPR':
      case 'WMATL':
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
           selectedStaff;
  };

  // 保存單個欄位並關閉編輯
  const saveField = (field: 'description' | 'assets' | 'abnormalType') => {
    console.log(`保存欄位 ${field}:`, editableFields[field]);
    setEditing({...editing, [field]: false});
    // 這裡可以添加API保存邏輯
  };

  // 取消編輯並重置為原始值
  const cancelEdit = (field: 'description' | 'assets' | 'abnormalType') => {
    setEditableFields({
      ...editableFields, 
      [field]: field === 'description' 
        ? workOrder.description 
        : field === 'assets' 
          ? workOrder.assets 
          : workOrder.abnormalType
    });
    setEditing({...editing, [field]: false});
  };

  const [showSubmitModal, setShowSubmitModal] = useState(false);
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
                        {equipmentOptions.map(equipment => (
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
                        onChange={(e) => setEditableFields({...editableFields, abnormalType: e.target.value})}
                        autoFocus
                      >
                        {abnormalOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button 
                          className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          onClick={() => cancelEdit('abnormalType')}
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => saveField('abnormalType')}
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
                        {editableFields.abnormalType}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Start Time
                    {!maintenanceTime.startDate && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border rounded px-3 py-2 focus:ring-1 ${
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
                    className={`w-full border rounded px-3 py-2 focus:ring-1 ${
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
                  Responsible Staff
                  {!selectedStaff && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
                    selectedStaff 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={selectedStaff || ''}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">Select staff</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.id} - {staff.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ActualCheck 元件 */}
        {activeTab === 'actual' && <CMActual cmId={params.id} onCompleteStatusChange={handleActualCheckCompleteChange} />}

        {/* Resource 頁面 */}
        {activeTab === 'report' && <WorkReport workOrderId={params.id} onCompleteStatusChange={handleResourceCompleteChange} />}
      </div>

      {/* 底部固定按鈕 */}
      <div className="flex-none bg-blue-600 text-white">
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
    </div>
  );
} 