'use client';

import { Printer } from 'lucide-react';

/**
 * Opens the browser print dialog. The visitor picks "Save as PDF" there, so no
 * PDF library is bundled and nothing runs on the server.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-primary no-print"
    >
      <Printer size={16} />
      Download PDF
    </button>
  );
}
