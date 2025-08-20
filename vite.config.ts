import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwind()],

  // Use '/' in dev; '/static/' in build so Django can serve built assets correctly
  base: command === 'build' ? '/static/' : '/',

  build: {
  outDir: 'dist',     // default
  emptyOutDir: true,
},
}))
