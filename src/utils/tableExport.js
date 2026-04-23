// Shared CSV / PDF export helpers used by the admin DataTable and custom table toolbars.
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Given a column definition like { key, label, render, export?, csv? }
 * and a row object, return the plain-text value that should go into the export cell.
 *
 * Precedence:
 *   1. column.export?.(row[key], row)  — explicit export function on the column
 *   2. column.csv?.(row[key], row)     — alias for export
 *   3. a safe plain primitive value of row[key]
 *
 * We intentionally DON'T call column.render — it usually returns React elements
 * (JSX) which can't be stringified cleanly.
 */
function getCellText(column, row) {
  if (typeof column.export === 'function') {
    const v = column.export(row?.[column.key], row);
    return v == null ? '' : String(v);
  }
  if (typeof column.csv === 'function') {
    const v = column.csv(row?.[column.key], row);
    return v == null ? '' : String(v);
  }
  const raw = row?.[column.key];
  if (raw == null) return '';
  if (typeof raw === 'object') {
    // Best-effort fallback for nested refs (Mongo populate)
    if (raw.name) return String(raw.name);
    if (raw.title) return String(raw.title);
    try { return JSON.stringify(raw); } catch { return ''; }
  }
  return String(raw);
}

/**
 * Pick only the columns that should appear in an export.
 * A column is excluded if `exportable: false` (typical for an actions column).
 */
function exportableColumns(columns) {
  return columns.filter((c) => c.exportable !== false && c.key !== '__select' && c.key !== 'actions');
}

/**
 * Export rows to CSV and trigger a browser download.
 * @param {Array} columns - DataTable column defs
 * @param {Array} rows    - data rows
 * @param {string} filename - base name (without extension)
 */
export function exportToCSV(columns, rows, filename = 'export') {
  const cols = exportableColumns(columns);
  const data = rows.map((row) => {
    const out = {};
    cols.forEach((col) => {
      out[col.label || col.key] = getCellText(col, row);
    });
    return out;
  });

  const csv = Papa.unparse(data, { quotes: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${formatStamp()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export rows to a PDF file with a table layout and trigger download.
 */
export function exportToPDF(columns, rows, filename = 'export', title = '') {
  const cols = exportableColumns(columns);
  const head = [cols.map((c) => c.label || c.key)];
  const body = rows.map((row) => cols.map((c) => getCellText(c, row)));

  const doc = new jsPDF({ orientation: cols.length > 5 ? 'landscape' : 'portrait' });

  if (title) {
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
    doc.setTextColor(0);
  }

  autoTable(doc, {
    head,
    body,
    startY: title ? 28 : 14,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [233, 69, 96], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 10, right: 10 },
  });

  doc.save(`${filename}-${formatStamp()}.pdf`);
}

function formatStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
