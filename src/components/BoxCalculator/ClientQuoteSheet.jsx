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

export default function ClientQuoteSheet({
  dims,
  rates,
  result,
  clientName,
  options,
  active = false,
  type = 'pine-wood-box'
}) {
  const { quoteDateLabel, quoteNo } = getQuoteMeta(result);
  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';

  const wIsMm = dims?.unit === 'mm';
  const isSft = dims?.unit === 'sft';

  // Format dimensions string
  const getDimsString = (d) => {
    if (isSft) return `${formatDimension(d.l)} Sq.Ft (SFT) × ${formatDimension(d.h)} mm`;
    const u = d.unit || 'in';
    return `${formatDimension(d.l)} × ${formatDimension(d.w)} × ${formatDimension(d.h)} ${u}`;
  };

  const getDimsConvertedString = (d) => {
    if (isSft) return '';
    const u = d.unit || 'in';
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

  const showCftSummary = options.showCftSummary || options.showWaste;
  const showAnyDetail = showCftSummary || options.showParts || options.showCostBreakdown;

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
    <section id="quote-sheet-client" className={`quote-sheet quote-sheet-client ${active ? 'is-active' : ''}`} aria-label="Printable client quote">
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
          <h1 className="quote-doc-type">{clientName || 'Quotation'}</h1>
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

      <div className="client-quote-hero" style={{ display: 'grid', gridTemplateColumns: isCombined ? '2fr 1fr' : '1.5fr 1fr', gap: '16px' }}>
        <section className="quote-panel client-dimension-panel" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 200px' }}>
            <p className="quote-client-kicker">{getProductTitle()} Dimensions</p>
            <strong>{getDimsString(dims)}</strong>
            {!isSft && <span>{getDimsConvertedString(dims)}</span>}
            <small>{getProductTitle()} Structure</small>
          </div>
        </section>

        <section className="quote-total-panel client-total-panel">
          <span className="quote-total-label">Quoted Price</span>
          <strong className="quote-total-amount">
            <span className="quote-currency">₹</span>
            <span className="quote-total-value">{formatINR(result.finalTotal)}</span>
          </strong>
          <small>For the product size shown in this quote</small>
        </section>
      </div>

      {showAnyDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          {showCftSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="quote-panel">
                <h2>{isCombined ? 'Wood Summary' : 'Volume Summary'}</h2>
                <dl className="quote-kpi-list">
                  {options.showWaste ? (
                    <>
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
                    </>
                  ) : (
                    <div className="quote-emphasis-row">
                      <dt>Quoted Wood CFT</dt>
                      <dd>{formatCFT(result.totalCFT)}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {isCombined && (
                <section className="quote-panel">
                  <h2>Plywood Summary</h2>
                  <dl className="quote-kpi-list">
                    {options.showWaste ? (
                      <>
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
                      </>
                    ) : (
                      <div className="quote-emphasis-row">
                        <dt>Quoted Plywood SFT</dt>
                        <dd>{Number(result.totalSFT || 0).toFixed(2)}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
            </div>
          )}

          {options.showParts && (
            isCombined ? (
              <div className="quote-parts-side-by-side" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
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
            ) : (
              <section className="quote-panel" style={{ marginTop: '4px' }}>
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
            )
          )}

          {options.showCostBreakdown && (
            isCombined ? (
              <div className="quote-cost-breakdown-center" style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', width: '100%' }}>
                <section className="quote-panel" style={{ width: '100%', maxWidth: '600px' }}>
                  <h2 style={{ textAlign: 'center' }}>Cost Breakdown</h2>
                  <table className="quote-table quote-cost-table combined-cost-table" style={{ fontSize: '10px' }}>
                    <thead>
                      <tr className="border-b" style={{ borderColor: '#cbd5e1' }}>
                        <th style={{ pb: '4px', textAlign: 'left', fontWeight: 'bold' }}>Cost Item</th>
                        <th style={{ pb: '4px', textAlign: 'right', fontWeight: 'bold' }}>Wood</th>
                        <th style={{ pb: '4px', textAlign: 'right', fontWeight: 'bold' }}>Plywood</th>
                        <th style={{ pb: '4px', textAlign: 'right', fontWeight: 'bold' }}>Combined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.showWaste && (
                        <>
                          <tr className="quote-volume-row">
                            <td style={{ fontWeight: 'semibold' }}>Net Vol / Area</td>
                            <td style={{ textAlign: 'right' }}>{formatCFT(result.totalCFT)} CFT</td>
                            <td style={{ textAlign: 'right' }}>{Number(result.totalSFT || 0).toFixed(2)} SFT</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                          <tr className="quote-volume-row">
                            <td style={{ fontWeight: 'semibold' }}>Waste Factor</td>
                            <td style={{ textAlign: 'right' }}>+ {formatCFT(result.vestCFT)} <span style={{ fontSize: '8px', color: '#64748b' }}>({type === 'ply-wood-pallet' ? 5 : 10}%)</span></td>
                            <td style={{ textAlign: 'right' }}>+ {Number(result.vestSFT || 0).toFixed(2)} <span style={{ fontSize: '8px', color: '#64748b' }}>({type === 'ply-wood-pallet' ? 7 : 10}%)</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                          <tr className="quote-volume-row quote-billable-row">
                            <td style={{ fontWeight: 'bold' }}>Billable</td>
                            <td style={{ textAlign: 'right' }}>{formatCFT(result.billable)} CFT</td>
                            <td style={{ textAlign: 'right' }}>{Number(result.billableSFT || 0).toFixed(2)} SFT</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                        </>
                      )}
                      {options.showProfit ? (
                        <>
                          {combinedCostItems.map(({ label, wVal, pVal, combVal }) => (
                            <tr key={label}>
                              <td>{label}</td>
                              <td style={{ textAlign: 'right' }}>₹ {formatINR(wVal)}</td>
                              <td style={{ textAlign: 'right' }}>₹ {formatINR(pVal)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(combVal)}</td>
                            </tr>
                          ))}
                          <tr className="quote-subtotal-row border-t" style={{ borderColor: '#cbd5e1' }}>
                            <td style={{ fontWeight: 'bold' }}>Subtotal</td>
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(result.woodCost + result.woodLabourCost + (result.billable * (rates.woodNail || 0)) + (result.billable * (rates.woodPlaining || 0)) + (type === 'ply-wood-pallet' ? (result.billable * (rates.woodEB || 0)) + (result.billable * (rates.woodLoading || 0)) : 0) + (type === 'pine-plywood-box' ? (result.billable * (rates.woodHT || 0)) + (result.billable * (rates.woodLoading || 0)) : 0))}</td>
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(result.plyCost + result.plyLabourCost + (result.billableSFT * (rates.plyNail || 0)) + (result.billableSFT * (rates.plyPlaining || 0)) + (type === 'ply-wood-pallet' ? (result.billableSFT * (rates.plyEB || 0)) + (result.billableSFT * (rates.plyLoading || 0)) : 0))}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(result.subtotal)}</td>
                          </tr>
                          {result.profit > 0 && (
                            <tr>
                              <td>Profit</td>
                              <td style={{ textAlign: 'right' }} colSpan={2}></td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(result.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({result.profitPct}%)</span></td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <td style={{ fontWeight: 'medium' }}>Wood & Plywood Supply</td>
                          <td style={{ textAlign: 'right' }} colSpan={2}></td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(result.finalTotal)}</td>
                        </tr>
                      )}
                      <tr className="quote-grand-row" style={{ borderTop: '2px solid #1e293b' }}>
                        <td style={{ fontWeight: 'bold' }}>Total Quote Price</td>
                        <td style={{ textAlign: 'right' }} colSpan={2}></td>
                        <td style={{ textAlign: 'right', fontWeight: 'extrabold', color: '#113f67' }}>₹ {formatINR(result.finalTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </div>
            ) : (
              <div className="quote-cost-breakdown-center" style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', width: '100%' }}>
                <section className="quote-panel" style={{ width: '100%', maxWidth: '600px' }}>
                  <h2 style={{ textAlign: 'center' }}>Cost Breakdown</h2>
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
                      {options.showProfit && rates.profitPct > 0 ? (
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
                            <th>Profit ({result.profitPct}%)</th>
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
              </div>
            )
          )}
        </div>
      )}

      <div className="quote-notes-section">
        <span>* Quote prepared from confirmed box dimensions. Final price is valid for the specification shown above. Taxes, if applicable, can be added separately.</span>
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
