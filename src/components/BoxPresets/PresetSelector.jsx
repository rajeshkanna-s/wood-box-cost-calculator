import React from 'react';
import { BOX_PRESETS } from '../../engine/boxTypes';

export default function PresetSelector({ onSelect }) {
  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const preset = BOX_PRESETS.find(p => p.id === selectedId);
    if (preset) {
      const scrollY = window.scrollY;
      e.target.blur();
      onSelect(preset);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="section-icon shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>Select Box Size:</span>
        </div>

        <select
          id="preset-select"
          onChange={handleChange}
          className="premium-select flex-1"
          defaultValue=""
        >
          <option value="" disabled>Choose a standard box preset (L × W × H)</option>
          <optgroup label="18-Reper (Small/Medium)">
            {BOX_PRESETS.filter(p => p.reper === 18).map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.label} — {preset.reper}-Reper
              </option>
            ))}
          </optgroup>
          <optgroup label="22-Reper (Large)">
            {BOX_PRESETS.filter(p => p.reper === 22).map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.label} — {preset.reper}-Reper
              </option>
            ))}
          </optgroup>
          <optgroup label="26-Reper (Extra Long)">
            {BOX_PRESETS.filter(p => p.reper === 26).map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.label} — {preset.reper}-Reper
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
