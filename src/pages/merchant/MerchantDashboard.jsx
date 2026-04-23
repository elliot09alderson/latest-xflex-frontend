import { LayoutDashboard, Users, Trophy, User } from 'lucide-react';
import { Send, Award, Crown } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/ui/StatsCard';
import Spinner from '../../components/ui/Spinner';
import SubmissionCounter from '../../components/merchant/SubmissionCounter';
import CustomerList from '../../components/merchant/CustomerList';
import MerchantWinners from '../../components/merchant/MerchantWinners';
import SubscriptionCard from '../../components/merchant/SubscriptionCard';
import WalletCard from '../../components/merchant/WalletCard';
import DashboardBanners from '../../components/ui/DashboardBanners';

const sidebarLinks = [
  { path: '/merchant', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/merchant/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { path: '/merchant/winners', label: 'Winners', icon: <Trophy className="w-4 h-4" /> },
  { path: '/merchant/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

export default function MerchantDashboard() {
  const { data, loading, error, refetch } = useFetch('/merchants/stats');

  const stats = data || {};

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Merchant">
      {/* Stats cards row */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <DashboardBanners endpoint="/merchants/banners" />
            <SubscriptionCard
              subscription={stats.subscription}
              status={stats.status}
              onRenewed={refetch}
            />
            <WalletCard />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Customers"
                value={stats.customers ?? 0}
                icon={Users}
                color="#3b82f6"
                trend={stats.customer_trend}
              />
              <StatsCard
                title="Submissions This Month"
                value={stats.submissions ?? 0}
                icon={Send}
                color="#e94560"
                trend={stats.submission_trend}
              />
              <StatsCard
                title="Winners"
                value={stats.winners ?? 0}
                icon={Award}
                color="#f59e0b"
              />
              <StatsCard
                title="Plan Status"
                value={
                  (stats.plan || 'basic').charAt(0).toUpperCase() +
                  (stats.plan || 'basic').slice(1)
                }
                icon={Crown}
                color={stats.plan === 'premium' ? '#f59e0b' : '#3b82f6'}
              />
            </div>
          </>
        )}

        {/* Submission counter + Customer list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SubmissionCounter />
          </div>
          <div className="lg:col-span-2">
            <CustomerList />
          </div>
        </div>

        {/* Winners section */}
        <MerchantWinners />
      </div>
    </DashboardLayout>
  );
}
