import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, ArrowRight, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../config/api';
import PublicLayout from '../components/layout/PublicLayout';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const STATUS_META = {
  pending:   { label: 'Pending',   icon: Clock,       variant: 'warning' },
  paid:      { label: 'Paid',      icon: CheckCircle2, variant: 'success' },
  shipped:   { label: 'Shipped',   icon: Truck,        variant: 'info' },
  delivered: { label: 'Delivered', icon: CheckCircle2, variant: 'success' },
  cancelled: { label: 'Cancelled', icon: XCircle,      variant: 'danger' },
  refunded:  { label: 'Refunded',  icon: XCircle,      variant: 'default' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/orders/me');
        setOrders(data.data?.orders || data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Orders</h1>
          <p className="text-sm text-white/50 mt-1">Track and manage your past purchases on zxcom.in</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            message="Start shopping and your orders will show up here."
            action={<Link to="/" className="inline-flex items-center gap-2 text-[#e94560] font-semibold text-sm hover:underline">Go to Shop <ArrowRight className="w-4 h-4" /></Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o, i) => {
              const meta = STATUS_META[o.status] || STATUS_META.pending;
              const firstItem = o.items?.[0] || {};
              const itemCount = o.items?.length || 0;
              const awb = o.nimbuspost?.awb_code || o.shiprocket?.awb_code || '';
              const courier = o.nimbuspost?.courier_name || o.shiprocket?.courier_name || '';
              return (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Link to={`/orders/${o._id}`} className="block">
                    <GlassCard className="p-5 hover:border-[#e94560]/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="p-3 rounded-xl bg-[#e94560]/10 border border-[#e94560]/20 flex-shrink-0">
                          <Package className="w-6 h-6 text-[#e94560]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-white/50">#{(o._id || '').slice(-8).toUpperCase()}</span>
                            <Badge text={meta.label} variant={meta.variant} />
                            <span className="text-[11px] text-white/30">· {fmtDate(o.createdAt)}</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">
                            {firstItem.name || 'Order'}
                            {itemCount > 1 && <span className="text-white/50 font-normal"> +{itemCount - 1} more</span>}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {itemCount} item{itemCount === 1 ? '' : 's'} · {fmtMoney(o.total)}
                          </p>
                          {awb && (
                            <p className="text-[11px] text-blue-300/80 mt-1 truncate">
                              <Truck className="w-3 h-3 inline mr-1 -mt-0.5" />
                              {courier || 'Courier'} · AWB {awb}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-white/40">Total</p>
                            <p className="text-lg font-bold text-[#e94560]">{fmtMoney(o.total)}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30" />
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
