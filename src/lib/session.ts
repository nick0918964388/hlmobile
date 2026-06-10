import { createHmac, timingSafeEqual } from 'crypto';
import { User } from '@/services/api';

// Session cookie 名稱（httpOnly，由 server 簽發 / 清除）
export const SESSION_COOKIE = 'hlmobile_session';

// Session 有效期（秒）— 8 小時
export const SESSION_MAX_AGE = 8 * 60 * 60;

// 簽章金鑰。正式環境務必設定 SESSION_SECRET 環境變數；未設時 fallback 僅供本機開發。
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'hlmobile-dev-insecure-secret-change-me';

// 無狀態 session：token = base64url(payload) + '.' + base64url(hmac)
// payload 內含 user 與過期時間，以 HMAC-SHA256 簽章防竄改。
// 不使用 server 端儲存，因此可橫跨多實例 / serverless / 重啟，亦免去 dev 模式模組重編譯導致 session 遺失。
interface SessionPayload {
  user: User;
  exp: number; // epoch 秒
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

// 建立 session，回傳簽章 token
export function createSession(user: User): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

// 驗證 token 並取得使用者；簽章不符或已過期回 null
export function getSession(token: string | undefined): User | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload.user;
  } catch {
    return null;
  }
}

// 無狀態 token 無法在 server 端撤銷，登出由清除 cookie 完成（見 /api/auth/logout）。
// 此函式保留以維持介面相容；如需真正撤銷需改用 jti 黑名單或外部 session 儲存。
export function deleteSession(_token: string | undefined): void {
  // no-op（無狀態 token）
}
