export function getGitHubPagesBasePath({
  isGithubPagesBuild,
  repository,
  fallbackRepositoryName
}: {
  isGithubPagesBuild: boolean;
  repository?: string;
  fallbackRepositoryName?: string;
}) {
  if (!isGithubPagesBuild) {
    return '';
  }

  const [, repositoryName = ''] = repository?.split('/') ?? [];
  const repoName = repositoryName || fallbackRepositoryName || '';

  if (!repoName || repoName.endsWith('.github.io')) {
    return '';
  }

  return `/${repoName}`;
}
