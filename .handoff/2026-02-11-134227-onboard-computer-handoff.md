# Session Handoff - onboard.computer

## Current State
Refactored Electron onboarding app from hardcoded tools/apps to external `.onboard` YAML config files. Created website landing page and app branding. All committed and pushed to main. Ready to build the DMG for distribution.

## Recent Changes
- `electron/renderer.js` - Dynamic config loading, drag-drop, empty state UI
- `electron/main.js` - YAML loading with js-yaml, config validation, IPC handlers
- `electron/preload.js` - Config loading methods, `webUtils.getPathForFile()` for drag-drop
- `electron/index.html` - Simplified to empty state + main content views
- `electron/styles.css` - Empty state, config header, removed tabs
- `electron/package.json` - electron-builder config, branding as "onboard.computer"
- `electron/assets/icon.svg` + `icon.icns` - App icon
- `electron/examples/*.onboard` - Example config files (default, web-developer, data-science)
- `website/index.html` - Landing page with download button, video placeholder
- `website/vercel.json` - Vercel config for DMG download headers

## Key Decisions Made
- `.onboard` YAML files for config (not JSON)
- Empty state on fresh launch (no auto-loading bundled default)
- Drag-drop or URL paste to load configs
- Icons: bundled filenames OR URLs, emoji fallback
- Removed: Accounts tab, Workspace tab, librarian articles
- App branded as "onboard.computer", appId: `computer.onboard.app`

## Next Steps
1. Build DMG: `cd electron && npm run build:dmg`
2. Copy DMG to website: `cp dist/onboard-computer-*.dmg ../website/onboard-computer.dmg`
3. Deploy website to Vercel (connect to onboard.computer domain)
4. Add demo video when ready (save as `website/demo.mp4`)

## Context Files
- `electron/package.json` - Build config, dependencies
- `electron/renderer.js` - UI logic, config loading
- `electron/main.js` - IPC handlers, YAML validation
- `electron/default.onboard` - Example config format
- `website/index.html` - Landing page

## Commands to Run
```bash
cd /Users/afar/dev/onboard-af/electron
npm run build:dmg
```
