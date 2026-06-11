import type { SystemHealth } from '@/services/api';

// 維護狀態：module 級單例。production standalone 為單一程序，
// 同程序內各 route 共用此模組 → /api/health 可直接讀，毋需 self-fetch（避免 tunnel/反代下打自己公開 URL 失敗）。
// 註：多實例 / serverless 不共享，正式跨實例維護狀態需改外部儲存（Redis/DB）。
let current: SystemHealth = { status: 'ok', message: '系統運行正常' };

export function getMaintenance(): SystemHealth {
  return current;
}

export function setMaintenance(status: SystemHealth): void {
  current = status;
}
