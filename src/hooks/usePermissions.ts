'use client';

import { useState, useEffect } from 'react';
import { User } from '@/services/api';

// 使用 hook 檢查權限
export function usePermissions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user/current');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setPermissions(userData.permissions || []);
        }
      } catch (error) {
        console.error('獲取用戶權限錯誤:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // 添加或移除特定權限 (僅用於測試)
  const togglePermission = async (permission: string) => {
    if (!user) return;

    // 檢查權限是否已存在
    const hasPermission = permissions.includes(permission);
    const newPermissions = hasPermission 
      ? permissions.filter(p => p !== permission)
      : [...permissions, permission];

    try {
      const response = await fetch('/api/user/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPermissions })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user?.permissions) {
          setPermissions(result.user.permissions);
        }
      }
    } catch (error) {
      console.error('更新權限錯誤:', error);
    }
  };

  // 檢查是否有特定權限
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    user,
    loading,
    permissions,
    hasPermission,
    togglePermission
  };
} 