import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Table as TableIcon, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { Button } from './Button';

interface ExportDropdownProps {
  data: any[];
  fileName: string;
  pdfConfig?: {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: (string | number)[][];
  };
  disabled?: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  fileName,
  pdfConfig,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportToCSV(data, fileName);
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(data, fileName);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    if (pdfConfig) {
      exportToPDF({
        title: pdfConfig.title,
        subtitle: pdfConfig.subtitle,
        headers: pdfConfig.headers,
        rows: pdfConfig.rows,
        fileName,
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left font-alata" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || !data.length}
        onClick={() => setIsOpen(!isOpen)}
        icon={<Download className="w-3.5 h-3.5 text-[#601D49]" />}
      >
        <span>Export</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1 text-black/60" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-48 rounded-2xl bg-white border border-[#BD5579]/20 shadow-wine-md py-1.5 text-xs text-black animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#fdf5f8] transition-colors text-left font-bold"
          >
            <TableIcon className="w-4 h-4 text-[#601D49]" />
            <span className="text-black">Export to CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#fdf5f8] transition-colors text-left font-bold"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#BD5579]" />
            <span className="text-black">Export to Excel (.xlsx)</span>
          </button>
          {pdfConfig && (
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#fdf5f8] transition-colors text-left border-t border-[#BD5579]/15 font-bold"
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span className="text-black">Export to PDF</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
