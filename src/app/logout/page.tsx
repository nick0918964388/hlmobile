'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 執行登出操作
    const logout = () => {
      // 移除登入狀態
      localStorage.removeItem('isLoggedIn');
      // 導航到登入頁面
      router.push('/');
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在登出，請稍候...</p>
      </div>
    </div>
  );
} 