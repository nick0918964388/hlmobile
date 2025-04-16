'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SkeletonPage } from './Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 檢查用戶是否已登入
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        // 如果未登入，重定向到登入頁面
        router.push('/');
      } else {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // 顯示載入中狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonPage />
      </div>
    );
  }

  // 僅當用戶已登入時渲染子組件
  return isAuthenticated ? <>{children}</> : null;
} 