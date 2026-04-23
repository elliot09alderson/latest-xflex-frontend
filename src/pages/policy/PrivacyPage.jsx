import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';

const LAST_UPDATED = '12 April 2026';

/**
 * Privacy policy covering IT Act 2000 + DPDP Act 2023 requirements.
 * Starter template — have a lawyer review before going live.
 */
export default function PrivacyPage() {
  return (
    <PublicLayout>
      <Seo
        title="Privacy Policy"
        description="How ZXCOM collects, uses, stores and protects your personal information. Compliant with India's IT Act and Digital Personal Data Protection Act."
        path="/privacy"
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-xs text-white/40">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-8 text-sm text-white/70 leading-relaxed">
          <section>
            <p>
              This Privacy Policy describes how ZXCOM (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
              collects, uses and protects information you provide when you use zxcom.in. It is drafted in line
              with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Information we collect</h2>
            <p className="mb-2">We collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Account details:</strong> name, phone number, email, password (stored as a hash).</li>
              <li><strong className="text-white">Order details:</strong> shipping address, billing address, order history.</li>
              <li><strong className="text-white">Payment details:</strong> handled exclusively by Razorpay — we never see or store your card / UPI / bank credentials on our servers.</li>
              <li><strong className="text-white">Device &amp; usage data:</strong> IP address, browser type, pages visited, approximate location (for analytics and fraud prevention).</li>
              <li><strong className="text-white">QR scan data:</strong> if you scan a partner shop&apos;s QR code, we store the shop-customer association for contest eligibility.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and deliver your orders</li>
              <li>To communicate order updates, shipping notifications and refund confirmations</li>
              <li>To enter you into applicable contests and notify winners</li>
              <li>To improve our website, products and customer support</li>
              <li>To detect and prevent fraud, abuse and security incidents</li>
              <li>To comply with legal, regulatory and tax obligations</li>
              <li>To send marketing emails / SMS only if you&apos;ve opted in (you can opt out any time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Who we share your information with</h2>
            <p className="mb-2">We share the minimum necessary information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Razorpay Software Pvt. Ltd.</strong> — for secure payment processing</li>
              <li><strong className="text-white">Courier partners</strong> — to deliver your order (name, phone, address)</li>
              <li><strong className="text-white">Cloud infrastructure providers</strong> — for hosting, email and analytics</li>
              <li><strong className="text-white">Government authorities</strong> — only when required by law (e.g. tax audits, court orders)</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to any third party.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Cookies</h2>
            <p>
              We use cookies and similar technologies to keep you logged in, remember your cart, measure site
              usage, and secure the checkout flow. You can disable cookies in your browser settings, but some
              features of the site may not work correctly if you do.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Data retention</h2>
            <p>
              We retain your account and order data for as long as your account is active or as required to
              provide our services, comply with tax and accounting obligations (typically 8 years for invoices
              under Indian GST law), or resolve disputes. You can request deletion of your account at any time
              by emailing support@zxcom.in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Your rights</h2>
            <p className="mb-2">Under applicable Indian data protection law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or outdated information</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Raise a grievance with our Grievance Officer</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a>{' '}
              with your request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Data security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, password hashing,
              access controls, and audit logs. However, no system is 100% secure and we cannot guarantee
              absolute security of information transmitted over the internet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Children&apos;s data</h2>
            <p>
              ZXCOM is not intended for users under 18. We do not knowingly collect personal data from minors.
              If you believe we have collected data from a minor, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be highlighted on the
              website or sent via email. Continued use of ZXCOM after an update constitutes acceptance of the
              revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Grievance Officer</h2>
            <p>
              In accordance with Rule 5(9) of the IT (Reasonable Security Practices and Procedures) Rules, 2011,
              grievances regarding the handling of your personal data can be addressed to our Grievance Officer:
            </p>
            <address className="not-italic mt-2 text-white/80">
              Grievance Officer — Toran Nishad<br />
              Dhanesh Tranding and Services (ZXCOM)<br />
              Berla, District Bemetara, Chhattisgarh – 491993, India<br />
              Email: <a href="mailto:support@zxcom.in" className="text-[#e94560]">support@zxcom.in</a><br />
              Phone: <a href="tel:+916264824626" className="text-[#e94560]">+91 62648 24626</a>
            </address>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
