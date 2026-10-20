#!/usr/bin/env bash
# ==============================================================================
# MultiWave — macOS Virtual Speaker & Audio Routing Setup Script
# Installs and configures BlackHole (2-Channel Virtual Audio Driver) for macOS
# ==============================================================================

set -e

echo "🌊 ========================================================="
echo "    MultiWave — macOS Virtual Audio Driver Installer"
echo "========================================================="
echo ""

DRIVER_PATH="/Library/Audio/Plug-Ins/HAL/BlackHole2ch.driver"
FALLBACK_DRIVER="/Library/Audio/Plug-Ins/HAL/BlackHole.driver"

if [ -d "$DRIVER_PATH" ] || [ -d "$FALLBACK_DRIVER" ]; then
    echo "✅ MultiWave Virtual Audio Driver (BlackHole 2ch) is already installed!"
    echo "   Location: $DRIVER_PATH"
else
    echo "📦 Virtual Audio Driver not detected. Installing BlackHole 2ch..."

    # Method 1: Check if Homebrew is available
    if command -v brew >/dev/null 2>&1; then
        echo "🍺 Detected Homebrew. Installing via brew..."
        brew install blackhole-2ch || brew install blackhole-16ch
    else
        echo "🌐 Homebrew not found. Downloading official signed installer package..."
        PKG_URL="https://github.com/ExistentialAudio/BlackHole/releases/download/v0.6.1/BlackHole2ch.v0.6.1.pkg"
        TMP_PKG="/tmp/BlackHole2ch.pkg"

        curl -fsSL -o "$TMP_PKG" "$PKG_URL" || {
            echo "⚠️ Could not download pkg automatically."
            echo "   Please download BlackHole 2ch manually from:"
            echo "   https://existential.audio/blackhole/"
            exit 1
        }

        echo "🔒 Installing BlackHole pkg (administrator privileges may be required)..."
        if [ "$(id -u)" -eq 0 ]; then
            installer -pkg "$TMP_PKG" -target /
        else
            sudo installer -pkg "$TMP_PKG" -target / || {
                echo "Opening GUI installer..."
                open "$TMP_PKG"
            }
        fi
        rm -f "$TMP_PKG"
    fi
fi

# Refresh macOS CoreAudio daemon so new virtual device appears immediately without rebooting
echo ""
echo "🔄 Refreshing macOS CoreAudio daemon..."
if [ "$(id -u)" -eq 0 ]; then
    launchctl kickstart -kp system/com.apple.audio.coreaudiod 2>/dev/null || true
else
    sudo launchctl kickstart -kp system/com.apple.audio.coreaudiod 2>/dev/null || true
fi

echo ""
echo "🎉 SUCCESS: MultiWave Virtual Audio Driver is ready!"
echo "   You can now select 'BlackHole 2ch' / 'MultiWave Virtual Speaker' as your default system output."
echo "   MultiWave will capture system audio and broadcast it across all your selected devices."
echo ""

# Open Audio MIDI Setup for user inspection
open -a "Audio MIDI Setup" 2>/dev/null || true

exit 0
