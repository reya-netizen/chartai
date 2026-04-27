import { Router } from 'express';
import { createGithubIssue } from '../services/github.service';

const router = Router();

// POST /api/issues - manually create a GitHub issue (used by frontend for user-reported bugs)
router.post('/', async (req, res, next) => {
  try {
    const { title, body, labels } = req.body;
    if (!title) {
      res.status(400).json({ error: 'title is required' });
      return;
    }

    const issue = await createGithubIssue({
      title: `[User Report] ${title}`,
      body: body || 'No details provided.',
      labels: labels || ['bug', 'user-report'],
    });

    res.json({ created: true, issue });
  } catch (err) {
    next(err);
  }
});

export default router;
