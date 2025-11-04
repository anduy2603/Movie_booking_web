import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
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
})
