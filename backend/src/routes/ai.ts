import { Router } from 'express';
import { callOpenRouter, buildChartAnalysisPrompt, AVAILABLE_MODELS } from '../services/openrouter.service';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/ai/models - list available models
router.get('/models', (_req, res) => {
  res.json(AVAILABLE_MODELS);
});

// POST /api/ai/analyze - AI chart analysis
router.post('/analyze', async (req: AuthRequest, res, next) => {
  try {
    const { ticker, price, change, ohlcv, rsi, question, model, conversationHistory = [] } = req.body;

    if (!ticker || !question) {
      res.status(400).json({ error: 'ticker and question are required' });
      return;
    }

    const systemPrompt = buildChartAnalysisPrompt(ticker, price, change, ohlcv || [], rsi || 50);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: question },
    ];

    const reply = await callOpenRouter(messages, model || 'anthropic/claude-sonnet-4-5', 600);

    res.json({
      reply,
      model: model || 'anthropic/claude-sonnet-4-5',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
