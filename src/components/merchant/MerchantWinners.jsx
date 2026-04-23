import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Award, Globe, Store } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import GlassCard from '../ui/GlassCard';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

function WinnerCard({ winner, idx }) {
  const name = winner.customer_id?.name || winner.customer_name || winner.name || 'Winner';
  const phone = winner.customer_id?.phone || winner.phone || '';
  const photo = fullUrl(winner.customer_id?.profile_photo_url || '');
  const contest = winner.contest_id?.title || winner.contest_name || winner.contest || 'Contest';
  const date = winner.selected_at || winner.date || winner.createdAt;

  return (
    <motion.div
      key={winner._id || idx}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="
        bg-white/5 backdrop-blur-xl border border-amber-500/15 rounded-2xl p-5
        shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        hover:border-amber-500/30 hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)]
        transition-all duration-300
      "
    >
      <div className="w-full h-0.5 rounded-full bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent mb-4" />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {photo ? (
            <img src={photo} alt="" className="w-10 h-10 rounded-full object-cover border border-amber-500/20" />
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          {phone && <p className="text-[11px] text-white/30">{phone}</p>}
          <p className="text-xs text-amber-400/80 mt-1 truncate">{contest}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
        <Calendar className="w-3 h-3 text-white/30" />
        <span className="text-xs text-white/40">
          {date
            ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '--'}
        </span>
      </div>
    </motion.div>
  );
}

const tabs = [
  { key: 'my', label: 'My Winners', icon: Store },
  { key: 'global', label: 'Global Winners', icon: Globe },
];

export default function MerchantWinners() {
  const [active, setActive] = useState('my');
  const { data: myData, loading: myLoading } = useFetch('/merchants/winners');
  const { data: globalData, loading: globalLoading } = useFetch('/public/winners');

  const myWinners = myData?.winners || [];
  const globalWinners = globalData?.winners || [];
  const winners = active === 'my' ? myWinners : globalWinners;
  const loading = active === 'my' ? myLoading : globalLoading;

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="relative flex border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const count = tab.key === 'my' ? myWinners.length : globalWinners.length;

          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3 text-sm font-medium
                transition-colors duration-200 cursor-pointer
                ${isActive ? 'text-amber-400' : 'text-white/50 hover:text-white/70'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}

              {count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-amber-400/15 text-amber-400' : 'bg-white/10 text-white/40'
                }`}>
                  {count}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="winner-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : winners.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title={active === 'my' ? 'No Winners from Your Shop Yet' : 'No Global Winners Yet'}
            description={active === 'my'
              ? 'Winners from your shop\'s contests will appear here.'
              : 'Published winners from all contests will appear here.'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {winners.map((winner, idx) => (
              <WinnerCard key={winner._id || idx} winner={winner} idx={idx} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
