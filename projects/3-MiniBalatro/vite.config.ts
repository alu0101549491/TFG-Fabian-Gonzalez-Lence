import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Determine base path - NO trailing slash on base path
const base = process.env.BASE_URL || '/3-MiniBalatro/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  base,  // Ejemplo: /3-MiniBalatro/
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@models': path.resolve(__dirname, './src/models'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@services': path.resolve(__dirname, './src/services'),
      '@views': path.resolve(__dirname, './src/views'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});