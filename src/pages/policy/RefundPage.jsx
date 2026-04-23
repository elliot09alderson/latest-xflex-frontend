import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';
import { RotateCcw, IndianRupee, Clock, XCircle } from 'lucide-react';

const LAST_UPDATED = '12 April 2026';

export default function RefundPage() {
  return (
    <PublicLayout>
      <Seo
        title="Cancellation & Refund Policy"
        description="How to cancel, return, and request a refund for ZXCOM orders. 7-day return window, refund timelines and eligibility criteria."
        path="/refund"
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Cancellation &amp; Refund Policy</h1>
          <p className="text-xs text-white/40">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: RotateCcw, label: 'Return window', value: '7 days from delivery' },
            { icon: IndianRupee, label: 'Refund method', value: 'Back to original payment source' },
            { icon: Clock, label: 'Refund timeline', value: '5 – 10 business days' },
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
            <h2 className="text-lg font-bold text-white mb-2">1. Order cancellation</h2>
            <p>
              You can cancel an order free of charge <strong className="text-white">before it has been
              shipped.</strong> Once an order is shipped, it can no longer be cancelled — you&apos;ll need to
              initiate a return after delivery instead. To cancel, go to &quot;My Orders&quot; and click
              &quot;Cancel Order&quot;, or email us at{' '}
              <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a> with your order number.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Return eligibility</h2>
            <p className="mb-2">A product is eligible for return if ALL of the following are true:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The return request is initiated within <strong className="text-white">7 days</strong> of delivery</li>
              <li>The product is unused, unworn, unwashed and in its original condition</li>
              <li>All tags, labels and original packaging are intact</li>
              <li>The product is not in the &quot;non-returnable&quot; category (listed below)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Non-returnable items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Innerwear, socks, and swimwear — for hygiene reasons</li>
              <li>Products marked &quot;Final Sale&quot; or &quot;Clearance&quot; on the product page</li>
              <li>Gift cards and promotional vouchers</li>
              <li>Products damaged due to customer misuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. How to initiate a return</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Sign in to your account and go to &quot;My Orders&quot;</li>
              <li>Find the order and click &quot;Return Item&quot;</li>
              <li>Select the item(s), reason for return, and upload photos if the product is damaged</li>
              <li>We&apos;ll arrange a free reverse pickup within 2 – 3 business days</li>
              <li>Once we receive and inspect the returned product, we&apos;ll initiate your refund</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Refund processing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Razorpay (UPI / Net Banking / Cards):</strong> 5 – 10 business days from approval</li>
              <li><strong className="text-white">Wallets:</strong> 3 – 5 business days</li>
              <li>Refunds are always processed to the original payment method. We cannot refund to a different bank account or card.</li>
              <li>You&apos;ll receive an email/SMS notification as soon as the refund is initiated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Damaged or wrong product received</h2>
            <p>
              If you receive a product that is damaged, defective, or different from what you ordered,
              please contact us within <strong className="text-white">48 hours of delivery</strong> at{' '}
              <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a>{' '}
              with photos of the product and the packaging. We&apos;ll arrange a free replacement or full refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Failed / undelivered orders</h2>
            <p>
              If your order could not be delivered after 3 attempts by the courier and was returned to us,
              we&apos;ll issue a full refund minus any shipping cost. Prepaid orders are refunded automatically
              within 7 – 10 business days of the package returning to our warehouse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Questions?</h2>
            <p>
              For anything related to cancellations, returns or refunds, reach out via our{' '}
              <a href="/contact" className="text-[#e94560]">Contact page</a> or email us directly at{' '}
              <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a>.
            </p>
          </section>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-white/40">
          <XCircle className="w-3.5 h-3.5" />
          This policy may be updated from time to time. Check this page before initiating a return for the latest rules.
        </div>
      </article>
    </PublicLayout>
  );
}
