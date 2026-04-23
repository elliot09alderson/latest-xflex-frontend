import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScanPage from './pages/ScanPage';
import NotFound from './pages/NotFound';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddressesPage from './pages/AddressesPage';

// Policy pages (static content, linked from footer)
import AboutPage from './pages/policy/AboutPage';
import ContactPage from './pages/policy/ContactPage';
import TermsPage from './pages/policy/TermsPage';
import PrivacyPage from './pages/policy/PrivacyPage';
import ShippingPage from './pages/policy/ShippingPage';
import RefundPage from './pages/policy/RefundPage';

// Merchant pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantCustomers from './pages/merchant/MerchantCustomers';
import MerchantWinnersPage from './pages/merchant/MerchantWinnersPage';
import MerchantProfile from './pages/merchant/MerchantProfile';

// Promoter pages
import PromoterDashboard from './pages/promoter/PromoterDashboard';
import PromoterProfile from './pages/promoter/PromoterProfile';
import PromoterIdCard from './pages/promoter/PromoterIdCard';
import PromoterQRCodes from './pages/promoter/PromoterQRCodes';
import PromoterNetwork from './pages/promoter/PromoterNetwork';
import PromoterEarnings from './pages/promoter/PromoterEarnings';
import OnboardMerchant from './pages/promoter/OnboardMerchant';
import OnboardPromoter from './pages/promoter/OnboardPromoter';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOffers from './pages/admin/AdminOffers';
import AdminConfig from './pages/admin/AdminConfig';
import AdminPromoters from './pages/admin/AdminPromoters';
import AdminMerchants from './pages/admin/AdminMerchants';
import AdminContests from './pages/admin/AdminContests';
import AdminWinners from './pages/admin/AdminWinners';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminPacks from './pages/admin/AdminPacks';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  const { user } = useAuth();

  const getDashboardRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'merchant': return '/merchant';
      case 'promoter':
      case 'area_manager': return '/promoter';
      default: return '/';
    }
  };

  // Show registration form when arriving via referral link (?ref=XXX),
  // even if a user is already logged in — otherwise the admin/existing
  // user gets redirected to their dashboard and can't complete the
  // promoter signup.
  const RegisterRoute = () => {
    const [searchParams] = useSearchParams();
    const hasRef = !!searchParams.get('ref');
    if (user && !hasRef) return <Navigate to={getDashboardRedirect()} />;
    return <RegisterPage />;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to={getDashboardRedirect()} /> : <LoginPage />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/scan/:qrCodeId" element={<ScanPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />

      {/* Policy pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/shipping" element={<ShippingPage />} />
      <Route path="/refund" element={<RefundPage />} />

      {/* Merchant routes */}
      <Route path="/merchant" element={<ProtectedRoute roles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
      <Route path="/merchant/customers" element={<ProtectedRoute roles={['merchant']}><MerchantCustomers /></ProtectedRoute>} />
      <Route path="/merchant/winners" element={<ProtectedRoute roles={['merchant']}><MerchantWinnersPage /></ProtectedRoute>} />
      <Route path="/merchant/profile" element={<ProtectedRoute roles={['merchant']}><MerchantProfile /></ProtectedRoute>} />

      {/* Promoter routes */}
      <Route path="/promoter" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterDashboard /></ProtectedRoute>} />
      <Route path="/promoter/onboard-merchant" element={<ProtectedRoute roles={['promoter', 'area_manager']}><OnboardMerchant /></ProtectedRoute>} />
      <Route path="/promoter/onboard-promoter" element={<ProtectedRoute roles={['promoter', 'area_manager']}><OnboardPromoter /></ProtectedRoute>} />
      <Route path="/promoter/profile" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterProfile /></ProtectedRoute>} />
      <Route path="/promoter/id-card" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterIdCard /></ProtectedRoute>} />
      <Route path="/promoter/qr-codes" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterQRCodes /></ProtectedRoute>} />
      <Route path="/promoter/network" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterNetwork /></ProtectedRoute>} />
      <Route path="/promoter/earnings" element={<ProtectedRoute roles={['promoter', 'area_manager']}><PromoterEarnings /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/offers" element={<ProtectedRoute roles={['admin']}><AdminOffers /></ProtectedRoute>} />
      <Route path="/admin/config" element={<ProtectedRoute roles={['admin']}><AdminConfig /></ProtectedRoute>} />
      <Route path="/admin/promoters" element={<ProtectedRoute roles={['admin']}><AdminPromoters /></ProtectedRoute>} />
      <Route path="/admin/merchants" element={<ProtectedRoute roles={['admin']}><AdminMerchants /></ProtectedRoute>} />
      <Route path="/admin/contests" element={<ProtectedRoute roles={['admin']}><AdminContests /></ProtectedRoute>} />
      <Route path="/admin/winners" element={<ProtectedRoute roles={['admin']}><AdminWinners /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute roles={['admin']}><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/payouts" element={<ProtectedRoute roles={['admin']}><AdminPayouts /></ProtectedRoute>} />
      <Route path="/admin/packs" element={<ProtectedRoute roles={['admin']}><AdminPacks /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/leaderboard" element={<ProtectedRoute roles={['admin']}><AdminLeaderboard /></ProtectedRoute>} />

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<Navigate to={getDashboardRedirect()} />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
