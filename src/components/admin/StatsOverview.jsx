import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, Users, UserCheck, FileText, Activity, Trophy } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import StatsCard from '../ui/StatsCard';
import Spinner from '../ui/Spinner';

function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null) return;
    const num = Number(target) || 0;
    if (num === 0) { setCount(0); return; }

    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * num));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

function AnimatedStatsCard({ title, value, icon, color, delay, link }) {
  const animatedValue = useAnimatedCounter(value);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      onClick={() => link && navigate(link)}
      className={link ? 'cursor-pointer' : ''}
    >
      <StatsCard
        title={title}
        value={animatedValue.toLocaleString()}
        icon={icon}
        color={color}
      />
    </motion.div>
  );
}

export default function StatsOverview() {
  const { data, loading, error } = useFetch('/admin/stats');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400 text-sm">
        Failed to load stats: {error}
      </div>
    );
  }

  const stats = data || {};

  const cards = [
    { title: 'Total Merchants', key: 'totalMerchants', icon: Store, color: '#e94560', link: '/admin/merchants' },
    { title: 'Total Promoters', key: 'totalPromoters', icon: Users, color: '#6366f1', link: '/admin/promoters' },
    { title: 'Total Customers', key: 'totalCustomers', icon: UserCheck, color: '#10b981', link: '/admin/customers' },
    { title: 'Total Submissions', key: 'totalSubmissions', icon: FileText, color: '#f59e0b', link: '/admin/contests' },
    { title: 'Active Merchants', key: 'activeMerchants', icon: Activity, color: '#06b6d4', link: '/admin/merchants' },
    { title: 'Active Contests', key: 'activeContests', icon: Trophy, color: '#8b5cf6', link: '/admin/contests' },
  ];

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl font-bold text-white mb-6"
      >
        Overview
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <AnimatedStatsCard
            key={card.key}
            title={card.title}
            value={stats[card.key] ?? 0}
            icon={card.icon}
            color={card.color}
            delay={i * 0.08}
            link={card.link}
          />
        ))}
      </div>
    </div>
  );
}
