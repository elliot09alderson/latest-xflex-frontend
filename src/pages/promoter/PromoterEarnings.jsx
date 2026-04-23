import {
  LayoutDashboard,
  Users,
  Store,
  UserPlus,
  QrCode,
  IndianRupee,
  CreditCard,
  User,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PromoterWalletCard from '../../components/promoter/PromoterWalletCard';

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

export default function PromoterEarnings() {
  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Promoter Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-sm text-white/50 mt-1">
            Track your commission from merchant onboarding and recurring monthly renewals.
          </p>
        </div>
        <PromoterWalletCard />
      </div>
    </DashboardLayout>
  );
}
