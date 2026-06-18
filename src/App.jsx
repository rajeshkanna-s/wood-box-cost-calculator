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

const DEFAULT_CLIENT_QUOTE_OPTIONS = {
  showParts: false,
  showCftSummary: false,
  showCostBreakdown: false,
  showWaste: false,
  showProfit: false,
};

export default function App() {
  const {
    dims,
    rates,
    result,
    updateDim,
    updateRate,
    loadPreset,
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

  const printQuote = (mode) => {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      // 500ms allows the browser to layout and decode the 4.7MB logo image before printing
      window.setTimeout(() => {
        window.print();
        // Clear preset override data after the print dialog closes
        setPrintData(null);
      }, 500);
    });
  };

  const handleDownloadPresetPDF = async (presetData) => {
    setPrintData(presetData);
    // Wait for React state update to settle
    await new Promise((resolve) => setTimeout(resolve, 150));
    await downloadPDF('client');
    setPrintData(null);
  };

  const downloadPDF = async (mode) => {
    const elementId = mode === 'client' ? 'quote-sheet-client' : 'quote-sheet-detailed';
    const element = document.getElementById(elementId);
    if (!element) return;

    const quoteStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTotal = Math.round(result.finalTotal || 0);
    const filename = mode === 'client'
      ? `Elshaddai_Client_Quote_EWB-${quoteStamp}-${cleanTotal}.pdf`
      : `Elshaddai_Detailed_Quote_EWB-${quoteStamp}-${cleanTotal}.pdf`;

    // Create a hidden wrapper that is absolute positioned but occupies 0px height, so html2canvas renders it fully without off-screen clipping
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.style.height = '0';
    wrapper.style.overflow = 'hidden';
    wrapper.style.zIndex = '-9999';
    wrapper.style.pointerEvents = 'none';

    const container = document.createElement('div');
    container.className = 'pdf-export-container';
    container.style.width = '794px';
    container.style.background = '#ffffff';
    container.style.color = '#111827';
    container.style.boxSizing = 'border-box';
    
    const clone = element.cloneNode(true);
    clone.classList.add('is-active');
    clone.style.display = 'block';
    container.appendChild(clone);
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    const tempStyle = document.createElement('style');
    tempStyle.id = 'html2pdf-temp-styles';
    
    let cssText = '';
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) continue;
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText === 'print') {
            for (let k = 0; k < rule.cssRules.length; k++) {
              const subRule = rule.cssRules[k];
              if (subRule.type === CSSRule.PAGE_RULE) continue;
              
              let ruleText = subRule.cssText;
              const parts = ruleText.split('{');
              if (parts.length >= 2) {
                const selectors = parts[0].split(',');
                const prepended = selectors.map(sel => {
                  const s = sel.trim();
                  if (s.startsWith('html') || s.startsWith('body') || s.startsWith('#root') || s.startsWith('.app-root')) {
                    return '.pdf-export-container';
                  }
                  return `.pdf-export-container ${s}`;
                });
                parts[0] = prepended.join(', ');
                ruleText = parts.join('{');
              }
              cssText += ruleText + '\n';
            }
          }
        }
      } catch (e) {
        console.warn("Could not read stylesheet rule for PDF generation:", e);
      }
    }
    
    cssText += `
      .pdf-export-container {
        font-family: 'Inter', Arial, sans-serif !important;
      }
      .pdf-export-container .quote-sheet {
        display: flex !important;
        flex-direction: column !important;
        width: 794px !important;
        height: 1120px !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .pdf-export-container .no-print {
        display: none !important;
      }
    `;
    
    tempStyle.innerHTML = cssText;
    document.head.appendChild(tempStyle);

    // Wait a brief period to let browser settle styles and DOM structure
    await new Promise((resolve) => setTimeout(resolve, 150));

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
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdfModule().from(container).set(opt).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      document.body.removeChild(wrapper);
      document.head.removeChild(tempStyle);
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
              alt="El Shaddai Wood Packing Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="hidden sm:block h-12 w-px bg-amber-700/30 dark:bg-slate-700" />
            <div className="flex flex-col items-start justify-center">
              <span className="brand-ewp-text text-4xl sm:text-5xl mb-1">EWP</span>
              <h1 className="brand-company-text text-sm sm:text-base tracking-widest uppercase">
                EL SHADDAI WOOD PACKING
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
              <div className="animate-slide-up no-print" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
                <PresetSelector onSelect={loadPreset} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <DimensionInputs dims={dims} onChange={updateDim} />
                </div>
                <div className="animate-slide-up no-print" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                  <RateInputs rates={rates} onChange={updateRate} />
                </div>
              </div>

              <div className="animate-slide-up no-print" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <PartsTable
                  parts={result.partsWithCFT}
                  result={result}
                  rates={rates}
                  onUpdatePart={updatePart}
                  onAddPart={addCustomPart}
                  onRemovePart={removePart}
                  onToggleExclusion={togglePartExclusion}
                />
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
                <CostSummary
                  result={result}
                  onPrintQuote={() => printQuote('detailed')}
                  onDownloadPDF={() => downloadPDF('detailed')}
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
                onPrintPreset={(presetData) => {
                  setPrintData(presetData);
                  printQuote('client');
                }}
                onDownloadPresetPDF={handleDownloadPresetPDF}
              />
            </div>
          )}
        </div>

        <footer className="mt-12 pb-6 text-center no-print">
          <div className="glow-line mb-6" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 El Shaddai Wood Packing. All Rights Reserved.
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
          downloadPDF('client');
        }}
      />
      <QuoteSheet
        dims={printData ? printData.dims : dims}
        rates={printData ? printData.rates : rates}
        result={printData ? printData.result : result}
        active={printMode === 'detailed'}
      />
      <ClientQuoteSheet
        dims={printData ? printData.dims : dims}
        rates={printData ? printData.rates : rates}
        result={printData ? printData.result : result}
        options={clientQuoteOptions}
        active={printMode === 'client'}
      />
    </div>
  );
}
