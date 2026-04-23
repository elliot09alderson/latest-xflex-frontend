import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Crown, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import useRazorpay from '../../hooks/useRazorpay';

// Human label for a pack's duration_days — lets merchants see at a glance
// whether a plan is monthly / quarterly / yearly.
const cycleLabel = (days) => {
  const d = Number(days) || 30;
  if (d >= 360) return 'Yearly';
  if (d >= 175 && d <= 200) return 'Half-year';
  if (d >= 85 && d <= 95) return 'Quarterly';
  if (d === 30) return 'Monthly';
  return `${d} days`;
};

/**
 * Merchant-facing subscription status + renewal card.
 *
 * Props:
 *   subscription: {
 *     pack_id, pack_name, pack_price, duration_days,
 *     plan_start_date, plan_end_date, last_renewed_at,
 *     days_remaining, is_expired,
 *   }
 *   status: 'active' | 'inactive'
 *   onRenewed: () => void   // called after a successful renewal
 */
export default function SubscriptionCard({ subscription, status, onRenewed }) {
  const { initiatePayment } = useRazorpay();
  const [modalOpen, setModalOpen] = useState(false);
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const s = subscription || {};
  const endDate = s.plan_end_date ? new Date(s.plan_end_date) : null;
  const daysRemaining = s.days_remaining;
  const isExpired = s.is_expired || status === 'inactive';

  // Traffic-light state for the card border/header
  const state = useMemo(() => {
    if (isExpired || daysRemaining === 0) return 'expired';
    if (daysRemaining !== null && daysRemaining <= 7) return 'expiring';
    return 'active';
  }, [isExpired, daysRemaining]);

  const theme = {
    active:   { ring: 'border-emerald-400/30',   tint: 'bg-emerald-400/5',   dot: 'bg-emerald-400',   text: 'text-emerald-300',   icon: CheckCircle2, label: 'Active' },
    expiring: { ring: 'border-amber-400/30',     tint: 'bg-amber-400/5',     dot: 'bg-amber-400',     text: 'text-amber-300',     icon: Clock,        label: 'Expiring Soon' },
    expired:  { ring: 'border-red-500/40',       tint: 'bg-red-500/5',       dot: 'bg-red-500',       text: 'text-red-300',       icon: AlertTriangle, label: 'Expired' },
  }[state];
  const StateIcon = theme.icon;

  const openModal = async () => {
    setModalOpen(true);
    setLoadingPacks(true);
    try {
      // Public packs endpoint — merchant role can't hit /promoter/packs,
      // so we use the unauthenticated /public/packs listing with the
      // shopkeeper type filter.
      const { data } = await api.get('/public/packs?type=shopkeeper');
      const list = (data?.data?.packs || data?.packs || []).filter(
        (p) => p.target_type === 'shopkeeper' && p.status === 'active'
      );
      setPacks(list);
      // Preselect the merchant's current pack when possible
      const current = s.pack_id && list.find((p) => p._id === s.pack_id);
      setSelectedPackId(current?._id || list[0]?._id || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load packs');
      setPacks([]);
    } finally {
      setLoadingPacks(false);
    }
  };

  const handleRenew = async () => {
    const pack = packs.find((p) => p._id === selectedPackId);
    if (!pack) { toast.error('Select a pack to renew'); return; }

    setRenewing(true);
    try {
      // 1. Create a Razorpay order via our backend
      const { data: orderRes } = await api.post('/payments/create-order', {
        amount: pack.price,
        purpose: 'merchant_renewal',
        pack_id: pack._id,
      });
      const orderData = orderRes?.data || orderRes;

      // 2. Open Razorpay checkout
      await initiatePayment({
        amount: orderData.amount,
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            // 3. Backend verifies signature + extends plan_end_date + logs history
            await api.post('/merchants/renew', {
              pack_id: pack._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Subscription renewed!');
            setModalOpen(false);
            onRenewed?.();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal verification failed');
          } finally {
            setRenewing(false);
          }
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start renewal');
      setRenewing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-2xl border ${theme.ring} ${theme.tint} p-5 overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <Crown className="w-5 h-5 text-[#e94560]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Subscription</h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-current/20 ${theme.text}`}>
                  <StateIcon className="w-3 h-3" />
                  {theme.label}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                {s.pack_name || 'No active plan'}
                {s.pack_price ? ` · ₹${s.pack_price}` : ''}
                {s.duration_days ? ` · ${cycleLabel(s.duration_days)}` : ''}
              </p>
            </div>
          </div>

          <Button
            icon={RefreshCw}
            onClick={openModal}
            variant={state === 'expired' ? 'primary' : 'secondary'}
          >
            {state === 'expired' ? 'Renew Now' : 'Renew'}
          </Button>
        </div>

        {/* Expiry info strip */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3 text-white/30" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Expires On</p>
            </div>
            <p className="text-sm font-medium text-white">
              {endDate ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-white/30" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Days Remaining</p>
            </div>
            <p className={`text-sm font-medium ${theme.text}`}>
              {daysRemaining === null || daysRemaining === undefined
                ? '—'
                : isExpired ? 'Expired' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <RefreshCw className="w-3 h-3 text-white/30" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Last Renewed</p>
            </div>
            <p className="text-sm font-medium text-white">
              {s.last_renewed_at
                ? new Date(s.last_renewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>

        {state === 'expired' && (
          <div className="mt-4 text-xs text-red-300/90 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Your subscription has expired. Renew to reactivate your shop and resume receiving customer submissions.
          </div>
        )}
      </motion.div>

      {/* ── Renew Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Renew Subscription" size="md">
        {loadingPacks ? (
          <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
        ) : packs.length === 0 ? (
          <div className="text-center py-6 text-sm text-white/40">No subscription packs are currently available. Please contact support.</div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-white/50">
              Choose a pack to extend your subscription. The new period stacks on top of any remaining days.
            </p>
            <div className="space-y-2">
              {packs.map((p) => (
                <label
                  key={p._id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedPackId === p._id ? 'border-[#e94560] bg-[#e94560]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pack"
                      value={p._id}
                      checked={selectedPackId === p._id}
                      onChange={() => setSelectedPackId(p._id)}
                      className="accent-[#e94560]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#e94560] bg-[#e94560]/15 border border-[#e94560]/30 rounded-full px-2 py-0.5">
                          {cycleLabel(p.duration_days)}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40">
                        {p.duration_days || 30} days · up to {p.customer_form_limit || '∞'} submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">₹{p.price}</p>
                    <p className="text-[10px] text-white/30">
                      ≈ ₹{Math.round((Number(p.price) || 0) / ((Number(p.duration_days) || 30) / 30))}/month
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button icon={RefreshCw} loading={renewing} onClick={handleRenew}>
                Pay & Renew
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
