import React from 'react';

export default function PartsTable({ parts, result, rates, onUpdatePart, onAddPart, onRemovePart, onToggleExclusion }) {
  const formatCFT = (n) => n.toFixed(4);
  const safeWastePct = rates?.wastePct !== undefined ? rates.wastePct : 10;

  return (
    <div className="glass-card no-print">
      <div className="section-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="section-icon">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h2 className="section-title">Parts Breakdown</h2>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-light)' }}>
            {parts.length} components
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>Part</th>
              <th>Description</th>
              <th>L (mm)</th>
              <th>W (mm)</th>
              <th>H (mm)</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>CFT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p, i) => (
              <tr key={i} className={`group hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${p.isExcluded ? 'opacity-40 grayscale' : ''}`}>
                <td style={{ paddingLeft: '1.5rem' }}>
                  {p.isCustom ? (
                    <input 
                      type="text" 
                      className="table-input w-16" 
                      value={p.id} 
                      onChange={(e) => onUpdatePart(i, 'id', e.target.value)}
                      placeholder="ID"
                      disabled={p.isExcluded}
                    />
                  ) : (
                    <span className={p.isExcluded ? 'line-through' : ''}>{p.id}</span>
                  )}
                </td>
                <td>
                  {p.isCustom ? (
                    <input 
                      type="text" 
                      className="table-input w-32" 
                      value={p.label} 
                      onChange={(e) => onUpdatePart(i, 'label', e.target.value)}
                      placeholder="Description"
                      disabled={p.isExcluded}
                    />
                  ) : (
                    <span className={p.isExcluded ? 'line-through' : ''}>{p.label}</span>
                  )}
                </td>
                <td className="font-mono">
                  <input 
                    type="number" 
                    className="table-input w-20" 
                    value={p.l === 0 ? '' : p.l} 
                    onChange={(e) => onUpdatePart(i, 'l', e.target.value)}
                    disabled={p.isExcluded}
                  />
                </td>
                <td className="font-mono">
                  <input 
                    type="number" 
                    className="table-input w-20" 
                    value={p.w === 0 ? '' : p.w} 
                    onChange={(e) => onUpdatePart(i, 'w', e.target.value)}
                    disabled={p.isExcluded}
                  />
                </td>
                <td className="font-mono">
                  <input 
                    type="number" 
                    className="table-input w-20" 
                    value={p.h === 0 ? '' : p.h} 
                    onChange={(e) => onUpdatePart(i, 'h', e.target.value)}
                    disabled={p.isExcluded}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="number" 
                    className="table-input w-16 text-center inline-flex items-center justify-center text-xs font-semibold" 
                    style={{ 
                      height: '1.75rem', borderRadius: '0.5rem',
                      background: 'var(--card-inner-bg)', color: 'var(--text-main)',
                      border: '1px solid transparent'
                    }}
                    value={p.qty === 0 ? '' : p.qty} 
                    onChange={(e) => onUpdatePart(i, 'qty', e.target.value)}
                    disabled={p.isExcluded}
                  />
                </td>
                <td style={{ paddingRight: '1.5rem', color: 'var(--text-main)', textAlign: 'right' }} className="font-mono font-semibold">
                  {formatCFT(p.cft)}
                </td>
                <td style={{ paddingRight: '1rem', width: '60px' }}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onToggleExclusion && (
                      <button 
                        onClick={() => onToggleExclusion(i)}
                        className={`p-1 rounded transition-colors ${p.isExcluded ? 'text-green-500 hover:text-green-600 bg-green-500/10' : 'text-orange-500 hover:text-orange-600 bg-orange-500/10'}`}
                        title={p.isExcluded ? "Include Part" : "Exclude Part"}
                      >
                        {p.isExcluded ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    )}
                    {p.isCustom && (
                      <button 
                        onClick={() => onRemovePart(i)}
                        className="p-1 rounded text-red-500 hover:text-red-700 bg-red-500/10 transition-colors"
                        title="Remove Part"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t" style={{ borderColor: 'var(--table-border)' }}>
          <button 
            onClick={onAddPart}
            className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--accent-wood)', background: 'var(--card-inner-bg)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Part
          </button>
        </div>
      </div>

      {/* CFT Summary Footer */}
      <div style={{ borderTop: '1px solid var(--table-border)', padding: '1rem 1.5rem' }}>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--text-light)' }}>Net CFT</span>
            <span className="font-mono font-medium" style={{ color: 'var(--text-main)' }}>{formatCFT(result.totalCFT)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
              <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
              + {safeWastePct}% Waste Factor
            </span>
            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{formatCFT(result.vestCFT)}</span>
          </div>
          <div className="glow-line my-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-wood)' }}>Billable CFT</span>
            <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-wood-light)' }}>{formatCFT(result.billable)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
