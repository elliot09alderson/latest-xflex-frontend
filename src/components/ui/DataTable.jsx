import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Trash2, Check } from 'lucide-react';
import TableToolbar from './TableToolbar';
import ConfirmDialog from './ConfirmDialog';
import { exportToCSV, exportToPDF } from '../../utils/tableExport';

/**
 * Reusable admin DataTable.
 *
 * --- Required props ---
 *   columns: [{ key, label, render?, export?, exportable?: false }]
 *   data: array of row objects
 *
 * --- Optional props (all backward compatible — omit to keep old behaviour) ---
 *   emptyMessage: string                         — shown when no rows
 *   title: string                                — used as PDF title
 *   exportFilename: string                       — base filename for CSV/PDF (default 'export')
 *
 *   searchable: boolean                          — if true, shows a search box in the toolbar
 *   searchFields: string[]                       — keys to match against; default = all column.key
 *   searchPlaceholder: string
 *
 *   exportable: boolean                          — if true, adds CSV + PDF export buttons
 *
 *   rowId: (row) => string | string              — unique id extractor (default row._id || row.id)
 *   onDelete: (row) => Promise<void> | void      — shows delete icon on each row
 *   onBulkDelete: (rows) => Promise<void> | void — shows checkbox column + "Delete Selected"
 *   onDeleteAll: () => Promise<void> | void      — shows "Delete All" button in toolbar
 *   deleteConfirmMessage: (count) => string      — custom confirm message
 */
export default function DataTable({
  columns = [],
  data = [],
  emptyMessage = 'No data available',

  title = '',
  exportFilename = 'export',

  searchable = false,
  searchFields,
  searchPlaceholder = 'Search...',

  exportable = false,

  rowId,
  onDelete,
  onBulkDelete,
  onDeleteAll,
  deleteConfirmMessage,
}) {
  const getRowId = useCallback(
    (row) => {
      if (typeof rowId === 'function') return rowId(row);
      if (typeof rowId === 'string') return row?.[rowId];
      return row?._id || row?.id;
    },
    [rowId]
  );

  // --- Search filtering (client-side) ---
  const [search, setSearch] = useState('');
  const filteredData = useMemo(() => {
    if (!searchable || !search.trim()) return data;
    const q = search.trim().toLowerCase();
    const fields = searchFields && searchFields.length > 0
      ? searchFields
      : columns.map((c) => c.key).filter(Boolean);

    return data.filter((row) =>
      fields.some((k) => {
        const v = row?.[k];
        if (v == null) return false;
        if (typeof v === 'object') {
          // Check nested name/title for populated refs
          return (v.name && String(v.name).toLowerCase().includes(q))
            || (v.title && String(v.title).toLowerCase().includes(q));
        }
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [searchable, search, searchFields, columns, data]);

  // --- Selection state ---
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectionEnabled = Boolean(onBulkDelete);

  const visibleIds = useMemo(() => filteredData.map(getRowId).filter(Boolean), [filteredData, getRowId]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // --- Confirm dialogs ---
  const [confirmState, setConfirmState] = useState(null); // { type: 'single'|'selected'|'all', row?, count }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(columns, filteredData, exportFilename);
  };
  const handleExportPDF = () => {
    exportToPDF(columns, filteredData, exportFilename, title);
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === 'single' && onDelete) {
        await onDelete(confirmState.row);
      } else if (confirmState.type === 'selected' && onBulkDelete) {
        const rows = filteredData.filter((r) => selectedIds.has(getRowId(r)));
        await onBulkDelete(rows);
        clearSelection();
      } else if (confirmState.type === 'all' && onDeleteAll) {
        await onDeleteAll();
        clearSelection();
      }
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const defaultConfirmMessage = (count, type) => {
    if (deleteConfirmMessage) return deleteConfirmMessage(count, type);
    if (type === 'all') return `This will permanently delete every single record (${count}) from this table. This cannot be undone.`;
    if (type === 'selected') return `This will permanently delete ${count} selected ${count === 1 ? 'record' : 'records'}. This cannot be undone.`;
    return 'This record will be permanently deleted. This cannot be undone.';
  };

  // --- Render ---
  const showToolbar = searchable || exportable || onDeleteAll || selectionEnabled;
  const actionColumnCount = (selectionEnabled ? 1 : 0) + (onDelete ? 1 : 0);

  return (
    <div className="w-full space-y-3">
      {showToolbar && (
        <TableToolbar
          searchValue={searchable ? search : ''}
          onSearchChange={searchable ? setSearch : undefined}
          searchPlaceholder={searchPlaceholder}
          totalCount={filteredData.length}
          selectedCount={selectedIds.size}
          onExportCSV={exportable ? handleExportCSV : undefined}
          onExportPDF={exportable ? handleExportPDF : undefined}
          onDeleteAll={onDeleteAll ? () => setConfirmState({ type: 'all', count: data.length }) : undefined}
          onDeleteSelected={
            selectionEnabled
              ? () => selectedIds.size > 0 && setConfirmState({ type: 'selected', count: selectedIds.size })
              : undefined
          }
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/10">
              {selectionEnabled && (
                <th className="px-3 py-3.5 w-10">
                  <SelectBox
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && someVisibleSelected}
                    onChange={toggleAllVisible}
                    disabled={visibleIds.length === 0}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 sm:px-5 py-3 sm:py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {onDelete && (
                <th className="px-3 sm:px-5 py-3 sm:py-3.5 w-10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap text-right">
                  {/* trash header left empty for compactness */}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + actionColumnCount} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-white/30">
                    <Inbox className="w-10 h-10" />
                    <p className="text-sm">
                      {search.trim() ? 'No records match your search.' : emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => {
                const id = getRowId(row);
                const isSelected = id != null && selectedIds.has(id);
                return (
                  <tr
                    key={id ?? i}
                    className={`
                      border-b border-white/5 transition-colors duration-150
                      ${isSelected ? 'bg-[#e94560]/10' : 'hover:bg-white/[0.04]'}
                      ${!isSelected && i % 2 === 1 ? 'bg-white/[0.02]' : ''}
                    `}
                  >
                    {selectionEnabled && (
                      <td className="px-3 py-3.5">
                        <SelectBox
                          checked={isSelected}
                          onChange={() => id != null && toggleOne(id)}
                          disabled={id == null}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 sm:px-5 py-3 sm:py-3.5 text-sm text-white/80 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {onDelete && (
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setConfirmState({ type: 'single', row, count: 1 })}
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
                          title="Delete this record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={
          confirmState?.type === 'all'
            ? 'Delete ALL records?'
            : confirmState?.type === 'selected'
              ? `Delete ${confirmState.count} selected records?`
              : 'Delete this record?'
        }
        message={
          confirmState
            ? defaultConfirmMessage(confirmState.count, confirmState.type)
            : ''
        }
        confirmLabel={
          confirmState?.type === 'all' ? 'Yes, Delete Everything' : 'Delete'
        }
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => !confirmLoading && setConfirmState(null)}
      />
    </div>
  );
}

function SelectBox({ checked, indeterminate, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all border
        ${checked || indeterminate
          ? 'bg-[#e94560] border-[#e94560]'
          : 'bg-transparent border-white/30 hover:border-white/60'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-checked={checked}
      role="checkbox"
    >
      {indeterminate && !checked && <span className="block w-2 h-0.5 bg-white rounded" />}
      {checked && <Check className="w-3 h-3 text-white" />}
    </button>
  );
}
