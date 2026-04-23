import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Store, Users, ShoppingCart, Heart, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../config/api';

const roleLinks = {
  customer: [
    { path: '/', label: 'Shop' },
    { path: '/orders', label: 'My Orders' },
    { path: '/addresses', label: 'Addresses' },
  ],
  merchant: [
    { path: '/merchant', label: 'Dashboard' },
    { path: '/merchant/profile', label: 'Profile' },
  ],
  promoter: [
    { path: '/promoter', label: 'Dashboard' },
    { path: '/promoter/profile', label: 'Profile' },
  ],
  area_manager: [
    { path: '/promoter', label: 'Dashboard' },
    { path: '/promoter/profile', label: 'Profile' },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/offers', label: 'Offers' },
    { path: '/admin/promoters', label: 'Promoters' },
    { path: '/admin/merchants', label: 'Merchants' },
    { path: '/admin/contests', label: 'Contests' },
    { path: '/admin/config', label: 'Config' },
  ],
};

const guestLinks = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Sign Up' },
  { path: '/register?type=business', label: 'Become a Member' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [credits, setCredits] = useState(null);
  const [shopName, setShopName] = useState('');

  const isPromoter = user?.role === 'promoter' || user?.role === 'area_manager';
  const isMerchant = user?.role === 'merchant';

  // Fetch promoter credits
  useEffect(() => {
    if (!isAuthenticated || !isPromoter) return;
    api.get('/promoters/profile')
      .then((res) => {
        const p = res.data?.data?.promoter || res.data?.promoter || {};
        setCredits({
          shopsUsed: p.total_shops_count || 0,
          shopsMax: p.max_shops_allowed || 0,
          promotersUsed: p.total_promoters_count || 0,
          promotersMax: p.max_promoters_allowed || 0,
        });
      })
      .catch(() => {});
  }, [isAuthenticated, isPromoter]);

  // Fetch merchant shop name
  useEffect(() => {
    if (!isAuthenticated || !isMerchant) return;
    api.get('/merchants/profile')
      .then((res) => {
        const m = res.data?.data?.merchant || res.data?.merchant || {};
        setShopName(m.shop_name || '');
      })
      .catch(() => {});
  }, [isAuthenticated, isMerchant]);

  const links = isAuthenticated && user?.role
    ? roleLinks[user.role] || guestLinks
    : guestLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-[#e94560]'
        : 'text-white/70 hover:text-white'
    }`;

  const activeDot = (
    <motion.span
      layoutId="nav-underline"
      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#e94560] rounded-full"
    />
  );

  const CreditBadge = ({ icon: Icon, used, max, color, label }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" title={`${label}: ${used} / ${max}`}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs font-bold text-white">{used}</span>
      <span className="text-[10px] text-white/30">/</span>
      <span className="text-xs text-white/40">{max}</span>
    </div>
  );

  const IconBadge = ({ icon: Icon, count, onClick, label }) => (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
      title={label}
    >
      <Icon size={20} />
      <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
        count > 0 ? 'bg-[#e94560] text-white' : 'bg-white/10 text-white/40'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#e94560] to-[#c23616] bg-clip-text text-transparent">
              ZXCOM
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass} end>
                {({ isActive }) => (
                  <span className="relative">
                    {link.label}
                    {isActive && activeDot}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Cart / Wishlist / Credits — always visible */}
            <div className="flex items-center gap-1 ml-4 pl-4 border-l border-white/10">
              {/* Credits */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 mr-1" title="Credits">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-white">0</span>
              </div>

              <IconBadge icon={Heart} count={wishlistCount} onClick={() => navigate('/')} label="Wishlist" />
              <IconBadge icon={ShoppingCart} count={cartCount} onClick={() => navigate('/checkout')} label="Cart" />
            </div>

            {isAuthenticated && user && (
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/10">
                {/* Promoter Credits */}
                {isPromoter && credits && (
                  <div className="flex items-center gap-2">
                    <CreditBadge icon={Store} used={credits.shopsUsed} max={credits.shopsMax} color="#10b981" label="Merchant Credits" />
                    <CreditBadge icon={Users} used={credits.promotersUsed} max={credits.promotersMax} color="#3b82f6" label="Promoter Credits" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e94560] to-[#c23616] flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user.name?.charAt(0) || <User size={14} />}
                  </div>
                  <div className="flex flex-col">
                    {isMerchant && shopName && (
                      <span className="text-xs font-semibold text-[#e94560] leading-tight truncate max-w-[140px]">{shopName}</span>
                    )}
                    <span className="text-sm text-white/80 font-medium max-w-[140px] truncate leading-tight">
                      {user.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-white/50 hover:text-[#e94560] hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Credits */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10" title="Credits">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-bold text-white">0</span>
            </div>

            <IconBadge icon={Heart} count={wishlistCount} onClick={() => navigate('/')} label="Wishlist" />
            <IconBadge icon={ShoppingCart} count={cartCount} onClick={() => navigate('/checkout')} label="Cart" />

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-black/40 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Credits */}
              {isPromoter && credits && (
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <CreditBadge icon={Store} used={credits.shopsUsed} max={credits.shopsMax} color="#10b981" label="Merchant Credits" />
                  <CreditBadge icon={Users} used={credits.promotersUsed} max={credits.promotersMax} color="#3b82f6" label="Promoter Credits" />
                </div>
              )}

              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#e94560]/15 text-[#e94560]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated && user && (
                <div className="pt-3 mt-2 border-t border-white/10">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e94560] to-[#c23616] flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-white/80 font-medium">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-[#e94560] hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
