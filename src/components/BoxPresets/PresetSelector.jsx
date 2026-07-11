import React from 'react';
import { PRODUCT_PRESETS } from '../../engine/boxTypes';

export default function PresetSelector({ onSelect, compact = false, type = 'pine-wood-box' }) {
  const presetsList = PRODUCT_PRESETS[type] || [];

  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
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

  const getPlaceholderText = () => {
    switch (type) {
      case 'pine-wood-box':
        return 'Choose a Pine Wood Box preset (L × W × H in)';
      case 'ply-wood-pallet':
        return 'Choose a Plywood Pallet preset (L × W × H mm)';
      case 'pine-wood-pallet':
        return 'Choose a Pine Wood Pallet preset (L × W × H mm)';
      case 'pine-plywood-box':
        return 'Choose a Pine Plywood Box preset (L × W × H mm)';
      default:
        return 'Choose a preset size';
    }
  };

  if (compact) {
    return (
      <select
        id="preset-select"
        onChange={handleChange}
        className="premium-select w-full"
        defaultValue=""
        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
      >
        <option value="" disabled>{getPlaceholderText()}</option>
        {presetsList.map(preset => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
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
          <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>Select Size Preset:</span>
        </div>

        <select
          id="preset-select"
          onChange={handleChange}
          className="premium-select flex-1"
          defaultValue=""
        >
          <option value="" disabled>{getPlaceholderText()}</option>
          {presetsList.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

