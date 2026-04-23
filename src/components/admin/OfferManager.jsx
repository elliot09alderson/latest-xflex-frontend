import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import DataTable from '../ui/DataTable';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import FileUpload from '../ui/FileUpload';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const initialForm = {
  title: '',
  description: '',
  prize_value: '',
  prize_description: '',
  start_date: '',
  end_date: '',
  area_filter: '',
  banner: null,
};

export default function OfferManager() {
  const { data, loading, error, refetch } = useFetch('/admin/offers');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const offers = data?.offers || [];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditId(offer._id || offer.id);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      prize_value: offer.prize_value || '',
      prize_description: offer.prize_description || '',
      start_date: offer.start_date?.slice(0, 10) || '',
      end_date: offer.end_date?.slice(0, 10) || '',
      area_filter: Array.isArray(offer.area_filter) ? offer.area_filter.join(', ') : (offer.area_filter || ''),
      banner: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload banner first if selected
      let bannerUrl = '';
      if (form.banner) {
        const bannerData = new FormData();
        bannerData.append('image', form.banner);
        const uploadRes = await api.post('/upload/image', bannerData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        bannerUrl = uploadRes.data?.data?.url || uploadRes.data?.url || '';
      }

      // Build JSON payload
      const payload = {
        title: form.title,
        description: form.description,
        prize_value: form.prize_value ? Number(form.prize_value) : 0,
        prize_description: form.prize_description,
        start_date: form.start_date,
        end_date: form.end_date,
        area_filter: form.area_filter
          ? form.area_filter.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        is_active: true,
      };
      if (bannerUrl) payload.banner_image_url = bannerUrl;

      if (editId) {
        await api.put(`/admin/offers/${editId}`, payload);
        toast.success('Offer updated successfully');
      } else {
        await api.post('/admin/offers', payload);
        toast.success('Offer created successfully');
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditId(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  }, [form, editId, refetch]);

  const handleDelete = async (row) => {
    try {
      await api.delete(`/admin/offers/${row._id || row.id}`);
      toast.success('Offer deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete offer');
    }
  };
  const handleBulkDelete = async (rows) => {
    try {
      await api.post('/admin/offers/bulk-delete', { ids: rows.map((r) => r._id || r.id) });
      toast.success(`Deleted ${rows.length} offers`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };
  const handleDeleteAll = async () => {
    try {
      await api.delete('/admin/offers');
      toast.success('All offers deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete all failed');
    }
  };

  const getStatusVariant = (status) => {
    const map = { active: 'success', draft: 'default', expired: 'danger', upcoming: 'info' };
    return map[status?.toLowerCase()] || 'default';
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'prize_value',
      label: 'Prize Value',
      render: (val) => val ? `₹${val}` : '-',
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'end_date',
      label: 'End Date',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge text={val || 'draft'} variant={getStatusVariant(val)} />,
    },
    {
      key: 'actions',
      label: 'Edit',
      exportable: false,
      render: (_, row) => (
        <button
          onClick={() => openEdit(row)}
          className="p-1.5 rounded-lg text-white/50 hover:text-blue-400 hover:bg-blue-400/10 transition-all cursor-pointer"
          title="Edit offer"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#e94560]/10">
            <Gift className="w-5 h-5 text-[#e94560]" />
          </div>
          <h2 className="text-xl font-bold text-white">Offers</h2>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Create Offer
        </Button>
      </div>

      {error ? (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={offers}
          title="Offers"
          exportFilename="offers"
          searchable
          searchFields={['title', 'description', 'prize_description']}
          searchPlaceholder="Search offers..."
          exportable
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          emptyMessage="No offers yet. Create your first promotional offer above."
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditId(null); }}
        title={editId ? 'Edit Offer' : 'Create Offer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Offer title"
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prize Value (₹)"
              name="prize_value"
              type="number"
              value={form.prize_value}
              onChange={handleChange}
              placeholder="e.g. 5000"
            />
            <Input
              label="Prize Description"
              name="prize_description"
              value={form.prize_description}
              onChange={handleChange}
              placeholder="e.g. Gold Coin"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Area Filter"
            name="area_filter"
            value={form.area_filter}
            onChange={handleChange}
            placeholder="e.g. Mumbai, Delhi"
          />
          <FileUpload
            label="Banner Image"
            name="banner"
            accept="image/*"
            preview
            onChange={handleChange}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editId ? 'Update Offer' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}
