import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages: https://leekuy541-alt.github.io/toeic-700-coach/
export default defineConfig({
  plugins: [react()],
  base: '/toeic-700-coach/',
})
