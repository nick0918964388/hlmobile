import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_ORIGIN, validateTargetUrl } from './validateTargetUrl';

// 前端 CORS 來源（無則同源，不使用 '*'）
const CORS_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || ALLOWED_ORIGIN;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function GET(request: NextRequest) {
  try {
    // 獲取要請求的目標URL
    const targetUrl = request.nextUrl.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: '缺少目標URL參數' },
        { status: 400 }
      );
    }

    // SSRF 防護：只允許白名單 origin + 路徑前綴
    if (!validateTargetUrl(targetUrl)) {
      return NextResponse.json(
        { error: '目標URL不被允許' },
        { status: 400 }
      );
    }

    // 解析所有搜索參數，以便於轉發
    const searchParams = new URLSearchParams();
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      if (key !== 'url') { // 排除url參數本身
        searchParams.append(key, value);
      }
    }

    // 如果有查詢參數，添加到目標URL
    let finalUrl = targetUrl;
    if (searchParams.toString()) {
      finalUrl += (targetUrl.includes('?') ? '&' : '?') + searchParams.toString();
    }

    console.log('代理請求目標:', finalUrl);

    // 提取原始請求的標頭
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // 排除一些不應該轉發的標頭
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    });

    // 添加 maxauth 身份驗證標頭（僅 server 端注入，不使用 fallback 帳密）
    const maxauth = process.env.MAX_AUTH;
    if (!maxauth) {
      console.warn('MAX_AUTH 環境變數未設定，無法注入 Maximo 憑證');
      return NextResponse.json(
        { error: '伺服器未設定 Maximo 憑證' },
        { status: 500 }
      );
    }
    headers.append('maxauth', maxauth);
    headers.append('Content-Type', 'application/json');

    // 發送代理請求
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    // 獲取回應資料
    const data = await response.json();

    // 返回代理的回應
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('代理請求錯誤:', error);
    return NextResponse.json(
      { error: '代理請求失敗', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 獲取要請求的目標URL
    const targetUrl = request.nextUrl.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: '缺少目標URL參數' },
        { status: 400 }
      );
    }

    // SSRF 防護：只允許白名單 origin + 路徑前綴
    if (!validateTargetUrl(targetUrl)) {
      return NextResponse.json(
        { error: '目標URL不被允許' },
        { status: 400 }
      );
    }

    // 解析所有搜索參數，以便於轉發
    const searchParams = new URLSearchParams();
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      if (key !== 'url') { // 排除url參數本身
        searchParams.append(key, value);
      }
    }

    // 如果有查詢參數，添加到目標URL
    let finalUrl = targetUrl;
    if (searchParams.toString()) {
      finalUrl += (targetUrl.includes('?') ? '&' : '?') + searchParams.toString();
    }

    console.log('代理POST請求目標:', finalUrl);

    // 提取原始請求的標頭和正文
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    });

    // 添加 maxauth 身份驗證標頭（僅 server 端注入，不使用 fallback 帳密）
    const maxauth = process.env.MAX_AUTH;
    if (!maxauth) {
      console.warn('MAX_AUTH 環境變數未設定，無法注入 Maximo 憑證');
      return NextResponse.json(
        { error: '伺服器未設定 Maximo 憑證' },
        { status: 500 }
      );
    }
    headers.append('maxauth', maxauth);
    headers.append('Content-Type', 'application/json');

    // 獲取請求正文
    const body = await request.json();

    // 發送代理請求
    const response = await fetch(finalUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    // 獲取回應資料
    const data = await response.json();

    // 返回代理的回應
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('代理請求錯誤:', error);
    return NextResponse.json(
      { error: '代理請求失敗', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  // 處理預檢請求
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, maxauth'
    }
  });
}