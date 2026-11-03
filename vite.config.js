import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Link previews need full web addresses, so the live site's address is filled in at build time.
const siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'howl-test.vercel.app'}`

export default defineConfig({
  plugins: [
    react(),
    { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl) },
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        designSystem: 'design-system.html',
      },
    },
  },
})
