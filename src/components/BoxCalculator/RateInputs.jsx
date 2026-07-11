import React, { useState } from 'react';
import InputRow from '../shared/InputRow';

export default function RateInputs({ rates, onChange, type = 'pine-wood-box', disabled = false }) {
  const [collapsed, setCollapsed] = useState(false);

  const addCustomRate = () => {
    const currentCustom = rates.customRates || [];
    const newCustom = [
      ...currentCustom,
      {
        id: 'cr_' + Date.now() + Math.random().toString(36).substr(2, 5),
        label: 'Custom Parameter',
        value: 0,
        type: 'currency'
      }
    ];
    onChange('customRates', newCustom);
  };

  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';

  return (
    <div className="glass-card flex flex-col">
      <div 
        className="section-header cursor-pointer select-none" 
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center">
          <div className="section-icon">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="section-title">Rates & Parameters</h2>
        </div>
        <svg 
          className="w-5 h-5 transition-transform duration-200"
          style={{ color: 'var(--text-light)', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {!collapsed && (
        <div className="p-5 flex-1 flex flex-col">
          {isCombined ? (
            // Combined Wood + Plywood layout
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Column 1: Wood Parameters */}
                <div className="space-y-2 border-r border-slate-700/30 pr-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">Wood (CFT) Rates</h4>
                  <InputRow label="Wood Rate" value={rates.cftRate} onChange={(v) => onChange('cftRate', v)} unit="₹" min="0" disabled={disabled} />
                  <InputRow label="Labour" value={rates.woodLabour} onChange={(v) => onChange('woodLabour', v)} unit="₹" min="0" disabled={disabled} />
                  <InputRow label="Nail" value={rates.woodNail} onChange={(v) => onChange('woodNail', v)} unit="₹" min="0" disabled={disabled} />
                  <InputRow label="Plaining" value={rates.woodPlaining} onChange={(v) => onChange('woodPlaining', v)} unit="₹" min="0" disabled={disabled} />
                  {type === 'ply-wood-pallet' && (
                    <>
                      <InputRow label="EB" value={rates.woodEB} onChange={(v) => onChange('woodEB', v)} unit="₹" min="0" disabled={disabled} />
                      <InputRow label="Loading" value={rates.woodLoading} onChange={(v) => onChange('woodLoading', v)} unit="₹" min="0" disabled={disabled} />
                    </>
                  )}
                  {type === 'pine-plywood-box' && (
                    <>
                      <InputRow label="HT" value={rates.woodHT} onChange={(v) => onChange('woodHT', v)} unit="₹" min="0" disabled={disabled} />
                      <InputRow label="Loading" value={rates.woodLoading} onChange={(v) => onChange('woodLoading', v)} unit="₹" min="0" disabled={disabled} />
                    </>
                  )}
                </div>

                {/* Column 2: Plywood Parameters */}
                <div className="space-y-2 pl-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Plywood (SFT) Rates</h4>
                  <InputRow label="Ply Rate" value={rates.sftRate} onChange={(v) => onChange('sftRate', v)} unit="₹" min="0" disabled={disabled} />
                  <InputRow label="Labour" value={rates.plyLabour} onChange={(v) => onChange('plyLabour', v)} unit="₹" min="0" disabled={disabled} />
                  {type === 'ply-wood-pallet' && (
                    <>
                      <InputRow label="Nail" value={rates.plyNail} onChange={(v) => onChange('plyNail', v)} unit="₹" min="0" disabled={disabled} />
                      <InputRow label="Plaining" value={rates.plyPlaining} onChange={(v) => onChange('plyPlaining', v)} unit="₹" min="0" disabled={disabled} />
                      <InputRow label="EB" value={rates.plyEB} onChange={(v) => onChange('plyEB', v)} unit="₹" min="0" disabled={disabled} />
                      <InputRow label="Loading" value={rates.plyLoading} onChange={(v) => onChange('plyLoading', v)} unit="₹" min="0" disabled={disabled} />
                    </>
                  )}
                </div>
              </div>

              {/* Combined waste / profit settings */}
              <div className="pt-4 border-t border-slate-700/30">
                <div className="glass-card-inner p-4 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Wood Waste %</label>
                    <input
                      type="number"
                      value={rates.wastePctWood ?? ''}
                      onChange={(e) => onChange('wastePctWood', e.target.value === '' ? 10 : Number(e.target.value))}
                      min="0" max="100" disabled={disabled}
                      className="premium-input w-full text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ply Waste %</label>
                    <input
                      type="number"
                      value={rates.wastePctPly ?? ''}
                      onChange={(e) => onChange('wastePctPly', e.target.value === '' ? 10 : Number(e.target.value))}
                      min="0" max="100" disabled={disabled}
                      className="premium-input w-full text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Profit Margin %</label>
                    <input
                      type="number"
                      value={rates.profitPct ?? ''}
                      onChange={(e) => onChange('profitPct', e.target.value === '' ? 20 : Number(e.target.value))}
                      min="0" max="100" disabled={disabled}
                      className="premium-input w-full text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Single-material layout (Wood only)
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2.5 group">
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Rate (Wood)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--text-light)', letterSpacing: '0.04em' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={rates.cftRate === null || rates.cftRate === undefined ? '' : rates.cftRate}
                    onChange={(e) => onChange('cftRate', e.target.value === '' ? null : e.target.value)}
                    min="0"
                    disabled={disabled}
                    className="premium-input"
                    style={{ width: '6rem' }}
                  />
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Labour" value={rates.labour} onChange={(v) => onChange('labour', v)} unit="₹" min="0" disabled={disabled} />

              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Nail" value={rates.nail} onChange={(v) => onChange('nail', v)} unit="₹" min="0" disabled={disabled} />

              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Transport" value={rates.transport} onChange={(v) => onChange('transport', v)} unit="₹" min="0" disabled={disabled} />

              {type === 'pine-wood-box' && (
                <>
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <InputRow label="Packing Cover" value={rates.packing} onChange={(v) => onChange('packing', v)} unit="₹" min="0" disabled={disabled} />
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <InputRow label="Clamp" value={rates.clamp} onChange={(v) => onChange('clamp', v)} unit="₹" min="0" disabled={disabled} />
                </>
              )}

              {type === 'pine-wood-pallet' && (
                <>
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <InputRow label="Plaining" value={rates.plaining} onChange={(v) => onChange('plaining', v)} unit="₹" min="0" disabled={disabled} />
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <InputRow label="EB" value={rates.eb} onChange={(v) => onChange('eb', v)} unit="₹" min="0" disabled={disabled} />
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <InputRow label="HT" value={rates.ht} onChange={(v) => onChange('ht', v)} unit="₹" min="0" disabled={disabled} />
                </>
              )}

              {/* Custom parameters list */}
              {(rates.customRates || []).map((cr, idx) => (
                <React.Fragment key={cr.id}>
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <div className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <button
                        onClick={() => {
                          const nextCustom = rates.customRates.filter((_, i) => i !== idx);
                          onChange('customRates', nextCustom);
                        }}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1 rounded bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Delete ${cr.label}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={cr.label}
                        onChange={(e) => {
                          const nextCustom = [...rates.customRates];
                          nextCustom[idx] = { ...nextCustom[idx], label: e.target.value };
                          onChange('customRates', nextCustom);
                        }}
                        disabled={disabled}
                        className="table-input w-full text-sm py-0.5 px-1.5"
                        placeholder="Parameter Name"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={cr.type || 'currency'}
                        onChange={(e) => {
                          const nextCustom = [...rates.customRates];
                          nextCustom[idx] = { ...nextCustom[idx], type: e.target.value };
                          onChange('customRates', nextCustom);
                        }}
                        disabled={disabled}
                        className="header-unit-select text-xs font-semibold"
                        style={{ width: '3.5rem', padding: '0.125rem 0.25rem', height: '1.75rem' }}
                      >
                        <option value="currency">₹</option>
                        <option value="percent">%</option>
                      </select>
                      <input
                        type="number"
                        value={cr.value === 0 ? '' : cr.value}
                        onChange={(e) => {
                          const nextCustom = [...rates.customRates];
                          nextCustom[idx] = { ...nextCustom[idx], value: e.target.value === '' ? 0 : (Number(e.target.value) || 0) };
                          onChange('customRates', nextCustom);
                        }}
                        min="0"
                        disabled={disabled}
                        className="premium-input"
                        style={{ width: '6rem' }}
                      />
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <button
                type="button"
                onClick={addCustomRate}
                disabled={disabled}
                className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
                style={{
                  borderColor: 'var(--accent-wood-light)',
                  color: 'var(--accent-wood-light)',
                  background: 'transparent',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Parameter
              </button>

              {/* Percentages */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--table-border)' }}>
                <div className="glass-card-inner p-4 space-y-3">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 w-full">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
                      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Waste Factor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                      <input
                        type="number"
                        value={rates.wastePct === null || rates.wastePct === undefined ? '' : rates.wastePct}
                        onChange={(e) => onChange('wastePct', e.target.value === '' ? 10 : Number(e.target.value))}
                        min="0" max="100" disabled={disabled}
                        className="premium-input"
                        style={{ width: '6rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 w-full">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
                      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Profit Margin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                      <input
                        type="number"
                        value={rates.profitPct === null || rates.profitPct === undefined ? '' : rates.profitPct}
                        onChange={(e) => onChange('profitPct', e.target.value === '' ? 20 : Number(e.target.value))}
                        min="0" max="100" disabled={disabled}
                        className="premium-input"
                        style={{ width: '6rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
