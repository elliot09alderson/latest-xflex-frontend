import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, MapPin, Building2, Tag, ArrowRight, ArrowLeft,
  CheckCircle2, PartyPopper, Sparkles, Hash, MapPinned, Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import useRazorpay from '../../hooks/useRazorpay';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import FileUpload from '../ui/FileUpload';
import Spinner from '../ui/Spinner';
import PlanSelector from './PlanSelector';
import TermsAndConditions from '../ui/TermsAndConditions';

const SHOP_CATEGORIES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'general', label: 'General Store' },
  { value: 'other', label: 'Other' },
];

const stepLabels = ['Shop Details', 'Select Plan', 'Payment'];

export default function MerchantRegisterForm() {
  const { user } = useAuth();
  const { initiatePayment } = useRazorpay();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);

  const [shopDetails, setShopDetails] = useState({
    shop_name: '',
    area: '',
    city: '',
    shop_category: '',
    shop_size: '',
    gstin: '',
    pincode: '',
    address: '',
    lat: '',
    lng: '',
    shop_image: null,
  });

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleShopChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setShopDetails((prev) => ({ ...prev, [name]: files[0] || value }));
    } else {
      setShopDetails((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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

      setShopDetails((prev) => ({
        ...prev,
        pincode: pincode || prev.pincode,
        city: city || prev.city,
        area: area || prev.area,
        address: data?.display_name || prev.address,
      }));

      if (pincode) {
        toast.success(`Location detected! Pincode: ${pincode}`);
      } else {
        toast.success('Location detected! Pincode not found — enter manually.');
      }
    } catch {
      toast.error('Could not fetch address from location');
    }
  }, []);

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setShopDetails((prev) => ({ ...prev, lat: latitude.toString(), lng: longitude.toString() }));
        await fetchPincode(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Could not get your location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!shopDetails.shop_name.trim()) newErrors.shop_name = 'Shop name is required';
    if (!shopDetails.area.trim()) newErrors.area = 'Area is required';
    if (!shopDetails.city.trim()) newErrors.city = 'City is required';
    if (!shopDetails.shop_category) newErrors.shop_category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const handlePlanSelect = (planType) => {
    setSelectedPlan(planType);
    setStep(3);
  };

  const handleScreenshotChange = (e) => {
    const { files } = e.target;
    setPaymentScreenshot(files?.[0] || null);
  };

  const handleSubmitRegistration = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions to continue');
      return;
    }
    if (!paymentScreenshot) {
      toast.error('Please upload the payment screenshot');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('plan_type', selectedPlan);
      formData.append('shop_name', shopDetails.shop_name);
      if (shopDetails.area) formData.append('area', shopDetails.area);
      if (shopDetails.city) formData.append('city', shopDetails.city);
      if (shopDetails.shop_category) formData.append('shop_category', shopDetails.shop_category);
      formData.append('payment_screenshot', paymentScreenshot);

      await api.post('/merchants/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      toast.success('Registration submitted! Admin will verify your payment.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <GlassCard className="p-8 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="inline-flex p-4 rounded-full bg-emerald-500/15 mb-4">
            <PartyPopper className="w-12 h-12 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            <Sparkles className="inline w-6 h-6 text-amber-400 mr-2" />
            Welcome Aboard!
            <Sparkles className="inline w-6 h-6 text-amber-400 ml-2" />
          </h2>
          <p className="text-white/60 mb-6">
            Your merchant account has been activated successfully.
            You can now start accepting customer submissions.
          </p>
          <Button
            onClick={() => window.location.href = '/merchant'}
            icon={ArrowRight}
          >
            Go to Dashboard
          </Button>
        </motion.div>

        {/* Confetti-like particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#e94560', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'][i % 5],
              }}
            />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isDone
                      ? '#10b981'
                      : isActive
                        ? '#e94560'
                        : 'rgba(255,255,255,0.1)',
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </motion.div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 rounded-full transition-colors duration-300 ${
                    step > stepNum ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Shop Details</h2>
                <p className="text-sm text-white/50">Tell us about your business</p>
              </div>

              <Input
                label="Shop Name"
                name="shop_name"
                placeholder="Enter your shop name"
                icon={Store}
                value={shopDetails.shop_name}
                onChange={handleShopChange}
                error={errors.shop_name}
                required
              />

              <FileUpload label="Shop Image" name="shop_image" accept="image/*" preview onChange={handleShopChange} />

              <Select
                label="Shop Category"
                name="shop_category"
                placeholder="Select category"
                options={SHOP_CATEGORIES}
                value={shopDetails.shop_category}
                onChange={handleShopChange}
                error={errors.shop_category}
              />

              {/* Shop Size */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-white/80">Shop Size</label>
                <div className="flex gap-2">
                  {['SM', 'MD', 'LG', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setShopDetails((prev) => ({ ...prev, shop_size: size }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                        shopDetails.shop_size === size
                          ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                          : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="GSTIN"
                name="gstin"
                placeholder="GSTIN (optional)"
                icon={Hash}
                value={shopDetails.gstin}
                onChange={handleShopChange}
              />

              {/* Location */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <p className="text-xs text-[#e94560] font-semibold uppercase tracking-wider">Location</p>

                <Button type="button" variant="secondary" icon={Navigation} loading={locating} onClick={getLiveLocation} fullWidth>
                  {locating ? 'Getting Location...' : 'Get Live Location'}
                </Button>

                {shopDetails.lat && shopDetails.lng && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs text-emerald-200/80">
                        Location captured: {parseFloat(shopDetails.lat).toFixed(6)}, {parseFloat(shopDetails.lng).toFixed(6)}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Pincode" name="pincode" placeholder="Pincode" icon={MapPin} value={shopDetails.pincode} onChange={handleShopChange} />
                  <Input
                    label="Area / Locality"
                    name="area"
                    placeholder="e.g. Koramangala"
                    icon={MapPin}
                    value={shopDetails.area}
                    onChange={handleShopChange}
                    error={errors.area}
                    required
                  />
                  <Input
                    label="City"
                    name="city"
                    placeholder="e.g. Bangalore"
                    icon={Building2}
                    value={shopDetails.city}
                    onChange={handleShopChange}
                    error={errors.city}
                    required
                  />
                </div>

                <Input
                  label="Address"
                  name="address"
                  placeholder="Full address"
                  icon={MapPin}
                  value={shopDetails.address}
                  onChange={handleShopChange}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button icon={ArrowRight} onClick={goToStep2}>
                  Next: Choose Plan
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PlanSelector onSelect={handlePlanSelect} loading={loading} />

            <div className="flex justify-start mt-4">
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 text-center space-y-5">
              <h2 className="text-xl font-bold text-white">Complete Payment</h2>
              <p className="text-sm text-white/50">
                Plan: <span className="text-white font-medium capitalize">{selectedPlan}</span>
              </p>

              <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-lg shadow-black/40">
                <img
                  src="/upi-qr-cropped.png"
                  alt="UPI QR Code"
                  className="w-56 h-56 object-contain mx-auto block"
                  draggable={false}
                />
                <p className="text-center text-[10px] text-gray-500 mt-2 font-semibold tracking-wide">
                  Scan with any UPI app
                </p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <p className="text-sm font-medium text-emerald-200/80 mb-1">Scan & Pay via any UPI app</p>
                <p className="text-xs text-white/50 mt-2">After payment, upload the screenshot below</p>
              </div>

              <FileUpload
                label="Payment Screenshot"
                name="payment_screenshot"
                accept="image/*"
                preview
                onChange={handleScreenshotChange}
              />

              <div className="text-left">
                <TermsAndConditions
                  type="merchant"
                  accepted={termsAccepted}
                  onAcceptedChange={setTermsAccepted}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>
                  Back to Plans
                </Button>
                <Button
                  fullWidth
                  icon={CheckCircle2}
                  loading={loading}
                  disabled={!termsAccepted}
                  onClick={handleSubmitRegistration}
                >
                  Submit Registration
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
