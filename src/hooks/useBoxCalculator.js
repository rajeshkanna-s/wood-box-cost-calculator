import { useState, useMemo } from 'react';
import { 
  buildPineWoodBoxParts, 
  buildPlywoodPalletParts, 
  buildPineWoodPalletParts, 
  buildPinePlywoodBoxParts 
} from '../engine/parts';
import { 
  calculateProductCost, 
  DEFAULT_PINE_WOOD_BOX_RATES, 
  DEFAULT_PLY_WOOD_PALLET_RATES, 
  DEFAULT_PINE_WOOD_PALLET_RATES, 
  DEFAULT_PINE_PLYWOOD_BOX_RATES,
  convertToInches, 
  convertFromInches 
} from '../engine/cft';

export function useBoxCalculator() {
  const [activeTab, setActiveTab] = useState('pine-wood-box');

  // Independent states for each product calculator
  const [pineWoodBoxState, setPineWoodBoxState] = useState({
    dims: { l: 75, w: 35, h: 35, unit: 'in' },
    rates: DEFAULT_PINE_WOOD_BOX_RATES,
    parts: buildPineWoodBoxParts(75, 35, 35)
  });

  const [plyWoodPalletState, setPlyWoodPalletState] = useState({
    dims: { l: 1200, w: 1100, h: 195, unit: 'mm' },
    rates: DEFAULT_PLY_WOOD_PALLET_RATES,
    parts: buildPlywoodPalletParts(1200 / 25.4, 1100 / 25.4, 195 / 25.4)
  });

  const [pineWoodPalletState, setPineWoodPalletState] = useState({
    dims: { l: 1150, w: 1150, h: 150, unit: 'mm' },
    rates: DEFAULT_PINE_WOOD_PALLET_RATES,
    parts: buildPineWoodPalletParts(1150 / 25.4, 1150 / 25.4, 150 / 25.4)
  });

  const [pinePlywoodBoxState, setPinePlywoodBoxState] = useState({
    dims: { l: 1140, w: 800, h: 195, unit: 'mm' },
    rates: DEFAULT_PINE_PLYWOOD_BOX_RATES,
    parts: buildPinePlywoodBoxParts(1140 / 25.4, 800 / 25.4, 195 / 25.4)
  });

  // Helper to get state and setter for active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'pine-wood-box':
        return { state: pineWoodBoxState, setter: setPineWoodBoxState };
      case 'ply-wood-pallet':
        return { state: plyWoodPalletState, setter: setPlyWoodPalletState };
      case 'pine-wood-pallet':
        return { state: pineWoodPalletState, setter: setPineWoodPalletState };
      case 'pine-plywood-box':
        return { state: pinePlywoodBoxState, setter: setPinePlywoodBoxState };
      default:
        return { state: pineWoodBoxState, setter: setPineWoodBoxState };
    }
  };

  const { state: activeState, setter: activeSetter } = getActiveData();

  // Helper to generate default parts based on active tab and dimensions
  const getGeneratedParts = (tab, l, w, h, unit) => {
    if (unit === 'cft') {
      const isPlyTab = tab === 'ply-wood-pallet';
      return [
        {
          id: 'CFT-INPUT',
          label: isPlyTab ? 'Entered Custom Volume (SFT Equivalent)' : 'Entered Custom Volume (CFT)',
          l: 0,
          w: 0,
          h: 0,
          qty: 1,
          isCustom: true,
          isExcluded: false,
          isPly: isPlyTab,
          cft: isPlyTab ? 0 : l,
          sft: isPlyTab ? l : 0
        }
      ];
    }

    if (unit === 'sft') {
      const isPlyTab = tab === 'ply-wood-pallet' || tab === 'pine-plywood-box';
      const cftVal = isPlyTab ? 0 : (l * (h / 25.4) / 12);
      const sftVal = isPlyTab ? l : 0;
      return [
        {
          id: 'SFT-INPUT',
          label: isPlyTab ? 'Entered Custom Area (SFT)' : `Entered Custom Area (SFT) × Thickness (${h}mm)`,
          l: 0,
          w: 0,
          h: 0,
          qty: 1,
          isCustom: true,
          isExcluded: false,
          isPly: isPlyTab,
          cft: cftVal,
          sft: sftVal
        }
      ];
    }

    const lIn = convertToInches(l, unit);
    const wIn = convertToInches(w, unit);
    const hIn = convertToInches(h, unit);

    switch (tab) {
      case 'pine-wood-box':
        return buildPineWoodBoxParts(lIn, wIn, hIn);
      case 'ply-wood-pallet':
        return buildPlywoodPalletParts(lIn, wIn, hIn);
      case 'pine-wood-pallet':
        return buildPineWoodPalletParts(lIn, wIn, hIn);
      case 'pine-plywood-box':
        return buildPinePlywoodBoxParts(lIn, wIn, hIn);
      default:
        return [];
    }
  };

  // Update dimensions and trigger auto-regeneration of parts
  const updateDim = (key, val) => {
    const numVal = Number(val) || 0;
    activeSetter(prev => {
      const nextDims = { ...prev.dims, [key]: numVal };
      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit);
      return {
        ...prev,
        dims: nextDims,
        parts: nextParts
      };
    });
  };

  // Update rates card
  const updateRate = (key, val) => {
    activeSetter(prev => {
      const numVal = (key === 'rateUnit' || key === 'customRates') ? val : (val === '' || val === null || val === undefined ? null : Number(val));
      return {
        ...prev,
        rates: { ...prev.rates, [key]: numVal }
      };
    });
  };

  // Change active dimensions unit and adjust values accordingly
  const changeUnit = (newUnit) => {
    activeSetter(prev => {
      const oldUnit = prev.dims.unit || 'in';
      if (oldUnit === newUnit) return prev;

      const isCustomUnit = (u) => u === 'cft' || u === 'sft';

      let nextDims;
      if (isCustomUnit(oldUnit) || isCustomUnit(newUnit)) {
        if (newUnit === 'cft') {
          nextDims = { unit: 'cft', l: 10, w: 0, h: 0 };
        } else if (newUnit === 'sft') {
          nextDims = { unit: 'sft', l: 100, w: 0, h: 16 };
        } else {
          // Revert to sensible defaults for physical dimensions
          const defaultPresets = {
            'pine-wood-box': { l: 75, w: 35, h: 35, unit: 'in' },
            'ply-wood-pallet': { l: 1200, w: 1100, h: 195, unit: 'mm' },
            'pine-wood-pallet': { l: 1150, w: 1150, h: 150, unit: 'mm' },
            'pine-plywood-box': { l: 1140, w: 800, h: 195, unit: 'mm' }
          };
          nextDims = defaultPresets[activeTab] || { l: 75, w: 35, h: 35, unit: 'in' };
        }
      } else {
        const lInches = convertToInches(prev.dims.l, oldUnit);
        const wInches = convertToInches(prev.dims.w, oldUnit);
        const hInches = convertToInches(prev.dims.h, oldUnit);

        nextDims = {
          unit: newUnit,
          l: Number(convertFromInches(lInches, newUnit).toFixed(2)),
          w: Number(convertFromInches(wInches, newUnit).toFixed(2)),
          h: Number(convertFromInches(hInches, newUnit).toFixed(2)),
        };
      }

      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit);

      return {
        ...prev,
        dims: nextDims,
        parts: nextParts
      };
    });
  };

  // Load a size preset
  const loadPreset = (preset) => {
    activeSetter(prev => {
      const targetUnit = preset.unit || prev.dims.unit || 'in';
      const nextDims = {
        unit: targetUnit,
        l: preset.l,
        w: preset.w,
        h: preset.h
      };
      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit);

      return {
        ...prev,
        dims: nextDims,
        parts: nextParts
      };
    });
  };

  // Update a single part in the active parts table
  const updatePart = (index, field, value) => {
    activeSetter(prev => {
      const newParts = [...prev.parts];
      const textFields = ['id', 'label'];
      const nextValue = textFields.includes(field) ? value : (Number(value) || 0);
      newParts[index] = { ...newParts[index], [field]: nextValue };

      // Sync custom input parts back to dims.l
      let nextDims = prev.dims;
      const part = newParts[index];
      if (part.id === 'CFT-INPUT' && field === 'cft') {
        nextDims = { ...prev.dims, l: nextValue };
      } else if (part.id === 'SFT-INPUT' && field === 'sft') {
        nextDims = { ...prev.dims, l: nextValue };
      }

      return {
        ...prev,
        dims: nextDims,
        parts: newParts
      };
    });
  };

  // Add custom part to active parts list
  const addCustomPart = (isPlyPart = false) => {
    activeSetter(prev => {
      const isPly = activeTab === 'ply-wood-pallet' || activeTab === 'pine-plywood-box' ? isPlyPart : false;
      const newPart = {
        id: isPly ? 'PLY-CUSTOM' : 'WOOD-CUSTOM',
        label: isPly ? 'Custom Plywood Panel' : 'Custom Wood Part',
        l: 0,
        w: 0,
        h: 0,
        qty: 1,
        isCustom: true,
        isExcluded: false,
        isPly
      };
      return {
        ...prev,
        parts: [...prev.parts, newPart]
      };
    });
  };

  // Remove a part
  const removePart = (index) => {
    activeSetter(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  };

  // Exclude / include a part
  const togglePartExclusion = (index) => {
    activeSetter(prev => {
      const newParts = [...prev.parts];
      newParts[index] = { ...newParts[index], isExcluded: !newParts[index].isExcluded };
      return {
        ...prev,
        parts: newParts
      };
    });
  };

  // Reset parts list back to dimensions default
  const resetParts = () => {
    activeSetter(prev => {
      const nextParts = getGeneratedParts(activeTab, prev.dims.l, prev.dims.w, prev.dims.h, prev.dims.unit);
      return {
        ...prev,
        parts: nextParts
      };
    });
  };

  // Calculate results dynamically
  const pineWoodBoxResult = useMemo(() => {
    return calculateProductCost('pine-wood-box', pineWoodBoxState.parts, pineWoodBoxState.rates);
  }, [pineWoodBoxState.parts, pineWoodBoxState.rates]);

  const plyWoodPalletResult = useMemo(() => {
    return calculateProductCost('ply-wood-pallet', plyWoodPalletState.parts, plyWoodPalletState.rates);
  }, [plyWoodPalletState.parts, plyWoodPalletState.rates]);

  const pineWoodPalletResult = useMemo(() => {
    return calculateProductCost('pine-wood-pallet', pineWoodPalletState.parts, pineWoodPalletState.rates);
  }, [pineWoodPalletState.parts, pineWoodPalletState.rates]);

  const pinePlywoodBoxResult = useMemo(() => {
    return calculateProductCost('pine-plywood-box', pinePlywoodBoxState.parts, pinePlywoodBoxState.rates);
  }, [pinePlywoodBoxState.parts, pinePlywoodBoxState.rates]);

  // Compute active result based on activeTab
  const activeResult = useMemo(() => {
    switch (activeTab) {
      case 'pine-wood-box':
        return pineWoodBoxResult;
      case 'ply-wood-pallet':
        return plyWoodPalletResult;
      case 'pine-wood-pallet':
        return pineWoodPalletResult;
      case 'pine-plywood-box':
        return pinePlywoodBoxResult;
      default:
        return pineWoodBoxResult;
    }
  }, [activeTab, pineWoodBoxResult, plyWoodPalletResult, pineWoodPalletResult, pinePlywoodBoxResult]);

  return {
    activeTab,
    setActiveTab,
    dims: activeState.dims,
    rates: activeState.rates,
    parts: activeState.parts,
    result: activeResult,
    updateDim,
    updateRate,
    changeUnit,
    loadPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion,
    resetParts,
    // Expose all individual states and results for preview sheets
    pineWoodBox: { dims: pineWoodBoxState.dims, rates: pineWoodBoxState.rates, result: pineWoodBoxResult },
    plyWoodPallet: { dims: plyWoodPalletState.dims, rates: plyWoodPalletState.rates, result: plyWoodPalletResult },
    pineWoodPallet: { dims: pineWoodPalletState.dims, rates: pineWoodPalletState.rates, result: pineWoodPalletResult },
    pinePlywoodBox: { dims: pinePlywoodBoxState.dims, rates: pinePlywoodBoxState.rates, result: pinePlywoodBoxResult },
  };
}
