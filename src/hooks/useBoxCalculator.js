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
  const getGeneratedParts = (tab, l, w, h, unit, thicknessOverride) => {
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

    const Lmm = Math.round(lIn * 25.4);
    const Wmm = Math.round(wIn * 25.4);
    const Hmm = Math.round(hIn * 25.4);

    if (tab === 'ply-wood-pallet') {
      const key = `${Lmm}x${Wmm}x${Hmm}`;
      if (key === '1140x1180x195') {
        return [
          { id: 'TOP',  label: 'Top Ply Deck (TOP)',   l: 1140, w: 1180, h: 12, qty: 1, isPly: true },
          { id: 'LEG',  label: 'Leg Ply Planks (LEG)', l: 1140, w: 90,  h: 12, qty: 3, isPly: true },
          { id: 'BL',   label: 'Chip Blocks (BL)',      l: 90,  w: 90,  h: 90,  qty: 9, isPly: false },
        ];
      }
      if (key === '980x1140x135') {
        return [
          { id: 'TOP',  label: 'Top Ply Deck (TOP)',   l: 980,  w: 1140, h: 12, qty: 1, isPly: true },
          { id: 'LEG',  label: 'Leg Ply Planks (LEG)', l: 1140, w: 90,  h: 12, qty: 3, isPly: true },
          { id: 'BACK1', label: 'Back Ply Planks (BACK-1)', l: 980, w: 90,  h: 12, qty: 2, isPly: true },
          { id: 'BACK2', label: 'Back Ply Planks (BACK-2)', l: 960, w: 90,  h: 12, qty: 3, isPly: true },
          { id: 'BL1',  label: 'Chip Blocks (BL-1)',    l: 130, w: 90,  h: 90,  qty: 6, isPly: false },
          { id: 'BL2',  label: 'Chip Blocks (BL-2)',    l: 90,  w: 90,  h: 90,  qty: 3, isPly: false },
        ];
      }
      if (key === '1490x1100x135') {
        return [
          { id: 'TOP',  label: 'Top Ply Deck (TOP)',   l: 1490, w: 1100, h: 12, qty: 1, isPly: true },
          { id: 'LEG',  label: 'Leg Ply Planks (LEG)', l: 1100, w: 90,  h: 12, qty: 4, isPly: true },
          { id: 'BACK1', label: 'Back Ply Planks (BACK-1)', l: 1490, w: 90,  h: 12, qty: 2, isPly: true },
          { id: 'BACK2', label: 'Back Ply Planks (BACK-2)', l: 920, w: 90,  h: 12, qty: 4, isPly: true },
          { id: 'BL1',  label: 'Chip Blocks (BL-1)',    l: 130, w: 90,  h: 90,  qty: 8, isPly: false },
          { id: 'BL2',  label: 'Chip Blocks (BL-2)',    l: 90,  w: 90,  h: 90,  qty: 3, isPly: false },
        ];
      }
    }

    switch (tab) {
      case 'pine-wood-box':
        return buildPineWoodBoxParts(lIn, wIn, hIn);
      case 'ply-wood-pallet':
        return buildPlywoodPalletParts(lIn, wIn, hIn);
      case 'pine-wood-pallet':
        return buildPineWoodPalletParts(lIn, wIn, hIn, thicknessOverride);
      case 'pine-plywood-box':
        return buildPinePlywoodBoxParts(lIn, wIn, hIn);
      default:
        return [];
    }
  };

  const mergeParts = (prevParts, nextParts) => {
    if (!prevParts || prevParts.length === 0) return nextParts;
    const prevMap = {};
    prevParts.forEach(p => {
      prevMap[p.id] = p;
    });
    const merged = nextParts.map(nextPart => {
      const prevPart = prevMap[nextPart.id];
      if (prevPart) {
        if (nextPart.isPly) {
          return {
            ...nextPart,
            qty: prevPart.qty !== undefined ? prevPart.qty : nextPart.qty,
            h: prevPart.h !== undefined ? prevPart.h : nextPart.h,
          };
        } else {
          return {
            ...nextPart,
            qty: prevPart.qty !== undefined ? prevPart.qty : nextPart.qty,
            w: prevPart.w !== undefined ? prevPart.w : nextPart.w,
            h: prevPart.h !== undefined ? prevPart.h : nextPart.h,
          };
        }
      }
      return nextPart;
    });
    const customParts = prevParts.filter(p => p.isCustom || p.id.includes('CUSTOM'));
    const customPartsFiltered = customParts.filter(cp => !merged.some(mp => mp.id === cp.id));
    return [...merged, ...customPartsFiltered];
  };

  // Update dimensions and trigger auto-regeneration of parts
  const updateDim = (key, val) => {
    const numVal = Number(val) || 0;
    activeSetter(prev => {
      const nextDims = { ...prev.dims, [key]: numVal };
      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit, nextDims.th);
      const mergedParts = mergeParts(prev.parts, nextParts);
      return {
        ...prev,
        dims: nextDims,
        parts: mergedParts
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
          th: prev.dims.th
        };
      }

      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit, nextDims.th);
      const mergedParts = mergeParts(prev.parts, nextParts);

      return {
        ...prev,
        dims: nextDims,
        parts: mergedParts
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
        h: preset.h,
        th: preset.th || undefined
      };
      const nextParts = getGeneratedParts(activeTab, nextDims.l, nextDims.w, nextDims.h, nextDims.unit, preset.th);

      // Preset-specific rates for plywood pallet to match spreadsheets exactly
      let nextRates = prev.rates;
      if (activeTab === 'ply-wood-pallet') {
        const key = `${preset.l}x${preset.w}x${preset.h}`;
        if (key === '1200x1100x195') {
          nextRates = {
            ...prev.rates,
            cftRate: 590,
            sftRate: 38,
            woodLabour: 190,
            plyLabour: 5,
            woodNail: 50,
            plyNail: 1,
            woodPlaining: 5,
            plyPlaining: 1,
            woodEB: 3,
            plyEB: 1,
            woodLoading: 3,
            plyLoading: 1,
            wastePctWood: 5,
            wastePctPly: 7,
            profitPct: 20
          };
        } else if (key === '1140x1180x195') {
          nextRates = {
            ...prev.rates,
            cftRate: 600,
            sftRate: 38,
            woodLabour: 200,
            plyLabour: 5,
            woodNail: 50,
            plyNail: 1,
            woodPlaining: 10,
            plyPlaining: 1,
            woodEB: 5,
            plyEB: 1,
            woodLoading: 4,
            plyLoading: 1,
            wastePctWood: 5,
            wastePctPly: 7,
            profitPct: 20
          };
        } else if (key === '980x1140x135') {
          nextRates = {
            ...prev.rates,
            cftRate: 590,
            sftRate: 38,
            woodLabour: 190,
            plyLabour: 5,
            woodNail: 50,
            plyNail: 1,
            woodPlaining: 15,
            plyPlaining: 0,
            woodEB: 5,
            plyEB: 0,
            woodLoading: 40,
            plyLoading: 0,
            wastePctWood: 5,
            wastePctPly: 10,
            profitPct: 20
          };
        } else if (key === '1490x1100x135') {
          nextRates = {
            ...prev.rates,
            cftRate: 590,
            sftRate: 38,
            woodLabour: 190,
            plyLabour: 5,
            woodNail: 50,
            plyNail: 1,
            woodPlaining: 15,
            plyPlaining: 0,
            woodEB: 5,
            plyEB: 0,
            woodLoading: 40,
            plyLoading: 0,
            wastePctWood: 5,
            wastePctPly: 10,
            profitPct: 20
          };
        }
      } else if (activeTab === 'pine-wood-pallet') {
        const th = preset.th || 17;
        const key = `${preset.l}x${preset.w}x${preset.h}x${th}`;
        const pineWoodPalletRateOverrides = {
          // Sheet1 (17mm) overrides
          '1140x1080x130x17': { transport: 30 },
          '1150x1150x150x22': { transport: 60 },
          '950x1150x150x22':  { transport: 60 },
          '1000x1050x150x22': { transport: 60 },
          '1150x950x150x22':  { transport: 55, profitPct: 15 },
          // Sheet3 (16mm, 130mm height) overrides
          '1140x1080x130x16': { transport: 30, profitPct: 15 },
          // Sheet4 (16mm, 150mm height) overrides
          '1150x1150x150x16': { transport: 60 },
          '950x1150x150x16':  { transport: 60 },
          '1000x1050x150x16': { transport: 60 },
          '1150x950x150x16':  { transport: 55 },
        };
        const overrides = pineWoodPalletRateOverrides[key];
        if (overrides) {
          nextRates = { ...DEFAULT_PINE_WOOD_PALLET_RATES, ...overrides };
        } else {
          // Reset to defaults for presets without overrides
          nextRates = { ...DEFAULT_PINE_WOOD_PALLET_RATES };
        }
      } else if (activeTab === 'pine-plywood-box') {
        const key = `${preset.l}x${preset.w}x${preset.h}`;
        const ppbRateOverrides = {
          // Preset 1: 1140x800x195 - matches defaults exactly
          // Preset 2,3: 1170x810x370 / 1170x810x480 - woodLabour=150
          '1170x810x370': { woodLabour: 150 },
          '1170x810x480': { woodLabour: 150 },
          // Preset 4: 1540x590x1000 - sftRate=38, plyLabour=10, woodLabour=200, loading=10
          '1540x590x1000': { sftRate: 38, plyLabour: 10, woodLabour: 200, woodLoading: 10 },
          // Preset 5: 1730x590x1000 - sftRate=38, plyLabour=10, woodLabour=200, ht=10, loading=10
          '1730x590x1000': { sftRate: 38, plyLabour: 10, woodLabour: 200, woodHT: 10, woodLoading: 10 },
          // Preset 6: 1920x590x1000 - sftRate=38, plyLabour=10, ht=10, loading=10
          '1920x590x1000': { sftRate: 38, plyLabour: 10, woodHT: 10, woodLoading: 10 },
          // Presets 7-9: x785 variants - sftRate=38, plyLabour=10, ht=10, loading=10
          '1540x785x1000': { sftRate: 38, plyLabour: 10, woodHT: 10, woodLoading: 10 },
          '1730x785x1000': { sftRate: 38, plyLabour: 10, woodHT: 10, woodLoading: 10 },
          '1920x785x1000': { sftRate: 38, plyLabour: 10, woodHT: 10, woodLoading: 10 },
          // Preset 10: 2170x500x600 - cftRate=800, plyLabour=10, ht=10, loading=10
          '2170x500x600': { cftRate: 800, plyLabour: 10, woodHT: 10, woodLoading: 10 },
        };
        const overrides = ppbRateOverrides[key];
        if (overrides) {
          nextRates = { ...DEFAULT_PINE_PLYWOOD_BOX_RATES, ...overrides };
        } else {
          nextRates = { ...DEFAULT_PINE_PLYWOOD_BOX_RATES };
        }
      }

      return {
        ...prev,
        dims: nextDims,
        rates: nextRates,
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
