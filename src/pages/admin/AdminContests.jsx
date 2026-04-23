import { useState } from 'react';
import { motion } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ContestCreator from '../../components/admin/ContestCreator';
import ContestList from '../../components/admin/ContestList';
import Button from '../../components/ui/Button';

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

export default function AdminContests() {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [listKey, setListKey] = useState(0);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-8">
        {/* Collapsible Creator */}
        <div>
          <Button
            variant="secondary"
            icon={creatorOpen ? ChevronUp : Plus}
            onClick={() => setCreatorOpen((v) => !v)}
            className="mb-4"
          >
            {creatorOpen ? 'Hide Creator' : 'New Contest'}
          </Button>

          {creatorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ContestCreator
                onCreated={() => {
                  setCreatorOpen(false);
                  setListKey((k) => k + 1);
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Contest List */}
        <ContestList key={listKey} />
      </div>
    </DashboardLayout>
  );
}
