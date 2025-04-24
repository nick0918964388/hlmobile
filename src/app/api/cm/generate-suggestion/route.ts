import { NextResponse } from 'next/server';

// 將 generateFailureDescription 函數直接移到這裡
/**
 * 從 Ollama API 產生故障描述建議
 * @param prompt 提示詞
 * @returns Ollama API 的回應
 */
async function generateFailureDescription(prompt: string): Promise<any> {
  try {
    const response = await fetch('http://ollama.webtw.xyz:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small', // 或者你可以讓模型名稱成為參數
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
          errorData = await response.json();
      } catch (e) {
          // 如果無法解析 JSON，使用狀態文字
          throw new Error(`Ollama API request failed with status ${response.status}: ${response.statusText}`);
      }
      console.error("Ollama API error response:", errorData);
      throw new Error(`Ollama API request failed with status ${response.status}: ${errorData?.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("Ollama API response:", data);
    return data; // 回傳完整的 API 回應
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error; // 將錯誤向上拋出以便呼叫端處理
  }
}

export async function POST(request: Request) {
  try {
    // 從請求 body 中解析出 prompt
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    console.log('API Route received prompt:', prompt); // 在伺服器端記錄收到的 prompt

    // 直接呼叫本地定義的函數
    const result = await generateFailureDescription(prompt);
    
    console.log('API Route received result from Ollama:', result); // 在伺服器端記錄服務的回應

    if (result && result.response) {
      // 處理回應：去除頭尾空白，並移除頭尾的雙引號
      let suggestionText = result.response.trim();
      if (suggestionText.startsWith('"') && suggestionText.endsWith('"')) {
        suggestionText = suggestionText.substring(1, suggestionText.length - 1);
      }
      
      // 將處理過的建議傳回前端
      return NextResponse.json({ suggestion: suggestionText });
    } else {
      // 如果 API 呼叫成功但回應結構不符合預期
      console.error('Ollama API call succeeded but returned unexpected structure:', result);
      return NextResponse.json({ error: 'Failed to get a valid suggestion from the service' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in generate-suggestion API route:', error);
    // 返回錯誤訊息給前端
    const errorMessage = error instanceof Error ? error.message : 'Internal server error generating suggestion';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 