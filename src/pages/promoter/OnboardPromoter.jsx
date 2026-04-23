import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Users, UserPlus, Store, Phone, Lock, Mail, MapPin,
  CheckCircle, ArrowLeft, ArrowRight, Package, CreditCard, Banknote, Wallet,
  IndianRupee, QrCode, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useRazorpay from '../../hooks/useRazorpay';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import TermsAndConditions from '../../components/ui/TermsAndConditions';
import PromoterPerks from '../../components/ui/PromoterPerks';

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

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function OnboardPromoter() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [packs, setPacks] = useState([]);
  const [packsLoading, setPacksLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { initiatePayment } = useRazorpay();

  const [form, setForm] = useState({
    name: '', phone: '', password: '', email: '', address: '', avatar: null,
  });

  useEffect(() => {
    if (step === 2 && packs.length === 0) {
      setPacksLoading(true);
      api.get('/promoters/packs?type=promoter')
        .then((res) => setPacks(res.data?.data?.packs || res.data?.packs || []))
        .catch(() => toast.error('Failed to load packs'))
        .finally(() => setPacksLoading(false));
    }
  }, [step, packs.length]);

  const updateField = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((p) => ({ ...p, [name]: files[0] || value }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const goToStep = (t) => { setDirection(t > step ? 1 : -1); setStep(t); };

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      toast.error('Name, phone, and password are required');
      return;
    }
    goToStep(2);
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    goToStep(3);
  };

  const submitPromoter = async (paymentData = {}) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('password', form.password);
      if (form.email) fd.append('email', form.email);
      if (form.address) fd.append('address', form.address);
      fd.append('pack_id', selectedPack._id);
      fd.append('payment_mode', paymentData.payment_mode || 'offline');
      if (paymentData.razorpay_payment_id) fd.append('razorpay_payment_id', paymentData.razorpay_payment_id);
      if (form.avatar) fd.append('avatar', form.avatar);
      if (paymentScreenshot) fd.append('payment_screenshot', paymentScreenshot);

      const res = await api.post('/promoters/onboard-promoter', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data?.data || res.data || {};
      setEmployeeId(data.employee_id || '');
      setDone(true);
      toast.success('Promoter onboarded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to onboard promoter');
    } finally { setLoading(false); }
  };

  const handleOffline = () => {
    if (!termsAccepted) {
      toast.error('Please accept the Promoter Terms & Conditions to continue');
      return;
    }
    submitPromoter({ payment_mode: 'offline' });
  };

  const handleOnline = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the Promoter Terms & Conditions to continue');
      return;
    }
    setLoading(true);
    try {
      const { data: orderRes } = await api.post('/payments/create-order', {
        amount: selectedPack.price,
        purpose: 'promoter_onboarding',
      });
      const orderData = orderRes?.data || orderRes;

      await initiatePayment({
        amount: orderData.amount,
        order_id: orderData.order_id,
        prefill: { name: form.name, email: form.email || '', contact: form.phone },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await submitPromoter({
              payment_mode: 'online',
              razorpay_payment_id: response.razorpay_payment_id,
            });
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', password: '', email: '', address: '', avatar: null });
    setSelectedPack(null);
    setPaymentMode('');
    setPaymentScreenshot(null);
    setEmployeeId('');
    setTermsAccepted(false);
    setStep(1);
    setDone(false);
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Promoter Portal">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Onboard Promoter</h1>
          <p className="text-sm text-white/40 mt-1">Register a new promoter to your network</p>
        </motion.div>

        {/* Steps */}
        {!done && (
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-gradient-to-r from-[#e94560] to-[#c23616] text-white' : 'bg-white/10 text-white/40'}`}>{s}</div>
                {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-[#e94560]' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {done ? (
          <GlassCard className="p-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Promoter Onboarded!</h2>
              <p className="text-white/50 text-sm mb-4">Successfully registered and linked to your network.</p>

              {employeeId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Employee ID</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl font-extrabold text-[#e94560] tracking-widest">{employeeId}</p>
                    <button onClick={() => { navigator.clipboard.writeText(employeeId); toast.success('Copied!'); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              <Button onClick={resetForm} icon={UserPlus}>Onboard Another Promoter</Button>
            </motion.div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* STEP 1: Details */}
              {step === 1 && (
                <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <form onSubmit={handleStep1Next} className="space-y-4">
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-2">Promoter Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Full Name" name="name" placeholder="Promoter's name" icon={User} value={form.name} onChange={updateField} required />
                      <Input label="Phone Number" name="phone" type="tel" placeholder="Phone number" icon={Phone} value={form.phone} onChange={updateField} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Password" name="password" type="password" placeholder="Create password" icon={Lock} value={form.password} onChange={updateField} required />
                      <Input label="Email" name="email" type="email" placeholder="Email (optional)" icon={Mail} value={form.email} onChange={updateField} />
                    </div>
                    <Input label="Address" name="address" placeholder="Address (optional)" icon={MapPin} value={form.address} onChange={updateField} />
                    <FileUpload label="Profile Photo" name="avatar" accept="image/*" preview onChange={updateField} />

                    <Button type="submit" fullWidth size="lg" icon={ArrowRight}>Next: Select Pack</Button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Pack Selection */}
              {step === 2 && (
                <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="space-y-5">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white">Select a Pack</h3>
                      <p className="text-sm text-white/40 mt-1">Choose a pack for the new promoter</p>
                    </div>

                    {packsLoading ? (
                      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                    ) : packs.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">No promoter packs available. Ask admin to create one.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {packs.map((pack) => (
                          <motion.button key={pack._id} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => handlePackSelect(pack)}
                            className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left w-full border-white/10 bg-white/5 hover:border-[#e94560]/40">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10 flex-shrink-0">
                              <Package className="w-6 h-6 text-[#e94560]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">{pack.name}</span>
                                <div className="flex items-center gap-0.5">
                                  <IndianRupee className="w-4 h-4 text-[#e94560]" />
                                  <span className="text-lg font-bold text-[#e94560]">{pack.price}</span>
                                </div>
                              </div>
                              {pack.description && <p className="text-xs text-white/40 mt-0.5">{pack.description}</p>}
                              <div className="flex gap-4 mt-1.5 text-[11px] text-white/30">
                                <span>Shopkeepers: <span className="text-white/60 font-medium">{pack.shopkeeper_limit || 0}</span></span>
                                <span>Promoters: <span className="text-white/60 font-medium">{pack.promoter_limit || 0}</span></span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                    <Button variant="secondary" icon={ArrowLeft} onClick={() => goToStep(1)}>Back</Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && selectedPack && (
                <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="space-y-5">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white">Payment</h3>
                      <p className="text-sm text-white/40 mt-1">
                        Pack: <span className="text-white font-medium">{selectedPack.name}</span> — <span className="text-[#e94560] font-semibold">₹{selectedPack.price}</span>
                      </p>
                    </div>

                    <PromoterPerks />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.button type="button" whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPaymentMode('offline')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMode === 'offline' ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20' : 'border-white/10 bg-white/5 hover:border-[#e94560]/40'}`}>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10"><Banknote className="w-7 h-7 text-amber-400" /></div>
                        <span className="text-white font-semibold text-sm">Offline</span>
                        <span className="text-white/40 text-xs text-center">Pay cash & activate later</span>
                      </motion.button>
                      <motion.button type="button" whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPaymentMode('online')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMode === 'online' ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20' : 'border-white/10 bg-white/5 hover:border-[#e94560]/40'}`}>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"><Wallet className="w-7 h-7 text-emerald-400" /></div>
                        <span className="text-white font-semibold text-sm">Online</span>
                        <span className="text-white/40 text-xs text-center">UPI, Cards, Net Banking</span>
                      </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMode === 'offline' && (
                        <motion.div key="off" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                          <p className="text-sm text-amber-200/80">Account will be created with <span className="font-semibold">pending</span> status. Admin can activate after payment.</p>
                        </motion.div>
                      )}
                      {paymentMode === 'online' && (
                        <motion.div key="on" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                          <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-lg shadow-black/40">
                            <img
                              src="/upi-qr-cropped.png"
                              alt="UPI QR Code"
                              className="w-56 h-56 object-contain mx-auto block"
                              draggable={false}
                            />
                            <p className="text-center text-[10px] text-gray-500 mt-2 font-semibold tracking-wide">
                              Scan with any UPI app
                            </p>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-center">
                            <p className="text-sm font-medium text-emerald-200/80 mb-1">Pay ₹{selectedPack.price} via UPI</p>
                            <p className="text-xs text-white/40">Scan the QR code above and pay using any UPI app</p>
                            <p className="text-xs text-white/50 mt-2">After payment, upload the screenshot below</p>
                          </div>
                          <FileUpload
                            label="Payment Screenshot"
                            name="payment_screenshot"
                            accept="image/*"
                            preview
                            onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {paymentMode && (
                      <div className="border-t border-white/10 pt-5">
                        <TermsAndConditions
                          type="promoter"
                          accepted={termsAccepted}
                          onAcceptedChange={setTermsAccepted}
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="secondary" icon={ArrowLeft} onClick={() => goToStep(2)}>Back</Button>
                      {paymentMode === 'offline' && <Button fullWidth size="lg" icon={UserPlus} loading={loading} disabled={!termsAccepted} onClick={handleOffline}>Onboard (Pay Later)</Button>}
                      {paymentMode === 'online' && <Button fullWidth size="lg" icon={UserPlus} loading={loading} disabled={!termsAccepted} onClick={() => {
                        if (!termsAccepted) { toast.error('Please accept the Promoter Terms & Conditions to continue'); return; }
                        submitPromoter({ payment_mode: 'online' });
                      }}>I've Paid — Onboard Now</Button>}
                      {!paymentMode && <Button fullWidth size="lg" disabled>Select a payment method</Button>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
}
