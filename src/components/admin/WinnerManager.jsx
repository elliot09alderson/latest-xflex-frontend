import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Award, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

export default function WinnerManager() {
  const { data, loading, error, refetch } = useFetch('/admin/winners');
  const [publishingId, setPublishingId] = useState(null);
  const [bulkPublishing, setBulkPublishing] = useState(false);

  const winners = data?.winners || [];

  const unpublishedCount = winners.filter(
    (w) => !w.published && w.status !== 'published'
  ).length;

  const handlePublish = useCallback(async (winnerId) => {
    setPublishingId(winnerId);
    try {
      await api.put(`/admin/winners/${winnerId}/publish`);
      toast.success('Winner published successfully');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish winner');
    } finally {
      setPublishingId(null);
    }
  }, [refetch]);

  const handleBulkPublish = useCallback(async () => {
    setBulkPublishing(true);
    try {
      const unpublished = winners.filter(
        (w) => !w.published && w.status !== 'published'
      );

      await Promise.all(
        unpublished.map((w) =>
          api.put(`/admin/winners/${w._id || w.id}/publish`)
        )
      );

      toast.success(`${unpublished.length} winner(s) published`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Some publishes failed');
      refetch();
    } finally {
      setBulkPublishing(false);
    }
  }, [winners, refetch]);

  const handleDelete = async (row) => {
    try {
      await api.delete(`/admin/winners/${row._id || row.id}`);
      toast.success('Winner deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };
  const handleBulkDelete = async (rows) => {
    try {
      await api.post('/admin/winners/bulk-delete', { ids: rows.map((r) => r._id || r.id) });
      toast.success(`Deleted ${rows.length} winners`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };
  const handleDeleteAll = async () => {
    try {
      await api.delete('/admin/winners');
      toast.success('All winners deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete all failed');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Winner Name',
      render: (val, row) => val || row.winner_name || '-',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val, row) => val || row.winner_phone || '-',
    },
    {
      key: 'contest_title',
      label: 'Contest',
      render: (val, row) => val || row.contest?.title || '-',
    },
    {
      key: 'prize',
      label: 'Prize',
      render: (val, row) => val || row.prize_description || '-',
    },
    {
      key: 'selected_at',
      label: 'Selected Date',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'published',
      label: 'Published',
      render: (val, row) => {
        const isPublished = val || row.status === 'published';
        return (
          <Badge
            text={isPublished ? 'Yes' : 'No'}
            variant={isPublished ? 'success' : 'warning'}
          />
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      exportable: false,
      render: (_, row) => {
        const id = row._id || row.id;
        const isPublished = row.published || row.status === 'published';

        if (isPublished) {
          return (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published
            </span>
          );
        }

        return (
          <button
            onClick={() => handlePublish(id)}
            disabled={publishingId === id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e94560]/15 text-[#e94560] text-xs font-medium hover:bg-[#e94560]/25 transition-colors cursor-pointer disabled:opacity-50"
          >
            {publishingId === id ? (
              <div className="w-3 h-3 border-2 border-[#e94560]/30 border-t-[#e94560] rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Publish
          </button>
        );
      },
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
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Winners</h2>
            <p className="text-xs text-white/40">{winners.length} total winners</p>
          </div>
        </div>

        {unpublishedCount > 0 && (
          <Button
            icon={Send}
            size="sm"
            onClick={handleBulkPublish}
            loading={bulkPublishing}
          >
            Publish All ({unpublishedCount})
          </Button>
        )}
      </div>

      {error ? (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={winners}
          title="Winners"
          exportFilename="winners"
          searchable
          searchPlaceholder="Search winners..."
          exportable
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          emptyMessage="No winners yet. They'll appear here once contest draws are performed."
        />
      )}
    </motion.div>
  );
}
