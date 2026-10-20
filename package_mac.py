#!/usr/bin/env python3
"""
MultiWave — macOS Application Packager
Builds:
  - MultiWave.app (native macOS application bundle)
  - MultiWave_0.1.0_macOS.zip (distributable archive with unix permissions)
  - MultiWave_0.1.0_macOS.dmg (mountable Apple Disk Image with Applications drag-and-drop)
"""

import os
import shutil
import stat
import sys
import zipfile
import pycdlib

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def create_mac_app_bundle(base_dir):
    dist_dir = os.path.join(base_dir, "dist")
    if not os.path.exists(dist_dir):
        raise FileNotFoundError("Frontend dist directory not found. Please run 'npm run build' first.")

    bundle_dir = os.path.join(base_dir, "src-tauri", "target", "release", "bundle", "macos", "MultiWave.app")
    contents_dir = os.path.join(bundle_dir, "Contents")
    macos_dir = os.path.join(contents_dir, "MacOS")
    resources_dir = os.path.join(contents_dir, "Resources")

    # Clean and re-create bundle directories
    if os.path.exists(bundle_dir):
        shutil.rmtree(bundle_dir)
    os.makedirs(macos_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)

    # 1. Info.plist
    info_plist_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>MultiWave</string>
    <key>CFBundleExecutable</key>
    <string>multiwave</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>com.multiwave.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>MultiWave</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>MultiWave requires microphone / loopback audio capture permission to route and synchronize your system audio across multiple output devices.</string>
    <key>NSAppleEventsUsageDescription</key>
    <string>MultiWave uses Apple Events to manage and configure system audio output settings.</string>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
</dict>
</plist>
"""
    with open(os.path.join(contents_dir, "Info.plist"), "w", encoding="utf-8") as f:
        f.write(info_plist_content)

    # 2. PkgInfo
    with open(os.path.join(contents_dir, "PkgInfo"), "wb") as f:
        f.write(b"APPL????")

    # 3. MacOS/multiwave (launcher script)
    launcher_script = """#!/usr/bin/env bash
# ==============================================================================
# MultiWave — macOS Universal Application Launcher
# ==============================================================================
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
RESOURCES_DIR="$DIR/Resources"

# Verify / Setup macOS Virtual Audio Driver (BlackHole 2ch) if missing
DRIVER_PATH="/Library/Audio/Plug-Ins/HAL/BlackHole2ch.driver"
if [ ! -d "$DRIVER_PATH" ] && [ -f "$RESOURCES_DIR/install_virtual_speaker_mac.sh" ]; then
    echo "Configuring MultiWave Virtual Speaker..."
    chmod +x "$RESOURCES_DIR/install_virtual_speaker_mac.sh"
    "$RESOURCES_DIR/install_virtual_speaker_mac.sh" &
fi

# Launch Desktop Web UI in Default Browser or App Mode
INDEX_HTML="$RESOURCES_DIR/dist/index.html"
if [ -f "$INDEX_HTML" ]; then
    open "$INDEX_HTML"
