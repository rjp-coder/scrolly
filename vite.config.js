import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Using a relative base ('./') means the build works when hosted
// at https://username.github.io/repo-name/ without any extra config.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
})
