#!/bin/bash
# scripts/release.sh — bump version, commit, tag, and push
# Usage: ./scripts/release.sh 0.1.5

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.1.5"
  exit 1
fi

VERSION="$1"

# Update package.json
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
rm package.json.bak

# Commit and tag
git add package.json
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin "v$VERSION"
git push origin main

echo "==> Released v$VERSION"
echo "==> https://github.com/githendrik/hue-panel/releases/tag/v$VERSION"
