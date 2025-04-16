'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import type { SystemHealth } from '@/services/api';

export default function MaintenancePage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [checking, setChecking] = useState(false);

  // 手動繞過維護模式的函數
  const bypassMaintenance = () => {
    // 設置 cookie 以繞過中間件的檢查
    document.cookie = 'SESSION_OVERRIDE_MAINTENANCE=true; path=/; max-age=3600';
    // 導航回首頁
    router.push('/');
  };

  // 系統健康檢查函數
  const checkSystemHealth = async () => {
    if (checking) return; // 防止多次同時檢查
    
    try {
      setChecking(true);
      console.log('正在檢查系統健康狀態...');
      const healthStatus = await api.health.getSystemHealth();
      console.log('取得健康狀態:', healthStatus);
      setHealthData(healthStatus);
      
      // 如果系統恢復正常，則重導回首頁
      if (healthStatus.status === 'ok') {
        console.log('系統恢復正常，準備重導至首頁');
        router.push('/');
      } else {
        console.log('系統仍處於維護狀態:', healthStatus.status);
      }
      
    } catch (error) {
      console.error('獲取系統健康狀態失敗:', error);
    } finally {
      setLoading(false);
      setChecking(false);
      // 重置倒數計時
      setCountdown(30);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // 每30秒檢查一次系統狀態，並顯示倒數計時
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 當倒數為0時，觸發健康檢查
          checkSystemHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-yellow-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">系統維護中</h1>
        
        {loading ? (
          <p className="text-gray-600">正在獲取系統狀態...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{healthData?.message || '系統正在進行維護，暫時無法使用。'}</p>
            
            {healthData?.estimatedRecoveryTime && (
              <p className="text-gray-600 mb-4">
                預計恢復時間: <span className="font-medium">{healthData.estimatedRecoveryTime}</span>
              </p>
            )}
            
            <p className="text-gray-600 mt-4">
              下次系統狀態檢查: <span className="font-medium">{countdown}</span> 秒後
            </p>
            
            <button
              onClick={() => checkSystemHealth()}
              disabled={checking}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? '檢查中...' : '立即檢查系統狀態'}
            </button>
            
            <button
              onClick={bypassMaintenance}
              className="mt-4 ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              強制進入系統
            </button>
          </>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            如有緊急事項，請聯繫系統管理員。
          </p>
        </div>
      </div>
    </div>
  );
} 