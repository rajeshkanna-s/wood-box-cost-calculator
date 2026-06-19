import React, { useState, useEffect } from 'react';
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

const DEFAULT_CLIENT_QUOTE_OPTIONS = {
  showParts: false,
  showCftSummary: false,
  showCostBreakdown: false,
  showWaste: false,
  showProfit: false,
};

export default function App() {
  const {
    useWood, setUseWood,
    usePly, setUsePly,
    linkDims, setLinkDims,
    woodDims, woodRates, woodParts, woodResult,
    plyDims, plyRates, plyParts, plyResult,
    result,
    updateWoodDim, updatePlyDim,
    updateWoodRate, updatePlyRate,
    changeWoodUnit, changePlyUnit,
    loadPreset,
    loadPlyPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion
  } = useBoxCalculator();

  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' or 'preset'
  const [printData, setPrintData] = useState(null);
  const [printMode, setPrintMode] = useState('detailed');
  const [isClientQuoteOpen, setIsClientQuoteOpen] = useState(false);
  const [clientQuoteOptions, setClientQuoteOptions] = useState(DEFAULT_CLIENT_QUOTE_OPTIONS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('detailed');
  const [customClientName, setCustomClientName] = useState('');

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

  const openPreview = (mode, customData = null) => {
    if (customData) {
      setPrintData(customData);
    } else if (activeTab !== 'preset') {
      setPrintData(null);
    }
    setPreviewMode(mode);
    setIsPreviewOpen(true);
  };

  const printQuote = (mode) => {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      // 500ms allows the browser to layout and decode the 4.7MB logo image before printing
      window.setTimeout(() => {
        window.print();
        // Clear preset override data after the print dialog closes
        if (activeTab !== 'preset') {
          setPrintData(null);
        }
        setPrintMode(null);
      }, 500);
    });
  };

  const downloadPDF = async (mode) => {
    const quoteStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const activeResult = printData ? printData.result : result;
    const cleanTotal = Math.round(activeResult.finalTotal || 0);
    const filename = mode === 'client'
      ? `Elshaddai_Client_Quote_EWB-${quoteStamp}-${cleanTotal}.pdf`
      : `Elshaddai_Detailed_Quote_EWB-${quoteStamp}-${cleanTotal}.pdf`;

    // Grab the already-rendered quote sheet from the preview modal viewport
    // This ensures the PDF matches exactly what the user sees in the preview
    const viewport = document.querySelector('.preview-document-viewport');
    const liveSheet = viewport
      ? viewport.querySelector('.quote-sheet')
      : document.getElementById(mode === 'client' ? 'quote-sheet-client' : 'quote-sheet-detailed');
    if (!liveSheet) return;

    // Create off-screen wrapper that is covered by current content (z-index: -9999)
    // Position it at 0, 0 to ensure html2canvas captures it correctly without coordinate shift or crop
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
    // Apply the exact same styles as .preview-document-viewport .quote-sheet
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

    // Fix gradient text — html2canvas cannot render background-clip: text.
    // Use setProperty with 'important' to correctly override stylesheet !important rules.
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

    // Wait for the browser to lay out the clone
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
          <div className="absolute top-0 right-0">
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
            <div className="tab-navigation-bar">
              <button
                className={`tab-navigation-btn ${activeTab === 'custom' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveTab('custom');
                  setPrintData(null);
                }}
              >
                Custom Box Calculator
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'preset' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveTab('preset');
                  setPrintData(null);
                }}
              >
                Client-Wise Presets
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === 'custom' ? (
            <>
              <div className="glass-card p-5 animate-slide-up no-print" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="section-icon shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <label htmlFor="global-client-name" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                      Client / Company Name:
                    </label>
                  </div>
                  <input
                    id="global-client-name"
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="e.g. NTN, Motherson, etc."
                    className="premium-input text-center"
                    style={{ width: '320px', maxWidth: '100%' }}
                  />
                </div>
              </div>

              {/* Material Toggle Card */}
              <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 no-print animate-slide-up" style={{ animationDelay: '0.08s', animationFillMode: 'both' }}>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Include in Quote:</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useWood}
                      onChange={(e) => {
                        if (!e.target.checked && !usePly) return; // Prevent disabling both
                        setUseWood(e.target.checked);
                      }}
                      className="rounded border-slate-700 bg-[#111217] text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Pine Wood</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={usePly}
                      onChange={(e) => {
                        if (!e.target.checked && !useWood) return; // Prevent disabling both
                        setUsePly(e.target.checked);
                      }}
                      className="rounded border-slate-700 bg-[#111217] text-blue-500 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Plywood</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={linkDims}
                      onChange={(e) => setLinkDims(e.target.checked)}
                      className="rounded border-slate-700 bg-[#111217] text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Link Dimensions</span>
                  </label>
                </div>
              </div>

              {/* Responsive Layout Grid for Inputs (Dimensions & Rates) */}
              <div className="space-y-6">
                {/* Dimensions Row */}
                <div className={`grid grid-cols-1 ${useWood && usePly ? 'xl:grid-cols-2' : ''} gap-6`}>
                  {useWood && (
                    <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.12s', animationFillMode: 'both' }}>
                      <div className="border-l-4 border-amber-500 pl-3">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Dimensions</h3>
                      </div>
                      <div className="flex-1">
                        <DimensionInputs
                          dims={woodDims}
                          onChange={updateWoodDim}
                          onUnitChange={changeWoodUnit}
                          showPresetSelector={true}
                          onSelectPreset={loadPreset}
                        />
                      </div>
                    </div>
                  )}

                  {usePly && (
                    <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.14s', animationFillMode: 'both' }}>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Dimensions</h3>
                      </div>
                      <div className="flex-1">
                        <DimensionInputs
                          dims={plyDims}
                          onChange={updatePlyDim}
                          onUnitChange={changePlyUnit}
                          showPresetSelector={true}
                          onSelectPreset={loadPlyPreset}
                          isPlywood={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Rates Row */}
                <div className={`grid grid-cols-1 ${useWood && usePly ? 'xl:grid-cols-2' : ''} gap-6`}>
                  {useWood && (
                    <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                      <div className="border-l-4 border-amber-500 pl-3">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Rates & Parameters</h3>
                      </div>
                      <div className="flex-1">
                        <RateInputs rates={woodRates} onChange={updateWoodRate} />
                      </div>
                    </div>
                  )}

                  {usePly && (
                    <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.17s', animationFillMode: 'both' }}>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Rates & Parameters</h3>
                      </div>
                      <div className="flex-1">
                        <RateInputs rates={plyRates} onChange={updatePlyRate} isPlywood={true} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parts Breakdown stacked or side-by-side */}
              <div className={`grid grid-cols-1 ${useWood && usePly ? 'xl:grid-cols-2' : ''} gap-6 no-print`}>
                {useWood && (
                  <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.18s', animationFillMode: 'both' }}>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Pine Wood Parts Breakdown</h3>
                    </div>
                    <div className="flex-1">
                      <PartsTable
                        parts={woodResult.partsWithCFT}
                        result={woodResult}
                        rates={woodRates}
                        onUpdatePart={(idx, fld, val) => updatePart('wood', idx, fld, val)}
                        onAddPart={() => addCustomPart('wood')}
                        onRemovePart={(idx) => removePart('wood', idx)}
                        onToggleExclusion={(idx) => togglePartExclusion('wood', idx)}
                        compact={useWood && usePly}
                      />
                    </div>
                  </div>
                )}

                {usePly && (
                  <div className="flex flex-col h-full space-y-3 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Plywood Parts Breakdown</h3>
                    </div>
                    <div className="flex-1">
                      <PartsTable
                        parts={plyResult.partsWithCFT}
                        result={plyResult}
                        rates={plyRates}
                        onUpdatePart={(idx, fld, val) => updatePart('ply', idx, fld, val)}
                        onAddPart={() => addCustomPart('ply')}
                        onRemovePart={(idx) => removePart('ply', idx)}
                        onToggleExclusion={(idx) => togglePartExclusion('ply', idx)}
                        compact={useWood && usePly}
                        isPlywood={true}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Combined Cost Summary (Last Option to Show) */}
              <div className="animate-slide-up" style={{ animationDelay: '0.24s', animationFillMode: 'both' }}>
                <CostSummary
                  result={result}
                  rates={useWood ? woodRates : plyRates}
                  useWood={useWood}
                  usePly={usePly}
                  woodResult={woodResult}
                  plyResult={plyResult}
                  onPrintQuote={() => printQuote('detailed')}
                  onDownloadPDF={() => openPreview('detailed')}
                  onOpenClientQuote={() => {
                    setPrintMode('client');
                    setIsClientQuoteOpen(true);
                  }}
                />
              </div>
            </>
          ) : (
            <div className="animate-slide-up animate-fade-in">
              <ClientPresetsCalculator
                onPrintQuote={(presetData) => {
                  setPrintData(presetData);
                  printQuote('detailed');
                }}
                onDownloadPDF={(presetData) => {
                  openPreview('detailed', presetData);
                }}
                onOpenClientQuote={(presetData) => {
                  setPrintData(presetData);
                  setPrintMode('client');
                  setIsClientQuoteOpen(true);
                }}
              />
            </div>
          )}
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
      <QuoteSheet
        dims={printData ? printData.dims : (useWood ? woodDims : plyDims)}
        rates={printData ? printData.rates : (useWood ? woodRates : plyRates)}
        result={printData ? printData.result : result}
        clientName={printData ? printData.clientName : customClientName}
        active={printMode === 'detailed'}
        useWood={printData ? (printData.useWood !== undefined ? printData.useWood : true) : useWood}
        usePly={printData ? (printData.usePly !== undefined ? printData.usePly : false) : usePly}
        woodDims={printData ? printData.woodDims : woodDims}
        woodRates={printData ? printData.woodRates : woodRates}
        woodResult={printData ? (printData.wood || printData.result) : woodResult}
        plyDims={printData ? printData.plyDims : plyDims}
        plyRates={printData ? printData.plyRates : plyRates}
        plyResult={printData ? printData.ply : plyResult}
      />
      <ClientQuoteSheet
        dims={printData ? printData.dims : (useWood ? woodDims : plyDims)}
        rates={printData ? printData.rates : (useWood ? woodRates : plyRates)}
        result={printData ? printData.result : result}
        clientName={printData ? printData.clientName : customClientName}
        options={clientQuoteOptions}
        active={printMode === 'client'}
        useWood={printData ? (printData.useWood !== undefined ? printData.useWood : true) : useWood}
        usePly={printData ? (printData.usePly !== undefined ? printData.usePly : false) : usePly}
        woodDims={printData ? printData.woodDims : woodDims}
        woodRates={printData ? printData.woodRates : woodRates}
        woodResult={printData ? (printData.wood || printData.result) : woodResult}
        plyDims={printData ? printData.plyDims : plyDims}
        plyRates={printData ? printData.plyRates : plyRates}
        plyResult={printData ? printData.ply : plyResult}
      />
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        mode={previewMode}
        dims={printData ? printData.dims : (useWood ? woodDims : plyDims)}
        rates={printData ? printData.rates : (useWood ? woodRates : plyRates)}
        result={printData ? printData.result : result}
        clientName={printData ? printData.clientName : customClientName}
        options={clientQuoteOptions}
        onClose={() => {
          setIsPreviewOpen(false);
          setPrintData(null);
        }}
        onPrint={() => {
          printQuote(previewMode);
          setIsPreviewOpen(false);
        }}
        onDownload={() => {
          downloadPDF(previewMode);
          setIsPreviewOpen(false);
        }}
        useWood={printData ? (printData.useWood !== undefined ? printData.useWood : true) : useWood}
        usePly={printData ? (printData.usePly !== undefined ? printData.usePly : false) : usePly}
        woodDims={printData ? printData.woodDims : woodDims}
        woodRates={printData ? printData.woodRates : woodRates}
        woodResult={printData ? (printData.wood || printData.result) : woodResult}
        plyDims={printData ? printData.plyDims : plyDims}
        plyRates={printData ? printData.plyRates : plyRates}
        plyResult={printData ? printData.ply : plyResult}
      />
    </div>
  );
}
