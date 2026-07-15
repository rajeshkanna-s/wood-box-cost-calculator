import React from 'react';

const formatINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const costLineIcons = {
  'Wood Cost': 'W',
  'Plywood Cost': 'P',
  Labour: 'L',
  Nails: 'N',
  Transport: 'T',
  'Packing Cover': 'P',
  Clamp: 'C',
};

export default function CostSummary({
  result,
  rates,
  onPrintQuote,
  onDownloadPDF,
  onOpenClientQuote
}) {
  const type = result.type || 'pine-wood-box';
  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';

  const costLines = !isCombined
    ? [
        { label: 'Wood Cost', value: result.woodCost },
        ...(result.labourCost > 0 ? [{ label: 'Labour', value: result.labourCost }] : []),
        ...(result.nailCost > 0 ? [{ label: 'Nails', value: result.nailCost }] : []),
        ...(result.transportCost > 0 ? [{ label: 'Transport', value: result.transportCost }] : []),
        ...(result.packingCost > 0 ? [{ label: 'Packing Cover', value: result.packingCost }] : []),
        ...(result.clampCost > 0 ? [{ label: 'Clamp', value: result.clampCost }] : []),
        ...(result.plainingCost > 0 ? [{ label: 'Plaining', value: result.plainingCost }] : []),
        ...(result.ebCost > 0 ? [{ label: 'EB', value: result.ebCost }] : []),
        ...(result.htCost > 0 ? [{ label: 'HT', value: result.htCost }] : []),
        ...(result.customCostItems || []).map(item => ({ label: item.label, value: item.value || 0 }))
      ]
    : [];

  const maxCost = !isCombined ? Math.max(...costLines.map(c => c.value), 1) : 0;

  const combinedCostItems = isCombined
    ? (() => {
        const items = [];
        items.push({ label: 'Material Cost', w: result.woodCost, p: result.plyCost });
        items.push({ label: 'Labour Cost', w: result.woodLabourCost, p: result.plyLabourCost });
        items.push({ label: 'Nails Cost', w: result.billable * (rates.woodNail || 0), p: result.billableSFT * (rates.plyNail || 0) });
        items.push({ label: 'Plaining Cost', w: result.billable * (rates.woodPlaining || 0), p: result.billableSFT * (rates.plyPlaining || 0) });
        
        if (type === 'ply-wood-pallet') {
          items.push({ label: 'EB Cost', w: result.billable * (rates.woodEB || 0), p: result.billableSFT * (rates.plyEB || 0) });
          items.push({ label: 'Loading Cost', w: result.billable * (rates.woodLoading || 0), p: result.billableSFT * (rates.plyLoading || 0) });
        }
        if (type === 'pine-plywood-box') {
          items.push({ label: 'HT Cost', w: result.billable * (rates.woodHT || 0), p: 0 });
          items.push({ label: 'Loading Cost', w: result.billable * (rates.woodLoading || 0), p: 0 });
        }

        if (result.customCostItems && result.customCostItems.length > 0) {
          result.customCostItems.forEach(item => {
            items.push({
              label: `${item.label}${item.isPercent ? ' (' + item.rateValue + '%)' : ''}`,
              w: item.w || 0,
              p: item.p || 0
            });
          });
        }

        return items.filter(item => (item.w + item.p) > 0);
      })()
    : [];

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
          {isCombined ? 'Combined Wood + Plywood Sheet' : `₹/${rates?.rateUnit || 'CFT'} × Billable`}
        </span>
      </div>

      {isCombined ? (
        /* Multi-column combined table layout */
        <div className="p-6 space-y-4 no-print overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[450px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--table-border)' }}>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cost Item</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-amber-500">Wood</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-blue-400">Plywood</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--table-border)' }}>
              {combinedCostItems.map(({ label, w, p }) => (
                <tr key={label} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</td>
                  <td className="py-2.5 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(w)}</td>
                  <td className="py-2.5 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(p)}</td>
                  <td className="py-2.5 text-right font-mono text-sm font-semibold" style={{ color: 'var(--accent-wood-light)' }}>₹ {formatINR(w + p)}</td>
                </tr>
              ))}
              
              {/* Subtotal */}
              <tr className="border-t font-semibold" style={{ borderColor: 'var(--table-border)' }}>
                <td className="py-3 text-sm" style={{ color: 'var(--text-main)' }}>Subtotal</td>
                <td className="py-3 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(result.woodSubtotal)}</td>
                <td className="py-3 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(result.plySubtotal)}</td>
                <td className="py-3 text-right font-mono text-sm font-bold" style={{ color: 'var(--accent-wood-light)' }}>₹ {formatINR(result.subtotal)}</td>
              </tr>

              {/* Profit */}
              {((result.profitPct ?? 0) > 0) && (
                <tr className="font-semibold text-emerald-500">
                  <td className="py-3 text-sm">Profit Margin ({result.profitPct}%)</td>
                  <td className="py-3 text-right font-mono text-sm" colSpan={2}></td>
                  <td className="py-3 text-right font-mono text-sm font-bold">₹ {formatINR(result.profit)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Single Material Progress Bars layout */
        <div className="p-6 space-y-4 no-print">
          {costLines.map(({ label, value }) => (
            <div key={label} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm transition-colors text-slate-400 group-hover:text-slate-200">{label}</span>
                <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-main)' }}>₹ {formatINR(value)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-inner-bg)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(value / maxCost) * 100}%`,
                    background: 'linear-gradient(90deg, var(--accent-wood-light), var(--accent-wood))',
                    transition: 'width 0.5s ease-out',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isCombined && (
        <div style={{ borderTop: '1px solid var(--table-border)', padding: '1rem 1.5rem' }} className="space-y-3 no-print">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">Subtotal</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-main)' }}>₹ {formatINR(result.subtotal)}</span>
          </div>
          {result.profitPct > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-emerald)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
                Profit Margin ({result.profitPct}%)
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>+ ₹ {formatINR(result.profit)}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-6 pt-0 print-total-wrapper">
        <div className="total-card animate-glow">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Final Total Price (Inc. Profit)
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient">
                ₹ {formatINR(result.finalTotal)}
              </p>
            </div>
            <div className="no-print flex flex-col sm:flex-row gap-2">
              <button
                className="btn-primary py-2 px-4"
                onClick={onPrintQuote}
              >
                <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm8-12V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                className="btn-secondary py-2 px-4"
                onClick={onDownloadPDF}
              >
                <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                className="btn-secondary py-2 px-4"
                onClick={onOpenClientQuote}
              >
                <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

