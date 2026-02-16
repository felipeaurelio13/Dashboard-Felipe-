export function getGitHubPagesBasePath({ isGithubPagesBuild, repository, fallbackRepositoryName }) {
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
