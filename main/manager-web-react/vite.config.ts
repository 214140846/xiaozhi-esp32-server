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
      // 将前端的 /api 代理到后端，并重写为实际的后端上下文路径 /xiaozhi
      "/api": {
        target: "http://localhost:8002",
        changeOrigin: true,
        // /api/user/captcha -> http://localhost:8002/xiaozhi/user/captcha
        rewrite: (p) => p.replace(/^\/api/, "/xiaozhi"),
      },
    },
  },
});
