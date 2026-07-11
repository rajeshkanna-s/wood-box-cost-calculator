import React from 'react';
import InputRow from '../shared/InputRow';
import PresetSelector from '../BoxPresets/PresetSelector';
import { inchToMm, convertToInches, convertFromInches } from '../../engine/cft';
import { getReperType } from '../../engine/parts';

export default function DimensionInputs({
  dims,
  onChange,
  onUnitChange,
  showPresetSelector = false,
  onSelectPreset,
  isPlywood = false,
  customPresetSelector = null,
  type = 'pine-wood-box'
}) {
  const currentUnit = dims.unit || 'in';
  
  const lInches = currentUnit === 'sft' ? 0 : convertToInches(dims.l, currentUnit);
  const wInches = currentUnit === 'sft' ? 0 : convertToInches(dims.w, currentUnit);
  const hInches = currentUnit === 'sft' ? 0 : convertToInches(dims.h, currentUnit);
  
  const reperType = getReperType(lInches);

  const reperInfo = {
    18: { label: '18-Reper', desc: 'Standard Frame' },
    22: { label: '22-Reper', desc: 'Heavy Frame' },
    26: { label: '26-Reper', desc: 'Extra Long' },
  };
  const reper = reperInfo[reperType];

  const boxSurfaceAreaSqFt = currentUnit === 'sft' ? dims.l : ((2 * (lInches * wInches + wInches * hInches + lInches * hInches)) / 144);

  // Convert for conversion panel display
  const showUnit = currentUnit === 'mm' ? 'in' : 'mm';
  const l_converted = currentUnit === 'sft' ? 0 : (currentUnit === 'mm' ? convertFromInches(lInches, 'in') : convertFromInches(lInches, 'mm'));
  const w_converted = currentUnit === 'sft' ? 0 : (currentUnit === 'mm' ? convertFromInches(wInches, 'in') : convertFromInches(wInches, 'mm'));
  const h_converted = currentUnit === 'sft' ? 0 : (currentUnit === 'mm' ? convertFromInches(hInches, 'in') : convertFromInches(hInches, 'mm'));

  const isReperType = type === 'pine-wood-box';

  return (
    <div className="glass-card flex flex-col">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="section-icon">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <h2 className="section-title mr-2">Dimensions</h2>
          </div>
          <select
            value={currentUnit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="header-unit-select"
          >
            <option value="in">Inch (in)</option>
            <option value="mm">Millimeter (mm)</option>
            <option value="cm">Centimeter (cm)</option>
            <option value="ft">Feet (ft)</option>
            <option value="m">Meter (m)</option>
            {isPlywood && <option value="sft">Square Feet (sft)</option>}
          </select>
        </div>
        {isReperType && (
          <span className="badge badge-wood">
            {reper.label}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Input fields */}
        <div className="space-y-1" style={{ borderBottom: 'none' }}>
          {(showPresetSelector || customPresetSelector) && (
            <>
              <div className="flex items-center justify-between py-2 px-1 gap-4">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  Select Preset Size:
                </span>
                <div className="flex-1 max-w-[60%]">
                  {customPresetSelector ? (
                    customPresetSelector
                  ) : (
                    <PresetSelector compact={true} onSelect={onSelectPreset} type={type} />
                  )}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--table-border)', marginBottom: '0.25rem' }} />
            </>
          )}
          {currentUnit === 'sft' ? (
            <>
              <InputRow label="Total Area" value={dims.l} onChange={(v) => onChange('l', v)} unit="SFT" min="0.1" step="0.5" />
              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Thickness (H)" value={dims.h} onChange={(v) => onChange('h', v)} unit="mm" min="1" step="1" />
            </>
          ) : (
            <>
              <InputRow label="Length (L)" value={dims.l} onChange={(v) => onChange('l', v)} unit={currentUnit} min="1" step="0.5" />
              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Width (W)" value={dims.w} onChange={(v) => onChange('w', v)} unit={currentUnit} min="1" step="0.5" />
              <div style={{ borderTop: '1px solid var(--table-border)' }} />
              <InputRow label="Height (H)" value={dims.h} onChange={(v) => onChange('h', v)} unit={currentUnit} min="1" step="0.5" />
              {isPlywood && (
                <>
                  <div style={{ borderTop: '1px solid var(--table-border)' }} />
                  <div className="flex items-center justify-between py-2.5 group">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                      Total Surface Area (Top/Side/Ends)
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                      {boxSurfaceAreaSqFt.toFixed(2)} SFT
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* mm or inch Conversion Panel */}
        {currentUnit !== 'sft' && (
          <div className="mt-auto pt-5">
            <div className="glass-card-inner p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-wood)' }} />
                <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.08em' }}>
                  Live {showUnit === 'in' ? 'Inch' : 'mm'} Conversion
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ConversionValue label="Length" value={l_converted} unit={showUnit} />
                <ConversionValue label="Width" value={w_converted} unit={showUnit} />
                <ConversionValue label="Height" value={h_converted} unit={showUnit} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversionValue({ label, value, unit }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.06em', fontSize: '0.625rem' }}>{label}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{value.toFixed(1)}</p>
      <p style={{ color: 'var(--text-light)', fontSize: '0.625rem' }}>{unit}</p>
    </div>
  );
}
