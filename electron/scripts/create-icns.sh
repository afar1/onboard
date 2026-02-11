#!/bin/bash
# Convert SVG icon to .icns for macOS app bundle

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/../assets"
SVG_FILE="$ASSETS_DIR/icon.svg"
ICONSET_DIR="$ASSETS_DIR/icon.iconset"
ICNS_FILE="$ASSETS_DIR/icon.icns"

# Check for required tools
if ! command -v rsvg-convert &> /dev/null; then
    echo "Installing librsvg via Homebrew..."
    brew install librsvg
fi

# Create iconset directory
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Generate all required sizes for macOS iconset
# Standard sizes: 16, 32, 128, 256, 512
# @2x sizes: 32, 64, 256, 512, 1024
sizes=(16 32 128 256 512)

for size in "${sizes[@]}"; do
    echo "Generating ${size}x${size}..."
    rsvg-convert -w $size -h $size "$SVG_FILE" -o "$ICONSET_DIR/icon_${size}x${size}.png"

    # Generate @2x version
    size2x=$((size * 2))
    echo "Generating ${size}x${size}@2x (${size2x}px)..."
    rsvg-convert -w $size2x -h $size2x "$SVG_FILE" -o "$ICONSET_DIR/icon_${size}x${size}@2x.png"
done

# Convert iconset to icns
echo "Creating .icns file..."
iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE"

# Clean up
rm -rf "$ICONSET_DIR"

echo "Done! Created: $ICNS_FILE"
