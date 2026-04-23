import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, XCircle, ShieldOff, CalendarOff,
  PartyPopper, Trophy, Sparkles, Gift,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import Spinner from '../components/ui/Spinner';
import GlassCard from '../components/ui/GlassCard';
import ScanLanding from '../components/customer/ScanLanding';
import Seo from '../components/seo/Seo';

// ─── Confetti Particle ──────────────────────────────────────────
function ConfettiParticle({ delay, color }) {
  const randomX = Math.random() * 300 - 150;
  const randomRotate = Math.random() * 720 - 360;
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
      animate={{ opacity: [1, 1, 0], y: [0, -80, 200], x: [0, randomX * 0.3, randomX], rotate: [0, randomRotate], scale: [1, 1.2, 0.6] }}
      transition={{ duration: 2.5, delay, ease: 'easeOut' }}
      className="absolute top-1/3 left-1/2 w-2 h-2 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Error Screen ───────────────────────────────────────────────
function ErrorScreen({ type, message }) {
  const config = {
    invalid: { icon: XCircle, title: 'Invalid QR Code', description: message || 'This QR code is not valid.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    inactive: { icon: ShieldOff, title: 'Shop Inactive', description: message || 'This shop is currently inactive.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    limit: { icon: CalendarOff, title: 'Monthly Limit Reached', description: message || 'This shop has reached its monthly limit.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    error: { icon: AlertTriangle, title: 'Something Went Wrong', description: message || 'Please try again.', color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/10' },
  };
  const { icon: Icon, title, description, color, bg, border } = config[type] || config.error;

  return (
    <GlassCard className="p-8 sm:p-10 text-center max-w-sm mx-auto">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className={`mx-auto mb-5 w-16 h-16 rounded-full ${bg} border ${border} flex items-center justify-center`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </GlassCard>
  );
}

// ─── Success Screen ─────────────────────────────────────────────
function SuccessScreen({ merchantName }) {
  const confettiColors = ['#e94560', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden">
      {confettiColors.map((color, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <ConfettiParticle key={`${i}-${j}`} delay={i * 0.08 + j * 0.15} color={color} />
        ))
      )}

      <GlassCard className="relative p-8 sm:p-10 text-center z-10">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }} className="mx-auto mb-6">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(233,69,96,0.3)', '0 0 40px rgba(233,69,96,0.5)', '0 0 20px rgba(233,69,96,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e94560] to-[#c23616] flex items-center justify-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}>
              <PartyPopper className="w-9 h-9 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          You're in the draw!
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex items-center justify-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-sm text-white/50">Entry registered successfully</span>
          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
        </motion.div>

        {merchantName && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="p-4 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
            <p className="text-xs text-white/30 mb-0.5">Shop</p>
            <p className="text-sm font-medium text-white">{merchantName}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} className="p-3 rounded-xl bg-gradient-to-r from-[#e94560]/15 to-[#f59e0b]/15 border border-[#e94560]/20">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-[#e94560]" />
            <span className="text-sm font-medium text-white/80">Winners will be announced soon. Good luck!</span>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-xs text-white/30 mt-5">
          You can close this page now
        </motion.p>
      </GlassCard>
    </div>
  );
}

// ─── Main ScanPage ──────────────────────────────────────────────
export default function ScanPage() {
  const { qrCodeId } = useParams();

  const [pageState, setPageState] = useState('loading');
  const [errorType, setErrorType] = useState('error');
  const [errorMessage, setErrorMessage] = useState('');

  const [merchantInfo, setMerchantInfo] = useState(null);
  const [qrData, setQrData] = useState(null);

  const [step, setStep] = useState(1); // 1: form, 2: success
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        const { data } = await api.get(`/customers/scan/${qrCodeId}`);
        const d = data.data || data;
        setMerchantInfo(d.merchant);
        setQrData({
          qr_code_id: qrCodeId,
          merchant_user_id: d.merchant_user_id,
          promoter_id: d.promoter_id,
        });
        setPageState('ready');
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || '';
        if (status === 404 || msg.toLowerCase().includes('invalid')) { setErrorType('invalid'); }
        else if (status === 403 || msg.toLowerCase().includes('inactive')) { setErrorType('inactive'); }
        else if (msg.toLowerCase().includes('limit')) { setErrorType('limit'); }
        else { setErrorType('error'); }
        setErrorMessage(msg);
        setPageState('error');
      }
    };
    fetchQRData();
  }, [qrCodeId]);

  const handleFormSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('phone', formData.phone);
      if (formData.age) fd.append('age', formData.age);
      if (formData.address) fd.append('address', formData.address);
      if (formData.pincode) fd.append('pincode', formData.pincode);
      fd.append('bill_value', formData.bill_value);
      fd.append('qr_code_id', qrData.qr_code_id);
      if (qrData.merchant_user_id) fd.append('merchant_id', qrData.merchant_user_id);
      if (qrData.promoter_id) fd.append('promoter_id', qrData.promoter_id);
      if (formData.profile_photo) fd.append('profile_photo', formData.profile_photo);
      if (formData.bill_image) fd.append('bill_image', formData.bill_image);

      await api.post('/customers/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStep(2);
      toast.success('Entry submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4 py-8 sm:py-12">
      <Seo
        title="Scan QR & Win"
        description="Scan a ZXCOM shop QR code to submit your bill and enter ongoing contests."
        path="/scan"
        noindex
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#e94560]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#3b82f6]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {pageState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-white/40">Verifying QR code...</p>
            </motion.div>
          )}

          {pageState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <ErrorScreen type={errorType} message={errorMessage} />
            </motion.div>
          )}

          {pageState === 'ready' && (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              {step === 1 && (
                <ScanLanding
                  merchantInfo={merchantInfo}
                  qrData={qrData}
                  onFormSubmit={handleFormSubmit}
                  formLoading={submitLoading}
                />
              )}
              {step === 2 && (
                <SuccessScreen merchantName={merchantInfo?.shop_name} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
