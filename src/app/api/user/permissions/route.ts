import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/session';

// 讀取目前 session 的權限。
// 權限由 server 依 session 決定，不接受 client 修改（已移除開放的 POST）。
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSession(token);

  if (!user) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  return NextResponse.json({ permissions: user.permissions || [] });
}
