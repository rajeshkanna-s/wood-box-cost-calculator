import React, { useState, useEffect, useMemo } from 'react';
import { useBoxCalculator } from './hooks/useBoxCalculator';
import DimensionInputs from './components/BoxCalculator/DimensionInputs';
import RateInputs from './components/BoxCalculator/RateInputs';
import PartsTable from './components/BoxCalculator/PartsTable';
import CostSummary from './components/BoxCalculator/CostSummary';
import ClientQuoteOptions from './components/BoxCalculator/ClientQuoteOptions';
import ClientQuoteSheet from './components/BoxCalculator/ClientQuoteSheet';
import QuoteSheet from './components/BoxCalculator/QuoteSheet';
import PresetSelector from './components/BoxPresets/PresetSelector';
import ClientPresetsCalculator from './components/BoxCalculator/ClientPresetsCalculator';
import QuotePreviewModal from './components/BoxCalculator/QuotePreviewModal';
import { CLIENT_PRESETS } from './engine/clientPresets';
import { supabase } from './engine/supabaseClient';
import { PRODUCT_PRESETS } from './engine/boxTypes';

const DEFAULT_CLIENT_QUOTE_OPTIONS = {
  showParts: false,
  showCftSummary: false,
  showCostBreakdown: false,
  showWaste: false,
  showProfit: false,
};

