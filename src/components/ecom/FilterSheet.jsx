import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

const filterOptions = {
  priceRange: {
    label: 'Price Range',
    options: [
      { id: 'under500', label: 'Under ₹500' },
      { id: '500-1000', label: '₹500 - ₹1,000' },
      { id: '1000-2000', label: '₹1,000 - ₹2,000' },
      { id: 'above2000', label: 'Above ₹2,000' },
    ],
  },
  rating: {
    label: 'Customer Rating',
    options: [
      { id: '4plus', label: '4★ & above' },
      { id: '3plus', label: '3★ & above' },
      { id: '2plus', label: '2★ & above' },
    ],
  },
  discount: {
    label: 'Discount',
    options: [
      { id: '10plus', label: '10% or more' },
      { id: '20plus', label: '20% or more' },
      { id: '30plus', label: '30% or more' },
      { id: '50plus', label: '50% or more' },
    ],
  },
};

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Customer Rating' },
  { id: 'newest', label: 'Newest First' },
  { id: 'discount', label: 'Discount' },
];

export default function FilterSheet({ filters, onFilterChange, sortBy, onSortChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState({ priceRange: true, rating: true, discount: true });

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFilter = (group, id) => {
    const current = filters[group] || [];
    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    onFilterChange({ ...filters, [group]: updated });
  };

  const clearAll = () => {
    onFilterChange({});
  };

  const activeCount = Object.values(filters).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Sort By</p>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sortBy === opt.id
                  ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/20'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Filter Groups */}
      {Object.entries(filterOptions).map(([key, group]) => (
        <div key={key}>
          <button
            onClick={() => toggleExpand(key)}
            className="w-full flex items-center justify-between mb-3 cursor-pointer"
          >
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{group.label}</p>
            {expanded[key] ? (
              <ChevronUp className="w-3.5 h-3.5 text-white/30" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-white/30" />
            )}
          </button>
          <AnimatePresence>
            {expanded[key] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5">
                  {group.options.map((opt) => {
                    const isActive = (filters[key] || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleFilter(key, opt.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#e94560]/15 text-[#e94560] border border-[#e94560]/30'
                            : 'text-white/60 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          isActive ? 'border-[#e94560] bg-[#e94560]' : 'border-white/20'
                        }`}>
                          {isActive && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Clear All */}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors cursor-pointer"
        >
          Clear All Filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h3 className="text-white font-semibold text-sm mb-4">Filters & Sort</h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#e94560] text-white font-semibold text-sm shadow-2xl shadow-[#e94560]/30 hover:bg-[#d63d56] transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#1a1a2e] border-t border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">Filters & Sort</h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#e94560] text-white font-semibold text-sm hover:bg-[#d63d56] transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
