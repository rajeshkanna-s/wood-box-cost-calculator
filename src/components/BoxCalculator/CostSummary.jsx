import React from 'react';

const formatINR = (n) =>
  n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const costLineIcons = {
  'Wood Cost': 'W',
  Labour: 'L',
  Nails: 'N',
  Transport: 'T',
  'Packing Cover': 'P',
  Clamp: 'C',
};

export default function CostSummary({ result, onPrintQuote, onDownloadPDF, onOpenClientQuote }) {
  const costLines = [
    { label: 'Wood Cost', value: result.woodCost },
    { label: 'Labour', value: result.labourCost },
    { label: 'Nails', value: result.nailCost },
    { label: 'Transport', value: result.transportCost },
    { label: 'Packing Cover', value: result.packingCost },
    { label: 'Clamp', value: result.clampCost },
  ];

  const maxCost = Math.max(...costLines.map(c => c.value));

  return (
    <div className="glass-card print-friendly-card">
      <div className="section-header no-print">
        <div className="flex items-center">
          <div className="section-icon">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 2 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
            </svg>
          </div>
          <h2 className="section-title">Cost Breakdown</h2>
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--text-light)' }}>
          ₹/CFT × Billable
        </span>
      </div>

      <div className="p-6 space-y-4 no-print">
        {costLines.map(({ label, value }) => (
          <div key={label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold"
                  style={{ background: 'var(--card-inner-bg)', color: 'var(--accent-wood)' }}
                  aria-hidden="true"
                >
                  {costLineIcons[label]}
                </span>
                <span className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
              <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-main)' }}>₹ {formatINR(value)}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--card-inner-bg)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${maxCost > 0 ? (value / maxCost) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, var(--accent-wood-light), var(--accent-wood))',
                  transition: 'width 0.5s ease-out',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--table-border)', padding: '1rem 1.5rem' }} className="space-y-3 no-print">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Subtotal</span>
          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-main)' }}>₹ {formatINR(result.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-emerald)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
            Profit ({result.profitPct !== undefined ? result.profitPct : 20}%)
          </span>
          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>+ ₹ {formatINR(result.profit)}</span>
        </div>
      </div>

      <div className="p-6 pt-0 print-total-wrapper">
        <div className="total-card animate-glow">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-main)', opacity: 0.8, letterSpacing: '0.08em' }}>
                Final Total Price
              </p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">
                ₹ {formatINR(result.finalTotal)}
              </p>
            </div>
            <div className="no-print flex flex-col sm:flex-row gap-3">
              <button
                className="btn-primary"
                onClick={onPrintQuote || (() => window.print())}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm8-12V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4h10z" />
                </svg>
                Print Quote
              </button>
              <button
                className="btn-secondary"
                onClick={onDownloadPDF}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                className="btn-secondary"
                onClick={onOpenClientQuote}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M8 3h5.5L19 8.5V21H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm5 0v6h6" />
                </svg>
                Client Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
