export default function PartsTable({ parts, result, rates, dims, onUpdatePart, onAddPart, onRemovePart, onToggleExclusion, compact = false, type = 'pine-wood-box' }) {
  const formatCFT = (n) => Number(n || 0).toFixed(compact ? 3 : 4);
  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';
  const isPlywoodOnly = false; // We don't have a plywood-only tab (all tabs are wood-only or combined)

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

  const getTitle = () => {
    switch (type) {
      case 'pine-wood-box':
        return 'Pine Wood Box Parts';
      case 'ply-wood-pallet':
        return 'Plywood Pallet Parts';
      case 'pine-wood-pallet':
        return 'Pine Wood Pallet Parts';
      case 'pine-plywood-box':
        return 'Pine Plywood Box Parts';
      default:
        return 'Parts Breakdown';
    }
  };

  const getUnitHeader = () => {
    if (isCombined) return 'CFT / SFT';
    return rates?.rateUnit || 'CFT';
  };

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
              {getTitle()}
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
                <th style={thStyle(false, true, { width: '11%', textAlign: 'right' })}>{getUnitHeader()}</th>
                <th style={compact ? { width: '40px', padding: '0.5rem 0.25rem' } : { width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {(result?.partsWithCFT || parts).map((p, i) => (
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
                      value={p.l === 0 ? '' : Number(Number(p.l || 0).toFixed(2))} 
                      onChange={(e) => onUpdatePart(i, 'l', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td className="font-mono" style={tdStyle(false, false)}>
                    <input 
                      type="number" 
                      className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                      value={p.w === 0 ? '' : Number(Number(p.w || 0).toFixed(2))} 
                      onChange={(e) => onUpdatePart(i, 'w', e.target.value)}
                      disabled={p.isExcluded}
                    />
                  </td>
                  <td className="font-mono" style={tdStyle(false, false)}>
                    <input 
                      type="number" 
                      className={`table-input w-full ${compact ? 'text-xs py-0.5 px-1' : ''}`} 
                      value={p.h === 0 ? '' : Number(Number(p.h || 0).toFixed(2))} 
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
                    {p.isCustom || (dims?.unit === 'cft' || dims?.unit === 'sft') ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.0001"
                          className="table-input text-right font-mono"
                          style={{ 
                            width: '90px', 
                            height: compact ? '1.5rem' : '1.75rem',
                            padding: '0.125rem 0.25rem',
                            color: 'var(--text-main)'
                          }}
                          value={p.isPly ? (p.sft || 0) : (p.cft || 0)}
                          onChange={(e) => onUpdatePart(i, p.isPly ? 'sft' : 'cft', e.target.value)}
                          disabled={p.isExcluded}
                        />
                        <span className="text-[10px] ml-1 text-xs" style={{ color: 'var(--text-light)' }}>{p.isPly ? 'SFT' : 'CFT'}</span>
                      </div>
                    ) : (
                      p.isPly ? `${Number(p.sft || 0).toFixed(compact ? 1 : 2)} SFT` : `${formatCFT(p.cft)} CFT`
                    )}
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
        <div className="p-3 border-t mt-auto flex gap-2" style={{ borderColor: 'var(--table-border)', padding: compact ? '0.5rem 0.75rem' : undefined }}>
          {isCombined ? (
            <>
              <button 
                onClick={() => onAddPart(false)}
                className="flex items-center gap-1 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--accent-wood)', background: 'var(--card-inner-bg)', fontSize: compact ? '0.75rem' : undefined }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Wood Part
              </button>
              <button 
                onClick={() => onAddPart(true)}
                className="flex items-center gap-1 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--accent-blue)', background: 'var(--card-inner-bg)', fontSize: compact ? '0.75rem' : undefined }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Ply Panel
              </button>
            </>
          ) : (
            <button 
              onClick={() => onAddPart(false)}
              className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--accent-wood)', background: 'var(--card-inner-bg)', fontSize: compact ? '0.75rem' : undefined, padding: compact ? '0.25rem 0.5rem' : undefined }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Part
            </button>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div style={{ borderTop: '1px solid var(--table-border)', padding: compact ? '0.75rem 1rem' : '1rem 1.5rem' }} className="mt-auto">
        <div className="space-y-2">
          {isCombined ? (
            // Dual summary for wood and plywood
            <div className="grid grid-cols-2 gap-4">
              {/* Wood side */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Wood Volume</span>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-light)' }}>Net Volume:</span>
                  <span className="font-mono">{formatCFT(result.totalCFT)} CFT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Waste ({rates.wastePctWood ?? (type === 'ply-wood-pallet' ? 5 : 10)}%):</span>
                  <span className="font-mono">+{formatCFT(result.vestCFT)} CFT</span>
                </div>
                <div className="flex justify-between font-bold text-amber-400 pt-1 border-t border-slate-700/20">
                  <span>Billable:</span>
                  <span className="font-mono">{formatCFT(result.billable)} CFT</span>
                </div>
              </div>

              {/* Plywood side */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">Plywood Area</span>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-light)' }}>Net Area:</span>
                  <span className="font-mono">{Number(result.totalSFT || 0).toFixed(2)} SFT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Waste ({rates.wastePctPly ?? (type === 'ply-wood-pallet' ? 7 : 10)}%):</span>
                  <span className="font-mono">+{Number(result.vestSFT || 0).toFixed(2)} SFT</span>
                </div>
                <div className="flex justify-between font-bold text-blue-400 pt-1 border-t border-slate-700/20">
                  <span>Billable:</span>
                  <span className="font-mono">{Number(result.billableSFT || 0).toFixed(2)} SFT</span>
                </div>
              </div>
            </div>
          ) : (
            // Standard single material summary
            <>
              <div className="flex justify-between items-center text-sm" style={{ fontSize: compact ? '11px' : undefined }}>
                <span style={{ color: 'var(--text-light)' }}>Net Volume</span>
                <span className="font-mono font-medium" style={{ color: 'var(--text-main)' }}>
                  {formatCFT(result.totalCFT)} CFT
                </span>
              </div>
              <div className="flex justify-between items-center text-sm" style={{ fontSize: compact ? '11px' : undefined }}>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
                  + {rates.wastePct ?? 10}% Waste Factor
                </span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatCFT(result.vestCFT)} CFT
                </span>
              </div>
              <div className="glow-line my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color: 'var(--accent-wood)', fontSize: compact ? '11px' : undefined }}>
                  Billable Volume
                </span>
                <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-wood-light)', fontSize: compact ? '1rem' : undefined }}>
                  {formatCFT(result.billable)} CFT
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
