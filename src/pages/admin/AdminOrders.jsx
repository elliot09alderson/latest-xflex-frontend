import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gift, Trophy, Award, Users, Store, Settings, BarChart3,
  Package, UserCheck, Wallet, ShoppingBag, Truck, X, Eye, RefreshCw, Send,
  MapPin, Phone, IndianRupee, ExternalLink, Ban, ShoppingCart, DollarSign,
  Clock, CheckCircle2, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import TableToolbar from '../../components/ui/TableToolbar';
import StatsCard from '../../components/ui/StatsCard';
import MiniChart from '../../components/ui/MiniChart';
import { exportToCSV, exportToPDF } from '../../utils/tableExport';

const sidebarLinks = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/offers', label: 'Offers', icon: <Gift size={18} /> },
  { path: '/admin/contests', label: 'Contests', icon: <Trophy size={18} /> },
  { path: '/admin/winners', label: 'Winners', icon: <Award size={18} /> },
  { path: '/admin/promoters', label: 'Promoters', icon: <Users size={18} /> },
  { path: '/admin/merchants', label: 'Merchants', icon: <Store size={18} /> },
  { path: '/admin/customers', label: 'Customers', icon: <UserCheck size={18} /> },
  { path: '/admin/payments', label: 'Payments', icon: <Wallet size={18} /> },
  { path: '/admin/payouts', label: 'Payouts', icon: <Wallet size={18} /> },
  { path: '/admin/packs', label: 'Packs', icon: <Package size={18} /> },
  { path: '/admin/products', label: 'Products', icon: <ShoppingBag size={18} /> },
  { path: '/admin/orders', label: 'Orders', icon: <Truck size={18} /> },
  { path: '/admin/config', label: 'Config', icon: <Settings size={18} /> },
  { path: '/admin/leaderboard', label: 'Leaderboard', icon: <BarChart3 size={18} /> },
];

const STATUS_VARIANT = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
};

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#ef4444',
};

