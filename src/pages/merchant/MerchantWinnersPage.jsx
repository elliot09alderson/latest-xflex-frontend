import { LayoutDashboard, Users, Trophy, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MerchantWinners from '../../components/merchant/MerchantWinners';

const sidebarLinks = [
  { path: '/merchant', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/merchant/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { path: '/merchant/winners', label: 'Winners', icon: <Trophy className="w-4 h-4" /> },
  { path: '/merchant/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

export default function MerchantWinnersPage() {
  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Merchant">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Winners</h1>
        <MerchantWinners />
      </div>
    </DashboardLayout>
  );
}
