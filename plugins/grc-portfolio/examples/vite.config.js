import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
    
    sourcemap: false,
    
    minify: 'esbuild',
  },
  
  server: {
    port: 5173,
    open: true,
  },
  
  preview: {
    port: 4173,
  },
})
