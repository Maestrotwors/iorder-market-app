#!/usr/bin/env bash
set -euo pipefail

# Deploy to production by creating a release tag
# Usage: bun run release:prod
# This tags the current main HEAD — CI will run all tests and deploy to production

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

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"

# Check if tag already exists
if git tag -l "$TAG" | grep -q "$TAG"; then
  echo -e "${RED}Error: tag ${TAG} already exists${NC}"
  echo "Release-please should bump the version first."
  echo "Check if there's a pending release PR: gh pr list --label 'autorelease: pending'"
  exit 1
fi

echo -e "${RED}⚠️  PRODUCTION DEPLOY${NC}"
echo -e "${YELLOW}Creating tag: ${TAG}${NC}"
echo -e "Commit: $(git log --oneline -1)"
echo ""

read -p "Deploy to PRODUCTION? Type 'yes' to confirm: " -r
echo ""

if [[ "$REPLY" == "yes" ]]; then
  git tag "$TAG"
  git push origin "$TAG"
  echo ""
  echo -e "${GREEN}✓ Tag ${TAG} pushed!${NC}"
  echo -e "CI will now run all tests and build Docker images for production."
  echo -e "Watch progress: https://github.com/Maestrotwors/iorder-market-app/actions"
else
  echo "Cancelled. (You must type 'yes' exactly)"
fi
