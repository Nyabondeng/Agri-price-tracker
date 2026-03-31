import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      // OneDrive/Windows file events can be flaky; polling keeps HMR reliable.
      usePolling: true,
      interval: 200
    },
    hmr: {
      host: "localhost",
      protocol: "ws",
      clientPort: 5173,
      timeout: 60000
    }
  }
});
