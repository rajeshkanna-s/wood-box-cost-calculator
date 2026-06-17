import React from 'react';
import { inchToMm } from '../../engine/cft';
import { getReperType } from '../../engine/parts';

const formatINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const formatCFT = (n) => Number(n || 0).toFixed(4);

const formatQty = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const formatDimension = (n) => {
  const value = Number(n || 0);
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const formatMm = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');

function getQuoteMeta(result) {
  const quoteDate = new Date();
  const quoteDateLabel = quoteDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const quoteStamp = [
    quoteDate.getFullYear(),
    String(quoteDate.getMonth() + 1).padStart(2, '0'),
    String(quoteDate.getDate()).padStart(2, '0'),
  ].join('');

  return {
    quoteDateLabel,
    quoteNo: `EWB-${quoteStamp}-${Math.round(result.finalTotal || 0)}`,
  };
}

export default function ClientQuoteSheet({ dims, rates, result, options, active = false }) {
  const { quoteDateLabel, quoteNo } = getQuoteMeta(result);
  const includedParts = result.partsWithCFT.filter((part) => !part.isExcluded);
  const reperType = getReperType(dims.l);
  const showCftSummary = options.showCftSummary || options.showWaste;
  const showAnyDetail = showCftSummary || options.showParts || options.showCostBreakdown;

  const costLines = [
    { label: 'Wood Cost', value: result.woodCost },
    { label: 'Labour', value: result.labourCost },
    { label: 'Nails', value: result.nailCost },
    { label: 'Transport', value: result.transportCost },
    { label: 'Packing Cover', value: result.packingCost },
    { label: 'Clamp', value: result.clampCost },
  ];

  return (
    <section id="quote-sheet-client" className={`quote-sheet quote-sheet-client ${active ? 'is-active' : ''}`} aria-label="Printable client quote">
      <header className="quote-header client-quote-header">
        <div className="quote-brand">
          <div className="quote-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M30 20 H70 V32 H42 V44 H65 V56 H42 V68 H70 V80 H30 Z" />
            </svg>
          </div>
          <div className="quote-brand-text">
            <span className="quote-brand-name">ELSHADDAI</span>
            <span className="quote-brand-sub">Wood packing box quotation</span>
          </div>
        </div>
        <div className="quote-meta">
          <h1 className="quote-doc-type">Client Quote</h1>
          <div className="quote-meta-row">
            <span>Quote No.</span>
            <strong>{quoteNo}</strong>
          </div>
          <div className="quote-meta-row">
            <span>Date</span>
            <strong>{quoteDateLabel}</strong>
          </div>
        </div>
      </header>

      <div className="client-quote-hero">
        <section className="quote-panel client-dimension-panel">
          <p className="quote-client-kicker">Box Dimensions</p>
          <strong>{formatDimension(dims.l)} × {formatDimension(dims.w)} × {formatDimension(dims.h)} in</strong>
          <span>{formatMm(inchToMm(dims.l))} × {formatMm(inchToMm(dims.w))} × {formatMm(inchToMm(dims.h))} mm</span>
          <small>{reperType}-Reper pine wood packing box</small>
        </section>

        <section className="quote-total-panel client-total-panel">
          <span className="quote-total-label">Quoted Price</span>
          <strong className="quote-total-amount">
            <span className="quote-currency">₹</span>
            <span className="quote-total-value">{formatINR(result.finalTotal)}</span>
          </strong>
          <small>For the box size shown in this quote</small>
        </section>
      </div>

      {showAnyDetail && (
        <div className="client-detail-grid">
          {showCftSummary && (
            <section className="quote-panel">
              <h2>CFT Summary</h2>
              <dl className="quote-kpi-list">
                <div>
                  <dt>Net CFT</dt>
                  <dd>{formatCFT(result.totalCFT)}</dd>
                </div>
                {options.showWaste && (
                  <div>
                    <dt>Waste ({rates.wastePct ?? 10}%)</dt>
                    <dd>{formatCFT(result.vestCFT)}</dd>
                  </div>
                )}
                <div className="quote-emphasis-row">
                  <dt>{options.showWaste ? 'Billable CFT' : 'Quoted CFT'}</dt>
                  <dd>{formatCFT(result.billable)}</dd>
                </div>
              </dl>
            </section>
          )}

          {options.showCostBreakdown && (
            <section className="quote-panel">
              <h2>Cost Breakdown</h2>
              <table className="quote-table quote-cost-table">
                <tbody>
                  {options.showWaste && (
                    <>
                      <tr className="quote-volume-row">
                        <th>Net CFT</th>
                        <td>{formatCFT(result.totalCFT)}</td>
                      </tr>
                      <tr className="quote-volume-row">
                        <th>Waste Factor ({rates.wastePct ?? 10}%)</th>
                        <td>+ {formatCFT(result.vestCFT)}</td>
                      </tr>
                      <tr className="quote-volume-row quote-billable-row">
                        <th>Billable CFT</th>
                        <td>{formatCFT(result.billable)}</td>
                      </tr>
                    </>
                  )}
                  {options.showProfit ? (
                    <>
                      {costLines.map((line) => (
                        <tr key={line.label}>
                          <th>{line.label}</th>
                          <td>₹ {formatINR(line.value)}</td>
                        </tr>
                      ))}
                      <tr className="quote-subtotal-row">
                        <th>Subtotal</th>
                        <td>₹ {formatINR(result.subtotal)}</td>
                      </tr>
                      <tr>
                        <th>Profit ({rates.profitPct ?? 20}%)</th>
                        <td>₹ {formatINR(result.profit)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <th>Wood Packing Box Supply</th>
                      <td>₹ {formatINR(result.finalTotal)}</td>
                    </tr>
                  )}
                  <tr className="quote-grand-row">
                    <th>Total Quote Price</th>
                    <td>₹ {formatINR(result.finalTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}
        </div>
      )}

      {options.showParts && (
        <section className="quote-panel client-parts-panel">
          <h2>Parts and CFT</h2>
          <table className="quote-table quote-parts-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Description</th>
                <th>Size (mm)</th>
                <th>Qty</th>
                <th>CFT</th>
              </tr>
            </thead>
            <tbody>
              {includedParts.map((part, index) => (
                <tr key={`${part.id}-${index}`}>
                  <td>{part.id}</td>
                  <td>{part.label}</td>
                  <td>{`${formatMm(part.l)} × ${formatMm(part.w)} × ${formatMm(part.h)}`}</td>
                  <td>{formatQty(part.qty)}</td>
                  <td>{formatCFT(part.cft)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="quote-footer client-quote-footer">
        <span>• Quote prepared from confirmed box dimensions.</span>
        <span>• Final price is valid for the specification shown above.</span>
        <span>• Taxes, if applicable, can be added separately.</span>
      </footer>
    </section>
  );
}
