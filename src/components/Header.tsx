import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  onExportBundle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportBundle }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-8">
        <a
          href="#top"
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          PD0150 Vision Workbench
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#selection" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Selection
          </a>
          <a href="#code-bigo" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Big-O Code
          </a>
          <a href="#root-causes" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Root Causes
          </a>
          <a href="#nist-csf" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            NIST CSF
          </a>
          <a href="#github-legal" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            GitHub Legal
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportBundle}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export Bundle
          </button>
        </div>
      </div>
    </header>
  );
};
