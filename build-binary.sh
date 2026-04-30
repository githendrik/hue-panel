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
  --external "@babel/parser" \
  --external "@vue/compiler-core" \
  --external "@vue/compiler-dom" \
  --external "@vue/compiler-ssr" \
  --external "@vue/devtools-api" \
  --external "@vue/reactivity" \
  --external "@vue/runtime-core" \
  --external "@vue/runtime-dom" \
  --external "@vue/server-renderer" \
  --external "@vue/shared" \
  --external "anymatch" \
  --external "chokidar" \
  --external "devalue" \
  --external "entities" \
  --external "estree-walker" \
  --external "hookable" \
  --external "normalize-path" \
  --external "perfect-debounce" \
  --external "picomatch" \
  --external "readdirp" \
  --external "source-map-js" \
  --external "ufo" \
  --external "unhead" \
  --external "vue" \
  --external "vue-bundle-renderer" \
  --external "vue-router" \
  --outfile ../../hue-panel
cd ../..

echo ""
echo "==> Done: ./hue-panel ($(du -sh hue-panel | cut -f1))"
echo "    Copy to your LXC and run it directly — no Node/Bun/npm needed."
