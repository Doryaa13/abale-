import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { prerender } from './scripts/prerender.js'

// After the bundle is written: static HTML for the public pages + sitemap.xml.
const prerenderPublicPages = () => ({
  name: 'abale-prerender',
  apply: 'build',
  closeBundle: {
    order: 'post',
    handler() {
      const count = prerender('dist')
      console.log(`prerendered ${count} public pages`)
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['weeks/**', 'articles/**', 'article/**', 'exams/**', 'about/**', 'contact/**', 'privacy/**', 'sitemap.xml'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: "אבאל'ה",
        short_name: "אבאל'ה",
        description: 'האפליקציה שכל אבא לעתיד צריך.',
        theme_color: '#0b1120',
        background_color: '#0b1120',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    prerenderPublicPages(),
  ],
})
