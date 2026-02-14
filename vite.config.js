import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.30.91:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://192.168.30.91:3000',
        ws: true,
      },
    },
  },
})
