import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/whazzup": {
        target: "http://api.flightads.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whazzup/, ""),
      },
      "/api": {
        target: "http://127.0.0.1/de-map",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/web": {
        target: "http://system.flightads.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/web/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
