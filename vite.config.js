import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed to GitHub Pages at https://deepbat.github.io/db/
export default defineConfig({
  base: "/db/",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1100,
  },
});
