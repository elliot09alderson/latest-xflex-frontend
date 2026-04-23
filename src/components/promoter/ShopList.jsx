import { Store, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const getFullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : '';

const handleDownloadQR = async (shop) => {
  const imgUrl = getFullUrl(shop.qr_image_url);
  if (!imgUrl) { toast.error('QR not available'); return; }
  try {
    const resp = await fetch(imgUrl);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `qr-${shop.name || shop.qr_code || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    toast.success('QR downloaded!');
  } catch { toast.error('Download failed'); }
};

const handlePrintQR = (shop) => {
  const imgUrl = getFullUrl(shop.qr_image_url);
  if (!imgUrl) { toast.error('QR not available'); return; }
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>QR - ${shop.name}</title>
    <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:sans-serif;}
    .card{text-align:center;padding:30px;}img{width:300px;height:300px;}
    p{margin:8px 0 0;color:#555;font-size:14px;}.name{font-size:18px;font-weight:bold;color:#333;}</style></head>
    <body><div class="card">
    <p class="name">${shop.name}</p>
    <img src="${imgUrl}" />
    <p>${shop.qr_code || ''}</p>
    </div></body></html>
  `);
  win.document.close();
  win.onload = () => { win.print(); };
};

export default function ShopList() {
  const { data, loading } = useFetch('/promoters/network/shops');

  const columns = [
    { key: 'name', label: 'Shop Name' },
    { key: 'owner', label: 'Owner' },
    { key: 'phone', label: 'Phone' },
    { key: 'area', label: 'Area' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge
          text={val === 'active' ? 'Active' : 'Inactive'}
          variant={val === 'active' ? 'success' : 'danger'}
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
    { key: 'submissions', label: 'Submissions' },
    {
      key: 'qr_code',
      label: 'QR Code',
      render: (val, row) => val ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-[#e94560]">{val}</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadQR(row); }}
            className="p-1 rounded text-white/30 hover:text-blue-400 transition-colors cursor-pointer"
            title="Download QR"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrintQR(row); }}
            className="p-1 rounded text-white/30 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Print QR"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : <span className="text-white/20 text-xs">—</span>,
    },
    {
      key: 'joined_date',
      label: 'Joined',
      render: (val) =>
        val ? new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
    },
  ];
  const raw = data?.shops || [];

  const shops = raw.map((s) => ({
    _id: s._id,
    name: s.name || s.shop_name || '',
    owner: s.owner || s.user_id?.name || '',
    phone: s.phone || s.user_id?.phone || '',
    area: s.area || '',
    status: s.status || 'inactive',
    payment_status: s.payment_status || 'pending',
    submissions: s.submissions ?? s.current_month_submissions ?? 0,
    qr_code: s.qr_code || s.assigned_qr_code_id?.code || '',
    qr_image_url: s.qr_image_url || s.assigned_qr_code_id?.qr_image_url || '',
    joined_date: s.joined_date || s.createdAt,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No shops onboarded yet"
        description="Start onboarding merchants to see them here."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={shops}
      emptyMessage="No shops onboarded yet"
    />
  );
}
