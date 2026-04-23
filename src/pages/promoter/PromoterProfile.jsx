import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Store,
  QrCode,
  IndianRupee,
  CreditCard,
  User,
  Mail,
  MapPin,
  Phone,
  Camera,
  Save,
  Share2,
  Copy,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ChangePassword from '../../components/ui/ChangePassword';
import IdCardDownload from '../../components/promoter/IdCardDownload';
import EarningsPanel from '../../components/promoter/EarningsPanel';

const sidebarLinks = [
  { path: '/promoter', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/promoter/onboard-merchant', label: 'Onboard Merchant', icon: <Store size={18} /> },
  { path: '/promoter/onboard-promoter', label: 'Onboard Promoter', icon: <UserPlus size={18} /> },
  { path: '/promoter/network', label: 'Network', icon: <Users size={18} /> },
  { path: '/promoter/qr-codes', label: 'QR Codes', icon: <QrCode size={18} /> },
  { path: '/promoter/earnings', label: 'Earnings', icon: <IndianRupee size={18} /> },
  { path: '/promoter/id-card', label: 'ID Card', icon: <CreditCard size={18} /> },
  { path: '/promoter/profile', label: 'Profile', icon: <User size={18} /> },
];

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

export default function PromoterProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [promoter, setPromoter] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', address: '', avatar: null });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch full profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      // Fetch user and promoter data separately so one failure doesn't block the other
      let userData = {};
      let promoterData = {};

      try {
        const userRes = await api.get('/auth/me');
        userData = userRes.data?.data?.user || userRes.data?.user || {};
      } catch {
        // User API failed, use localStorage
      }

      try {
        const promoterRes = await api.get('/promoters/profile');
        promoterData = promoterRes.data?.data?.promoter || promoterRes.data?.promoter || {};
      } catch {
        // Promoter record may not exist yet
      }

      setProfile(userData);
      setPromoter(promoterData);
      setForm({
        name: userData.name || user?.name || '',
        email: userData.email || '',
        address: userData.address || '',
        avatar: null,
      });
      setAvatarPreview(fullUrl(userData.avatar_url));
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setForm((prev) => ({ ...prev, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('address', form.address);
      if (form.avatar) formData.append('avatar', form.avatar);

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = res.data?.data?.user || res.data?.user;
      if (updatedUser) {
        setProfile(updatedUser);
        const stored = JSON.parse(localStorage.getItem('zxcom_user') || '{}');
        localStorage.setItem('zxcom_user', JSON.stringify({ ...stored, ...updatedUser }));
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || user?.name || 'Promoter';
  const displayPhone = profile?.phone || user?.phone || '';
  const employeeId = promoter?.employee_id || '';
  const referralCode = promoter?.referral_code || displayPhone;
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`
    : '';

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const shareOnWhatsApp = () => {
    if (!referralLink) return;
    const msg = `Hi! I'd like to invite you to join ZXCOM as a promoter. Sign up using my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };

  const nativeShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ZXCOM as a Promoter',
          text: `Sign up using my referral link`,
          url: referralLink,
        });
      } catch {
        // user cancelled share — ignore
      }
    } else {
      copyReferralLink();
    }
  };
  const rank = promoter?.rank || 'promoter';
  const rankLabel = rank === 'area_manager' ? 'Area Manager' : rank.charAt(0).toUpperCase() + rank.slice(1);
  const status = promoter?.status || '';
  const paymentStatus = promoter?.payment_status || '';

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={sidebarLinks} title="Promoter Portal">
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Promoter Portal">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-white/40 mt-1">
            Manage your promoter profile and view your ID card.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <GlassCard className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white/40">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{displayName}</h3>
                  <p className="text-sm text-white/40">{displayPhone}</p>
                  {employeeId && (
                    <div className="mt-1">
                      <Badge text={`ID: ${employeeId}`} variant="info" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/5">
                <Badge text={rankLabel} variant={rank === 'area_manager' ? 'success' : 'info'} />
                {status && (
                  <Badge text={status} variant={status === 'active' ? 'success' : 'warning'} />
                )}
                {paymentStatus && (
                  <Badge text={`Payment: ${paymentStatus}`} variant={paymentStatus === 'paid' ? 'success' : 'warning'} />
                )}
              </div>

              {/* Edit form */}
              <form onSubmit={handleSave} className="space-y-4">
                <Input label="Full Name" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} icon={User} required />
                <Input label="Email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} icon={Mail} />
                <Input label="Address" name="address" placeholder="Your address" value={form.address} onChange={handleChange} icon={MapPin} />

                <div className="pt-2">
                  <Button type="submit" fullWidth icon={Save} loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </GlassCard>

            <EarningsPanel />
            <ChangePassword />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Refer a Promoter */}
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10">
                  <UserPlus className="w-5 h-5 text-[#e94560]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Refer a Promoter</h3>
                  <p className="text-xs text-white/40">
                    Share your link — they fill the form, you grow your network.
                  </p>
                </div>
              </div>

              {referralLink ? (
                <>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                    <Link2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="text-xs text-white/70 truncate flex-1" title={referralLink}>
                      {referralLink}
                    </span>
                    <button
                      type="button"
                      onClick={copyReferralLink}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                      aria-label="Copy referral link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" icon={Copy} onClick={copyReferralLink} fullWidth>
                      Copy Link
                    </Button>
                    <Button icon={Share2} onClick={typeof navigator !== 'undefined' && navigator.share ? nativeShare : shareOnWhatsApp} fullWidth>
                      {typeof navigator !== 'undefined' && navigator.share ? 'Share' : 'WhatsApp'}
                    </Button>
                  </div>

                  <p className="text-[11px] text-white/30 mt-4 leading-relaxed">
                    When someone signs up through this link, they&apos;ll be linked to you automatically.
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">
                  Your referral link will appear here once your promoter account is active.
                </p>
              )}
            </GlassCard>

            <IdCardDownload />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
