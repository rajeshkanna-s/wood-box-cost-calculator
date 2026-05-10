import React from 'react';
import InputRow from '../shared/InputRow';
import { inchToMm } from '../../engine/cft';
import { getReperType } from '../../engine/parts';

export default function DimensionInputs({ dims, onChange }) {
  const l_mm = inchToMm(dims.l);
  const w_mm = inchToMm(dims.w);
  const h_mm = inchToMm(dims.h);
  const reperType = getReperType(dims.l);

  const reperInfo = {
    18: { label: '18-Reper', desc: 'Standard Frame' },
    22: { label: '22-Reper', desc: 'Heavy Frame' },
    26: { label: '26-Reper', desc: 'Extra Long' },
  };
  const reper = reperInfo[reperType];

  return (
    <div className="glass-card h-full flex flex-col">
      <div className="section-header">
        <div className="flex items-center">
          <div className="section-icon">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <h2 className="section-title">Box Dimensions</h2>
        </div>
        <span className="badge badge-wood">
          {reper.label}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Input fields */}
        <div className="space-y-1" style={{ borderBottom: 'none' }}>
          <InputRow label="Length (L)" value={dims.l} onChange={(v) => onChange('l', v)} unit="in" min="1" step="0.5" />
          <div style={{ borderTop: '1px solid var(--table-border)' }} />
          <InputRow label="Width (W)" value={dims.w} onChange={(v) => onChange('w', v)} unit="in" min="1" step="0.5" />
          <div style={{ borderTop: '1px solid var(--table-border)' }} />
          <InputRow label="Height (H)" value={dims.h} onChange={(v) => onChange('h', v)} unit="in" min="1" step="0.5" />
        </div>

        {/* MM Conversion Panel */}
        <div className="mt-auto pt-5">
          <div className="glass-card-inner p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-wood)' }} />
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.08em' }}>Live mm Conversion</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MmValue label="Length" value={l_mm} />
              <MmValue label="Width" value={w_mm} />
              <MmValue label="Height" value={h_mm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MmValue({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em', fontSize: '0.625rem' }}>{label}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{value.toFixed(1)}</p>
      <p style={{ color: 'var(--text-light)', fontSize: '0.625rem' }}>mm</p>
    </div>
  );
}
