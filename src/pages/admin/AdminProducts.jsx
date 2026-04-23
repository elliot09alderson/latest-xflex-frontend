import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Gift, Trophy, Award, Users, Store, Settings, BarChart3,
  Package, UserCheck, Wallet, Plus, Pencil, Trash2, X, IndianRupee,
  ShoppingBag, Truck, Image as ImageIcon, Tag, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import TableToolbar from '../../components/ui/TableToolbar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { exportToCSV, exportToPDF } from '../../utils/tableExport';

const sidebarLinks = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/offers', label: 'Offers', icon: <Gift size={18} /> },
  { path: '/admin/contests', label: 'Contests', icon: <Trophy size={18} /> },
  { path: '/admin/winners', label: 'Winners', icon: <Award size={18} /> },
  { path: '/admin/promoters', label: 'Promoters', icon: <Users size={18} /> },
  { path: '/admin/merchants', label: 'Merchants', icon: <Store size={18} /> },
  { path: '/admin/customers', label: 'Customers', icon: <UserCheck size={18} /> },
  { path: '/admin/payments', label: 'Payments', icon: <Wallet size={18} /> },
  { path: '/admin/payouts', label: 'Payouts', icon: <Wallet size={18} /> },
  { path: '/admin/packs', label: 'Packs', icon: <Package size={18} /> },
  { path: '/admin/products', label: 'Products', icon: <ShoppingBag size={18} /> },
  { path: '/admin/orders', label: 'Orders', icon: <Truck size={18} /> },
  { path: '/admin/config', label: 'Config', icon: <Settings size={18} /> },
  { path: '/admin/leaderboard', label: 'Leaderboard', icon: <BarChart3 size={18} /> },
];

