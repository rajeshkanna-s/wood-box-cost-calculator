import React, { useState } from 'react';
import InputRow from '../shared/InputRow';

export default function RateInputs({ rates, onChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="glass-card h-full flex flex-col">
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
            <InputRow label="CFT Rate (Wood)" value={rates.cftRate} onChange={(v) => onChange('cftRate', v)} unit="₹" min="0" />
            <div style={{ borderTop: '1px solid var(--table-border)' }} />
            <InputRow label="Labour" value={rates.labour} onChange={(v) => onChange('labour', v)} unit="₹" min="0" />
            <div style={{ borderTop: '1px solid var(--table-border)' }} />
            <InputRow label="Nail" value={rates.nail} onChange={(v) => onChange('nail', v)} unit="₹" min="0" />
            <div style={{ borderTop: '1px solid var(--table-border)' }} />
            <InputRow label="Transport" value={rates.transport} onChange={(v) => onChange('transport', v)} unit="₹" min="0" />
            <div style={{ borderTop: '1px solid var(--table-border)' }} />
            <InputRow label="Packing Cover" value={rates.packing} onChange={(v) => onChange('packing', v)} unit="₹" min="0" />
            <div style={{ borderTop: '1px solid var(--table-border)' }} />
            <InputRow label="Clamp" value={rates.clamp} onChange={(v) => onChange('clamp', v)} unit="₹" min="0" />
          </div>

          {/* Percentages Section */}
          <div className="mt-auto pt-4">
            <div className="glass-card-inner p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-wood)' }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Waste Factor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                  <input
                    type="number"
                    value={rates.wastePct !== undefined ? rates.wastePct : 10}
                    onChange={(e) => onChange('wastePct', e.target.value)}
                    min="0"
                    max="100"
                    className="premium-input"
                    style={{ width: '5rem' }}
                  />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-emerald)' }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em' }}>Profit Margin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>%</span>
                  <input
                    type="number"
                    value={rates.profitPct !== undefined ? rates.profitPct : 20}
                    onChange={(e) => onChange('profitPct', e.target.value)}
                    min="0"
                    max="100"
                    className="premium-input"
                    style={{ width: '5rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
