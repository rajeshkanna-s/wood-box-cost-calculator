import { useState, useMemo, useEffect, useRef } from 'react';
import { buildParts } from '../engine/parts';
import { calcBoxCost, DEFAULT_RATES, convertToInches, convertFromInches } from '../engine/cft';

const TEXT_PART_FIELDS = new Set(['id', 'label']);

export function useBoxCalculator(initialDims = { l: 75, w: 35, h: 35, unit: 'in' }) {
  const [useWood, setUseWood] = useState(true);
  const [usePly, setUsePly] = useState(true);
  const [linkDims, setLinkDims] = useState(false);

  const [woodDims, setWoodDims] = useState(initialDims);
  const [woodRates, setWoodRates] = useState(DEFAULT_RATES);
  const [woodParts, setWoodParts] = useState(() => {
    const lInches = convertToInches(initialDims.l, initialDims.unit || 'in');
    const wInches = convertToInches(initialDims.w, initialDims.unit || 'in');
    const hInches = convertToInches(initialDims.h, initialDims.unit || 'in');
    return buildParts(lInches, wInches, hInches);
  });

  const [plyDims, setPlyDims] = useState(() => {
    const isMm = initialDims.unit === 'mm';
    return {
      unit: 'mm',
      l: isMm ? initialDims.l : Number((initialDims.l * 25.4).toFixed(2)),
      w: isMm ? initialDims.w : Number((initialDims.w * 25.4).toFixed(2)),
      h: isMm ? initialDims.h : Number((initialDims.h * 25.4).toFixed(2)),
    };
  });
  const [plyRates, setPlyRates] = useState(() => ({ ...DEFAULT_RATES, rateUnit: 'CFT' }));
  const [plyParts, setPlyParts] = useState(() => {
    const lInches = convertToInches(initialDims.l, initialDims.unit || 'in');
    const wInches = convertToInches(initialDims.w, initialDims.unit || 'in');
    const hInches = convertToInches(initialDims.h, initialDims.unit || 'in');
    return buildParts(lInches, wInches, hInches);
  });

  const skipWoodPartsRegen = useRef(false);

  // Auto-regenerate standard wood parts ONLY when wood dimensions change
  useEffect(() => {
    if (skipWoodPartsRegen.current) {
      skipWoodPartsRegen.current = false;
      return;
    }
    const lInches = convertToInches(woodDims.l, woodDims.unit || 'in');
    const wInches = convertToInches(woodDims.w, woodDims.unit || 'in');
    const hInches = convertToInches(woodDims.h, woodDims.unit || 'in');
    setWoodParts(buildParts(lInches, wInches, hInches));
  }, [woodDims.l, woodDims.w, woodDims.h, woodDims.unit]);

  // Auto-regenerate standard ply parts ONLY when ply dimensions change
  useEffect(() => {
    const lInches = convertToInches(plyDims.l, plyDims.unit || 'in');
    const wInches = convertToInches(plyDims.w, plyDims.unit || 'in');
    const hInches = convertToInches(plyDims.h, plyDims.unit || 'in');
    setPlyParts(buildParts(lInches, wInches, hInches));
  }, [plyDims.l, plyDims.w, plyDims.h, plyDims.unit]);

  const updateWoodDim = (key, val) => {
    const numVal = Number(val) || 0;
    setWoodDims(d => {
      const next = { ...d, [key]: numVal };
      if (linkDims) {
        setPlyDims(p => ({ ...p, [key]: numVal }));
      }
      return next;
    });
  };

  const updatePlyDim = (key, val) => {
    const numVal = Number(val) || 0;
    setPlyDims(d => {
      const next = { ...d, [key]: numVal };
      if (linkDims) {
        setWoodDims(w => ({ ...w, [key]: numVal }));
      }
      return next;
    });
  };

  const changeWoodUnit = (newUnit) => {
    setWoodDims(d => {
      const oldUnit = d.unit || 'in';
      if (oldUnit === newUnit) return d;
      const lInches = convertToInches(d.l, oldUnit);
      const wInches = convertToInches(d.w, oldUnit);
      const hInches = convertToInches(d.h, oldUnit);
      const next = {
        unit: newUnit,
        l: Number(convertFromInches(lInches, newUnit).toFixed(2)),
        w: Number(convertFromInches(wInches, newUnit).toFixed(2)),
        h: Number(convertFromInches(hInches, newUnit).toFixed(2)),
      };
      if (linkDims) {
        setPlyDims(next);
      }
      return next;
    });
  };

  const changePlyUnit = (newUnit) => {
    setPlyDims(d => {
      const oldUnit = d.unit || 'in';
      if (oldUnit === newUnit) return d;
      const lInches = convertToInches(d.l, oldUnit);
      const wInches = convertToInches(d.w, oldUnit);
      const hInches = convertToInches(d.h, oldUnit);
      const next = {
        unit: newUnit,
        l: Number(convertFromInches(lInches, newUnit).toFixed(2)),
        w: Number(convertFromInches(wInches, newUnit).toFixed(2)),
        h: Number(convertFromInches(hInches, newUnit).toFixed(2)),
      };
      if (linkDims) {
        setWoodDims(next);
      }
      return next;
    });
  };

  const updateWoodRate = (key, val) => setWoodRates(r => ({ ...r, [key]: key === 'rateUnit' ? val : (Number(val) || 0) }));
  const updatePlyRate = (key, val) => setPlyRates(r => ({ ...r, [key]: key === 'rateUnit' ? val : (Number(val) || 0) }));

  const loadPreset = (preset, customParts = null) => {
    if (customParts) {
      skipWoodPartsRegen.current = true;
      setWoodParts(customParts);
    }
    const targetUnitWood = preset.unit || woodDims.unit || 'in';
    const hasUnit = preset.unit !== undefined;
    setWoodDims({
      unit: targetUnitWood,
      l: hasUnit ? preset.l : Number(convertFromInches(preset.l, targetUnitWood).toFixed(2)),
      w: hasUnit ? preset.w : Number(convertFromInches(preset.w, targetUnitWood).toFixed(2)),
      h: hasUnit ? preset.h : Number(convertFromInches(preset.h, targetUnitWood).toFixed(2)),
    });
  };

  const loadPlyPreset = (preset) => {
    const targetUnitPly = plyDims.unit || 'in';
    const lInches = preset.l / 25.4;
    const wInches = preset.w / 25.4;
    const hInches = preset.h / 25.4;
    setPlyDims({
      unit: targetUnitPly,
      l: Number(convertFromInches(lInches, targetUnitPly).toFixed(2)),
      w: Number(convertFromInches(wInches, targetUnitPly).toFixed(2)),
      h: Number(convertFromInches(hInches, targetUnitPly).toFixed(2)),
    });
  };

  // Manual part override functions
  const updatePart = (type, index, field, value) => {
    const setter = type === 'wood' ? setWoodParts : setPlyParts;
    setter(prevParts => {
      const newParts = [...prevParts];
      const nextValue = TEXT_PART_FIELDS.has(field) ? value : Number(value) || 0;
      newParts[index] = { ...newParts[index], [field]: nextValue };
      return newParts;
    });
  };

  const addCustomPart = (type) => {
    const setter = type === 'wood' ? setWoodParts : setPlyParts;
    setter(prevParts => [
      ...prevParts, 
      { id: 'CUSTOM', label: 'Custom Part', l: 0, w: 0, h: 0, qty: 1, isCustom: true, isExcluded: false }
    ]);
  };

  const removePart = (type, index) => {
    const setter = type === 'wood' ? setWoodParts : setPlyParts;
    setter(prevParts => prevParts.filter((_, i) => i !== index));
  };

  const togglePartExclusion = (type, index) => {
    const setter = type === 'wood' ? setWoodParts : setPlyParts;
    setter(prevParts => {
      const newParts = [...prevParts];
      newParts[index] = { ...newParts[index], isExcluded: !newParts[index].isExcluded };
      return newParts;
    });
  };

  const woodResult = useMemo(() => {
    return calcBoxCost(woodParts, woodRates);
  }, [woodParts, woodRates]);

  const plyResult = useMemo(() => {
    return calcBoxCost(plyParts, plyRates);
  }, [plyParts, plyRates]);

  const result = useMemo(() => {
    if (useWood && !usePly) {
      return woodResult;
    }
    if (!useWood && usePly) {
      return plyResult;
    }
    const finalTotal = (woodResult.finalTotal || 0) + (plyResult.finalTotal || 0);
    return {
      wood: woodResult,
      ply: plyResult,
      finalTotal,
    };
  }, [useWood, usePly, woodResult, plyResult]);

  return { 
    useWood, setUseWood,
    usePly, setUsePly,
    linkDims, setLinkDims,
    woodDims, woodRates, woodParts, woodResult,
    plyDims, plyRates, plyParts, plyResult,
    result, 
    updateWoodDim, updatePlyDim,
    updateWoodRate, updatePlyRate,
    changeWoodUnit, changePlyUnit,
    loadPreset,
    loadPlyPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion
  };
}
