import React from 'react';

export default function PartsTable({ parts, result, rates, onUpdatePart, onAddPart, onRemovePart, onToggleExclusion, compact = false, isPlywood = false }) {
  const formatCFT = (n) => Number(n || 0).toFixed(compact ? 3 : 4);
  const safeWastePct = rates?.wastePct !== undefined ? rates.wastePct : 10;

  // Compact spacing styles
  const thStyle = (left, right, extra = {}) => ({
    paddingLeft: left ? (compact ? '0.75rem' : '1.5rem') : (compact ? '0.25rem' : '0.5rem'),
    paddingRight: right ? (compact ? '0.75rem' : '1.5rem') : (compact ? '0.25rem' : '0.5rem'),
    paddingTop: compact ? '0.5rem' : '0.75rem',
    paddingBottom: compact ? '0.5rem' : '0.75rem',
    fontSize: compact ? '10px' : undefined,
    ...extra
  });

  const tdStyle = (left, right, extra = {}) => ({
    paddingLeft: left ? (compact ? '0.75rem' : '1.5rem') : (compact ? '0.25rem' : '0.5rem'),
    paddingRight: right ? (compact ? '0.75rem' : '1.5rem') : (compact ? '0.25rem' : '0.5rem'),
    paddingTop: compact ? '0.35rem' : '0.75rem',
    paddingBottom: compact ? '0.35rem' : '0.75rem',
    fontSize: compact ? '11px' : undefined,
    ...extra
  });

  return (
    <div className="glass-card no-print flex flex-col h-full">
      <div className="section-header" style={{ padding: compact ? '0.75rem 1rem' : undefined }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="section-icon" style={{ width: compact ? '1.75rem' : '2rem', height: compact ? '1.75rem' : '2rem', marginRight: compact ? '0.5rem' : '0.75rem' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h2 className="section-title" style={{ fontSize: compact ? '0.8rem' : undefined }}>
              {isPlywood ? 'Plywood Parts Breakdown' : 'Pine Wood Parts Breakdown'}
            </h2>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-light)', fontSize: compact ? '10px' : undefined }}>
            {parts.length} components
          </span>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <table className={`premium-table ${compact ? 'text-xs' : ''} w-full`}>
            <thead>
              <tr>
                <th style={thStyle(true, false, { width: '10%' })}>Part</th>
                <th style={thStyle(false, false, { width: '30%' })}>Description</th>
                <th style={thStyle(false, false, { width: '11%' })}>L (mm)</th>
                <th style={thStyle(false, false, { width: '11%' })}>W (mm)</th>
                <th style={thStyle(false, false, { width: '11%' })}>H (mm)</th>
                <th style={thStyle(false, false, { width: '11%', textAlign: 'center' })}>Qty</th>
                <th style={thStyle(false, true, { width: '11%', textAlign: 'right' })}>{isPlywood ? 'SFT' : (rates?.rateUnit || 'CFT')}</th>
                <th style={compact ? { width: '40px', padding: '0.5rem 0.25rem' } : { width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p, i) => (
                <tr key={i} className={`group hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${p.isExcluded ? 'opacity-40 grayscale' : ''}`}>
                  <td style={tdStyle(true, false)}>
                    {p.isCustom ? (
                      <input 
                        type="text" 
                        className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                        value={p.id} 
                        onChange={(e) => onUpdatePart(i, 'id', e.target.value)}
                        placeholder="ID"
                        disabled={p.isExcluded}
                      />
                    ) : (
                      <span className={p.isExcluded ? 'line-through' : ''}>{p.id}</span>
                    )}
                  </td>
                  <td style={tdStyle(false, false)}>
                    {p.isCustom ? (
                      <input 
                        type="text" 
                        className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                        value={p.label} 
                        onChange={(e) => onUpdatePart(i, 'label', e.target.value)}
                        placeholder="Description"
                        disabled={p.isExcluded}
                      />
                    ) : (
                      <span className={p.isExcluded ? 'line-through' : ''}>{p.label}</span>
                    )}
                  </td>
                  <td className="font-mono" style={tdStyle(false, false)}>
                    <input 
                      type="number" 
                      className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                      value={p.l === 0 ? '' : p.l} 
                      onChange={(e) => onUpdatePart(i, 'l', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td className="font-mono" style={tdStyle(false, false)}>
                    <input 
                      type="number" 
                      className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                      value={p.w === 0 ? '' : p.w} 
                      onChange={(e) => onUpdatePart(i, 'w', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td className="font-mono" style={tdStyle(false, false)}>
                    <input 
                      type="number" 
                      className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                      value={p.h === 0 ? '' : p.h} 
                      onChange={(e) => onUpdatePart(i, 'h', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td style={tdStyle(false, false, { textAlign: 'center' })}>
                    <input 
                      type="number" 
                      className={`table-input w-full text-center inline-flex items-center justify-center text-xs font-semibold`} 
                      style={{ 
                       height: compact ? '1.5rem' : '1.75rem',
                       padding: compact ? '0.125rem 0.25rem' : undefined,
                       color: 'var(--text-main)',
                      }}
                      value={p.qty === 0 ? '' : p.qty} 
                      onChange={(e) => onUpdatePart(i, 'qty', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td style={tdStyle(false, true, { color: 'var(--text-main)', textAlign: 'right' })} className="font-mono font-semibold">
                    {isPlywood ? Number(p.sft || 0).toFixed(compact ? 2 : 3) : formatCFT(p.cft)}
                  </td>
                  <td style={{ paddingRight: compact ? '0.5rem' : '1rem', width: compact ? '40px' : '60px' }}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onToggleExclusion && (
                        <button 
                          onClick={() => onToggleExclusion(i)}
                          className={`p-1 rounded transition-colors ${p.isExcluded ? 'text-green-500 hover:text-green-600 bg-green-500/10' : 'text-orange-500 hover:text-orange-600 bg-orange-500/10'}`}
                          title={p.isExcluded ? "Include Part" : "Exclude Part"}
                        >
                          {p.isExcluded ? (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      )}
                      {onRemovePart && (
                        <button 
                          onClick={() => onRemovePart(i)}
                          className="p-1 rounded text-red-500 hover:text-red-700 bg-red-500/10 transition-colors"
                          title="Remove Part"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
        <div className="p-3 border-t mt-auto" style={{ borderColor: 'var(--table-border)', padding: compact ? '0.5rem 0.75rem' : undefined }}>
          <button 
            onClick={onAddPart}
            className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--accent-wood)', background: 'var(--card-inner-bg)', fontSize: compact ? '0.75rem' : undefined, padding: compact ? '0.25rem 0.5rem' : undefined }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Part
          </button>
        </div>
      </div>

      {/* CFT Summary Footer */}
      <div style={{ borderTop: '1px solid var(--table-border)', padding: compact ? '0.75rem 1rem' : '1rem 1.5rem' }} className="mt-auto">
        <div className="space-y-2">
          {safeWastePct !== null && safeWastePct !== undefined && safeWastePct > 0 ? (
            <>
              <div className="flex justify-between items-center text-sm" style={{ fontSize: compact ? '11px' : undefined }}>
                <span style={{ color: 'var(--text-light)' }}>{isPlywood ? 'Net Area' : 'Net Volume'}</span>
                <span className="font-mono font-medium" style={{ color: 'var(--text-main)' }}>
                  {isPlywood ? `${Number(result.totalSFT || 0).toFixed(compact ? 2 : 3)} SFT` : `${formatCFT(result.totalCFT)} CFT`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm" style={{ fontSize: compact ? '11px' : undefined }}>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
                  + {safeWastePct}% Waste Factor
                </span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                  {isPlywood ? `${Number(result.vestSFT || 0).toFixed(compact ? 2 : 3)} SFT` : `${formatCFT(result.vestCFT)} CFT`}
                </span>
              </div>
              <div className="glow-line my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color: 'var(--accent-wood)', fontSize: compact ? '11px' : undefined }}>
                  {isPlywood ? 'Billable Area' : 'Billable Volume'}
                </span>
                <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-wood-light)', fontSize: compact ? '1rem' : undefined }}>
                  {isPlywood ? `${Number(result.billableSFT || 0).toFixed(compact ? 2 : 3)} SFT` : `${formatCFT(result.billable)} CFT`}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-wood)', fontSize: compact ? '11px' : undefined }}>
                {isPlywood ? 'Total Area' : 'Total Volume'}
              </span>
              <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-wood-light)', fontSize: compact ? '1rem' : undefined }}>
                {isPlywood ? `${Number(result.totalSFT || 0).toFixed(compact ? 2 : 3)} SFT` : `${formatCFT(result.totalCFT)} CFT`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