const VIEW_TABS = [
  { value: 'orders', label: 'Orders', icon: Truck },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminOrders() {
  const [view, setView] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detail, setDetail] = useState(null);       // selected order for right-panel
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDays, setStatsDays] = useState(30);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data?.data?.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (days = statsDays) => {
    setStatsLoading(true);
    try {
      const res = await api.get(`/admin/orders/stats?days=${days}`);
      setStats(res.data?.data || null);
    } catch {
      toast.error('Failed to load order stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (view === 'analytics') fetchStats(statsDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statsDays]);

  const refreshOrder = async (id) => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      const updated = res.data?.data?.order;
      if (updated) {
        setDetail(updated);
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updated } : o)));
      }
    } catch { /* ignore */ }
  };

  const updateStatus = async (id, status) => {
    setBusy(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Order marked ${status}`);
      await refreshOrder(id);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const shipOrder = async (id) => {
    setBusy(true);
    try {
      await api.post(`/admin/orders/${id}/shiprocket/push`);
      toast.success('Order pushed to Shiprocket');
      await refreshOrder(id);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Shiprocket push failed');
    } finally {
      setBusy(false);
    }
  };

  const trackOrder = async (id) => {
    setBusy(true);
    try {
      const res = await api.get(`/admin/orders/${id}/shiprocket/track`);
      const updated = res.data?.data?.order;
      if (updated) setDetail(updated);
      toast.success('Tracking synced');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tracking failed');
    } finally {
      setBusy(false);
    }
  };

  const cancelShip = async (id) => {
    if (!window.confirm('Cancel this shipment on Shiprocket?')) return;
    setBusy(true);
    try {
      await api.post(`/admin/orders/${id}/shiprocket/cancel`);
      toast.success('Shipment cancelled on Shiprocket');
      await refreshOrder(id);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  const pushNimbus = async (id) => {
    setBusy(true);
    try {
      await api.post(`/admin/orders/${id}/nimbuspost/push`);
      toast.success('Order pushed to NimbusPost');
      await refreshOrder(id);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'NimbusPost push failed');
    } finally {
      setBusy(false);
    }
  };

  const trackNimbus = async (id) => {
    setBusy(true);
    try {
      const res = await api.get(`/admin/orders/${id}/nimbuspost/track`);
      const updated = res.data?.data?.order;
      if (updated) setDetail(updated);
      toast.success('Tracking synced');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tracking failed');
    } finally {
      setBusy(false);
    }
  };

  const cancelNimbus = async (id) => {
    if (!window.confirm('Cancel this shipment on NimbusPost?')) return;
    setBusy(true);
    try {
      await api.post(`/admin/orders/${id}/nimbuspost/cancel`);
      toast.success('Shipment cancelled on NimbusPost');
      await refreshOrder(id);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  const filtered = orders
    .filter((o) => filterStatus === 'all' || o.status === filterStatus)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.user_id?.name || '').toLowerCase().includes(q) ||
        (o.user_id?.phone || '').toLowerCase().includes(q) ||
        (o.shipping_address?.phone || '').toLowerCase().includes(q) ||
        (o.shipping_address?.full_name || '').toLowerCase().includes(q) ||
        (o.shipping_address?.pincode || '').toLowerCase().includes(q)
      );
    });

  const ORDER_COLUMNS = [
    { key: 'order_number', label: 'Order #' },
    { key: 'total', label: 'Total', export: (v) => `₹${v || 0}` },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created', export: (v) => v ? new Date(v).toLocaleString() : '' },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <div className="flex items-center gap-2">
            {view === 'analytics' && (
              <select
                value={statsDays}
                onChange={(e) => setStatsDays(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                <option value={7} className="bg-[#1a1a2e]">Last 7 days</option>
                <option value={14} className="bg-[#1a1a2e]">Last 14 days</option>
                <option value={30} className="bg-[#1a1a2e]">Last 30 days</option>
                <option value={60} className="bg-[#1a1a2e]">Last 60 days</option>
                <option value={90} className="bg-[#1a1a2e]">Last 90 days</option>
              </select>
            )}
            <Button
              icon={RefreshCw}
              onClick={() => (view === 'orders' ? fetchOrders() : fetchStats(statsDays))}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* View switcher: Orders | Analytics */}
        <div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/10">
          {VIEW_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setView(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === t.value
                  ? 'bg-[#e94560] text-white shadow-lg shadow-[#e94560]/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {view === 'analytics' ? (
          <AnalyticsView stats={stats} loading={statsLoading} />
        ) : (
          <>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filterStatus === tab.value
                  ? 'bg-[#e94560] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by order #, customer name, phone, pincode..."
          totalCount={filtered.length}
          selectedCount={0}
          onExportCSV={() => exportToCSV(ORDER_COLUMNS, filtered, 'orders')}
          onExportPDF={() => exportToPDF(ORDER_COLUMNS, filtered, 'orders', 'Orders')}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Truck className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No orders found.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <GlassCard key={o._id} className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{o.order_number}</span>
                      <Badge text={o.status} variant={STATUS_VARIANT[o.status] || 'info'} />
                      {o.shiprocket?.awb_code && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          AWB {o.shiprocket.awb_code}
                        </span>
                      )}
                      {o.shiprocket?.order_id && !o.shiprocket?.awb_code && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">
                          Shiprocket
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1">
                      {o.user_id?.name || 'Guest'} · {o.shipping_address?.phone || o.user_id?.phone || '—'} · {o.shipping_address?.city || '—'}, {o.shipping_address?.pincode || '—'}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'} · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[#e94560]">₹{o.total}</span>
                    <button
                      onClick={() => setDetail(o)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex justify-end"
            onClick={() => !busy && setDetail(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#12132a] h-full overflow-y-auto border-l border-white/10"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#12132a] z-10">
                <div>
                  <h3 className="text-lg font-bold text-white">{detail.order_number}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge text={detail.status} variant={STATUS_VARIANT[detail.status] || 'info'} />
                    <span className="text-xs text-white/40">{new Date(detail.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => !busy && setDetail(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Customer */}
                <section>
                  <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-white font-medium">{detail.user_id?.name || detail.shipping_address?.full_name}</p>
                  <p className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {detail.shipping_address?.phone || detail.user_id?.phone}
                  </p>
                  {detail.user_id?.email && (
                    <p className="text-white/40 text-xs mt-0.5">{detail.user_id.email}</p>
                  )}
                </section>

                {/* Address */}
                <section>
                  <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-2">Shipping Address</p>
                  <div className="text-sm text-white/70 leading-relaxed flex gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-white/40 mt-0.5" />
                    <div>
                      <p>{detail.shipping_address?.address_line1}</p>
                      {detail.shipping_address?.address_line2 && <p>{detail.shipping_address.address_line2}</p>}
                      <p>{detail.shipping_address?.city}, {detail.shipping_address?.state} — {detail.shipping_address?.pincode}</p>
                    </div>
                  </div>
                </section>

                {/* Items */}
                <section>
                  <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-2">Items</p>
                  <div className="space-y-2">
                    {detail.items.map((it, idx) => (
                      <div key={idx} className="flex gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                        {it.image && (
                          <img src={it.image} alt={it.name} className="w-14 h-14 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{it.name}</p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {it.size && `Size: ${it.size} · `}Qty: {it.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">₹{it.price * it.qty}</p>
                          <p className="text-white/30 text-[10px]">₹{it.price} × {it.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Totals */}
                <section className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-1 text-sm">
                  <div className="flex justify-between text-white/70"><span>Subtotal</span><span>₹{detail.subtotal}</span></div>
                  <div className="flex justify-between text-white/70"><span>Delivery</span><span>₹{detail.delivery_fee || 0}</span></div>
                  <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
                    <span>Total</span>
                    <span className="text-[#e94560]"><IndianRupee className="w-3.5 h-3.5 inline" />{detail.total}</span>
                  </div>
                  <p className="text-xs text-white/40 pt-1">
                    Payment: {detail.payment_method || '—'}{detail.paid_at ? ` · Paid ${new Date(detail.paid_at).toLocaleString()}` : ''}
                  </p>
                </section>

                {/* Shiprocket */}
                <section className="p-3 rounded-lg border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">Shiprocket</p>
                    {detail.shiprocket?.status && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/60">{detail.shiprocket.status}</span>
                    )}
                  </div>
                  {detail.shiprocket?.order_id ? (
                    <div className="text-xs text-white/60 space-y-1">
                      <p>SR Order: <span className="text-white/80">{detail.shiprocket.order_id}</span></p>
                      {detail.shiprocket.shipment_id && <p>Shipment: <span className="text-white/80">{detail.shiprocket.shipment_id}</span></p>}
                      {detail.shiprocket.awb_code && <p>AWB: <span className="text-white/80">{detail.shiprocket.awb_code}</span></p>}
                      {detail.shiprocket.courier_name && <p>Courier: <span className="text-white/80">{detail.shiprocket.courier_name}</span></p>}
                      {detail.shiprocket.tracking_url && (
                        <a href={detail.shiprocket.tracking_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#e94560] hover:underline">
                          Track shipment <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Not yet sent to Shiprocket.</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!detail.shiprocket?.order_id && (
                      <Button icon={Send} loading={busy} onClick={() => shipOrder(detail._id)}
                        disabled={detail.status === 'pending'}>
                        Push to Shiprocket
                      </Button>
                    )}
                    {detail.shiprocket?.order_id && (
                      <Button icon={RefreshCw} loading={busy} onClick={() => trackOrder(detail._id)}>
                        Sync tracking
                      </Button>
                    )}
                    {detail.shiprocket?.order_id && detail.shiprocket.status !== 'cancelled' && (
                      <Button icon={Ban} variant="danger" loading={busy} onClick={() => cancelShip(detail._id)}>
                        Cancel on SR
                      </Button>
                    )}
                  </div>
                  {detail.status === 'pending' && (
                    <p className="text-[11px] text-amber-400/80">Mark order as <em>paid</em> before pushing to Shiprocket.</p>
                  )}
                </section>

                {/* NimbusPost */}
                <section className="p-3 rounded-lg border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#6366f1] font-semibold uppercase tracking-wider">NimbusPost</p>
                    {detail.nimbuspost?.status && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/60">{detail.nimbuspost.status}</span>
                    )}
                  </div>
                  {detail.nimbuspost?.order_id || detail.nimbuspost?.awb_code ? (
                    <div className="text-xs text-white/60 space-y-1">
                      {detail.nimbuspost.order_id && <p>NP Order: <span className="text-white/80">{detail.nimbuspost.order_id}</span></p>}
                      {detail.nimbuspost.awb_code && <p>AWB: <span className="text-white/80">{detail.nimbuspost.awb_code}</span></p>}
                      {detail.nimbuspost.courier_name && <p>Courier: <span className="text-white/80">{detail.nimbuspost.courier_name}</span></p>}
                      {detail.nimbuspost.tracking_url && (
                        <a href={detail.nimbuspost.tracking_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#6366f1] hover:underline">
                          Track shipment <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Not yet sent to NimbusPost.</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!detail.nimbuspost?.order_id && !detail.nimbuspost?.awb_code && (
                      <Button icon={Send} loading={busy} onClick={() => pushNimbus(detail._id)}
                        disabled={detail.status === 'pending' || !!detail.shiprocket?.order_id}>
                        Push to NimbusPost
                      </Button>
                    )}
                    {detail.nimbuspost?.awb_code && (
                      <Button icon={RefreshCw} loading={busy} onClick={() => trackNimbus(detail._id)}>
                        Sync tracking
                      </Button>
                    )}
                    {detail.nimbuspost?.awb_code && detail.nimbuspost.status !== 'cancelled' && (
                      <Button icon={Ban} variant="danger" loading={busy} onClick={() => cancelNimbus(detail._id)}>
                        Cancel on NP
                      </Button>
                    )}
                  </div>
                  {detail.shiprocket?.order_id && (
                    <p className="text-[11px] text-amber-400/80">Order is already on Shiprocket. Cancel there first before re-routing to NimbusPost.</p>
                  )}
                </section>

                {/* Status controls */}
                <section>
                  <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-2">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['paid', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'pending'].map((s) => (
                      <button
                        key={s}
                        disabled={busy || detail.status === s}
                        onClick={() => updateStatus(detail._id, s)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer
                          ${detail.status === s
                            ? 'bg-[#e94560] text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'}
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// ── Analytics sub-view ──────────────────────────────────────────────────

function AnalyticsView({ stats, loading }) {
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!stats) {
    return (
      <GlassCard className="p-12 text-center">
        <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40">No analytics data yet.</p>
      </GlassCard>
    );
  }

  const { totals = {}, statusCounts = {}, statusRevenue = {}, series = [], top_products = [] } = stats;
  const orderSeries = series.map((d) => ({
    label: d.date.slice(5),
    value: d.orders,
  }));
  const revenueSeries = series.map((d) => ({
    label: d.date.slice(5),
    value: d.revenue,
  }));
  const rupees = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  const statusRows = Object.keys(statusCounts).length
    ? Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        revenue: statusRevenue[status] || 0,
      }))
    : [];

  const totalForShare = statusRows.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={totals.total_orders || 0} icon={ShoppingCart} color="#3b82f6" />
        <StatsCard title="Paid Orders" value={totals.paid_count || 0} icon={CheckCircle2} color="#10b981" />
        <StatsCard title="Revenue" value={rupees(totals.total_revenue)} icon={DollarSign} color="#e94560" />
        <StatsCard title="Avg Order Value" value={rupees(totals.avg_order_value)} icon={TrendingUp} color="#8b5cf6" />
      </div>

      {/* Daily charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">Orders per day</h3>
              <p className="text-xs text-white/40">Across last {stats.window_days || 30} days</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#e94560]" />
          </div>
          <MiniChart data={orderSeries} color="#e94560" variant="line" />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">Revenue per day</h3>
              <p className="text-xs text-white/40">Paid / shipped / delivered</p>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <MiniChart
            data={revenueSeries}
            color="#10b981"
            variant="bar"
            formatValue={rupees}
          />
        </GlassCard>
      </div>

      {/* Status breakdown + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" /> Orders by status
          </h3>
          {statusRows.length === 0 ? (
            <p className="text-white/40 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {statusRows.map((row) => {
                const share = Math.round((row.count / totalForShare) * 100);
                return (
                  <div key={row.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-white/70">{row.status}</span>
                      <span className="text-white/60">
                        {row.count} · <span className="text-white/40">{rupees(row.revenue)}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${share}%`, backgroundColor: STATUS_COLORS[row.status] || '#e94560' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-white/40" /> Top products
          </h3>
          {top_products.length === 0 ? (
            <p className="text-white/40 text-sm">Not enough paid orders yet.</p>
          ) : (
            <div className="space-y-2">
              {top_products.map((p, i) => (
                <div key={p._id || i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#e94560]/20 text-[#e94560] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-white text-sm truncate">{p.name || p._id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">{p.units} sold</p>
                    <p className="text-white/40 text-xs">{rupees(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
