import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig({
  plugins: [...mochaPlugins(process.env as any), react(), cloudflare()],
  server: { allowedHosts: true },
  build: {
    outDir: path.resolve(__dirname, "./src/worker/public"), // <- build React here
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
