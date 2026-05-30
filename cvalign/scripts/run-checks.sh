#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/FRONTEND" && npm run lint
cd "$ROOT/cvalign-ai-backend"
. .venv/bin/activate
python3 -m pytest --tb=short -q
