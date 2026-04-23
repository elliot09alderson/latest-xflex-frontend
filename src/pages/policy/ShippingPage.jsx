import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';
import { Truck, MapPin, Clock, Package } from 'lucide-react';

const LAST_UPDATED = '12 April 2026';

export default function ShippingPage() {
  return (
    <PublicLayout>
      <Seo
        title="Shipping & Delivery"
        description="ZXCOM shipping policy — delivery timelines, charges, tracking, and serviceable pincodes across India."
        path="/shipping"
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Shipping &amp; Delivery Policy</h1>
          <p className="text-xs text-white/40">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Truck, label: 'Free delivery', value: 'On orders above ₹499' },
            { icon: MapPin, label: 'Serviceable area', value: 'Across India (most pincodes)' },
            { icon: Clock, label: 'Delivery time', value: '3 – 7 business days' },
            { icon: Package, label: 'Packaging', value: 'Secure eco-friendly packaging' },
          ].map((b) => (
            <div key={b.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#e94560]/10"><b.icon className="w-5 h-5 text-[#e94560]" /></div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{b.label}</p>
                <p className="text-sm text-white font-medium">{b.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Order processing</h2>
            <p>
              Orders placed on zxcom.in are processed within <strong className="text-white">1 – 2 business
              days</strong> of successful payment confirmation. Orders placed on Sundays and public holidays are
              processed on the next working day. You&apos;ll receive an email or SMS confirmation once your order
              is shipped.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Delivery timelines</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Metro cities</strong> (Bengaluru, Delhi NCR, Mumbai, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad): 3 – 5 business days</li>
              <li><strong className="text-white">Tier 2 cities:</strong> 4 – 7 business days</li>
              <li><strong className="text-white">Remote areas &amp; North-East India:</strong> 5 – 10 business days</li>
            </ul>
            <p className="mt-2">
              Delivery times are estimates from the time your order is shipped (not the time you place the order).
              Delays may occur during festive seasons, weather events or courier strikes — we&apos;ll keep you
              informed if anything affects your order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Shipping charges</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders of <strong className="text-white">₹499 and above:</strong> FREE shipping across India</li>
              <li>Orders <strong className="text-white">below ₹499:</strong> flat ₹49 shipping fee</li>
              <li>Expedited / express shipping is not currently offered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Tracking your order</h2>
            <p>
              Once shipped, you&apos;ll receive a tracking link via email and SMS from our courier partner. You
              can also track your order from &quot;My Orders&quot; after signing into your ZXCOM account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Serviceable pincodes</h2>
            <p>
              We deliver to most pincodes in India via our courier partners. In the rare case your pincode is
              not serviceable, we&apos;ll notify you within 24 hours of your order and issue a full refund.
              You can verify serviceability by entering your pincode during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Failed deliveries</h2>
            <p>
              Our courier partners make up to 3 delivery attempts. If you&apos;re unreachable or unavailable for
              all 3 attempts, the package will be returned to our warehouse. In such cases, re-delivery will be
              at the customer&apos;s expense. For refunds on undelivered orders, please refer to our{' '}
              <a href="/refund" className="text-[#e94560]">Cancellation &amp; Refund Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. International shipping</h2>
            <p>
              At this time, ZXCOM only ships within India. We hope to expand to international destinations soon.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Questions?</h2>
            <p>
              For any shipping-related queries, write to us at{' '}
              <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a> or call{' '}
              <a href="tel:+916264824626" className="text-[#e94560]">+91 62648 24626</a>.
              Orders are shipped from our warehouse at Berla, District Bemetara, Chhattisgarh – 491993.
            </p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
