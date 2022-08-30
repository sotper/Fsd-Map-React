import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
const EnvConfig = loadEnv("", "./");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/whazzup": {
        target: EnvConfig.VITE_WHAZZUP_REALM,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whazzup/, ""),
      },
      "/api": {
        target: EnvConfig.VITE_API_REALM,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
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
