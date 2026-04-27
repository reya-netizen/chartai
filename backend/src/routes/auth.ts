import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

// Simple in-memory user store — replace with PostgreSQL in production
const users: Record<string, { id: string; email: string; passwordHash: string }> = {};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'chartai-salt').digest('hex');
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  if (users[email]) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const user = { id: Date.now().toString(), email, passwordHash: hashPassword(password) };
  users[email] = user;

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, userId: user.id, email: user.email });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  res.json({ token, userId: user.id, email: user.email });
});

// POST /api/auth/guest - create a temporary guest session (no signup needed)
router.post('/guest', (_req, res) => {
  const guestId = 'guest_' + Date.now();
  const token = jwt.sign(
    { userId: guestId, email: `${guestId}@guest` },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '24h' }
  );
  res.json({ token, userId: guestId, email: null, isGuest: true });
});

export default router;
