import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';

const trendingSearches = [
  'Kurti sets', 'Sneakers', 'Smartwatch', 'Saree', 'T-shirt combo',
  'Earphones', 'Backpack', 'Skincare kit',
];

const recentSearches = ['Denim jacket', 'Running shoes'];

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setFocused(false);
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    onSearch(term);
    setFocused(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
          focused
            ? 'bg-white/10 border-[#e94560]/40 shadow-lg shadow-[#e94560]/10'
            : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}>
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search for products, brands & more..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); onSearch(''); }}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Suggestions */}
      <AnimatePresence>
        {focused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-[#1a1a2e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50"
          >
            {/* Recent */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onMouseDown={() => handleSuggestionClick(term)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Trending</p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onMouseDown={() => handleSuggestionClick(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e94560]/10 border border-[#e94560]/20 text-[#e94560] text-xs hover:bg-[#e94560]/20 transition-all cursor-pointer"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
