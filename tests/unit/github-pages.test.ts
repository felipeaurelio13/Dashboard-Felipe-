import { describe, expect, it } from 'vitest';

import { getGitHubPagesBasePath } from '../../lib/github-pages';

describe('getGitHubPagesBasePath', () => {
  it('returns an empty base path outside of GitHub Actions', () => {
    expect(getGitHubPagesBasePath({ isGithubActions: false, repository: 'acme/demo' })).toBe('');
  });

  it('returns repo name as base path in GitHub Actions project pages', () => {
    expect(getGitHubPagesBasePath({ isGithubActions: true, repository: 'acme/demo' })).toBe('/demo');
  });

  it('returns empty base path for user or org pages repositories', () => {
    expect(getGitHubPagesBasePath({ isGithubActions: true, repository: 'acme/acme.github.io' })).toBe('');
  });
});
