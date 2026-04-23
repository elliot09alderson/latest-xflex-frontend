import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';
import { Mail, Phone, MapPin, Clock, FileText } from 'lucide-react';

// Registered business details for ZXCOM's commerce operations.
// Required by Razorpay / Shiprocket / NimbusPost compliance.
const BUSINESS = {
  legal_name: 'Dhanesh Tranding and Services',
  brand: 'ZXCOM',
  proprietor: 'Toran Nishad',
  address_line1: 'Building No./Flat No.: 0, Name Of Premises/Building: S/O SANAT NISHAD',
  address_line2: 'Road: BEMETARA, Village: Parpoda',
  city: 'Berla',
  district: 'Bemetara',
  state: 'Chhattisgarh',
  pincode: '491993',
  country: 'India',
  phone: '+91 62648 24626',
  email: 'support@zxcom.in',
  gstin: '22BZOPN6279A1Z9',
  hours: 'Mon – Sat, 10:00 AM – 7:00 PM IST',
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <Seo
        title="Contact Us"
        description="Get in touch with ZXCOM customer support. Email, phone and business address for all queries."
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BUSINESS.legal_name,
          alternateName: BUSINESS.brand,
          url: 'https://zxcom.in',
          email: BUSINESS.email,
          telephone: BUSINESS.phone,
          taxID: BUSINESS.gstin,
          address: {
            '@type': 'PostalAddress',
            streetAddress: `${BUSINESS.address_line1}, ${BUSINESS.address_line2}`,
            addressLocality: BUSINESS.city,
            addressRegion: BUSINESS.state,
            postalCode: BUSINESS.pincode,
            addressCountry: 'IN',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: BUSINESS.phone,
            contactType: 'customer support',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi'],
          },
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Contact Us</h1>
          <p className="text-white/60 text-sm">
            We&apos;re here to help. Reach out for any questions about orders, returns or partnerships.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
              <Mail className="w-5 h-5 text-[#e94560]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Email</h2>
            <a href={`mailto:${BUSINESS.email}`} className="text-sm text-[#e94560]">{BUSINESS.email}</a>
            <p className="text-xs text-white/40 mt-2">For order support, returns, refunds and general queries.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
              <Phone className="w-5 h-5 text-[#e94560]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Phone</h2>
            <a href={`tel:${BUSINESS.phone.replace(/\s+/g, '')}`} className="text-sm text-[#e94560]">{BUSINESS.phone}</a>
            <p className="text-xs text-white/40 mt-2">Available during business hours.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:col-span-2">
            <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
              <MapPin className="w-5 h-5 text-[#e94560]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Registered Address</h2>
            <address className="text-sm text-white/70 not-italic leading-relaxed">
              <span className="font-semibold text-white">{BUSINESS.legal_name}</span> (trading as {BUSINESS.brand})<br />
              Proprietor: {BUSINESS.proprietor}<br />
              {BUSINESS.address_line1}<br />
              {BUSINESS.address_line2}<br />
              {BUSINESS.city}, District {BUSINESS.district}, {BUSINESS.state} – {BUSINESS.pincode}<br />
              {BUSINESS.country}
            </address>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
              <FileText className="w-5 h-5 text-[#e94560]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">GSTIN</h2>
            <p className="text-sm font-mono text-white/80">{BUSINESS.gstin}</p>
            <p className="text-xs text-white/40 mt-2">Registered in Chhattisgarh (State code 22).</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
              <Clock className="w-5 h-5 text-[#e94560]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Business Hours</h2>
            <p className="text-sm text-white/70">{BUSINESS.hours}</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/40">
          For partnership enquiries (merchant onboarding, promoter programme, bulk orders), please email us with the subject
          &quot;Partnership&quot; and we&apos;ll get back to you within 2 business days.
        </p>
      </article>
    </PublicLayout>
  );
}
