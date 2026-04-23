import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Truck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const liked = isWishlisted(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-white/20 hover:shadow-[0_8px_40px_rgba(233,69,96,0.1)] transition-all duration-300 cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

          {product.tag && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#e94560] text-white text-[10px] font-bold uppercase tracking-wide shadow-lg">
              {product.tag}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer z-10 ${
              liked ? 'bg-[#e94560]/20 border-[#e94560]/40 text-[#e94560]' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" fill={liked ? '#e94560' : 'none'} />
          </motion.button>

          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-lg cursor-pointer ${
                inCart ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' : 'bg-[#e94560] hover:bg-[#d63d56] shadow-[#e94560]/30'
              }`}
            >
              {inCart ? <><Check className="w-4 h-4" /> In Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-2">
          <h3 className="text-white/90 text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

          <div className="flex items-baseline gap-2">
            <span className="text-white text-lg font-bold">₹{product.price}</span>
            {product.originalPrice && <span className="text-white/30 text-sm line-through">₹{product.originalPrice}</span>}
            {product.discount && <span className="text-green-400 text-xs font-semibold">{product.discount}% off</span>}
          </div>

          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/15 border border-green-500/20">
                <Star className="w-3 h-3 text-green-400" fill="#4ade80" />
                <span className="text-green-400 text-xs font-bold">{product.rating}</span>
              </div>
              {product.reviews && <span className="text-white/30 text-xs">({product.reviews} reviews)</span>}
            </div>
          )}

          {product.freeDelivery && (
            <div className="flex items-center gap-1.5 text-white/40 text-[11px]">
              <Truck className="w-3.5 h-3.5" /><span>Free Delivery</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
