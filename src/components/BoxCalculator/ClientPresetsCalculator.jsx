import React, { useState, useEffect, useMemo } from 'react';
import { CLIENT_PRESETS, generateDefaultParts } from '../../engine/clientPresets';
import { useBoxCalculator } from '../../hooks/useBoxCalculator';
import DimensionInputs from './DimensionInputs';
import RateInputs from './RateInputs';
import PartsTable from './PartsTable';
import CostSummary from './CostSummary';

const isWoodProduct = (product) => {
  const name = product.name.toLowerCase();
  if (name.includes('plywood') && !name.includes('pinewood') && !name.includes('rubberwood') && !name.includes('countrywood')) {
    return false;
  }
  if (name.includes('ply box') && !name.includes('support reaper')) {
    return false;
  }
  return true;
};

export default function ClientPresetsCalculator({ onPrintQuote, onDownloadPDF, onOpenClientQuote }) {
  // We initialize the calculator state with the first product of the first company
  const defaultProduct = CLIENT_PRESETS[0].products[0];
  
  const calc = useBoxCalculator({
    l: defaultProduct.l,
    w: defaultProduct.w,
    h: defaultProduct.h,
    unit: defaultProduct.unit
  });

  // Select Company State
  const [selectedCompanyId, setSelectedCompanyId] = useState(CLIENT_PRESETS[0].id);

  // Custom client name state
  const [customCompanyName, setCustomCompanyName] = useState('CUSTOM CLIENT');

  // Active Company Object
  const company = useMemo(() => {
    if (selectedCompanyId === 'other') {
      return {
        id: 'other',
        companyName: customCompanyName,
        products: [
          {
            id: 'custom-product',
            name: 'CUSTOM PRODUCT',
            sizeLabel: 'Custom',
            l: 1140,
            w: 1080,
            h: 120,
            unit: 'mm',
            price: 1020,
            parts: null
          }
        ]
      };
    }
    const rawCompany = CLIENT_PRESETS.find((c) => c.id === selectedCompanyId) || CLIENT_PRESETS[0];
    return {
      ...rawCompany,
      products: rawCompany.products.filter(isWoodProduct)
    };
  }, [selectedCompanyId, customCompanyName]);

  // Select Product State (default to first product of selected company)
  const [selectedProductId, setSelectedProductId] = useState(company.products[0]?.id || 'custom-product');

  // Active Product Object
  const product = useMemo(() => {
    return company.products.find((p) => p.id === selectedProductId) || company.products[0] || company.products[0];
  }, [company, selectedProductId]);

  // Negotiated flat price state
  const [useNegotiatedPrice, setUseNegotiatedPrice] = useState(true);
  const [negotiatedPrice, setNegotiatedPrice] = useState(defaultProduct.price);

  // Reset/Load new product preset specs when company/product selection changes
  useEffect(() => {
    if (product) {
      setNegotiatedPrice(product.price);
      setUseNegotiatedPrice(true);
      const resolvedParts = product.parts || generateDefaultParts(product.name, product.l, product.w, product.h, product.unit);
      // Load preset into calc hook
      calc.loadPreset(product, resolvedParts);
    }
  }, [product]);

  // Handle company change
  const handleCompanyChange = (e) => {
    const nextCompanyId = e.target.value;
    setSelectedCompanyId(nextCompanyId);
    if (nextCompanyId === 'other') {
      setSelectedProductId('custom-product');
    } else {
      const nextCompany = CLIENT_PRESETS.find((c) => c.id === nextCompanyId);
      if (nextCompany) {
        const woodProducts = nextCompany.products.filter(isWoodProduct);
        if (woodProducts.length > 0) {
          setSelectedProductId(woodProducts[0].id);
        } else if (nextCompany.products.length > 0) {
          setSelectedProductId(nextCompany.products[0].id);
        }
      }
    }
  };
  const handleWoodDimChange = (key, val) => {
    setUseNegotiatedPrice(false);
    calc.updateWoodDim(key, val);
  };

  const handleWoodUnitChange = (unit) => {
    setUseNegotiatedPrice(false);
    calc.changeWoodUnit(unit);
  };

  const handleWoodPartUpdate = (idx, fld, val) => {
    setUseNegotiatedPrice(false);
    calc.updatePart('wood', idx, fld, val);
  };

  const handleWoodPartAdd = () => {
    setUseNegotiatedPrice(false);
    calc.addCustomPart('wood');
  };

  const handleWoodPartRemove = (idx) => {
    setUseNegotiatedPrice(false);
    calc.removePart('wood', idx);
  };

  const handleWoodPartToggleExclusion = (idx) => {
    setUseNegotiatedPrice(false);
    calc.togglePartExclusion('wood', idx);
  };





  // Overridden Wood calculation result when negotiated price is active
  const woodResultOverridden = useMemo(() => {
    if (!useNegotiatedPrice) return calc.woodResult;

    return {
      ...calc.woodResult,
      woodCost: negotiatedPrice,
      labourCost: 0,
      nailCost: 0,
      transportCost: 0,
      packingCost: 0,
      clampCost: 0,
      subtotal: negotiatedPrice,
      profit: 0,
      finalTotal: negotiatedPrice,
    };
  }, [calc.woodResult, useNegotiatedPrice, negotiatedPrice]);

  // Consolidated result
  const combinedResult = useMemo(() => {
    if (calc.useWood && !calc.usePly) {
      return woodResultOverridden;
    }
    if (!calc.useWood && calc.usePly) {
      return calc.plyResult;
    }
    const finalTotal = (woodResultOverridden.finalTotal || 0) + (calc.plyResult.finalTotal || 0);
    return {
      wood: woodResultOverridden,
      ply: calc.plyResult,
      finalTotal,
    };
  }, [calc.useWood, calc.usePly, woodResultOverridden, calc.plyResult]);

  // Prepares data payload for preview and print
  const getPresetDataPayload = () => {
    return {
      dims: calc.woodDims,
      rates: calc.woodRates,
      result: combinedResult,
      clientName: company.companyName,
      useWood: calc.useWood,
      usePly: calc.usePly,
      woodDims: calc.woodDims,
      woodRates: calc.woodRates,
      woodResult: woodResultOverridden,
      wood: woodResultOverridden,
      plyDims: calc.plyDims,
      plyRates: calc.plyRates,
      plyResult: calc.plyResult,
      ply: calc.plyResult
    };
  };

  return (
    <div className="space-y-6">
      {/* Selectors Card */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              <option value="other">Other (Custom Client)</option>
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
              disabled={selectedCompanyId === 'other'}
            >
              {selectedCompanyId === 'other' ? (
                <option value="custom-product">Custom Product</option>
              ) : (
                company.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sizeLabel})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-blue-600/20">
            <div className="flex items-center gap-2 mb-1.5">
              <input
                id="use-negotiated-price"
                type="checkbox"
                checked={useNegotiatedPrice}
                onChange={(e) => setUseNegotiatedPrice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="use-negotiated-price" className="text-xs font-bold uppercase tracking-wider select-none cursor-pointer" style={{ color: 'var(--text-main)' }}>
                Use Negotiated Flat Price
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input
                id="flat-price-input"
                type="number"
                value={negotiatedPrice}
                onChange={(e) => setNegotiatedPrice(Number(e.target.value) || 0)}
                disabled={!useNegotiatedPrice}
                className="w-full bg-white dark:bg-[#111217] border border-blue-600/30 dark:border-slate-700 rounded px-2.5 py-1 font-mono text-sm font-bold text-main disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {selectedCompanyId === 'other' && (
            <div className="flex flex-col gap-2 animate-fade-in md:col-span-3">
              <label htmlFor="custom-company-name" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Enter Custom Client Name
              </label>
              <input
                id="custom-company-name"
                type="text"
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                placeholder="e.g. GOOGLE INDIA"
                className="premium-input text-left"
                style={{ textAlign: 'left' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Material Checkbox Toggles */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-blue-600/20 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 backdrop-blur-md no-print">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="toggle-wood"
            checked={calc.useWood}
            onChange={(e) => {
              if (!e.target.checked && !calc.usePly) return;
              calc.setUseWood(e.target.checked);
            }}
            className="w-5 h-5 rounded-lg text-amber-500 border-amber-500/30 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="toggle-wood" className="text-sm font-extrabold uppercase tracking-wider select-none cursor-pointer" style={{ color: 'var(--text-main)' }}>
            Pine Wood
          </label>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="toggle-ply"
            checked={calc.usePly}
            onChange={(e) => {
              if (!e.target.checked && !calc.useWood) return;
              calc.setUsePly(e.target.checked);
            }}
            className="w-5 h-5 rounded-lg text-blue-500 border-blue-500/30 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="toggle-ply" className="text-sm font-extrabold uppercase tracking-wider select-none cursor-pointer" style={{ color: 'var(--text-main)' }}>
            Plywood
          </label>
        </div>

        <div className="flex items-center gap-2.5 border-l pl-6 border-blue-600/20">
          <input
            type="checkbox"
            id="toggle-link"
            checked={calc.linkDims}
            onChange={(e) => calc.setLinkDims(e.target.checked)}
            className="w-5 h-5 rounded-lg text-indigo-500 border-indigo-500/30 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="toggle-link" className="text-sm font-extrabold uppercase tracking-wider select-none cursor-pointer" style={{ color: 'var(--text-main)' }}>
            Link Dimensions
          </label>
        </div>
      </div>

      {/* Grid for Dimensions & Rates */}
      <div className="space-y-6">
        {/* Dimensions Row */}
        <div className={`grid grid-cols-1 ${calc.useWood && calc.usePly ? 'xl:grid-cols-2' : ''} gap-6 no-print`}>
          {calc.useWood && (
            <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.12s', animationFillMode: 'both' }}>
              <div className="border-l-4 border-amber-500 pl-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Dimensions</h3>
              </div>
              <div className="flex-1">
                <DimensionInputs
                  dims={calc.woodDims}
                  onChange={handleWoodDimChange}
                  onUnitChange={handleWoodUnitChange}
                  showPresetSelector={false}
                />
              </div>
            </div>
          )}

          {calc.usePly && (
            <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.14s', animationFillMode: 'both' }}>
              <div className="border-l-4 border-blue-500 pl-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Dimensions</h3>
              </div>
              <div className="flex-1">
                <DimensionInputs
                  dims={calc.plyDims}
                  onChange={calc.updatePlyDim}
                  onUnitChange={calc.changePlyUnit}
                  showPresetSelector={true}
                  onSelectPreset={calc.loadPlyPreset}
                  isPlywood={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Rates Row */}
        <div className={`grid grid-cols-1 ${calc.useWood && calc.usePly ? 'xl:grid-cols-2' : ''} gap-6 no-print`}>
          {calc.useWood && (
            <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <div className="border-l-4 border-amber-500 pl-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Rates & Parameters</h3>
              </div>
              <div className="flex-1">
                <RateInputs 
                  rates={calc.woodRates} 
                  onChange={(key, val) => {
                    setUseNegotiatedPrice(false);
                    calc.updateWoodRate(key, val);
                  }} 
                />
              </div>
            </div>
          )}

          {calc.usePly && (
            <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.17s', animationFillMode: 'both' }}>
              <div className="border-l-4 border-blue-500 pl-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Rates & Parameters</h3>
              </div>
              <div className="flex-1">
                <RateInputs rates={calc.plyRates} onChange={calc.updatePlyRate} isPlywood={true} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parts Breakdown Table (matches Custom Calculator) */}
      <div className={`grid grid-cols-1 ${calc.useWood && calc.usePly ? 'xl:grid-cols-2' : ''} gap-6 no-print`}>
        {calc.useWood && (
          <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.18s', animationFillMode: 'both' }}>
            <div className="border-l-4 border-amber-500 pl-3">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Parts Breakdown</h3>
            </div>
            <div className="flex-1">
              <PartsTable
                parts={woodResultOverridden.partsWithCFT || []}
                result={woodResultOverridden}
                rates={calc.woodRates}
                onUpdatePart={handleWoodPartUpdate}
                onAddPart={handleWoodPartAdd}
                onRemovePart={handleWoodPartRemove}
                onToggleExclusion={handleWoodPartToggleExclusion}
                compact={calc.useWood && calc.usePly}
              />
            </div>
          </div>
        )}
        {calc.usePly && (
          <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="border-l-4 border-blue-500 pl-3">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Parts Breakdown</h3>
            </div>
            <div className="flex-1">
              <PartsTable
                parts={calc.plyResult.partsWithCFT || []}
                result={calc.plyResult}
                rates={calc.plyRates}
                onUpdatePart={(idx, fld, val) => calc.updatePart('ply', idx, fld, val)}
                onAddPart={() => calc.addCustomPart('ply')}
                onRemovePart={(idx) => calc.removePart('ply', idx)}
                onToggleExclusion={(idx) => calc.togglePartExclusion('ply', idx)}
                compact={calc.useWood && calc.usePly}
                isPlywood={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cost Summary (matches Custom Calculator) */}
      <CostSummary
        result={combinedResult}
        rates={calc.woodRates}
        useWood={calc.useWood}
        usePly={calc.usePly}
        woodResult={woodResultOverridden}
        woodRates={calc.woodRates}
        plyResult={calc.plyResult}
        plyRates={calc.plyRates}
        onPrintQuote={() => onPrintQuote(getPresetDataPayload())}
        onDownloadPDF={() => onDownloadPDF(getPresetDataPayload())}
        onOpenClientQuote={() => onOpenClientQuote(getPresetDataPayload())}
      />
    </div>
  );
}
