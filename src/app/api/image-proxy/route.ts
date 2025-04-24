import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing image URL parameter', { status: 400 });
  }

  try {
    // 使用 URL 建構函數驗證 URL 合法性
    const validatedUrl = new URL(imageUrl);

    // 在伺服器端 fetch 原始圖片
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        // 您可能需要根據實際情況添加來源伺服器需要的 header，例如 Referer 或 Authorization
        // 'Referer': 'your-app-domain.com' 
      },
      // 考慮緩存策略
      // cache: 'force-cache' // 或 'no-store', 'reload', etc.
    });

    if (!response.ok) {
      console.error(`Failed to fetch image from ${imageUrl}, status: ${response.status}`);
      return new Response(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    // 獲取原始 Content-Type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const imageBuffer = await response.arrayBuffer();

    // 將圖片數據和 Content-Type 回傳給客戶端
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 可以添加緩存相關的 header
        'Cache-Control': 'public, max-age=3600', // 例如緩存1小時
      },
    });

  } catch (error) {
    console.error(`Error proxying image ${imageUrl}:`, error);
    if (error instanceof TypeError) { // URL 格式錯誤
        return new Response('Invalid image URL format', { status: 400 });
    }
    return new Response('Error proxying image', { status: 500 });
  }
} 