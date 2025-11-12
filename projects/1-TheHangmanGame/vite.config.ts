import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@models': resolve(__dirname, './src/models'),
      '@views': resolve(__dirname, './src/views'),
      '@controllers': resolve(__dirname, './src/controllers'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});