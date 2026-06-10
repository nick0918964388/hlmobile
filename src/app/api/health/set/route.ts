import { NextResponse, NextRequest } from 'next/server';
import type { SystemHealth } from '@/services/api';

// 保存當前模擬的健康狀態
// TODO: module 級變數在多實例 / serverless 環境不會共享，
// 正式環境需改為外部儲存（如 Redis / DB）才能跨實例同步維護狀態。
let currentHealthStatus: SystemHealth = {
  status: 'ok',
  message: '系統運行正常'
};

// 設置系統健康狀態 (需要管理員權限)
export async function POST(request: NextRequest) {
  try {
    // 權限檢查：目前沒有真實 session 機制，改以 server 端 secret header 驗證
    const adminToken = process.env.HEALTH_ADMIN_TOKEN;
    const requestToken = request.headers.get('x-health-admin-token');
    if (!adminToken || requestToken !== adminToken) {
      return NextResponse.json({ error: '未授權操作' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body || !body.status) {
      return NextResponse.json(
        { error: '請提供有效的健康狀態信息' }, 
        { status: 400 }
      );
    }
    
    // 驗證狀態值
    if (!['ok', 'maintenance', 'error'].includes(body.status)) {
      return NextResponse.json(
        { error: '狀態值必須是 ok, maintenance 或 error' }, 
        { status: 400 }
      );
    }
    
    // 更新健康狀態
    currentHealthStatus = {
      status: body.status,
      message: body.message || (body.status === 'ok' 
        ? '系統運行正常' 
        : '系統目前正在維護中'),
      estimatedRecoveryTime: body.estimatedRecoveryTime
    };
    
    return NextResponse.json({
      success: true,
      currentStatus: currentHealthStatus
    });
    
  } catch (error) {
    console.error('設置健康狀態錯誤:', error);
    return NextResponse.json(
      { error: '設置健康狀態時發生錯誤' }, 
      { status: 500 }
    );
  }
}

// 獲取當前模擬的健康狀態
export async function GET() {
  return NextResponse.json(currentHealthStatus);
} 