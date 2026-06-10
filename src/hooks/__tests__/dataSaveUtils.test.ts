import { describe, it, expect } from 'vitest';
import { isDataDirty, getChangedFields } from '../dataSaveUtils';

describe('isDataDirty (dirty 判斷)', () => {
  it('資料相同時回傳 false', () => {
    expect(isDataDirty({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(false);
  });

  it('資料不同時回傳 true', () => {
    expect(isDataDirty({ a: 1 }, { a: 2 })).toBe(true);
  });

  it('巢狀資料深度比較', () => {
    expect(isDataDirty({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
    expect(isDataDirty({ a: { b: 1 } }, { a: { b: 2 } })).toBe(true);
  });

  it('任一方為 null 時回傳 false', () => {
    expect(isDataDirty(null, { a: 1 })).toBe(false);
    expect(isDataDirty({ a: 1 }, null)).toBe(false);
    expect(isDataDirty(null, null)).toBe(false);
  });
});

describe('getChangedFields (變更欄位擷取)', () => {
  it('只回傳有變更的欄位', () => {
    const result = getChangedFields(
      { id: '1', status: 'WAPPR', desc: 'new' },
      { id: '1', status: 'INPRG', desc: 'new' }
    );
    expect(result).toEqual({ status: 'WAPPR' });
  });

  it('沒有變更時回傳空物件', () => {
    expect(getChangedFields({ a: 1 }, { a: 1 })).toEqual({});
  });

  it('巢狀值變更會被偵測', () => {
    const result = getChangedFields(
      { meta: { x: 1 } },
      { meta: { x: 2 } }
    );
    expect(result).toEqual({ meta: { x: 1 } });
  });
});