export default function App() {
  const {
    activeTab,
    setActiveTab,
    dims,
    rates,
    parts,
    result,
    updateDim,
    updateRate,
    changeUnit,
    loadPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion,
    resetParts,
    loadSavedState
  } = useBoxCalculator();

  const [isDark, setIsDark] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [isClientQuoteOpen, setIsClientQuoteOpen] = useState(false);
  const [clientQuoteOptions, setClientQuoteOptions] = useState(DEFAULT_CLIENT_QUOTE_OPTIONS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('detailed');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [companies, setCompanies] = useState([]);
  const [customPresets, setCustomPresets] = useState([]);
  const [saveStatus, setSaveStatus] = useState('synced'); // 'synced', 'saving', 'loading', 'local'
  const [activePresetId, setActivePresetId] = useState('');

  const finalClientName = companies.find(c => c.id === selectedCompanyId)?.name || '';

  // Load companies (clients) on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCompanies(data);
          // Auto-select Motherson 3 or first client
          const initialCompany = data.find(c => c.name.includes('Motherson')) || data[0];
          setSelectedCompanyId(initialCompany.id);
        } else {
          const fallback = CLIENT_PRESETS.map((c) => ({ id: c.id, name: c.companyName }));
          setCompanies(fallback);
          setSelectedCompanyId(fallback[0]?.id || '');
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        const fallback = CLIENT_PRESETS.map((c) => ({ id: c.id, name: c.companyName }));
        setCompanies(fallback);
        setSelectedCompanyId(fallback[0]?.id || '');
        setSaveStatus('local');
      }
    }
    loadCompanies();
  }, []);

  // Load custom preset sizes from DB when activeTab changes
  useEffect(() => {
    async function loadCustomPresets() {
      try {
        const { data, error } = await supabase
          .from('preset_sizes')
          .select('*')
          .eq('product_type', activeTab)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setCustomPresets(data || []);
        
        if (data && data.length > 0) {
          setActivePresetId(data[0].id);
        } else {
          setActivePresetId('');
        }
      } catch (err) {
        console.error('Error fetching custom presets:', err);
        setCustomPresets([]);
        setActivePresetId('');
      }
    }
    loadCustomPresets();
  }, [activeTab]);

  // Preset sizes loaded from DB
  const mergedPresets = useMemo(() => {
    return customPresets;
  }, [customPresets]);

  // Selected preset object
  const selectedPreset = useMemo(() => {
    return mergedPresets.find(p => p.id === activePresetId);
  }, [activePresetId, mergedPresets]);

  // Load calculations when selected company or selected preset size changes
  useEffect(() => {
    if (!selectedCompanyId || !activePresetId || !selectedPreset) {
      return;
    }

    async function loadSavedCalculation() {
      try {
        setSaveStatus('loading');
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('company_id', selectedCompanyId)
          .eq('preset_size_id', activePresetId)
          .eq('product_type', activeTab)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const targetUnit = selectedPreset.unit || 'in';
          const savedDims = {
            unit: targetUnit,
            l: selectedPreset.l,
            w: selectedPreset.w,
            h: selectedPreset.h,
            th: selectedPreset.th || undefined
          };
          loadSavedState(savedDims, data.rates, data.parts);
          setSaveStatus('synced');
        } else {
          // No saved calculation, load defaults for this preset
          loadPreset(selectedPreset);
          setSaveStatus('synced');
        }
      } catch (err) {
        console.error('Error loading calculation:', err);
        setSaveStatus('local');
      }
    }

    loadSavedCalculation();
  }, [selectedCompanyId, activePresetId, activeTab]);

  // Auto-save logic
  useEffect(() => {
    if (!selectedCompanyId || !activePresetId || !selectedPreset || saveStatus === 'loading') {
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('calculations')
          .upsert({
            company_id: selectedCompanyId,
            preset_size_id: activePresetId,
            product_type: activeTab,
            rates: rates,
            parts: parts
          }, { onConflict: 'company_id, preset_size_id, product_type' });

        if (error) throw error;
        setSaveStatus('synced');
      } catch (err) {
        console.error('Error auto-saving calculation:', err);
        setSaveStatus('local');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [rates, parts, selectedCompanyId, activePresetId]);

  const addNewClient = async () => {
    const name = window.prompt("Enter new client/company name:");
    if (!name || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCompanyId(data.id);
      }
    } catch (err) {
      console.error('Error adding new company:', err);
      alert('Failed to add client: ' + err.message);
    }
  };

  const saveCurrentSizeAsPreset = async () => {
    const defaultLabel = `${dims.l} × ${dims.w} × ${dims.h} ${dims.unit}`;
    const label = window.prompt("Enter a label for this preset size:", defaultLabel);
    if (!label) return;

    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .insert({
          label: label.trim(),
          l: dims.l,
          w: dims.w,
          h: dims.h,
          unit: dims.unit,
          th: dims.th || null,
          product_type: activeTab
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCustomPresets(prev => [...prev, data]);
        setActivePresetId(data.id);
        loadPreset(data);
      }
    } catch (err) {
      console.error('Error saving custom preset size:', err);
      alert('Failed to save preset size: ' + err.message);
    }
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'synced':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20" title="All edits successfully saved to Supabase DB.">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Synced
          </div>
        );
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Saving...
          </div>
        );
      case 'loading':
        return (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Loading DB Config...
          </div>
        );
      case 'local':
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20" title="Changes are kept locally in browser memory. Connect to internet to sync.">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Local Cache Only
          </div>
        );
    }
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const openPreview = (mode) => {
    setPreviewMode(mode);
    setIsPreviewOpen(true);
  };

  const printQuote = (mode) => {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      // 500ms allows the browser to layout and decode any large logo/image before printing
      window.setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 500);
    });
  };

  const downloadPDF = async (mode) => {
    const quoteStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTotal = Math.round(result.finalTotal || 0);
    const filename = mode === 'client'
      ? `Elshaddai_Client_Quote_EWP-${quoteStamp}-${cleanTotal}.pdf`
      : `Elshaddai_Detailed_Quote_EWP-${quoteStamp}-${cleanTotal}.pdf`;

    const viewport = document.querySelector('.preview-document-viewport');
    const liveSheet = viewport
      ? viewport.querySelector('.quote-sheet')
      : document.getElementById(mode === 'client' ? 'quote-sheet-client' : 'quote-sheet-detailed');
    if (!liveSheet) return;

    // Create off-screen wrapper
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.style.height = '1120px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.zIndex = '-9999';
    wrapper.style.pointerEvents = 'none';

    const container = document.createElement('div');
    container.style.width = '794px';
    container.style.height = '1120px';
    container.style.background = '#ffffff';
    container.style.boxSizing = 'border-box';
    container.style.position = 'relative';

    const clone = liveSheet.cloneNode(true);
    clone.style.cssText = `
      display: flex !important;
      flex-direction: column !important;
      width: 794px !important;
      height: 1120px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #334155 !important;
      padding: 16px 24px !important;
      font-family: 'Inter', Arial, sans-serif !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    `;

    // Fix gradient text for html2canvas
    clone.querySelectorAll('.brand-ewp-text, .quote-ewp-title').forEach((el) => {
      el.style.setProperty('background', 'none', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('webkit-background-clip', 'initial', 'important');
      el.style.setProperty('background-clip', 'initial', 'important');
      el.style.setProperty('webkit-text-fill-color', '#113f67', 'important');
      el.style.setProperty('color', '#113f67', 'important');
    });
    clone.querySelectorAll('.text-gradient').forEach((el) => {
      el.style.setProperty('background', 'none', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('webkit-background-clip', 'initial', 'important');
      el.style.setProperty('background-clip', 'initial', 'important');
      el.style.setProperty('webkit-text-fill-color', '#0064DC', 'important');
      el.style.setProperty('color', '#0064DC', 'important');
    });

    container.appendChild(clone);
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const html2pdfModule = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1120
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdfModule().from(container).set(opt).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const updateClientQuoteOption = (key, value) => {
    setClientQuoteOptions((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="app-root min-h-screen hero-gradient py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="screen-calculator max-w-5xl mx-auto">
        <header className="mb-10 animate-fade-in relative">
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="inline-flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-gray-300/30 transition-all duration-200"
              style={{ background: 'var(--card-inner-bg)', color: 'var(--text-main)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.07 6.07-1.42-1.42M7.35 7.35 5.93 5.93m12.14 0-1.42 1.42M7.35 16.65l-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <img
              src="/elshaddailogo.png"
              alt="Elshaddai Wood Packing Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="hidden sm:block h-12 w-px bg-blue-600/30 dark:bg-slate-700" />
            <div className="flex flex-col items-start justify-center">
              <span className="brand-ewp-text text-4xl sm:text-5xl mb-1">EWP</span>
              <h1 className="brand-company-text text-sm sm:text-base tracking-widest uppercase">
                ELSHADDAI WOOD PACKING
              </h1>
            </div>
          </div>

          <div className="glow-line mt-6 print:hidden" />

          {/* Tab Navigation Segmented Control */}
          <div className="flex justify-center mt-6 no-print">
            <div className="tab-navigation-bar flex flex-wrap gap-2 justify-center bg-transparent border-none">
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-wood-box' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-wood-box')}
              >
                PINE WOOD BOX
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'ply-wood-pallet' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('ply-wood-pallet')}
              >
                PLY WOOD PALLET
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-wood-pallet' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-wood-pallet')}
              >
                PINE WOOD PALLET
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-plywood-box' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-plywood-box')}
              >
                PINE PLYWOOD BOX
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="glass-card p-5 animate-slide-up no-print" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-4xl">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="section-icon shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <label htmlFor="company-select" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    Client / Company Name:
                  </label>
                </div>
                <div className="flex gap-2 w-full" style={{ maxWidth: '650px' }}>
                  <select
                    id="company-select"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="premium-select flex-1 text-sm font-medium"
                    style={{ 
                      background: 'var(--card-inner-bg)', 
                      color: 'var(--text-main)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '8px', 
                      padding: '10px 14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addNewClient}
                    className="btn-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-wider shrink-0"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    + Add Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Layout Grid for Inputs (Dimensions & Rates) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.12s', animationFillMode: 'both' }}>
              <DimensionInputs
                dims={dims}
                onChange={updateDim}
                onUnitChange={changeUnit}
                showPresetSelector={true}
                onSelectPreset={loadPreset}
                isPlywood={activeTab === 'ply-wood-pallet' || activeTab === 'pine-plywood-box'}
                type={activeTab}
                customPresetSelector={
                  <div className="flex gap-2 w-full">
                    <select
                      id="preset-select"
                      value={activePresetId}
                      onChange={(e) => {
                        setActivePresetId(e.target.value);
                        const selected = mergedPresets.find(p => p.id === e.target.value);
                        if (selected) loadPreset(selected);
                      }}
                      className="premium-select flex-1 text-xs"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', height: '32px' }}
                    >
                      <option value="" disabled>Choose a preset size...</option>
                      {mergedPresets.map(preset => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={saveCurrentSizeAsPreset}
                      className="btn-secondary px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider shrink-0"
                      style={{ height: '32px', display: 'flex', alignItems: 'center' }}
                      title="Save current dimensions as a reusable preset"
                    >
                      + Add Size
                    </button>
                  </div>
                }
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <RateInputs 
                rates={rates} 
                onChange={updateRate} 
                type={activeTab} 
              />
            </div>
          </div>

          {/* Parts Breakdown */}
          <div className="animate-slide-up no-print" style={{ animationDelay: '0.18s', animationFillMode: 'both' }}>
            <PartsTable
              parts={parts}
              result={result}
              rates={rates}
              dims={dims}
              onUpdatePart={updatePart}
              onAddPart={addCustomPart}
              onRemovePart={removePart}
              onToggleExclusion={togglePartExclusion}
              type={activeTab}
            />
          </div>

          {/* Cost Summary */}
          <div className="animate-slide-up" style={{ animationDelay: '0.24s', animationFillMode: 'both' }}>
            <CostSummary
              result={result}
              rates={rates}
              onPrintQuote={() => printQuote(printMode || 'detailed')}
              onDownloadPDF={() => openPreview('detailed')}
              onOpenClientQuote={() => {
                setPrintMode('client');
                setIsClientQuoteOpen(true);
              }}
            />
          </div>
        </div>

        <footer className="mt-12 pb-6 text-center no-print">
          <div className="glow-line mb-6" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 Elshaddai Wood Packing. All Rights Reserved.
          </p>
        </footer>
      </div>

      <ClientQuoteOptions
        isOpen={isClientQuoteOpen}
        options={clientQuoteOptions}
        onChange={updateClientQuoteOption}
        onClose={() => setIsClientQuoteOpen(false)}
        onPrint={() => {
          setIsClientQuoteOpen(false);
          printQuote('client');
        }}
        onDownloadPDF={() => {
          setIsClientQuoteOpen(false);
          openPreview('client');
        }}
      />
      
      {/* Printable / Export Quote Sheets */}
      <QuoteSheet
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        active={printMode === 'detailed'}
        type={activeTab}
      />
      <ClientQuoteSheet
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        options={clientQuoteOptions}
        active={printMode === 'client'}
        type={activeTab}
      />
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        mode={previewMode}
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        options={clientQuoteOptions}
        onClose={() => {
          setIsPreviewOpen(false);
        }}
        onPrint={() => {
          printQuote(previewMode);
          setIsPreviewOpen(false);
        }}
        onDownload={() => {
          downloadPDF(previewMode);
          setIsPreviewOpen(false);
        }}
        type={activeTab}
      />
    </div>
  );
}

