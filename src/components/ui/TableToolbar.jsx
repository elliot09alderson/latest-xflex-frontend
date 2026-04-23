import { Search, FileDown, FileText, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable toolbar row that sits above any admin table / list:
 * [ search input ]  [ CSV ] [ PDF ] [ Delete All ] [ Delete Selected (N) ]
 *
 * All buttons are conditional on their handler props being passed.
 * Works equally well with the enhanced DataTable and with custom layouts
 * (e.g. card grids in AdminPacks / AdminPayments).
 */
export default function TableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',

  totalCount = 0,
  selectedCount = 0,

  onExportCSV,
  onExportPDF,
  onDeleteAll,
  onDeleteSelected,

  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#e94560]/50 focus:bg-black/40 transition"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Count pill */}
      <div className="flex items-center gap-2 text-[11px] font-medium text-white/50 whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          {totalCount} {totalCount === 1 ? 'record' : 'records'}
        </span>
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-2.5 py-1 rounded-full bg-[#e94560]/15 border border-[#e94560]/40 text-[#e94560]"
            >
              {selectedCount} selected
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export visible rows as CSV"
          >
            <FileDown className="w-3.5 h-3.5" />
            CSV
          </button>
        )}
        {onExportPDF && (
          <button
            type="button"
            onClick={onExportPDF}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 hover:border-sky-500/30 hover:text-sky-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export visible rows as PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
        )}

        <AnimatePresence>
          {onDeleteSelected && selectedCount > 0 && (
            <motion.button
              key="del-selected"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              type="button"
              onClick={onDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:border-red-500/60 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </motion.button>
          )}
        </AnimatePresence>

        {onDeleteAll && (
          <button
            type="button"
            onClick={onDeleteAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs font-medium text-red-300/80 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete every record in this table"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All
          </button>
        )}
      </div>
    </div>
  );
}
