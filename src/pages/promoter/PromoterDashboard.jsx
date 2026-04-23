import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  QrCode,
  IndianRupee,
  CreditCard,
  User,
  UserPlus,
  Store,
  Shield,
  Copy,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/ui/StatsCard';
import GlassCard from '../../components/ui/GlassCard';
import Spinner from '../../components/ui/Spinner';
import AreaManagerProgress from '../../components/promoter/AreaManagerProgress';
import NetworkTabs from '../../components/promoter/NetworkTabs';
import DashboardBanners from '../../components/ui/DashboardBanners';

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

export default function PromoterDashboard() {
  const { data: profileData, loading: profileLoading } = useFetch('/promoters/profile');
  const { data: earningsData } = useFetch('/promoters/earnings');
  const { data: progressData } = useFetch('/promoters/area-manager-progress');

  const promoter = profileData?.promoter || {};
  const totalEarned = earningsData?.total_earned ?? 0;
  const rank = progressData?.rank || promoter.rank || 'promoter';
  const rankDisplay = rank === 'area_manager' ? 'Area Manager' : rank.charAt(0).toUpperCase() + rank.slice(1);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Promoter Portal">
      {profileLoading ? (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          <DashboardBanners endpoint="/promoters/banners" />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/40 mt-1">
              Welcome back! Here is your promoter overview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Shops"
              value={promoter.total_shops_count ?? 0}
              icon={Store}
              color="#10b981"
            />
            <StatsCard
              title="Total Promoters"
              value={promoter.total_promoters_count ?? 0}
              icon={Users}
              color="#3b82f6"
            />
            <StatsCard
              title="Earnings"
              value={`₹${Number(totalEarned).toLocaleString('en-IN')}`}
              icon={IndianRupee}
              color="#e94560"
            />
            <StatsCard
              title="Rank"
              value={rankDisplay}
              icon={Shield}
              color="#8b5cf6"
            />
          </div>

          {/* Referral Code */}
          {promoter.referral_code && (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#e94560]/10">
                    <Link2 className="w-5 h-5 text-[#e94560]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Your Referral Code</p>
                    <p className="text-xl font-bold font-mono text-[#e94560] tracking-widest mt-0.5">
                      {promoter.referral_code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(promoter.referral_code);
                    toast.success('Referral code copied!');
                  }}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-white/30 mt-3">
                Share this code with new promoters. They&apos;ll be linked to your network when they register.
              </p>
            </GlassCard>
          )}

          <AreaManagerProgress />

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Your Network</h2>
            <NetworkTabs />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
