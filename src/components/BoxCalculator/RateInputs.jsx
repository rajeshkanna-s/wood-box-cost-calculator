import React, { useState } from 'react';
import InputRow from '../shared/InputRow';

export default function RateInputs({ rates, onChange, isPlywood = false, disabled = false }) {
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

  const hasKey = (key) => rates[key] !== null && rates[key] !== undefined;

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
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2.5 group">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Rate ({isPlywood ? 'Plywood' : 'Wood'})
                </label>
                <select
                  value={rates.rateUnit || 'CFT'}
                  onChange={(e) => onChange('rateUnit', e.target.value)}
                  disabled={disabled}
                  className="header-unit-select disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: '6.5rem' }}
                >
                  <option value="CBM">CBM</option>
                  <option value="CCM">CCM — (CUBIC CENTIMETERS)</option>
                  <option value="CFT">CFT</option>
                  <option value="CM">CM — (CENTIMETERS)</option>
                  <option value="CU.MT">CU.MT — (CUBICMETER)</option>
                  <option value="gms">gms — (Gram)</option>
                  <option value="gty">gty — (G)</option>
                  <option value="Kgs">Kgs — (Kilograms)</option>
                  <option value="NOS" style={{ fontWeight: 'bold' }}>NOS — (NUMBERS) ★</option>
                  <option value="SFT">SFT</option>
                  <option value="SFT of 4 NOS">SFT of 4 NOS</option>
                  <option value="SQM">SQM</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase w-6 text-right" style={{ color: 'var(--text-light)', letterSpacing: '0.04em' }}>
                  ₹
                </span>
                <input
                  type="number"
                  value={rates.cftRate === null || rates.cftRate === undefined ? '' : rates.cftRate}
                  onChange={(e) => onChange('cftRate', e.target.value === '' ? null : e.target.value)}
                  min="0"
                  disabled={disabled}
                  className="premium-input disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: '6rem' }}
                />
              </div>
            </div>
            
            {hasKey('labour') && (
              <>
                <div style={{ borderTop: '1px solid var(--table-border)' }} />
                <InputRow label="Labour" value={rates.labour} onChange={(v) => onChange('labour', v)} unit="₹" min="0" disabled={disabled} onDelete={() => onChange('labour', null)} />
              </>
            )}

            {hasKey('nail') && (
              <>
                <div style={{ borderTop: '1px solid var(--table-border)' }} />
                <InputRow label="Nail" value={rates.nail} onChange={(v) => onChange('nail', v)} unit="₹" min="0" disabled={disabled} onDelete={() => onChange('nail', null)} />
              </>
            )}

            {hasKey('transport') && (
              <>
                <div style={{ borderTop: '1px solid var(--table-border)' }} />
                <InputRow label="Transport" value={rates.transport} onChange={(v) => onChange('transport', v)} unit="₹" min="0" disabled={disabled} onDelete={() => onChange('transport', null)} />
              </>
            )}

            {hasKey('packing') && (
              <>
                <div style={{ borderTop: '1px solid var(--table-border)' }} />
                <InputRow label="Packing Cover" value={rates.packing} onChange={(v) => onChange('packing', v)} unit="₹" min="0" disabled={disabled} onDelete={() => onChange('packing', null)} />
              </>
            )}

            {hasKey('clamp') && (
              <>
                <div style={{ borderTop: '1px solid var(--table-border)' }} />
                <InputRow label="Clamp" value={rates.clamp} onChange={(v) => onChange('clamp', v)} unit="₹" min="0" disabled={disabled} onDelete={() => onChange('clamp', null)} />
              </>
            )}

            {/* Custom Parameters list */}
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
                      className="premium-input disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ width: '6rem' }}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Add Custom Parameter button */}
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
          </div>

          {/* Percentages Section */}
          {(hasKey('wastePct') || hasKey('profitPct')) && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--table-border)' }}>
              <div className="glass-card-inner p-4 space-y-3">
                {hasKey('wastePct') && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onChange('wastePct', null)}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1 rounded bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Waste Factor"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
                      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Waste Factor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                      <input
                        type="number"
                        value={rates.wastePct === null || rates.wastePct === undefined ? '' : rates.wastePct}
                        onChange={(e) => onChange('wastePct', e.target.value === '' ? null : e.target.value)}
                        min="0"
                        max="100"
                        disabled={disabled}
                        className="premium-input disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ width: '6rem' }}
                      />
                    </div>
                  </div>
                )}
                {hasKey('wastePct') && hasKey('profitPct') && <div style={{ borderTop: '1px solid var(--table-border)' }} />}
                {hasKey('profitPct') && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onChange('profitPct', null)}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1 rounded bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Profit Margin"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
                      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Profit Margin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                      <input
                        type="number"
                        value={rates.profitPct === null || rates.profitPct === undefined ? '' : rates.profitPct}
                        onChange={(e) => onChange('profitPct', e.target.value === '' ? null : e.target.value)}
                        min="0"
                        max="100"
                        disabled={disabled}
                        className="premium-input disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ width: '6rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
