'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const handleGoBack = () => {
    router.back();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
    // 這裡可以添加將語言設定保存到本地存儲的邏輯
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 頂部導航欄 */}
      <div className="bg-white h-14 flex items-center px-4 shadow-sm">
        <button onClick={handleGoBack} className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-4 text-xl font-medium">Language Settings</div>
      </div>

      {/* 設定內容 */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white divide-y">
          {/* 語言設定 */}
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-gray-600">Language</div>
              <button 
                onClick={toggleLanguage} 
                className="text-sm px-3 py-1 bg-gray-200 rounded"
              >
                {language === 'zh' ? '中文' : 'EN'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 