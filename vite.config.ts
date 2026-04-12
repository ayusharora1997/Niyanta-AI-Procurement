import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
<<<<<<< HEAD
=======
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
<<<<<<< HEAD
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    proxy: {
      '/webhook': {
        target: 'https://n8n-production-11c9.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
=======
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
      '/webhook-test': {
        target: 'https://n8n-production-11c9.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
<<<<<<< HEAD
    }
  }
})

=======
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
