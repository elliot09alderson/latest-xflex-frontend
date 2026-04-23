#!/usr/bin/env node
/**
 * Generate public/sitemap.xml from the static product catalogue.
 *
 * Run once at build time (or manually via `npm run generate:sitemap`) after
 * editing src/data/products.js. Output is committed so the production build
 * just serves it as a static asset under https://zxcom.in/sitemap.xml.
 *
 * If the catalogue ever becomes dynamic (DB-backed), replace the dynamic
 * import below with a backend fetch that hits the public products endpoint.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://zxcom.in').replace(/\/$/, '');
const OUTPUT = resolve(ROOT, 'public', 'sitemap.xml');

async function main() {
  // Dynamic import because the data file uses ESM.
  const productsModule = await import(
    pathToFileURL(resolve(ROOT, 'src/data/products.js')).href
  );
  const allProducts = productsModule.default || [];
  const trendingProducts = productsModule.trendingProducts || [];

  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { path: '/',         changefreq: 'daily',   priority: '1.0' },
    { path: '/about',    changefreq: 'monthly', priority: '0.5' },
    { path: '/contact',  changefreq: 'monthly', priority: '0.5' },
    { path: '/shipping', changefreq: 'monthly', priority: '0.4' },
    { path: '/refund',   changefreq: 'monthly', priority: '0.4' },
    { path: '/terms',    changefreq: 'monthly', priority: '0.3' },
    { path: '/privacy',  changefreq: 'monthly', priority: '0.3' },
  ];

  const productRoutes = [...allProducts, ...trendingProducts].map((p) => ({
    path: `/product/${p.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    image: p.image,
    imageTitle: p.name,
  }));

  const urls = [...staticRoutes, ...productRoutes];

  const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));

  const body = urls.map((u) => {
    const loc = `${SITE_URL}${u.path}`;
    const imageBlock = u.image ? `
    <image:image>
      <image:loc>${xmlEscape(u.image)}</image:loc>
      <image:title>${xmlEscape(u.imageTitle || '')}</image:title>
    </image:image>` : '';
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${imageBlock}
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${body}
</urlset>
`;

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, xml);
  console.log(`[sitemap] wrote ${urls.length} urls → ${OUTPUT}`);
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
