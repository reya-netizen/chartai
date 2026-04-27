import request from 'supertest';
import app from '../src/index';

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth routes', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';
  let token = '';

  it('POST /api/auth/guest returns a token', async () => {
    const res = await request(app).post('/api/auth/guest');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('POST /api/auth/login returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /api/charts/AAPL requires auth', async () => {
    const res = await request(app).get('/api/charts/AAPL');
    expect(res.status).toBe(401);
  });

  it('GET /api/charts/AAPL works with token', async () => {
    const res = await request(app)
      .get('/api/charts/AAPL')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ohlcv).toBeDefined();
    expect(Array.isArray(res.body.ohlcv)).toBe(true);
  });

  it('GET /api/ai/models returns model list', async () => {
    const res = await request(app)
      .get('/api/ai/models')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/alerts creates an alert', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbol: 'AAPL', condition: 'above', price: 200 });
    expect(res.status).toBe(201);
    expect(res.body.symbol).toBe('AAPL');
  });
});
