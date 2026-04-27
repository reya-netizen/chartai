interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  usage?: { total_tokens: number };
  error?: { message: string };
}

export const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
];

export async function callOpenRouter(
  messages: ChatMessage[],
  model: string = 'anthropic/claude-sonnet-4-5',
  maxTokens: number = 600
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'sk-or-v1-YOUR_KEY_HERE') {
    throw new Error('OPENROUTER_API_KEY not configured. Please add it to your Railway environment variables.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'https://chartai.app',
      'X-Title': 'ChartAI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message}`);
  }

  return data.choices[0]?.message?.content || 'No response from AI model.';
}

export function buildChartAnalysisPrompt(
  ticker: string,
  price: number,
  change: number,
  ohlcv: Array<{ o: number; h: number; l: number; c: number; v: number }>,
  rsi: number
): string {
  const recent = ohlcv.slice(-5).map(c =>
    `O:${c.o.toFixed(2)} H:${c.h.toFixed(2)} L:${c.l.toFixed(2)} C:${c.c.toFixed(2)} V:${c.v.toLocaleString()}`
  ).join('\n');

  return [
    `You are a professional technical analyst. Be concise and specific.`,
    ``,
    `Ticker: ${ticker}`,
    `Current Price: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
    `RSI(14): ${rsi.toFixed(1)}`,
    ``,
    `Recent OHLCV (last 5 bars):`,
    recent,
    ``,
    `Provide: 1) Trend assessment 2) Key support/resistance levels 3) RSI signal 4) Short-term outlook.`,
    `Keep response under 200 words. Use specific price levels.`,
  ].join('\n');
}
