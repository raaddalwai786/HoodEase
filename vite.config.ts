import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'


export default defineConfig(({ command }) => ({
  plugins: [react(), tailwind()],

  // Use '/' in dev; '/static/' in build so Django can serve built assets correctly
  base: command === 'build' ? '/static/' : '/',

  build: {
  outDir: 'dist',     // default
  emptyOutDir: true,
},
}))
