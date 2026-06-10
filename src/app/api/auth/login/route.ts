import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/services/api';
import {
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/session';

// Maximo 後端設定（與 src/services/api.ts 的 API_CONFIG 對齊）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://hl.webtw.xyz';
const MAX_API_PATH = process.env.NEXT_PUBLIC_MAX_API_PATH || '/maximo/oslc/script';

// MOBILEAPP_GET_CURRENT_USER 回傳的權限項目（WOTRACK 應用選項）
interface RawPermission {
  app: string;
  optionname: string;
}

// MOBILEAPP_GET_CURRENT_USER 回傳的原始使用者結構
interface RawUser {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  groups: string[];
  department: string;
  permissions: RawPermission[];
}

// 將 Maximo 的 WOTRACK 應用選項對應到 app 內使用的 access 權限字串。
// READ → 可進入 PM / CM；SAVE/INSERT/ROUTEWF → 具備設定 / 管理權限。
function mapPermissions(raw: RawPermission[] | undefined): string[] {
  const options = new Set((raw || []).map((p) => p.optionname));
  const permissions: string[] = [];
  if (options.has('READ')) {
    permissions.push('pm.access', 'cm.access');
  }
  if (options.has('SAVE') || options.has('INSERT') || options.has('ROUTEWF')) {
    permissions.push('settings.access', 'admin.access');
  }
  return permissions;
}

export async function POST(request: NextRequest) {
  let username: string;
  let password: string;
  try {
    const body = await request.json();
    username = body.username;
    password = body.password;
  } catch {
    return NextResponse.json({ error: '請提供帳號與密碼' }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: '請提供帳號與密碼' }, { status: 400 });
  }

  // 以該使用者本身的帳密向 Maximo 驗證（maxauth = base64(username:password)）。
  // 驗證成功代表帳密正確，並可取回該使用者的真實資料與權限。
  const maxauth = Buffer.from(`${username}:${password}`).toString('base64');
  const targetUrl =
    `${API_BASE_URL}${MAX_API_PATH}/MOBILEAPP_GET_CURRENT_USER` +
    `?lean=1&USERNAME=${encodeURIComponent(username)}&PERSONID=${encodeURIComponent(username)}`;

  let rawUser: RawUser;
  try {
    const maximoRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        maxauth,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // 帳密錯誤時 Maximo 回 401；其他非 2xx 一律視為驗證失敗。
    if (!maximoRes.ok) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    const data = await maximoRes.json();

    // Maximo OSLC 即使 HTTP 200 也可能在 body 帶 Error（例如登入失敗）。
    if (data?.Error) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    rawUser = data as RawUser;
  } catch (error) {
    console.error('Maximo 認證請求失敗:', error);
    return NextResponse.json({ error: '無法連線至認證伺服器' }, { status: 502 });
  }

  if (!rawUser?.id) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  }

  // 由 server 依驗證結果決定使用者與權限，client 無法干預。
  const user: User = {
    id: rawUser.id,
    username: rawUser.username,
    name: rawUser.name,
    email: rawUser.email,
    avatar: rawUser.avatar,
    role: rawUser.role,
    groups: rawUser.groups || [],
    department: rawUser.department,
    permissions: mapPermissions(rawUser.permissions),
  };

  const token = createSession(user);

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // 本機 http 開發不加 Secure，否則瀏覽器不會回送 cookie；正式環境（https）才強制 Secure
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
