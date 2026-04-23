import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shirt, Watch, Smartphone, Home, Dumbbell, Sparkles, ShoppingBag, Baby, Laptop, Footprints } from 'lucide-react';

const categories = [
  { id: 'women', name: 'Women', icon: ShoppingBag, color: '#e94560' },
  { id: 'men', name: 'Men', icon: Shirt, color: '#3b82f6' },
  { id: 'kids', name: 'Kids', icon: Baby, color: '#f59e0b' },
  { id: 'electronics', name: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
  { id: 'home', name: 'Home & Kitchen', icon: Home, color: '#10b981' },
  { id: 'beauty', name: 'Beauty', icon: Sparkles, color: '#ec4899' },
  { id: 'footwear', name: 'Footwear', icon: Footprints, color: '#f97316' },
  { id: 'watches', name: 'Watches', icon: Watch, color: '#06b6d4' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: '#84cc16' },
  { id: 'laptops', name: 'Laptops', icon: Laptop, color: '#6366f1' },
];

export default function CategoryStrip({ activeCategory, onCategoryChange }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable Strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-1 py-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Category */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(null)}
          className={`flex-shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[80px] ${
            !activeCategory
              ? 'bg-[#e94560]/15 border-[#e94560]/40 shadow-lg shadow-[#e94560]/10'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            !activeCategory ? 'bg-[#e94560]/20' : 'bg-white/10'
          }`}>
            <ShoppingBag className="w-5 h-5" style={{ color: !activeCategory ? '#e94560' : 'rgba(255,255,255,0.6)' }} />
          </div>
          <span className={`text-[11px] font-semibold whitespace-nowrap ${
            !activeCategory ? 'text-[#e94560]' : 'text-white/60'
          }`}>
            All
          </span>
        </motion.button>

        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex-shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[80px] ${
                isActive
                  ? 'bg-white/10 border-white/20 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              style={isActive ? { borderColor: `${cat.color}40`, boxShadow: `0 4px 20px ${cat.color}15` } : {}}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                style={{ backgroundColor: isActive ? `${cat.color}20` : 'rgba(255,255,255,0.07)' }}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.5)' }} />
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${
                isActive ? 'text-white' : 'text-white/60'
              }`}>
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
