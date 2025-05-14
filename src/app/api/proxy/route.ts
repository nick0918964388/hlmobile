import { NextRequest, NextResponse } from 'next/server';

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

    // 添加 maxauth 身份驗證標頭
    const maxauth = process.env.NEXT_PUBLIC_MAX_AUTH || 'bWF4YWRtaW46emFxMXhzVzI=';
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
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

    // 添加 maxauth 身份驗證標頭
    const maxauth = process.env.NEXT_PUBLIC_MAX_AUTH || 'bWF4YWRtaW46emFxMXhzVzI=';
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, maxauth'
    }
  });
} 