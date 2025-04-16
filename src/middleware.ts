import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 加入更多日誌以便調試
  console.log('中間件檢查路徑:', request.nextUrl.pathname);

  // 如果已經在維護頁面，不再檢查避免循環
  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 排除不需要檢查的路徑，如靜態資源、API以及logout
  const excludePaths = [
    '/_next',
    '/api/',
    '/favicon.ico',
    '/manifest.json',
    '/logout',
    '/admin'
  ];
  
  if (excludePaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    console.log('路徑排除檢查:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  try {
    // 檢查 SESSION_OVERRIDE_MAINTENANCE 參數
    const maintenanceBypass = request.cookies.get('SESSION_OVERRIDE_MAINTENANCE')?.value === 'true';
    if (maintenanceBypass) {
      console.log('維護模式被繞過');
      return NextResponse.next();
    }

    // 呼叫健康檢查API
    const healthRes = await fetch(`${request.nextUrl.origin}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // 避免緩存
    });

    if (!healthRes.ok) {
      console.log('健康檢查 API 回傳異常狀態碼', healthRes.status);
      // 如果健康檢查API回傳非200狀態碼，重定向到維護頁面
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    const healthData = await healthRes.json();
    console.log('健康檢查結果:', healthData);
    
    // 如果系統狀態不是'ok'，重定向到維護頁面
    if (healthData.status !== 'ok') {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // 如果一切正常，允許繼續訪問
    console.log('系統健康檢查通過，允許訪問:', request.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.error('健康檢查失敗:', error);
    // 如果健康檢查API呼叫失敗，也重定向到維護頁面
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
}

// 設定中間件執行路徑
export const config = {
  matcher: [
    // 排除資源文件和API路由
    '/((?!maintenance|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}; 