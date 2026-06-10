// 允許代理的目標來源（Maximo 後端）
export const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://hl.webtw.xyz';
// 僅允許 Maximo OSLC script 路徑前綴
export const ALLOWED_PATH_PREFIX = '/maximo/oslc/script';

// 驗證目標 URL 是否允許被代理（SSRF 防護）
export function validateTargetUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    return parsed.origin === ALLOWED_ORIGIN && parsed.pathname.startsWith(ALLOWED_PATH_PREFIX);
  } catch {
    return false;
  }
}
