# Package and Release

Package the application, notarize with Apple, and publish to GitHub releases.

## Before You Start

1. Ensure you have the Apple credentials set up. Copy `.env.local.example` to `.env.local` in the `electron/` directory and fill in:
   - `APPLE_ID` - Your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password from appleid.apple.com
   - `APPLE_TEAM_ID` - Your Apple Developer Team ID
   - `GH_TOKEN` - GitHub personal access token with repo scope

2. Source the credentials: `source electron/.env.local`

## Steps

1. **Run the slop command** to clean up any AI-generated code artifacts
2. **Bump the version** in `electron/package.json`
3. **Update release notes** in `electron/renderer.js`:
   - Add entry to `RELEASE_NOTES` object with bullet points
   - Add entry to `RELEASE_DATES` object with date in format 'Feb 11 2026'
4. **Draft release notes** and confirm with me before building
5. **Build and package**: `cd electron && npm run package`
6. **Rename release files** (replace spaces with periods):
   ```bash
   cd electron/release
   mv "onboard.computer-X.X.X-arm64.dmg" "Onboard-X.X.X-arm64.dmg"
   mv "onboard.computer-X.X.X-arm64-mac.zip" "Onboard-X.X.X-arm64-mac.zip"
   ```
7. **Edit `latest-mac.yml`** to match the renamed filenames
8. **Create GitHub release** and upload all three files:
   ```bash
   gh release create vX.X.X --repo afar1/onboard-releases \
     --title "vX.X.X" \
     --notes "Release notes here" \
     "release/Onboard-X.X.X-arm64.dmg" \
     "release/Onboard-X.X.X-arm64-mac.zip" \
     "release/latest-mac.yml"
   ```

## Release Files Checklist

The auto-updater requires ALL of these files:

1. `Onboard-X.X.X-arm64.dmg` - DMG installer
2. `Onboard-X.X.X-arm64-mac.zip` - ZIP for auto-updates
3. `latest-mac.yml` - Auto-update manifest (with correct filenames)

**Why this matters:** The auto-updater downloads `latest-mac.yml` first, then uses the URLs inside to download the update. If the yml is missing or has wrong filenames, updates will fail with a 404 error.

## Draft vs Published

Unless you specify "draft", create a published release. Use `--draft` flag for draft releases:
```bash
gh release create vX.X.X --draft --repo afar1/onboard-releases ...
```
