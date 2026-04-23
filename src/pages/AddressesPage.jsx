import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import AddressManager from '../components/ecom/AddressManager';

export default function AddressesPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Saved Addresses</h1>
          <p className="text-sm text-white/50 mt-1">
            Manage up to 4 delivery addresses. Mark one as default for faster checkout.
          </p>
        </motion.div>

        <AddressManager />
      </div>
    </PublicLayout>
  );
}
