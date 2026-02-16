import { describe, expect, it } from 'vitest';

import { getExecutiveSummary } from '../../lib/executive-summary';

describe('getExecutiveSummary', () => {
  it('returns estable when execution is healthy', () => {
    const summary = getExecutiveSummary({
      cashToday: 100,
      cash30d: 300,
      blockersCount: 0,
      risksCount: 0,
      decisionsCount: 2
    });

    expect(summary.health).toBe('estable');
    expect(summary.headline).toContain('estable');
    expect(summary.liquidityGap).toBe(200);
  });

  it('returns critico when there is no liquidity', () => {
    const summary = getExecutiveSummary({
      cashToday: 0,
      cash30d: 10,
      blockersCount: 0,
      risksCount: 0,
      decisionsCount: 3
    });

    expect(summary.health).toBe('critico');
  });
});
