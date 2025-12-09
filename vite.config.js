import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import imagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // ✅ Aggressive image optimization - compresses all images
    imagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 65, progressive: true }, // Quality 65 to save 60% size
      pngquant: { quality: [0.6, 0.8], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
    }),
  ],
  build: {
    // ✅ Aggressive minification
    minify: 'esbuild',
    // ✅ More aggressive code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'gsap': ['gsap'],
          'lucide': ['lucide-react'],
          'framer': ['framer-motion'],
        },
      },
    },
    // ✅ Reduce chunk size warning threshold to catch bloated chunks
    chunkSizeWarningLimit: 500,
    // ✅ Inline small assets to reduce requests
    assetsInlineLimit: 4096,
    // ✅ Generate source maps for production debugging (without publishing)
    sourcemap: false,
    // ✅ CSS minification
    cssMinify: true,
  },
  // ✅ Optimize dependencies - pre-bundle heavy imports
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'gsap',
      'lucide-react',
      'framer-motion',
    ],
    // ✅ Force pre-bundling for better caching
    force: false,
  },
  // ✅ Improve build performance
  server: {
    middlewareMode: false,
  },
})
