import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trendingProducts } from '../../data/products';

export default function TrendingSection() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer shadow-xl"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
      >
        {trendingProducts.map((product, i) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 snap-start w-[160px] sm:w-[180px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-white text-[10px] font-semibold">{product.orders} orders</span>
                </div>
                {product.discount && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-green-500 text-white text-[10px] font-bold">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <h4 className="text-white/80 text-xs font-medium line-clamp-2 leading-tight min-h-[2rem]">{product.name}</h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold text-sm">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-white/25 text-[11px] line-through">₹{product.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" fill="#facc15" />
                  <span className="text-white/60 text-[11px]">{product.rating}</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer shadow-xl"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
