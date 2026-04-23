import { motion } from 'framer-motion';
import { Crown, Gem, QrCode, Download, Printer, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const fullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

const planDetails = {
  basic: { icon: Crown, color: '#3b82f6', price: '₹1,000/month' },
  premium: { icon: Gem, color: '#e94560', price: '₹2,500/month' },
};

export default function PlanInfo() {
  const { data, loading, error } = useFetch('/merchants/profile');

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-red-400 text-center">{error}</p>
      </GlassCard>
    );
  }

  const profile = data?.merchant || {};
  const planType = profile.plan_type || 'basic';
  const plan = planDetails[planType] || planDetails.basic;
  const PlanIcon = plan.icon;
  const isActive = profile.status === 'active';

  // QR code from populated assigned_qr_code_id
  const qrData = profile.assigned_qr_code_id || {};
  const qrImageUrl = fullUrl(qrData.qr_image_url || '');
  const qrCode = qrData.code || '';

  const handleDownloadQR = async () => {
    if (!qrImageUrl) { toast.error('QR not available'); return; }
    try {
      const resp = await fetch(qrImageUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `zxcom-qr-${profile.shop_name || 'merchant'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('QR downloaded!');
    } catch { toast.error('Download failed'); }
  };

  const handlePrintQR = () => {
    if (!qrImageUrl) { toast.error('QR not available'); return; }
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>QR - ${profile.shop_name}</title>
      <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:sans-serif;}
      .card{text-align:center;padding:30px;}img{width:300px;height:300px;}
      p{margin:8px 0 0;color:#555;font-size:14px;}.name{font-size:18px;font-weight:bold;color:#333;}</style></head>
      <body><div class="card">
      <p class="name">${profile.shop_name || ''}</p>
      <img src="${qrImageUrl}" />
      <p>${qrCode}</p>
      </div></body></html>
    `);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <PlanIcon className="w-5 h-5" style={{ color: plan.color }} />
        <h3 className="text-lg font-semibold text-white">Plan Information</h3>
      </div>

      {/* Plan details grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Plan Type</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white capitalize">{planType}</span>
            <Badge
              text={planType === 'premium' ? 'Premium' : 'Basic'}
              variant={planType === 'premium' ? 'warning' : 'info'}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Price</p>
          <p className="text-sm font-semibold text-white">₹{profile.plan_price || '--'}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Inactive</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Shop</p>
          <p className="text-sm font-semibold text-white">{profile.shop_name || '--'}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Submissions</p>
          <p className="text-sm font-semibold text-white">{profile.current_month_submissions ?? 0} / {profile.monthly_submission_cap ?? 0}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider">Payment</p>
          <Badge text={profile.payment_status || 'pending'} variant={profile.payment_status === 'paid' ? 'success' : 'warning'} />
        </div>
      </div>

      {/* QR Code */}
      {qrImageUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-white/10 pt-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-[#e94560]" />
            <p className="text-sm font-medium text-white/70">Your QR Code</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <img
                src={qrImageUrl}
                alt="Merchant QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            {qrCode && (
              <p className="text-sm font-mono text-[#e94560]">{qrCode}</p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadQR}>
                Download
              </Button>
              <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrintQR}>
                Print
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="border-t border-white/10 pt-6 text-center">
          <QrCode className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No QR code assigned yet</p>
        </div>
      )}
    </GlassCard>
  );
}
