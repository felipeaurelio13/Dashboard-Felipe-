import { describe, expect, it } from 'vitest';
import { formatCurrency, parseAmountInput, parseListInput } from '../../lib/input-utils';

describe('input utils', () => {
  it('parses list values from commas, semicolons and new lines', () => {
    expect(parseListInput('A, B\nC; D')).toEqual(['A', 'B', 'C', 'D']);
  });

  it('parses currency-like amount with CL format separators', () => {
    expect(parseAmountInput('1.500.000')).toBe(1500000);
    expect(parseAmountInput('1200,5')).toBe(1200.5);
  });

  it('formats as CLP currency for quick validation hints', () => {
    expect(formatCurrency(1500000)).toBe('$1.500.000');
  });
});
