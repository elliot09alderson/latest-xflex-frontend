import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, CheckCircle2, ScrollText } from 'lucide-react';
import { TERMS_BY_TYPE } from '../../data/termsContent';

/**
 * Reusable Terms & Conditions acceptance gate.
 *
 * Props:
 * - type: 'merchant' | 'promoter'       — which T&C to show
 * - accepted: boolean                   — current accepted state (controlled)
 * - onAcceptedChange: (bool) => void    — called when the checkbox toggles
 *
 * Behaviour:
 * - Sections render as an accordion (all start expanded).
 * - The checkbox is disabled until the user scrolls the content area to the bottom.
 * - Shows a "scroll to continue" hint while the user hasn't reached the bottom yet.
 */
export default function TermsAndConditions({ type = 'merchant', accepted, onAcceptedChange }) {
  const terms = TERMS_BY_TYPE[type] || TERMS_BY_TYPE.merchant;

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(terms.sections.map((s) => [s.id, true]))
  );
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef(null);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Allow a small fudge factor so sub-pixel rounding doesn't block acceptance.
    const reached = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
    if (reached && !scrolledToEnd) setScrolledToEnd(true);
  };

  // If the content fits entirely without scrolling, unlock immediately.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 16) {
      setScrolledToEnd(true);
    }
  }, [type, openSections]);

  const handleCheckbox = () => {
    if (!scrolledToEnd) return;
    onAcceptedChange?.(!accepted);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#e94560]/20 to-[#c23616]/10 border border-[#e94560]/20 flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#e94560]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white leading-tight">{terms.title}</h3>
          <p className="text-xs text-white/40 mt-0.5">{terms.subtitle}</p>
        </div>
      </div>

      {/* Scrollable terms body */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-80 overflow-y-auto pr-2 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3
            scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {terms.sections.map((section) => {
            const isOpen = openSections[section.id];
            return (
              <div
                key={section.id}
                className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left
                    hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white/90">{section.heading}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/50 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-0 space-y-1.5">
                        {section.body.map((para, idx) => (
                          <p
                            key={idx}
                            className="text-[12.5px] leading-relaxed text-white/60 whitespace-pre-line"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Tail marker — once visible, the user has effectively scrolled everything */}
          <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            End of Terms
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>

        {/* Scroll hint overlay at bottom */}
        <AnimatePresence>
          {!scrolledToEnd && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-0 right-0 bottom-0 pointer-events-none
                bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent
                pb-2 pt-8 rounded-b-xl flex items-center justify-center"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-[#e94560] font-medium
                bg-[#e94560]/10 border border-[#e94560]/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ScrollText className="w-3.5 h-3.5" />
                Scroll to the end to continue
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Acceptance checkbox */}
      <button
        type="button"
        onClick={handleCheckbox}
        disabled={!scrolledToEnd}
        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left
          ${accepted
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : scrolledToEnd
              ? 'border-white/15 bg-white/5 hover:border-[#e94560]/40 hover:bg-white/10 cursor-pointer'
              : 'border-white/10 bg-white/[0.02] opacity-60 cursor-not-allowed'
          }`}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${accepted
              ? 'bg-emerald-500 border-2 border-emerald-500'
              : 'bg-transparent border-2 border-white/30'
            }`}
        >
          {accepted && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${accepted ? 'text-emerald-300' : 'text-white/90'}`}>
            I have read and agree to the {type === 'promoter' ? 'Promoter' : 'Merchant'} Terms & Conditions
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {scrolledToEnd
              ? 'By ticking this box you confirm your acceptance of all clauses above.'
              : 'Please scroll through all sections before accepting.'}
          </p>
        </div>
      </button>
    </div>
  );
}
