#!/usr/bin/env bash
# ==============================================================================
# MultiWave — macOS Production Build & Package Script (.app & .dmg)
# ==============================================================================

set -e

echo "🌊 ========================================================="
echo "    MultiWave — Building macOS Universal / Apple Silicon Release"
echo "========================================================="
echo ""

# Ensure Cargo and Homebrew tools are in PATH
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# 1. Verify Prerequisites
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ (e.g. brew install node)."
    exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
    echo "❌ Rust / Cargo is not installed. Please install Rust via https://rustup.rs."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Rust: $(cargo --version)"
echo ""

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# 3. Build Frontend
echo "🔨 Building React + Vite frontend assets..."
npm run build

# 4. Build Tauri Desktop Application (.app and .dmg)
echo "🚀 Compiling Tauri macOS release bundle..."
cd src-tauri
cargo tauri build "$@"
cd ..

echo ""
echo "🎉 ========================================================="
echo "    MultiWave Build Successful!"
echo "========================================================="
echo ""
echo "📦 Output artifacts are located in:"
echo "   src-tauri/target/release/bundle/dmg/ (macOS Disk Image installer .dmg)"
echo "   src-tauri/target/release/bundle/macos/ (macOS Application bundle .app)"
echo ""
