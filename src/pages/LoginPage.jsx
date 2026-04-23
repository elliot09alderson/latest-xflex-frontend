import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import LoginForm from '../components/auth/LoginForm';
import Seo from '../components/seo/Seo';

const orbs = [
  { size: 320, x: '10%', y: '20%', color: '#e94560', delay: 0 },
  { size: 240, x: '80%', y: '60%', color: '#c23616', delay: 1.5 },
  { size: 180, x: '60%', y: '10%', color: '#e94560', delay: 3 },
  { size: 260, x: '25%', y: '75%', color: '#c23616', delay: 0.8 },
];

export default function LoginPage() {
  return (
    <PublicLayout>
      <Seo
        title="Sign In"
        description="Sign in to your ZXCOM account to track orders, manage your wishlist and shop faster."
        path="/login"
        noindex
      />
      <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Floating gradient orbs */}
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color}15 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 8,
              delay: orb.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Form */}
        <div className="relative z-10 w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </PublicLayout>
  );
}
