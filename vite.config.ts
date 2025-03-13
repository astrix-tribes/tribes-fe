/// <reference types="vite/client" />
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
// @ts-ignore - Ignore the missing type declaration
import eslint from 'vite-plugin-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      failOnWarning: false,
      failOnError: true,
      // This ensures that only errors, not warnings, will fail the build
      emitWarning: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules'],
      lintOnStart: false
    }),
    splitVendorChunkPlugin()
  ],
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/monad-rpc': {
        target: 'https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/monad-rpc/, ''),
      },
      '/fuse-rpc': {
        target: 'https://rpc.flash.fuse.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fuse-rpc/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Only treat errors (not warnings) as build failures
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      // Explicitly ignore certain warnings
      onwarn(warning, warn) {
        // Ignore unused variable warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        // Ignore unused variable warnings in TypeScript
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        
        // Let Rollup handle all other warnings normally
        warn(warning);
      }
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'viem',
      'wagmi',
      '@heroicons/react',
      'lucide-react',
      'framer-motion',
      'lodash'
    ]
  }
});