const CLOTHING_CATEGORIES = ['men', 'women', 'kids', 'clothing', 'unisex'];
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORY_OPTIONS = [
  { value: 'men', label: 'Men (Clothing)' },
  { value: 'women', label: 'Women (Clothing)' },
  { value: 'kids', label: 'Kids (Clothing)' },
  { value: 'unisex', label: 'Unisex (Clothing)' },
  { value: 'bags', label: 'Bags' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  original_price: '',
  discount: '',
  images: [],
  stock: '',
  sizes: DEFAULT_SIZES.map((s) => ({ size: s, stock: 0, enabled: false })),
  tag: '',
  rating: '',
  reviews: '',
  free_delivery: true,
  weight_kg: '0.5',
  length_cm: '25',
  breadth_cm: '20',
  height_cm: '3',
  hsn_code: '',
  status: 'active',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmState, setConfirmState] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isClothing = CLOTHING_CATEGORIES.includes(form.category);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data?.data?.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sizes: DEFAULT_SIZES.map((s) => ({ size: s, stock: 0, enabled: false })) });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    const existingSizes = (p.sizes || []).reduce((acc, s) => { acc[s.size] = s.stock; return acc; }, {});
    const sizeRows = DEFAULT_SIZES.map((s) => ({
      size: s,
      stock: existingSizes[s] || 0,
      enabled: existingSizes[s] !== undefined,
    }));
    // Also surface any custom sizes that aren't in DEFAULT_SIZES.
    for (const row of (p.sizes || [])) {
      if (!DEFAULT_SIZES.includes(row.size)) {
        sizeRows.push({ size: row.size, stock: row.stock, enabled: true });
      }
    }
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      price: String(p.price ?? ''),
      original_price: String(p.original_price ?? ''),
      discount: String(p.discount ?? ''),
      images: p.images || [],
      stock: String(p.stock ?? ''),
      sizes: sizeRows,
      tag: p.tag || '',
      rating: String(p.rating ?? ''),
      reviews: String(p.reviews ?? ''),
      free_delivery: Boolean(p.free_delivery),
      weight_kg: String(p.weight_kg ?? '0.5'),
      length_cm: String(p.length_cm ?? '25'),
      breadth_cm: String(p.breadth_cm ?? '20'),
      height_cm: String(p.height_cm ?? '3'),
      hsn_code: p.hsn_code || '',
      status: p.status || 'active',
    });
    setShowForm(true);
  };

  const toggleSizeEnabled = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((row) =>
        row.size === size ? { ...row, enabled: !row.enabled } : row
      ),
    }));
  };

  const updateSizeStock = (size, stock) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((row) =>
        row.size === size ? { ...row, stock: Number(stock) || 0 } : row
      ),
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.post('/upload/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.data?.url;
        if (url) urls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`${urls.length} image${urls.length === 1 ? '' : 's'} uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      toast.error('Name, category and price are required');
      return;
    }
    if (form.images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      original_price: Number(form.original_price) || 0,
      discount: Number(form.discount) || 0,
      images: form.images,
      tag: form.tag,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      free_delivery: Boolean(form.free_delivery),
      weight_kg: Number(form.weight_kg) || 0.5,
      length_cm: Number(form.length_cm) || 25,
      breadth_cm: Number(form.breadth_cm) || 20,
      height_cm: Number(form.height_cm) || 3,
      hsn_code: form.hsn_code,
      status: form.status,
    };

    if (isClothing) {
      const activeSizes = form.sizes.filter((s) => s.enabled && s.size);
      if (activeSizes.length === 0) {
        toast.error('Enable at least one size for clothing products');
        return;
      }
      payload.sizes = activeSizes.map(({ size, stock }) => ({ size, stock: Number(stock) || 0 }));
    } else {
      payload.stock = Number(form.stock) || 0;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (id) => setConfirmState({ type: 'single', id });
  const askDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setConfirmState({ type: 'selected' });
  };
  const askDeleteAll = () => setConfirmState({ type: 'all' });

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === 'single') {
        await api.delete(`/admin/products/${confirmState.id}`);
        toast.success('Product deleted');
      } else if (confirmState.type === 'selected') {
        await api.post('/admin/products/bulk-delete', { ids: Array.from(selectedIds) });
        toast.success(`Deleted ${selectedIds.size} products`);
        setSelectedIds(new Set());
      } else if (confirmState.type === 'all') {
        await api.delete('/admin/products');
        toast.success('All products deleted');
        setSelectedIds(new Set());
      }
      setConfirmState(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = products
    .filter((p) => filterCat === 'all' || p.category === filterCat)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.tag || '').toLowerCase().includes(q)
      );
    });

  const PRODUCT_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', export: (v) => `₹${v || 0}` },
    { key: 'original_price', label: 'MRP', export: (v) => `₹${v || 0}` },
    { key: 'stock', label: 'Stock' },
    { key: 'status', label: 'Status' },
  ];

  const totalStock = (p) => {
    if (CLOTHING_CATEGORIES.includes(p.category)) {
      return (p.sizes || []).reduce((s, r) => s + (r.stock || 0), 0);
    }
    return p.stock || 0;
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <Button icon={Plus} onClick={openCreate}>Add Product</Button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {[{ value: 'all', label: 'All' }, ...CATEGORY_OPTIONS].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterCat(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filterCat === tab.value
                  ? 'bg-[#e94560] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search products..."
          totalCount={filtered.length}
          selectedCount={selectedIds.size}
          onExportCSV={() => exportToCSV(PRODUCT_COLUMNS, filtered, 'products')}
          onExportPDF={() => exportToPDF(PRODUCT_COLUMNS, filtered, 'products', 'Products')}
          onDeleteAll={askDeleteAll}
          onDeleteSelected={askDeleteSelected}
        />

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {editing ? 'Edit Product' : 'New Product'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Product Name" name="name" value={form.name} onChange={updateField} icon={ShoppingBag} required />
                    <Select
                      label="Category"
                      name="category"
                      value={form.category}
                      onChange={updateField}
                      options={CATEGORY_OPTIONS}
                      placeholder="Choose a category"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Price (₹)" name="price" type="number" value={form.price} onChange={updateField} icon={IndianRupee} required />
                    <Input label="MRP (₹)" name="original_price" type="number" value={form.original_price} onChange={updateField} icon={IndianRupee} />
                    <Input label="Discount (%)" name="discount" type="number" value={form.discount} onChange={updateField} />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Product Images <span className="text-[#e94560]">*</span></label>
                    <div className="flex flex-wrap gap-3">
                      {form.images.map((url, idx) => (
                        <div key={url + idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-[#e94560] text-white">Main</span>
                          )}
                        </div>
                      ))}
                      <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center cursor-pointer hover:border-[#e94560]/60 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                        {uploading ? <Spinner size="sm" /> : (
                          <>
                            <Upload className="w-5 h-5 text-white/40 mb-1" />
                            <span className="text-[10px] text-white/40">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Clothing: Sizes grid */}
                  {isClothing ? (
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">
                        Sizes & Stock (clothing)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {form.sizes.map((row) => (
                          <div
                            key={row.size}
                            className={`p-3 rounded-xl border transition-all ${
                              row.enabled
                                ? 'border-[#e94560]/60 bg-[#e94560]/10'
                                : 'border-white/10 bg-white/[0.02]'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={row.enabled}
                                onChange={() => toggleSizeEnabled(row.size)}
                                className="accent-[#e94560]"
                              />
                              <span className="text-white font-semibold text-sm">{row.size}</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              disabled={!row.enabled}
                              value={row.stock}
                              onChange={(e) => updateSizeStock(row.size, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white disabled:opacity-40"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : form.category ? (
                    <Input label="Stock" name="stock" type="number" value={form.stock} onChange={updateField} icon={Package} />
                  ) : null}

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3">Display</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="Tag (Bestseller, New, ...)" name="tag" value={form.tag} onChange={updateField} icon={Tag} />
                      <Input label="Rating (0-5)" name="rating" type="number" step="0.1" value={form.rating} onChange={updateField} />
                      <Input label="Reviews Count" name="reviews" type="number" value={form.reviews} onChange={updateField} />
                    </div>
                    <Input className="mt-4" label="Description" name="description" value={form.description} onChange={updateField} />
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input type="checkbox" name="free_delivery" checked={form.free_delivery} onChange={updateField} className="accent-[#e94560]" />
                      <span className="text-sm text-white/70">Free delivery</span>
                    </label>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3">Shipping (for Shiprocket)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <Input label="Weight (kg)" name="weight_kg" type="number" step="0.01" value={form.weight_kg} onChange={updateField} />
                      <Input label="Length (cm)" name="length_cm" type="number" value={form.length_cm} onChange={updateField} />
                      <Input label="Breadth (cm)" name="breadth_cm" type="number" value={form.breadth_cm} onChange={updateField} />
                      <Input label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={updateField} />
                      <Input label="HSN" name="hsn_code" value={form.hsn_code} onChange={updateField} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={updateField}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </div>

                  <Button type="submit" loading={saving} icon={editing ? Pencil : Plus}>
                    {editing ? 'Update Product' : 'Create Product'}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">
              {filterCat === 'all' ? 'No products yet. Add your first product above.' : `No ${filterCat} products.`}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const isSelected = selectedIds.has(p._id);
              return (
                <GlassCard key={p._id} className={`p-4 ${isSelected ? 'ring-2 ring-[#e94560]/60' : ''}`}>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(p._id)}
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer
                        ${isSelected ? 'bg-[#e94560] border-[#e94560]' : 'bg-transparent border-white/30 hover:border-white/60'}`}
                    >
                      {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                    </button>
                    <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-sm truncate">{p.name}</h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => askDelete(p._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge text={p.category} variant="info" />
                        {p.tag && <Badge text={p.tag} variant="success" />}
                        <span className={`text-xs ${p.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>{p.status}</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#e94560]">₹{p.price}</span>
                        {p.original_price > 0 && (
                          <span className="text-xs text-white/30 line-through">₹{p.original_price}</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        Stock: <span className="text-white/70">{totalStock(p)}</span>
                        {CLOTHING_CATEGORIES.includes(p.category) && p.sizes?.length > 0 && (
                          <span> ({p.sizes.map((s) => `${s.size}:${s.stock}`).join(', ')})</span>
                        )}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={
          confirmState?.type === 'all' ? 'Delete ALL products?'
            : confirmState?.type === 'selected' ? `Delete ${selectedIds.size} selected products?`
              : 'Delete this product?'
        }
        message={
          confirmState?.type === 'all'
            ? `This will permanently delete every product (${products.length}). This cannot be undone.`
            : confirmState?.type === 'selected'
              ? `This will permanently delete ${selectedIds.size} selected ${selectedIds.size === 1 ? 'product' : 'products'}. This cannot be undone.`
              : 'This product will be permanently deleted. This cannot be undone.'
        }
        confirmLabel={confirmState?.type === 'all' ? 'Yes, Delete Everything' : 'Delete'}
        loading={confirmLoading}
        onConfirm={runConfirm}
        onCancel={() => !confirmLoading && setConfirmState(null)}
      />
    </DashboardLayout>
  );
}
