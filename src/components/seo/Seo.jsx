import { Helmet } from 'react-helmet-async';

/**
 * Per-route SEO head tags for the ZXCOM storefront.
 *
 * Usage:
 *   <Seo
 *     title="Product Name"
 *     description="..."
 *     image="https://..."
 *     path="/product/7"
 *     type="product"
 *     jsonLd={{...}}
 *     noindex={false}
 *   />
 *
 * - `title` is automatically suffixed with the brand unless it already
 *   contains "ZXCOM", so individual pages just pass their own headline.
 * - `path` is the pathname only — the component builds the absolute
 *   canonical + og:url using SITE_URL.
 * - `jsonLd` is a plain object or array of objects that get emitted as
 *   <script type="application/ld+json">.
 */

// Absolute site origin. Can be overridden per environment via VITE_SITE_URL.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://zxcom.in').replace(/\/$/, '');
export const BRAND = 'ZXCOM';
const DEFAULT_DESCRIPTION =
  'ZXCOM is your destination for premium t-shirts, signature bags and lifestyle essentials. Free delivery on orders above ₹499, easy 7-day returns, and secure checkout.';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708923/zxcom/products/zxcom-logo-banner.jpg';

function formatTitle(title) {
  if (!title) return `${BRAND} — Shop Premium T-Shirts, Bags & Lifestyle Essentials`;
  if (title.toLowerCase().includes(BRAND.toLowerCase())) return title;
  return `${title} | ${BRAND}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = '/',
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const fullTitle = formatTitle(title);
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ldBlocks = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {ldBlocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
