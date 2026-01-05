import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://trendingvista.com/lems',
        changeOrigin: true,
        secure: false,
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        }
      },
      '/storage': {
        target: 'https://trendingvista.com/lems',
        changeOrigin: true,
        secure: false,
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        }
      },
      '/event_cover_img': {
        target: 'https://trendingvista.com/lems',
        changeOrigin: true,
        secure: false,
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        }
      },
      '/profile_images': {
        target: 'https://trendingvista.com/lems',
        changeOrigin: true,
        secure: false,
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        }
      }
    }
  }
})
