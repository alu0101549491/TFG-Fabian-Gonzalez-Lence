import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  // Use BASE_URL from environment if set, otherwise determine from command
  const base = process.env.BASE_URL || 
    (command === 'build' ? `/${process.env.REPO_NAME || 'TFG-Fabian-Gonzalez-Lence'}/3-MiniBalatro/` : '/');

  return {
    plugins: [react()],
    root: '.',
    publicDir: 'public',
    base,  // '/' for dev, '/REPO_NAME/3-MiniBalatro/' for production
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
  };
});