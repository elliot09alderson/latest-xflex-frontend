import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard, CheckCircle2, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../components/layout/PublicLayout';
import Seo from '../components/seo/Seo';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import useRazorpay from '../hooks/useRazorpay';
import api from '../config/api';

const DELIVERY_THRESHOLD_FREE = 499;
const DELIVERY_FEE = 49;

/**
 * ZXCOM ecom checkout page.
 *
 * Flow:
 *   1. User reviews cart + fills shipping address
 *   2. POST /orders/create → backend creates Order (status=pending) + Razorpay order
 *   3. Frontend opens Razorpay checkout
 *   4. POST /orders/:id/verify with the Razorpay response → backend verifies
 *      signature, marks order paid, credits merchant commission
 *   5. Cart is cleared, success state rendered
 *
 * If the user isn't logged in we redirect them to /login first so the order
 * can be attributed to their account (which also determines which merchant
 * gets the commission).
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, updateQty, removeFromCart, clearCart } = useCart();
  const { initiatePayment } = useRazorpay();

  const [address, setAddress] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      toast('Please sign in to place your order');
      navigate('/login');
    }
  }, [user, navigate]);

  const subtotal = totalPrice;
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD_FREE || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const handleField = (e) => setAddress((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const required = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode'];
    for (const k of required) {
      if (!address[k]?.trim()) { toast.error(`${k.replace('_', ' ')} is required`); return false; }
    }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Pincode must be 6 digits'); return false; }
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      toast.error('Phone must be 10 digits'); return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Create backing order + Razorpay order
      const payload = {
        items: items.map((i) => ({
          product_id: String(i.id),
          name: i.name,
          image: i.image,
          price: i.price,
          original_price: i.originalPrice,
          qty: i.qty,
        })),
        shipping_address: address,
        delivery_fee: deliveryFee,
      };
      const { data: res } = await api.post('/orders/create', payload);
      const order = res?.data?.order || res?.order;
      const rzp = res?.data?.razorpay || res?.razorpay;
      if (!order || !rzp) throw new Error('Unexpected create-order response');

      // 2. Open Razorpay checkout
      await initiatePayment({
        amount: rzp.amount,
        order_id: rzp.order_id,
        prefill: {
          name: address.full_name,
          email: user?.email || '',
          contact: address.phone,
        },
        handler: async (response) => {
          try {
            // 3. Verify on backend — merchant commission is credited here
            const { data: vRes } = await api.post(`/orders/${order._id}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const paid = vRes?.data?.order || vRes?.order;
            setPlacedOrder(paid);
            clearCart();
            toast.success('Payment successful');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setSubmitting(false);
          }
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
      setSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────
  if (placedOrder) {
    return (
      <PublicLayout>
        <Seo title="Order Confirmed" path="/checkout" noindex />
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center bg-white/5 border border-emerald-400/30 rounded-2xl p-8"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Order Placed</h1>
            <p className="text-sm text-white/50 mb-5">
              Your order <span className="font-mono text-emerald-300">{placedOrder.order_number}</span> has been confirmed.
            </p>
            <div className="bg-white/5 rounded-xl border border-white/5 p-4 mb-6 text-left text-sm text-white/70 space-y-1">
              <div className="flex justify-between"><span>Items</span><span>{placedOrder.items?.length}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>₹{placedOrder.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>₹{placedOrder.delivery_fee || 0}</span></div>
              <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/5 mt-2">
                <span>Total Paid</span><span>₹{placedOrder.total}</span>
              </div>
            </div>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  // ── Normal checkout form ──────────────────────────────────────
  return (
    <PublicLayout>
      <Seo
        title="Checkout"
        description="Complete your ZXCOM purchase securely. Free delivery on orders above ₹499."
        path="/checkout"
        noindex
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#e94560]/10">
            <ShoppingCart className="w-5 h-5 text-[#e94560]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-xs text-white/40">Review your order and complete payment</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <ShoppingCart className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <h2 className="text-lg font-semibold text-white mb-1">Your cart is empty</h2>
            <p className="text-sm text-white/40 mb-5">Add a few products to get started.</p>
            <Button onClick={() => navigate('/')}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Cart items + Address ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart items */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Your Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-white/5"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-white/40">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm text-white w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-white w-16 text-right">₹{item.price * item.qty}</div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#e94560]" />
                  <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" name="full_name" value={address.full_name} onChange={handleField} required />
                  <Input label="Phone" name="phone" value={address.phone} onChange={handleField} required />
                  <div className="sm:col-span-2">
                    <Input label="Address Line 1" name="address_line1" value={address.address_line1} onChange={handleField} required />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Address Line 2 (optional)" name="address_line2" value={address.address_line2} onChange={handleField} />
                  </div>
                  <Input label="City" name="city" value={address.city} onChange={handleField} required />
                  <Input label="State" name="state" value={address.state} onChange={handleField} required />
                  <Input label="Pincode" name="pincode" value={address.pincode} onChange={handleField} required />
                </div>
              </div>
            </div>

            {/* ── Order summary (sticky) ── */}
            <div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-24">
                <h2 className="text-sm font-semibold text-white mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-400' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {deliveryFee === 0 && subtotal > 0 && (
                    <p className="text-[11px] text-emerald-400/70">You saved ₹{DELIVERY_FEE} on delivery!</p>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between text-white font-semibold text-base">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <p className="text-[10px] text-white/30">Inclusive of all taxes</p>
                </div>

                <Button
                  icon={CreditCard}
                  onClick={handlePayment}
                  loading={submitting}
                  className="w-full mt-5"
                >
                  Pay ₹{total} Securely
                </Button>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-white/40">
                  <Lock className="w-3 h-3" />
                  Secure payment via Razorpay
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
