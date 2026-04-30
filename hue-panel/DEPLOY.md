# Hue Vacation Panel — LXC / Proxmox Deployment

## Quick start (Docker Compose — recommended inside LXC)

```bash
# 1. On the LXC container (Debian/Ubuntu), install Docker
apt update && apt install -y docker.io docker-compose

# 2. Clone / copy the project
git clone <repo> /opt/hue-panel
cd /opt/hue-panel

# 3. Build and start
docker compose up -d --build

# 4. Open http://<lxc-ip>:3000 → Setup → pair your bridge
```

---

## Bare-metal (no Docker) inside the LXC

```bash
# Install Node 20
apt update && apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Build the app (run on your dev machine, then copy .output to LXC)
npm run build          # produces .output/

# On the LXC container
mkdir -p /opt/hue-panel/data
cp -r .output /opt/hue-panel/

# Install and enable systemd service
cp hue-panel.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now hue-panel

# Check logs
journalctl -u hue-panel -f
```

---

## Proxmox LXC recommended settings

| Setting       | Value            |
|---------------|------------------|
| Template      | Debian 12        |
| CPU           | 1 core           |
| RAM           | 256 MB           |
| Disk          | 4 GB             |
| Network       | DHCP or static IP on your LAN |
| Unprivileged  | Yes              |

Give it a static IP on your LAN so the URL stays stable and the
Hue bridge always connects.

---

## Architecture decisions

- **Hue API v2 (local HTTPS)** — direct HTTP calls from Nitro server routes,
  no CLI wrapping, no cloud dependency.
- **Self-signed cert** — bypassed via `undici Agent({ connect: { rejectUnauthorized: false } })`.
  This is safe because communication is LAN-only.
- **Timers** — stored in JSON via Nitro's `fs` storage driver under `HUE_STORAGE_PATH`.
- **Scheduler** — `node-cron` runs inside the Nitro server plugin, no separate process needed.
- **Random offset** — each timer can add ±N minutes randomness to make lighting look natural.
- **Single binary** — `npm run build` produces a self-contained `.output/` directory
  with only the compiled server. No `node_modules` needed at runtime.
