import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Absolute base so assets load on nested routes like /post/my-article
  base: '/',
  build: {
    outDir: 'dist'
  }
})
