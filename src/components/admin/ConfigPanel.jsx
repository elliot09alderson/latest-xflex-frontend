import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, Save, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// Only the keys that actually drive live business logic are exposed here.
// Legacy flat-tier price/cap/max-shops fields from the pre-Pack era have been
// removed because packs now source these values directly on purchase.
const CONFIG_FIELDS = [
  { key: 'commission_percentage', label: 'Level 1: Direct Promoter Commission', suffix: '%', type: 'number', step: '0.1' },
  { key: 'area_manager_override_percent', label: 'Level 2: Area Manager Override', suffix: '%', type: 'number', step: '0.1' },
  { key: 'ecom_merchant_commission_percent', label: 'Merchant Ecom Order Commission', suffix: '%', type: 'number', step: '0.1' },
  { key: 'area_manager_promoter_target', label: 'Area Manager Promoter Target', suffix: '', type: 'number' },
  { key: 'area_manager_shop_target', label: 'Area Manager Shop Target', suffix: '', type: 'number' },
];

function ConfigCard({ field, currentValue, onSave, delay }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(currentValue ?? '');
  }, [currentValue]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(field.key, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = String(value) !== String(currentValue ?? '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-white">{field.label}</h4>
            <p className="text-xs text-white/40 mt-0.5">Key: {field.key}</p>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-emerald-400"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Saved</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            {field.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                {field.prefix}
              </span>
            )}
            <input
              type={field.type}
              step={field.step}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`
                w-full bg-white/5 border border-white/10 rounded-xl
                px-4 py-2.5 text-sm text-white
                outline-none transition-all duration-200
                focus:border-[#e94560]/60 focus:ring-1 focus:ring-[#e94560]/20
                ${field.prefix ? 'pl-8' : ''}
                ${field.suffix ? 'pr-10' : ''}
              `}
            />
            {field.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                {field.suffix}
              </span>
            )}
          </div>
          <Button
            size="sm"
            icon={Save}
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanged}
            variant={hasChanged ? 'primary' : 'secondary'}
          >
            Save
          </Button>
        </div>

        {currentValue !== undefined && (
          <p className="text-xs text-white/30 mt-2">
            Current: {field.prefix || ''}{currentValue}{field.suffix || ''}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default function ConfigPanel() {
  const { data, loading, error, refetch } = useFetch('/admin/config');

  const config = data?.configs || {};

  const handleSave = async (key, value) => {
    try {
      await api.put(`/admin/config/${key}`, { value });
      toast.success(`${key} updated successfully`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update config');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[#e94560]/10">
          <Sliders className="w-5 h-5 text-[#e94560]" />
        </div>
        <h2 className="text-xl font-bold text-white">System Configuration</h2>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-400/80">
          Changes apply instantly across the system. Please update values carefully.
        </p>
      </div>

      {error ? (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONFIG_FIELDS.map((field, i) => (
            <ConfigCard
              key={field.key}
              field={field}
              currentValue={config[field.key]}
              onSave={handleSave}
              delay={i * 0.05}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
