import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Trophy, User,
  Mail, MapPin, Camera, Save, Store, Phone, Hash, Building2, Ruler,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import ChangePassword from '../../components/ui/ChangePassword';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import PlanInfo from '../../components/merchant/PlanInfo';

const sidebarLinks = [
  { path: '/merchant', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/merchant/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { path: '/merchant/winners', label: 'Winners', icon: <Trophy className="w-4 h-4" /> },
  { path: '/merchant/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

const shopCategories = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'general', label: 'General Store' },
  { value: 'other', label: 'Other' },
];

const shopSizes = ['SM', 'MD', 'LG', 'XL', 'XXL'];

export default function MerchantProfile() {
  const { user } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [merchant, setMerchant] = useState(null);

  const [userForm, setUserForm] = useState({ name: '', email: '', address: '', avatar: null });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const [shopForm, setShopForm] = useState({
    shop_name: '', area: '', city: '', shop_category: '', shop_size: '', gstin: '', pincode: '', shop_image: null,
  });
  const [shopImagePreview, setShopImagePreview] = useState('');
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let userData = {};
      let merchantData = {};
      try { const r = await api.get('/auth/me'); userData = r.data?.data?.user || r.data?.user || {}; } catch {}
      try { const r = await api.get('/merchants/profile'); merchantData = r.data?.data?.merchant || r.data?.merchant || {}; } catch {}

      setProfile(userData);
      setMerchant(merchantData);
      setUserForm({ name: userData.name || '', email: userData.email || '', address: userData.address || '', avatar: null });
      setAvatarPreview(fullUrl(userData.avatar_url));
      setShopForm({
        shop_name: merchantData.shop_name || '', area: merchantData.area || '', city: merchantData.city || '',
        shop_category: merchantData.shop_category || '', shop_size: merchantData.shop_size || 'MD',
        gstin: merchantData.gstin || '', pincode: merchantData.pincode || '', shop_image: null,
      });
      setShopImagePreview(fullUrl(merchantData.shop_image));
      setPageLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUserForm((prev) => ({ ...prev, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      const fd = new FormData();
      fd.append('name', userForm.name);
      fd.append('email', userForm.email);
      fd.append('address', userForm.address);
      if (userForm.avatar) fd.append('avatar', userForm.avatar);
      const res = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = res.data?.data?.user || res.data?.user;
      if (updated) {
        setProfile(updated);
        const stored = JSON.parse(localStorage.getItem('zxcom_user') || '{}');
        localStorage.setItem('zxcom_user', JSON.stringify({ ...stored, ...updated }));
      }
      toast.success('Personal info updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSavingUser(false); }
  };

  const handleShopChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setShopForm((prev) => ({ ...prev, [name]: files[0] || value }));
      if (files[0]) setShopImagePreview(URL.createObjectURL(files[0]));
    } else {
      setShopForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveShop = async () => {
    setSavingShop(true);
    try {
      const fd = new FormData();
      fd.append('shop_name', shopForm.shop_name);
      fd.append('area', shopForm.area);
      fd.append('city', shopForm.city);
      fd.append('shop_category', shopForm.shop_category);
      fd.append('shop_size', shopForm.shop_size);
      fd.append('gstin', shopForm.gstin);
      fd.append('pincode', shopForm.pincode);
      if (shopForm.shop_image) fd.append('shop_image', shopForm.shop_image);
      const res = await api.put('/merchants/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = res.data?.data?.merchant || res.data?.merchant;
      if (updated) setMerchant(updated);
      toast.success('Shop details updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSavingShop(false); }
  };

  const displayName = profile?.name || user?.name || 'Merchant';
  const displayPhone = profile?.phone || user?.phone || '';
  const shopName = merchant?.shop_name || '';
  const sizeLabel = merchant?.shop_size || 'MD';

  if (pageLoading) {
    return (
      <DashboardLayout sidebarLinks={sidebarLinks} title="Merchant">
        <div className="flex items-center justify-center py-32"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Merchant">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-white/40 mt-1">Manage your account and shop details</p>
        </motion.div>

        {/* ── HEADER CARD ── */}
        <GlassCard className="overflow-hidden">
          {/* Banner with shop image */}
          <div className="relative h-32 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
            {shopImagePreview && (
              <img src={shopImagePreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {/* Shop size badge */}
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-lg bg-[#e94560]/20 border border-[#e94560]/30 text-[#e94560] text-xs font-bold tracking-wider">
                {sizeLabel}
              </span>
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar overlapping banner */}
            <div className="flex items-end gap-4 -mt-10 relative z-10">
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#0a0a1a] bg-white/10 shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e94560] to-[#c23616]">
                      <span className="text-2xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="pb-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{shopName || displayName}</h2>
                <p className="text-sm text-white/40">{displayName} &middot; {displayPhone}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge text="Merchant" variant="info" />
              {merchant?.status && <Badge text={merchant.status} variant={merchant.status === 'active' ? 'success' : 'warning'} />}
              {merchant?.payment_status && <Badge text={merchant.payment_status} variant={merchant.payment_status === 'paid' ? 'success' : 'warning'} />}
              {merchant?.shop_category && <Badge text={merchant.shop_category} variant="default" />}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
              {[
                { label: 'Area', value: merchant?.area || '-' },
                { label: 'City', value: merchant?.city || '-' },
                { label: 'Pincode', value: merchant?.pincode || '-' },
                { label: 'GSTIN', value: merchant?.gstin || '-' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-white font-medium truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Submissions bar */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/40">Monthly Submissions</span>
                <span className="text-white font-medium">{merchant?.current_month_submissions ?? 0} / {merchant?.monthly_submission_cap ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${merchant?.monthly_submission_cap ? Math.min(((merchant?.current_month_submissions || 0) / merchant.monthly_submission_cap) * 100, 100) : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#e94560] to-[#c23616]"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ── PLAN + QR ── */}
        <PlanInfo />

        {/* ── EDIT FORMS SIDE BY SIDE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <GlassCard className="p-5 space-y-4">
            <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">Personal Details</p>
            <Input label="Full Name" name="name" icon={User} value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Phone" name="phone" icon={Phone} value={displayPhone} disabled />
            <Input label="Email" name="email" type="email" icon={Mail} placeholder="you@email.com" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Address" name="address" icon={MapPin} placeholder="Your address" value={userForm.address} onChange={(e) => setUserForm((f) => ({ ...f, address: e.target.value }))} />
            <Button fullWidth icon={Save} loading={savingUser} onClick={handleSaveUser}>Save Personal Info</Button>
          </GlassCard>

          {/* Shop Details */}
          <GlassCard className="p-5 space-y-4">
            <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">Shop Details</p>
            <Input label="Shop Name" name="shop_name" icon={Store} value={shopForm.shop_name} onChange={handleShopChange} />

            <FileUpload label="Shop Image" name="shop_image" accept="image/*" preview onChange={handleShopChange} />

            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" name="shop_category" options={shopCategories} value={shopForm.shop_category} onChange={handleShopChange} />
              <Input label="GSTIN" name="gstin" icon={Hash} placeholder="Optional" value={shopForm.gstin} onChange={handleShopChange} />
            </div>

            {/* Shop Size */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/80">Shop Size</label>
              <div className="flex gap-2">
                {shopSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setShopForm((prev) => ({ ...prev, shop_size: size }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                      shopForm.shop_size === size
                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input label="Pincode" name="pincode" icon={MapPin} value={shopForm.pincode} onChange={handleShopChange} />
              <Input label="Area" name="area" icon={MapPin} value={shopForm.area} onChange={handleShopChange} />
              <Input label="City" name="city" icon={Building2} value={shopForm.city} onChange={handleShopChange} />
            </div>

            <Button fullWidth icon={Save} loading={savingShop} onClick={handleSaveShop}>Save Shop Details</Button>
          </GlassCard>
        </div>

        {/* Change Password */}
        <ChangePassword />
      </div>
    </DashboardLayout>
  );
}
