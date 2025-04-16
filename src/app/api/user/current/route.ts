import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/services/api';

// 獲取當前用戶 - 包含必要的權限
export async function GET() {
  try {
    // 從模擬權限 API 獲取用戶數據
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/user/permissions`);
    
    if (res.ok) {
      const userData = await res.json();
      return NextResponse.json(userData);
    }
    
    // 如果無法從權限 API 獲取，返回預設用戶數據
    return NextResponse.json({
      id: 'user001',
      username: 'testuser',
      name: '測試用戶',
      email: 'test@example.com',
      avatar: '',
      role: '工程師',
      groups: ['engineers'],
      department: '工程部',
      permissions: ['pm.access', 'cm.access']
    } as User);
  } catch (error) {
    console.error('獲取用戶數據錯誤:', error);
    return NextResponse.json(
      { error: '無法獲取用戶數據' }, 
      { status: 500 }
    );
  }
} 