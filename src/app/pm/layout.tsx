'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function PMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 