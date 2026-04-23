import { motion } from 'framer-motion';
import { Briefcase, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function IdCardDownload() {
  const { user } = useAuth();
  const { data, loading } = useFetch('/promoters/id-card');

  const rawUrl = data?.id_card_url || '';
  const cardUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${API_BASE}${rawUrl}`) : '';

  const cardData = data?.card || {};
  const employeeId = cardData.employee_id || '';
  const name = cardData.name || user?.name || '';
  const phone = cardData.phone || user?.phone || '';
  const address = cardData.address || '';
  const avatarUrl = cardData.avatar_url
    ? (cardData.avatar_url.startsWith('http') ? cardData.avatar_url : `${API_BASE}${cardData.avatar_url}`)
    : '';
  const rank = cardData.rank || 'promoter';
  const rankLabel = rank === 'area_manager' ? 'Area Manager' : 'Promoter';

  const handleDownload = () => {
    if (cardUrl) {
      window.open(cardUrl, '_blank');
      toast.success('Opening ID card for download...');
    } else {
      toast.error('ID card not available');
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(buildPrintHTML());
    win.document.close();
    win.onload = () => { win.print(); };
  };

  const buildPrintHTML = () => `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
      .card { width: 380px; background: #fff; border-radius: 16px; border: 1px solid #e0e0e0; overflow: hidden; }
      .card-top { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); padding: 28px 24px 55px; text-align: center; position: relative; }
      .card-top::after { content: ''; position: absolute; bottom: -28px; left: 0; right: 0; height: 56px; background: #fff; border-radius: 50% 50% 0 0; }
      .company { font-size: 22px; font-weight: 800; letter-spacing: 4px; color: #e94560; }
      .subtitle { font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.5); margin-top: 4px; }
      .avatar-wrap { text-align: center; margin-top: -42px; position: relative; z-index: 2; }
      .avatar { width: 84px; height: 84px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.12); object-fit: cover; }
      .badge-wrap { text-align: center; margin-top: 8px; }
      .badge { display: inline-block; background: linear-gradient(135deg, #e94560, #c23616); color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 2px; padding: 4px 16px; border-radius: 20px; }
      .body { padding: 14px 28px 20px; }
      .field { margin-bottom: 12px; }
      .label { font-size: 9px; font-weight: 600; letter-spacing: 1.5px; color: #999; margin-bottom: 1px; }
      .value { font-size: 15px; font-weight: 600; color: #1a1a2e; }
      .emp-id { font-size: 18px; font-weight: 800; color: #e94560; letter-spacing: 2px; }
      .divider { height: 1px; background: #eee; margin: 14px 0; }
      .footer { text-align: center; padding: 10px; border-top: 1px solid #f0f0f0; font-size: 8px; color: #bbb; letter-spacing: 1px; }
      @media print { body { background: #fff; } .card { border: none; box-shadow: none; } }
    </style></head><body>
    <div class="card">
      <div class="card-top"><div class="company">ZXCOM</div><div class="subtitle">EMPLOYEE IDENTITY CARD</div></div>
      <div class="avatar-wrap">
        ${avatarUrl ? `<img class="avatar" src="${avatarUrl}" />` : `<div class="avatar" style="background:#e94560;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:800">${name.charAt(0).toUpperCase()}</div>`}
      </div>
      <div class="badge-wrap"><span class="badge">${rankLabel.toUpperCase()}</span></div>
      <div class="body">
        <div class="field"><div class="label">EMPLOYEE ID</div><div class="value emp-id">${employeeId}</div></div>
        <div class="divider"></div>
        <div class="field"><div class="label">FULL NAME</div><div class="value">${name}</div></div>
        <div class="field"><div class="label">PHONE</div><div class="value">${phone}</div></div>
        <div class="field"><div class="label">ADDRESS</div><div class="value">${address || 'N/A'}</div></div>
      </div>
      <div class="footer">PROPERTY OF ZXCOM PVT LTD &bull; NOT TRANSFERABLE</div>
    </div></body></html>`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#e94560]/15 border border-[#e94560]/20">
          <Briefcase className="w-6 h-6 text-[#e94560]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Employee ID Card</h3>
          <p className="text-xs text-white/40">Your official Zxcom identification</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* Card Preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl mx-auto max-w-[380px]">
          {/* Top Section */}
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] pt-7 pb-14 text-center relative">
            <h4 className="text-xl font-extrabold tracking-[4px] text-[#e94560]">ZXCOM</h4>
            <p className="text-[10px] tracking-[3px] text-white/40 mt-1 uppercase">Employee Identity Card</p>
            <div className="absolute -bottom-7 left-0 right-0 h-14 bg-white rounded-t-[50%]" />
          </div>

          {/* Avatar */}
          <div className="relative z-10 -mt-11 text-center">
            <div className="inline-block">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-[84px] h-[84px] rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-[84px] h-[84px] rounded-full border-4 border-white shadow-lg bg-[#e94560] flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badge */}
          <div className="text-center mt-2">
            <span className="inline-block bg-gradient-to-r from-[#e94560] to-[#c23616] text-white text-[9px] font-bold tracking-[2px] px-4 py-1 rounded-full uppercase">
              {rankLabel}
            </span>
          </div>

          {/* Body */}
          <div className="px-7 pt-4 pb-5">
            <div className="mb-3">
              <p className="text-[9px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Employee ID</p>
              <p className="text-lg font-extrabold text-[#e94560] tracking-[2px]">{employeeId}</p>
            </div>
            <div className="h-px bg-gray-100 my-3" />
            <div className="mb-3">
              <p className="text-[9px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Full Name</p>
              <p className="text-[15px] font-semibold text-gray-800">{name}</p>
            </div>
            <div className="mb-3">
              <p className="text-[9px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Phone</p>
              <p className="text-[15px] font-semibold text-gray-800">{phone}</p>
            </div>
            {address && (
              <div className="mb-2">
                <p className="text-[9px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Address</p>
                <p className="text-[14px] font-medium text-gray-600">{address}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-2.5 border-t border-gray-100">
            <p className="text-[8px] text-gray-300 tracking-[1px] uppercase">Property of Zxcom &bull; Not Transferable</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button fullWidth icon={Download} onClick={handleDownload}>
            Download
          </Button>
          <Button fullWidth variant="secondary" icon={Printer} onClick={handlePrint}>
            Print
          </Button>
        </div>
      </motion.div>
    </GlassCard>
  );
}
