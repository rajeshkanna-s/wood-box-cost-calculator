import React, { useState } from 'react';

const standardRatesMap = {
  'pine-wood-box': [
    { key: 'cftRate', label: 'Wood Rate', unit: '₹' },
    { key: 'labour', label: 'Labour', unit: '₹' },
    { key: 'nail', label: 'Nail', unit: '₹' },
    { key: 'transport', label: 'Transport', unit: '₹' },
    { key: 'packing', label: 'Packing Cover', unit: '₹' },
    { key: 'clamp', label: 'Clamp', unit: '₹' }
  ],
  'ply-wood-pallet': [
    { key: 'cftRate', label: 'Wood Rate', unit: '₹', category: 'wood' },
    { key: 'woodLabour', label: 'Labour', unit: '₹', category: 'wood' },
    { key: 'woodNail', label: 'Nail', unit: '₹', category: 'wood' },
    { key: 'woodPlaining', label: 'Plaining', unit: '₹', category: 'wood' },
    { key: 'woodEB', label: 'EB', unit: '₹', category: 'wood' },
    { key: 'woodLoading', label: 'Loading', unit: '₹', category: 'wood' },
    { key: 'sftRate', label: 'Ply Rate', unit: '₹', category: 'ply' },
    { key: 'plyLabour', label: 'Labour', unit: '₹', category: 'ply' },
    { key: 'plyNail', label: 'Nail', unit: '₹', category: 'ply' },
    { key: 'plyPlaining', label: 'Plaining', unit: '₹', category: 'ply' },
    { key: 'plyEB', label: 'EB', unit: '₹', category: 'ply' },
    { key: 'plyLoading', label: 'Loading', unit: '₹', category: 'ply' }
  ],
  'pine-wood-pallet': [
    { key: 'cftRate', label: 'Wood Rate', unit: '₹' },
    { key: 'labour', label: 'Labour', unit: '₹' },
    { key: 'nail', label: 'Nail', unit: '₹' },
    { key: 'transport', label: 'Transport', unit: '₹' },
    { key: 'plaining', label: 'Plaining', unit: '₹' },
    { key: 'eb', label: 'EB', unit: '₹' },
    { key: 'ht', label: 'HT', unit: '₹' }
  ],
  'pine-plywood-box': [
    { key: 'cftRate', label: 'Wood Rate', unit: '₹', category: 'wood' },
    { key: 'woodLabour', label: 'Labour', unit: '₹', category: 'wood' },
    { key: 'woodNail', label: 'Nail', unit: '₹', category: 'wood' },
    { key: 'woodPlaining', label: 'Plaining', unit: '₹', category: 'wood' },
    { key: 'woodHT', label: 'HT', unit: '₹', category: 'wood' },
    { key: 'woodLoading', label: 'Loading', unit: '₹', category: 'wood' },
    { key: 'sftRate', label: 'Ply Rate', unit: '₹', category: 'ply' },
    { key: 'plyLabour', label: 'Labour', unit: '₹', category: 'ply' }
  ]
};

