'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 執行登出操作：清除 server session cookie，再導向登入頁
    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // 忽略錯誤，仍導向登入頁
      }
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