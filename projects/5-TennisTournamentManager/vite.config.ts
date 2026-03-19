/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file vite.config.ts
 * @desc Vite configuration with Angular support via Analog plugin.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {defineConfig} from 'vite';
// import angular from '@analogjs/vite-plugin-angular';
import {resolve} from 'path';

export default defineConfig(({mode}) => {
  // Use root path for development, project path for production
  const base = mode === 'production' 
    ? (process.env.BASE_URL || '/5-TennisTournamentManager/')
    : '/';

  return {
    plugins: [
      // Angular plugin disabled - causes empty file serving issue
      // angular({
      //   tsconfig: resolve(__dirname, 'tsconfig.app.json'),
      //   inlineStylesExtension: 'css',
      // }),
    ],
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          useDefineForClassFields: false,
        },
      },
    },
    root: '.',
    publicDir: 'public',
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          assetFileNames: (assetInfo) => {
            // Ensure HTML files are treated as assets
            if (assetInfo.name && assetInfo.name.endsWith('.html')) {
              return 'assets/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@domain': resolve(__dirname, './src/domain'),
        '@application': resolve(__dirname, './src/application'),
        '@infrastructure': resolve(__dirname, './src/infrastructure'),
        '@presentation': resolve(__dirname, './src/presentation'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    server: {
      port: 4200,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
