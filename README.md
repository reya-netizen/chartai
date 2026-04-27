# ChartAI — AI-Powered Trading Charts

A professional charting application with AI analysis, built with React + TypeScript, Node.js, OpenRouter AI, deployed on Railway.

---

## 🚀 DEPLOYMENT GUIDE (Step by Step — No Tech Experience Needed)

### Step 1 — Get your accounts ready (all free)

You need accounts on these 4 sites:

| Site | Purpose | URL |
|------|---------|-----|
| GitHub | Store your code | https://github.com |
| Railway | Host the app | https://railway.app |
| OpenRouter | AI analysis | https://openrouter.ai |
| Polygon.io | Market data (optional) | https://polygon.io |

---

### Step 2 — Get your API Keys

**OpenRouter API Key:**
1. Go to https://openrouter.ai/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-or-v1-...`)

**GitHub Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "chartai"
4. Check the "repo" box
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)

**Polygon.io API Key (for real market data):**
1. Go to https://polygon.io and sign up free
2. Go to Dashboard → API Keys
3. Copy your key

---

### Step 3 — Push code to GitHub

1. Create a new repository on GitHub called `chartai`
2. Open your terminal (or GitHub Desktop) and run:

```bash
cd chartai
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chartai.git
git push -u origin main
```

---

### Step 4 — Deploy to Railway

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your `chartai` repository

**Deploy the Backend:**
1. Click **"Add Service"** → **"GitHub Repo"**
2. Set Root Directory to: `backend`
3. Set Start Command to: `node dist/index.js`
4. Click the service → **"Variables"** tab → Add these:

```
OPENROUTER_API_KEY    = sk-or-v1-YOUR_KEY_HERE
GITHUB_TOKEN          = ghp_YOUR_TOKEN_HERE
GITHUB_REPO           = yourusername/chartai
POLYGON_API_KEY       = YOUR_POLYGON_KEY_HERE
JWT_SECRET            = make_up_any_long_random_string_here_12345
NODE_ENV              = production
```

5. Click **"Add Plugin"** → **PostgreSQL** (auto-adds DATABASE_URL)
6. Click **"Add Plugin"** → **Redis** (auto-adds REDIS_URL)

**Deploy the Frontend:**
1. Click **"Add Service"** → **"GitHub Repo"** again
2. Set Root Directory to: `frontend`
3. Set Start Command to: `npm run preview`
4. Click the service → **"Variables"** → Add:

```
VITE_API_URL = https://your-backend-url.railway.app
VITE_WS_URL  = wss://your-backend-url.railway.app
```

(Get the backend URL from the backend service's "Settings" tab → "Public URL")

5. Click **"Variables"** → **"FRONTEND_URL"** on the BACKEND service and set it to your frontend Railway URL.

---

### Step 5 — Add GitHub Secrets for CI/CD

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `OPENROUTER_API_KEY` | Your OpenRouter key |
| `POLYGON_API_KEY` | Your Polygon key |
| `RAILWAY_TOKEN` | Get from Railway → Account → Tokens |

---

### Step 6 — Verify everything works

1. Open your frontend Railway URL
2. Click **"Continue as Guest"** to try it without registering
3. You should see the chart dashboard
4. Try asking the AI: *"Analyze AAPL trend"*

---

## 🛠 Local Development

```bash
# Install everything
npm install
cd backend && npm install
cd ../frontend && npm install

# Copy env files
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Start both frontend and backend
npm run dev
```

Open: http://localhost:5173

---

## 🧪 Running Tests

```bash
# Unit tests (indicator math)
cd frontend && npm test

# Integration tests (API routes)
cd backend && npm test

# E2E tests (full browser flow)
npx playwright test

# E2E with UI
npx playwright test --ui
```

---

## 📁 Project Structure

```
chartai/
├── frontend/          React + TypeScript app
│   └── src/
│       ├── components/   UI components
│       ├── hooks/        useChartData, useAuth
│       └── services/     API calls
├── backend/           Node.js + Express API
│   └── src/
│       ├── routes/       charts, ai, alerts, auth, issues
│       └── services/     openrouter, github, market, websocket
├── tests/
│   ├── unit/          Vitest (indicator math)
│   ├── integration/   Jest + Supertest (API)
│   └── e2e/           Playwright (browser)
└── .github/workflows/ CI + Deploy automation
```

---

## 🤖 AI Features

- Powered by **OpenRouter** — switch between Claude, GPT-4o, Mistral, Llama
- Analyzes chart data + RSI automatically
- Maintains conversation history per session
- Quick action buttons: Analyze trend, Key levels, RSI signal, Bull/Bear case
- **Auto-creates GitHub issues** when the AI API errors

## 🚨 Auto-Ticket System

GitHub issues are automatically created when:
- Any CI test fails
- Deployment fails
- The backend throws a 500 error
- An uncaught exception crashes the server

Issues are labeled `bug`, `auto-generated`, and include full stack traces.

---

## 🔑 Environment Variables Reference

### Backend
| Variable | Required | Description |
|---------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | From openrouter.ai/keys |
| `GITHUB_TOKEN` | ✅ Yes | GitHub PAT with repo scope |
| `GITHUB_REPO` | ✅ Yes | `username/reponame` |
| `JWT_SECRET` | ✅ Yes | Any long random string |
| `POLYGON_API_KEY` | Optional | Real market data |
| `DATABASE_URL` | Auto (Railway) | PostgreSQL connection |
| `REDIS_URL` | Auto (Railway) | Redis connection |
| `PORT` | Auto (Railway) | Server port |

### Frontend
| Variable | Required | Description |
|---------|----------|-------------|
| `VITE_API_URL` | ✅ Yes | Backend Railway URL |
| `VITE_WS_URL` | ✅ Yes | Backend WSS URL |
