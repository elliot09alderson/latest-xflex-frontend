import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

const MAX_ADDRESSES = 4;

export default function AddressManager() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.data?.addresses || []);
    } catch {
      // silently fail for guests
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAuthenticated]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/addresses/${editData.id}`, form);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', form);
        toast.success('Address added');
      }
      setFormOpen(false);
      setEditData(null);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address removed');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleEdit = (address) => {
    setEditData(address);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center">
        <MapPin className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm mb-1">Login to manage delivery addresses</p>
        <p className="text-white/30 text-xs">Save up to {MAX_ADDRESSES} addresses for faster checkout</p>
      </div>
    );
  }

  const defaultAddress = addresses.find((a) => a.is_default);
  const otherAddresses = addresses.filter((a) => !a.is_default);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#e94560]/10 border border-[#e94560]/20">
            <MapPin className="w-5 h-5 text-[#e94560]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Delivery Addresses</h3>
            <p className="text-white/30 text-xs">{addresses.length}/{MAX_ADDRESSES} saved</p>
          </div>
        </div>

        {addresses.length < MAX_ADDRESSES && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e94560]/10 border border-[#e94560]/20 text-[#e94560] text-xs font-semibold hover:bg-[#e94560]/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && addresses.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#e94560]/30 border-t-[#e94560] rounded-full animate-spin" />
        </div>
      )}

      {/* No addresses */}
      {!loading && addresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-2xl border border-dashed border-white/10 text-center"
        >
          <MapPin className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-4">No saved addresses yet</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-semibold hover:bg-[#d63d56] transition-colors cursor-pointer shadow-lg shadow-[#e94560]/20"
          >
            <Plus className="w-4 h-4" />
            Add Your First Address
          </button>
        </motion.div>
      )}

      {/* Default address always visible */}
      {defaultAddress && (
        <AddressCard
          address={defaultAddress}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}

      {/* Other addresses — collapsible */}
      {otherAddresses.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-white/40 text-xs font-medium hover:text-white/60 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Show'} {otherAddresses.length} more address{otherAddresses.length > 1 ? 'es' : ''}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3 overflow-hidden"
              >
                {otherAddresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Capacity indicator */}
      {addresses.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(addresses.length / MAX_ADDRESSES) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#e94560] to-[#c23616]"
            />
          </div>
          <span className="text-white/30 text-[10px] font-medium">
            {addresses.length}/{MAX_ADDRESSES}
          </span>
        </div>
      )}

      {/* Form Modal */}
      <AddressForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        loading={saving}
      />
    </div>
  );
}
