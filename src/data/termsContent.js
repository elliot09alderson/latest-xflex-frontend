// Terms & Conditions content for Merchant and Promoter registration.
// Each terms object has an ordered list of accordion sections.

export const MERCHANT_TERMS = {
  title: 'Merchant Terms & Conditions',
  subtitle: 'Please read all sections carefully before accepting',
  effectiveDate: 'Effective from registration date',
  sections: [
    {
      id: 'eligibility',
      heading: '1. Eligibility & Account',
      body: [
        'You must be at least 18 years old and legally authorised to operate the shop or business being registered on Zxcom.',
        'All information you provide (shop name, owner details, GSTIN, address, location, shop image) must be accurate, current, and verifiable. Any misrepresentation may result in immediate termination of your account without refund.',
        'One shop = one merchant account. Duplicate registrations for the same premises are not allowed.',
        'Zxcom reserves the right to verify your details and, at its sole discretion, approve, reject or suspend your account.',
      ],
    },
    {
      id: 'subscription',
      heading: '2. Subscription Pack & Platform Access',
      body: [
        'Zxcom operates on a paid subscription model. You must select and pay for a monthly or yearly pack to access merchant features (customer forms, contests, offers, QR scan registrations, dashboard, reports).',
        'Each pack has a fixed monthly customer-form limit. Once the limit is exhausted, customer submissions for that month will be blocked until the limit resets or you upgrade to a higher pack.',
        'If you fail to renew your subscription on time, or if you choose to unsubscribe, your platform access will be suspended immediately. This includes:',
        '   • Customer form submissions will stop accepting entries.',
        '   • Your merchant QR code will stop working for new customers.',
        '   • Any active offers, contests, and promotions linked to your shop will be disabled.',
        '   • Any pending commission payouts linked to your shop will be stopped.',
        'Reactivation is only possible after clearing any outstanding dues and paying for a fresh subscription cycle. Zxcom is under no obligation to restore data from the suspended period.',
      ],
    },
    {
      id: 'pricing',
      heading: '3. Pricing & Admin Discretion',
      body: [
        'All prices, subscription fees, and pack features are set by the Zxcom admin team and may be revised at any time without prior notice.',
        'Admin reserves the exclusive right to change pricing, pack limits, customer-form caps, and plan features at any time. Continued use of the platform after such changes constitutes acceptance of the new rates.',
        'Zxcom will make reasonable efforts to notify you of material pricing changes via dashboard notifications, but it is your responsibility to stay informed.',
      ],
    },
    {
      id: 'payments',
      heading: '4. Payments & Refunds',
      body: [
        'Payments can be made online (UPI, cards, net banking via Razorpay) or offline (cash / screenshot-based). Offline payments require admin verification before your account is activated.',
        'All subscription fees are strictly non-refundable once the account is activated, except in cases of demonstrable platform failure at Zxcom\'s sole discretion.',
        'If a payment is reversed, disputed or charged back after your account is activated, Zxcom reserves the right to immediately suspend or terminate your account and recover any commissions already credited.',
        'Any taxes, transaction fees, or payment gateway charges are your responsibility unless explicitly stated otherwise.',
      ],
    },
    {
      id: 'conduct',
      heading: '5. Merchant Conduct & Obligations',
      body: [
        'You agree to honour every offer, cashback and prize displayed against your shop on the Zxcom platform. Refusing to fulfill a valid customer redemption is a serious breach and may lead to account termination.',
        'You shall not submit fake customer entries, inflate bill values, or manipulate the platform in any way. Zxcom uses automated and manual fraud detection — offending accounts will be banned and commissions forfeited.',
        'You are solely responsible for the quality of goods and services sold at your shop. Zxcom is a technology platform and does not act as a seller or guarantor for any merchandise.',
        'You shall comply with all applicable laws, including tax laws (GST), consumer protection laws, data protection laws, and local municipal regulations.',
      ],
    },
    {
      id: 'data',
      heading: '6. Customer Data & Privacy',
      body: [
        'Customer information collected through the Zxcom platform (name, phone, age, address, bill image, profile photo) is governed by Zxcom\'s Privacy Policy.',
        'You agree to use customer data strictly for legitimate business purposes within the Zxcom platform. You shall not export, resell, share, or misuse customer contact information outside of Zxcom.',
        'Any breach of customer privacy — including spam marketing, unsolicited calls, or data leakage — will result in immediate termination and potential legal action.',
      ],
    },
    {
      id: 'qr',
      heading: '7. Merchant QR Code',
      body: [
        'Upon successful registration and payment, a unique merchant QR code will be generated for your shop. This QR code is the entry point for customer registrations linked to your shop.',
        'You agree to display the QR code prominently at your shop and not tamper, deface, or duplicate it.',
        'The QR code is tied to your active subscription. If your subscription lapses or your account is suspended, the QR code will stop accepting scans automatically.',
      ],
    },
    {
      id: 'termination',
      heading: '8. Termination & Suspension',
      body: [
        'Zxcom may suspend or terminate your account at any time, with or without notice, for violation of these terms, fraudulent activity, non-payment, or at the direction of law enforcement or regulatory authorities.',
        'Upon termination, your access to the platform, QR code, dashboard, and associated data will be revoked. Pending commissions and unpaid prize dues will be forfeited for accounts terminated due to breach.',
        'You may voluntarily deactivate your account at any time from the dashboard, but no refund will be issued for the unused portion of your subscription.',
      ],
    },
    {
      id: 'liability',
      heading: '9. Limitation of Liability',
      body: [
        'Zxcom provides the platform on an "as-is" and "as-available" basis. We make no warranties regarding uninterrupted service, commission amounts, customer footfall, or revenue generation.',
        'Zxcom\'s total liability to you under any circumstance shall not exceed the subscription fees paid by you in the three months preceding the claim.',
        'Zxcom shall not be liable for any indirect, incidental, consequential or punitive damages, including loss of revenue, goodwill, or data.',
      ],
    },
    {
      id: 'marketing',
      heading: '10. Marketing & Publicity',
      body: [
        'You grant Zxcom a non-exclusive, royalty-free, worldwide licence to use, reproduce and publish your shop name, logo, shop image, merchant jobcard, QR code, and associated branding on Zxcom\'s social media channels (including but not limited to Instagram, Facebook, WhatsApp, YouTube, X/Twitter and LinkedIn), website, ads, and other marketing collateral for the purpose of promoting Zxcom and your shop.',
        'This includes sharing your jobcard, winner announcements, offer highlights, and shop features as part of regular marketing campaigns without requiring separate consent for each post.',
        'Zxcom will make reasonable efforts to present your shop accurately and professionally. If you object to a specific post, you may raise a written request and Zxcom will review and, where appropriate, remove or edit the content at its discretion.',
        'This marketing licence survives the duration of your active subscription for any content already published, but Zxcom will stop creating new promotional content featuring your shop once your account is terminated upon written request.',
      ],
    },
    {
      id: 'acceptance',
      heading: '11. Acceptance',
      body: [
        'By ticking the box below, you confirm that you have read, understood, and agreed to be bound by these Terms & Conditions in full.',
        'You understand that pricing, commission rates and pack features can change at admin\'s discretion, and that your platform access is strictly contingent on an active, paid subscription.',
        'If you do not agree with any part of these terms, please do not proceed with registration.',
      ],
    },
  ],
};

