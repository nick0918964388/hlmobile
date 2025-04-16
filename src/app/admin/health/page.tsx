'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SystemHealth } from '@/services/api';

export default function HealthAdminPage() {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusInput, setStatusInput] = useState<'ok' | 'maintenance' | 'error'>('ok');
  const [messageInput, setMessageInput] = useState('');
  const [estimatedRecoveryTime, setEstimatedRecoveryTime] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health/set');
      if (res.ok) {
        const data = await res.json();
        setCurrentStatus(data);
        setStatusInput(data.status || 'ok');
        setMessageInput(data.message || '');
        setEstimatedRecoveryTime(data.estimatedRecoveryTime || '');
      } else {
        console.error('無法獲取當前健康狀態');
      }
    } catch (error) {
      console.error('獲取健康狀態錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHealthStatus = async () => {
    try {
      setLoading(true);
      
      const payload: SystemHealth = {
        status: statusInput,
        message: messageInput || (statusInput === 'ok' ? '系統運行正常' : '系統目前正在維護中')
      };
      
      if (estimatedRecoveryTime) {
        payload.estimatedRecoveryTime = estimatedRecoveryTime;
      }
      
      const res = await fetch('/api/health/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        await fetchCurrentStatus();
      } else {
        const errorData = await res.json();
        alert(`更新失敗: ${errorData.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('更新健康狀態錯誤:', error);
      alert('更新健康狀態時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const testMaintenancePage = () => {
    window.open('/maintenance', '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">系統健康狀態管理</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">當前狀態</h2>
        
        {loading ? (
          <p className="text-gray-600">載入中...</p>
        ) : currentStatus ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">狀態:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                currentStatus.status === 'ok' 
                  ? 'bg-green-100 text-green-800' 
                  : currentStatus.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {currentStatus.status}
              </span>
            </p>
            <p><span className="font-medium">訊息:</span> {currentStatus.message}</p>
            {currentStatus.estimatedRecoveryTime && (
              <p><span className="font-medium">預計恢復時間:</span> {currentStatus.estimatedRecoveryTime}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">無法獲取當前狀態</p>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">更新系統狀態</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              狀態:
            </label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="ok">正常 (ok)</option>
              <option value="maintenance">維護中 (maintenance)</option>
              <option value="error">錯誤 (error)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              訊息:
            </label>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={statusInput === 'ok' ? '系統運行正常' : '系統目前正在維護中'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              預計恢復時間 (選填):
            </label>
            <input
              type="text"
              value={estimatedRecoveryTime}
              onChange={(e) => setEstimatedRecoveryTime(e.target.value)}
              placeholder="例如: 2023/12/31 18:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center space-x-4 pt-2">
            <button
              onClick={updateHealthStatus}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? '更新中...' : '更新狀態'}
            </button>
            
            <button
              onClick={testMaintenancePage}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              測試維護頁面
            </button>
            
            {updateSuccess && (
              <span className="text-green-600">更新成功!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 