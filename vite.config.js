import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { createRequire } from 'module';

// Create a require function for CommonJS compatibility
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm()
  ],
  resolve: {
    alias: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      events: require.resolve('events'),
      process: require.resolve('process'),
    },
  },
  define: {
    global: 'globalThis',
    process: 'process',
  },
  optimizeDeps: {
    include: ['process'],
  },
});
