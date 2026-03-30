import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    proxy: {
      '/webhook': {
        target: 'https://n8n-production-a167.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/webhook-test': {
        target: 'https://n8n-production-a167.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    }
  }
})
