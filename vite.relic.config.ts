import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: path.resolve(import.meta.dirname, "static-app"),
  base: "/Wispwood/relic/",
  publicDir: path.resolve(import.meta.dirname, "public"),
  plugins: [
    tailwindcss(),
    viteReact(),
    {
      name: "wisprelic-html",
      transformIndexHtml(html) {
        return html
          .replace("<title>Wispwood</title>", "<title>wispRelic</title>")
          .replace("Hold the lantern. Outlast the night.", "An empty clearing.");
      },
    },
  ],
  define: {
    "import.meta.env.VITE_WISP_RELIC": JSON.stringify("true"),
    "import.meta.env.VITE_AUTH_ENABLED": JSON.stringify("false"),
  },
  resolve: {
    tsconfigPaths: true,
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "docs/relic"),
    emptyOutDir: true,
  },
});
