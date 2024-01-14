import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function addServiceWorkerHeader() {
  return {
    name: 'add-service-worker-header',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Service-Worker-Allowed', '/')
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    addServiceWorkerHeader(),
    react(),
  ],
})
