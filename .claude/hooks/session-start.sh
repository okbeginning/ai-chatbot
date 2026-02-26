#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install Node.js dependencies
pnpm install

# Install Playwright browsers for testing (best-effort, may be unavailable in restricted networks)
pnpm exec playwright install --with-deps chromium || echo "Warning: Playwright browser install failed (network restriction). Tests requiring a browser may not run."
