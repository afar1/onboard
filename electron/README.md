# Onboard — Electron

Developer onboarding app. Checks your machine for required tools, helps install them in the right order, sets up accounts, and gets you to a running project.

## Quick Start

```bash
cd electron
npm install
npm start
```

## What It Does

**Dependencies tab** — Scans for and installs (in order):
1. Homebrew (package manager — everything depends on this)
2. Git (version control)
3. Node.js + npm (JavaScript runtime)
4. Python 3 (scripting, AI/ML tools)
5. Bun (fast JS runtime, optional)
6. Claude CLI (AI coding assistant)

**Accounts tab** — Walks through:
- Creating a GitHub account and authenticating via `gh auth login`
- Creating a Claude/Anthropic account

**Workspace tab** — Gets you to "Hello World":
1. Create a projects folder (~/Dev, ~/Developer, etc.)
2. Clone a starter repo
3. Run `npm install` + `npm run dev`

## Architecture

Vanilla Electron — no frameworks, no build step.

- `main.js` — Main process. Window config, IPC handlers for shell execution.
- `preload.js` — Secure bridge. Exposes `window.onboard` API to the renderer.
- `renderer.js` — All UI logic. DOM manipulation, state management, tool checks.
- `index.html` — Structure. Three tabs, action bar.
- `styles.css` — Dark terminal-inspired theme.
