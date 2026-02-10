import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',  // Must be './' for Amplify
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'iife',  // Disable module scripts
        inlineDynamicImports: true
      }
    }
  },
  // For local development only
  server: {
    proxy: {
      '/api': {
        target: 'https://blogbackend-yq0v.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
