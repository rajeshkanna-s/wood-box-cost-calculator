import { useState, useMemo, useEffect } from 'react';
import { buildParts } from '../engine/parts';
import { calcBoxCost, DEFAULT_RATES } from '../engine/cft';

const TEXT_PART_FIELDS = new Set(['id', 'label']);

export function useBoxCalculator(initialDims = { l: 75, w: 35, h: 35 }) {
  const [dims,  setDims]  = useState(initialDims);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [parts, setParts] = useState(() => buildParts(initialDims.l, initialDims.w, initialDims.h));

  // Auto-regenerate standard parts ONLY when global dimensions change.
  // This intentionally overwrites any custom manual edits to reset the calculator.
  useEffect(() => {
    setParts(buildParts(dims.l, dims.w, dims.h));
  }, [dims.l, dims.w, dims.h]);

  const updateDim  = (key, val) => setDims(d  => ({ ...d,  [key]: Number(val) || 0 }));
  const updateRate = (key, val) => setRates(r => ({ ...r, [key]: Number(val) || 0 }));

  const loadPreset = (preset) => {
    setDims({ l: preset.l, w: preset.w, h: preset.h });
  };

  // Manual part override functions
  const updatePart = (index, field, value) => {
    setParts(prevParts => {
      const newParts = [...prevParts];
      const nextValue = TEXT_PART_FIELDS.has(field) ? value : Number(value) || 0;
      newParts[index] = { ...newParts[index], [field]: nextValue };
      return newParts;
    });
  };

  const addCustomPart = () => {
    setParts(prevParts => [
      ...prevParts, 
      { id: 'CUSTOM', label: 'Custom Part', l: 0, w: 0, h: 0, qty: 1, isCustom: true, isExcluded: false }
    ]);
  };

  const removePart = (index) => {
    setParts(prevParts => prevParts.filter((_, i) => i !== index));
  };

  const togglePartExclusion = (index) => {
    setParts(prevParts => {
      const newParts = [...prevParts];
      newParts[index] = { ...newParts[index], isExcluded: !newParts[index].isExcluded };
      return newParts;
    });
  };

  const result = useMemo(() => {
    return calcBoxCost(parts, rates);
  }, [parts, rates]);

  return { 
    dims, 
    rates, 
    parts,
    result, 
    updateDim, 
    updateRate, 
    loadPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion
  };
}
