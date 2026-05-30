#!/usr/bin/env bash
# Start CVAlign backend + frontend for local development on localhost
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/cvalign-ai-backend"
FRONTEND="$ROOT/FRONTEND"

echo "Starting CVAlign local stack..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API proxy: http://localhost:3000/api -> backend"
echo

# Kill stale backends on 8000
if lsof -ti :8000 >/dev/null 2>&1; then
  echo "Stopping existing process on port 8000..."
  lsof -ti :8000 | xargs kill 2>/dev/null || true
  sleep 1
fi

cd "$BACKEND"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  . .venv/bin/activate
  pip install -q -r requirements.txt
else
  . .venv/bin/activate
fi

python3 run.py &
BACKEND_PID=$!

cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT

echo
echo "Press Ctrl+C to stop both servers."
echo "Run integration tests: bash $ROOT/scripts/test-integration.sh"
wait
