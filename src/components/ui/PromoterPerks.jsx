import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Repeat,
  TrendingUp,
  Award,
  Users,
  LayoutDashboard,
  Gift,
  Crown,
} from 'lucide-react';

const PERKS = [
  {
    icon: Gift,
    title: '100 Free Merchant Onboarding Credits',
    desc: 'Start onboarding shops the moment you register — no pack purchase required.',
  },
  {
    icon: BadgeCheck,
    title: 'One-Time Onboarding Commission',
    desc: 'Earn a flat commission on every merchant pack price when you bring a shop onto Zxcom.',
  },
  {
    icon: Repeat,
    title: 'Recurring Monthly Commission',
    desc: "Keep earning every month from each merchant's active subscription — as long as they stay subscribed.",
  },
  {
    icon: Crown,
    title: 'Area Manager Override',
    desc: 'Hit your rank targets to unlock an additional override on merchants your sub-promoters onboard.',
  },
  {
    icon: Award,
    title: 'Rank Up to Area Manager',
    desc: 'Hit promoter and shopkeeper targets to unlock the area-manager override slab.',
  },
  {
    icon: LayoutDashboard,
    title: 'Network Dashboard',
    desc: 'Track your merchants, sub-promoters, and earnings in real time.',
  },
];

/**
 * PromoterPerks — sales pitch / benefits section shown on promoter signup.
 * Lists what a promoter unlocks at self-registration.
 */
export default function PromoterPerks() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e94560]/20 bg-gradient-to-br from-[#e94560]/10 via-[#e94560]/5 to-transparent p-5">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#e94560]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e94560]/15 border border-[#e94560]/30 text-[10px] font-bold uppercase tracking-wider text-[#e94560] mb-2">
            <BadgeCheck className="w-3 h-3" />
            Free to Join
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
            Become a{' '}
            <span className="bg-gradient-to-r from-[#e94560] to-[#ff6b81] bg-clip-text text-transparent">
              Zxcom Promoter
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            No registration fee. Get 100 merchant onboarding credits on signup and start earning from day one.
          </p>
        </div>
      </div>

      {/* Perks grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#e94560]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#e94560]">
            What You Unlock
          </p>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * idx }}
                className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#e94560]/30 transition-all"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10 border border-[#e94560]/20 flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#e94560]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/90 leading-tight">{perk.title}</p>
                  <p className="text-[11px] text-white/45 mt-0.5 leading-snug">{perk.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 text-[11px] text-white/40 px-1">
        <Users className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          Recurring commissions depend on your merchants' active subscriptions. If a merchant unsubscribes, your recurring earnings from that merchant stop — see full terms below.
        </p>
      </div>
    </div>
  );
}
