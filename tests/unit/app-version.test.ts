import { describe, expect, it } from 'vitest';

import { toVersionLabel } from '../../lib/app-version';

describe('toVersionLabel', () => {
  it('adds v prefix to package version string', () => {
    expect(toVersionLabel('0.1.1')).toBe('v0.1.1');
  });
});
