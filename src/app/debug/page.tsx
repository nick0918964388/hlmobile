'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePermissions } from '@/hooks/usePermissions';
import Sidebar from '@/components/Sidebar';

export default function DebugPage() {
  const { user, loading } = useUser();
  const { hasPermission, togglePermission, permissions } = usePermissions();
  const [pmAccess, setPmAccess] = useState<boolean>(false);
  const [cmAccess, setCmAccess] = useState<boolean>(false);

  useEffect(() => {
    setPmAccess(hasPermission('pm.access'));
    setCmAccess(hasPermission('cm.access'));
  }, [permissions, hasPermission]);

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">系統除錯頁面</h1>
        
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">用戶資訊</h2>
          
          {loading ? (
            <p className="text-gray-500">載入中...</p>
          ) : user ? (
            <div className="space-y-2">
              <p><span className="font-medium">用戶名:</span> {user.name}</p>
              <p><span className="font-medium">角色:</span> {user.role}</p>
              <p><span className="font-medium">部門:</span> {user.department}</p>
              
              <div>
                <p className="font-medium mb-1">群組:</p>
                {user.groups?.length ? (
                  <ul className="list-disc list-inside pl-2">
                    {user.groups.map((group, index) => (
                      <li key={index}>{group}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">無群組資訊</p>
                )}
              </div>
              
              <div>
                <p className="font-medium mb-1">權限:</p>
                {permissions?.length ? (
                  <ul className="list-disc list-inside pl-2">
                    {permissions.map((permission, index) => (
                      <li key={index}>{permission}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">無權限資訊</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-red-500">無法載入用戶資訊</p>
          )}
        </div>
        
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">權限測試</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">PM 訪問權限 (pm.access):</span>{' '}
                <span className={pmAccess ? 'text-green-600' : 'text-red-600'}>
                  {pmAccess ? '有權限' : '無權限'}
                </span>
              </div>
              <button 
                onClick={() => togglePermission('pm.access')}
                className={`px-3 py-1 rounded text-white ${pmAccess ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {pmAccess ? '移除權限' : '添加權限'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">CM 訪問權限 (cm.access):</span>{' '}
                <span className={cmAccess ? 'text-green-600' : 'text-red-600'}>
                  {cmAccess ? '有權限' : '無權限'}
                </span>
              </div>
              <button 
                onClick={() => togglePermission('cm.access')}
                className={`px-3 py-1 rounded text-white ${cmAccess ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {cmAccess ? '移除權限' : '添加權限'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              您可以使用上面的按鈕來添加或移除特定權限，然後觀察左側選單的變化。
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">路由測試</h2>
          <div className="space-y-2">
            <a href="/pm" className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center">
              訪問 PM 頁面
            </a>
            <a href="/cm" className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center">
              訪問 CM 頁面
            </a>
            <a href="/admin/health" className="block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center">
              系統健康狀態管理
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 