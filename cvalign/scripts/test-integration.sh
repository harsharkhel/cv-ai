#!/usr/bin/env bash
# Integration smoke test: frontend (localhost:3000) + backend (localhost:8000)
set -euo pipefail

FRONTEND="${FRONTEND_URL:-http://localhost:3000}"
BACKEND="${BACKEND_URL:-http://localhost:8000}"
EMAIL="integration-$(date +%s)@example.com"
PASSWORD="TestPass123"

echo "== CVAlign integration test =="
echo "Frontend: $FRONTEND"
echo "Backend:  $BACKEND"
echo

pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1"; exit 1; }

# 1. Backend health
HEALTH=$(curl -sf "$BACKEND/health") || fail "Backend not reachable at $BACKEND/health"
echo "$HEALTH" | grep -q '"status":"ok"' && pass "Backend /health" || fail "Backend health response"

# 2. Frontend health
CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$FRONTEND/") || fail "Frontend not reachable at $FRONTEND"
[ "$CODE" = "200" ] && pass "Frontend serves HTML ($CODE)" || fail "Frontend returned $CODE"

# 3. Vite proxy
PROXY=$(curl -sf "$FRONTEND/api/health") || fail "Proxy /api -> backend failed"
echo "$PROXY" | grep -q '"status":"ok"' && pass "Vite proxy /api/health" || fail "Proxy health response"

# 4. CORS preflight
CORS=$(curl -sf -o /dev/null -w "%{http_code}" -X OPTIONS "$BACKEND/auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization")
[ "$CORS" = "200" ] || [ "$CORS" = "204" ] && pass "CORS preflight (localhost:3000)" || fail "CORS returned $CORS"

# 5. Register
REG=$(curl -sf -X POST "$FRONTEND/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Integration Test\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}") \
  || fail "Register failed"
TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$TOKEN" ] && pass "Register + JWT" || fail "No access_token in register response"

# 6. /auth/me
ME=$(curl -sf "$FRONTEND/api/auth/me" -H "Authorization: Bearer $TOKEN") \
  || fail "/auth/me failed"
echo "$ME" | grep -q "$EMAIL" && pass "/auth/me with JWT" || fail "/auth/me email mismatch"

# 7. Login
LOGIN=$(curl -sf -X POST "$FRONTEND/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}") \
  || fail "Login failed"
echo "$LOGIN" | grep -q "access_token" && pass "Login with email/password" || fail "Login response"

echo
echo "All integration checks passed."
