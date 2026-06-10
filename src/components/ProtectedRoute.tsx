'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { SkeletonPage } from './Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // 載入完成且無已驗證使用者時，導向登入頁
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // 顯示載入中狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonPage />
      </div>
    );
  }

  // 僅當用戶已驗證時渲染子組件
  return user ? <>{children}</> : null;
}
