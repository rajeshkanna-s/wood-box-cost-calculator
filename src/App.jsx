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
import { CLIENT_PRESETS } from './engine/clientPresets';

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
    resetParts
  } = useBoxCalculator();

  const [isDark, setIsDark] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [isClientQuoteOpen, setIsClientQuoteOpen] = useState(false);
  const [clientQuoteOptions, setClientQuoteOptions] = useState(DEFAULT_CLIENT_QUOTE_OPTIONS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('detailed');
  const [selectedCompanyId, setSelectedCompanyId] = useState(CLIENT_PRESETS[0]?.id || 'other');
  const [customClientName, setCustomClientName] = useState('');

  const finalClientName = selectedCompanyId === 'other'
    ? customClientName
    : (CLIENT_PRESETS.find(c => c.id === selectedCompanyId)?.companyName || '');

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
                <select
                  id="company-select"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="premium-select w-full"
                  style={{ 
                    maxWidth: '650px', 
                    background: 'var(--card-inner-bg)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--card-border)', 
                    borderRadius: '8px', 
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'left',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-4xl animate-fade-in border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center gap-3 shrink-0">
                    <label htmlFor="global-client-name" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                      Enter Custom Client Name:
                    </label>
                  </div>
                  <input
                    id="global-client-name"
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="e.g. NTN, Motherson, etc."
                    className="premium-input w-full"
                    style={{ 
                      maxWidth: '650px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      outline: 'none',
                      textAlign: 'left'
                    }}
                  />
                </div>
              )}
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

