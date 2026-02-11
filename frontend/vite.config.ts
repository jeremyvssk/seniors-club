import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://backend:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://backend:3001',
        ws: true,
        changeOrigin: true
      }
    }
  }
})