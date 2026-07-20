import { defineConfig } from 'vite'
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
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
