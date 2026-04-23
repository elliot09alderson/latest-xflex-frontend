import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Flame } from 'lucide-react';

export default function DealBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e94560]/20 via-[#c23616]/10 to-[#e94560]/20 border border-[#e94560]/20"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#e94560]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#c23616]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6">
        {/* Left */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="hidden sm:flex p-3 rounded-2xl bg-[#e94560]/20 border border-[#e94560]/30">
            <Flame className="w-7 h-7 text-[#e94560]" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Flame className="w-5 h-5 text-[#e94560] sm:hidden" />
              <h3 className="text-white font-bold text-lg sm:text-xl">Mega Deal of the Day</h3>
            </div>
            <p className="text-white/50 text-sm mt-0.5">Up to 80% off on trending products</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#e94560]" />
          <div className="flex items-center gap-1.5">
            {[
              { val: pad(timeLeft.hours), label: 'Hrs' },
              { val: pad(timeLeft.minutes), label: 'Min' },
              { val: pad(timeLeft.seconds), label: 'Sec' },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[#e94560] font-bold text-lg">:</span>}
                <div className="flex flex-col items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-bold text-lg min-w-[42px] text-center">
                    {unit.val}
                  </span>
                  <span className="text-white/30 text-[9px] mt-1 uppercase">{unit.label}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e94560] hover:bg-[#d63d56] text-white text-sm font-semibold transition-colors cursor-pointer ml-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
