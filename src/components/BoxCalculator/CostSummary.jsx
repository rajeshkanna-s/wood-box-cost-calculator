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
  useWood = true,
  usePly = false,
  woodResult,
  plyResult,
  onPrintQuote,
  onDownloadPDF,
  onOpenClientQuote
}) {
  const isCombined = useWood && usePly && woodResult && plyResult;

  const costLines = !isCombined
    ? [
        { label: useWood ? 'Wood Cost' : 'Plywood Cost', value: result.woodCost },
        ...(rates?.labour !== null && rates?.labour !== undefined ? [{ label: 'Labour', value: result.labourCost }] : []),
        ...(rates?.nail !== null && rates?.nail !== undefined ? [{ label: 'Nails', value: result.nailCost }] : []),
        ...(rates?.transport !== null && rates?.transport !== undefined ? [{ label: 'Transport', value: result.transportCost }] : []),
        ...(rates?.packing !== null && rates?.packing !== undefined ? [{ label: 'Packing Cover', value: result.packingCost }] : []),
        ...(rates?.clamp !== null && rates?.clamp !== undefined ? [{ label: 'Clamp', value: result.clampCost }] : []),
        ...(result.customCosts ? Object.entries(result.customCosts).map(([label, val]) => ({ label, value: val })) : [])
      ]
    : [];

  const maxCost = !isCombined ? Math.max(...costLines.map(c => c.value)) : 0;

  const combinedCostItems = isCombined
    ? (() => {
        const itemsMap = {};
        const addVal = (label, side, val) => {
          if (!itemsMap[label]) {
            itemsMap[label] = { label, wVal: 0, pVal: 0 };
          }
          itemsMap[label][side] = val;
        };
        
        addVal('Material Cost', 'wVal', woodResult.woodCost);
        addVal('Material Cost', 'pVal', plyResult.woodCost);
        
        const wRates = woodResult.rates || {};
        const pRates = plyResult.rates || {};
        
        if (wRates.labour !== null && wRates.labour !== undefined || pRates.labour !== null && pRates.labour !== undefined) {
          addVal('Labour', 'wVal', woodResult.labourCost);
          addVal('Labour', 'pVal', plyResult.labourCost);
        }
        if (wRates.nail !== null && wRates.nail !== undefined || pRates.nail !== null && pRates.nail !== undefined) {
          addVal('Nails', 'wVal', woodResult.nailCost);
          addVal('Nails', 'pVal', plyResult.nailCost);
        }
        if (wRates.transport !== null && wRates.transport !== undefined || pRates.transport !== null && pRates.transport !== undefined) {
          addVal('Transport', 'wVal', woodResult.transportCost);
          addVal('Transport', 'pVal', plyResult.transportCost);
        }
        if (wRates.packing !== null && wRates.packing !== undefined || pRates.packing !== null && pRates.packing !== undefined) {
          addVal('Packing Cover', 'wVal', woodResult.packingCost);
          addVal('Packing Cover', 'pVal', plyResult.packingCost);
        }
        if (wRates.clamp !== null && wRates.clamp !== undefined || pRates.clamp !== null && pRates.clamp !== undefined) {
          addVal('Clamp', 'wVal', woodResult.clampCost);
          addVal('Clamp', 'pVal', plyResult.clampCost);
        }
        
        if (woodResult.customCosts) {
          Object.entries(woodResult.customCosts).forEach(([label, val]) => {
            addVal(label, 'wVal', val);
          });
        }
        if (plyResult.customCosts) {
          Object.entries(plyResult.customCosts).forEach(([label, val]) => {
            addVal(label, 'pVal', val);
          });
        }
        
        return Object.values(itemsMap).map(item => ({
          ...item,
          combVal: item.wVal + item.pVal
        }));
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
          {isCombined ? 'Pine Wood + Plywood Combined' : `₹/${rates?.rateUnit || 'CFT'} × Billable`}
        </span>
      </div>

      {isCombined ? (
        /* Multi-column combined table layout */
        <div className="p-6 space-y-4 no-print overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--table-border)' }}>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cost Item</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pine Wood</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Plywood</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--table-border)' }}>
              {combinedCostItems.map(({ label, wVal, pVal, combVal }) => (
                <tr key={label} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</td>
                  <td className="py-2.5 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(wVal)}</td>
                  <td className="py-2.5 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(pVal)}</td>
                  <td className="py-2.5 text-right font-mono text-sm font-semibold" style={{ color: 'var(--accent-wood-light)' }}>₹ {formatINR(combVal)}</td>
                </tr>
              ))}
              
              {/* Subtotal */}
              <tr className="border-t font-semibold" style={{ borderColor: 'var(--table-border)' }}>
                <td className="py-3 text-sm" style={{ color: 'var(--text-main)' }}>Subtotal</td>
                <td className="py-3 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(woodResult.subtotal)}</td>
                <td className="py-3 text-right font-mono text-sm" style={{ color: 'var(--text-main)' }}>₹ {formatINR(plyResult.subtotal)}</td>
                <td className="py-3 text-right font-mono text-sm font-bold" style={{ color: 'var(--accent-wood-light)' }}>₹ {formatINR(woodResult.subtotal + plyResult.subtotal)}</td>
              </tr>

              {/* Profit */}
              {((woodResult.profitPct ?? 0) > 0 || (plyResult.profitPct ?? 0) > 0) && (
                <tr className="font-semibold text-emerald-500">
                  <td className="py-3 text-sm">Profit</td>
                  <td className="py-3 text-right font-mono text-sm">₹ {formatINR(woodResult.profit)} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({woodResult.profitPct}%)</span></td>
                  <td className="py-3 text-right font-mono text-sm">₹ {formatINR(plyResult.profit)} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({plyResult.profitPct}%)</span></td>
                  <td className="py-3 text-right font-mono text-sm font-bold">₹ {formatINR(woodResult.profit + plyResult.profit)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Original progress bars layout */
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
      )}

      {!isCombined && (
        <div style={{ borderTop: '1px solid var(--table-border)', padding: '1rem 1.5rem' }} className="space-y-3 no-print">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Subtotal</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-main)' }}>₹ {formatINR(result.subtotal)}</span>
          </div>
          {result.profitPct !== null && result.profitPct !== undefined && result.profitPct > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-emerald)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
                Profit ({result.profitPct}%)
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
