import React from 'react';

export default function InputRow({ label, value, onChange, type = "number", unit, min, max, step, disabled = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 group">
      <label 
        className="text-sm font-medium transition-colors duration-150"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        {unit && (
          <span 
            className="text-xs font-semibold uppercase w-6 text-right"
            style={{ color: 'var(--text-light)', letterSpacing: '0.04em' }}
          >
            {unit}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="premium-input disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ width: '6rem' }}
        />
      </div>
    </div>
  );
}

