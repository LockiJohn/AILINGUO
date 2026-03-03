import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: "AILINGO - Impara l'Inglese",
        short_name: 'AILINGO',
        description: 'Apprendimento lingua inglese premium',
        theme_color: '#0A0A0F',
        background_color: '#0A0A0F',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@content': resolve(__dirname, 'content'),
    },
  },
  server: {
    port: 5173,
    host: true,   // espone il server su tutta la rete locale
  },
})
