import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // Base relativa para que funcione en GitHub Pages (https://user.github.io/repo/)
  base: './',
  // @ts-expect-error Vitest añade la opción "test" a la config de Vite en tiempo de ejecución
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.js'],
    environmentMatchGlobs: [['server/**', 'node']],
  },
  plugins: [
    react(),
    tailwindcss(),
    // En GitHub Pages no hay SPA fallback: copiar index.html a 404.html para que las rutas funcionen
    {
      name: 'copy-404',
      closeBundle() {
        const out = resolve(__dirname, 'dist')
        const index = resolve(out, 'index.html')
        const fallback = resolve(out, '404.html')
        if (existsSync(index)) copyFileSync(index, fallback)
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/steamspy': {
        target: 'https://steamspy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steamspy/, ''),
      },
      '/steam-store': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-store/, ''),
      },
    },
  },
})
