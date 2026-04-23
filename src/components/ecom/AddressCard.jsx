import { motion } from 'framer-motion';
import { MapPin, Pencil, Trash2, Check, Home, Briefcase, Building2, Tag, Phone, User } from 'lucide-react';

const labelIcons = {
  Home: { icon: Home, color: '#10b981' },
  Work: { icon: Briefcase, color: '#3b82f6' },
  Office: { icon: Building2, color: '#8b5cf6' },
  Other: { icon: Tag, color: '#f59e0b' },
};

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const { icon: LabelIcon, color: labelColor } = labelIcons[address.label] || labelIcons.Other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`relative p-4 rounded-2xl border transition-all duration-300 ${
        address.is_default
          ? 'bg-[#e94560]/5 border-[#e94560]/30 shadow-lg shadow-[#e94560]/5'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top row: label + actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${labelColor}15`, border: `1px solid ${labelColor}30` }}
          >
            <LabelIcon className="w-3.5 h-3.5" style={{ color: labelColor }} />
          </div>
          <span className="text-white font-semibold text-sm">{address.label}</span>
          {address.is_default && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e94560]/15 border border-[#e94560]/25 text-[#e94560] text-[10px] font-bold uppercase tracking-wide">
              <Check className="w-3 h-3" /> Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(address)}
            className="p-1.5 rounded-lg text-white/30 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all cursor-pointer"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(address._id)}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Name + Phone */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5 text-white/80 text-sm">
          <User className="w-3.5 h-3.5 text-white/40" />
          <span className="font-medium">{address.full_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Phone className="w-3 h-3" />
          <span>{address.phone}</span>
        </div>
      </div>

      {/* Address lines */}
      <div className="flex items-start gap-1.5 text-white/50 text-sm leading-relaxed">
        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white/30" />
        <p>
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
          {`, ${address.city}, ${address.state} - ${address.pincode}`}
        </p>
      </div>

      {/* Set as default */}
      {!address.is_default && (
        <button
          onClick={() => onSetDefault(address._id)}
          className="mt-3 text-[#e94560] text-xs font-medium hover:underline cursor-pointer"
        >
          Set as default
        </button>
      )}
    </motion.div>
  );
}
