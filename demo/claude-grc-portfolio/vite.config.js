import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration optimized for AWS deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
    
    // Source maps for debugging (optional, increases build size)
    sourcemap: false,
    
    minify: 'esbuild',
  },
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
  },
  
  // Preview server configuration (for testing production build locally)
  preview: {
    port: 4173,
  },
})
