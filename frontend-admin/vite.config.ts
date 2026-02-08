import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3042
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-material': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          'mui-x': ['@mui/x-data-grid'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
        }
      }
    }
  }
})
