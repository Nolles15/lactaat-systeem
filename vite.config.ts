import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages project-site draait onder /<repo>/; lokaal dev blijft op root.
  base: command === 'build' ? '/lactaat-systeem/' : '/',
  plugins: [react()],
}))
