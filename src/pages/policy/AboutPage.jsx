import PublicLayout from '../../components/layout/PublicLayout';
import Seo from '../../components/seo/Seo';
import { Store, Users, Trophy, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicLayout>
      <Seo
        title="About Us"
        description="Learn about ZXCOM — a lifestyle brand on a mission to bring premium t-shirts, signature bags and exclusive contests to customers across India."
        path="/about"
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 prose prose-invert">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">About ZXCOM</h1>
          <p className="text-white/60 text-base">
            Premium t-shirts, signature bags and lifestyle essentials — made for everyday India.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">Who we are</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            ZXCOM is a direct-to-consumer lifestyle brand selling premium-quality apparel and
            accessories on our website <a href="https://zxcom.in" className="text-[#e94560] underline">zxcom.in</a>
            {' '}and through a growing network of partner retail shops across India. Every product in our
            catalogue is designed, sourced, and quality-checked by our team before it reaches you.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">What we do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            {[
              { icon: Store, title: 'Direct-to-Consumer Retail', body: 'Premium t-shirts, bags and lifestyle products sold directly on zxcom.in with free delivery on orders above ₹499.' },
              { icon: Users, title: 'Partner Shops', body: 'A growing network of local retail shops onboarded through our promoter program — each one offering customer rewards and contest entries.' },
              { icon: Trophy, title: 'Customer Contests', body: 'Regular contests and giveaways where customers can win products, vouchers and experience prizes.' },
              { icon: Sparkles, title: 'Quality First', body: 'Every product is quality-checked before dispatch. Easy 7-day returns if something is not right.' },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="p-2 rounded-lg bg-[#e94560]/10 w-fit mb-3">
                  <f.icon className="w-5 h-5 text-[#e94560]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-white/50">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">Our commitment</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We believe shopping should be simple, safe and rewarding. That&apos;s why every ZXCOM
            order comes with secure payments (via Razorpay), transparent pricing with all taxes
            included, a clear refund policy, and responsive customer support. We&apos;re a small
            team building for the long run — and your feedback shapes what we ship next.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-white mb-2">Business Details</h2>
          <dl className="text-sm text-white/70 space-y-1">
            <div className="flex gap-2"><dt className="text-white/40 w-32">Brand:</dt><dd>ZXCOM</dd></div>
            <div className="flex gap-2"><dt className="text-white/40 w-32">Website:</dt><dd>https://zxcom.in</dd></div>
            <div className="flex gap-2"><dt className="text-white/40 w-32">Contact:</dt><dd><a href="/contact" className="text-[#e94560] underline">View contact details</a></dd></div>
          </dl>
        </section>
      </article>
    </PublicLayout>
  );
}
