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
      window.setTimeout(() => window.print(), 60);
    });
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

          <div className="flex items-center gap-3 mb-3 pr-24">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #e89c3f 0%, #d26a17 100%)',
                boxShadow: '0 4px 12px rgba(232,156,63,0.2)',
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Elshaddai <span className="text-gradient">Wood</span> Box Calculator
              </h1>
            </div>
          </div>
          <p className="text-sm max-w-xl leading-relaxed no-print" style={{ color: 'var(--text-light)' }}>
            Precision cost estimation for pine wood packing boxes. Auto-converts dimensions, 
            computes CFT for 8 timber parts, applies waste factor & profit margin.
          </p>
          <div className="glow-line mt-6 print:hidden" />
        </header>

        <div className="space-y-6">
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
            Elshaddai Wood Box Cost Calculator • Reverse-engineered from Excel formulas • All rates in ₹ per CFT
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
      />
      <QuoteSheet dims={dims} rates={rates} result={result} active={printMode === 'detailed'} />
      <ClientQuoteSheet
        dims={dims}
        rates={rates}
        result={result}
        options={clientQuoteOptions}
        active={printMode === 'client'}
      />
    </div>
  );
}
