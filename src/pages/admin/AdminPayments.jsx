import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gift, Trophy, Award, Users, Store, Settings,
  BarChart3, Package, UserCheck, Wallet, Eye, X, Trash2,
  Phone, User, Store as StoreIcon, CheckCircle, Clock, ImageIcon,
  ShoppingBag, Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Spinner from '../../components/ui/Spinner';
import TableToolbar from '../../components/ui/TableToolbar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
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

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewImage, setViewImage] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [confirmState, setConfirmState] = useState(null); // {type, payment?}
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Compose a unique key across the merged merchant+promoter payment list.
  const rowKey = (p) => `${p.type}:${p._id}`;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data?.data?.payments || []);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (p) => {
    const key = rowKey(p);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const PAYMENT_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'type', label: 'Type' },
    { key: 'shop_name', label: 'Shop' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'amount', label: 'Amount', export: (v) => (v ? `₹${v}` : '') },
    { key: 'payment_status', label: 'Payment Status' },
    { key: 'status', label: 'Account Status' },
    { key: 'onboarded_by', label: 'Onboarded By' },
    { key: 'created_at', label: 'Date', export: (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '') },
  ];

  const askDeleteSingle = (p) => setConfirmState({ type: 'single', payment: p });
  const askDeleteSelected = () => selectedKeys.size > 0 && setConfirmState({ type: 'selected' });
  const askDeleteAll = () => setConfirmState({ type: 'all' });

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === 'single') {
        const p = confirmState.payment;
        await api.delete(`/admin/payments/${p._id}?type=${p.type}`);
        toast.success('Payment screenshot cleared');
      } else if (confirmState.type === 'selected') {
        const items = Array.from(selectedKeys).map((k) => {
          const [type, id] = k.split(':');
          return { type, id };
        });
        await api.post('/admin/payments/bulk-delete', { items });
        toast.success(`Cleared ${items.length} screenshots`);
        setSelectedKeys(new Set());
      } else if (confirmState.type === 'all') {
        await api.delete('/admin/payments');
        toast.success('All screenshots cleared');
        setSelectedKeys(new Set());
      }
      setConfirmState(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Payment Screenshots</h1>
          <p className="text-sm text-white/40 mt-1">View payment proof uploaded during registration</p>
        </motion.div>

        {/* Type filter tabs */}
        <div className="flex gap-2">
          {['all', 'merchant', 'promoter'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filter === f
                  ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
              }`}
            >
              {f === 'all' ? 'All' : f === 'merchant' ? 'Merchants' : 'Promoters'}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, phone, or shop..."
          totalCount={filtered.length}
          selectedCount={selectedKeys.size}
          onExportCSV={() => exportToCSV(PAYMENT_COLUMNS, filtered, 'payments')}
          onExportPDF={() => exportToPDF(PAYMENT_COLUMNS, filtered, 'payments', 'Payment Screenshots')}
          onDeleteAll={askDeleteAll}
          onDeleteSelected={askDeleteSelected}
        />

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No payment screenshots found</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p, idx) => {
              const key = rowKey(p);
              const isSelected = selectedKeys.has(key);
              return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <GlassCard className={`p-4 ${isSelected ? 'ring-2 ring-[#e94560]/60' : ''}`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Selection checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(p)}
                      className={`self-start flex-shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center mt-1 cursor-pointer
                        ${isSelected ? 'bg-[#e94560] border-[#e94560]' : 'bg-transparent border-white/30 hover:border-white/60'}`}
                      aria-label="Select payment"
                    >
                      {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                    </button>

                    {/* Screenshot thumbnail */}
                    <button
                      onClick={() => setViewImage(p.screenshot)}
                      className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer hover:border-[#e94560]/40 transition-colors group"
                    >
                      <img
                        src={p.screenshot}
                        alt="Payment proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.type === 'merchant'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {p.type === 'merchant' ? <StoreIcon className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {p.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.payment_status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {p.payment_status}
                        </span>
                      </div>

                      <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>
                        {p.shop_name && <span className="flex items-center gap-1"><StoreIcon className="w-3 h-3" />{p.shop_name}</span>}
                        {p.employee_id && <span>ID: {p.employee_id}</span>}
                        {p.amount > 0 && <span className="text-[#e94560] font-medium">₹{p.amount}</span>}
                      </div>
                      <div className="flex gap-x-4 mt-1.5 text-[11px] text-white/30">
                        <span>By: {p.onboarded_by}</span>
                        <span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* View + Delete buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewImage(p.screenshot)}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                        title="View screenshot"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => askDeleteSingle(p)}
                        className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/70 hover:text-red-300 hover:border-red-500/40 transition-all cursor-pointer"
                        title="Delete screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
              );
            })}
          </div>
        )}

        {/* Image Lightbox */}
        <AnimatePresence>
          {viewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setViewImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-3xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewImage(null)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={viewImage}
                  alt="Payment Screenshot"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border border-white/10"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={Boolean(confirmState)}
          title={
            confirmState?.type === 'all'
              ? 'Clear ALL payment screenshots?'
              : confirmState?.type === 'selected'
                ? `Clear ${selectedKeys.size} selected screenshots?`
                : 'Clear this screenshot?'
          }
          message={
            confirmState?.type === 'all'
              ? 'This will clear the uploaded payment screenshot on every merchant and promoter record. The accounts themselves are NOT deleted. This cannot be undone.'
              : confirmState?.type === 'selected'
                ? `This will clear the payment screenshot on ${selectedKeys.size} selected ${selectedKeys.size === 1 ? 'record' : 'records'}. The account itself is not deleted.`
                : 'This will clear the payment screenshot on this record. The account itself is not deleted.'
          }
          confirmLabel={confirmState?.type === 'all' ? 'Yes, Clear Everything' : 'Clear'}
          loading={confirmLoading}
          onConfirm={runConfirm}
          onCancel={() => !confirmLoading && setConfirmState(null)}
        />
      </div>
    </DashboardLayout>
  );
}
