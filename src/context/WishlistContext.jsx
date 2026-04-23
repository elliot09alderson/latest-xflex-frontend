import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WishlistContext = createContext(null);

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem('zxcom_wishlist')) || [];
  } catch { return []; }
}

function saveWishlist(items) {
  localStorage.setItem('zxcom_wishlist', JSON.stringify(items));
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      const updated = exists
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, { id: product.id, name: product.name, image: product.image, price: product.price, originalPrice: product.originalPrice, discount: product.discount, rating: product.rating, category: product.category }];
      saveWishlist(updated);
      return updated;
    });
  }, []);

  const isWishlisted = useCallback((productId) => items.some((i) => i.id === productId), [items]);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== productId);
      saveWishlist(updated);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    items, toggleWishlist, isWishlisted, removeFromWishlist, totalItems: items.length,
  }), [items, toggleWishlist, isWishlisted, removeFromWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
