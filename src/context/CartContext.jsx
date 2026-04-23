import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('zxcom_cart')) || [];
  } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem('zxcom_cart', JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        updated = [...prev, { id: product.id, name: product.name, image: product.image, price: product.price, originalPrice: product.originalPrice, qty: 1 }];
      }
      saveCart(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== productId);
      saveCart(updated);
      return updated;
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setItems((prev) => {
      const updated = qty <= 0
        ? prev.filter((i) => i.id !== productId)
        : prev.map((i) => i.id === productId ? { ...i, qty } : i);
      saveCart(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('zxcom_cart');
  }, []);

  const isInCart = useCallback((productId) => items.some((i) => i.id === productId), [items]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const value = useMemo(() => ({
    items, addToCart, removeFromCart, updateQty, clearCart, isInCart, totalItems, totalPrice,
  }), [items, addToCart, removeFromCart, updateQty, clearCart, isInCart, totalItems, totalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
