#!/bin/sh
# build-binary.sh — build a self-contained hue-panel binary for linux-x64
# Requires: node (for nuxt build), bun (for compilation)
#
# The binary relies on .output/server/node_modules/ at runtime (Vue SSR chunks).
# Run the binary from .output/server/ or copy both the binary AND node_modules/
# to the same directory on your target machine (the install.sh does this).
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
  --outfile hue-panel

echo ""
echo "==> Done: .output/server/hue-panel ($(du -sh .output/server/hue-panel | cut -f1))"
echo "    Run with: cd .output/server && ./hue-panel"
echo "    Or copy both hue-panel and node_modules/ to the same dir on your LXC."
