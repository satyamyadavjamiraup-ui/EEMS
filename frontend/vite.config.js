import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5181,
    strictPort: true, // fail loudly instead of silently jumping to 5174, 5178, 5179...
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // matches your actual backend port
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})