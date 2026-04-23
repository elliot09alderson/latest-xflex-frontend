import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Users, User, Phone, Lock, Mail, MapPin,
  Building2, Tag, ArrowLeft, ArrowRight, UserPlus,
  CheckCircle, Copy,
  Hash, MapPinned, Navigation, ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Select from '../ui/Select';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import TermsAndConditions from '../ui/TermsAndConditions';
import PromoterPerks from '../ui/PromoterPerks';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const shopCategories = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'general', label: 'General Store' },
  { value: 'other', label: 'Other' },
];

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationDone, setRegistrationDone] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  // `?type=business` switches step-1 to merchant/promoter only. Default
  // (no query) is the shopper signup — we auto-skip the role picker.
  const registerType = searchParams.get('type') === 'business' ? 'business' : 'shopper';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    email: '',
    address: '',
    avatar: null,
    // Merchant fields
    shop_name: '',
    area: '',
    city: '',
    pincode: '',
    shop_category: '',
    shop_size: '',
    gstin: '',
    lat: '',
    lng: '',
    shop_image: null,
    // Promoter fields
    referral_code: refCode,
  });

  // Deep-link handling:
  //   /register?ref=XXX            → pre-select promoter, skip to step 2
  //   /register (no query)         → default to shopper signup, skip step 1
  //   /register?type=business      → show merchant/promoter tile picker
  useEffect(() => {
    if (step !== 1) return;
    if (refCode) {
      setRole('promoter');
      setStep(2);
      return;
    }
    if (registerType === 'shopper') {
      setRole('customer');
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refCode, registerType]);

  const totalSteps = 2;

  const updateField = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] || value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Reverse geocode
  const fetchPincode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      const addr = data?.address || {};
      const pincode = addr.postcode || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const area = addr.suburb || addr.neighbourhood || addr.road || '';
      setForm((prev) => ({
        ...prev,
        pincode: pincode || prev.pincode,
        city: city || prev.city,
        area: area || prev.area,
        address: data?.display_name || prev.address,
      }));
      if (pincode) toast.success(`Location detected! Pincode: ${pincode}`);
      else toast.success('Location detected! Pincode not found — enter manually.');
    } catch {
      toast.error('Could not fetch address from location');
    }
  }, []);

  const getLiveLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation is not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({ ...prev, lat: latitude.toString(), lng: longitude.toString() }));
        await fetchPincode(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === 1 ? 'Location permission denied.' : 'Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const goToStep = (target) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const goToStep2 = (selectedRole) => {
    setRole(selectedRole);
    setDirection(1);
    setStep(2);
  };

  // Upload avatar (non-blocking — don't let this fail registration)
  const uploadAvatar = async (token) => {
    if (!form.avatar) return;
    try {
      const fd = new FormData();
      fd.append('avatar', form.avatar);
      await api.put('/auth/profile', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
    } catch {
      // Avatar upload failed — not critical, continue registration
      console.warn('Avatar upload failed, continuing registration');
    }
  };

  const createAccountAndPromoter = async (token) => {
    // Self-registration: no pack_id. Backend grants 100 merchant credits
    // and auto-activates the promoter.
    const { data: promoterRes } = await api.post('/promoters/register', {
      referral_code: form.referral_code || undefined,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const empId = promoterRes?.data?.promoter?.employee_id || promoterRes?.promoter?.employee_id || promoterRes?.employee_id || '';

    // Upload avatar AFTER promoter record is created (non-blocking)
    await uploadAvatar(token);

    return empId;
  };

  // Handle step 2 form submission
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (role === 'merchant' && (!form.shop_name || !form.area || !form.city)) {
      toast.error('Please fill in all shop details');
      return;
    }

    if (role === 'promoter' && !termsAccepted) {
      toast.error('Please accept the Promoter Terms & Conditions to continue');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role,
        name: form.name,
        phone: form.phone,
        password: form.password,
        email: form.email || undefined,
        address: form.address || undefined,
      };

      const res = await register(payload);
      const token = res?.data?.token || localStorage.getItem('zxcom_token');

      if (role === 'promoter') {
        const empId = await createAccountAndPromoter(token);
        setEmployeeId(empId);
        setRegistrationDone(true);
        toast.success('Registration successful! You are now an active promoter.');
      } else if (role === 'merchant') {
        await uploadAvatar(token);
        toast.success('Account created successfully!');
        navigate('/merchant');
      } else {
        await uploadAvatar(token);
        toast.success('Welcome! Happy shopping.');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyEmployeeId = () => {
    navigator.clipboard.writeText(employeeId);
    toast.success('Employee ID copied!');
  };

  // Success screen after promoter registration
  if (registrationDone) {
    return (
      <GlassCard className="w-full max-w-lg p-5 sm:p-8 mx-auto overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Welcome to the team!</h2>
          <p className="text-white/50 text-sm mb-8">
            You are now an official Zxcom promoter with 100 merchant onboarding credits.
          </p>

          {employeeId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
            >
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                Your Employee ID
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-extrabold text-[#e94560] tracking-widest">
                  {employeeId}
                </p>
                <button
                  onClick={copyEmployeeId}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-xs text-white/30 mb-6">
            Save this ID for future reference. It will also be on your ID card.
          </p>

          <Button fullWidth onClick={() => navigate('/promoter')}>
            Go to Dashboard
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-lg p-5 sm:p-8 mx-auto overflow-hidden">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#e94560] to-[#c23616] bg-clip-text text-transparent">
            ZXCOM
          </span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Create your account</p>
      </motion.div>

      {/* Step Indicator — hidden when direct-entry (shopper or referral) has
          already skipped step 1. */}
      <div className={`flex items-center justify-center gap-3 mb-8 ${
        registerType !== 'business' ? 'hidden' : ''
      }`}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s
                  ? 'bg-gradient-to-r from-[#e94560] to-[#c23616] text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {s}
            </div>
            {s < totalSteps && (
              <div
                className={`w-12 h-0.5 rounded transition-all duration-300 ${
                  step > s ? 'bg-[#e94560]' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 1: Choose Role */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-center text-white/60 text-sm mb-6">
              Become a member — choose how you want to partner with Zxcom
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToStep2('merchant')}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  ${role === 'merchant'
                    ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20'
                    : 'border-white/10 bg-white/5 hover:border-[#e94560]/40 hover:bg-white/10'
                  }
                `}
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10">
                  <Store className="w-8 h-8 text-[#e94560]" />
                </div>
                <span className="text-white font-semibold">Merchant</span>
                <span className="text-white/40 text-xs text-center">
                  List your shop & run campaigns
                </span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToStep2('promoter')}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  ${role === 'promoter'
                    ? 'border-[#e94560] bg-[#e94560]/10 shadow-lg shadow-[#e94560]/20'
                    : 'border-white/10 bg-white/5 hover:border-[#e94560]/40 hover:bg-white/10'
                  }
                `}
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10">
                  <Users className="w-8 h-8 text-[#e94560]" />
                </div>
                <span className="text-white font-semibold">Promoter</span>
                <span className="text-white/40 text-xs text-center">
                  Promote offers & earn rewards
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Your name"
                  icon={User}
                  value={form.name}
                  onChange={updateField}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  icon={Phone}
                  value={form.phone}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  icon={Lock}
                  value={form.password}
                  onChange={updateField}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Email (optional)"
                  icon={Mail}
                  value={form.email}
                  onChange={updateField}
                />
              </div>

              <Input
                label="Address"
                name="address"
                placeholder="Your address"
                icon={MapPin}
                value={form.address}
                onChange={updateField}
              />

              {/* Merchant-specific fields */}
              {role === 'merchant' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-3">Shop Details</p>
                  </div>
                  <Input label="Shop Name" name="shop_name" placeholder="Your shop name" icon={Store} value={form.shop_name} onChange={updateField} required />
                  <FileUpload label="Shop Image" name="shop_image" accept="image/*" preview onChange={updateField} />
                  <Select label="Shop Category" name="shop_category" placeholder="Select category" options={shopCategories} value={form.shop_category} onChange={updateField} />

                  {/* Shop Size */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-white/80">Shop Size</label>
                    <div className="flex gap-2">
                      {['SM', 'MD', 'LG', 'XL', 'XXL'].map((size) => (
                        <button key={size} type="button" onClick={() => setForm((p) => ({ ...p, shop_size: size }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${form.shop_size === size ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'}`}>{size}</button>
                      ))}
                    </div>
                  </div>

                  <Input label="GSTIN" name="gstin" placeholder="GSTIN (optional)" icon={Hash} value={form.gstin} onChange={updateField} />

                  {/* Location */}
                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">Location</p>
                    <Button type="button" variant="secondary" icon={Navigation} loading={locating} onClick={getLiveLocation} fullWidth>
                      {locating ? 'Getting Location...' : 'Get Live Location'}
                    </Button>
                    {form.lat && form.lng && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <MapPinned className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-emerald-200/80">Location captured: {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}</p>
                        </div>
                      </motion.div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="Pincode" name="pincode" placeholder="Pincode" icon={MapPin} value={form.pincode} onChange={updateField} />
                      <Input label="Area" name="area" placeholder="Shop area" icon={MapPin} value={form.area} onChange={updateField} required />
                      <Input label="City" name="city" placeholder="City" icon={Building2} value={form.city} onChange={updateField} required />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Promoter-specific fields */}
              {role === 'promoter' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider mb-3">Promoter Details</p>
                  </div>
                  <Input
                    label={refCode ? 'Referred By' : 'Referral Code'}
                    name="referral_code"
                    placeholder="Enter referral code (optional)"
                    icon={Tag}
                    value={form.referral_code}
                    onChange={updateField}
                    readOnly={!!refCode}
                  />
                  {refCode && (
                    <p className="text-[11px] text-emerald-400/80 -mt-2">
                      You&apos;re signing up through a promoter referral.
                    </p>
                  )}

                  <PromoterPerks />

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-emerald-200">
                      You get 100 free merchant onboarding credits on signup
                    </p>
                    <p className="text-[11px] text-white/50 mt-1">
                      No registration fee. Start onboarding shops right after you accept the terms.
                    </p>
                  </div>
                </motion.div>
              )}

              <FileUpload label="Profile Photo" name="avatar" accept="image/*" preview onChange={updateField} />

              {role === 'promoter' && (
                <div className="border-t border-white/10 pt-5">
                  <TermsAndConditions
                    type="promoter"
                    accepted={termsAccepted}
                    onAcceptedChange={setTermsAccepted}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {/* Only show Back when there's a step-1 picker to return to.
                    Shopper direct-entry and referral auto-select skip step 1. */}
                {registerType === 'business' && !refCode && (
                  <Button
                    variant="secondary"
                    icon={ArrowLeft}
                    onClick={() => goToStep(1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  icon={role === 'merchant' ? Store : (role === 'customer' ? ShoppingBag : UserPlus)}
                  loading={loading}
                  disabled={role === 'promoter' && !termsAccepted}
                >
                  {role === 'merchant' ? 'Create Merchant Account'
                    : role === 'customer' ? 'Create Shopper Account'
                    : 'Create Promoter Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!registrationDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-white/50 mt-6"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#e94560] hover:text-[#e94560]/80 font-medium transition-colors"
          >
            Sign In
          </Link>
        </motion.p>
      )}
    </GlassCard>
  );
}
