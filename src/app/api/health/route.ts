import { NextResponse } from 'next/server';
import { getMaintenance } from '@/lib/maintenance';
import type { SystemHealth } from '@/services/api';

export const dynamic = 'force-dynamic';

// 將狀態對應到 HTTP 狀態碼，讓 middleware 能依此判斷是否導向維護頁
function httpStatusForHealth(status: SystemHealth['status']): number {
  return status === 'ok' ? 200 : 503;
}

// 直接讀共享的維護狀態，不做任何 self-fetch / Maximo 呼叫（避免反代/tunnel 下打自己公開 URL 失敗）。
// 預設 ok；唯有管理員透過 /api/health/set 設為 maintenance/error 時才回非 ok。
export async function GET() {
  const health = getMaintenance();
  return NextResponse.json(health, { status: httpStatusForHealth(health.status) });
}
