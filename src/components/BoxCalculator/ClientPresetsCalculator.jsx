import React, { useState, useEffect, useMemo } from 'react';
import { CLIENT_PRESETS, generateDefaultParts } from '../../engine/clientPresets';
import { useBoxCalculator } from '../../hooks/useBoxCalculator';
import DimensionInputs from './DimensionInputs';
import RateInputs from './RateInputs';
import PartsTable from './PartsTable';
import CostSummary from './CostSummary';

const isWoodProduct = (product) => {
  return true;
};

export default function ClientPresetsCalculator({ onPrintQuote, onDownloadPDF, onOpenClientQuote }) {
  const calc = useBoxCalculator({
    l: 1140,
    w: 800,
    h: 195,
    unit: 'mm'
  }, { isPresetTab: true });

  // Select Company State
  const [selectedCompanyId, setSelectedCompanyId] = useState(CLIENT_PRESETS[0].id);

  // Custom client name state
  const [customCompanyName, setCustomCompanyName] = useState('CUSTOM CLIENT');

  // Active Company Name
  const companyName = useMemo(() => {
    if (selectedCompanyId === 'other') {
      return customCompanyName;
    }
    const matched = CLIENT_PRESETS.find((c) => c.id === selectedCompanyId);
    return matched ? matched.companyName : '';
  }, [selectedCompanyId, customCompanyName]);

  // Handle company change
  const handleCompanyChange = (e) => {
    setSelectedCompanyId(e.target.value);
  };

  // Consolidated result
  const combinedResult = useMemo(() => {
    if (calc.useWood && !calc.usePly) {
      return calc.woodResult;
    }
    if (!calc.useWood && calc.usePly) {
      return calc.plyResult;
    }
    const finalTotal = (calc.woodResult.finalTotal || 0) + (calc.plyResult.finalTotal || 0);
    return {
      wood: calc.woodResult,
      ply: calc.plyResult,
      finalTotal,
    };
  }, [calc.useWood, calc.usePly, calc.woodResult, calc.plyResult]);

  // Prepares data payload for preview and print
  const getPresetDataPayload = () => {
    return {
      dims: calc.useWood ? calc.woodDims : calc.plyDims,
      rates: calc.useWood ? calc.woodRates : calc.plyRates,
      result: combinedResult,
      clientName: companyName,
      useWood: calc.useWood,
      usePly: calc.usePly,
      woodDims: calc.woodDims,
      woodRates: calc.woodRates,
      woodResult: calc.woodResult,
      wood: calc.woodResult,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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

          {selectedCompanyId === 'other' && (
            <div className="flex flex-col gap-2 animate-fade-in">
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
              if (!e.target.checked && calc.usePly) return; // Block unchecking wood when plywood is checked
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
              if (e.target.checked) {
                calc.setUseWood(true);
                // Switch to default plywood box dimensions (Section 1 from -01.xlsx)
                calc.updateWoodDim('l', 1140);
                calc.updateWoodDim('w', 800);
                calc.updateWoodDim('h', 195);
                calc.changeWoodUnit('mm');
              } else {
                // Switch to default pine wood block pallet dimensions (Section 5 from -02.xlsx)
                calc.updateWoodDim('l', 1140);
                calc.updateWoodDim('w', 1080);
                calc.updateWoodDim('h', 130);
                calc.changeWoodUnit('mm');
              }
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
                  onChange={calc.updateWoodDim}
                  onUnitChange={calc.changeWoodUnit}
                  showPresetSelector={false}
                  onSelectPreset={calc.loadPreset}
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
                  showPresetSelector={false}
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
                  onChange={calc.updateWoodRate} 
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
                parts={calc.woodResult.partsWithCFT || []}
                result={calc.woodResult}
                rates={calc.woodRates}
                onUpdatePart={(idx, fld, val) => calc.updatePart('wood', idx, fld, val)}
                onAddPart={() => calc.addCustomPart('wood')}
                onRemovePart={(idx) => calc.removePart('wood', idx)}
                onToggleExclusion={(idx) => calc.togglePartExclusion('wood', idx)}
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
        rates={calc.useWood ? calc.woodRates : calc.plyRates}
        useWood={calc.useWood}
        usePly={calc.usePly}
        woodResult={calc.woodResult}
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
