import React from 'react';

export default function InputRow({ label, value, onChange, type = "number", unit, min, max, step, disabled = false, onDelete }) {
  return (
    <div className="flex items-center justify-between py-2.5 group">
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1 rounded bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Delete ${label}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <label 
          className="text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      </div>
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
          value={value === null || value === undefined ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
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

