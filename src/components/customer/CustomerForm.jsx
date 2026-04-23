import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, MapPin, Hash, IndianRupee, Camera, Receipt, X } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';

const billRanges = [
  { value: '100-500', label: '₹100 - ₹500' },
  { value: '500-2000', label: '₹500 - ₹2,000' },
  { value: '2000-10000', label: '₹2K - ₹10K' },
  { value: '10000+', label: '₹10,000+' },
];

function MiniUpload({ name, label, icon: Icon, onChange }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange({ target: { name, files: [file] } });
  };

  const clear = () => {
    setPreview(null);
    if (ref.current) ref.current.value = '';
    onChange({ target: { name, files: [] } });
  };

  return (
    <div className="flex-1">
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {preview ? (
        <div className="relative h-24 rounded-xl overflow-hidden border border-white/10">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={clear} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] active:bg-white/[0.06] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icon className="w-5 h-5 text-white/30" />
          <span className="text-xs text-white/30">{label}</span>
        </button>
      )}
    </div>
  );
}

export default function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', phone: '', age: '', address: '', pincode: '',
    bill_range: '', profile_photo: null, bill_image: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (Array.isArray(files)) {
      setForm((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Enter 10-digit number';
    if (!form.bill_range) errs.bill_range = 'Select purchase amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, bill_value: form.bill_range });
  };

  return (
    <GlassCard className="p-5 w-full max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-4">Register here to get exciting offers</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input name="name" label="Full Name" placeholder="Enter your name" value={form.name} onChange={handleChange} icon={User} required error={errors.name} />

          {/* Phone */}
          <Input name="phone" label="Phone Number" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} icon={Phone} required error={errors.phone} />

          {/* Age + Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <Input name="age" label="Age" type="number" placeholder="Age" value={form.age} onChange={handleChange} icon={Calendar} />
            <Input name="pincode" label="Pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} icon={Hash} />
          </div>

          {/* Address */}
          <Input name="address" label="Address" placeholder="Your address (optional)" value={form.address} onChange={handleChange} icon={MapPin} />

          {/* Purchase Range */}
          <div>
            <p className="text-sm font-medium text-white/80 mb-2">
              Purchase Amount <span className="text-[#e94560]">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {billRanges.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, bill_range: range.value }));
                    if (errors.bill_range) setErrors((prev) => ({ ...prev, bill_range: '' }));
                  }}
                  className={`
                    py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2
                    ${form.bill_range === range.value
                      ? 'border-[#e94560] bg-[#e94560]/15 text-[#e94560]'
                      : 'border-white/10 bg-white/5 text-white/50 active:bg-white/10'
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {errors.bill_range && <p className="text-xs text-red-400 mt-1">{errors.bill_range}</p>}
          </div>

          {/* Photo uploads */}
          <div className="grid grid-cols-2 gap-3">
            <MiniUpload name="profile_photo" label="Selfie (optional)" icon={Camera} onChange={handleChange} />
            <MiniUpload name="bill_image" label="Bill Photo (optional)" icon={Receipt} onChange={handleChange} />
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Submit
          </Button>
        </form>
      </motion.div>
    </GlassCard>
  );
}
