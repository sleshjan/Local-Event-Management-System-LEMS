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
        target: 'https://taren-terrigenous-zackary.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      },
      '/storage': {
        target: 'https://taren-terrigenous-zackary.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      },
      '/event_cover_img': {
        target: 'https://taren-terrigenous-zackary.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      },
      '/profile_images': {
        target: 'https://taren-terrigenous-zackary.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    }
  }
})
