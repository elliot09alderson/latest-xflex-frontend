import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Gift,
  Trophy,
  Award,
  Users,
  Store,
  Settings,
  BarChart3,
  Package,
  UserCheck,
  Wallet,
  ShoppingBag,
  Truck,
  Plus,
  Pencil,
  Trash2,
  X,
  IndianRupee,
  UserPlus,
  FileText,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
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

const emptyForm = {
  name: '',
  description: '',
  target_type: '',
  price: '',
  shopkeeper_limit: '',
  promoter_limit: '',
  customer_form_limit: '',
  duration_days: '30',
};

// Billing-cycle quick picks — mapped to duration_days when admin configures a pack.
const DURATION_PRESETS = [
  { days: 30,  label: 'Monthly',   sub: '30 days' },
  { days: 90,  label: 'Quarterly', sub: '90 days' },
  { days: 180, label: 'Half-year', sub: '180 days' },
  { days: 365, label: 'Yearly',    sub: '365 days' },
];

// Human-friendly label derived from a pack's duration_days. Used wherever we
// render pack cards / renewal options.
export const cycleLabel = (days) => {
  const d = Number(days) || 30;
  if (d >= 360) return 'Yearly';
  if (d >= 175 && d <= 200) return 'Half-year';
  if (d >= 85 && d <= 95) return 'Quarterly';
  if (d === 30) return 'Monthly';
  return `${d} days`;
};

