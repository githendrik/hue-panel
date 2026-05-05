# Agent Guidelines

## Release procedure

To trigger the GitHub Actions release pipeline, you must create and push a git tag:

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

See `DEPLOY.md` for full deployment documentation.

## Project structure

- **Framework**: Nuxt 3 (Vue 3)
- **Package manager**: Bun (but uses npm commands in CI)
- **Build output**: `.output/` directory (self-contained server)
- **Purpose**: Hue bridge control panel with scheduling

## Key files

| File | Purpose |
|------|---------|
| `package.json` | Version and dependencies |
| `.github/workflows/release.yml` | CI/CD release pipeline |
| `DEPLOY.md` | Deployment instructions for LXC/Proxmox |
| `install.sh` | Post-release install script |
