#!/usr/bin/env bash
set -euo pipefail

echo "=== CVALIGN ==="
cd /Users/harsharkhel/Documents/GitHub/cvalign
git add INTEGRATION.md scripts/ cvalign-ai-backend/
git status -sb
git commit -m "$(cat <<'EOF'
Add CVAlign AI backend, local integration docs, and dev scripts.

Wire FastAPI backend with Firebase Google auth, resume analysis, and localhost CORS for frontend testing.
EOF
)" || echo "Commit skipped or failed"
git push -u origin main

echo ""
echo "=== FRONTEND ==="
cd /Users/harsharkhel/Documents/GitHub/FRONTEND
git add .env.example README.md frontend/ index.html package.json vite.config.ts
git status -sb
git commit -m "$(cat <<'EOF'
Integrate frontend with FastAPI backend for local development.

Add API client, Firebase Google sign-in via popup, Vite localhost proxy, and auth session handling.
EOF
)" || echo "Commit skipped or failed"
git push -u origin main

echo ""
echo "Done."
