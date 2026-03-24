#!/usr/bin/env bash
set -euo pipefail

# Deploy to test server by creating an RC tag
# Usage: bun run release:test
# This tags the current main HEAD and pushes — CI will run all tests and deploy

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ensure we're on main and up to date
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" ]]; then
  echo -e "${RED}Error: must be on 'main' branch (currently on '$BRANCH')${NC}"
  echo "Run: git checkout main && git pull"
  exit 1
fi

git fetch origin main --tags
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [[ "$LOCAL" != "$REMOTE" ]]; then
  echo -e "${RED}Error: local main is not up to date with origin${NC}"
  echo "Run: git pull"
  exit 1
fi

# Get latest version from package.json
VERSION=$(node -p "require('./package.json').version")

# Find the next RC number for this version
LATEST_RC=$(git tag -l "v${VERSION}-rc.*" | sort -V | tail -1)
if [[ -z "$LATEST_RC" ]]; then
  NEXT_RC=1
else
  CURRENT_RC=$(echo "$LATEST_RC" | grep -oP 'rc\.\K[0-9]+')
  NEXT_RC=$((CURRENT_RC + 1))
fi

TAG="v${VERSION}-rc.${NEXT_RC}"

echo -e "${YELLOW}Creating tag: ${TAG}${NC}"
echo -e "Commit: $(git log --oneline -1)"
echo ""

read -p "Deploy to test server? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  git tag "$TAG"
  git push origin "$TAG"
  echo ""
  echo -e "${GREEN}✓ Tag ${TAG} pushed!${NC}"
  echo -e "CI will now run all tests and build Docker images."
  echo -e "Watch progress: https://github.com/Maestrotwors/iorder-market-app/actions"
else
  echo "Cancelled."
fi
