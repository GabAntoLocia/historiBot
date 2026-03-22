import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // VITE_API_URL is picked up automatically from the environment.
  // Only define the dev proxy — in production the env var takes over.
  server: {
    port: 5173,
    proxy:
      mode === 'development'
        ? {
            '/api': {
              target: 'http://localhost:3001',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
  },
}));
