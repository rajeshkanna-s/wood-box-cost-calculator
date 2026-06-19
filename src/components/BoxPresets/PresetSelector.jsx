import React from 'react';
import { BOX_PRESETS } from '../../engine/boxTypes';

export const PLYWOOD_PRESETS = [
  { id: 'p1', label: '300 × 300 × 300 mm', l: 300, w: 300, h: 300 },
  { id: 'p2', label: '500 × 400 × 300 mm', l: 500, w: 400, h: 300 },
  { id: 'p3', label: '600 × 500 × 400 mm', l: 600, w: 500, h: 400 },
  { id: 'p4', label: '800 × 600 × 500 mm', l: 800, w: 600, h: 500 },
  { id: 'p5', label: '1000 × 800 × 600 mm', l: 1000, w: 800, h: 600 },
];

export default function PresetSelector({ onSelect, compact = false, isPlywood = false }) {
  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const presetsList = isPlywood ? PLYWOOD_PRESETS : BOX_PRESETS;
    const preset = presetsList.find(p => p.id === selectedId);
    if (preset) {
      const scrollY = window.scrollY;
      e.target.blur();
      onSelect(preset);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  };

  if (compact) {
    if (isPlywood) {
      return (
        <select
          id="preset-select"
          onChange={handleChange}
          className="premium-select w-full"
          defaultValue=""
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
        >
          <option value="" disabled>Choose a plywood preset (L × W × H)</option>
          {PLYWOOD_PRESETS.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <select
        id="preset-select"
        onChange={handleChange}
        className="premium-select w-full"
        defaultValue=""
        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
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
    );
  }

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
