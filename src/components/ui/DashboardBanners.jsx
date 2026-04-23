import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

/**
 * Auto-rotating announcement banner strip shown at the top of the merchant or
 * promoter dashboard. Admin uploads banners from /admin/banners with an
 * `audience` field, which the role-specific endpoint then filters.
 *
 * Props:
 *   - endpoint: '/merchants/banners' | '/promoters/banners'
 */
export default function DashboardBanners({ endpoint }) {
  const { data, loading } = useFetch(endpoint);
  const banners = data?.banners || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (loading || banners.length === 0) return null;

  const current = banners[index];
  const content = (
    <div className="relative w-full h-full">
      <img
        src={current.image_url}
        alt={current.title || 'Announcement'}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {(current.title || current.caption) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-3.5 h-3.5 text-[#e94560]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e94560]">
              Announcement
            </span>
          </div>
          {current.title && (
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {current.title}
            </p>
          )}
          {current.caption && (
            <p className="text-[11px] sm:text-xs text-white/70 mt-0.5 line-clamp-2">
              {current.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] mb-6 group"
    >
      <div className="relative h-40 sm:h-48 w-full bg-black/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id || index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {current.link_url ? (
              <a
                href={current.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {content}
              </a>
            ) : (
              content
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? 'w-5 bg-[#e94560]' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
