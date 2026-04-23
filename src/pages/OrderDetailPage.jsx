import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, MapPin, Truck, CheckCircle2, XCircle, Clock, ArrowLeft,
  ExternalLink, CircleDot, CreditCard, Hash,
} from 'lucide-react';
import api from '../config/api';
import PublicLayout from '../components/layout/PublicLayout';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const STATUS_META = {
  pending:          { label: 'Pending',         icon: Clock,        variant: 'warning', color: 'text-amber-300' },
  paid:             { label: 'Paid',            icon: CheckCircle2, variant: 'success', color: 'text-emerald-300' },
  shipped:          { label: 'Shipped',         icon: Truck,        variant: 'info',    color: 'text-blue-300' },
  out_for_delivery: { label: 'Out for delivery', icon: Truck,        variant: 'info',    color: 'text-blue-300' },
  delivered:        { label: 'Delivered',       icon: CheckCircle2, variant: 'success', color: 'text-emerald-300' },
  cancelled:        { label: 'Cancelled',       icon: XCircle,      variant: 'danger',  color: 'text-red-300' },
  refunded:         { label: 'Refunded',        icon: XCircle,      variant: 'default', color: 'text-white/50' },
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  : '';
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data?.order || data.order || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
      </PublicLayout>
    );
  }
  if (error || !order) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="text-[#e94560] text-sm hover:underline">← Back to orders</Link>
        </div>
      </PublicLayout>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const addr = order.shipping_address || {};
  const ship = order.nimbuspost?.awb_code ? order.nimbuspost
            : order.shiprocket?.shipment_id ? order.shiprocket
            : null;
  const shipProvider = order.nimbuspost?.awb_code ? 'NimbusPost'
                     : order.shiprocket?.shipment_id ? 'Shiprocket'
                     : null;
  const history = Array.isArray(order.status_history) ? [...order.status_history].sort((a, b) => new Date(a.at) - new Date(b.at)) : [];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back + header */}
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>

        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order {order.order_number || `#${(order._id || '').slice(-6).toUpperCase()}`}</h1>
            <Badge text={meta.label} variant={meta.variant} />
          </div>
          <p className="text-xs text-white/40">Placed on {fmtDate(order.createdAt)}</p>
        </motion.div>

        {/* Tracking strip */}
        {ship && (
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Truck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Shipment</p>
                <p className="text-sm font-semibold text-white">
                  {shipProvider}{ship.courier_name ? ` via ${ship.courier_name}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {ship.awb_code && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3 h-3" />AWB Number</p>
                  <p className="text-xs font-mono text-white break-all">{ship.awb_code}</p>
                </div>
              )}
              {ship.status && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><CircleDot className="w-3 h-3" />Courier Status</p>
                  <p className="text-xs font-semibold text-white capitalize">{ship.status}</p>
                </div>
              )}
              {ship.last_synced_at && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Last Synced</p>
                  <p className="text-xs text-white/80">{fmtDate(ship.last_synced_at)}</p>
                </div>
              )}
            </div>

            {ship.tracking_url && (
              <a href={ship.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                <Button size="sm" icon={ExternalLink}>Track on {shipProvider}</Button>
              </a>
            )}
          </GlassCard>
        )}

        {/* Status timeline */}
        {history.length > 0 && (
          <GlassCard className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-4">Order Timeline</p>
            <ol className="relative border-l border-white/10 ml-2 space-y-5">
              {history.map((h, i) => {
                const m = STATUS_META[h.status] || STATUS_META.pending;
                const Icon = m.icon;
                const isLatest = i === history.length - 1;
                return (
                  <li key={i} className="ml-5">
                    <span className={`absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-[#0a0a1a] ${isLatest ? 'bg-[#e94560]' : 'bg-white/20'}`}>
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </span>
                    <p className={`text-sm font-semibold ${m.color}`}>{m.label}</p>
                    <p className="text-[11px] text-white/40">{fmtDate(h.at)} · via {h.source || 'system'}</p>
                    {h.note && <p className="text-[11px] text-white/50 mt-0.5 italic">{h.note}</p>}
                  </li>
                );
              })}
            </ol>
          </GlassCard>
        )}

        {/* Items */}
        <GlassCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-4 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Items ({order.items?.length || 0})
          </p>
          <div className="space-y-3">
            {(order.items || []).map((it, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{it.name}</p>
                  <p className="text-[11px] text-white/40">
                    {it.qty} × {fmtMoney(it.price)}
                    {it.size ? ` · Size ${it.size}` : ''}
                  </p>
                </div>
                <p className="text-sm font-bold text-white flex-shrink-0">{fmtMoney((it.price || 0) * (it.qty || 1))}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-sm">
            <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{fmtMoney(order.subtotal)}</span></div>
            {order.delivery_fee > 0 && <div className="flex justify-between text-white/60"><span>Delivery</span><span>{fmtMoney(order.delivery_fee)}</span></div>}
            {order.tax_amount > 0 && <div className="flex justify-between text-white/60"><span>Tax</span><span>{fmtMoney(order.tax_amount)}</span></div>}
            <div className="flex justify-between text-base font-bold text-white pt-1">
              <span>Total</span><span className="text-[#e94560]">{fmtMoney(order.total)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Shipping & payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Delivery Address
            </p>
            <p className="text-sm font-semibold text-white">{addr.full_name}</p>
            <p className="text-xs text-white/60 mt-1">
              {addr.address_line1}
              {addr.address_line2 ? `, ${addr.address_line2}` : ''}
            </p>
            <p className="text-xs text-white/60">{addr.city}, {addr.state} – {addr.pincode}</p>
            <p className="text-xs text-white/50 mt-1">Phone: {addr.phone}</p>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment
            </p>
            <p className="text-sm font-semibold text-white capitalize">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay (Online)'}
            </p>
            {order.paid_at && (
              <p className="text-xs text-white/60 mt-1">Paid on {fmtDate(order.paid_at)}</p>
            )}
            {order.razorpay_payment_id && (
              <p className="text-[11px] text-white/40 font-mono mt-1 break-all">
                Ref: {order.razorpay_payment_id}
              </p>
            )}
          </GlassCard>
        </div>
      </div>
    </PublicLayout>
  );
}
