import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Sparkles, Trophy, ArrowRight, Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HeroBanner from '../components/landing/HeroBanner';
import WinnerGallery from '../components/landing/WinnerGallery';
import SearchBar from '../components/ecom/SearchBar';
import CategoryStrip from '../components/ecom/CategoryStrip';
import DealBanner from '../components/ecom/DealBanner';
import TrendingSection from '../components/ecom/TrendingSection';
import ProductGrid from '../components/ecom/ProductGrid';
import Seo, { SITE_URL, BRAND } from '../components/seo/Seo';

// Structured data for the home page — Organization + WebSite with SearchAction.
// These give Google the brand identity + a sitelinks search box in results.
const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: SITE_URL,
    logo: 'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708923/zxcom/products/zxcom-logo-banner.jpg',
    sameAs: [],
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    }],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
];


function SectionHeading({ icon: Icon, children, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#e94560]/10 border border-[#e94560]/20">
          <Icon className="w-5 h-5 text-[#e94560]" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {children}
        </h2>
      </div>
      {action && (
        <button className="flex items-center gap-1.5 text-[#e94560] text-sm font-medium hover:gap-2.5 transition-all cursor-pointer">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const trustBadges = [
  { icon: Truck, label: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: Shield, label: 'Secure Payment', desc: '100% secure checkout' },
  { icon: Headphones, label: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <PublicLayout>
      <Seo
        title="ZXCOM — Shop Premium T-Shirts, Bags & Lifestyle Essentials"
        description="Shop ZXCOM for premium t-shirts, signature bags and lifestyle essentials. Free delivery on orders above ₹499, easy 7-day returns, and secure checkout across India."
        path="/"
        type="website"
        jsonLd={homeJsonLd}
      />

      {/* Visually hidden h1 — primary landmark heading for crawlers & screen readers.
          The Hero carousel below supplies the visual headline. */}
      <h1 className="sr-only">ZXCOM — Premium T-Shirts, Bags & Lifestyle Essentials</h1>

      {/* Hero Banner */}
      <HeroBanner />

      {/* Trust Badges Strip */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#e94560]/10 flex-shrink-0">
                  <badge.icon className="w-5 h-5 text-[#e94560]" />
                </div>
                <div>
                  <p className="text-white text-xs sm:text-sm font-semibold">{badge.label}</p>
                  <p className="text-white/30 text-[10px] sm:text-xs hidden sm:block">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section className="px-4 sm:px-6 md:px-16 pt-8 pb-4">
        <SearchBar onSearch={setSearchQuery} />
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 md:px-16 py-4">
        <SectionHeading icon={ShoppingBag}>Shop by Category</SectionHeading>
        <CategoryStrip activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </section>

      {/* Deal of the Day */}
      <section className="px-4 sm:px-6 md:px-16 py-6">
        <DealBanner />
      </section>

      {/* Trending Now */}
      <section className="px-4 sm:px-6 md:px-16 py-6">
        <SectionHeading icon={TrendingUp} action>Trending Now</SectionHeading>
        <TrendingSection />
      </section>

      {/* Main Product Grid with Filters */}
      <section id="products" className="px-4 sm:px-6 md:px-16 py-8 scroll-mt-20">
        <SectionHeading icon={Sparkles}>Products For You</SectionHeading>
        <ProductGrid activeCategory={activeCategory} searchQuery={searchQuery} />
      </section>

      {/* App Download Banner */}
      <section className="px-4 sm:px-6 md:px-16 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border border-white/10"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#e94560]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-[#3b82f6]/20 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-2xl md:text-3xl mb-2">
                Download the <span className="text-[#e94560]">ZXCOM</span> App
              </h3>
              <p className="text-white/50 text-sm md:text-base max-w-md">
                Get exclusive app-only deals, track orders, and shop on the go with a seamless mobile experience.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer shadow-lg">
                Google Play
              </button>
              <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer shadow-lg">
                App Store
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Winners */}
      <section id="winners" className="px-4 sm:px-6 md:px-16 py-8 scroll-mt-20">
        <SectionHeading icon={Trophy} action>Recent Winners</SectionHeading>
        <WinnerGallery />
      </section>
    </PublicLayout>
  );
}