export default function AdminPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmState, setConfirmState] = useState(null); // {type, id?}
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchPacks = async () => {
    try {
      const res = await api.get('/admin/packs');
      setPacks(res.data?.data?.packs || res.data?.packs || []);
    } catch {
      toast.error('Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPacks(); }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setEditingPack(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (pack) => {
    setEditingPack(pack);
    setForm({
      name: pack.name,
      description: pack.description || '',
      target_type: pack.target_type,
      price: pack.price.toString(),
      shopkeeper_limit: (pack.shopkeeper_limit || 0).toString(),
      promoter_limit: (pack.promoter_limit || 0).toString(),
      customer_form_limit: (pack.customer_form_limit || 0).toString(),
      duration_days: (pack.duration_days || 30).toString(),
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.target_type) {
      toast.error('Name, price, and target type are required');
      return;
    }

    if (form.target_type === 'promoter' && (!form.shopkeeper_limit && !form.promoter_limit)) {
      toast.error('Set at least one limit for promoter pack');
      return;
    }

    if (form.target_type === 'shopkeeper' && !form.customer_form_limit) {
      toast.error('Customer form limit is required for shopkeeper pack');
      return;
    }

    const duration = Number(form.duration_days);
    if (!duration || duration <= 0) {
      toast.error('Pack duration is required (days)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        target_type: form.target_type,
        price: Number(form.price),
        shopkeeper_limit: Number(form.shopkeeper_limit) || 0,
        promoter_limit: Number(form.promoter_limit) || 0,
        customer_form_limit: Number(form.customer_form_limit) || 0,
        duration_days: Number(form.duration_days) || 30,
      };

      if (editingPack) {
        await api.put(`/admin/packs/${editingPack._id}`, payload);
        toast.success('Pack updated');
      } else {
        await api.post('/admin/packs', payload);
        toast.success('Pack created');
      }

      setShowForm(false);
      fetchPacks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pack');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (packId) => setConfirmState({ type: 'single', id: packId });
  const askDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setConfirmState({ type: 'selected' });
  };
  const askDeleteAll = () => setConfirmState({ type: 'all' });

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === 'single') {
        await api.delete(`/admin/packs/${confirmState.id}`);
        toast.success('Pack deleted');
      } else if (confirmState.type === 'selected') {
        await api.post('/admin/packs/bulk-delete', { ids: Array.from(selectedIds) });
        toast.success(`Deleted ${selectedIds.size} packs`);
        setSelectedIds(new Set());
      } else if (confirmState.type === 'all') {
        await api.delete('/admin/packs');
        toast.success('All packs deleted');
        setSelectedIds(new Set());
      }
      setConfirmState(null);
      fetchPacks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStatus = async (pack) => {
    try {
      await api.put(`/admin/packs/${pack._id}`, {
        status: pack.status === 'active' ? 'inactive' : 'active',
      });
      toast.success(`Pack ${pack.status === 'active' ? 'deactivated' : 'activated'}`);
      fetchPacks();
    } catch {
      toast.error('Failed to update pack status');
    }
  };

  const filteredPacks = packs
    .filter((p) => filterType === 'all' || p.target_type === filterType)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.target_type || '').toLowerCase().includes(q)
      );
    });

  const PACK_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'target_type', label: 'Type' },
    { key: 'price', label: 'Price', export: (v) => `₹${v || 0}` },
    { key: 'duration_days', label: 'Duration (days)' },
    { key: 'shopkeeper_limit', label: 'Shopkeeper Limit' },
    { key: 'promoter_limit', label: 'Promoter Limit' },
    { key: 'customer_form_limit', label: 'Customer Forms' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Packs</h1>
          <Button icon={Plus} onClick={openCreate}>Create Pack</Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'promoter', label: 'Promoter' },
            { value: 'shopkeeper', label: 'Shopkeeper' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filterType === tab.value
                  ? 'bg-[#e94560] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar: search + export + delete all + delete selected */}
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search packs by name or description..."
          totalCount={filteredPacks.length}
          selectedCount={selectedIds.size}
          onExportCSV={() => exportToCSV(PACK_COLUMNS, filteredPacks, 'packs')}
          onExportPDF={() => exportToPDF(PACK_COLUMNS, filteredPacks, 'packs', 'Packs')}
          onDeleteAll={askDeleteAll}
          onDeleteSelected={askDeleteSelected}
        />

        {/* Create / Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {editingPack ? 'Edit Pack' : 'Create New Pack'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* Step 1: Select Type */}
                  <div>
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-3">
                      Pack Type
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm((prev) => ({ ...prev, target_type: 'promoter' }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          form.target_type === 'promoter'
                            ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20'
                            : 'border-white/10 bg-white/5 hover:border-[#e94560]/40'
                        }`}
                      >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                          <UserPlus className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-white font-semibold text-sm">Promoter</span>
                        <span className="text-white/40 text-[10px] text-center">Shopkeeper & promoter limits</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm((prev) => ({ ...prev, target_type: 'shopkeeper' }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          form.target_type === 'shopkeeper'
                            ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20'
                            : 'border-white/10 bg-white/5 hover:border-[#e94560]/40'
                        }`}
                      >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                          <Store className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-white font-semibold text-sm">Shopkeeper</span>
                        <span className="text-white/40 text-[10px] text-center">Customer form limits</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Step 2: Pack Details (shown after type selection) */}
                  {form.target_type && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-3">
                          Pack Details
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Pack Name" name="name" placeholder="e.g. Basic, Premium, Gold" icon={Package} value={form.name} onChange={updateField} required />
                        <Input label="Price (₹)" name="price" type="number" placeholder="e.g. 999" icon={IndianRupee} value={form.price} onChange={updateField} required />
                      </div>

                      {/* Billing cycle — drives pack.duration_days */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Billing cycle
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {DURATION_PRESETS.map((p) => {
                            const selected = Number(form.duration_days) === p.days;
                            return (
                              <button
                                key={p.days}
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, duration_days: String(p.days) }))}
                                className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                  selected
                                    ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                                }`}
                              >
                                <span className="text-xs font-bold uppercase tracking-wider">{p.label}</span>
                                <span className="text-[10px] text-white/40">{p.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-white/40">Custom:</span>
                          <input
                            type="number"
                            min="1"
                            name="duration_days"
                            value={form.duration_days}
                            onChange={updateField}
                            className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#e94560]/60"
                          />
                          <span className="text-[11px] text-white/40">days</span>
                        </div>
                      </div>

                      {/* Promoter-specific fields */}
                      {form.target_type === 'promoter' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">
                              Promoter Pack Limits
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Shopkeeper Limit" name="shopkeeper_limit" type="number" placeholder="Max shopkeepers this promoter can onboard" icon={Store} value={form.shopkeeper_limit} onChange={updateField} required />
                            <Input label="Promoter Limit" name="promoter_limit" type="number" placeholder="Max promoters this promoter can onboard" icon={Users} value={form.promoter_limit} onChange={updateField} required />
                          </div>
                        </motion.div>
                      )}

                      {/* Shopkeeper-specific fields */}
                      {form.target_type === 'shopkeeper' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-3">
                              Shopkeeper Pack Limits
                            </p>
                          </div>
                          <Input label="Customer Form Limit" name="customer_form_limit" type="number" placeholder="Max customer forms per month" icon={FileText} value={form.customer_form_limit} onChange={updateField} required />
                        </motion.div>
                      )}

                      <Input label="Description" name="description" placeholder="Short description (optional)" value={form.description} onChange={updateField} />

                      <Button type="submit" loading={saving} icon={editingPack ? Pencil : Plus}>
                        {editingPack ? 'Update Pack' : 'Create Pack'}
                      </Button>
                    </motion.div>
                  )}
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Packs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredPacks.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">
              {filterType === 'all'
                ? 'No packs created yet. Create your first pack above.'
                : `No ${filterType} packs found.`}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacks.map((pack) => {
              const isSelected = selectedIds.has(pack._id);
              return (
              <GlassCard key={pack._id} className={`p-5 ${isSelected ? 'ring-2 ring-[#e94560]/60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(pack._id)}
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer
                        ${isSelected ? 'bg-[#e94560] border-[#e94560]' : 'bg-transparent border-white/30 hover:border-white/60'}`}
                      aria-label="Select pack"
                    >
                      {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                    </button>
                    <div className={`p-2 rounded-xl ${pack.target_type === 'promoter' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                      {pack.target_type === 'promoter'
                        ? <UserPlus className="w-5 h-5 text-blue-400" />
                        : <Store className="w-5 h-5 text-emerald-400" />
                      }
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{pack.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          text={pack.target_type}
                          variant={pack.target_type === 'promoter' ? 'info' : 'success'}
                        />
                        <span
                          onClick={() => toggleStatus(pack)}
                          className={`text-xs font-medium cursor-pointer ${
                            pack.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {pack.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(pack)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                      title="Edit pack"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => askDelete(pack._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete pack"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-[#e94560]">₹{pack.price}</span>
                  <span className="text-xs text-white/50">/ {cycleLabel(pack.duration_days)}</span>
                </div>

                {pack.description && (
                  <p className="text-xs text-white/40 mb-3">{pack.description}</p>
                )}

                {/* Pack-specific limits */}
                {pack.target_type === 'promoter' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Shopkeeper Limit</span>
                      <span className="text-white font-medium">{pack.shopkeeper_limit || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Promoter Limit</span>
                      <span className="text-white font-medium">{pack.promoter_limit || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Customer Forms</span>
                    <span className="text-white font-medium">
                      {pack.customer_form_limit >= 999999 ? 'Unlimited' : (pack.customer_form_limit || 0)}/month
                    </span>
                  </div>
                )}
              </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={
          confirmState?.type === 'all'
            ? 'Delete ALL packs?'
            : confirmState?.type === 'selected'
              ? `Delete ${selectedIds.size} selected packs?`
              : 'Delete this pack?'
        }
        message={
          confirmState?.type === 'all'
            ? `This will permanently delete every pack (${packs.length}) from this table. Existing merchants/promoters on those packs will keep their subscription, but the packs will no longer be available for new signups. This cannot be undone.`
            : confirmState?.type === 'selected'
              ? `This will permanently delete ${selectedIds.size} selected ${selectedIds.size === 1 ? 'pack' : 'packs'}. This cannot be undone.`
              : 'This pack will be permanently deleted. This cannot be undone.'
        }
        confirmLabel={confirmState?.type === 'all' ? 'Yes, Delete Everything' : 'Delete'}
        loading={confirmLoading}
        onConfirm={runConfirm}
        onCancel={() => !confirmLoading && setConfirmState(null)}
      />
    </DashboardLayout>
  );
}
