import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
        'X-Frame-Options': 'sameorigin'
    },
    host: true, // Allows access from external devices
    watch: {
      usePolling: true, // Ensures changes are picked up in Docker
    },
  }
})