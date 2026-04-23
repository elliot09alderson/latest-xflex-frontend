import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, BanknoteArrowUp, History, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

/**
 * Merchant wallet card — shows current commission balance from ecom orders,
 * lifetime stats, and lets the merchant request a payout. Appears on the
 * MerchantDashboard above the existing stats grid.
 */
export default function WalletCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/merchants/wallet');
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
      await api.post('/merchants/wallet/payout-request', { amount: amt });
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#e94560]/20 bg-gradient-to-br from-[#e94560]/10 via-white/5 to-[#c23616]/5 p-5"
      >
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#e94560]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#e94560]/15">
              <Wallet className="w-5 h-5 text-[#e94560]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Commission Wallet</h3>
              <p className="text-[11px] text-white/40">Earnings from customer purchases on zxcom.in</p>
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

        {balance <= 0 && (d.lifetime_earned || 0) === 0 && (
          <p className="relative mt-4 text-[11px] text-white/40">
            No earnings yet. You&apos;ll earn a commission every time a customer who first scanned your QR buys something on zxcom.in.
          </p>
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
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Order Total</th>
                  <th className="py-2 font-medium">Rate</th>
                  <th className="py-2 font-medium">Commission</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d.commission_history || []).map((h) => (
                  <tr key={h._id} className="border-b border-white/5 last:border-0">
                    <td className="py-2 text-white/80">{fmt(h.credited_at)}</td>
                    <td className="py-2 text-white/80 font-mono">{h.order_number || '—'}</td>
                    <td className="py-2 text-white/60">₹{h.order_total}</td>
                    <td className="py-2 text-white/60">{h.percent}%</td>
                    <td className="py-2 text-white font-semibold">₹{h.amount}</td>
                    <td className="py-2">
                      <Badge
                        text={h.status === 'paid_out' ? 'Paid' : 'Credited'}
                        variant={h.status === 'paid_out' ? 'success' : 'default'}
                      />
                    </td>
                  </tr>
                ))}
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

      {/* ── Payout Request Modal ── */}
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
