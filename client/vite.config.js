import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    host: '0.0.0.0', // Allow external connections (for Docker)
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for Docker volume mounts
    },
    hmr: {
      host: 'localhost', // HMR host for browser connection
      port: 5173,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.js',
        '**/main.jsx',
      ],
    },
  },
})
