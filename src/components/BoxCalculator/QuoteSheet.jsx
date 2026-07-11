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
  return Number(value.toFixed(2)).toString();
};

const formatPartDim = (n) => {
  const value = Number(n || 0);
  return Number(value.toFixed(2)).toString();
};

const formatMm = (n) => Math.round(Number(n || 0)).toString();

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

  const finalTotalVal = result?.wood !== undefined ? result.finalTotal : (result?.finalTotal || 0);

  return {
    quoteDateLabel,
    quoteNo: `EWB-${quoteStamp}-${Math.round(finalTotalVal)}`,
  };
}

export default function QuoteSheet({
  dims,
  rates,
  result,
  clientName,
  active = false,
  type = 'pine-wood-box'
}) {
  const { quoteDateLabel, quoteNo } = getQuoteMeta(result);
  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';

  const wIsMm = dims?.unit === 'mm';
  const isSft = dims?.unit === 'sft';
  const isCft = dims?.unit === 'cft';

  // Format dimensions string
  const getDimsString = (d) => {
    if (d?.unit === 'cft') return `${formatDimension(d.l)} Cubic Feet (CFT)`;
    if (d?.unit === 'sft') return `${formatDimension(d.l)} Sq.Ft (SFT) × ${formatDimension(d.h)} mm`;
    const u = d?.unit || 'in';
    return `${formatDimension(d.l)} × ${formatDimension(d.w)} × ${formatDimension(d.h)} ${u}`;
  };

  const getDimsConvertedString = (d) => {
    if (d?.unit === 'sft' || d?.unit === 'cft') return '';
    const u = d?.unit || 'in';
    if (u === 'mm') {
      return `${formatDimension(d.l / 25.4)} × ${formatDimension(d.w / 25.4)} × ${formatDimension(d.h / 25.4)} in`;
    } else {
      return `${Math.round(d.l * 25.4)} × ${Math.round(d.w * 25.4)} × ${Math.round(d.h * 25.4)} mm`;
    }
  };

  const includedParts = result?.partsWithCFT?.filter(p => !p.isExcluded) || [];
  const woodParts = includedParts.filter(p => !p.isPly);
  const plyParts = includedParts.filter(p => p.isPly);

  const getProductTitle = () => {
    switch (type) {
      case 'pine-wood-box': return 'Pine Wood Box';
      case 'ply-wood-pallet': return 'Plywood Pallet';
      case 'pine-wood-pallet': return 'Pine Wood Pallet';
      case 'pine-plywood-box': return 'Pine Plywood Box';
      default: return 'Wood Box';
    }
  };

  const specs = [
    { label: 'Product Type', value: getProductTitle() },
    { label: 'Size', value: getDimsString(dims) },
    ...(isSft ? [] : [{ label: 'Alternate Size', value: getDimsConvertedString(dims) }]),
    { label: 'Components', value: `${includedParts.length} parts • ${formatQty(includedParts.reduce((sum, p) => sum + p.qty, 0))} total pieces` }
  ];

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
      ]
    : [];

  const combinedCostItems = isCombined
    ? (() => {
        const items = [];
        items.push({ label: 'Material Cost', wVal: result.woodCost, pVal: result.plyCost });
        items.push({ label: 'Labour Cost', wVal: result.woodLabourCost, pVal: result.plyLabourCost });
        items.push({ label: 'Nails Cost', wVal: result.billable * (rates.woodNail || 0), pVal: result.billableSFT * (rates.plyNail || 0) });
        items.push({ label: 'Plaining Cost', wVal: result.billable * (rates.woodPlaining || 0), pVal: result.billableSFT * (rates.plyPlaining || 0) });
        
        if (type === 'ply-wood-pallet') {
          items.push({ label: 'EB Cost', wVal: result.billable * (rates.woodEB || 0), pVal: result.billableSFT * (rates.plyEB || 0) });
          items.push({ label: 'Loading Cost', wVal: result.billable * (rates.woodLoading || 0), pVal: result.billableSFT * (rates.plyLoading || 0) });
        }
        if (type === 'pine-plywood-box') {
          items.push({ label: 'HT Cost', wVal: result.billable * (rates.woodHT || 0), pVal: 0 });
          items.push({ label: 'Loading Cost', wVal: result.billable * (rates.woodLoading || 0), pVal: 0 });
        }
        return items.filter(item => (item.wVal + item.pVal) > 0).map(item => ({
          ...item,
          combVal: item.wVal + item.pVal
        }));
      })()
    : [];

  return (
    <section id="quote-sheet-detailed" className={`quote-sheet quote-sheet-detailed ${active ? 'is-active' : ''}`} aria-label="Printable wood box quote">
      <header className="quote-header">
        <div className="quote-brand-container">
          <img src="/elshaddailogo.png" alt="Elshaddai Wood Packing Logo" className="quote-brand-logo" />
          <div className="quote-brand-text">
            <span className="brand-ewp-text quote-ewp-title">EWP</span>
            <span className="brand-company-text quote-company-name">ELSHADDAI WOOD PACKING</span>
            <span className="quote-brand-sub">(Pallet & all Type boxes)</span>
          </div>
        </div>
      </header>

      <div className="quote-header-divider"></div>

      <div className="quote-meta-section">
        <div className="quote-meta-left">
          <h1 className="quote-doc-type">{clientName || 'Detailed Quotation'}</h1>
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

      {isCombined ? (
        <div className="quote-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1.55fr 0.9fr', gap: '12px' }}>
          {/* Column 1: Pine Wood Summary */}
          <div className="flex flex-col gap-2.5">
            <section className="quote-panel quote-spec-panel">
              <h2>Wood Specifications</h2>
              <dl className="quote-spec-list">
                {specs.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd style={{ whiteSpace: 'nowrap' }}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="quote-panel">
              <h2>Wood Volume Summary</h2>
              <dl className="quote-kpi-list">
                <div>
                  <dt>Net Wood CFT</dt>
                  <dd>{formatCFT(result.totalCFT)}</dd>
                </div>
                <div>
                  <dt>Waste ({type === 'ply-wood-pallet' ? 5 : 10}%)</dt>
                  <dd>{formatCFT(result.vestCFT)}</dd>
                </div>
                <div className="quote-emphasis-row">
                  <dt>Billable Wood CFT</dt>
                  <dd>{formatCFT(result.billable)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Column 2: Plywood Summary */}
          <div className="flex flex-col gap-2.5">
            <section className="quote-panel quote-spec-panel">
              <h2>Plywood Specifications</h2>
              <div className="p-3 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-semibold">{getProductTitle()} Structure</p>
                <p className="mt-1">Plywood Area: {Number(result.totalSFT || 0).toFixed(2)} SFT</p>
                <p>Plywood Panels: {plyParts.length} components</p>
              </div>
            </section>
            <section className="quote-panel">
              <h2>Plywood Area Summary</h2>
              <dl className="quote-kpi-list">
                <div>
                  <dt>Net Plywood SFT</dt>
                  <dd>{Number(result.totalSFT || 0).toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Waste ({type === 'ply-wood-pallet' ? 7 : 10}%)</dt>
                  <dd>{Number(result.vestSFT || 0).toFixed(2)}</dd>
                </div>
                <div className="quote-emphasis-row">
                  <dt>Billable Plywood SFT</dt>
                  <dd>{Number(result.billableSFT || 0).toFixed(2)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Column 3: Final Quote Price */}
          <section className="quote-total-panel" style={{ height: '100%', justifyContent: 'center' }}>
            <span className="quote-total-label">Final Quote Price</span>
            <strong className="quote-total-amount">
              <span className="quote-currency">₹</span>
              <span className="quote-total-value">{formatINR(result.finalTotal)}</span>
            </strong>
            <small>
              {result.profitPct > 0 ? (
                <>Includes {result.profitPct}% Profit margin</>
              ) : (
                "Excluded Profit Margin"
              )}
            </small>
          </section>
        </div>
      ) : (
        <div className="quote-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '12px' }}>
          <section className="quote-panel quote-spec-panel">
            <h2>Specifications</h2>
            <dl className="quote-spec-list">
              {specs.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd style={{ whiteSpace: 'nowrap' }}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="quote-panel">
            <h2>Volume Summary</h2>
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
            <small>
              {rates.profitPct > 0 ? (
                <>Includes {rates.profitPct}% profit margin</>
              ) : (
                <>Excluded profit margin</>
              )}
            </small>
          </section>
        </div>
      )}

      {isCombined ? (
        <>
          <div className="quote-parts-side-by-side" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <section className="quote-panel">
              <h2>Pine Wood Parts</h2>
              <table className="quote-table quote-parts-table compact-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Part</th>
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Size</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>CFT</th>
                  </tr>
                </thead>
                <tbody>
                  {woodParts.map((part, index) => (
                    <tr key={`${part.id}-${index}`}>
                      <td>{part.id}</td>
                      <td>{part.label}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {`${formatPartDim(part.l)} × ${formatPartDim(part.w)} × ${formatPartDim(part.h)} mm`}
                      </td>
                      <td style={{ textAlign: 'center' }}>{formatQty(part.qty)}</td>
                      <td>{formatCFT(part.cft)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="quote-panel">
              <h2>Plywood Parts</h2>
              <table className="quote-table quote-parts-table compact-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Part</th>
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Size</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>SFT</th>
                  </tr>
                </thead>
                <tbody>
                  {plyParts.map((part, index) => (
                    <tr key={`${part.id}-${index}`}>
                      <td>{part.id}</td>
                      <td>{part.label}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {`${formatPartDim(part.l)} × ${formatPartDim(part.w)} mm`}
                      </td>
                      <td style={{ textAlign: 'center' }}>{formatQty(part.qty)}</td>
                      <td>{Number(part.sft || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <div className="quote-cost-breakdown-center" style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', width: '100%' }}>
            <section className="quote-panel" style={{ width: '100%', maxWidth: '600px' }}>
              <h2 style={{ textAlign: 'center' }}>Cost Breakdown</h2>
              <table className="quote-table quote-cost-table combined-cost-table" style={{ fontSize: '10.5px' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: '#cbd5e1' }}>
                    <th style={{ pb: '6px', textAlign: 'left', fontWeight: 'bold' }}>Cost Item</th>
                    <th style={{ pb: '6px', textAlign: 'right', fontWeight: 'bold' }}>Wood</th>
                    <th style={{ pb: '6px', textAlign: 'right', fontWeight: 'bold' }}>Plywood</th>
                    <th style={{ pb: '6px', textAlign: 'right', fontWeight: 'bold' }}>Combined</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedCostItems.map(({ label, wVal, pVal, combVal }) => (
                    <tr key={label}>
                      <td style={{ py: '4px', fontWeight: 'medium' }}>{label}</td>
                      <td style={{ py: '4px', textAlign: 'right' }}>₹ {formatINR(wVal)}</td>
                      <td style={{ py: '4px', textAlign: 'right' }}>₹ {formatINR(pVal)}</td>
                      <td style={{ py: '4px', textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(combVal)}</td>
                    </tr>
                  ))}
                  <tr className="quote-subtotal-row border-t" style={{ borderColor: '#cbd5e1' }}>
                    <td style={{ py: '6px', fontWeight: 'bold' }}>Subtotal</td>
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(result.woodCost + result.woodLabourCost + (result.billable * (rates.woodNail || 0)) + (result.billable * (rates.woodPlaining || 0)) + (type === 'ply-wood-pallet' ? (result.billable * (rates.woodEB || 0)) + (result.billable * (rates.woodLoading || 0)) : 0) + (type === 'pine-plywood-box' ? (result.billable * (rates.woodHT || 0)) + (result.billable * (rates.woodLoading || 0)) : 0))}</td>
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(result.plyCost + result.plyLabourCost + (result.billableSFT * (rates.plyNail || 0)) + (result.billableSFT * (rates.plyPlaining || 0)) + (type === 'ply-wood-pallet' ? (result.billableSFT * (rates.plyEB || 0)) + (result.billableSFT * (rates.plyLoading || 0)) : 0))}</td>
                    <td style={{ py: '6px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-wood)' }}>₹ {formatINR(result.subtotal)}</td>
                  </tr>
                  {result.profit > 0 && (
                    <tr>
                      <td style={{ py: '6px', fontWeight: 'medium' }}>Profit</td>
                      <td style={{ py: '6px', textAlign: 'right' }} colSpan={2}></td>
                      <td style={{ py: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(result.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({result.profitPct}%)</span></td>
                    </tr>
                  )}
                  <tr className="quote-grand-row" style={{ borderTop: '2px solid #1e293b' }}>
                    <td style={{ py: '8px', fontWeight: 'bold' }}>Total Quote</td>
                    <td style={{ py: '8px', textAlign: 'right' }} colSpan={2}></td>
                    <td style={{ py: '8px', textAlign: 'right', fontWeight: 'extrabold', fontSize: '11px', color: '#113f67' }}>₹ {formatINR(result.finalTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="quote-rate-note flex flex-col gap-1 text-[9px] mt-3 border-t pt-2" style={{ borderColor: '#cbd5e1' }}>
                <span>• Wood: ₹ {formatINR(rates.cftRate)} / CFT wood rate {result.vestCFT > 0 ? `(Net + ${type === 'ply-wood-pallet' ? 5 : 10}% waste = billable)` : ''}</span>
                <span>• Plywood: ₹ {formatINR(rates.sftRate)} / SFT plywood rate {result.vestSFT > 0 ? `(Net + ${type === 'ply-wood-pallet' ? 7 : 10}% waste = billable)` : ''}</span>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="quote-body-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '10px' }}>
          <section className="quote-panel">
            <h2>Parts Breakdown</h2>
            <table className="quote-table quote-parts-table">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Part</th>
                  <th style={{ width: '38%' }}>Description</th>
                  <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Size</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>CFT</th>
                </tr>
              </thead>
              <tbody>
                {includedParts.map((part, index) => (
                  <tr key={`${part.id}-${index}`}>
                    <td>{part.id}</td>
                    <td>{part.label}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {`${formatPartDim(part.l)} × ${formatPartDim(part.w)} × ${formatPartDim(part.h)} mm`}
                    </td>
                    <td style={{ textAlign: 'center' }}>{formatQty(part.qty)}</td>
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
                {(result.vestCFT > 0) && (
                  <>
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
                {(result.profitPct > 0) && (
                  <tr>
                    <th>Profit ({result.profitPct}%)</th>
                    <td>₹ {formatINR(result.profit)}</td>
                  </tr>
                )}
                <tr className="quote-grand-row">
                  <th>Total</th>
                  <td>₹ {formatINR(result.finalTotal)}</td>
                </tr>
              </tbody>
            </table>

            <div className="quote-rate-note">
              <span>₹ {formatINR(rates.cftRate)} / CFT rate</span>
              {(result.vestCFT > 0) && (
                <>
                  <span>•</span>
                  <span>Net + {rates.wastePct ?? 10}% waste = billable</span>
                </>
              )}
            </div>
          </section>
        </div>
      )}

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
          <span className="quote-sig-title">For ELSHADDAI WOOD PACKING</span>
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

