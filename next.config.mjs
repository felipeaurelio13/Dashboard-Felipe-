import { getGitHubPagesBasePath } from './lib/github-pages.mjs';

const basePath = getGitHubPagesBasePath({
  isGithubPagesBuild: process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production',
  repository: process.env.GITHUB_REPOSITORY,
  fallbackRepositoryName: process.env.GITHUB_REPOSITORY_NAME
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined
};

export default nextConfig;
