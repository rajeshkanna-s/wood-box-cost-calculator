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

export default function QuoteSheet({
  dims,
  rates,
  result,
  clientName,
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

  // Wood calculations
  const wIsMm = wDims?.unit === 'mm';
  const wLengthInInches = wIsMm ? wDims.l / 25.4 : wDims.l;
  const wReperType = getReperType(wLengthInInches);
  const wIncludedParts = wResult?.partsWithCFT?.filter((part) => !part.isExcluded) || [];
  const wTotalQty = wIncludedParts.reduce((sum, part) => sum + Number(part.qty || 0), 0);

  const wSpecs = [
    {
      label: wIsMm ? 'Metric Size' : 'Box Size',
      value: wIsMm
        ? `${formatDimension(wDims.l)} × ${formatDimension(wDims.w)} × ${formatDimension(wDims.h)} mm`
        : `${formatDimension(wDims.l)} × ${formatDimension(wDims.w)} × ${formatDimension(wDims.h)} in`
    },
    {
      label: wIsMm ? 'Box Size' : 'Metric Size',
      value: wIsMm
        ? `${formatDimension(wDims.l / 25.4)} × ${formatDimension(wDims.w / 25.4)} × ${formatDimension(wDims.h / 25.4)} in`
        : `${formatMm(inchToMm(wDims.l))} × ${formatMm(inchToMm(wDims.w))} × ${formatMm(inchToMm(wDims.h))} mm`
    },
    { label: 'Frame Type', value: `${wReperType}-Reper pine wood packing box` },
    { label: 'Components', value: `${wIncludedParts.length} part types • ${formatQty(wTotalQty)} total pieces` },
  ];

  // Plywood calculations
  const pIsMm = pDims?.unit === 'mm';
  const pIncludedParts = pResult?.partsWithCFT?.filter((part) => !part.isExcluded) || [];
  const pTotalQty = pIncludedParts.reduce((sum, part) => sum + Number(part.qty || 0), 0);

  const pSpecs = activeUsePly ? [
    {
      label: pIsMm ? 'Metric Size' : 'Box Size',
      value: pIsMm
        ? `${formatDimension(pDims.l)} × ${formatDimension(pDims.w)} × ${formatDimension(pDims.h)} mm`
        : `${formatDimension(pDims.l)} × ${formatDimension(pDims.w)} × ${formatDimension(pDims.h)} in`
    },
    {
      label: pIsMm ? 'Box Size' : 'Metric Size',
      value: pIsMm
        ? `${formatDimension(pDims.l / 25.4)} × ${formatDimension(pDims.w / 25.4)} × ${formatDimension(pDims.h / 25.4)} in`
        : `${formatMm(inchToMm(pDims.l))} × ${formatMm(inchToMm(pDims.w))} × ${formatMm(inchToMm(pDims.h))} mm`
    },
    { label: 'Components', value: `${pIncludedParts.length} part types • ${formatQty(pTotalQty)} total pieces` },
  ] : [];

  // Combined Cost items mapping
  const combinedCostItems = isCombined
    ? [
        { label: 'Material Cost', wVal: wResult?.woodCost, pVal: pResult?.woodCost, combVal: (wResult?.woodCost || 0) + (pResult?.woodCost || 0) },
        { label: 'Labour', wVal: wResult?.labourCost, pVal: pResult?.labourCost, combVal: (wResult?.labourCost || 0) + (pResult?.labourCost || 0) },
        { label: 'Nails', wVal: wResult?.nailCost, pVal: pResult?.nailCost, combVal: (wResult?.nailCost || 0) + (pResult?.nailCost || 0) },
        { label: 'Transport', wVal: wResult?.transportCost, pVal: pResult?.transportCost, combVal: (wResult?.transportCost || 0) + (pResult?.transportCost || 0) },
        { label: 'Packing Cover', wVal: wResult?.packingCost, pVal: pResult?.packingCost, combVal: (wResult?.packingCost || 0) + (pResult?.packingCost || 0) },
        { label: 'Clamp', wVal: wResult?.clampCost, pVal: pResult?.clampCost, combVal: (wResult?.clampCost || 0) + (pResult?.clampCost || 0) },
      ]
    : [];

  const costLines = !isCombined
    ? [
        { label: activeUseWood ? 'Wood Cost' : 'Plywood Cost', value: wResult?.woodCost },
        { label: 'Labour', value: wResult?.labourCost },
        { label: 'Nails', value: wResult?.nailCost },
        { label: 'Transport', value: wResult?.transportCost },
        { label: 'Packing Cover', value: wResult?.packingCost },
        { label: 'Clamp', value: wResult?.clampCost },
      ]
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

      {activeUseWood && activeUsePly ? (
        <div className="quote-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1.55fr 0.9fr', gap: '12px' }}>
          {/* Column 1: Pine Wood Specs + Wood Summary */}
          <div className="flex flex-col gap-2.5">
            <section className="quote-panel quote-spec-panel">
              <h2>Pine Wood Specs</h2>
              <dl className="quote-spec-list">
                {wSpecs.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd style={{ whiteSpace: 'nowrap' }}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="quote-panel">
              <h2>Wood Summary</h2>
              <dl className="quote-kpi-list">
                <div>
                  <dt>Net {wRates.rateUnit || 'CFT'}</dt>
                  <dd>{formatCFT(wResult.totalCFT)}</dd>
                </div>
                <div>
                  <dt>Waste ({wRates.wastePct ?? 10}%)</dt>
                  <dd>{formatCFT(wResult.vestCFT)}</dd>
                </div>
                <div className="quote-emphasis-row">
                  <dt>Billable {wRates.rateUnit || 'CFT'}</dt>
                  <dd>{formatCFT(wResult.billable)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Column 2: Plywood Specs + Plywood Summary */}
          <div className="flex flex-col gap-2.5">
            <section className="quote-panel quote-spec-panel">
              <h2>Plywood Specs</h2>
              <dl className="quote-spec-list">
                {pSpecs.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd style={{ whiteSpace: 'nowrap' }}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="quote-panel">
              <h2>Plywood Summary</h2>
              <dl className="quote-kpi-list">
                <div>
                  <dt>Net {pRates.rateUnit || 'CFT'}</dt>
                  <dd>{formatCFT(pResult.totalCFT)}</dd>
                </div>
                <div>
                  <dt>Waste ({pRates.wastePct ?? 10}%)</dt>
                  <dd>{formatCFT(pResult.vestCFT)}</dd>
                </div>
                <div className="quote-emphasis-row">
                  <dt>Billable {pRates.rateUnit || 'CFT'}</dt>
                  <dd>{formatCFT(pResult.billable)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Column 3: Final Quote Price */}
          <section className="quote-total-panel" style={{ height: '100%', justifyContent: 'center' }}>
            <span className="quote-total-label">Final Quote Price</span>
            <strong className="quote-total-amount">
              <span className="quote-currency">₹</span>
              <span className="quote-total-value">{formatINR(finalTotalVal)}</span>
            </strong>
            <small>
              Wood ({wRates.profitPct ?? 20}%) + Ply ({pRates.profitPct ?? 20}%) Profit
            </small>
          </section>
        </div>
      ) : (
        <div className="quote-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '12px' }}>
          <section className="quote-panel quote-spec-panel">
            <h2>Box Specification</h2>
            <dl className="quote-spec-list">
              {(activeUseWood ? wSpecs : pSpecs).map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd style={{ whiteSpace: 'nowrap' }}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="quote-panel">
            <h2>{(activeUseWood ? wRates : pRates).rateUnit || 'CFT'} Summary</h2>
            <dl className="quote-kpi-list">
              <div>
                <dt>Net {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</dt>
                <dd>{formatCFT(activeUseWood ? wResult.totalCFT : pResult.totalCFT)}</dd>
              </div>
              <div>
                <dt>Waste ({(activeUseWood ? wRates : pRates).wastePct ?? 10}%)</dt>
                <dd>{formatCFT(activeUseWood ? wResult.vestCFT : pResult.vestCFT)}</dd>
              </div>
              <div className="quote-emphasis-row">
                <dt>Billable {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</dt>
                <dd>{formatCFT(activeUseWood ? wResult.billable : pResult.billable)}</dd>
              </div>
            </dl>
          </section>

          <section className="quote-total-panel">
            <span className="quote-total-label">Final Quote Price</span>
            <strong className="quote-total-amount">
              <span className="quote-currency">₹</span>
              <span className="quote-total-value">{formatINR(finalTotalVal)}</span>
            </strong>
            <small>
              Includes {(activeUseWood ? wRates : pRates).profitPct ?? 20}% profit margin
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
                      <td>{formatCFT(part.cft)}</td>
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
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(wResult.subtotal)}</td>
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(pResult.subtotal)}</td>
                    <td style={{ py: '6px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-wood)' }}>₹ {formatINR(wResult.subtotal + pResult.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ py: '6px', fontWeight: 'medium' }}>Profit</td>
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(wResult.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({wResult.profitPct}%)</span></td>
                    <td style={{ py: '6px', textAlign: 'right' }}>₹ {formatINR(pResult.profit)} <span style={{ fontSize: '8px', color: '#64748b' }}>({pResult.profitPct}%)</span></td>
                    <td style={{ py: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(wResult.profit + pResult.profit)}</td>
                  </tr>
                  <tr className="quote-grand-row" style={{ borderTop: '2px solid #1e293b' }}>
                    <td style={{ py: '8px', fontWeight: 'bold' }}>Total Quote</td>
                    <td style={{ py: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(wResult.finalTotal)}</td>
                    <td style={{ py: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {formatINR(pResult.finalTotal)}</td>
                    <td style={{ py: '8px', textAlign: 'right', fontWeight: 'extrabold', fontSize: '11px', color: '#113f67' }}>₹ {formatINR(finalTotalVal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="quote-rate-note flex flex-col gap-1 text-[9px] mt-3 border-t pt-2" style={{ borderColor: '#cbd5e1' }}>
                <span>• Wood: ₹ {formatINR(wRates.cftRate)} / {wRates.rateUnit || 'CFT'} wood rate (Net + {wRates.wastePct ?? 10}% waste = billable)</span>
                <span>• Plywood: ₹ {formatINR(pRates.cftRate)} / {pRates.rateUnit || 'CFT'} plywood rate (Net + {pRates.wastePct ?? 10}% waste = billable)</span>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="quote-body-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '10px' }}>
          <section className="quote-panel">
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
                  <th>Net {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</th>
                  <td>{formatCFT(activeUseWood ? wResult.totalCFT : pResult.totalCFT)}</td>
                </tr>
                <tr className="quote-volume-row">
                  <th>Waste Factor ({(activeUseWood ? wRates : pRates).wastePct ?? 10}%)</th>
                  <td>+ {formatCFT(activeUseWood ? wResult.vestCFT : pResult.vestCFT)}</td>
                </tr>
                <tr className="quote-volume-row quote-billable-row">
                  <th>Billable {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'}</th>
                  <td>{formatCFT(activeUseWood ? wResult.billable : pResult.billable)}</td>
                </tr>
                {costLines.map((line) => (
                  <tr key={line.label}>
                    <th>{line.label}</th>
                    <td>₹ {formatINR(line.value)}</td>
                  </tr>
                ))}
                <tr className="quote-subtotal-row">
                  <th>Subtotal</th>
                  <td>₹ {formatINR(activeUseWood ? wResult.subtotal : pResult.subtotal)}</td>
                </tr>
                <tr>
                  <th>Profit ({(activeUseWood ? wRates : pRates).profitPct ?? 20}%)</th>
                  <td>₹ {formatINR(activeUseWood ? wResult.profit : pResult.profit)}</td>
                </tr>
                <tr className="quote-grand-row">
                  <th>Total</th>
                  <td>₹ {formatINR(finalTotalVal)}</td>
                </tr>
              </tbody>
            </table>

            <div className="quote-rate-note">
              <span>₹ {formatINR((activeUseWood ? wRates : pRates).cftRate)} / {(activeUseWood ? wRates : pRates).rateUnit || 'CFT'} rate</span>
              <span>•</span>
              <span>Net + {(activeUseWood ? wRates : pRates).wastePct ?? 10}% waste = billable</span>
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