export const PROMOTER_TERMS = {
  title: 'Promoter Terms & Conditions',
  subtitle: 'Please read all sections carefully before accepting',
  effectiveDate: 'Effective from registration date',
  sections: [
    {
      id: 'eligibility',
      heading: '1. Eligibility & Account',
      body: [
        'You must be at least 18 years old and legally eligible to earn commission income in India.',
        'All information you provide (name, phone, email, address, photo) must be accurate and verifiable. Fake or duplicate promoter accounts will be terminated without refund.',
        'You shall not hold more than one active promoter account. Any duplicate accounts discovered will be merged or terminated at Zxcom\'s discretion.',
        'Zxcom reserves the right to verify your identity and conduct background checks before or during your engagement.',
      ],
    },
    {
      id: 'role',
      heading: '2. Your Role as a Promoter',
      body: [
        'As a Zxcom promoter, your primary responsibility is to onboard merchants (shopkeepers) and sub-promoters onto the Zxcom platform.',
        'You will be given an employee ID and a physical/digital ID card. You must carry this when visiting merchants and represent Zxcom honestly.',
        'Each promoter pack has a maximum limit on the number of merchants and sub-promoters you can onboard. You cannot exceed this limit unless you upgrade to a higher pack.',
        'Zxcom does not provide any fixed salary, stipend, benefits, or employment relationship. You are engaged strictly on a commission basis as an independent agent.',
      ],
    },
    {
      id: 'commissions',
      heading: '3. Commissions & Recurring Earnings',
      body: [
        'You will earn commissions on the following events:',
        '   • A one-time commission when you successfully onboard a new merchant and their payment is confirmed.',
        '   • A recurring monthly commission for every active merchant in your network, as long as their subscription remains active and paid.',
        '   • An area-manager override commission on merchants onboarded by sub-promoters in your network — only applicable once you reach Area Manager rank, and only for merchants in the two-level chain directly under you.',
        'Commissions are credited to your Zxcom wallet after the onboarded merchant\'s payment is verified and their account is activated.',
        'IMPORTANT: Recurring merchant commissions are tied to the merchant\'s active subscription. The moment your merchant unsubscribes, defaults on payment, or is suspended by admin, your recurring commission from that merchant will stop immediately — even if you onboarded them earlier.',
        'You are not entitled to any commission for merchants onboarded by other promoters, for inactive merchants, or for reversed/refunded payments.',
      ],
    },
    {
      id: 'pricing',
      heading: '4. Commission Rates & Admin Discretion',
      body: [
        'Commission percentages, rates, and payout structures are set by the Zxcom admin team and may be revised at any time without prior notice.',
        'Admin reserves the exclusive right to change promoter pack prices, merchant pack prices, commission percentages, rank thresholds (e.g. Area Manager targets), and any related reward rules at any time.',
        'Changes to commission structure apply from the effective date of the change. Commissions already credited before a change will not be retroactively adjusted unless they were credited in error or fraud.',
        'Continued use of the platform after a pricing/commission change constitutes acceptance of the new rates.',
      ],
    },
    {
      id: 'payouts',
      heading: '5. Payouts & Taxes',
      body: [
        'Commissions earned will be disbursed to your registered bank account or UPI ID as per the payout schedule decided by Zxcom (typically monthly).',
        'Minimum payout thresholds may apply. Amounts below the threshold will be carried forward to the next cycle.',
        'You are solely responsible for paying any income tax, GST, or other statutory levies on the commissions you earn. Zxcom may deduct TDS where legally required and issue you a TDS certificate.',
        'Any disputed payouts must be raised within 30 days of the payout cycle. After this window, the payout is deemed accepted.',
      ],
    },
    {
      id: 'conduct',
      heading: '6. Promoter Conduct & Obligations',
      body: [
        'You shall represent Zxcom honestly and professionally. You shall not make false promises, misrepresent pack features, guarantee unrealistic returns, or engage in aggressive/deceptive sales tactics.',
        'You shall not submit fake merchants, inflate merchant data, or onboard non-existent shops. Any fraudulent onboarding will result in immediate termination, forfeiture of all unpaid commissions, and potential legal action.',
        'You shall not poach merchants from other promoters\' networks or interfere with other promoters\' earnings.',
        'You shall keep your login credentials, employee ID, and ID card secure. You are fully responsible for any activity under your account.',
        'You shall comply with all applicable laws, including tax laws and data protection laws, in the course of your duties.',
      ],
    },
    {
      id: 'subscription',
      heading: '7. Promoter Subscription & Renewal',
      body: [
        'Your promoter account is activated only after you have paid the promoter pack fee. Offline payments require admin verification.',
        'If your promoter subscription lapses, is not renewed, or is suspended, you will lose access to the promoter dashboard, the ability to onboard new merchants/promoters, and any pending commission payouts will be put on hold.',
        'Zxcom is under no obligation to credit recurring commissions earned during an inactive/suspended period.',
        'All subscription fees are non-refundable once your account is activated.',
      ],
    },
    {
      id: 'data',
      heading: '8. Data Privacy & Confidentiality',
      body: [
        'Merchant and customer data you access via the Zxcom platform is confidential. You shall not export, share, resell, or misuse this data outside the platform.',
        'You agree to use the Zxcom-issued customer contact information strictly for legitimate onboarding and support purposes.',
        'Any breach of data privacy will result in immediate termination and potential legal action.',
      ],
    },
    {
      id: 'termination',
      heading: '9. Termination & Consequences',
      body: [
        'Zxcom may suspend or terminate your account at any time, with or without notice, for violation of these terms, fraudulent activity, non-payment, or at the direction of law enforcement or regulatory authorities.',
        'Upon termination, your access to the dashboard, ID card, and network will be revoked. Any pending commissions linked to fraudulent onboarding will be forfeited.',
        'The merchants you onboarded may continue using Zxcom independently. You are not entitled to any further commission from those merchants after your termination.',
        'You may voluntarily deactivate your account at any time, but no refund will be issued for the unused portion of your subscription.',
      ],
    },
    {
      id: 'liability',
      heading: '10. Limitation of Liability',
      body: [
        'Zxcom provides the platform on an "as-is" and "as-available" basis. We make no warranties about the number of merchants you will onboard, commission amounts you will earn, or the success of your promotional activities.',
        'Zxcom\'s total liability to you under any circumstance shall not exceed the subscription fees paid by you in the three months preceding the claim.',
        'Zxcom shall not be liable for any indirect, incidental, consequential or punitive damages, including loss of expected commission, goodwill, or data.',
      ],
    },
    {
      id: 'marketing',
      heading: '11. Marketing & Publicity',
      body: [
        'You grant Zxcom a non-exclusive, royalty-free, worldwide licence to use, reproduce and publish your name, photo, promoter jobcard, employee ID card, rank achievements, and associated branding on Zxcom\'s social media channels (including but not limited to Instagram, Facebook, WhatsApp, YouTube, X/Twitter and LinkedIn), website, ads, and other marketing collateral for the purpose of promoting Zxcom and recognising promoter performance.',
        'This includes sharing your jobcard, leaderboard milestones, onboarding achievements, and promoter spotlights as part of regular marketing campaigns without requiring separate consent for each post.',
        'Zxcom will make reasonable efforts to present you accurately and professionally. If you object to a specific post, you may raise a written request and Zxcom will review and, where appropriate, remove or edit the content at its discretion.',
        'This marketing licence survives the duration of your active engagement for any content already published, but Zxcom will stop creating new promotional content featuring you once your account is terminated upon written request.',
      ],
    },
    {
      id: 'acceptance',
      heading: '12. Acceptance',
      body: [
        'By ticking the box below, you confirm that you have read, understood, and agreed to be bound by these Terms & Conditions in full.',
        'You understand that commission rates and rules can change at admin\'s discretion, that your recurring commissions depend on your merchants\' active subscriptions, and that you have no guaranteed earnings.',
        'If you do not agree with any part of these terms, please do not proceed with registration.',
      ],
    },
  ],
};

export const TERMS_BY_TYPE = {
  merchant: MERCHANT_TERMS,
  promoter: PROMOTER_TERMS,
};
