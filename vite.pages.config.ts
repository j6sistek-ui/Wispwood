import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: path.resolve(import.meta.dirname, "static-app"),
  base: "/Wispwood/",
  publicDir: path.resolve(import.meta.dirname, "public"),
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    tsconfigPaths: true,
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "docs"),
    emptyOutDir: true,
  },
});
