'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import ActualCheck from '@/components/ActualCheck';
import WorkReport from '@/components/WorkReport';
import api, { PMWorkOrder } from '@/services/api';

export default function PMListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'waiting'>('current');
  const [showSidebar, setShowSidebar] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 工單列表狀態
  const [workOrders, setWorkOrders] = useState<PMWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 使用API服務獲取工單列表
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await api.pm.getWorkOrders();
        setWorkOrders(data);
      } catch (err) {
        console.error('Error fetching PM work orders:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  // 篩選顯示的工單
  const filteredOrders = workOrders.filter(order => {
    // 根據頁籤篩選
    if (activeTab === 'waiting' && order.status !== 'APPR') {
      return false;
    }
    
    if (activeTab === 'current' && order.status !== 'WSCH' && order.status !== 'WAPPR') {
      return false;
    }

    // 搜尋關鍵字篩選
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) || 
        order.equipmentId.toLowerCase().includes(query) || 
        order.equipmentName.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        order.creator.toLowerCase().includes(query) ||
        order.location.toLowerCase().includes(query) ||
        order.pmType.toLowerCase().includes(query) ||
        order.frequency.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // 翻譯
  const translations = {
    currentReports: {
      zh: '等待排程',
      en: 'Waiting to be Scheduled'
    },
    waitingForApproval: {
      zh: '已核准待提交',
      en: 'Approved wait submit'
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

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  // 獲取狀態顯示名稱
  const getStatusDisplay = (status: string) => {
    const statusKey = status as keyof typeof statusTranslations;
    return statusTranslations[statusKey]?.[language] || status;
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
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

  // 獲取狀態標籤樣式
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'WAPPR':
      case 'WMATL':
      case 'WSCH':
      case 'WSCHED':
      case 'WPCOND':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPR':
      case 'INPRG':
        return 'bg-blue-100 text-blue-800';
      case 'COMP':
        return 'bg-green-100 text-green-800';
      case 'CLOSE':
        return 'bg-gray-100 text-gray-800';
      case 'CAN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWorkOrderClick = (id: string) => {
    router.push(`/pm/${id}`);
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 text-xl font-medium text-gray-800">PM</div>
          <div className="flex-1"></div>
        </div>

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
            <div className="text-center py-8 text-gray-500">{t('loading')}</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{t('error')}: {error.message}</div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm mb-3 cursor-pointer hover:bg-gray-50 border border-gray-100 overflow-hidden"
                onClick={() => handleWorkOrderClick(order.id)}
              >
                <div className="flex">
                  {/* 左側彩色狀態條 */}
                  <div className={`w-2 ${getStatusColor(order.status)}`}></div>
                  
                  <div className="flex-1 p-4">
                    {/* 頂部資訊列 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800 text-lg">{order.id}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeStyle(order.status)}`}>
                          {getStatusDisplay(order.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.created}
                      </div>
                    </div>

                    {/* 設備和描述區域 */}
                    <div className="mb-3">
                      <div className="flex gap-2 mb-1 text-sm">
                        <span className="text-gray-800 font-semibold">{order.equipmentName}</span>
                        <span className="text-gray-500">({order.equipmentId})</span>
                      </div>
                      <div className="text-gray-700 text-sm line-clamp-2">{order.description}</div>
                    </div>

                    {/* 詳細信息區域 - 採用標籤式布局 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {order.location}
                      </div>
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {order.pmType}
                      </div>
                      <div className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {order.frequency}
                      </div>
                    </div>
                    
                    {/* 創建者和工程師信息 */}
                    <div className="text-xs text-gray-500 flex justify-between border-t border-gray-100 pt-2 mt-1">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.creator}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {order.systemEngineer}
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