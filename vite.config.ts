import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Makes the app installable on phones and laptops (Progressive Web App).
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon-96.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'EL-ROI Help Desk Tracker',
        short_name: 'EL-ROI Help Desk',
        description:
          'Report, track and resolve support tickets with the EL-ROI help desk.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#17296e',
        theme_color: '#17296e',
        lang: 'en',
        categories: ['productivity', 'business'],
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Create a ticket',
            short_name: 'New ticket',
            url: '/tickets/new',
          },
          { name: 'My tickets', short_name: 'Tickets', url: '/tickets' },
        ],
      },
      workbox: {
        // SPA fallback so deep links work offline once the shell is cached.
        navigateFallback: '/index.html',
        // Never serve the Supabase API from cache.
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/],
        // Precache the app shell; keep the big brand images out of it.
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'pwa-*.png', 'favicon*'],
        globIgnores: ['**/brand-bg*.jpg'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts stylesheet + files.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // App images (brand backdrop, etc.) — cached after first view.
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-images',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
