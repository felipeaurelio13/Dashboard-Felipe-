import { describe, expect, it } from 'vitest';

import { getGitHubPagesBasePath } from '../../lib/github-pages';

describe('getGitHubPagesBasePath', () => {
  it('returns an empty base path when pages build mode is disabled', () => {
    expect(getGitHubPagesBasePath({ isGithubPagesBuild: false, repository: 'acme/demo' })).toBe('');
  });

  it('returns repo name as base path in GitHub Pages project sites', () => {
    expect(getGitHubPagesBasePath({ isGithubPagesBuild: true, repository: 'acme/demo' })).toBe('/demo');
  });

  it('supports fallback repository name when GITHUB_REPOSITORY is not available', () => {
    expect(getGitHubPagesBasePath({ isGithubPagesBuild: true, fallbackRepositoryName: 'demo' })).toBe('/demo');
  });

  it('returns empty base path for user or org pages repositories', () => {
    expect(getGitHubPagesBasePath({ isGithubPagesBuild: true, repository: 'acme/acme.github.io' })).toBe('');
  });
});
