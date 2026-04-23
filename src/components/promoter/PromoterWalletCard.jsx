import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, BanknoteArrowUp, History, Clock, CheckCircle2,
  Store, UserPlus, RefreshCw, Info, Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

// Source → { icon, label } for the history table
const SOURCE_META = {
  merchant_onboarding:      { icon: Store,     label: 'Merchant Onboarding',   color: 'text-blue-300' },
  merchant_renewal:         { icon: RefreshCw, label: 'Monthly Renewal',       color: 'text-emerald-300' },
  sub_promoter_onboarding:  { icon: UserPlus,  label: 'Sub-Promoter',          color: 'text-purple-300' },
  area_manager_override:    { icon: Crown,     label: 'Area Manager Override', color: 'text-amber-300' },
  manual_adjustment:        { icon: Info,      label: 'Manual Adjustment',     color: 'text-amber-300' },
};

/**
 * Promoter wallet card — parallels the merchant WalletCard but sources its
 * data from /promoters/wallet and surfaces the onboarding-vs-renewal breakdown
 * so promoters can see which merchants are still paying them each month.
 */
export default function PromoterWalletCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/promoters/wallet');
      setData(res?.data || res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRequest = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt > (data?.available_for_payout || 0)) {
      toast.error('Amount exceeds available balance'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/promoters/wallet/payout-request', { amount: amt });
      toast.success('Payout requested — admin will review shortly');
      setPayoutOpen(false);
      setAmount('');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-center min-h-[140px]">
        <Spinner size="md" />
      </div>
    );
  }

  const d = data || {};
  const balance = d.wallet_balance || 0;
  const available = d.available_for_payout || 0;
  const pending = d.pending_payouts || 0;

  // Aggregate lifetime by source so we can show "X from onboarding, Y from renewals"
  const bySource = (d.commission_history || []).reduce((acc, h) => {
    const key = h.source || 'merchant_onboarding';
    acc[key] = (acc[key] || 0) + (h.amount || 0);
    return acc;
  }, {});

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#e94560]/20 bg-gradient-to-br from-[#e94560]/10 via-white/5 to-[#c23616]/5 p-5"
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#e94560]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#e94560]/15">
              <Wallet className="w-5 h-5 text-[#e94560]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Commission Wallet</h3>
              <p className="text-[11px] text-white/40">
                You earn on every merchant onboarding and every month they renew
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={History} onClick={() => setHistoryOpen(true)}>
              History
            </Button>
            <Button
              size="sm"
              icon={BanknoteArrowUp}
              onClick={() => setPayoutOpen(true)}
              disabled={available <= 0}
            >
              Request Payout
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-bold text-white">₹{available.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Pending Payout</p>
            </div>
            <p className="text-lg font-semibold text-white">₹{pending.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Lifetime Earned</p>
            </div>
            <p className="text-lg font-semibold text-emerald-300">₹{(d.lifetime_earned || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Source breakdown strip (only shows if there is any history) */}
        {(d.commission_history || []).length > 0 && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {Object.entries(bySource).map(([source, total]) => {
              const meta = SOURCE_META[source] || SOURCE_META.merchant_onboarding;
              const Icon = meta.icon;
              return (
                <div key={source} className="inline-flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                  <span className="text-white/50">{meta.label}:</span>
                  <span className="text-white font-semibold">₹{total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        {balance <= 0 && (d.lifetime_earned || 0) === 0 && (
          <p className="relative mt-4 text-[11px] text-white/40">
            No earnings yet. You&apos;ll earn a commission every time you onboard a merchant AND every month they renew their subscription.
          </p>
        )}

        {/* Legacy balance note — old promoters had commission_earned but
            no history. Flag that mismatch so they don't panic. */}
        {balance > 0 && (d.lifetime_earned || 0) === 0 && (
          <div className="relative mt-4 text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Your balance includes commissions earned before detailed history was enabled.
              New activity from today onwards will appear in the history log below.
            </span>
          </div>
        )}
      </motion.div>

      {/* ── History Modal ── */}
      <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title="Commission History" size="lg">
        {(d.commission_history || []).length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">No commission entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-white/40 border-b border-white/5">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Source</th>
                  <th className="py-2 font-medium">Merchant / Pack</th>
                  <th className="py-2 font-medium">Base</th>
                  <th className="py-2 font-medium">Rate</th>
                  <th className="py-2 font-medium">Commission</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d.commission_history || []).map((h) => {
                  const meta = SOURCE_META[h.source] || SOURCE_META.merchant_onboarding;
                  const Icon = meta.icon;
                  return (
                    <tr key={h._id} className="border-b border-white/5 last:border-0">
                      <td className="py-2 text-white/80">{fmt(h.credited_at)}</td>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <Icon className={`w-3 h-3 ${meta.color}`} />
                          <span className="text-white/70">{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-2 text-white/80 truncate max-w-[180px]" title={h.merchant_name}>
                        {h.merchant_name || '—'}
                        {h.pack_name && <span className="text-white/30"> · {h.pack_name}</span>}
                      </td>
                      <td className="py-2 text-white/60">₹{h.base_amount}</td>
                      <td className="py-2 text-white/60">{h.percent}%</td>
                      <td className="py-2 text-white font-semibold">₹{h.amount}</td>
                      <td className="py-2">
                        <Badge
                          text={h.status === 'paid_out' ? 'Paid' : 'Credited'}
                          variant={h.status === 'paid_out' ? 'success' : 'default'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(d.payout_requests || []).length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <h4 className="text-xs font-semibold text-white/60 mb-3">Payout Requests</h4>
            <div className="space-y-2">
              {(d.payout_requests || []).map((r) => (
                <div key={r._id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-2">
                    {r.status === 'paid' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <p className="text-sm text-white font-medium">₹{r.amount}</p>
                      <p className="text-[10px] text-white/40">{fmt(r.requested_at)}</p>
                    </div>
                  </div>
                  <Badge
                    text={r.status}
                    variant={r.status === 'paid' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Payout Modal ── */}
      <Modal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} title="Request Payout" size="sm">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-xs text-white/60">
            Available balance: <span className="text-white font-semibold">₹{available.toFixed(2)}</span>
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Up to ${available.toFixed(2)}`}
            required
          />
          <p className="text-[11px] text-white/40">
            Payouts are processed by admin via bank transfer, typically within 2–3 business days.
            Make sure your bank account is on file in your profile.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button loading={submitting} onClick={handleRequest}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
