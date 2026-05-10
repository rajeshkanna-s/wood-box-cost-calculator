import React from 'react';

export default function MetricCard({ label, value, unit, highlight = false }) {
  return (
    <div 
      className="p-4 rounded-xl border transition-all duration-200"
      style={{
        borderColor: highlight ? 'var(--input-focus)' : 'var(--card-border)',
        background: highlight ? 'var(--hero-grad-1)' : 'var(--card-inner-bg)',
      }}
    >
      <p className="text-xs font-medium uppercase mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span 
          className="text-xl font-bold font-mono"
          style={{ color: highlight ? 'var(--accent-wood-light)' : 'var(--text-main)' }}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>{unit}</span>}
      </div>
    </div>
  );
}
