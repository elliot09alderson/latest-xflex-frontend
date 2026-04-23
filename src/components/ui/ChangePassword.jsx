import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Button from './Button';

export default function ChangePassword() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.current_password || !form.new_password) {
      toast.error('Both fields are required');
      return;
    }
    if (form.new_password.length < 4) {
      toast.error('New password must be at least 4 characters');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setShow(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-orange-400" />
          <p className="text-sm font-semibold text-white">Change Password</p>
        </div>
        {!show && (
          <Button size="sm" icon={Lock} onClick={() => setShow(true)}>Change</Button>
        )}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            <input
              type="password"
              placeholder="Current password"
              value={form.current_password}
              onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e94560]/60 transition-colors"
            />
            <input
              type="password"
              placeholder="New password"
              value={form.new_password}
              onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e94560]/60 transition-colors"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={form.confirm_password}
              onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e94560]/60 transition-colors"
            />
            <div className="flex gap-2">
              <Button icon={Lock} loading={saving} onClick={handleSubmit}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => { setShow(false); setForm({ current_password: '', new_password: '', confirm_password: '' }); }}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
