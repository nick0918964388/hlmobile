import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/session';

// 獲取當前用戶 - 從 session cookie 解析出已驗證使用者
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSession(token);

  if (!user) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  return NextResponse.json(user);
}
