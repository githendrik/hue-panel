#!/bin/sh
# build-binary.sh — build a self-contained hue-panel binary for linux-x64
# Requires: node (for nuxt build), bun (for compilation)
set -e

echo "==> Building Nuxt..."
npm run build

echo "==> Compiling binary (linux-x64)..."
cd .output/server && bun build index.mjs \
  --compile \
  --target=bun-linux-x64 \
  --external "@vue/shared" \
  --external "@vue/server-renderer" \
  --external "@vue/compiler-dom" \
  --external "@vue/runtime-dom" \
  --external "@vue/compiler-core" \
  --external "@vue/runtime-core" \
  --external "@vue/reactivity" \
  --external "vue" \
  --outfile ../../hue-panel
cd ../..

echo ""
echo "==> Done: ./hue-panel ($(du -sh hue-panel | cut -f1))"
echo "    Copy to your LXC and run it directly — no Node/Bun/npm needed."
