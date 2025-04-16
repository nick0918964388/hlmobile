import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/services/api';

// 模擬用戶數據 - 確保用戶有所需權限
let mockCurrentUser: User = {
  id: 'mock001',
  username: 'mockuser',
  name: '模擬用戶',
  email: 'mock@example.com',
  avatar: '',
  role: '維護工程師',
  groups: ['engineers', 'technicians'],
  department: '工程部',
  permissions: ['pm.access', 'cm.access', 'settings.access', 'admin.access']
};

// 獲取當前用戶
export async function GET() {
  return NextResponse.json(mockCurrentUser);
}

// 更新用戶權限
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.permissions) {
      mockCurrentUser.permissions = Array.isArray(body.permissions) 
        ? body.permissions 
        : [body.permissions];
        
      return NextResponse.json({
        success: true,
        user: mockCurrentUser
      });
    }
    
    return NextResponse.json(
      { error: '請提供權限列表' }, 
      { status: 400 }
    );
  } catch (error) {
    console.error('更新權限錯誤:', error);
    return NextResponse.json(
      { error: '更新權限時發生錯誤' }, 
      { status: 500 }
    );
  }
} 