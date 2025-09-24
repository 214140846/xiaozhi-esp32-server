import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8002/xiaozhi",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // 可选：把 /api 去掉，只留后面的路径
      },
    },
  },
});
