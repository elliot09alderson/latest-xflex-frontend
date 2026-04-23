import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';

const LAST_UPDATED = '12 April 2026';

/**
 * Consumer-facing Terms of Service for ZXCOM ecom purchases on zxcom.in.
 * Separate from the Merchant Terms (used during shop onboarding, which live
 * in src/data/termsContent.js).
 *
 * This is a starter template — have a lawyer review before going live.
 */
export default function TermsPage() {
  return (
    <PublicLayout>
      <Seo
        title="Terms & Conditions"
        description="Terms and conditions governing the use of ZXCOM (zxcom.in) and the purchase of products from our online storefront."
        path="/terms"
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Terms &amp; Conditions</h1>
          <p className="text-xs text-white/40">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-8 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ZXCOM website (<a href="https://zxcom.in" className="text-[#e94560]">zxcom.in</a>),
              creating an account, or placing an order, you agree to be bound by these Terms &amp; Conditions
              (&quot;Terms&quot;). If you do not agree, please do not use the website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to place an order on ZXCOM. By placing an order you
              confirm that you are of legal age and capable of entering into a binding contract.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Products &amp; Pricing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices displayed on the website are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to correct any pricing errors and to refuse or cancel orders placed at an incorrect price.</li>
              <li>Product images are for illustration. Actual colour may vary slightly due to display settings.</li>
              <li>Availability of products is not guaranteed; we reserve the right to cancel orders for out-of-stock items with a full refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Orders &amp; Payment</h2>
            <p>
              When you place an order, you are making an offer to purchase. We reserve the right to accept or
              decline your order for any reason. All payments are processed securely via Razorpay. Your order is
              confirmed only after we receive successful payment confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Shipping &amp; Delivery</h2>
            <p>
              Shipping timelines, charges and serviceable areas are described on our{' '}
              <a href="/shipping" className="text-[#e94560]">Shipping &amp; Delivery Policy</a> page.
              Delivery times are estimates only and we are not liable for delays caused by courier partners or
              circumstances outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Returns &amp; Refunds</h2>
            <p>
              Returns and refunds are governed by our{' '}
              <a href="/refund" className="text-[#e94560]">Cancellation &amp; Refund Policy</a>.
              Please review it before placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all
              activity that occurs under your account. Notify us immediately at support@zxcom.in if you
              suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Contests &amp; Promotions</h2>
            <p>
              From time to time, ZXCOM runs contests and promotional giveaways for customers and partner shops.
              Each contest will have its own specific rules published on the contest page. Participation is
              voluntary and no purchase is necessary to enter unless explicitly stated. Winners may be required
              to provide PAN details for prizes above the tax-free threshold under applicable Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Intellectual Property</h2>
            <p>
              All content on this website — including logos, graphics, product designs, photographs, and text — is
              the property of ZXCOM or its licensors and is protected by Indian and international copyright laws.
              You may not reproduce, distribute, or use any content without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, ZXCOM&apos;s total liability for any claim arising out of or
              in connection with your use of the website or purchase of products shall not exceed the amount you
              paid for the specific order in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">11. Governing Law</h2>
            <p>
              ZXCOM is a brand of <strong className="text-white">Dhanesh Tranding and Services</strong>,
              proprietor Toran Nishad, GSTIN 22BZOPN6279A1Z9, registered at Berla, District Bemetara,
              Chhattisgarh – 491993. These Terms are governed by the laws of India. Any disputes shall be
              subject to the exclusive jurisdiction of the courts at Bemetara, Chhattisgarh.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be notified via email or a
              website banner. Your continued use of ZXCOM after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">13. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a> or via our{' '}
              <a href="/contact" className="text-[#e94560]">Contact page</a>.
            </p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
