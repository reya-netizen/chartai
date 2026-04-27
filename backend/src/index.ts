import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import chartsRouter from './routes/charts';
import aiRouter from './routes/ai';
import alertsRouter from './routes/alerts';
import issuesRouter from './routes/issues';
import authRouter from './routes/auth';
import { setupWebSocket } from './services/websocket.service';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ─── PUBLIC ROUTES ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

// ─── PROTECTED ROUTES (need login) ────────────────────────────────────────────
app.use('/api/charts', authMiddleware, chartsRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/alerts', authMiddleware, alertsRouter);
app.use('/api/issues', issuesRouter); // internal use

// ─── WEBSOCKET FOR LIVE PRICES ─────────────────────────────────────────────────
setupWebSocket(server);

// ─── ERROR HANDLER (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── CATCH UNHANDLED ERRORS AND AUTO-CREATE GITHUB ISSUES ─────────────────────
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  try {
    const { createGithubIssue } = await import('./services/github.service');
    await createGithubIssue({
      title: `[CRASH] Uncaught Exception: ${error.message}`,
      body: `**Time:** ${new Date().toISOString()}\n\n**Stack:**\n\`\`\`\n${error.stack}\n\`\`\``,
      labels: ['bug', 'production', 'crash'],
    });
  } catch (e) {
    console.error('Failed to create GitHub issue:', e);
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Rejection:', reason);
  try {
    const { createGithubIssue } = await import('./services/github.service');
    await createGithubIssue({
      title: `[ERROR] Unhandled Promise Rejection`,
      body: `**Time:** ${new Date().toISOString()}\n\n**Reason:**\n\`\`\`\n${String(reason)}\n\`\`\``,
      labels: ['bug', 'production'],
    });
  } catch (e) {
    console.error('Failed to create GitHub issue:', e);
  }
});

server.listen(PORT, () => {
  console.log(`✅ ChartAI backend running on port ${PORT}`);
});

export default app;
