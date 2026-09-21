import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Export array of objects to CSV file
 */
export function exportToCSV(data: any[], fileName: string) {
  if (!data || !data.length) return;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export array of objects to Excel (.xlsx) file
 */
export function exportToExcel(data: any[], fileName: string, sheetName = 'Data') {
  if (!data || !data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`);
}

/**
 * Export data to formatted PDF report
 */
export function exportToPDF({
  title,
  subtitle,
  headers,
  rows,
  fileName,
}: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
}) {
  const doc = new jsPDF('landscape');

  // Brand Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('STYLE FLEET — EXECUTIVE REPORT', 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 220, 15);

  // Title section
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 36);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 43);
  }

  // Auto table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: subtitle ? 48 : 42,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`${fileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
