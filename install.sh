#!/bin/sh
# install.sh — install hue-panel on a Debian/Ubuntu LXC container
# Usage: curl -fsSL https://github.com/githendrik/hue-panel/releases/latest/download/install.sh | sh

set -e

INSTALL_DIR="/opt/hue-panel"
DATA_DIR="/opt/hue-panel/data"
SERVICE_NAME="hue-panel"
BINARY_NAME="hue-panel"
REPO="githendrik/hue-panel"

echo "==> Installing hue-panel..."

# Detect latest release tag
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep '"tag_name"' | sed 's/.*"tag_name": "\(.*\)".*/\1/')

echo "==> Latest release: ${LATEST}"

ARCHIVE="hue-panel-linux-x64.tar.gz"
URL="https://github.com/${REPO}/releases/download/${LATEST}/${ARCHIVE}"

# Download and extract
TMP=$(mktemp -d)
curl -fsSL "$URL" -o "$TMP/$ARCHIVE"

mkdir -p "$INSTALL_DIR" "$DATA_DIR"
tar -xzf "$TMP/$ARCHIVE" -C "$INSTALL_DIR"
chmod +x "$INSTALL_DIR/$BINARY_NAME"
rm -rf "$TMP"

echo "==> Installed to $INSTALL_DIR"

# Install systemd service
# The binary must run from INSTALL_DIR so it can find node_modules/ there
cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=Hue Vacation Panel
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/${BINARY_NAME}
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
