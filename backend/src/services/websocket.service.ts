import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getTickerInfo } from './market.service';

const clients = new Map<WebSocket, Set<string>>(); // client -> subscribed tickers

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    clients.set(ws, new Set());

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; ticker?: string };
        const subs = clients.get(ws)!;

        if (msg.type === 'subscribe' && msg.ticker) {
          subs.add(msg.ticker.toUpperCase());
          ws.send(JSON.stringify({ type: 'subscribed', ticker: msg.ticker.toUpperCase() }));
        }
        if (msg.type === 'unsubscribe' && msg.ticker) {
          subs.delete(msg.ticker.toUpperCase());
        }
      } catch {
        // ignore bad messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });

    // Send welcome
    ws.send(JSON.stringify({ type: 'connected', message: 'ChartAI WebSocket ready' }));
  });

  // Broadcast price updates every 3 seconds
  setInterval(async () => {
    if (clients.size === 0) return;

    // Collect all subscribed tickers across all clients
    const allTickers = new Set<string>();
    clients.forEach((subs) => subs.forEach((t) => allTickers.add(t)));
    if (allTickers.size === 0) return;

    // Fetch and broadcast
    for (const ticker of allTickers) {
      try {
        const info = await getTickerInfo(ticker);
        const message = JSON.stringify({ type: 'price', ...info });

        clients.forEach((subs, ws) => {
          if (subs.has(ticker) && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      } catch {
        // skip failed tickers
      }
    }
  }, 3000);
}
