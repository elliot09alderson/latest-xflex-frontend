import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import RegisterForm from '../components/auth/RegisterForm';
import Seo from '../components/seo/Seo';

const orbs = [
  { size: 300, x: '15%', y: '25%', color: '#e94560', delay: 0 },
  { size: 220, x: '75%', y: '55%', color: '#c23616', delay: 1.2 },
  { size: 200, x: '55%', y: '15%', color: '#e94560', delay: 2.5 },
  { size: 280, x: '30%', y: '70%', color: '#c23616', delay: 0.5 },
];

export default function RegisterPage() {
  return (
    <PublicLayout>
      <Seo
        title="Create Account"
        description="Create a ZXCOM account to shop premium apparel, track orders and get exclusive member deals."
        path="/register"
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
        <div className="relative z-10 w-full max-w-lg">
          <RegisterForm />
        </div>
      </div>
    </PublicLayout>
  );
}
