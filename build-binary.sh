#!/bin/sh
# build-binary.sh — build a self-contained hue-panel binary for linux-x64
# Requires: node (for nuxt build), bun (for compilation)
set -e

echo "==> Building Nuxt..."
npm run build

echo "==> Symlinking node_modules into chunk subdirectories..."
for dir in .output/server/chunks/*/; do
  ln -sf "$(pwd)/.output/server/node_modules" "${dir}node_modules" 2>/dev/null || true
done

echo "==> Compiling binary (linux-x64)..."
cd .output/server && bun build index.mjs \
  --compile \
  --target=bun-linux-x64 \
  --outfile hue-panel

echo ""
echo "==> Done: .output/server/hue-panel ($(du -sh .output/server/hue-panel | cut -f1))"
echo "    Fully self-contained — copy anywhere and run directly."
