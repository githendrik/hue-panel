#!/bin/sh
# build-binary.sh — build a self-contained hue-panel binary for linux-x64
# Requires: node (for nuxt build), bun (for compilation)
set -e

echo "==> Building Nuxt (SPA mode, no SSR)..."
npm run build

echo "==> Compiling binary (linux-x64)..."
cd .output/server && bun build index.mjs \
  --compile \
  --target=bun-linux-x64 \
  --outfile hue-panel

echo ""
echo "==> Done: .output/server/hue-panel ($(du -sh .output/server/hue-panel | cut -f1))"
echo "    Fully self-contained — copy anywhere and run directly."