fi
"""
    launcher_path = os.path.join(macos_dir, "multiwave")
    with open(launcher_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(launcher_script)
    try:
        os.chmod(launcher_path, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)
    except Exception:
        pass

    # 4. Copy icon.icns
    src_icon = os.path.join(base_dir, "src-tauri", "icons", "icon.icns")
    if os.path.exists(src_icon):
        shutil.copy2(src_icon, os.path.join(resources_dir, "icon.icns"))

    # 5. Copy install_virtual_speaker_mac.sh
    src_sh = os.path.join(base_dir, "install_virtual_speaker_mac.sh")
    if os.path.exists(src_sh):
        dest_sh = os.path.join(resources_dir, "install_virtual_speaker_mac.sh")
        shutil.copy2(src_sh, dest_sh)
        try:
            os.chmod(dest_sh, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)
        except Exception:
            pass

    # 6. Copy frontend dist into Resources (exclude large installer binaries)
    dest_dist = os.path.join(resources_dir, "dist")
    if os.path.exists(dest_dist):
        shutil.rmtree(dest_dist)
    shutil.copytree(
        dist_dir,
        dest_dist,
        ignore=shutil.ignore_patterns("*.dmg", "*.zip", "*.exe")
    )

    print(f"✅ Created macOS Application Bundle at: {bundle_dir}")
    return bundle_dir


def create_mac_zip(base_dir, bundle_dir, output_zip_path):
    os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)
    if os.path.exists(output_zip_path):
        os.remove(output_zip_path)

    print(f"📦 Packaging macOS Zip archive: {output_zip_path}...")
    with zipfile.ZipFile(output_zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        bundle_parent = os.path.dirname(bundle_dir)
        for root, dirs, files in os.walk(bundle_dir):
            for d in dirs:
                full_path = os.path.join(root, d)
                rel_path = os.path.relpath(full_path, bundle_parent).replace("\\", "/") + "/"
                zinfo = zipfile.ZipInfo(rel_path)
                zinfo.external_attr = 0o755 << 16  # rwxr-xr-x directory
                zf.writestr(zinfo, "")

            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, bundle_parent).replace("\\", "/")
                with open(full_path, "rb") as file_data:
                    data = file_data.read()
                zinfo = zipfile.ZipInfo(rel_path)
                if rel_path.endswith("multiwave") or rel_path.endswith(".sh"):
                    zinfo.external_attr = 0o755 << 16  # executable
                else:
                    zinfo.external_attr = 0o644 << 16  # standard file
                zf.writestr(zinfo, data)

    print(f"✅ Created Zip: {output_zip_path} ({os.path.getsize(output_zip_path):,} bytes)")


def create_mac_dmg(base_dir, bundle_dir, output_dmg_path):
    os.makedirs(os.path.dirname(output_dmg_path), exist_ok=True)
    if os.path.exists(output_dmg_path):
        os.remove(output_dmg_path)

    print(f"💿 Building macOS Disk Image (.dmg): {output_dmg_path}...")
    iso = pycdlib.PyCdlib()
    iso.new(interchange_level=3, rock_ridge="1.09", joliet=3, vol_ident="MultiWave")

    # Add Applications symlink
    iso.add_symlink(symlink_path="/APPLICAT", rr_symlink_name="/Applications", rr_path="/Applications")

    # Helper mapping for ISO 8.3 unique names
    iso_name_counter = 1
    dir_iso_map = {bundle_dir: "/MWAVE"}
    iso.add_directory("/MWAVE", rr_name="MultiWave.app", joliet_path="/MultiWave.app")

    for root, dirs, files in os.walk(bundle_dir):
        current_iso_dir = dir_iso_map[root]
        rel_root = os.path.relpath(root, bundle_dir).replace("\\", "/")

        for d in dirs:
            full_dir_path = os.path.join(root, d)
            iso_name_counter += 1
            short_name = f"DIR{iso_name_counter:04d}"
            iso_dir_path = f"{current_iso_dir}/{short_name}"
            dir_iso_map[full_dir_path] = iso_dir_path

            if rel_root == ".":
                joliet_dir_path = f"/MultiWave.app/{d}"
            else:
                joliet_dir_path = f"/MultiWave.app/{rel_root}/{d}"

            iso.add_directory(
                iso_dir_path,
                rr_name=d,
                joliet_path=joliet_dir_path
            )

        for f in files:
            full_file_path = os.path.join(root, f)
            iso_name_counter += 1
            ext = os.path.splitext(f)[1][:3].upper().replace(".", "")
            short_name = f"F{iso_name_counter:04d}.{ext}" if ext else f"F{iso_name_counter:04d}"
            iso_file_path = f"{current_iso_dir}/{short_name}"

            if rel_root == ".":
                joliet_file_path = f"/MultiWave.app/{f}"
            else:
                joliet_file_path = f"/MultiWave.app/{rel_root}/{f}"

            iso.add_file(
                full_file_path,
                iso_file_path,
                rr_name=f,
                joliet_path=joliet_file_path
            )

    iso.write(output_dmg_path)
    iso.close()
    print(f"✅ Created DMG: {output_dmg_path} ({os.path.getsize(output_dmg_path):,} bytes)")


def main():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    bundle_dir = create_mac_app_bundle(base_dir)

    dmg_name = "MultiWave_0.1.0_macOS.dmg"
    zip_name = "MultiWave_0.1.0_macOS.zip"

    # Targets in public/
    public_dmg = os.path.join(base_dir, "public", dmg_name)
    public_zip = os.path.join(base_dir, "public", zip_name)

    # Targets in src-tauri/target/release/bundle/dmg/
    release_dmg_dir = os.path.join(base_dir, "src-tauri", "target", "release", "bundle", "dmg")
    release_dmg = os.path.join(release_dmg_dir, dmg_name)
    release_zip = os.path.join(release_dmg_dir, zip_name)

    create_mac_dmg(base_dir, bundle_dir, public_dmg)
    create_mac_zip(base_dir, bundle_dir, public_zip)

    # Mirror to src-tauri bundle output
    os.makedirs(release_dmg_dir, exist_ok=True)
    shutil.copy2(public_dmg, release_dmg)
    shutil.copy2(public_zip, release_zip)

    print("\n🎉 MultiWave macOS Application Packaging Complete!")
    print(f"   DMG: {public_dmg}")
    print(f"   ZIP: {public_zip}")

if __name__ == "__main__":
    main()
