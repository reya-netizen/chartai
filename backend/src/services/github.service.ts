interface IssuePayload {
  title: string;
  body: string;
  labels?: string[];
}

interface GitHubIssueResponse {
  number: number;
  html_url: string;
  title: string;
}

export async function createGithubIssue(payload: IssuePayload): Promise<GitHubIssueResponse | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  // Silently skip if not configured (dev environment)
  if (!token || token === 'ghp_YOUR_TOKEN_HERE' || !repo || repo === 'yourusername/chartai') {
    console.log(`[GitHub Issues] Skipped (not configured): ${payload.title}`);
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        labels: payload.labels || ['bug'],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`GitHub Issues API error: ${response.status} ${text}`);
      return null;
    }

    const issue = (await response.json()) as GitHubIssueResponse;
    console.log(`✅ GitHub issue created: #${issue.number} - ${issue.html_url}`);
    return issue;
  } catch (error) {
    console.error('Failed to create GitHub issue:', error);
    return null;
  }
}

export async function closeGithubIssue(issueNumber: number): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return;

  await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: 'closed' }),
  });
}
