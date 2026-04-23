import { motion } from 'framer-motion';
import { Store, MapPin, CheckCircle } from 'lucide-react';
import CustomerForm from './CustomerForm';

export default function ScanLanding({ merchantInfo, qrData, onFormSubmit, formLoading }) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Compact merchant banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white truncate">
            {merchantInfo?.shop_name}
          </h1>
          <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
            {merchantInfo?.owner_name && <span>{merchantInfo.owner_name}</span>}
            {merchantInfo?.area && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {merchantInfo.area}{merchantInfo.city ? `, ${merchantInfo.city}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#e94560]/10 flex-shrink-0">
          <Store className="w-4 h-4 text-[#e94560]" />
        </div>
      </motion.div>

      {/* Customer Form */}
      <CustomerForm onSubmit={onFormSubmit} loading={formLoading} />
    </div>
  );
}
