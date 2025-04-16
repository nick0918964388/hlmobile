'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import CMActual from '@/components/CMActual';
import api, { CMWorkOrder, EquipmentOption } from '@/services/api';
import { SkeletonList } from '@/components/Skeleton';

export default function CMPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'waiting'>('current');
  const mainContentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language } = useLanguage();
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 使用API服務獲取的數據
  const [cmRecords, setCmRecords] = useState<CMWorkOrder[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);
  const [abnormalOptions, setAbnormalOptions] = useState<string[]>([]);
  const [maintenanceOptions, setMaintenanceOptions] = useState<string[]>([]);
  
  // 加載狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 表單數據
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    location: '',
    description: '',
    abnormalType: '',
    maintenanceType: ''
  });
  
  // 使用API服務獲取CM工單列表
  useEffect(() => {
    const fetchCmWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await api.cm.getWorkOrders();
        setCmRecords(data);
      } catch (err) {
        console.error('Error fetching CM work orders:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCmWorkOrders();
  }, []);
  
  // 使用API服務獲取設備選項列表
  useEffect(() => {
    const fetchEquipmentOptions = async () => {
      try {
        const data = await api.cm.getEquipmentOptions();
        setEquipmentOptions(data);
      } catch (err) {
        console.error('Error fetching equipment options:', err);
      }
    };

    fetchEquipmentOptions();
  }, []);
  
  // 使用API服務獲取異常類型選項
  useEffect(() => {
    const fetchAbnormalOptions = async () => {
      try {
        const data = await api.cm.getAbnormalOptions();
        setAbnormalOptions(data);
      } catch (err) {
        console.error('Error fetching abnormal options:', err);
      }
    };

    fetchAbnormalOptions();
  }, []);
  
  // 使用API服務獲取維護類型選項
  useEffect(() => {
    const fetchMaintenanceOptions = async () => {
      try {
        const data = await api.cm.getMaintenanceOptions();
        setMaintenanceOptions(data);
      } catch (err) {
        console.error('Error fetching maintenance options:', err);
      }
    };

    fetchMaintenanceOptions();
  }, []);

  // 篩選顯示的工單
  const filteredRecords = cmRecords.filter(record => {
    // 根據頁籤篩選
    if (activeTab === 'waiting' && record.status !== 'waiting_approval') {
      return false;
    }

    // 搜尋關鍵字篩選
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        record.id.toLowerCase().includes(query) || 
        record.equipmentId.toLowerCase().includes(query) || 
        record.equipmentName.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.creator.toLowerCase().includes(query) ||
        record.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // 翻譯
  const translations = {
    createReport: {
      zh: '新增報修',
      en: 'Create Report'
    },
    equipment: {
      zh: '設備',
      en: 'Equipment'
    },
    selectEquipment: {
      zh: '選擇設備',
      en: 'Select Equipment'
    },
    location: {
      zh: '位置',
      en: 'Location'
    },
    description: {
      zh: '描述',
      en: 'Description'
    },
    abnormalType: {
      zh: '異常類型',
      en: 'Abnormal Type'
    },
    selectAbnormalType: {
      zh: '選擇異常類型',
      en: 'Select Abnormal Type'
    },
    maintenanceType: {
      zh: '維修類型',
      en: 'Maintenance Type'
    },
    selectMaintenanceType: {
      zh: '選擇維修類型',
      en: 'Select Maintenance Type'
    },
    submit: {
      zh: '提交',
      en: 'Submit'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    pleaseEnter: {
      zh: '請輸入...',
      en: 'Please enter...'
    },
    required: {
      zh: '必填',
      en: 'Required'
    },
    currentReports: {
      zh: '當前工單',
      en: 'Current Reports'
    },
    waitingForApproval: {
      zh: '等待核准',
      en: 'Waiting for Approval'
    },
    searchPlaceholder: {
      zh: '搜尋工單號碼、設備ID或描述',
      en: 'Search by work order, equipment ID or description'
    },
    noRecordsFound: {
      zh: '沒有符合條件的工單',
      en: 'No records found'
    },
    loading: {
      zh: '正在載入...',
      en: 'Loading...'
    },
    error: {
      zh: '載入失敗',
      en: 'Failed to load'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const handleCardClick = (recordId: string) => {
    console.log(`Starting work on maintenance record: ${recordId}`);
    router.push(`/cm/${recordId}`);
  };

  // 點擊主內容區域時關閉側邊選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSidebar && 
        mainContentRef.current && 
        !mainContentRef.current.contains(event.target as Node)
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  // 處理設備選擇，自動填充位置
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedEquipment = equipmentOptions.find(eq => eq.id === selectedId);
    
    if (selectedEquipment) {
      setFormData({
        ...formData,
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        location: selectedEquipment.location,
        maintenanceType: maintenanceOptions[0] || '緊急設備修復' // 預設維修類型
      });
    } else {
      setFormData({
        ...formData,
        equipmentId: selectedId,
        equipmentName: '',
        location: ''
      });
    }
  };

  // 表單提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 檢查必填項
    if (!formData.equipmentId || !formData.description || !formData.abnormalType) {
      alert('請填寫所有必填欄位');
      return;
    }
    
    try {
      // 使用API服務創建新工單
      const result = await api.cm.createWorkOrder(formData);
      alert(`工單已建立: ${result.id}`);
      
      // 重新獲取工單列表
      const updatedRecords = await api.cm.getWorkOrders();
      setCmRecords(updatedRecords);
      
      // 重置表單並關閉報修表單
      setFormData({
        equipmentId: '',
        equipmentName: '',
        location: '',
        description: '',
        abnormalType: '',
        maintenanceType: ''
      });
      setShowReportForm(false);
    } catch (error) {
      console.error('Error creating CM work order:', error);
      alert('建立工單失敗');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 側邊欄 */}
      <div className={`fixed inset-y-0 left-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-800 text-white transition-transform duration-200 ease-in-out z-30`}>
        <Sidebar />
      </div>

      {/* 半透明背景遮罩 */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* 主要內容區 */}
      <div className="flex-1 flex flex-col text-gray-800" ref={mainContentRef}>
        {/* 頂部導航欄 */}
        <div className="bg-white h-14 flex items-center px-4 shadow-sm">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 text-xl font-medium text-gray-800">CM</div>
          <div className="flex-1"></div>
          <button 
            onClick={() => setShowReportForm(true)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
          >
            {t('createReport')}
          </button>
        </div>

        {/* 新增報修表單 */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('createReport')}</h2>
                <button 
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    {t('equipment')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.equipmentId}
                    onChange={handleEquipmentChange}
                    required
                  >
                    <option value="">{t('selectEquipment')}</option>
                    {equipmentOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} ({option.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    {t('description')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('pleaseEnter')}
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    {t('abnormalType')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.abnormalType}
                    onChange={(e) => setFormData({...formData, abnormalType: e.target.value})}
                    required
                  >
                    <option value="">{t('selectAbnormalType')}</option>
                    {abnormalOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    {t('maintenanceType')}
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                  >
                    <option value="">{t('selectMaintenanceType')}</option>
                    {maintenanceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 搜索欄 */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 頁籤 */}
        <div className="px-4">
          <div className="flex space-x-6 border-b">
            <button
              className={`py-2 px-1 -mb-px font-medium ${
                activeTab === 'current'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('current')}
            >
              {t('currentReports')}
            </button>
            <button
              className={`py-2 px-1 -mb-px font-medium ${
                activeTab === 'waiting'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('waiting')}
            >
              {t('waitingForApproval')}
            </button>
          </div>
        </div>

        {/* 工單列表 */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <SkeletonList count={4} />
          ) : error ? (
            <div className="text-center py-8 text-red-500">{t('error')}: {error.message}</div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow-sm mb-3 cursor-pointer hover:bg-gray-50 border border-gray-100 overflow-hidden"
                onClick={() => handleCardClick(record.id)}
              >
                <div className="flex">
                  {/* 左側彩色狀態條 */}
                  <div className={`w-2 ${record.status === 'waiting_approval' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex-1 p-4">
                    {/* 頂部資訊列 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800 text-lg">{record.id}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          record.status === 'waiting_approval' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'waiting_approval' ? t('waitingForApproval') : 'Approved'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.created}
                      </div>
                    </div>

                    {/* 設備和描述區域 */}
                    <div className="mb-3">
                      <div className="flex gap-2 mb-1 text-sm">
                        <span className="text-gray-800 font-semibold">{record.equipmentName}</span>
                        <span className="text-gray-500">({record.equipmentId})</span>
                      </div>
                      <div className="text-gray-700 text-sm line-clamp-2">{record.description}</div>
                    </div>

                    {/* 詳細信息區域 - 採用標籤式布局 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {record.location}
                      </div>
                      <div className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {record.abnormalType}
                      </div>
                      <div className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        {record.maintenanceType}
                      </div>
                    </div>
                    
                    {/* 創建者和工程師信息 */}
                    <div className="text-xs text-gray-500 flex justify-between border-t border-gray-100 pt-2 mt-1">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {record.creator}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {record.systemEngineer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">{t('noRecordsFound')}</div>
          )}
        </div>
      </div>
    </div>
  );
} 