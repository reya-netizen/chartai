#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ChartAI — Railway Setup Script
# Run this AFTER: railway login && railway link (select your project)
# ─────────────────────────────────────────────────────────────────────────────

echo "🚂 Setting up Railway environment variables..."

# ── BACKEND SERVICE ───────────────────────────────────────────────────────────
echo "Setting backend variables..."

railway variables set \
  --service backend \
  OPENROUTER_API_KEY="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" \
  GITHUB_TOKEN="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" \
  GITHUB_REPO="REPLACE_WITH_YOUR_GITHUB_USERNAME/chartai" \
  POLYGON_API_KEY="kCpziRBQQCZGc0d35qUa3SqlVHW_Hw7j" \
  JWT_SECRET="chartai-jwt-9912a712-2c06-413e-9ef0-b7ebf5677324-secure" \
  NODE_ENV="production"

echo "✅ Backend variables set"

# ── FRONTEND SERVICE ──────────────────────────────────────────────────────────
# NOTE: Run this AFTER the backend is deployed and you have its URL
# Replace YOUR_BACKEND_URL with the actual Railway backend URL

echo ""
echo "⚠️  For frontend, run these manually after backend deploys:"
echo ""
echo "railway variables set --service frontend \\"
echo "  VITE_API_URL=\"https://YOUR_BACKEND_URL.railway.app\" \\"
echo "  VITE_WS_URL=\"wss://YOUR_BACKEND_URL.railway.app\""
echo ""
echo "Also update FRONTEND_URL on the backend service:"
echo "railway variables set --service backend FRONTEND_URL=\"https://YOUR_FRONTEND_URL.railway.app\""
echo ""
echo "🎉 Done! Your app should be live in 2-3 minutes."
