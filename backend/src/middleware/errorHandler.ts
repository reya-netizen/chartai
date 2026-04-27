import { Request, Response, NextFunction } from 'express';
import { createGithubIssue } from '../services/github.service';

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Auto-create a GitHub issue for every server error
  try {
    await createGithubIssue({
      title: `[API Error] ${err.message.substring(0, 80)}`,
      body: [
        `**Route:** \`${req.method} ${req.path}\``,
        `**Time:** ${new Date().toISOString()}`,
        `**Body:** \`${JSON.stringify(req.body).substring(0, 200)}\``,
        '',
        '**Stack Trace:**',
        '```',
        err.stack || err.message,
        '```',
      ].join('\n'),
      labels: ['bug', 'production', 'auto-generated'],
    });
  } catch (issueError) {
    console.error('Failed to create GitHub issue:', issueError);
  }

  res.status(500).json({
    error: 'Something went wrong. A ticket has been automatically created.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
