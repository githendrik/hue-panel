#!/bin/sh
# install.sh — install hue-panel on a Debian/Ubuntu LXC container
# Usage: curl -fsSL https://github.com/githendrik/hue-panel/releases/latest/download/install.sh | sh

set -e

INSTALL_DIR="/opt/hue-panel"
DATA_DIR="/opt/hue-panel/data"
SERVICE_NAME="hue-panel"
REPO="githendrik/hue-panel"

echo "==> Installing hue-panel..."

# ── Install Bun if not present ─────────────────────────────────────────────
if ! command -v bun >/dev/null 2>&1; then
  echo "==> Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

BUN_BIN=$(command -v bun)
echo "==> Using Bun: $($BUN_BIN --version) at $BUN_BIN"

# ── Download latest release ────────────────────────────────────────────────
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep '"tag_name"' | sed 's/.*"tag_name": "\(.*\)".*/\1/')

echo "==> Latest release: ${LATEST}"

# Check existing version before upgrade
INSTALLED_VERSION=""
if [ -f "$INSTALL_DIR/package.json" ]; then
  INSTALLED_VERSION=$(grep '"version"' "$INSTALL_DIR/package.json" | sed 's/.*"version": "\(.*\)".*/\1/')
  echo "==> Installed version: ${INSTALLED_VERSION}"
fi

ARCHIVE="hue-panel-linux-x64.tar.gz"
URL="https://github.com/${REPO}/releases/download/${LATEST}/${ARCHIVE}"

TMP=$(mktemp -d)
curl -fsSL "$URL" -o "$TMP/$ARCHIVE"

mkdir -p "$INSTALL_DIR" "$DATA_DIR"
tar -xzf "$TMP/$ARCHIVE" -C "$INSTALL_DIR"
rm -rf "$TMP"

echo "==> Extracted to $INSTALL_DIR"

# Check if this is an upgrade and restart service if needed
NEW_VERSION=$(grep '"version"' "$INSTALL_DIR/package.json" | sed 's/.*"version": "\(.*\)".*/\1/')
if [ -n "$INSTALLED_VERSION" ] && [ "$INSTALLED_VERSION" != "$NEW_VERSION" ]; then
  echo "==> Upgrading from ${INSTALLED_VERSION} to ${NEW_VERSION} - restarting service..."
  systemctl restart "$SERVICE_NAME"
fi

# ── Install systemd service ────────────────────────────────────────────────
cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=Hue Vacation Panel
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
ExecStart=${BUN_BIN} run ${INSTALL_DIR}/server/index.mjs
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=HUE_STORAGE_PATH=${DATA_DIR}
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

echo ""
echo "==> hue-panel is running at http://$(hostname -I | awk '{print $1}'):3000"
echo "==> Manage with: systemctl {start|stop|restart|status} hue-panel"
echo "==> Logs:        journalctl -u hue-panel -f"
