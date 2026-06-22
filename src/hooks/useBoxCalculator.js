import { useState, useMemo, useEffect, useRef } from 'react';
import { buildParts, buildPlyParts, buildPresetWoodFramingParts, buildPresetBlockPalletParts } from '../engine/parts';
import { calcBoxCost, DEFAULT_RATES, DEFAULT_PLY_RATES, convertToInches, convertFromInches } from '../engine/cft';

const TEXT_PART_FIELDS = new Set(['id', 'label']);

export function useBoxCalculator(initialDims = { l: 75, w: 35, h: 35, unit: 'in' }, options = {}) {
  const isPresetTab = options.isPresetTab || false;

  const [useWood, setUseWood] = useState(true);
  const [usePly, setUsePly] = useState(true);
  const [linkDims, setLinkDims] = useState(false);

  const [woodDims, setWoodDims] = useState(initialDims);
  const [woodRates, setWoodRates] = useState(DEFAULT_RATES);
  const [woodParts, setWoodParts] = useState(() => {
    const lInches = convertToInches(initialDims.l, initialDims.unit || 'in');
    const wInches = convertToInches(initialDims.w, initialDims.unit || 'in');
    const hInches = convertToInches(initialDims.h, initialDims.unit || 'in');
    if (isPresetTab) {
      return buildPresetWoodFramingParts(lInches, wInches, hInches);
    }
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
  const [plyRates, setPlyRates] = useState(DEFAULT_PLY_RATES);
  const [plyParts, setPlyParts] = useState(() => {
    const lInches = convertToInches(initialDims.l, initialDims.unit || 'in');
    const wInches = convertToInches(initialDims.w, initialDims.unit || 'in');
    const hInches = convertToInches(initialDims.h, initialDims.unit || 'in');
    return buildPlyParts(lInches, wInches, hInches);
  });

  const skipWoodPartsRegen = useRef(false);

  // On presets tab, keep plyDims synchronized with woodDims when usePly is active
  useEffect(() => {
    if (isPresetTab && usePly) {
      setPlyDims(p => {
        if (p.l === woodDims.l && p.w === woodDims.w && p.h === woodDims.h && p.unit === woodDims.unit) {
          return p;
        }
        return {
          unit: woodDims.unit,
          l: woodDims.l,
          w: woodDims.w,
          h: woodDims.h
        };
      });
    }
  }, [isPresetTab, usePly, woodDims.l, woodDims.w, woodDims.h, woodDims.unit]);

  // Auto-regenerate standard wood parts ONLY when wood dimensions change or usePly changes
  useEffect(() => {
    if (skipWoodPartsRegen.current) {
      skipWoodPartsRegen.current = false;
      return;
    }
    const lInches = convertToInches(woodDims.l, woodDims.unit || 'in');
    const wInches = convertToInches(woodDims.w, woodDims.unit || 'in');
    const hInches = convertToInches(woodDims.h, woodDims.unit || 'in');
    if (isPresetTab) {
      if (usePly) {
        setWoodParts(buildPresetWoodFramingParts(lInches, wInches, hInches));
      } else {
        setWoodParts(buildPresetBlockPalletParts(lInches, wInches, hInches));
      }
    } else {
      setWoodParts(buildParts(lInches, wInches, hInches));
    }
  }, [woodDims.l, woodDims.w, woodDims.h, woodDims.unit, usePly]);

  // Auto-regenerate standard ply parts ONLY when ply dimensions change or usePly changes
  useEffect(() => {
    if (isPresetTab && !usePly) {
      setPlyParts([]);
      return;
    }
    if (plyDims.unit === 'sft') {
      const thicknessMm = plyDims.h || 12;
      const areaSqFt = plyDims.l || 0;
      const thicknessFt = (thicknessMm / 25.4) / 12;
      const cft = areaSqFt * thicknessFt;
      setPlyParts([
        { id: 'PLY', label: 'Plywood (Direct SFT Input)', l: 0, w: 0, h: thicknessMm, qty: 1, cft: cft, sft: areaSqFt }
      ]);
      return;
    }
    const lInches = convertToInches(plyDims.l, plyDims.unit || 'in');
    const wInches = convertToInches(plyDims.w, plyDims.unit || 'in');
    const hInches = convertToInches(plyDims.h, plyDims.unit || 'in');
    setPlyParts(buildPlyParts(lInches, wInches, hInches));
  }, [plyDims.l, plyDims.w, plyDims.h, plyDims.unit, usePly]);

  // Automatically adjust rates and parameters for the presets tab to match Excel formulas
  useEffect(() => {
    if (!isPresetTab) return;

    if (usePly) {
      // Combined Plywood Box Mode (-01.xlsx)
      const Lmm = woodDims.unit === 'mm' ? woodDims.l : convertFromInches(convertToInches(woodDims.l, woodDims.unit), 'mm');
      const Hmm = woodDims.unit === 'mm' ? woodDims.h : convertFromInches(convertToInches(woodDims.h, woodDims.unit), 'mm');

      let plySqRate = 33;
      let plyLabour = 7;
      let woodLabour = 190;
      let profitPct = 15;
      let htRate = 15;
      let loadingRate = 5;

      if (Lmm <= 1200) {
        plySqRate = 33;
        plyLabour = 7;
        woodLabour = 190;
        loadingRate = 5;
        if (Hmm <= 250) {
          profitPct = 13;
        } else {
          profitPct = 15;
        }
      } else {
        plySqRate = 38;
        plyLabour = 10;
        woodLabour = 200;
        loadingRate = 10;
        profitPct = 15;
        if (Lmm >= 1700) {
          htRate = 10;
        } else {
          htRate = 15;
        }
      }

      setPlyRates({
        cftRate: plySqRate,
        labour: plyLabour,
        nail: 0,
        transport: 0,
        packing: 0,
        clamp: 0,
        profitPct: profitPct,
        wastePct: 10,
        rateUnit: 'SFT',
        customRates: []
      });

      setWoodRates({
        cftRate: 925,
        labour: woodLabour,
        nail: 30,
        transport: 0,
        packing: 0,
        clamp: 0,
        profitPct: profitPct,
        wastePct: 10,
        rateUnit: 'CFT',
        customRates: [
          { id: 'plaining', label: 'Plaining', value: 20, type: 'currency' },
          { id: 'ht', label: 'HT', value: htRate, type: 'currency' },
          { id: 'loading', label: 'Loading', value: loadingRate, type: 'currency' }
        ]
      });
    } else {
      // Pine Wood only block pallet (-02.xlsx)
      const Lmm = woodDims.unit === 'mm' ? woodDims.l : convertFromInches(convertToInches(woodDims.l, woodDims.unit), 'mm');
      const Wmm = woodDims.unit === 'mm' ? woodDims.w : convertFromInches(convertToInches(woodDims.w, woodDims.unit), 'mm');
      const Hmm = woodDims.unit === 'mm' ? woodDims.h : convertFromInches(convertToInches(woodDims.h, woodDims.unit), 'mm');

      let transportRate = 65;
      if (Lmm === 1140 && Wmm === 1080 && Hmm === 130) {
        transportRate = 30;
      } else if (Lmm === 1150 && Wmm === 950 && Hmm === 150) {
        transportRate = 55;
      } else if (Hmm > 135) {
        transportRate = 60;
      } else {
        transportRate = 65;
      }

      setWoodRates({
        cftRate: 925,
        labour: 150,
        nail: 30,
        transport: transportRate,
        packing: 0,
        clamp: 0,
        profitPct: 15,
        wastePct: 10,
        rateUnit: 'CFT',
        customRates: [
          { id: 'plaining', label: 'Plaining', value: 10, type: 'currency' },
          { id: 'eb', label: 'EB', value: 5, type: 'currency' },
          { id: 'ht', label: 'HT', value: 20, type: 'currency' }
        ]
      });
    }
  }, [woodDims.l, woodDims.w, woodDims.h, woodDims.unit, usePly, isPresetTab]);

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

      // Handle transitions involving 'sft'
      if (newUnit === 'sft') {
        setPlyRates(r => ({ ...r, rateUnit: 'SFT' }));
        const lInches = convertToInches(d.l, oldUnit);
        const wInches = convertToInches(d.w, oldUnit);
        const hInches = convertToInches(d.h, oldUnit);
        const initialSFT = Number(((2 * (lInches * wInches + wInches * hInches + lInches * hInches)) / 144).toFixed(2));
        const thicknessMm = Math.round(convertFromInches(hInches, 'mm')) || 12;
        return {
          unit: 'sft',
          l: initialSFT,
          w: 0,
          h: thicknessMm
        };
      }

      if (oldUnit === 'sft') {
        const isMm = newUnit === 'mm';
        const next = {
          unit: newUnit,
          l: isMm ? 1140 : 45,
          w: isMm ? 1080 : 32,
          h: isMm ? 120 : 5,
        };
        if (linkDims) {
          setWoodDims(next);
        }
        return next;
      }

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

  const updateWoodRate = (key, val) => setWoodRates(r => ({ ...r, [key]: (key === 'rateUnit' || key === 'customRates') ? val : (val === null || val === undefined ? null : (Number(val) || 0)) }));
  const updatePlyRate = (key, val) => setPlyRates(r => ({ ...r, [key]: (key === 'rateUnit' || key === 'customRates') ? val : (val === null || val === undefined ? null : (Number(val) || 0)) }));

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
    if (targetUnitPly === 'sft') {
      const lInches = preset.l / 25.4;
      const wInches = preset.w / 25.4;
      const hInches = preset.h / 25.4;
      const presetSFT = Number(((2 * (lInches * wInches + wInches * hInches + lInches * hInches)) / 144).toFixed(2));
      const thicknessMm = preset.h || 12;
      setPlyDims({
        unit: 'sft',
        l: presetSFT,
        w: 0,
        h: thicknessMm
      });
      return;
    }
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
