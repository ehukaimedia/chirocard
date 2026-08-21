import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('react-calendar')) return 'calendar'
          if (id.includes('dexie')) return 'dexie'
          if (id.includes('@capacitor')) return 'capacitor'
        },
      },
    },
  },
})
