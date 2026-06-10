import { NextResponse, NextRequest } from 'next/server';
import api from '@/services/api';
import type { SystemHealth } from '@/services/api';

// 此 route 會讀 request.nextUrl.origin 做 server 端 self-fetch，無法靜態預先產生，標記為動態
export const dynamic = 'force-dynamic';

// 將狀態對應到 HTTP 狀態碼，讓 middleware 能依此判斷是否導向維護頁
function httpStatusForHealth(status: SystemHealth['status']): number {
  return status === 'ok' ? 200 : 503;
}

export async function GET(request: NextRequest) {
  try {
    // 先嘗試從模擬狀態API獲取狀態（維護模式由 /api/health/set 設定）
    try {
      // 在 server 端 fetch 需使用絕對 URL，從 request 取得 origin
      const mockResponse = await fetch(`${request.nextUrl.origin}/api/health/set`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (mockResponse.ok) {
        const mockHealthStatus = (await mockResponse.json()) as SystemHealth;
        console.log('使用模擬健康狀態:', mockHealthStatus);
        return NextResponse.json(mockHealthStatus, {
          status: httpStatusForHealth(mockHealthStatus.status)
        });
      }
    } catch (mockError) {
      console.log('無法獲取模擬狀態，改用實際API:', mockError);
    }

    // 如果模擬狀態不可用，使用實際API
    const healthStatus = await api.health.getSystemHealth();
    console.log('系統健康狀態:', healthStatus);

    return NextResponse.json(healthStatus, {
      status: httpStatusForHealth(healthStatus.status)
    });
  } catch (error) {
    console.error('健康檢查API錯誤:', error);

    // 後端異常時回傳 error 狀態與 503，讓 middleware 導向維護頁
    return NextResponse.json(
      {
        status: 'error',
        message: '系統健康檢查失敗'
      } as SystemHealth,
      { status: 503 }
    );
  }
}
