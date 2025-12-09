import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    // Optimize chunk sizes for better caching and faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'gsap': ['gsap'],
          'lucide': ['lucide-react'],
          // Components can load on demand
        },
      },
    },
    // Increase chunk size warning limit (default is 500KB)
    chunkSizeWarningLimit: 1000,
    // Use default esbuild minifier (built-in, no need to install terser)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'gsap',
      'lucide-react',
    ],
  },
})
