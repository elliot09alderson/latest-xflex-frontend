import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Gift, Trophy, Award, Users, Store, Settings, BarChart3, Package,
  UserCheck, Eye, Wallet, ShoppingBag, Truck,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

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

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

export default function AdminCustomers() {
  const { data, loading, error, refetch } = useFetch('/admin/customers');
  const [selected, setSelected] = useState(null);

  const customers = (data?.customers || []).map((c) => ({
    ...c,
    merchant_name: c.merchant_id?.name || '-',
    merchant_phone: c.merchant_id?.phone || '',
    promoter_name: c.promoter_id?.name || '-',
    promoter_phone: c.promoter_id?.phone || '',
  }));

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age', render: (v) => v || '-', export: (v) => v || '' },
    {
      key: 'bill_value',
      label: 'Purchase',
      render: (v) => (v ? <Badge text={`₹${v}`} variant="warning" /> : '-'),
      export: (v) => (v ? `₹${v}` : ''),
    },
    { key: 'merchant_name', label: 'Shop' },
    { key: 'promoter_name', label: 'Promoter' },
    {
      key: 'createdAt', label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
      export: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '',
    },
    {
      key: 'actions', label: '', exportable: false,
      render: (_, row) => (
        <button onClick={() => setSelected(row)} className="p-1.5 rounded-lg text-white/50 hover:text-blue-400 hover:bg-blue-400/10 transition-all cursor-pointer">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleDelete = async (row) => {
    try {
      await api.delete(`/admin/customers/${row._id}`);
      toast.success('Customer deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async (rows) => {
    try {
      await api.post('/admin/customers/bulk-delete', { ids: rows.map((r) => r._id) });
      toast.success(`Deleted ${rows.length} customers`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await api.delete('/admin/customers');
      toast.success('All customers deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete all failed');
    }
  };

  if (loading) return <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel"><div className="flex items-center justify-center py-16"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10"><UserCheck className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-white">Customers</h2>
              <p className="text-xs text-white/40">{customers.length} total customers</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-center py-8 text-red-400 text-sm">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={customers}
            title="Customers"
            exportFilename="customers"
            searchable
            searchPlaceholder="Search by name, phone, shop, address..."
            exportable
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onDeleteAll={handleDeleteAll}
            emptyMessage="No customers yet. They'll appear here once they submit forms via QR."
          />
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Customer Details" size="md">
          {selected && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {selected.profile_photo_url ? (
                    <img src={fullUrl(selected.profile_photo_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white/40">{(selected.name || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                  <p className="text-sm text-white/40">{selected.phone}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Age', value: selected.age || '-' },
                  { label: 'Purchase', value: selected.bill_value ? `₹${selected.bill_value}` : '-' },
                  { label: 'Pincode', value: selected.pincode || '-' },
                  { label: 'Address', value: selected.address || '-' },
                  { label: 'Shop', value: selected.merchant_name },
                  { label: 'Shop Phone', value: selected.merchant_phone || '-' },
                  { label: 'Promoter', value: selected.promoter_name },
                  { label: 'Date', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Bill Image */}
              {selected.bill_image_url && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Bill Image</p>
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img src={fullUrl(selected.bill_image_url)} alt="Bill" className="w-full max-h-60 object-contain bg-white/5" />
                  </div>
                </div>
              )}

              {/* Profile Photo */}
              {selected.profile_photo_url && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Profile Photo</p>
                  <div className="rounded-xl overflow-hidden border border-white/10 w-32">
                    <img src={fullUrl(selected.profile_photo_url)} alt="Profile" className="w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
