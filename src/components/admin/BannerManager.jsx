import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Trash2, Upload, Store, Users, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import FileUpload from '../ui/FileUpload';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const AUDIENCE_META = {
  merchant: { label: 'Merchant', icon: Store, color: 'text-[#e94560]', bg: 'bg-[#e94560]/10 border-[#e94560]/30' },
  promoter: { label: 'Promoter', icon: Users, color: 'text-[#6366f1]', bg: 'bg-[#6366f1]/10 border-[#6366f1]/30' },
};

export default function BannerManager() {
  const { data, loading, refetch } = useFetch('/admin/banners');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [audience, setAudience] = useState('merchant');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');

  const banners = data?.banners || [];
  const visible = filter === 'all' ? banners : banners.filter((b) => b.audience === filter);
  const counts = {
    merchant: banners.filter((b) => b.audience === 'merchant').length,
    promoter: banners.filter((b) => b.audience === 'promoter').length,
  };

  const handleFileChange = (e) => {
    setFile(e.target.value || e.target.files?.[0] || null);
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setCaption('');
    setLinkUrl('');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a banner image');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('banner', file);
      formData.append('audience', audience);
      if (title) formData.append('title', title);
      if (caption) formData.append('caption', caption);
      if (linkUrl) formData.append('link_url', linkUrl);
      await api.post('/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Banner uploaded to ${audience} dashboard`);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/banners/${deleteId}`);
      toast.success('Banner deleted');
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete banner');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    const next = banner.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/banners/${banner._id}`, { status: next });
      toast.success(next === 'active' ? 'Banner activated' : 'Banner hidden');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update banner');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[#8b5cf6]/10">
          <Image className="w-5 h-5 text-[#8b5cf6]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Banners</h2>
          <p className="text-xs text-white/40">Push offer announcements to merchants and promoters</p>
        </div>
      </div>

      {/* Upload Section */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Upload New Banner
        </h3>

        {/* Audience selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-white/70 mb-2">Target Audience</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(AUDIENCE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const selected = audience === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAudience(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selected
                      ? `${meta.bg} ${meta.color}`
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{meta.label} Dashboard</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Title (optional)"
            placeholder="e.g. Diwali Mega Offer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Link URL (optional)"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            icon={LinkIcon}
          />
        </div>

        <Input
          label="Caption (optional)"
          placeholder="Short announcement text shown under the banner"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="mt-4">
          <FileUpload
            label="Banner image"
            name="banner"
            accept="image/*"
            preview
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button
            icon={Upload}
            loading={uploading}
            onClick={handleUpload}
            disabled={!file}
          >
            Upload Banner
          </Button>
        </div>
      </GlassCard>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'all', label: `All (${banners.length})` },
          { key: 'merchant', label: `Merchant (${counts.merchant})` },
          { key: 'promoter', label: `Promoter (${counts.promoter})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-[#8b5cf6]/15 border-[#8b5cf6]/40 text-[#c4b5fd]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-sm">
          {filter === 'all'
            ? 'No banners uploaded yet.'
            : `No banners for the ${filter} dashboard yet.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {visible.map((banner, i) => {
              const meta = AUDIENCE_META[banner.audience] || AUDIENCE_META.merchant;
              const Icon = meta.icon;
              const isActive = banner.status === 'active';
              return (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={`rounded-2xl overflow-hidden border bg-white/[0.03] ${
                    isActive ? 'border-white/10' : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={banner.image_url}
                      alt={banner.title || `Banner ${i + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full border backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge
                        text={isActive ? 'Active' : 'Hidden'}
                        variant={isActive ? 'success' : 'default'}
                      />
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {banner.title && (
                      <p className="text-sm font-semibold text-white truncate">{banner.title}</p>
                    )}
                    {banner.caption && (
                      <p className="text-xs text-white/50 line-clamp-2">{banner.caption}</p>
                    )}
                    {banner.link_url && (
                      <p className="text-[11px] text-[#6366f1] truncate flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {banner.link_url}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={isActive ? EyeOff : Eye}
                        onClick={() => handleToggleStatus(banner)}
                        fullWidth
                      >
                        {isActive ? 'Hide' : 'Show'}
                      </Button>
                      <button
                        onClick={() => setDeleteId(banner._id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Banner"
        size="sm"
      >
        <p className="text-white/70 text-sm mb-6">
          Are you sure you want to delete this banner? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
