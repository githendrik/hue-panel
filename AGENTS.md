# Agent Guidelines

## Release procedure

Use the release script to keep `package.json` and git tags in sync:

```bash
# Bump version, commit, tag, and push in one command
./scripts/release.sh 0.1.5
```

This script will:
1. Update `package.json` version
2. Commit the change
3. Create a git tag with `v` prefix
4. Push the tag to trigger the release workflow

### Manual release (alternative)

```bash
# 1. Update version in package.json
# 2. Commit the change
git add package.json
git commit -m "bump version to X.Y.Z"

# 3. Create a tag with 'v' prefix (matches workflow trigger 'v*')
git tag vX.Y.Z

# 4. Push the tag to trigger the release workflow
git push origin vX.Y.Z
```

The workflow at `.github/workflows/release.yml` triggers on `push: tags: - 'v*'` and will:
- Build the Nuxt app
- Run smoke tests
- Create a release archive with the `.output/` folder
- Publish a GitHub Release with the binary and install script

### Verify release with GitHub CLI

```bash
# Check workflow run status
gh run list --repo githendrik/hue-panel --limit 5

# Watch a specific run
gh run watch --repo githendrik/hue-panel <run-id> --exit-status

# Verify release was created
gh release view vX.Y.Z --repo githendrik/hue-panel
```

See `DEPLOY.md` for full deployment documentation.

## Project structure

- **Framework**: Nuxt 3 (Vue 3)
- **Package manager**: Bun (but uses npm commands in CI)
- **Build output**: `.output/` directory (self-contained server)
- **Purpose**: Hue bridge control panel with scheduling

## Upgrade procedure

To upgrade an existing LXC installation, run the install script again:

```bash
# SSH into the LXC container
curl -fsSL https://github.com/githendrik/hue-panel/releases/latest/download/install.sh | sh
```

The script downloads the latest release and overwrites `/opt/hue-panel`. The systemd service restarts automatically.

## Key files

| File | Purpose |
|------|---------|
| `package.json` | Version and dependencies |
| `.github/workflows/release.yml` | CI/CD release pipeline |
| `DEPLOY.md` | Deployment instructions for LXC/Proxmox |
| `install.sh` | Post-release install script |
