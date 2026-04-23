import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Pencil, Search, Lock, KeyRound, Eye, Download, Printer,
  MapPin, Phone as PhoneIcon, Mail, Hash, CreditCard, Package, QrCode,
  User, Building2, Calendar, RefreshCw, Clock, History, AlertTriangle, CheckCircle2,
  Zap, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

// Days between a date and now (positive = future, negative = past). Returns null if date falsy.
const daysFromNow = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

export default function MerchantManager() {
  const { data, loading, error, refetch } = useFetch('/admin/merchants');

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ shop_name: '', area: '', city: '', plan_type: '', status: '', payment_status: '' });
  const [saving, setSaving] = useState(false);

  // Detail modal
  const [detailMerchant, setDetailMerchant] = useState(null);

  // Renew modal
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [packs, setPacks] = useState([]);
  const [packsLoading, setPacksLoading] = useState(false);
  const [renewForm, setRenewForm] = useState({ pack_id: '', payment_mode: 'offline', razorpay_payment_id: '', note: '' });
  const [renewing, setRenewing] = useState(false);

  // Filter: only active subscribers (admin-requested view)
  const [filterActive, setFilterActive] = useState(false);

  // Password
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Bulk customer-submission credit state
  const [showBulkCredit, setShowBulkCredit] = useState(false);
  const [bulkSubmissionCredits, setBulkSubmissionCredits] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const merchants = (data?.merchants || []).map((m) => {
    const days = daysFromNow(m.plan_end_date);
    const isExpired = days !== null && days <= 0;
    return {
      ...m,
      owner_name: m.user_id?.name || '',
      phone: m.user_id?.phone || '',
      email: m.user_id?.email || '',
      address: m.user_id?.address || '',
      avatar_url: m.user_id?.avatar_url || '',
      promoter_name: m.onboarded_by_promoter_id?.name || '',
      promoter_phone: m.onboarded_by_promoter_id?.phone || '',
      qr_code: m.assigned_qr_code_id?.code || '',
      qr_image_url: m.assigned_qr_code_id?.qr_image_url || '',
      pack_name: m.pack_id?.name || '',
      pack_duration_days: m.pack_id?.duration_days || null,
      days_remaining: days,
      is_expired: isExpired,
    };
  });

  // Admin-facing "active subscribers" filter — only show merchants that are
  // marked active AND whose subscription window has not yet expired.
  const visibleMerchants = filterActive
    ? merchants.filter((m) => m.status === 'active' && !m.is_expired)
    : merchants;

  const activeCount = merchants.filter((m) => m.status === 'active' && !m.is_expired).length;

  const handleDelete = async (row) => {
    try {
      await api.delete(`/admin/merchants/${row._id}`);
      toast.success('Merchant deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };
  const handleBulkDelete = async (rows) => {
    try {
      await api.post('/admin/merchants/bulk-delete', { ids: rows.map((r) => r._id) });
      toast.success(`Deleted ${rows.length} merchants`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };
  const handleDeleteAll = async () => {
    try {
      await api.delete('/admin/merchants');
      toast.success('All merchants deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete all failed');
    }
  };

  const handleBulkRecharge = async () => {
    const amount = Number(bulkSubmissionCredits) || 0;
    if (amount <= 0) {
      toast.error('Enter a positive number');
      return;
    }
    if (!window.confirm(
      `Grant +${amount} customer-form credits to every active merchant (${activeCount}).\n\n` +
      'Each merchant\'s monthly submission cap will be bumped by this amount.\nContinue?'
    )) return;
    setBulkSubmitting(true);
    try {
      const { data: res } = await api.post('/admin/merchants/bulk-recharge', {
        submission_credits: amount,
      });
      const info = res?.data || res;
      toast.success(`Applied to ${info.modified ?? info.matched ?? 0} merchants`);
      setBulkSubmissionCredits('');
      setShowBulkCredit(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk recharge failed');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const openEdit = (m) => {
    setEditId(m._id);
    setEditForm({
      shop_name: m.shop_name || '',
      area: m.area || '',
      city: m.city || '',
      plan_type: m.plan_type || '',
      status: m.status || '',
      payment_status: m.payment_status || '',
    });
    setEditModalOpen(true);
  };

  // Open the renew modal for a merchant and (lazily) load shopkeeper packs.
  // Admin-side renewal is offline-only — Razorpay-verified renewals happen
  // on the merchant dashboard. Admin uses this to record cash/UPI payments
  // received out-of-band.
  const openRenew = async (m) => {
    setRenewTarget(m);
    setRenewForm({
      pack_id: m.pack_id?._id || m.pack_id || '',
      payment_mode: 'offline',
      razorpay_payment_id: '',
      note: '',
    });
    setRenewModalOpen(true);
    if (packs.length === 0) {
      setPacksLoading(true);
      try {
        const { data: res } = await api.get('/admin/packs');
        const list = (res?.data?.packs || res?.packs || [])
          .filter((p) => p.target_type === 'shopkeeper' && p.status === 'active');
        setPacks(list);
        setRenewForm((f) => ({ ...f, pack_id: f.pack_id || list[0]?._id || '' }));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load packs');
      } finally {
        setPacksLoading(false);
      }
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!renewForm.pack_id) { toast.error('Select a pack'); return; }
    setRenewing(true);
    try {
      const body = {
        pack_id: renewForm.pack_id,
        payment_mode: 'offline',
        razorpay_payment_id: renewForm.razorpay_payment_id || undefined,
        note: renewForm.note || undefined,
      };
      const { data: res } = await api.post(`/admin/merchants/${renewTarget._id}/renew`, body);
      toast.success('Subscription renewed');
      setRenewModalOpen(false);
      setRenewTarget(null);
      // Keep detail modal in sync if it's open on this merchant
      const updated = res?.data?.merchant || res?.merchant;
      if (updated && detailMerchant?._id === updated._id) {
        setDetailMerchant((prev) => ({ ...prev, ...updated, days_remaining: daysFromNow(updated.plan_end_date) }));
      }
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  };

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/merchants/${editId}`, editForm);
      toast.success('Merchant updated');
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  }, [editForm, editId, refetch]);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const userId = detailMerchant?.user_id?._id || detailMerchant?.user_id;
      await api.put(`/admin/users/${userId}/password`, { new_password: newPassword });
      toast.success('Password changed');
      setNewPassword('');
      setShowPasswordChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPassword(false); }
  };

  const handleDownloadQR = async (m) => {
    const imgUrl = fullUrl(m.qr_image_url);
    if (!imgUrl) { toast.error('QR not available'); return; }
    try {
      const resp = await fetch(imgUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${m.shop_name || m.qr_code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch { toast.error('Download failed'); }
  };

  const handlePrintQR = (m) => {
    const imgUrl = fullUrl(m.qr_image_url);
    if (!imgUrl) { toast.error('QR not available'); return; }
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>QR - ${m.shop_name}</title>
      <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:sans-serif;}
      .card{text-align:center;padding:30px;}img{width:300px;height:300px;}
      p{margin:8px 0 0;color:#555;font-size:14px;}.name{font-size:18px;font-weight:bold;color:#333;}</style></head>
      <body><div class="card">
      <p class="name">${m.shop_name}</p>
      <img src="${imgUrl}" />
      <p>${m.qr_code || ''}</p>
      </div></body></html>
    `);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  const getStatusVariant = (s) => ({ active: 'success', inactive: 'danger', pending: 'warning' }[s?.toLowerCase()] || 'default');

  const columns = [
    { key: 'shop_name', label: 'Shop Name' },
    { key: 'owner_name', label: 'Owner' },
    { key: 'phone', label: 'Phone' },
    { key: 'area', label: 'Area' },
    {
      key: 'plan_type', label: 'Plan',
      render: (val) => val ? <Badge text={val} variant={val === 'premium' ? 'warning' : 'default'} /> : '-',
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge text={val || 'N/A'} variant={getStatusVariant(val)} />,
    },
    {
      key: 'payment_status', label: 'Payment',
      render: (val) => <Badge text={val || 'N/A'} variant={val === 'paid' ? 'success' : 'warning'} />,
    },
    {
      key: 'plan_end_date', label: 'Expires',
      render: (val, row) => {
        if (!val) return <span className="text-white/30">—</span>;
        const d = row.days_remaining;
        const expired = row.is_expired;
        return (
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-white/80">{fmtDate(val)}</span>
            <span className={`text-[10px] ${expired ? 'text-red-400' : d <= 7 ? 'text-amber-400' : 'text-white/40'}`}>
              {expired ? 'Expired' : `${d} day${d === 1 ? '' : 's'} left`}
            </span>
          </div>
        );
      },
    },
    { key: 'promoter_name', label: 'Onboarded By', render: (val) => val || '-' },
    {
      key: 'actions', label: 'Actions', exportable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setDetailMerchant(row)} className="p-1.5 rounded-lg text-white/50 hover:text-blue-400 hover:bg-blue-400/10 transition-all cursor-pointer" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-white/50 hover:text-amber-400 hover:bg-amber-400/10 transition-all cursor-pointer" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => openRenew(row)} className="p-1.5 rounded-lg text-white/50 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all cursor-pointer" title="Renew Subscription">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;

  const m = detailMerchant;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#e94560]/10"><Store className="w-5 h-5 text-[#e94560]" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Merchants</h2>
            <p className="text-xs text-white/40">
              {merchants.length} total · <span className="text-emerald-400">{activeCount} active subscriber{activeCount === 1 ? '' : 's'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={Zap} size="sm" onClick={() => setShowBulkCredit(true)}>
            Bulk Credit All
          </Button>
          <button
            onClick={() => setFilterActive((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              filterActive
                ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="Only show merchants whose subscription is currently active"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {filterActive ? 'Showing Active Subscribers' : 'Show Only Active Subscribers'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={visibleMerchants}
          title="Merchants"
          exportFilename="merchants"
          searchable
          searchFields={['shop_name', 'owner_name', 'area', 'city', 'phone', 'gstin']}
          searchPlaceholder="Search by shop, owner, area, phone, GSTIN..."
          exportable
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          emptyMessage={filterActive ? 'No active subscribers match the filter.' : "No merchants yet. They'll appear here once onboarded."}
        />
      )}

      {/* ── DETAIL MODAL ── */}
      <Modal
        isOpen={!!detailMerchant}
        onClose={() => { setDetailMerchant(null); setShowPasswordChange(false); setNewPassword(''); }}
        title="Merchant Details"
        size="lg"
      >
        {m && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                {m.avatar_url ? (
                  <img src={fullUrl(m.avatar_url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white/40">{(m.owner_name || 'M').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{m.shop_name}</h3>
                <p className="text-sm text-white/40">{m.owner_name} &middot; {m.phone}</p>
              </div>
            </div>

            {/* Shop Image */}
            {m.shop_image && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img src={fullUrl(m.shop_image)} alt="Shop" className="w-full max-h-48 object-cover" />
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: PhoneIcon, label: 'Phone', value: m.phone },
                { icon: Mail, label: 'Email', value: m.email || '-' },
                { icon: MapPin, label: 'Area', value: m.area || '-' },
                { icon: Building2, label: 'City', value: m.city || '-' },
                { icon: MapPin, label: 'Pincode', value: m.pincode || '-' },
                { icon: Hash, label: 'GSTIN', value: m.gstin || '-' },
                { icon: Package, label: 'Plan', value: m.plan_type || '-' },
                { icon: CreditCard, label: 'Plan Price', value: m.plan_price ? `₹${m.plan_price}` : '-' },
                { icon: Store, label: 'Category', value: m.shop_category || '-' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="w-3 h-3 text-white/30" />
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Status Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Status:</span>
                <Badge text={m.status || 'N/A'} variant={getStatusVariant(m.status)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Payment:</span>
                <Badge text={m.payment_status || 'N/A'} variant={m.payment_status === 'paid' ? 'success' : 'warning'} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Submissions:</span>
                <span className="text-sm text-white font-medium">{m.current_month_submissions ?? 0} / {m.monthly_submission_cap ?? 0}</span>
              </div>
            </div>

            {/* ── Subscription Section ── */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#e94560]" />
                  <p className="text-sm font-semibold text-white">Subscription</p>
                  {m.is_expired ? (
                    <Badge text="Expired" variant="danger" />
                  ) : m.days_remaining !== null && m.days_remaining <= 7 ? (
                    <Badge text="Expiring Soon" variant="warning" />
                  ) : m.days_remaining !== null ? (
                    <Badge text="Active" variant="success" />
                  ) : null}
                </div>
                <Button size="sm" icon={RefreshCw} onClick={() => openRenew(m)}>Renew</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Pack</p>
                  <p className="text-sm text-white font-medium">{m.pack_name || m.plan_type || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Plan Start</p>
                  <p className="text-sm text-white">{fmtDate(m.plan_start_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Expires</p>
                  <p className="text-sm text-white">{fmtDate(m.plan_end_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Days Left</p>
                  <p className={`text-sm font-medium ${m.is_expired ? 'text-red-400' : m.days_remaining !== null && m.days_remaining <= 7 ? 'text-amber-400' : 'text-emerald-300'}`}>
                    {m.days_remaining === null ? '—' : m.is_expired ? 'Expired' : `${m.days_remaining} day${m.days_remaining === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Renewal History ── */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-white">Renewal History</p>
                <span className="text-[10px] text-white/30">({m.renewal_history?.length || 0} entries)</span>
              </div>
              {!m.renewal_history || m.renewal_history.length === 0 ? (
                <p className="text-xs text-white/30 py-2">No payments recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-white/40 border-b border-white/5">
                        <th className="py-2 font-medium">Date</th>
                        <th className="py-2 font-medium">Pack</th>
                        <th className="py-2 font-medium">Amount</th>
                        <th className="py-2 font-medium">Period</th>
                        <th className="py-2 font-medium">Mode</th>
                        <th className="py-2 font-medium">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...m.renewal_history].reverse().map((r) => (
                        <tr key={r._id} className="border-b border-white/5 last:border-0">
                          <td className="py-2 text-white/80">{fmtDate(r.paid_at)}</td>
                          <td className="py-2 text-white/80">{r.pack_name || '—'}</td>
                          <td className="py-2 text-white font-medium">₹{r.amount}</td>
                          <td className="py-2 text-white/60">
                            {fmtDate(r.period_start)} → {fmtDate(r.period_end)}
                          </td>
                          <td className="py-2">
                            <Badge
                              text={r.payment_mode}
                              variant={r.payment_mode === 'online' ? 'success' : 'default'}
                            />
                          </td>
                          <td className="py-2 text-white/50 font-mono text-[10px] truncate max-w-[140px]" title={r.razorpay_payment_id || r.note}>
                            {r.razorpay_payment_id || r.note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Location */}
            {m.location?.lat && m.location?.lng && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Location</p>
                </div>
                <p className="text-sm text-white">{m.location.lat.toFixed(6)}, {m.location.lng.toFixed(6)}</p>
              </div>
            )}

            {/* Address */}
            {m.address && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Full Address</p>
                </div>
                <p className="text-sm text-white">{m.address}</p>
              </div>
            )}

            {/* Onboarded By */}
            {m.promoter_name && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3 h-3 text-white/30" />
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Onboarded By</p>
                </div>
                <p className="text-sm text-white">{m.promoter_name} {m.promoter_phone ? `(${m.promoter_phone})` : ''}</p>
              </div>
            )}

            {/* Joined Date */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3 text-white/30" />
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Joined</p>
              </div>
              <p className="text-sm text-white">
                {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-[#e94560]" />
                <p className="text-sm font-semibold text-white">QR Code</p>
              </div>
              {m.qr_image_url ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white rounded-xl p-3">
                    <img src={fullUrl(m.qr_image_url)} alt="QR" className="w-32 h-32 object-contain" />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-sm font-mono text-[#e94560]">{m.qr_code}</p>
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <Button variant="secondary" size="sm" icon={Download} onClick={() => handleDownloadQR(m)}>Download</Button>
                      <Button variant="secondary" size="sm" icon={Printer} onClick={() => handlePrintQR(m)}>Print</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/30">No QR code assigned</p>
              )}
            </div>

            {/* Password Change */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-orange-400" />
                  <p className="text-sm font-semibold text-white">Change Password</p>
                </div>
                {!showPasswordChange && (
                  <Button size="sm" icon={Lock} onClick={() => setShowPasswordChange(true)}>Change</Button>
                )}
              </div>
              <AnimatePresence>
                {showPasswordChange && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e94560]/60 transition-colors"
                    />
                    <Button icon={Lock} loading={changingPassword} onClick={handleChangePassword} disabled={!newPassword || newPassword.length < 4}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowPasswordChange(false); setNewPassword(''); }}>Cancel</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Merchant" size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Shop Name" name="shop_name" value={editForm.shop_name} onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Area" name="area" value={editForm.area} onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))} />
            <Input label="City" name="city" value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Plan" name="plan_type" value={editForm.plan_type} onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))}
              options={[{ value: 'basic', label: 'Basic' }, { value: 'premium', label: 'Premium' }]} />
            <Select label="Status" name="status" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))}
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <Select
            label="Payment Status"
            name="payment_status"
            value={editForm.payment_status}
            onChange={(e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
          <p className="text-[11px] text-white/40 -mt-2">
            Flipping to <span className="text-emerald-400">Paid</span> only updates the payment flag.
            To extend the subscription window with a new billing period, use the <span className="text-emerald-400">Renew</span> action instead.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Update</Button>
          </div>
        </form>
      </Modal>

      {/* ── RENEW MODAL ── */}
      <Modal
        isOpen={renewModalOpen}
        onClose={() => { setRenewModalOpen(false); setRenewTarget(null); }}
        title={`Renew Subscription${renewTarget ? ` — ${renewTarget.shop_name}` : ''}`}
        size="md"
      >
        {packsLoading ? (
          <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
        ) : packs.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/40">No active shopkeeper packs found. Create one under Packs first.</div>
        ) : (
          <form onSubmit={handleRenewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Pack</label>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {packs.map((p) => (
                  <label
                    key={p._id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      renewForm.pack_id === p._id ? 'border-[#e94560] bg-[#e94560]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pack_id"
                        value={p._id}
                        checked={renewForm.pack_id === p._id}
                        onChange={() => setRenewForm((f) => ({ ...f, pack_id: p._id }))}
                        className="accent-[#e94560]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] text-white/40">
                          {p.duration_days || 30} days · up to {p.customer_form_limit || '∞'} submissions
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">₹{p.price}</p>
                  </label>
                ))}
              </div>
            </div>
            <Input
              label="Payment Reference (optional)"
              placeholder="e.g. UPI txn ID, cheque #, razorpay_pay_id"
              value={renewForm.razorpay_payment_id}
              onChange={(e) => setRenewForm((f) => ({ ...f, razorpay_payment_id: e.target.value }))}
            />
            <Input
              label="Note (optional)"
              placeholder="e.g. Paid in cash on 12 Apr"
              value={renewForm.note}
              onChange={(e) => setRenewForm((f) => ({ ...f, note: e.target.value }))}
            />
            {renewTarget?.plan_end_date && (
              <div className="text-[11px] text-white/50 bg-white/5 border border-white/5 rounded-lg p-2.5">
                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                Current expiry: <span className="text-white">{fmtDate(renewTarget.plan_end_date)}</span>
                {renewTarget.is_expired
                  ? ' — already expired, new period starts today.'
                  : ' — new period will stack on top.'}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setRenewModalOpen(false)}>Cancel</Button>
              <Button type="submit" icon={RefreshCw} loading={renewing}>Record Payment & Renew</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk customer-submission credit modal */}
      <Modal
        isOpen={showBulkCredit}
        onClose={() => setShowBulkCredit(false)}
        title="Bulk Credit All Active Merchants"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-xs text-white/60">
            Adds customer-form submission credits on top of each active merchant's current monthly cap. Every merchant can onboard this many more customers via their QR.
          </p>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Customer-form credits per merchant</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={bulkSubmissionCredits}
              onChange={(e) => setBulkSubmissionCredits(e.target.value)}
              icon={Users}
            />
            <p className="text-[11px] text-white/40 mt-1">
              Applies to {activeCount} active merchant{activeCount === 1 ? '' : 's'}. Bumps monthly_submission_cap.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              fullWidth
              icon={Zap}
              loading={bulkSubmitting}
              onClick={handleBulkRecharge}
              disabled={!Number(bulkSubmissionCredits)}
            >
              Apply to All Active
            </Button>
            <Button variant="ghost" onClick={() => setShowBulkCredit(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
