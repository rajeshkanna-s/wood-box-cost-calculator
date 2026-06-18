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

export default function QuoteSheet({ dims, rates, result, active = false }) {
  const { quoteDateLabel, quoteNo } = getQuoteMeta(result);
  const reperType = getReperType(dims.l);
  const includedParts = result.partsWithCFT.filter((part) => !part.isExcluded);
  const totalQty = includedParts.reduce((sum, part) => sum + Number(part.qty || 0), 0);

  const costLines = [
    { label: 'Wood Cost', value: result.woodCost },
    { label: 'Labour', value: result.labourCost },
    { label: 'Nails', value: result.nailCost },
    { label: 'Transport', value: result.transportCost },
    { label: 'Packing Cover', value: result.packingCost },
    { label: 'Clamp', value: result.clampCost },
  ];

  const specs = [
    { label: 'Box Size', value: `${formatDimension(dims.l)} × ${formatDimension(dims.w)} × ${formatDimension(dims.h)} in` },
    { label: 'Metric Size', value: `${formatMm(inchToMm(dims.l))} × ${formatMm(inchToMm(dims.w))} × ${formatMm(inchToMm(dims.h))} mm` },
    { label: 'Frame Type', value: `${reperType}-Reper pine wood packing box` },
    { label: 'Components', value: `${includedParts.length} part types • ${formatQty(totalQty)} total pieces` },
  ];

  return (
    <section id="quote-sheet-detailed" className={`quote-sheet quote-sheet-detailed ${active ? 'is-active' : ''}`} aria-label="Printable wood box quote">
      <header className="quote-header">
        <div className="quote-brand">
          <img src="/elshaddailogo.png" alt="Elshaddai Logo" className="quote-brand-logo" />
          <div className="quote-brand-text">
            <span className="quote-brand-name">ELSHADDAI</span>
            <span className="quote-brand-sub">Pine wood packing box • CFT-based costing</span>
          </div>
        </div>
        <div className="quote-meta">
          <h1 className="quote-doc-type">Detailed Quote</h1>
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

      <div className="quote-summary-grid">
        <section className="quote-panel quote-spec-panel">
          <h2>Box Specification</h2>
          <dl className="quote-spec-list">
            {specs.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="quote-panel">
          <h2>CFT Summary</h2>
          <dl className="quote-kpi-list">
            <div>
              <dt>Net CFT</dt>
              <dd>{formatCFT(result.totalCFT)}</dd>
            </div>
            <div>
              <dt>Waste ({rates.wastePct ?? 10}%)</dt>
              <dd>{formatCFT(result.vestCFT)}</dd>
            </div>
            <div className="quote-emphasis-row">
              <dt>Billable CFT</dt>
              <dd>{formatCFT(result.billable)}</dd>
            </div>
          </dl>
        </section>

        <section className="quote-total-panel">
          <span className="quote-total-label">Final Quote Price</span>
          <strong className="quote-total-amount">
            <span className="quote-currency">₹</span>
            <span className="quote-total-value">{formatINR(result.finalTotal)}</span>
          </strong>
          <small>Includes {rates.profitPct ?? 20}% profit margin</small>
        </section>
      </div>

      <div className="quote-body-grid">
        <section className="quote-panel">
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

        <section className="quote-panel">
          <h2>Cost Breakdown</h2>
          <table className="quote-table quote-cost-table">
            <tbody>
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
              <tr className="quote-grand-row">
                <th>Total</th>
                <td>₹ {formatINR(result.finalTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="quote-rate-note">
            <span>₹ {formatINR(rates.cftRate)} / CFT wood rate</span>
            <span>•</span>
            <span>Net CFT + {rates.wastePct ?? 10}% waste = billable CFT</span>
          </div>
        </section>
      </div>

      <footer className="quote-footer">
        <div className="quote-footer-info">
          <div className="quote-footer-address">
            No.75, Appur Road, Panakottur, Maraimalai Nagar, Chengalpattu District - 603 209, Tamil Nadu
          </div>
          <div className="quote-footer-contacts">
            <span><strong>Mobile:</strong> +91 9042988267, +91 9840226732</span>
            <span className="quote-footer-separator">•</span>
            <span><strong>Email:</strong> elshaddaipacking@gmail.com</span>
          </div>
        </div>
        <div className="quote-footer-notes">
          <span>• Quote generated from current calculator inputs.</span>
          <span>• Prices are estimates and may vary with material availability.</span>
        </div>
        <div className="quote-footer-copyright">
          © 2026 El Shaddai Wood Packing. All Rights Reserved.
        </div>
      </footer>
    </section>
  );
}
