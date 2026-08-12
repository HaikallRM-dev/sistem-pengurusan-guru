import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base = path repo di bawah GitHub Pages (https://<user>.github.io/<repo>/)
export default defineConfig({
  base: '/sistem-pengurusan-guru/',
  plugins: [react()],
})
