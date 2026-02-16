import { getGitHubPagesBasePath } from './lib/github-pages.mjs';

const basePath = getGitHubPagesBasePath({
  isGithubActions: process.env.GITHUB_ACTIONS === 'true',
  repository: process.env.GITHUB_REPOSITORY
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined
};

export default nextConfig;
