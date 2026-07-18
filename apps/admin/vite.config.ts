import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    target: 'es2015',
    outDir: '../../dist/public',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    cors: true,
    proxy: {
        '/api': {
          target: 'http://localhost:7998',
          changeOrigin: true,
          ws: true,
        }
    },
    allowedHosts: true,
  }
})
