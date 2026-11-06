import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // lightningcss no puede minificar semantic-ui-css (pseudo-elementos seguidos de clases)
    cssMinify: false,
  },
})
