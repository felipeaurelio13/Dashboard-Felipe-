import { describe, expect, it } from 'vitest';
import { dailySchema, dealSchema } from '../../lib/schemas';

describe('schemas', () => {
  it('validates daily input', () => {
    const parsed = dailySchema.safeParse({ date: '2026-01-01', cash_today: 10, cash_30d: 20, blockers: [], risks: [], decisions: [] });
    expect(parsed.success).toBe(true);
  });

  it('requires next step in qualified+', () => {
    const parsed = dealSchema.safeParse({ customer: 'A', amount: 100, probability: 50, stage: 'Qualified' });
    expect(parsed.success).toBe(false);
  });
});
