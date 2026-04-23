import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Trophy, User, Search, X, Eye, Image,
  Phone, MapPin, Calendar, IndianRupee, Filter, ChevronDown, UserCircle,
  Clock, TrendingUp, Repeat, Receipt, ChevronUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useFetch from '../../hooks/useFetch';
import Spinner from '../../components/ui/Spinner';

const sidebarLinks = [
  { path: '/merchant', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/merchant/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { path: '/merchant/winners', label: 'Winners', icon: <Trophy className="w-4 h-4" /> },
  { path: '/merchant/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ── Stat Mini Card ──
function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-white font-bold text-lg leading-none">{value}</p>
        <p className="text-white/40 text-[11px] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Visit Row (inside expanded detail) ──
function VisitRow({ visit, index }) {
  const [showBill, setShowBill] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
        <span className="text-white/20 text-xs w-5 text-center">{index + 1}</span>
        <span className="text-white/60 text-sm flex-1">{formatDate(visit.date)}</span>
        <span className="text-white font-medium text-sm min-w-[70px] text-right">
          {visit.bill_value ? `₹${visit.bill_value}` : '--'}
        </span>
        {visit.offer?.title && (
          <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-[#e94560]/10 text-[#e94560] text-[10px] font-medium truncate max-w-[120px]">
            {visit.offer.title}
          </span>
        )}
        {visit.bill_image_url && (
          <button
            onClick={() => setShowBill(true)}
            className="p-1 rounded-md bg-white/5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bill Image Popup */}
      <AnimatePresence>
        {showBill && visit.bill_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBill(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full rounded-2xl bg-[#1a1a2e] border border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h4 className="text-white font-semibold text-sm">Bill — {formatDate(visit.date)}</h4>
                <button onClick={() => setShowBill(false)} className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex justify-center">
                <img src={visit.bill_image_url} alt="Bill" className="max-w-full max-h-[65vh] rounded-xl object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Customer Detail Modal ──
function CustomerDetailModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">Customer Details</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center py-6 border-b border-white/5">
            {customer.profile_photo_url ? (
              <img src={customer.profile_photo_url} alt={customer.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#e94560]/40 shadow-lg shadow-[#e94560]/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e94560]/30 to-[#c23616]/20 flex items-center justify-center border-2 border-[#e94560]/30">
                <span className="text-3xl font-bold text-white/60">{customer.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <h4 className="text-white font-semibold text-lg mt-3">{customer.name}</h4>
            <p className="text-white/40 text-sm">{customer.phone}</p>
            {customer.total_visits > 1 && (
              <span className="mt-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold">
                {customer.total_visits} visits — Repeat Customer
              </span>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 p-5 border-b border-white/5">
            <div className="text-center">
              <p className="text-white font-bold text-lg">₹{customer.total_bill_value}</p>
              <p className="text-white/30 text-[10px] uppercase">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{customer.total_visits}</p>
              <p className="text-white/30 text-[10px] uppercase">Visits</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">₹{customer.total_visits > 0 ? Math.round(customer.total_bill_value / customer.total_visits) : 0}</p>
              <p className="text-white/30 text-[10px] uppercase">Avg Bill</p>
            </div>
          </div>

          {/* Info Fields */}
          <div className="p-5 space-y-2.5">
            {[
              { icon: UserCircle, label: 'Name', value: customer.name },
              { icon: Phone, label: 'Phone', value: customer.phone },
              { icon: Calendar, label: 'First Visit', value: formatDate(customer.first_visit) },
              { icon: Clock, label: 'Last Visit', value: formatDate(customer.last_visit) },
              { icon: MapPin, label: 'Address', value: customer.address || '--' },
              { icon: MapPin, label: 'Pincode', value: customer.pincode || '--' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                <f.icon className="w-4 h-4 text-white/25 flex-shrink-0" />
                <span className="text-white/35 text-sm w-20 flex-shrink-0">{f.label}</span>
                <span className="text-white text-sm font-medium truncate">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Visit History */}
          <div className="px-5 pb-5">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-3">Visit History</p>
            <div className="space-y-1.5">
              {customer.visits?.map((visit, i) => (
                <VisitRow key={visit._id} visit={visit} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Customer Row (Desktop) ──
function CustomerRow({ customer, index, onView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
        <td className="px-5 py-3.5 text-white/30 text-xs">{index + 1}</td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            {customer.profile_photo_url ? (
              <img src={customer.profile_photo_url} alt={customer.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs font-medium text-white/50">{customer.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div>
              <span className="text-white text-sm font-medium">{customer.name}</span>
              {customer.total_visits > 1 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[9px] font-bold">
                  {customer.total_visits}x
                </span>
              )}
              {isToday(customer.last_visit) && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[9px] font-bold uppercase">New</span>
              )}
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5 text-white/40 text-sm font-mono">{customer.phone}</td>
        <td className="px-5 py-3.5 text-white font-semibold text-sm">₹{customer.total_bill_value}</td>
        <td className="px-5 py-3.5 text-white/60 text-sm">{customer.total_visits}</td>
        <td className="px-5 py-3.5 text-white/50 text-sm">{formatDate(customer.last_visit)}</td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(customer)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#e94560]/15 text-white/40 hover:text-[#e94560] transition-all cursor-pointer"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {customer.total_visits > 1 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                title="Expand visits"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded visit rows */}
      {expanded && customer.visits?.map((visit, i) => (
        <tr key={visit._id} className="bg-white/[0.015] border-b border-white/[0.03]">
          <td className="px-5 py-2"></td>
          <td className="px-5 py-2 text-white/30 text-xs pl-16">Visit {i + 1}</td>
          <td className="px-5 py-2"></td>
          <td className="px-5 py-2 text-white/60 text-xs">{visit.bill_value ? `₹${visit.bill_value}` : '--'}</td>
          <td className="px-5 py-2">
            {visit.offer?.title && (
              <span className="px-2 py-0.5 rounded-md bg-[#e94560]/10 text-[#e94560] text-[10px] font-medium">{visit.offer.title}</span>
            )}
          </td>
          <td className="px-5 py-2 text-white/40 text-xs">{formatDate(visit.date)}</td>
          <td className="px-5 py-2">
            {visit.bill_image_url && (
              <BillImageButton url={visit.bill_image_url} date={visit.date} />
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Bill Image Button (mini) ──
function BillImageButton({ url, date }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(true)} className="p-1 rounded-md bg-white/5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer">
        <Image className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow(false)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="relative max-w-lg w-full rounded-2xl bg-[#1a1a2e] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h4 className="text-white font-semibold text-sm">Bill — {formatDate(date)}</h4>
                <button onClick={() => setShow(false)} className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 flex justify-center"><img src={url} alt="Bill" className="max-w-full max-h-[65vh] rounded-xl object-contain" /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Customer Card (Mobile) ──
function CustomerCard({ customer, index, onView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start gap-3">
        {customer.profile_photo_url ? (
          <img src={customer.profile_photo_url} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white/50">{customer.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold text-sm truncate">{customer.name}</h4>
            {customer.total_visits > 1 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[9px] font-bold flex-shrink-0">{customer.total_visits}x</span>
            )}
            {isToday(customer.last_visit) && (
              <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[9px] font-bold uppercase flex-shrink-0">Today</span>
            )}
          </div>
          <p className="text-white/30 text-xs mt-0.5 font-mono">{customer.phone}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white font-semibold text-sm flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-white/40" />₹{customer.total_bill_value}
            </span>
            {customer.total_visits > 1 && (
              <span className="text-white/30 text-[10px] flex items-center gap-1">
                <Repeat className="w-3 h-3" />{customer.total_visits} visits
              </span>
            )}
            <span className="text-white/25 text-xs ml-auto flex-shrink-0">{formatDate(customer.last_visit)}</span>
          </div>
        </div>
        <button onClick={() => onView(customer)} className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560]/15 text-white/40 hover:text-[#e94560] transition-all cursor-pointer flex-shrink-0">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ──
export default function MerchantCustomers() {
  const { data, loading, error } = useFetch('/merchants/customers');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = data?.customers || [];
  const totalEntries = data?.total_entries || 0;

  // Stats
  const totalCustomers = customers.length;
  const todayCustomers = customers.filter((c) => isToday(c.last_visit)).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_bill_value || 0), 0);
  const repeatCustomers = customers.filter((c) => c.total_visits > 1).length;

  // Filter & Sort
  const filtered = useMemo(() => {
    let list = [...customers];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.pincode?.includes(q)
      );
    }

    switch (sortBy) {
      case 'newest': list.sort((a, b) => new Date(b.last_visit) - new Date(a.last_visit)); break;
      case 'oldest': list.sort((a, b) => new Date(a.first_visit) - new Date(b.first_visit)); break;
      case 'name': list.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'bill-high': list.sort((a, b) => b.total_bill_value - a.total_bill_value); break;
      case 'visits': list.sort((a, b) => b.total_visits - a.total_visits); break;
      default: break;
    }

    return list;
  }, [customers, search, sortBy]);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Merchant">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-white/40 text-sm mt-1">
            {totalCustomers} unique customers from {totalEntries} total submissions
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatMini icon={Users} label="Unique Customers" value={totalCustomers} color="#3b82f6" />
              <StatMini icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="#10b981" />
              <StatMini icon={Repeat} label="Repeat Customers" value={repeatCustomers} color="#f59e0b" />
              <StatMini icon={Clock} label="Active Today" value={todayCustomers} color="#e94560" />
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, address, pincode..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none placeholder:text-white/25 focus:border-[#e94560] focus:shadow-[0_0_0_3px_rgba(233,69,96,0.15)] transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="relative flex-shrink-0">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none appearance-none cursor-pointer focus:border-[#e94560] transition-all min-w-[170px]"
                >
                  <option value="newest" className="bg-[#1a1a2e]">Last Visit: Recent</option>
                  <option value="oldest" className="bg-[#1a1a2e]">First Visit: Oldest</option>
                  <option value="name" className="bg-[#1a1a2e]">Name A–Z</option>
                  <option value="bill-high" className="bg-[#1a1a2e]">Total Spent: High</option>
                  <option value="visits" className="bg-[#1a1a2e]">Most Visits</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {search && (
              <p className="text-white/30 text-xs">
                Showing <span className="text-white font-semibold">{filtered.length}</span> of {totalCustomers} customers
              </p>
            )}

            {/* Empty */}
            {customers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No Customers Yet</h3>
                <p className="text-white/40 text-sm max-w-sm">
                  Customers who submit bills at your shop will appear here. Share your QR code to get started.
                </p>
              </div>
            )}

            {customers.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <Search className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-white/40 text-sm">No customers match &quot;{search}&quot;</p>
              </div>
            )}

            {/* Desktop Table */}
            {filtered.length > 0 && (
              <div className="hidden md:block rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Phone</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Total Spent</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Visits</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Last Visit</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((customer, idx) => (
                      <CustomerRow key={customer._id} customer={customer} index={idx} onView={setSelectedCustomer} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            {filtered.length > 0 && (
              <div className="md:hidden space-y-3">
                {filtered.map((customer, idx) => (
                  <CustomerCard key={customer._id} customer={customer} index={idx} onView={setSelectedCustomer} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </DashboardLayout>
  );
}
