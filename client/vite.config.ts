import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/wordgame/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces
    proxy: {
      '/wordgame/socket.io': {
        target: 'http://localhost:6969',
        ws: true,
        changeOrigin: true
      }
    }
  }
});
