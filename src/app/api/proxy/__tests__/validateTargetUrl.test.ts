import { describe, it, expect } from 'vitest';
import { validateTargetUrl, ALLOWED_ORIGIN, ALLOWED_PATH_PREFIX } from '../validateTargetUrl';

describe('validateTargetUrl (SSRF origin allowlist)', () => {
  it('允許白名單 origin + 合法路徑前綴', () => {
    expect(validateTargetUrl(`${ALLOWED_ORIGIN}${ALLOWED_PATH_PREFIX}/MOBILEWO`)).toBe(true);
  });

  it('允許白名單 origin 帶查詢字串', () => {
    expect(validateTargetUrl(`${ALLOWED_ORIGIN}${ALLOWED_PATH_PREFIX}/MOBILEWO?wonum=123`)).toBe(true);
  });

  it('拒絕外部 host', () => {
    expect(validateTargetUrl(`http://evil.example.com${ALLOWED_PATH_PREFIX}`)).toBe(false);
  });

  it('拒絕合法 host 但路徑前綴不符', () => {
    expect(validateTargetUrl(`${ALLOWED_ORIGIN}/maximo/oslc/os/MXWODETAIL`)).toBe(false);
  });

  it('拒絕子網域偽裝（host 包含允許字串但 origin 不同）', () => {
    expect(validateTargetUrl(`http://hl.webtw.xyz.evil.com${ALLOWED_PATH_PREFIX}`)).toBe(false);
  });

  it('拒絕非 URL 字串', () => {
    expect(validateTargetUrl('not-a-url')).toBe(false);
  });
});
