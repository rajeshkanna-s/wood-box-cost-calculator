import React from 'react';

const OPTIONS = [
  {
    key: 'showParts',
    title: 'Parts and CFT',
    description: 'Show the component table with part sizes, quantities, and CFT.',
  },
  {
    key: 'showCftSummary',
    title: 'CFT Summary',
    description: 'Show net CFT and quoted CFT values.',
  },
  {
    key: 'showCostBreakdown',
    title: 'Cost Breakdown',
    description: 'Show price rows instead of only the final quote price.',
  },
  {
    key: 'showWaste',
    title: 'Waste Factor',
    description: 'Reveal the waste allowance wherever CFT or costing details are shown.',
  },
  {
    key: 'showProfit',
    title: 'Profit',
    description: 'Reveal profit margin in the client quote cost details.',
  },
];

export default function ClientQuoteOptions({ isOpen, options, onChange, onClose, onPrint }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 no-print">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto mt-10 w-full max-w-xl px-4">
        <div
          className="rounded-2xl border p-5 shadow-2xl"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--accent-wood)', letterSpacing: '0.08em' }}>
                Client PDF
              </p>
              <h2 className="mt-1 text-xl font-bold">Client Quote Options</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Dimensions, quote number, date, and final price are always included. Add only the extra details you want the client to see.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              title="Close"
              style={{ color: 'var(--text-main)' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors"
                style={{ borderColor: 'var(--card-border)', background: 'var(--card-inner-bg)' }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(options[option.key])}
                  onChange={(event) => onChange(option.key, event.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-600"
                />
                <span>
                  <span className="block text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{option.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary justify-center"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary justify-center"
              onClick={onPrint}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm8-12V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4h10z" />
              </svg>
              Print Client Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
