import React, { useState, useEffect, useMemo } from 'react';
import { CLIENT_PRESETS, generateDefaultParts } from '../../engine/clientPresets';

const formatINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const formatCFT = (n) => Number(n || 0).toFixed(4);

const formatDimension = (n) => {
  const value = Number(n || 0);
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

export default function ClientPresetsCalculator({ onPrintPreset, onDownloadPresetPDF }) {
  // Select Company State
  const [selectedCompanyId, setSelectedCompanyId] = useState(CLIENT_PRESETS[0].id);

  // Active Company Object
  const company = useMemo(() => {
    return CLIENT_PRESETS.find((c) => c.id === selectedCompanyId) || CLIENT_PRESETS[0];
  }, [selectedCompanyId]);

  // Select Product State (default to first product of selected company)
  const [selectedProductId, setSelectedProductId] = useState(company.products[0].id);

  // Active Product Object
  const product = useMemo(() => {
    return company.products.find((p) => p.id === selectedProductId) || company.products[0];
  }, [company, selectedProductId]);

  // Editable parts and price states
  const [parts, setParts] = useState(() => product.parts || generateDefaultParts(product.name, product.l, product.w, product.h, product.unit));
  const [customPrice, setCustomPrice] = useState(product.price);

  // Reset editable fields when product preset changes
  useEffect(() => {
    setParts(product.parts || generateDefaultParts(product.name, product.l, product.w, product.h, product.unit));
    setCustomPrice(product.price);
  }, [product]);

  const updatePart = (index, field, value) => {
    setParts((prevParts) => {
      const newParts = [...prevParts];
      const nextValue = field === 'label' || field === 'id' ? value : Number(value) || 0;
      newParts[index] = { ...newParts[index], [field]: nextValue };
      return newParts;
    });
  };

  // Helper to calculate CFT for a part
  const getPartCFT = (part) => {
    const lengthMm = part.useInchLength ? part.l * 25.4 : part.l;
    const widthMm = part.useInchWidth ? part.w * 25.4 : part.w;
    return (lengthMm * widthMm * part.h * part.qty) / (304.8 ** 3);
  };

  // Memoized parts with computed CFT
  const partsWithCFT = useMemo(() => {
    return parts.map((p) => ({
      ...p,
      cft: getPartCFT(p),
    }));
  }, [parts]);

  // Totals calculations
  const totalCFT = useMemo(() => {
    return partsWithCFT.reduce((sum, p) => sum + p.cft, 0);
  }, [partsWithCFT]);

  const vestCFT = useMemo(() => {
    return totalCFT * 0.1; // 10% waste
  }, [totalCFT]);

  const billableCFT = useMemo(() => {
    return totalCFT + vestCFT;
  }, [totalCFT, vestCFT]);

  // Prepares the preset data payload to match what QuoteSheet templates expect
  const getPresetDataPayload = () => {
    const dims = { l: product.l, w: product.w, h: product.h, unit: product.unit };
    const rates = { wastePct: 10, profitPct: 0, cftRate: 0 };
    const result = {
      partsWithCFT,
      totalCFT,
      vestCFT,
      billable: billableCFT,
      woodCost: 0,
      labourCost: 0,
      nailCost: 0,
      transportCost: 0,
      packingCost: 0,
      clampCost: 0,
      subtotal: customPrice,
      profitPct: 0,
      profit: 0,
      finalTotal: customPrice,
    };
    return { dims, rates, result };
  };

  const handleCompanyChange = (e) => {
    const nextCompanyId = e.target.value;
    setSelectedCompanyId(nextCompanyId);
    const nextCompany = CLIENT_PRESETS.find((c) => c.id === nextCompanyId);
    if (nextCompany && nextCompany.products.length > 0) {
      setSelectedProductId(nextCompany.products[0].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selectors Glass Card */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="company-select" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Select Client / Company
            </label>
            <select
              id="company-select"
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              className="premium-select"
            >
              {CLIENT_PRESETS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="preset-product-select" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Select Negotiated Product
            </label>
            <select
              id="preset-product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="premium-select"
            >
              {company.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sizeLabel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Details & Fixed Price */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between lg:col-span-2">
          <div>
            <span className="badge badge-wood mb-3">Loaded Preset Specs</span>
            <h3 className="text-xl font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-main)' }}>
              {product.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="glass-card-inner p-3 text-center">
                <span className="block text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Length ({product.unit})</span>
                <strong className="text-lg font-mono font-bold" style={{ color: 'var(--text-main)' }}>{formatDimension(product.l)}</strong>
              </div>
              <div className="glass-card-inner p-3 text-center">
                <span className="block text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Width ({product.unit})</span>
                <strong className="text-lg font-mono font-bold" style={{ color: 'var(--text-main)' }}>{formatDimension(product.w)}</strong>
              </div>
              <div className="glass-card-inner p-3 text-center">
                <span className="block text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Height ({product.unit})</span>
                <strong className="text-lg font-mono font-bold" style={{ color: 'var(--text-main)' }}>{formatDimension(product.h)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="total-card flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="quote-total-label block mb-1">Negotiated Flat Price</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black" style={{ color: 'var(--text-light)' }}>₹</span>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value) || 0)}
                className="w-full bg-white dark:bg-[#111217] border border-amber-700/40 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-2xl font-extrabold text-amber-950 dark:text-amber-100 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-left shadow-sm transition-all duration-200"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
            <small className="block text-xs" style={{ color: 'var(--text-muted)' }}>
              Editable override for invoice generation
            </small>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => onPrintPreset(getPresetDataPayload())}
              className="btn-primary flex-1 justify-center py-2.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Quote</span>
            </button>
            <button
              onClick={() => onDownloadPresetPDF(getPresetDataPayload())}
              className="btn-secondary flex-1 justify-center py-2.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parts List / Cut Sheet */}
      <div className="glass-card">
        <div className="section-header">
          <div className="flex items-center">
            <div className="section-icon">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="section-title">Cut Sheet Specifications (Bill of Materials)</span>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
            Total Net CFT: {formatCFT(totalCFT)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th className="w-[10%]">Part ID</th>
                <th className="w-[45%]">Description</th>
                <th className="w-[15%]">L (mm/in)</th>
                <th className="w-[15%]">W (mm/in)</th>
                <th className="w-[15%]">H (mm/in)</th>
                <th className="w-[10%]">Qty</th>
                <th className="w-[10%]">CFT</th>
              </tr>
            </thead>
            <tbody>
              {partsWithCFT.map((part, index) => (
                <tr key={`${part.id}-${index}`}>
                  <td>
                    <input
                      type="text"
                      value={part.id}
                      onChange={(e) => updatePart(index, 'id', e.target.value)}
                      className="table-input"
                      style={{ textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={part.label}
                      onChange={(e) => updatePart(index, 'label', e.target.value)}
                      className="table-input"
                      style={{ textAlign: 'left' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={part.l}
                      onChange={(e) => updatePart(index, 'l', e.target.value)}
                      className="table-input font-mono"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={part.w}
                      onChange={(e) => updatePart(index, 'w', e.target.value)}
                      className="table-input font-mono"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={part.h}
                      onChange={(e) => updatePart(index, 'h', e.target.value)}
                      className="table-input font-mono"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={part.qty}
                      onChange={(e) => updatePart(index, 'qty', e.target.value)}
                      className="table-input font-mono"
                    />
                  </td>
                  <td className="pr-4 py-2 font-mono font-medium text-right" style={{ color: 'var(--text-muted)' }}>
                    {formatCFT(part.cft)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
