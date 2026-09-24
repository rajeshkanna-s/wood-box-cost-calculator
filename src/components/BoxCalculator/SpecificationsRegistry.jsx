import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../engine/supabaseClient';
import { fetchSpecifications, saveSpecifications, generateDefaultSpecs } from '../../engine/specificationsService';
import { calcCFT, calcSFT } from '../../engine/cft';

const PRODUCT_TABS = [
  { id: 'pine-wood-box', label: 'PINE BOX' },
  { id: 'ply-wood-pallet', label: 'PLY PALLET' },
  { id: 'pine-wood-pallet', label: 'PINE PALLET' },
  { id: 'pine-plywood-box', label: 'PINE PLY BOX' }
];

export default function SpecificationsRegistry({
  companies = [],
  selectedCompanyId,
  onSelectCompany,
  initialProductType = 'pine-wood-box',
  activePresetId,
  onSpecificationsSaved
}) {
  const [productType, setProductType] = useState(initialProductType);
  const [companyId, setCompanyId] = useState(selectedCompanyId || (companies[0]?.id || ''));
  const [presetSizes, setPresetSizes] = useState([]);
  const [presetSizeId, setPresetSizeId] = useState(activePresetId || '');
  
  // Specifications state
  const [specs, setSpecs] = useState([]);
  const [rates, setRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'saving', 'saved', 'unsaved', 'error'
  const [toastMessage, setToastMessage] = useState(null);

  // New spec form inputs
  const [newPartId, setNewPartId] = useState('');
  const [newPartLabel, setNewPartLabel] = useState('');
  const [newL, setNewL] = useState('');
  const [newW, setNewW] = useState('');
  const [newH, setNewH] = useState('');
  const [newQty, setNewQty] = useState('2');
  const [newIsPly, setNewIsPly] = useState(false);

  // Keep companyId in sync with props
  useEffect(() => {
    if (selectedCompanyId) {
      setCompanyId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  // Load preset sizes for current product tab
  useEffect(() => {
    async function loadPresets() {
      try {
        const { data, error } = await supabase
          .from('preset_sizes')
          .select('*')
          .eq('product_type', productType)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setPresetSizes(data || []);
        if (data && data.length > 0) {
          // If current presetSizeId is not in data, pick first
          if (!data.some(p => p.id === presetSizeId)) {
            setPresetSizeId(data[0].id);
          }
        } else {
          setPresetSizeId('');
        }
      } catch (err) {
        console.error('Error fetching preset sizes:', err);
      }
    }
    loadPresets();
  }, [productType]);

  // Current selected preset object
  const currentPreset = useMemo(() => {
    return presetSizes.find(p => p.id === presetSizeId) || null;
  }, [presetSizes, presetSizeId]);

  // Load specifications when company, preset size, or product type changes
  useEffect(() => {
    if (!presetSizeId) {
      setSpecs([]);
      return;
    }

    let isMounted = true;
    async function loadSpecs() {
      setIsLoading(true);
      try {
        const result = await fetchSpecifications({
          companyId,
          presetSizeId,
          productType,
          presetObj: currentPreset
        });

        if (isMounted) {
          setSpecs(result.parts || []);
          setRates(result.rates || {});
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Error loading specs in registry:', err);
        if (isMounted) {
          setSyncStatus('error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSpecs();

    return () => {
      isMounted = false;
    };
  }, [companyId, presetSizeId, productType, currentPreset]);

  // Show temporary toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save specifications to DB
  const handleSaveToDb = async (updatedSpecs = specs) => {
    if (!companyId) {
      alert('Please select a company to save specifications.');
      return;
    }
    if (!presetSizeId) {
      alert('Please select a preset size to save specifications.');
      return;
    }

    setSyncStatus('saving');
    try {
      await saveSpecifications({
        companyId,
        presetSizeId,
        productType,
        parts: updatedSpecs,
        rates
      });

      setSyncStatus('saved');
      showToast('Specifications successfully saved to database!');
      if (onSpecificationsSaved) {
        onSpecificationsSaved({
          companyId,
          presetSizeId,
          productType,
          parts: updatedSpecs
        });
      }
      setTimeout(() => setSyncStatus('synced'), 2500);
    } catch (err) {
      console.error('Error saving specifications:', err);
      setSyncStatus('error');
      alert('Failed to save specifications: ' + err.message);
    }
  };

  // Update a field in a spec row
  const handleUpdateSpec = (index, field, value) => {
    setSpecs(prev => {
      const next = [...prev];
      const textFields = ['id', 'label'];
      const val = textFields.includes(field) ? value : (field === 'isPly' || field === 'isExcluded' ? value : Number(value) || 0);
      next[index] = { ...next[index], [field]: val };
      return next;
    });
    setSyncStatus('unsaved');
  };

  // Add a new specification row
  const handleAddSpecification = (e) => {
    e?.preventDefault();
    if (!newPartId.trim()) {
      alert('Please enter a Part Code (e.g. TOP, SIDE, TR, etc.)');
      return;
    }

    const newPart = {
      id: newPartId.trim().toUpperCase(),
      label: newPartLabel.trim() || newPartId.trim().toUpperCase(),
      l: Number(newL) || 0,
      w: Number(newW) || 0,
      h: Number(newH) || 0,
      qty: Number(newQty) || 1,
      isPly: Boolean(newIsPly),
      isCustom: true,
      isExcluded: false
    };

    const updated = [...specs, newPart];
    setSpecs(updated);
    setNewPartId('');
    setNewPartLabel('');
    setNewL('');
    setNewW('');
    setNewH('');
    setNewQty('2');
    setSyncStatus('unsaved');
    showToast(`Added component "${newPart.id}". Click Save or keep editing.`);
  };

  // Delete a specification row
  const handleDeleteSpec = (index) => {
    const item = specs[index];
    if (window.confirm(`Delete component "${item.id} - ${item.label}"?`)) {
      const updated = specs.filter((_, i) => i !== index);
      setSpecs(updated);
      setSyncStatus('unsaved');
      showToast(`Removed component "${item.id}".`);
    }
  };

  // Toggle exclusion of a component
  const handleToggleExclude = (index) => {
    setSpecs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isExcluded: !next[index].isExcluded };
      return next;
    });
    setSyncStatus('unsaved');
  };

  // Reset to formula defaults
  const handleResetToDefaults = () => {
    if (!currentPreset) {
      alert('No preset size selected.');
      return;
    }
    if (window.confirm('Reset this specifications table to standard calculated box formulas? This will overwrite custom parts for this profile.')) {
      const defaults = generateDefaultSpecs(productType, currentPreset);
      setSpecs(defaults);
      setSyncStatus('unsaved');
      showToast('Reset to standard calculated specifications. Click Save to DB to apply.');
    }
  };

  // Calculated totals for summary
  const summary = useMemo(() => {
    const activeSpecs = specs.filter(s => !s.isExcluded);
    const totalPieces = activeSpecs.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
    
    let totalWoodCFT = 0;
    let totalPlySFT = 0;

    activeSpecs.forEach(s => {
      const l = Number(s.l) || 0;
      const w = Number(s.w) || 0;
      const h = Number(s.h) || 0;
      const qty = Number(s.qty) || 0;

      if (s.isPly) {
        totalPlySFT += calcSFT(l, w, qty);
      } else {
        totalWoodCFT += calcCFT(l, w, h, qty);
      }
    });

    return {
      componentsCount: specs.length,
      activeCount: activeSpecs.length,
      totalPieces,
      totalWoodCFT: totalWoodCFT.toFixed(4),
      totalPlySFT: totalPlySFT.toFixed(2)
    };
  }, [specs]);

  return (
    <div className="glass-card p-5 space-y-6 animate-slide-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-blue-400">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3" style={{ borderColor: 'var(--card-border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </span>
            <h3 className="text-lg font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)', margin: 0 }}>
              Specifications & Parts Registry (DB Table)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Add and edit exact component specifications (Part code, description, length, width, thickness, qty, material) synced directly with Supabase DB.
          </p>
        </div>

        {/* Sync Status Badge & Action buttons */}
        <div className="flex items-center gap-2">
          {syncStatus === 'saving' && (
            <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Saving to DB...
            </span>
          )}
          {syncStatus === 'saved' && (
            <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Saved to Cloud DB
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Cloud Synced
            </span>
          )}
          {syncStatus === 'unsaved' && (
            <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Unsaved Changes
            </span>
          )}

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg"
            title="Reset components to formula defaults for this size"
          >
            Reset Template
          </button>
          <button
            type="button"
            onClick={() => handleSaveToDb()}
            className="btn-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            disabled={syncStatus === 'saving'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save to DB
          </button>
        </div>
      </div>

      {/* Context Selection Bar: Company | Product Tab | Preset Size */}
      <div className="bg-slate-500/5 p-4 rounded-xl space-y-3 border" style={{ borderColor: 'var(--card-border)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* 1. Client Company Select */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              1. Client / Company:
            </label>
            <select
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value);
                if (onSelectCompany) onSelectCompany(e.target.value);
              }}
              className="premium-select w-full text-xs font-medium"
              style={{ height: '36px', background: 'var(--card-inner-bg)' }}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Product Calculator Tab */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              2. Product Category:
            </label>
            <div className="flex gap-1 bg-slate-500/10 p-1 rounded-lg">
              {PRODUCT_TABS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setProductType(t.id)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                    productType === t.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Preset Size Select */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              3. Preset Box Size:
            </label>
            <select
              value={presetSizeId}
              onChange={(e) => setPresetSizeId(e.target.value)}
              className="premium-select w-full text-xs font-medium"
              style={{ height: '36px', background: 'var(--card-inner-bg)' }}
              disabled={presetSizes.length === 0}
            >
              {presetSizes.length === 0 && (
                <option value="">No sizes registered for this product</option>
              )}
              {presetSizes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label} (L: {p.l} × W: {p.w} × H: {p.h} {p.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentPreset && (
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-500/10 font-mono">
            <span>Dimensions: {currentPreset.l} × {currentPreset.w} × {currentPreset.h} {currentPreset.unit}</span>
            {currentPreset.th && <span>• Thickness: {currentPreset.th} mm</span>}
            <span>• Profile ID: {currentPreset.id.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {/* Add New Specification Form */}
      <form onSubmit={handleAddSpecification} className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Specification Component
          </span>
          <span className="text-[11px] text-slate-400">All dimension units in millimeters (mm)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {/* Part ID */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Part Code</label>
            <input
              type="text"
              placeholder="e.g. TOP"
              value={newPartId}
              onChange={(e) => setNewPartId(e.target.value)}
              className="premium-input text-xs w-full text-left font-mono font-bold"
              style={{ textAlign: 'left', height: '32px' }}
              required
            />
          </div>

          {/* Description */}
          <div className="col-span-1 sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description / Name</label>
            <input
              type="text"
              placeholder="e.g. Top/Bottom Panel"
              value={newPartLabel}
              onChange={(e) => setNewPartLabel(e.target.value)}
              className="premium-input text-xs w-full text-left"
              style={{ textAlign: 'left', height: '32px' }}
            />
          </div>

          {/* Length */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Length (mm)</label>
            <input
              type="number"
              step="any"
              placeholder="L (mm)"
              value={newL}
              onChange={(e) => setNewL(e.target.value)}
              className="premium-input text-xs w-full text-center font-mono"
              style={{ height: '32px' }}
              required
            />
          </div>

          {/* Width */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Width (mm)</label>
            <input
              type="number"
              step="any"
              placeholder="W (mm)"
              value={newW}
              onChange={(e) => setNewW(e.target.value)}
              className="premium-input text-xs w-full text-center font-mono"
              style={{ height: '32px' }}
              required
            />
          </div>

          {/* Height / Thickness */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Height/Th (mm)</label>
            <input
              type="number"
              step="any"
              placeholder="H (mm)"
              value={newH}
              onChange={(e) => setNewH(e.target.value)}
              className="premium-input text-xs w-full text-center font-mono"
              style={{ height: '32px' }}
              required
            />
          </div>

          {/* Qty */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="premium-input text-xs w-full text-center font-bold"
              style={{ height: '32px' }}
              required
            />
          </div>
        </div>

        {/* Material & Add Button row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Material Type:</span>
            <div className="flex gap-1 bg-slate-500/10 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setNewIsPly(false)}
                className={`px-3 py-1 text-xs font-bold rounded ${!newIsPly ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🌲 Pine Wood
              </button>
              <button
                type="button"
                onClick={() => setNewIsPly(true)}
                className={`px-3 py-1 text-xs font-bold rounded ${newIsPly ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🪵 Plywood
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ height: '34px' }}
          >
            + Add Specification Row
          </button>
        </div>
      </form>

      {/* Specifications Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
            Active Components Table ({specs.length} Specifications)
          </h4>
          <span className="text-[11px] text-slate-400">Click any cell to edit directly</span>
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--table-border)' }}>
          <table className="premium-table w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--card-inner-bg)' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '12%', textAlign: 'left' }}>Part Code</th>
                <th style={{ width: '28%', textAlign: 'left' }}>Description</th>
                <th style={{ width: '10%', textAlign: 'center' }}>L (mm)</th>
                <th style={{ width: '10%', textAlign: 'center' }}>W (mm)</th>
                <th style={{ width: '10%', textAlign: 'center' }}>H/Th (mm)</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Material</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Vol / Area</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-xs">
                    Loading specifications from database...
                  </td>
                </tr>
              ) : specs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-xs">
                    No specifications configured for this size. Use the form above to add components or click "Reset Template" to auto-generate.
                  </td>
                </tr>
              ) : (
                specs.map((item, idx) => {
                  const isWood = !item.isPly;
                  const unitVal = item.isPly
                    ? `${calcSFT(item.l, item.w, item.qty).toFixed(2)} SFT`
                    : `${calcCFT(item.l, item.w, item.h, item.qty).toFixed(4)} CFT`;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-500/5 transition-colors ${
                        item.isExcluded ? 'opacity-40 grayscale' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="text-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Part Code */}
                      <td>
                        <input
                          type="text"
                          value={item.id || ''}
                          onChange={(e) => handleUpdateSpec(idx, 'id', e.target.value)}
                          className="table-input w-full font-mono font-bold text-xs uppercase"
                          placeholder="Code"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* Description / Label */}
                      <td>
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => handleUpdateSpec(idx, 'label', e.target.value)}
                          className="table-input w-full text-xs text-left"
                          placeholder="Description"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* L (mm) */}
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={item.l === 0 ? '' : Number(Number(item.l || 0).toFixed(2))}
                          onChange={(e) => handleUpdateSpec(idx, 'l', e.target.value)}
                          className="table-input w-full text-center font-mono text-xs"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* W (mm) */}
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={item.w === 0 ? '' : Number(Number(item.w || 0).toFixed(2))}
                          onChange={(e) => handleUpdateSpec(idx, 'w', e.target.value)}
                          className="table-input w-full text-center font-mono text-xs"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* H (mm) */}
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={item.h === 0 ? '' : Number(Number(item.h || 0).toFixed(2))}
                          onChange={(e) => handleUpdateSpec(idx, 'h', e.target.value)}
                          className="table-input w-full text-center font-mono text-xs"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* Qty */}
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty === 0 ? '' : item.qty}
                          onChange={(e) => handleUpdateSpec(idx, 'qty', e.target.value)}
                          className="table-input w-full text-center font-bold text-xs"
                          disabled={item.isExcluded}
                        />
                      </td>

                      {/* Material toggle */}
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateSpec(idx, 'isPly', !item.isPly)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${
                            item.isPly
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                          title="Click to toggle Pine Wood vs Plywood"
                        >
                          {item.isPly ? '🪵 Ply' : '🌲 Wood'}
                        </button>
                      </td>

                      {/* Calculated volume / area */}
                      <td className="text-right font-mono text-[11px] font-semibold" style={{ color: 'var(--text-main)' }}>
                        {unitVal}
                      </td>

                      {/* Actions: Exclude & Delete */}
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleExclude(idx)}
                            className={`p-1 rounded transition-colors ${
                              item.isExcluded
                                ? 'text-green-500 hover:text-green-400 bg-green-500/10'
                                : 'text-slate-400 hover:text-orange-400 bg-slate-500/10'
                            }`}
                            title={item.isExcluded ? 'Include in calculation' : 'Exclude from calculation'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {item.isExcluded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              )}
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSpec(idx)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 bg-slate-500/10 hover:bg-red-500/10 transition-colors"
                            title="Delete specification"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-500/5 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400">Components: </span>
            <strong className="text-white font-mono">{summary.activeCount} active</strong>
            {summary.componentsCount > summary.activeCount && (
              <span className="text-slate-500 ml-1">({summary.componentsCount - summary.activeCount} excluded)</span>
            )}
          </div>
          <div>
            <span className="text-slate-400">Total Pieces: </span>
            <strong className="text-white font-mono">{summary.totalPieces} pcs</strong>
          </div>
          <div>
            <span className="text-amber-400 font-semibold">Wood Volume: </span>
            <strong className="text-amber-300 font-mono">{summary.totalWoodCFT} CFT</strong>
          </div>
          {summary.totalPlySFT > 0 && (
            <div>
              <span className="text-blue-400 font-semibold">Plywood Area: </span>
              <strong className="text-blue-300 font-mono">{summary.totalPlySFT} SFT</strong>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveToDb()}
            className="btn-primary px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Save Specifications to DB
          </button>
        </div>
      </div>
    </div>
  );
}
