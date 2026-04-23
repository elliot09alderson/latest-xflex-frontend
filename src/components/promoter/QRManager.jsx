import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, UserPlus, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

export default function QRManager() {
  const { data, loading, refetch } = useFetch('/qr/my-codes');
  const [generating, setGenerating] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [merchantId, setMerchantId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const qrCodes = data?.codes || [];
  const quota = data?.quota || {};
  const generated = quota.generated || qrCodes.length || 0;
  const total = quota.total || quota.limit || 0;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/qr/generate');
      toast.success('QR code generated successfully!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleAssign = async () => {
    if (!merchantId.trim()) {
      toast.error('Please enter a merchant phone or ID');
      return;
    }
    setAssigning(true);
    try {
      await api.post(`/qr/assign/${assignModal._id || assignModal.id}/${merchantId.trim()}`);
      toast.success('QR code assigned to merchant!');
      setAssignModal(null);
      setMerchantId('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign QR code');
    } finally {
      setAssigning(false);
    }
  };

  const getFullImageUrl = (qr) => {
    const raw = qr.qr_image_url || qr.image_url || qr.qr_image || qr.url || '';
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `${API_BASE}${raw}`;
  };

  const handleDownload = async (qr) => {
    const imageUrl = getFullImageUrl(qr);
    if (!imageUrl) {
      toast.error('QR image not available');
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `zxcom-qr-${qr.code || qr._id || 'code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">QR Code Manager</h2>
          <p className="text-sm text-white/40 mt-1">
            {total > 0
              ? `${generated} / ${total} QR codes generated`
              : `${generated} QR codes generated`}
          </p>
        </div>
        <Button icon={QrCode} loading={generating} onClick={handleGenerate}>
          Generate QR Code
        </Button>
      </div>

      {/* Quota bar */}
      {total > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70 font-medium">QR Quota</span>
            <span className="text-white/50">
              {generated} / {total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? Math.min((generated / total) * 100, 100) : 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#e94560] to-[#c23616]"
              style={{ boxShadow: '0 0 12px #e9456040' }}
            />
          </div>
        </GlassCard>
      )}

      {/* QR Grid */}
      {qrCodes.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="No QR codes yet"
          description="Generate your first QR code to start onboarding merchants."
          action={{ label: 'Generate QR Code', icon: QrCode, onClick: handleGenerate }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr, idx) => {
            const isAssigned = qr.assigned || qr.status === 'assigned' || qr.is_assigned || !!qr.merchant_id;
            const imageUrl = getFullImageUrl(qr);

            return (
              <motion.div
                key={qr._id || qr.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <GlassCard className="p-5 space-y-4">
                  {/* QR Preview */}
                  {imageUrl && (
                    <div className="flex justify-center">
                      <div className="bg-white rounded-xl p-3">
                        <img
                          src={imageUrl}
                          alt={`QR ${qr.code || ''}`}
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-2">
                    {qr.code && (
                      <p className="text-sm font-mono text-white/70 text-center truncate">
                        {qr.code}
                      </p>
                    )}
                    <div className="flex items-center justify-center">
                      <Badge
                        text={isAssigned ? 'Assigned' : 'Unassigned'}
                        variant={isAssigned ? 'success' : 'warning'}
                      />
                    </div>
                    {isAssigned && (qr.merchant_name || qr.merchant?.name) && (
                      <p className="text-xs text-white/40 text-center">
                        {qr.merchant_name || qr.merchant?.name}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      fullWidth
                      onClick={() => handleDownload(qr)}
                    >
                      Download
                    </Button>
                    {!isAssigned && (
                      <Button
                        size="sm"
                        icon={UserPlus}
                        fullWidth
                        onClick={() => setAssignModal(qr)}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => {
          setAssignModal(null);
          setMerchantId('');
        }}
        title="Assign to Merchant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/50">
            Enter the merchant's phone number or ID to assign this QR code.
          </p>
          <Input
            label="Merchant Phone / ID"
            name="merchant_id"
            placeholder="Enter phone number or merchant ID"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            icon={Phone}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setAssignModal(null);
                setMerchantId('');
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              icon={UserPlus}
              loading={assigning}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
