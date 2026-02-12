# onboard.computer

A macOS app that automates developer environment setup. Define your tools in a YAML config, share it with your team, and get everyone to a working setup in minutes.

**[Download](https://onboard.computer)** · **[Create Config](#config-format)**

---

## What it does

1. You write a `.onboard` file listing your dependencies and apps
2. Someone opens it (drag-and-drop, double-click, or paste a URL)
3. They see what's installed, what's missing, and install with one click

No more "clone the repo and follow the README" where half the steps are outdated.

## Config format

```yaml
name: "My Team Setup"
description: "Everything needed for frontend development"

dependencies:
  - id: homebrew
    name: Homebrew
    desc: Package manager for macOS
    check: which brew
    install: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

  - id: node
    name: Node.js
    desc: JavaScript runtime
    check: which node
    install: brew install node
    depends_on: homebrew

apps:
  - id: vscode
    name: VS Code
    desc: Code editor
    check: ls /Applications/Visual\ Studio\ Code.app
    install: brew install --cask visual-studio-code
    depends_on: homebrew
```

Each item needs:
- `id` — unique identifier
- `name` — display name
- `check` — shell command that succeeds (exit 0) if installed
- `install` — shell command to install it

Optional:
- `desc` — short description
- `depends_on` — id of another item that must be installed first
- `icon_img` — URL or filename in `assets/`
- `icon_bg` — hex color for icon background

## Running locally

```bash
cd electron
npm install
npm run dev
```

## Building

```bash
cd electron
npm run package
```

Output goes to `electron/dist/`. Requires macOS and valid code signing credentials for distribution.

## Architecture

Vanilla Electron. No frameworks, no build step, no TypeScript.

```
electron/
├── main.js         # Main process — window, IPC, shell execution
├── preload.js      # Bridge — exposes window.onboard API
├── renderer.js     # UI — state, rendering, user interactions
├── index.html      # Structure
├── styles.css      # Styles
└── examples/       # Sample .onboard configs
```

The renderer never touches Node directly. All shell commands go through IPC to the main process.

## How install commands work

When you click "Install":
1. The app runs your `install` command via `spawn('/bin/bash', ['-c', command])`
2. Output streams to an inline terminal (or pop-out window)
3. When done, it runs your `check` command to verify success
4. If check passes, the item shows as installed with version info

The app respects `depends_on` ordering — you can't install Node before Homebrew.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
