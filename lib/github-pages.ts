export function getGitHubPagesBasePath({ isGithubActions, repository }: { isGithubActions: boolean; repository?: string }) {
  if (!isGithubActions || !repository) {
    return '';
  }

  const [, repoName = ''] = repository.split('/');
  if (!repoName || repoName.endsWith('.github.io')) {
    return '';
  }

  return `/${repoName}`;
}
