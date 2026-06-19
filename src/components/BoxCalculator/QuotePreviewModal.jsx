import React from 'react';
import QuoteSheet from './QuoteSheet';
import ClientQuoteSheet from './ClientQuoteSheet';

export default function QuotePreviewModal({
  isOpen,
  mode,
  dims,
  rates,
  result,
  options,
  clientName,
  onClose,
  onPrint,
  onDownload,
  useWood = true,
  usePly = false,
  woodDims,
  woodRates,
  woodResult,
  plyDims,
  plyRates,
  plyResult,
}) {
  if (!isOpen) return null;

  const [scale, setScale] = React.useState(1);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        const availableWidth = width - 48; // subtract content padding
        setScale(Math.min(1, availableWidth / 794));
      }
    };

    handleResize();
    const timer = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isOpen]);

  return (
    <div className="preview-modal-overlay no-print" onClick={onClose}>
      <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="preview-modal-header">
          <div className="preview-modal-title-group">
            <h2 className="preview-modal-title">Quotation Preview</h2>
            <p className="preview-modal-subtitle">Review the document layout below before downloading</p>
          </div>
          <div className="preview-modal-actions">
            <button className="btn-primary" onClick={onDownload}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ color: 'var(--text-main)', borderColor: 'var(--card-border)' }}>
              <span>Close</span>
            </button>
          </div>
        </header>

        <div className="preview-modal-content" ref={containerRef}>
          <div 
            className="preview-document-viewport"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: '794px',
              height: `${1120 * scale}px`,
              transition: 'transform 0.15s ease-out',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            {mode === 'detailed' ? (
              <QuoteSheet
                dims={dims}
                rates={rates}
                result={result}
                clientName={clientName}
                active={true}
                useWood={useWood}
                usePly={usePly}
                woodDims={woodDims}
                woodRates={woodRates}
                woodResult={woodResult}
                plyDims={plyDims}
                plyRates={plyRates}
                plyResult={plyResult}
              />
            ) : (
              <ClientQuoteSheet
                dims={dims}
                rates={rates}
                result={result}
                clientName={clientName}
                options={options}
                active={true}
                useWood={useWood}
                usePly={usePly}
                woodDims={woodDims}
                woodRates={woodRates}
                woodResult={woodResult}
                plyDims={plyDims}
                plyRates={plyRates}
                plyResult={plyResult}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
