import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone, password);
      toast.success('Welcome back!');

      const role = res.data?.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'merchant') navigate('/merchant');
      else if (role === 'promoter' || role === 'area_manager') navigate('/promoter');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md p-8 mx-auto">
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#e94560] to-[#c23616] bg-clip-text text-transparent">
            ZXCOM
          </span>
        </h1>
        <p className="text-white/40 text-sm mt-2">Sign in to your account</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          icon={LogIn}
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-white/50 mt-6"
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-[#e94560] hover:text-[#e94560]/80 font-medium transition-colors"
        >
          Register
        </Link>
      </motion.p>
    </GlassCard>
  );
}
