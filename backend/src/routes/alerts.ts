import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory store for demo — replace with PostgreSQL in production
const alertsStore: Record<string, Alert[]> = {};

interface Alert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'rsi_above' | 'rsi_below';
  price: number;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: string;
  triggeredAt?: string;
}

// GET /api/alerts
router.get('/', (req: AuthRequest, res) => {
  const userId = req.userId || 'anonymous';
  res.json(alertsStore[userId] || []);
});

// POST /api/alerts
router.post('/', (req: AuthRequest, res) => {
  const userId = req.userId || 'anonymous';
  const { symbol, condition, price } = req.body;

  if (!symbol || !condition || price === undefined) {
    res.status(400).json({ error: 'symbol, condition, and price are required' });
    return;
  }

  const alert: Alert = {
    id: Date.now().toString(),
    userId,
    symbol: symbol.toUpperCase(),
    condition,
    price: Number(price),
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  if (!alertsStore[userId]) alertsStore[userId] = [];
  alertsStore[userId].push(alert);

  res.status(201).json(alert);
});

// DELETE /api/alerts/:id
router.delete('/:id', (req: AuthRequest, res) => {
  const userId = req.userId || 'anonymous';
  if (alertsStore[userId]) {
    alertsStore[userId] = alertsStore[userId].filter(a => a.id !== req.params.id);
  }
  res.json({ deleted: true });
});

export default router;