export default function RateInputs({ rates, onChange, type = 'pine-wood-box', disabled = false }) {
  const [collapsed, setCollapsed] = useState(false);

  const addCustomRate = () => {
    const currentCustom = rates.customRates || [];
    const newCustom = [
      ...currentCustom,
      {
        id: 'cr_' + Date.now() + Math.random().toString(36).substr(2, 5),
        label: '',
        value: 0,
        type: 'currency'
      }
    ];
    onChange('customRates', newCustom);
  };

  const isCombined = type === 'ply-wood-pallet' || type === 'pine-plywood-box';

  const renderStandardRow = (label, value, onChangeKey, rateKey) => {
    const isDeleted = (rates.deletedRates || []).includes(rateKey);
    if (isDeleted) return null;

    return (
      <div className="flex items-center justify-between py-2 group border-b" style={{ borderColor: 'var(--table-border)' }}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => {
              const nextDeleted = [...(rates.deletedRates || []), rateKey];
              onChange('deletedRates', nextDeleted);
            }}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1.5 rounded bg-red-500/10 transition-colors shrink-0"
            title={`Delete ${label}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--text-light)', letterSpacing: '0.04em' }}>
            ₹
          </span>
          <input
            type="number"
            value={value === null || value === undefined ? '' : value}
            onChange={(e) => onChange(onChangeKey, e.target.value === '' ? null : Number(e.target.value))}
            min="0"
            disabled={disabled}
            className="premium-input text-xs text-right"
            style={{ width: '4rem', padding: '0.25rem 0.5rem', height: '1.75rem' }}
          />
        </div>
      </div>
    );
  };

  const deletedStandardWood = (standardRatesMap[type] || []).filter(r => (r.category === 'wood' || !r.category) && (rates.deletedRates || []).includes(r.key));
  const deletedStandardPly = (standardRatesMap[type] || []).filter(r => r.category === 'ply' && (rates.deletedRates || []).includes(r.key));

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
                  {renderStandardRow("Wood Rate", rates.cftRate, "cftRate", "cftRate")}
                  {renderStandardRow("Labour", rates.woodLabour, "woodLabour", "woodLabour")}
                  {renderStandardRow("Nail", rates.woodNail, "woodNail", "woodNail")}
                  {renderStandardRow("Plaining", rates.woodPlaining, "woodPlaining", "woodPlaining")}
                  {type === 'ply-wood-pallet' && (
                    <>
                      {renderStandardRow("EB", rates.woodEB, "woodEB", "woodEB")}
                      {renderStandardRow("Loading", rates.woodLoading, "woodLoading", "woodLoading")}
                    </>
                  )}
                  {type === 'pine-plywood-box' && (
                    <>
                      {renderStandardRow("HT", rates.woodHT, "woodHT", "woodHT")}
                      {renderStandardRow("Loading", rates.woodLoading, "woodLoading", "woodLoading")}
                    </>
                  )}

                  {/* Custom Wood parameters list */}
                  {(rates.customRates || []).filter(cr => cr.category === 'wood').map((cr) => {
                    const fullIdx = rates.customRates.findIndex(item => item.id === cr.id);
                    if (fullIdx === -1) return null;
                    return (
                      <React.Fragment key={cr.id}>
                        <div style={{ borderTop: '1px solid var(--table-border)' }} />
                        <div className="flex items-center gap-1.5 py-2 group">
                          <button
                            type="button"
                            onClick={() => {
                              const nextCustom = rates.customRates.filter(item => item.id !== cr.id);
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1.5 rounded bg-red-500/10 transition-colors shrink-0"
                            title={`Delete ${cr.label}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <input
                            type="text"
                            value={cr.label}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], label: e.target.value };
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="table-input flex-1 min-w-0 text-sm py-1 px-2"
                            placeholder="Wood Param"
                          />
                          <select
                            value={cr.type || 'currency'}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], type: e.target.value };
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="header-unit-select text-xs font-semibold shrink-0"
                            style={{ width: '2.5rem', padding: '0.125rem 1.25rem 0.125rem 0.25rem', height: '1.75rem' }}
                          >
                            <option value="currency">₹</option>
                            <option value="percent">%</option>
                          </select>
                          <input
                            type="number"
                            value={cr.value === 0 ? '' : cr.value}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], value: e.target.value === '' ? 0 : (Number(e.target.value) || 0) };
                              onChange('customRates', nextCustom);
                            }}
                            min="0"
                            disabled={disabled}
                            className="premium-input text-xs shrink-0 text-right"
                            style={{ width: '4rem', padding: '0.25rem 0.5rem', height: '1.75rem' }}
                          />
                        </div>
                      </React.Fragment>
                    );
                  })}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const currentCustom = rates.customRates || [];
                        const newCustom = [
                          ...currentCustom,
                          {
                            id: 'cr_' + Date.now() + Math.random().toString(36).substr(2, 5),
                            label: '',
                            value: 0,
                            type: 'currency',
                            category: 'wood'
                          }
                        ];
                        onChange('customRates', newCustom);
                      }}
                      disabled={disabled}
                      className="mt-3 flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
                      style={{
                        borderColor: 'var(--accent-wood-light)',
                        color: 'var(--accent-wood-light)',
                        background: 'transparent',
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      + Wood Param
                    </button>

                    {deletedStandardWood.length > 0 && (
                      <div className="mt-3 flex-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onChange('deletedRates', (rates.deletedRates || []).filter(r => r !== e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="header-unit-select text-[11px] font-semibold w-full text-center"
                          style={{ height: '2.1rem', borderColor: 'var(--accent-wood-light)', color: 'var(--accent-wood-light)' }}
                          defaultValue=""
                        >
                          <option value="" disabled>+ Restore Param</option>
                          {deletedStandardWood.map(r => (
                            <option key={r.key} value={r.key}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Plywood Parameters */}
                <div className="space-y-2 pl-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Plywood (SFT) Rates</h4>
                  {renderStandardRow("Ply Rate", rates.sftRate, "sftRate", "sftRate")}
                  {renderStandardRow("Labour", rates.plyLabour, "plyLabour", "plyLabour")}
                  {type === 'ply-wood-pallet' && (
                    <>
                      {renderStandardRow("Nail", rates.plyNail, "plyNail", "plyNail")}
                      {renderStandardRow("Plaining", rates.plyPlaining, "plyPlaining", "plyPlaining")}
                      {renderStandardRow("EB", rates.plyEB, "plyEB", "plyEB")}
                      {renderStandardRow("Loading", rates.plyLoading, "plyLoading", "plyLoading")}
                    </>
                  )}

                  {/* Custom Plywood parameters list */}
                  {(rates.customRates || []).filter(cr => cr.category === 'ply').map((cr) => {
                    const fullIdx = rates.customRates.findIndex(item => item.id === cr.id);
                    if (fullIdx === -1) return null;
                    return (
                      <React.Fragment key={cr.id}>
                        <div style={{ borderTop: '1px solid var(--table-border)' }} />
                        <div className="flex items-center gap-1.5 py-2 group">
                          <button
                            type="button"
                            onClick={() => {
                              const nextCustom = rates.customRates.filter(item => item.id !== cr.id);
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1.5 rounded bg-red-500/10 transition-colors shrink-0"
                            title={`Delete ${cr.label}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <input
                            type="text"
                            value={cr.label}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], label: e.target.value };
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="table-input flex-1 min-w-0 text-sm py-1 px-2"
                            placeholder="Ply Param"
                          />
                          <select
                            value={cr.type || 'currency'}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], type: e.target.value };
                              onChange('customRates', nextCustom);
                            }}
                            disabled={disabled}
                            className="header-unit-select text-xs font-semibold shrink-0"
                            style={{ width: '2.5rem', padding: '0.125rem 1.25rem 0.125rem 0.25rem', height: '1.75rem' }}
                          >
                            <option value="currency">₹</option>
                            <option value="percent">%</option>
                          </select>
                          <input
                            type="number"
                            value={cr.value === 0 ? '' : cr.value}
                            onChange={(e) => {
                              const nextCustom = [...rates.customRates];
                              nextCustom[fullIdx] = { ...nextCustom[fullIdx], value: e.target.value === '' ? 0 : (Number(e.target.value) || 0) };
                              onChange('customRates', nextCustom);
                            }}
                            min="0"
                            disabled={disabled}
                            className="premium-input text-xs shrink-0 text-right"
                            style={{ width: '4rem', padding: '0.25rem 0.5rem', height: '1.75rem' }}
                          />
                        </div>
                      </React.Fragment>
                    );
                  })}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const currentCustom = rates.customRates || [];
                        const newCustom = [
                          ...currentCustom,
                          {
                            id: 'cr_' + Date.now() + Math.random().toString(36).substr(2, 5),
                            label: '',
                            value: 0,
                            type: 'currency',
                            category: 'ply'
                          }
                        ];
                        onChange('customRates', newCustom);
                      }}
                      disabled={disabled}
                      className="mt-3 flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
                      style={{
                        borderColor: 'var(--accent-wood-light)',
                        color: 'var(--accent-wood-light)',
                        background: 'transparent',
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      + Ply Param
                    </button>

                    {deletedStandardPly.length > 0 && (
                      <div className="mt-3 flex-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onChange('deletedRates', (rates.deletedRates || []).filter(r => r !== e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="header-unit-select text-[11px] font-semibold w-full text-center"
                          style={{ height: '2.1rem', borderColor: 'var(--accent-wood-light)', color: 'var(--accent-wood-light)' }}
                          defaultValue=""
                        >
                          <option value="" disabled>+ Restore Param</option>
                          {deletedStandardPly.map(r => (
                            <option key={r.key} value={r.key}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
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
              {renderStandardRow("Wood Rate", rates.cftRate, "cftRate", "cftRate")}
              {renderStandardRow("Labour", rates.labour, "labour", "labour")}
              {renderStandardRow("Nail", rates.nail, "nail", "nail")}
              {renderStandardRow("Transport", rates.transport, "transport", "transport")}

              {type === 'pine-wood-box' && (
                <>
                  {renderStandardRow("Packing Cover", rates.packing, "packing", "packing")}
                  {renderStandardRow("Clamp", rates.clamp, "clamp", "clamp")}
                </>
              )}

              {type === 'pine-wood-pallet' && (
                <>
                  {renderStandardRow("Plaining", rates.plaining, "plaining", "plaining")}
                  {renderStandardRow("EB", rates.eb, "eb", "eb")}
                  {renderStandardRow("HT", rates.ht, "ht", "ht")}
                  {renderStandardRow("Loading", rates.loading, "loading", "loading")}
                </>
              )}

              {/* Custom parameters list */}
              {(rates.customRates || []).map((cr, idx) => (
                <React.Fragment key={cr.id}>
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <div className="flex items-center gap-1.5 py-2 group">
                    <button
                      type="button"
                      onClick={() => {
                        const nextCustom = rates.customRates.filter((_, i) => i !== idx);
                        onChange('customRates', nextCustom);
                      }}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1.5 rounded bg-red-500/10 transition-colors shrink-0"
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
                      className="table-input flex-1 min-w-0 text-sm py-1 px-2"
                      placeholder="Parameter Name"
                    />
                    <select
                      value={cr.type || 'currency'}
                      onChange={(e) => {
                        const nextCustom = [...rates.customRates];
                        nextCustom[idx] = { ...nextCustom[idx], type: e.target.value };
                        onChange('customRates', nextCustom);
                      }}
                      disabled={disabled}
                      className="header-unit-select text-xs font-semibold shrink-0"
                      style={{ width: '2.5rem', padding: '0.125rem 1.25rem 0.125rem 0.25rem', height: '1.75rem' }}
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
                      className="premium-input text-xs shrink-0 text-right"
                      style={{ width: '4rem', padding: '0.25rem 0.5rem', height: '1.75rem' }}
                    />
                  </div>
                </React.Fragment>
              ))}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addCustomRate}
                  disabled={disabled}
                  className="mt-3 flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
                  style={{
                    borderColor: 'var(--accent-wood-light)',
                    color: 'var(--accent-wood-light)',
                    background: 'transparent',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  + Parameter
                </button>

                {deletedStandardWood.length > 0 && (
                  <div className="mt-3 flex-1">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onChange('deletedRates', (rates.deletedRates || []).filter(r => r !== e.target.value));
                          e.target.value = '';
                        }
                      }}
                      className="header-unit-select text-[11px] font-semibold w-full text-center"
                      style={{ height: '2.1rem', borderColor: 'var(--accent-wood-light)', color: 'var(--accent-wood-light)' }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Restore Param</option>
                      {deletedStandardWood.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

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
