import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error type error without @types/node package
import process from "node:process";
import fs from "node:fs";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

// Plugin to ensure large release binaries are NOT copied into dist (which Tauri embeds into the desktop binary)
function excludeInstallersFromDist() {
  return {
    name: "exclude-installers-from-dist",
    closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        for (const file of files) {
          if (file.endsWith(".exe") || file.endsWith(".dmg") || file.endsWith(".zip")) {
            try {
              fs.unlinkSync(path.join(distDir, file));
            } catch (err) {
              console.warn(`Could not remove ${file} from dist:`, err);
            }
          }
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), excludeInstallersFromDist()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
