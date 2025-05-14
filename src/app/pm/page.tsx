'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import ActualCheck from '@/components/ActualCheck';
import WorkReport from '@/components/WorkReport';
import api, { PMWorkOrder } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

export default function PMListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'approved' | 'inprogress' | 'assignToMe' | 'others'>('approved');
  const [showSidebar, setShowSidebar] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  
  // 載入頁面時從localStorage獲取上次選擇的標籤
  useEffect(() => {
    const savedTab = localStorage.getItem('pmActiveTab');
    console.log('PM頁面加載，讀取savedTab:', savedTab);
    if (savedTab && ['approved', 'inprogress', 'assignToMe', 'others'].includes(savedTab)) {
      setActiveTab(savedTab as 'approved' | 'inprogress' | 'assignToMe' | 'others');
    }
  }, [router]);
  
  // 當標籤變更時，保存到localStorage
  useEffect(() => {
    console.log('PM保存activeTab到localStorage:', activeTab);
    localStorage.setItem('pmActiveTab', activeTab);
  }, [activeTab]);
  
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
    if (activeTab === 'approved' && order.status !== 'APPR') {
      return false;
    }
    if (activeTab === 'inprogress' && order.status !== 'INPRG') {
      return false;
    }
    // 指派給我的標籤，篩選狀態為"WFA"的工單
    if (activeTab === 'assignToMe') {
      // 僅檢查狀態是否為WFA
      return order.status === 'WFA';
    }
    if (activeTab === 'others' && (order.status === 'APPR' || order.status === 'INPRG' || order.status === 'WFA')) {
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
      zh: '當前工單',
      en: 'Current Reports'
    },
    waitingForApproval: {
      zh: '等待核准',
      en: 'Waiting for Approval'
    },
    approved: {
      zh: '當前工作',
      en: 'Current Work'
    },
    inprogress: {
      zh: '進行中',
      en: 'In Progress'
    },
    assignToMe: {
      zh: '等待核准',
      en: 'Wait for Approval'
    },
    others: {
      zh: '其他',
      en: 'Others'
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
    // 確保當前tab值被保存
    localStorage.setItem('pmActiveTab', activeTab);
    console.log('保存當前tab到localStorage:', activeTab);
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
                activeTab === 'approved'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('approved')}
            >
              {t('approved')}
            </button>
            <button
              className={`py-2 px-1 -mb-px font-medium ${
                activeTab === 'inprogress'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('inprogress')}
            >
              {t('inprogress')}
            </button>
            <button
              className={`py-2 px-1 -mb-px font-medium ${
                activeTab === 'assignToMe'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('assignToMe')}
            >
              {t('assignToMe')}
            </button>
            <button
              className={`py-2 px-1 -mb-px font-medium ${
                activeTab === 'others'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('others')}
            >
              {t('others')}
            </button>
          </div>
        </div>

        {/* 工單列表 */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              {t('loading')}
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              {t('error')}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {t('noRecordsFound')}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      {order.id.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {order.equipmentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`${getStatusColor(order.status)} text-xs font-medium mr-2 px-2.5 py-0.5 rounded`}>
                      {getStatusDisplay(order.status)}
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => handleWorkOrderClick(order.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h8M13 8h8M13 12h8" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}