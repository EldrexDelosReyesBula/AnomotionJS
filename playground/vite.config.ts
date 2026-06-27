import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/playground/',
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@eldrex/anomotionjs-core': path.resolve(__dirname, '../packages/core/src'),
      '@eldrex/anomotionjs-text': path.resolve(__dirname, '../packages/text/src'),
      '@eldrex/anomotionjs-renderer-2d': path.resolve(__dirname, '../packages/renderer-2d/src'),
      '@eldrex/anomotionjs-renderer-3d': path.resolve(__dirname, '../packages/renderer-3d/src'),
      '@eldrex/anomotionjs-renderer-gpu': path.resolve(__dirname, '../packages/renderer-gpu/src'),
      '@eldrex/anomotionjs-physics': path.resolve(__dirname, '../packages/physics/src'),
      '@eldrex/anomotionjs-cache': path.resolve(__dirname, '../packages/cache/src')
    }
  }
});