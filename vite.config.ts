import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwind()],
  base: '/',                             // Django serves /static/
  build: {
    outDir: resolve(__dirname, '../../static'), // build straight into project static/
    emptyOutDir: false,                         // keep other files in static/
    rollupOptions: {
      output: {
        entryFileNames: `hoodease.js`,
        assetFileNames: `hoodease.[ext]`,       // => hoodease.css
        chunkFileNames: `hoodease-[name].js`,
      },
    },
  },
})
