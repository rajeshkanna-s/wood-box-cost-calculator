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
  useWood = true,
  usePly = false,
  woodDims,
  woodRates,
  woodResult,
  plyDims,
  plyRates,
  plyResult
}) {
  const { quoteDateLabel, quoteNo } = getQuoteMeta(result);

  // Normalize structure for presets (flat) vs custom calculator (combined / dual)
  const isCombined = result && result.wood !== undefined;
  
  const activeUseWood = isCombined ? useWood : (useWood !== undefined ? useWood : true);
  const activeUsePly = isCombined ? usePly : (usePly !== undefined ? usePly : false);

  const wDims = isCombined ? woodDims : dims;
  const wRates = isCombined ? woodRates : rates;
  const wResult = isCombined ? result.wood : result;

  const pDims = isCombined ? plyDims : dims;
  const pRates = isCombined ? plyRates : rates;
  const pResult = isCombined ? result.ply : null;

  const finalTotalVal = isCombined ? result.finalTotal : result?.finalTotal;

  // Wood dimensions & parts
  const wIsMm = wDims?.unit === 'mm';
  const wLengthInInches = wIsMm ? wDims.l / 25.4 : wDims.l;
  const wReperType = getReperType(wLengthInInches);
  const wIncludedParts = wResult?.partsWithCFT?.filter((part) => !part.isExcluded) || [];

  // Plywood dimensions & parts
  const pIsMm = pDims?.unit === 'mm';
  const pIncludedParts = pResult?.partsWithCFT?.filter((part) => !part.isExcluded) || [];

  const showCftSummary = options.showCftSummary || options.showWaste;
  const showAnyDetail = showCftSummary || options.showParts || options.showCostBreakdown;

  // Combined Cost items mapping
  const combinedCostItems = isCombined
    ? (() => {
        const itemsMap = {};
        const addVal = (label, side, val) => {
          if (!itemsMap[label]) {
            itemsMap[label] = { label, wVal: 0, pVal: 0 };
          }
          itemsMap[label][side] = val;
        };
        
        addVal('Material Cost', 'wVal', wResult?.woodCost || 0);
        addVal('Material Cost', 'pVal', pResult?.woodCost || 0);
        
        const wRatesObj = wResult?.rates || {};
        const pRatesObj = pResult?.rates || {};
        
        if (wRatesObj.labour !== null && wRatesObj.labour !== undefined || pRatesObj.labour !== null && pRatesObj.labour !== undefined) {
          addVal('Labour', 'wVal', wResult?.labourCost || 0);
          addVal('Labour', 'pVal', pResult?.labourCost || 0);
        }
        if (wRatesObj.nail !== null && wRatesObj.nail !== undefined || pRatesObj.nail !== null && pRatesObj.nail !== undefined) {
          addVal('Nails', 'wVal', wResult?.nailCost || 0);
          addVal('Nails', 'pVal', pResult?.nailCost || 0);
        }
        if (wRatesObj.transport !== null && wRatesObj.transport !== undefined || pRatesObj.transport !== null && pRatesObj.transport !== undefined) {
          addVal('Transport', 'wVal', wResult?.transportCost || 0);
          addVal('Transport', 'pVal', pResult?.transportCost || 0);
        }
        if (wRatesObj.packing !== null && wRatesObj.packing !== undefined || pRatesObj.packing !== null && pRatesObj.packing !== undefined) {
          addVal('Packing Cover', 'wVal', wResult?.packingCost || 0);
          addVal('Packing Cover', 'pVal', pResult?.packingCost || 0);
        }
        if (wRatesObj.clamp !== null && wRatesObj.clamp !== undefined || pRatesObj.clamp !== null && pRatesObj.clamp !== undefined) {
          addVal('Clamp', 'wVal', wResult?.clampCost || 0);
          addVal('Clamp', 'pVal', pResult?.clampCost || 0);
        }
        
        if (wResult?.customCosts) {
          Object.entries(wResult.customCosts).forEach(([label, val]) => {
            addVal(label, 'wVal', val);
          });
        }
        if (pResult?.customCosts) {
          Object.entries(pResult.customCosts).forEach(([label, val]) => {
            addVal(label, 'pVal', val);
          });
        }
        
        return Object.values(itemsMap).map(item => ({
          ...item,
          combVal: item.wVal + item.pVal
        }));
      })()
    : [];

  const costLines = !isCombined
    ? [
        { label: activeUseWood ? 'Wood Cost' : 'Plywood Cost', value: wResult?.woodCost },
        ...(wRates?.labour !== null && wRates?.labour !== undefined ? [{ label: 'Labour', value: wResult?.labourCost }] : []),
        ...(wRates?.nail !== null && wRates?.nail !== undefined ? [{ label: 'Nails', value: wResult?.nailCost }] : []),
        ...(wRates?.transport !== null && wRates?.transport !== undefined ? [{ label: 'Transport', value: wResult?.transportCost }] : []),
        ...(wRates?.packing !== null && wRates?.packing !== undefined ? [{ label: 'Packing Cover', value: wResult?.packingCost }] : []),
        ...(wRates?.clamp !== null && wRates?.clamp !== undefined ? [{ label: 'Clamp', value: wResult?.clampCost }] : []),
        ...(wResult?.customCosts ? Object.entries(wResult.customCosts).map(([label, val]) => ({ label, value: val })) : [])
      ]
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

      <div className="client-quote-hero" style={{ display: 'grid', gridTemplateColumns: activeUseWood && activeUsePly ? '2fr 1fr' : '1.5fr 1fr', gap: '16px' }}>
        <section className="quote-panel client-dimension-panel" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
          {activeUseWood && (
            <div style={{ flex: '1 1 200px' }}>
              <p className="quote-client-kicker">Pine Wood Box Dimensions</p>
              {wIsMm ? (
                <>
                  <strong>{formatDimension(wDims.l)} × {formatDimension(wDims.w)} × {formatDimension(wDims.h)} mm</strong>
                  <span>{formatDimension(wDims.l / 25.4)} × {formatDimension(wDims.w / 25.4)} × {formatDimension(wDims.h / 25.4)} in</span>
                </>
              ) : (
                <>
                  <strong>{formatDimension(wDims.l)} × {formatDimension(wDims.w)} × {formatDimension(wDims.h)} in</strong>
                  <span>{formatMm(inchToMm(wDims.l))} × {formatMm(inchToMm(wDims.w))} × {formatMm(inchToMm(wDims.h))} mm</span>
                </>
              )}
              <small>{wReperType}-Reper pine wood packing box</small>
            </div>
          )}

          {activeUsePly && (
            <div style={{ flex: '1 1 200px', borderLeft: activeUseWood ? '1.5px dashed #cbd5e1' : 'none', paddingLeft: activeUseWood ? '16px' : '0' }}>
              <p className="quote-client-kicker">Plywood Box Dimensions</p>
              {pDims?.unit === 'sft' ? (
                <>
                  <strong>{formatDimension(pDims.l)} Sq.Ft (SFT)</strong>
                  <span>Thickness: {formatDimension(pDims.h)} mm</span>
                </>
              ) : pIsMm ? (
                <>
                  <strong>{formatDimension(pDims.l)} × {formatDimension(pDims.w)} × {formatDimension(pDims.h)} mm</strong>
                  <span>{formatDimension(pDims.l / 25.4)} × {formatDimension(pDims.w / 25.4)} × {formatDimension(pDims.h / 25.4)} in</span>
                </>
              ) : (
                <>
                  <strong>{formatDimension(pDims.l)} × {formatDimension(pDims.w)} × {formatDimension(pDims.h)} in</strong>
                  <span>{formatMm(inchToMm(pDims.l))} × {formatMm(inchToMm(pDims.w))} × {formatMm(inchToMm(pDims.h))} mm</span>
                </>
              )}
              <small>Plywood box sheathing</small>
            </div>
          )}
        </section>

        <section className="quote-total-panel client-total-panel">
          <span className="quote-total-label">Quoted Price</span>
          <strong className="quote-total-amount">
            <span className="quote-currency">₹</span>
            <span className="quote-total-value">{formatINR(finalTotalVal)}</span>
          </strong>
          <small>For the box size shown in this quote</small>
        </section>
      </div>

      {showAnyDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          {showCftSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUseWood && (
                <section className="quote-panel">
                  <h2>{activeUseWood && activeUsePly ? 'Pine Wood Summary' : `${wRates.rateUnit || 'CFT'} Summary`}</h2>
                  <dl className="quote-kpi-list">
                    {options.showWaste && wRates.wastePct > 0 ? (
                      <>
                        <div>
                          <dt>Net {wRates.rateUnit || 'CFT'}</dt>
                          <dd>{formatCFT(wResult.totalCFT)}</dd>
                        </div>
                        <div>
                          <dt>Waste ({wRates.wastePct}%)</dt>
                          <dd>{formatCFT(wResult.vestCFT)}</dd>
                        </div>
                        <div className="quote-emphasis-row">
                          <dt>Billable {wRates.rateUnit || 'CFT'}</dt>
                          <dd>{formatCFT(wResult.billable)}</dd>
                        </div>
                      </>
                    ) : (
                      <div className="quote-emphasis-row">
                        <dt>Quoted {wRates.rateUnit || 'CFT'}</dt>
                        <dd>{formatCFT(wResult.totalCFT)}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {activeUsePly && (
                <section className="quote-panel">
                  <h2>{activeUseWood && activeUsePly ? 'Plywood Summary' : `${pRates.rateUnit || 'CFT'} Summary`}</h2>
                  <dl className="quote-kpi-list">
                    {options.showWaste && pRates.wastePct > 0 ? (
                      <>
                        <div>
                          <dt>Net {pRates.rateUnit || 'CFT'}</dt>
                          <dd>{pRates.rateUnit === 'SFT' ? Number(pResult.totalSFT || 0).toFixed(3) : formatCFT(pResult.totalCFT)}</dd>
                        </div>
                        <div>
                          <dt>Waste ({pRates.wastePct}%)</dt>
                          <dd>{pRates.rateUnit === 'SFT' ? Number(pResult.vestSFT || 0).toFixed(3) : formatCFT(pResult.vestCFT)}</dd>
                        </div>
                        <div className="quote-emphasis-row">
                          <dt>Billable {pRates.rateUnit || 'CFT'}</dt>
                          <dd>{pRates.rateUnit === 'SFT' ? Number(pResult.billableSFT || 0).toFixed(3) : formatCFT(pResult.billable)}</dd>
                        </div>
                      </>
                    ) : (
                      <div className="quote-emphasis-row">
                        <dt>Quoted {pRates.rateUnit || 'CFT'}</dt>
                        <dd>{pRates.rateUnit === 'SFT' ? Number(pResult.totalSFT || 0).toFixed(3) : formatCFT(pResult.totalCFT)}</dd>
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
                        <th style={{ width: '35%' }}>Description</th>
                        <th style={{ width: '31%', whiteSpace: 'nowrap' }}>Size</th>
                        <th style={{ width: '12%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '12%', textAlign: 'right' }}>{wRates.rateUnit || 'CFT'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wIncludedParts.map((part, index) => (
                        <tr key={`${part.id}-${index}`}>
                          <td>{part.id}</td>
                          <td>{part.label}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {`${part.useInchLength ? part.l + '"' : formatMm(part.l)} × ${part.useInchWidth ? part.w + '"' : formatMm(part.w)
                              } × ${part.useInchHeight ? part.h + '"' : formatMm(part.h)
                              }`}
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
                        <th style={{ width: '35%' }}>Description</th>
                        <th style={{ width: '31%', whiteSpace: 'nowrap' }}>Size</th>
                        <th style={{ width: '12%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '12%', textAlign: 'right' }}>{pRates.rateUnit || 'CFT'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pIncludedParts.map((part, index) => (
                        <tr key={`${part.id}-${index}`}>
                          <td>{part.id}</td>
                          <td>{part.label}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {`${part.useInchLength ? part.l + '"' : formatMm(part.l)} × ${part.useInchWidth ? part.w + '"' : formatMm(part.w)
                              } × ${part.useInchHeight ? part.h + '"' : formatMm(part.h)
                              }`}
                          </td>
                          <td style={{ textAlign: 'center' }}>{formatQty(part.qty)}</td>
                          <td>{pRates.rateUnit === 'SFT' ? Number(part.sft || 0).toFixed(3) : formatCFT(part.cft)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            ) : (
              <section className="quote-panel" style={{ marginTop: '4px' }}>
                <h2>{activeUseWood ? `Parts and ${wRates.rateUnit || 'CFT'}` : `Parts and ${pRates.rateUnit || 'CFT'}`}</h2>
                <table className="quote-table quote-parts-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Part</th>
                      <th style={{ width: '38%' }}>Description</th>
                      <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Size</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>{(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeUseWood ? wIncludedParts : pIncludedParts).map((part, index) => (
                      <tr key={`${part.id}-${index}`}>
                        <td>{part.id}</td>
                        <td>{part.label}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {`${part.useInchLength ? part.l + '"' : formatMm(part.l)} × ${part.useInchWidth ? part.w + '"' : formatMm(part.w)
                            } × ${part.useInchHeight ? part.h + '"' : formatMm(part.h)
                            }`}
                        </td>
                        <td style={{ textAlign: 'center' }}>{formatQty(part.qty)}</td>
                        <td>{(!activeUseWood && pRates.rateUnit === 'SFT') ? Number(part.sft || 0).toFixed(3) : formatCFT(part.cft)}</td>
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
                      {options.showWaste && ((wRates.wastePct ?? 0) > 0 || (pRates.wastePct ?? 0) > 0) && (
                        <>
                          <tr className="quote-volume-row">
                            <td style={{ fontWeight: 'semibold' }}>Net Vol ({wRates.rateUnit || 'CFT'})</td>
                            <td style={{ textAlign: 'right' }}>{wRates.rateUnit === 'SFT' ? Number(wResult.totalSFT || 0).toFixed(3) : formatCFT(wResult.totalCFT)}</td>
                            <td style={{ textAlign: 'right' }}>{pRates.rateUnit === 'SFT' ? Number(pResult.totalSFT || 0).toFixed(3) : formatCFT(pResult.totalCFT)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                          <tr className="quote-volume-row">
                            <td style={{ fontWeight: 'semibold' }}>Waste Factor</td>
                            <td style={{ textAlign: 'right' }}>+ {wRates.rateUnit === 'SFT' ? Number(wResult.vestSFT || 0).toFixed(3) : formatCFT(wResult.vestCFT)} <span style={{ fontSize: '8px', color: '#64748b' }}>({wRates.wastePct}%)</span></td>
                            <td style={{ textAlign: 'right' }}>+ {pRates.rateUnit === 'SFT' ? Number(pResult.vestSFT || 0).toFixed(3) : formatCFT(pResult.vestCFT)} <span style={{ fontSize: '8px', color: '#64748b' }}>({pRates.wastePct}%)</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                          <tr className="quote-volume-row quote-billable-row">
                            <td style={{ fontWeight: 'bold' }}>Billable Vol</td>
                            <td style={{ textAlign: 'right' }}>{wRates.rateUnit === 'SFT' ? Number(wResult.billableSFT || 0).toFixed(3) : formatCFT(wResult.woodCost / wRates.cftRate)}</td>
                            <td style={{ textAlign: 'right' }}>{pRates.rateUnit === 'SFT' ? Number(pResult.billableSFT || 0).toFixed(3) : formatCFT(pResult.billable)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>-</td>
                          </tr>
                        </>
                      )}
                      {options.showProfit && ((wRates.profitPct ?? 0) > 0 || (pRates.profitPct ?? 0) > 0) ? (
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
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(wResult.subtotal)}</td>
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(pResult.subtotal)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(wResult.subtotal + pResult.subtotal)}</td>
                          </tr>
                          <tr>
                            <td>Profit</td>
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(wResult.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({wResult.profitPct}%)</span></td>
                            <td style={{ textAlign: 'right' }}>₹ {formatINR(pResult.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({pResult.profitPct}%)</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(wResult.profit + pResult.profit)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td style={{ fontWeight: 'medium' }}>Wood & Plywood Supply</td>
                          <td style={{ textAlign: 'right' }}>₹ {formatINR(wResult.finalTotal)}</td>
                          <td style={{ textAlign: 'right' }}>₹ {formatINR(pResult.finalTotal)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(finalTotalVal)}</td>
                        </tr>
                      )}
                      <tr className="quote-grand-row" style={{ borderTop: '2px solid #1e293b' }}>
                        <td style={{ fontWeight: 'bold' }}>Total Quote Price</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(wResult.finalTotal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(pResult.finalTotal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'extrabold', color: '#113f67' }}>₹ {formatINR(finalTotalVal)}</td>
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
                      {options.showWaste && (activeUseWood ? wRates : pRates).wastePct > 0 && (
                        <>
                          <tr className="quote-volume-row">
                            <th>Net {wRates.rateUnit || 'CFT'}</th>
                            <td>{(activeUseWood ? wRates : pRates).rateUnit === 'SFT' ? Number((activeUseWood ? wResult.totalSFT : pResult.totalSFT) || 0).toFixed(3) : formatCFT(activeUseWood ? wResult.totalCFT : pResult.totalCFT)}</td>
                          </tr>
                          <tr className="quote-volume-row">
                            <th>Waste Factor ({(activeUseWood ? wRates : pRates).wastePct}%)</th>
                            <td>+ {(activeUseWood ? wRates : pRates).rateUnit === 'SFT' ? Number((activeUseWood ? wResult.vestSFT : pResult.vestSFT) || 0).toFixed(3) : formatCFT(activeUseWood ? wResult.vestCFT : pResult.vestCFT)}</td>
                          </tr>
                          <tr className="quote-volume-row quote-billable-row">
                            <th>Billable {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</th>
                            <td>{(activeUseWood ? wRates : pRates).rateUnit === 'SFT' ? Number((activeUseWood ? wResult.billableSFT : pResult.billableSFT) || 0).toFixed(3) : formatCFT(activeUseWood ? wResult.billable : pResult.billable)}</td>
                          </tr>
                        </>
                      )}
                      {options.showProfit && (activeUseWood ? wRates : pRates).profitPct > 0 ? (
                        <>
                          {costLines.map((line) => (
                            <tr key={line.label}>
                              <th>{line.label}</th>
                              <td>₹ {formatINR(line.value)}</td>
                            </tr>
                          ))}
                          <tr className="quote-subtotal-row">
                            <th>Subtotal</th>
                            <td>₹ {formatINR(wResult.subtotal)}</td>
                          </tr>
                          <tr>
                            <th>Profit ({(activeUseWood ? wRates : pRates).profitPct}%)</th>
                            <td>₹ {formatINR(wResult.profit)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <th>Wood Packing Box Supply</th>
                          <td>₹ {formatINR(wResult.finalTotal)}</td>
                        </tr>
                      )}
                      <tr className="quote-grand-row">
                        <th>Total Quote Price</th>
                        <td>₹ {formatINR(wResult.finalTotal)}</td>
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
