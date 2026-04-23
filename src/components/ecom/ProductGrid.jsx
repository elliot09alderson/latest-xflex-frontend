import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import FilterSheet from './FilterSheet';
import allProducts from '../../data/products';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ProductGrid({ activeCategory, searchQuery }) {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (activeCategory) {
      products = products.filter((p) => p.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (filters.priceRange?.length) {
      products = products.filter((p) => {
        return filters.priceRange.some((range) => {
          if (range === 'under500') return p.price < 500;
          if (range === '500-1000') return p.price >= 500 && p.price <= 1000;
          if (range === '1000-2000') return p.price >= 1000 && p.price <= 2000;
          if (range === 'above2000') return p.price > 2000;
          return true;
        });
      });
    }

    if (filters.rating?.length) {
      const minRating = Math.min(...filters.rating.map((r) => parseInt(r)));
      products = products.filter((p) => p.rating >= minRating);
    }

    if (filters.discount?.length) {
      const minDiscount = Math.min(...filters.discount.map((d) => parseInt(d)));
      products = products.filter((p) => p.discount >= minDiscount);
    }

    switch (sortBy) {
      case 'price-low': products.sort((a, b) => a.price - b.price); break;
      case 'price-high': products.sort((a, b) => b.price - a.price); break;
      case 'rating': products.sort((a, b) => b.rating - a.rating); break;
      case 'newest': products.sort((a, b) => b.id - a.id); break;
      case 'discount': products.sort((a, b) => b.discount - a.discount); break;
      default: break;
    }

    return products;
  }, [activeCategory, searchQuery, filters, sortBy]);

  return (
    <div className="flex gap-8">
      <FilterSheet filters={filters} onFilterChange={setFilters} sortBy={sortBy} onSortChange={setSortBy} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/40 text-sm">
            Showing <span className="text-white font-semibold">{filteredProducts.length}</span> products
            {activeCategory && <span> in <span className="text-[#e94560] capitalize">{activeCategory}</span></span>}
            {searchQuery && <span> for "<span className="text-[#e94560]">{searchQuery}</span>"</span>}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No products found</h3>
            <p className="text-white/40 text-sm max-w-md">Try adjusting your filters or search to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants} initial="hidden" animate="visible"
            key={`${activeCategory}-${searchQuery}-${sortBy}-${JSON.stringify(filters)}`}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
