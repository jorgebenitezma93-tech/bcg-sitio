import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dirección pública del sitio. Cámbiela en .env (SITE_URL) o en las variables
// de entorno de Vercel/Netlify cuando tenga dominio definitivo.
const site = process.env.SITE_URL || 'https://www.example.com';

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
