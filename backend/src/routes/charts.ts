import { Router } from 'express';
import { getOHLCV, getTickerInfo } from '../services/market.service';

const router = Router();

// GET /api/charts/:symbol?timeframe=1h&limit=120
router.get('/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1h', limit = '120' } = req.query;

    const [ohlcv, info] = await Promise.all([
      getOHLCV(symbol, String(timeframe), Number(limit)),
      getTickerInfo(symbol),
    ]);

    res.json({ symbol: symbol.toUpperCase(), timeframe, info, ohlcv });
  } catch (err) {
    next(err);
  }
});

// GET /api/charts/quote/:symbol - just current price
router.get('/quote/:symbol', async (req, res, next) => {
  try {
    const info = await getTickerInfo(req.params.symbol);
    res.json(info);
  } catch (err) {
    next(err);
  }
});

export default router;
