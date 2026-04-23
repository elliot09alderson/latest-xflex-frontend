import { useCallback, useRef } from 'react';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export default function useRazorpay() {
  const loadedRef = useRef(false);

  const initiatePayment = useCallback(async ({ amount, order_id, handler, prefill = {} }) => {
    if (!loadedRef.current) {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      loadedRef.current = true;
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available');
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      order_id,
      name: 'Zxcom',
      description: 'Gym Membership Payment',
      handler,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
      },
      theme: {
        color: '#e94560',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    return razorpay;
  }, []);

  return { initiatePayment };
}
