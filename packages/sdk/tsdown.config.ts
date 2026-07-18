import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: { loader: 'src/index.ts' },
    outDir: './dist/',
    format: ['esm'],
    platform: 'browser',
    dts: true,
    target: 'esnext',
    minify: true,
    sourcemap: false,
    clean: false,
    treeshake: true,
    noExternal: ['fishpi/browser', 'reconnecting_websocket'],
  },
]);