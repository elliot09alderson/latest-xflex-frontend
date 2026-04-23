import { Link } from 'react-router-dom';

const policyLinks = [
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact Us' },
  { path: '/shipping', label: 'Shipping & Delivery' },
  { path: '/refund', label: 'Cancellation & Refund' },
  { path: '/terms', label: 'Terms & Conditions' },
  { path: '/privacy', label: 'Privacy Policy' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black/30 backdrop-blur-xl border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#e94560] to-[#c23616] bg-clip-text text-transparent">
              ZXCOM
            </span>
            <p className="text-xs text-white/40 mt-2 max-w-xs">
              Premium t-shirts, signature bags and lifestyle essentials. Free delivery on orders above ₹499.
            </p>
          </div>

          {/* Policy links */}
          <div>
            <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Help &amp; Information</h3>
            <ul className="grid grid-cols-2 gap-2">
              {policyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Get in touch</h3>
            <p className="text-xs text-white/60">
              Email:{' '}
              <a href="mailto:support@zxcom.in" className="text-white hover:text-[#e94560] transition-colors">
                support@zxcom.in
              </a>
            </p>
            <p className="text-xs text-white/60 mt-1">
              Phone:{' '}
              <a href="tel:+916264824626" className="text-white hover:text-[#e94560] transition-colors">
                +91 62648 24626
              </a>
            </p>
            <address className="text-[11px] text-white/40 mt-2 not-italic leading-relaxed">
              Berla, District Bemetara,<br />
              Chhattisgarh – 491993, India
            </address>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-white/5">
          <span className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Dhanesh Tranding and Services (ZXCOM). All rights reserved.{' '}
            <span className="text-white/30">GSTIN 22BZOPN6279A1Z9</span>
          </span>
          <span className="text-xs text-white/30">
            Secure payments powered by Razorpay
          </span>
        </div>
      </div>
    </footer>
  );
}
