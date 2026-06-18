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
  const isMm = dims.unit === 'mm';
  const lengthInInches = isMm ? dims.l / 25.4 : dims.l;
  const reperType = getReperType(lengthInInches);
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
    { 
      label: isMm ? 'Metric Size' : 'Box Size', 
      value: isMm
        ? `${formatDimension(dims.l)} × ${formatDimension(dims.w)} × ${formatDimension(dims.h)} mm`
        : `${formatDimension(dims.l)} × ${formatDimension(dims.w)} × ${formatDimension(dims.h)} in`
    },
    { 
      label: isMm ? 'Box Size' : 'Metric Size', 
      value: isMm
        ? `${formatDimension(dims.l / 25.4)} × ${formatDimension(dims.w / 25.4)} × ${formatDimension(dims.h / 25.4)} in`
        : `${formatMm(inchToMm(dims.l))} × ${formatMm(inchToMm(dims.w))} × ${formatMm(inchToMm(dims.h))} mm`
    },
    { label: 'Frame Type', value: `${reperType}-Reper pine wood packing box` },
    { label: 'Components', value: `${includedParts.length} part types • ${formatQty(totalQty)} total pieces` },
  ];

  return (
    <section id="quote-sheet-detailed" className={`quote-sheet quote-sheet-detailed ${active ? 'is-active' : ''}`} aria-label="Printable wood box quote">
      <header className="quote-header">
        <div className="quote-brand-container">
          <img src="/elshaddailogo.png" alt="El Shaddai Wood Packing Logo" className="quote-brand-logo" />
          <div className="quote-brand-text">
            <span className="brand-ewp-text quote-ewp-title">EWP</span>
            <span className="brand-company-text quote-company-name">EL SHADDAI WOOD PACKING</span>
            <span className="quote-brand-sub">(Pallet & all Type boxes)</span>
          </div>
        </div>
      </header>
      
      <div className="quote-header-divider"></div>

      <div className="quote-meta-section">
        <div className="quote-meta-left">
          <h1 className="quote-doc-type">Detailed Quotation</h1>
          <div className="quote-meta-item">
            <span className="quote-meta-label">Quote No:</span>
            <span className="quote-meta-value">{quoteNo}</span>
          </div>
        </div>
        <div className="quote-meta-right">
          <div className="quote-meta-item">
            <span className="quote-meta-label">Date:</span>
            <span className="quote-meta-value">{quoteDateLabel}</span>
          </div>
        </div>
      </div>

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
                <th>Size</th>
                <th>Qty</th>
                <th>CFT</th>
              </tr>
            </thead>
            <tbody>
              {includedParts.map((part, index) => (
                <tr key={`${part.id}-${index}`}>
                  <td>{part.id}</td>
                  <td>{part.label}</td>
                  <td>
                    {`${part.useInchLength ? part.l + '"' : formatMm(part.l)} × ${
                      part.useInchWidth ? part.w + '"' : formatMm(part.w)
                    } × ${
                      part.useInchHeight ? part.h + '"' : formatMm(part.h)
                    }`}
                  </td>
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

      <div className="quote-notes-section">
        <span>* Quote generated from current calculator inputs. Prices are estimates and may vary with material availability.</span>
      </div>

      <div className="quote-terms-sig-section">
        <div className="quote-terms-block">
          <h3>TERMS & CONDITIONS:</h3>
          <ol>
            <li>GST charges are extra which will be added only in the bill.</li>
            <li>GST value (5%, CGST @ 2.5% & SGST @ 2.5%).</li>
            <li>This quotation is valid only for 7 days from the date of quotation.</li>
            <li>Payment should be credited within immediate from the date of delivery of the pallets or boxes.</li>
            <li>HSN Code 4415</li>
            <li>GST No.33CCWPP5097E1Z0</li>
          </ol>
        </div>
        <div className="quote-signature-block">
          <span className="quote-sig-title">For EL SHADDAI WOOD PACKING</span>
          <div className="quote-sig-space"></div>
          <span className="quote-sig-name">G. PRABHU</span>
        </div>
      </div>

      <footer className="quote-footer">
        <div className="quote-footer-banner">
          <div className="quote-footer-line">NO.75, APPUR ROAD, PANAKOTTUR, MARAIMALAI NAGAR, CHENGALPATTU DISTRICT - 603 209, TAMIL NADU</div>
          <div className="quote-footer-line">CONTACT NUMBER: +91 91768 58100 &nbsp;&bull;&nbsp; E-mail: elshaddaipacking@gmail.com</div>
        </div>
      </footer>
    </section>
  );
}
