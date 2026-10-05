import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Use esbuild for both dev and build
  esbuild: {
    jsx: 'automatic',
  },
  // Force esbuild for transforms
  experimental: {
    transform: {
      useEsbuild: true,
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
  },
});