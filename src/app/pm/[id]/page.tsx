'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ActualCheck from '@/components/ActualCheck';
import WorkReport from '@/components/WorkReport';
import SubmitModal from '@/components/SubmitModal';
import api, { PMWorkOrderDetail } from '@/services/api';

export default function PMDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'actual' | 'report'>('info');
  const [showStaffSelect, setShowStaffSelect] = useState({
    owner: false,
    lead: false,
    supervisor: false
  });
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

  // 從API獲取工單詳情
  useEffect(() => {
    const fetchWorkOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await api.pm.getWorkOrderDetail(params.id);
        setWorkOrder(data);
        
        // 設置人員數據，如果API中有相應的欄位
        if (data) {
          setSelectedStaff({
            owner: data.owner || '',
            lead: data.lead || '',
            supervisor: data.supervisor || ''
          });
        }
      } catch (err) {
        console.error('Error fetching work order detail:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderDetail();
  }, [params.id]);

  // 增加一個 useEffect 確保當沒有檢查項目時不會選擇 actual 標籤
  useEffect(() => {
    if (activeTab === 'actual' && workOrder && (!workOrder.checkItems || workOrder.checkItems.length === 0)) {
      setActiveTab('info');
    }
  }, [workOrder, activeTab]);

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
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSave = async () => {
    console.log('Saving work order');
    
    try {
      if (!workOrder) return;
      
      // 準備更新數據
      const updateData: Partial<PMWorkOrderDetail> = {
        owner: selectedStaff.owner,
        lead: selectedStaff.lead,
        supervisor: selectedStaff.supervisor
      };
      
      // 調用API更新工單
      const updatedWorkOrder = await api.pm.updateWorkOrder(params.id, updateData);
      
      // 更新本地狀態
      setWorkOrder(updatedWorkOrder);
      
      // 顯示成功消息
      alert(language === 'zh' ? '工單已成功保存！' : 'Work order saved successfully!');
    } catch (error) {
      console.error('Error saving work order:', error);
      alert(language === 'zh' ? '保存工單失敗，請重試。' : 'Failed to save work order. Please try again.');
    }
  };

  const handleComplete = () => {
    setShowSubmitModal(true);
  };

  // 處理提交工單請求
  const handleSubmitWorkOrder = async (comment: string) => {
    try {
      setIsSubmitting(true);
      // 呼叫 API 提交工單
      const result = await api.pm.submitWorkOrder(params.id, comment);
      
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
      alert(language === 'zh' ? '提交工單失敗，請重試。' : 'Failed to submit work order. Please try again.');
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

  const handleActualCheckCompleteChange = (isComplete: boolean) => {
    setActualCheckComplete(isComplete);
  };

  const handleResourceCompleteChange = (isComplete: boolean) => {
    setResourceComplete(isComplete);
  };

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
            <button onClick={handleSave} className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50">
              Save
            </button>
            <button onClick={handleComplete} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              Submit
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
                      const now = new Date();
                      const startDateTime = now.toISOString().slice(0, 16);
                      const endDateTime = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 1 hour"
                  >
                    <span className="text-xs font-semibold">+1h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const startDateTime = now.toISOString().slice(0, 16);
                      const endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 2 hours"
                  >
                    <span className="text-xs font-semibold">+2h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const startDateTime = now.toISOString().slice(0, 16);
                      const endDateTime = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 4 hours"
                  >
                    <span className="text-xs font-semibold">+4h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const startDateTime = now.toISOString().slice(0, 16);
                      const endDateTime = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      
                      setMaintenanceTime({
                        startDate: startDateTime,
                        endDate: endDateTime
                      });
                    }}
                    className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
                    title="Set current time + 8 hours"
                  >
                    <span className="text-xs font-semibold">+8h</span>
                  </button>
                </div>
              </div>
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
                  {t('owner')}
                  {!selectedStaff.owner && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <button
                  className={`w-full border rounded px-3 py-2 text-left flex justify-between items-center focus:ring-1 ${
                    selectedStaff.owner 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  onClick={() => setShowStaffSelect(prev => ({ ...prev, owner: true }))}
                >
                  <span>{selectedStaff.owner ? `${selectedStaff.owner}` : t('selectOwner')}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStaffSelect.owner && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                    {staffList.map(staff => (
                      <button
                        key={staff.id}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedStaff(prev => ({ ...prev, owner: staff.id }));
                          setShowStaffSelect(prev => ({ ...prev, owner: false }));
                        }}
                      >
                        {staff.id} - {staff.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t('lead')}
                  {!selectedStaff.lead && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <button
                  className={`w-full border rounded px-3 py-2 text-left flex justify-between items-center focus:ring-1 ${
                    selectedStaff.lead 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  onClick={() => setShowStaffSelect(prev => ({ ...prev, lead: true }))}
                >
                  <span>{selectedStaff.lead ? `${selectedStaff.lead}` : t('selectLead')}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStaffSelect.lead && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                    {staffList.map(staff => (
                      <button
                        key={staff.id}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedStaff(prev => ({ ...prev, lead: staff.id }));
                          setShowStaffSelect(prev => ({ ...prev, lead: false }));
                        }}
                      >
                        {staff.id} - {staff.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t('supervisor')}
                  {!selectedStaff.supervisor && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <button
                  className={`w-full border rounded px-3 py-2 text-left flex justify-between items-center focus:ring-1 ${
                    selectedStaff.supervisor 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  onClick={() => setShowStaffSelect(prev => ({ ...prev, supervisor: true }))}
                >
                  <span>{selectedStaff.supervisor ? `${selectedStaff.supervisor}` : t('selectSupervisor')}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStaffSelect.supervisor && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                    {staffList.map(staff => (
                      <button
                        key={staff.id}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedStaff(prev => ({ ...prev, supervisor: staff.id }));
                          setShowStaffSelect(prev => ({ ...prev, supervisor: false }));
                        }}
                      >
                        {staff.id} - {staff.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ActualCheck 組件 - 傳遞從API獲取的checkItems */}
        {activeTab === 'actual' && (
          <ActualCheck 
            workOrderId={params.id} 
            onCompleteStatusChange={handleActualCheckCompleteChange}
            initialCheckItems={workOrder.checkItems} 
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