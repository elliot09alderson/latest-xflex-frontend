import { Users } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'employee_id', label: 'Employee ID' },
  {
    key: 'status',
    label: 'Status',
    render: (val) => (
      <Badge
        text={val === 'active' ? 'Active' : val === 'inactive' ? 'Inactive' : 'Pending'}
        variant={val === 'active' ? 'success' : val === 'inactive' ? 'danger' : 'warning'}
      />
    ),
  },
  {
    key: 'payment_status',
    label: 'Payment',
    render: (val) => (
      <Badge
        text={val === 'paid' ? 'Paid' : 'Pending'}
        variant={val === 'paid' ? 'success' : 'warning'}
      />
    ),
  },
  { key: 'shops_count', label: 'Shops' },
  { key: 'promoters_count', label: 'Promoters' },
  {
    key: 'joined_date',
    label: 'Joined',
    render: (val) =>
      val ? new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
  },
];

export default function PromoterList() {
  const { data, loading } = useFetch('/promoters/network/promoters');
  const raw = data?.promoters || [];

  // Flatten in case backend returns nested user_id
  const promoters = raw.map((p) => ({
    _id: p._id,
    name: p.name || p.user_id?.name || '',
    phone: p.phone || p.user_id?.phone || '',
    employee_id: p.employee_id || '',
    status: p.status || p.user_id?.status || 'inactive',
    payment_status: p.payment_status || 'pending',
    rank: p.rank || 'promoter',
    shops_count: p.shops_count ?? p.total_shops_count ?? 0,
    promoters_count: p.promoters_count ?? p.total_promoters_count ?? 0,
    joined_date: p.joined_date || p.createdAt,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (promoters.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No promoters referred yet"
        description="Share your referral code to grow your promoter network."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={promoters}
      emptyMessage="No promoters referred yet"
    />
  );
}
