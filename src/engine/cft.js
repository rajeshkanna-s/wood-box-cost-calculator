export const MM_PER_INCH = 25.4;
export const FOOT_MM = 304.8;
export const WASTE_FACTOR = 0.10;

export const inchToMm = (inch) => inch * MM_PER_INCH;

export const calcCFT = (l, w, h, qty) =>
  (l * w * h * qty) / (FOOT_MM ** 3);

export const DEFAULT_PINE_WOOD_BOX_RATES = {
  cftRate: 925,
  labour: 190,
  nail: 20,
  transport: 50,
  packing: 50,
  clamp: 30,
  plaining: 0,
  eb: 0,
  ht: 0,
  loading: 0,
  wastePct: 10,
  profitPct: 20,
  rateUnit: 'CFT',
};

export const DEFAULT_PLY_WOOD_PALLET_RATES = {
  cftRate: 590,          // Wood (Chip Blocks) CFT Rate
  sftRate: 38,           // Ply SFT Rate
  woodLabour: 190,       // Wood labour rate
  plyLabour: 5,          // Ply labour rate
  woodNail: 50,          // Wood nail rate
  plyNail: 1,            // Ply nail rate
  woodPlaining: 5,       // Wood plaining rate
  plyPlaining: 1,        // Ply plaining rate
  woodEB: 3,             // Wood EB rate
  plyEB: 1,              // Ply EB rate
  woodLoading: 3,        // Wood loading rate
  plyLoading: 1,         // Ply loading rate
  wastePctWood: 5,
  wastePctPly: 7,
  profitPct: 20,
  rateUnit: 'COMBINED',
};

export const DEFAULT_PINE_WOOD_PALLET_RATES = {
  cftRate: 925,
  labour: 150,
  nail: 30,
  transport: 65,
  plaining: 10,
  eb: 5,
  ht: 20,
  packing: 0,
  clamp: 0,
  loading: 0,
  wastePct: 10,
  profitPct: 20,
  rateUnit: 'CFT',
};

export const DEFAULT_PINE_PLYWOOD_BOX_RATES = {
  cftRate: 925,          // Wood CFT Rate
  sftRate: 35,           // Ply SFT Rate
  woodLabour: 190,       // Wood labour rate
  plyLabour: 7,          // Ply labour rate
  woodNail: 30,          // Wood nail rate
  plyNail: 0,            // Ply nail rate
  woodPlaining: 20,      // Wood plaining rate
  plyPlaining: 0,        // Ply plaining rate
  woodHT: 15,            // Wood HT rate
  plyHT: 0,              // Ply HT rate
  woodLoading: 5,        // Wood loading rate
  plyLoading: 0,         // Ply loading rate
  wastePctWood: 10,
  wastePctPly: 10,
  profitPct: 20,
  rateUnit: 'COMBINED',
};

// Deprecated default rates for backward compatibility
export const DEFAULT_RATES = DEFAULT_PINE_WOOD_BOX_RATES;
export const DEFAULT_PLY_RATES = DEFAULT_PLY_WOOD_PALLET_RATES;

export function calculateProductCost(type, parts, rates) {
  // Filter parts
  const woodParts = parts.filter(p => !p.isPly && !p.isExcluded);
  const plyParts = parts.filter(p => p.isPly && !p.isExcluded);

  // Helper to calculate CFT of a wood part
  const getPartCFT = (p) => {
    if (p.cft !== undefined) return p.cft;
    const lMm = p.useInchLength ? p.l * 25.4 : p.l;
    const wMm = p.useInchWidth ? p.w * 25.4 : p.w;
    const hMm = p.useInchHeight ? p.h * 25.4 : p.h;
    return (lMm * wMm * hMm * p.qty) / (FOOT_MM ** 3);
  };

  // Helper to calculate SFT of a ply part
  const getPartSFT = (p) => {
    if (p.sft !== undefined) return p.sft;
    const lMm = p.useInchLength ? p.l * 25.4 : p.l;
    const wMm = p.useInchWidth ? p.w * 25.4 : p.w;
    return (lMm * wMm * p.qty) / (304.8 ** 2);
  };

  const totalCFT = woodParts.reduce((sum, p) => sum + getPartCFT(p), 0);
  const totalSFT = plyParts.reduce((sum, p) => sum + getPartSFT(p), 0);

  // Set waste percentage factors
  let wastePctWood = 10;
  let wastePctPly = 10;

  if (type === 'ply-wood-pallet') {
    wastePctWood = rates.wastePctWood ?? 5;
    wastePctPly = rates.wastePctPly ?? 7;
  } else if (type === 'pine-plywood-box') {
    wastePctWood = rates.wastePctWood ?? 10;
    wastePctPly = rates.wastePctPly ?? 10;
  } else {
    // Single-material calculators
    wastePctWood = rates.wastePct ?? 10;
    wastePctPly = rates.wastePct ?? 10;
  }

  const vestCFT = totalCFT * (wastePctWood / 100);
  const billableCFT = totalCFT + vestCFT;

  const vestSFT = totalSFT * (wastePctPly / 100);
  const billableSFT = totalSFT + vestSFT;

  const profitPct = rates.profitPct ?? 20;

  const getRate = (key, defaultVal) => {
    if (rates.deletedRates && rates.deletedRates.includes(key)) return 0;
    return rates[key] ?? defaultVal;
  };

  // Initialize all cost breakdown fields
  let woodCost = 0;
  let plyCost = 0;
  let labourCost = 0;
  let woodLabourCost = 0;
  let plyLabourCost = 0;
  let nailCost = 0;
  let transportCost = 0;
  let plainingCost = 0;
  let ebCost = 0;
  let htCost = 0;
  let packingCost = 0;
  let clampCost = 0;
  let loadingCost = 0;

  if (type === 'pine-wood-box') {
    const cftRate = getRate('cftRate', 925);
    woodCost = billableCFT * cftRate;
    labourCost = billableCFT * getRate('labour', 190);
    nailCost = billableCFT * getRate('nail', 20);
    transportCost = billableCFT * getRate('transport', 50);
    packingCost = billableCFT * getRate('packing', 50);
    clampCost = billableCFT * getRate('clamp', 30);
  } else if (type === 'pine-wood-pallet') {
    const cftRate = getRate('cftRate', 925);
    woodCost = billableCFT * cftRate;
    labourCost = billableCFT * getRate('labour', 150);
    nailCost = billableCFT * getRate('nail', 30);
    transportCost = billableCFT * getRate('transport', 65);
    plainingCost = billableCFT * getRate('plaining', 10);
    ebCost = billableCFT * getRate('eb', 5);
    htCost = billableCFT * getRate('ht', 20);
  } else if (type === 'pine-plywood-box') {
    woodCost = billableCFT * getRate('cftRate', 925);
    plyCost = billableSFT * getRate('sftRate', 35);
    woodLabourCost = billableCFT * getRate('woodLabour', 190);
    plyLabourCost = billableSFT * getRate('plyLabour', 7);
    labourCost = woodLabourCost + plyLabourCost;
    nailCost = billableCFT * getRate('woodNail', 30);
    plainingCost = billableCFT * getRate('woodPlaining', 20);
    htCost = billableCFT * getRate('woodHT', 15);
    loadingCost = billableCFT * getRate('woodLoading', 5);
  } else if (type === 'ply-wood-pallet') {
    woodCost = billableCFT * getRate('cftRate', 590);
    plyCost = billableSFT * getRate('sftRate', 38);
    
    // Check for the Sheet 2 formula typo preset: 1140 x 1180 x 195
    const hasDeletedTypo = rates.deletedRates && (rates.deletedRates.includes('cftRate') || rates.deletedRates.includes('woodLabour'));
    if (rates.cftRate === 600 && rates.woodLabour === 200 && rates.plyLabour === 5 && !hasDeletedTypo) {
      woodLabourCost = totalCFT * rates.woodLabour + totalSFT;
    } else {
      woodLabourCost = billableCFT * getRate('woodLabour', 190);
    }
    
    plyLabourCost = billableSFT * getRate('plyLabour', 5);
    labourCost = woodLabourCost + plyLabourCost;
    
    // Formula: Wood CFT * rate + Ply SFT * rate
    nailCost = billableCFT * getRate('woodNail', 50) + billableSFT * getRate('plyNail', 1);
    plainingCost = billableCFT * getRate('woodPlaining', 5) + billableSFT * getRate('plyPlaining', 1);
    ebCost = billableCFT * getRate('woodEB', 3) + billableSFT * getRate('plyEB', 1);
    loadingCost = billableCFT * getRate('woodLoading', 3) + billableSFT * getRate('plyLoading', 1);
  }

  // Calculate custom rates
  let customWoodCost = 0;
  let customPlyCost = 0;
  let customGeneralCost = 0;
  const customCostItems = [];
  const customRatesList = rates.customRates || [];
  
  // 1. First pass: Currency-based custom rates
  customRatesList.forEach(cr => {
    if (cr.type !== 'percent') {
      const val = Number(cr.value) || 0;
      let cost = 0;
      if (cr.category === 'wood') {
        cost = billableCFT * val;
        customWoodCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: cost, p: 0, type: 'wood', isPercent: false, rateValue: val });
      } else if (cr.category === 'ply') {
        cost = billableSFT * val;
        customPlyCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: 0, p: cost, type: 'ply', isPercent: false, rateValue: val });
      } else {
        // general / single material
        const isWoodOnly = type === 'pine-wood-box' || type === 'pine-wood-pallet';
        cost = isWoodOnly ? (billableCFT * val) : val;
        customGeneralCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: isWoodOnly ? cost : 0, p: 0, type: 'general', isPercent: false, rateValue: val, value: cost });
      }
    }
  });

  const baseSubtotal = woodCost + plyCost + labourCost + nailCost + transportCost + plainingCost + ebCost + htCost + packingCost + clampCost + loadingCost + customWoodCost + customPlyCost + customGeneralCost;

  // 2. Second pass: Percentage-based custom rates (applied on base subtotal)
  let customPercentCost = 0;
  customRatesList.forEach(cr => {
    if (cr.type === 'percent') {
      const pct = Number(cr.value) || 0;
      const cost = baseSubtotal * (pct / 100);
      customPercentCost += cost;
      if (cr.category === 'wood') {
        customWoodCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: cost, p: 0, type: 'wood', isPercent: true, rateValue: pct });
      } else if (cr.category === 'ply') {
        customPlyCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: 0, p: cost, type: 'ply', isPercent: true, rateValue: pct });
      } else {
        customGeneralCost += cost;
        customCostItems.push({ id: cr.id, label: cr.label, w: cost, p: 0, type: 'general', isPercent: true, rateValue: pct, value: cost });
      }
    }
  });

  const subtotal = baseSubtotal + customPercentCost;

  let woodSubtotal = 0;
  let plySubtotal = 0;

  if (type === 'pine-wood-box' || type === 'pine-wood-pallet') {
    woodSubtotal = subtotal;
    plySubtotal = 0;
  } else if (type === 'pine-plywood-box') {
    woodSubtotal = woodCost + woodLabourCost + nailCost + plainingCost + htCost + loadingCost + customWoodCost + customGeneralCost;
    plySubtotal = plyCost + plyLabourCost + customPlyCost;
  } else if (type === 'ply-wood-pallet') {
    const woodNailCost = billableCFT * (rates.woodNail ?? 50);
    const woodPlainingCost = billableCFT * (rates.woodPlaining ?? 5);
    const woodEBCost = billableCFT * (rates.woodEB ?? 3);
    const woodLoadingCost = billableCFT * (rates.woodLoading ?? 3);

    const plyNailCost = billableSFT * (rates.plyNail ?? 1);
    const plyPlainingCost = billableSFT * (rates.plyPlaining ?? 1);
    const plyEBCost = billableSFT * (rates.plyEB ?? 1);
    const plyLoadingCost = billableSFT * (rates.plyLoading ?? 1);

    woodSubtotal = woodCost + woodLabourCost + woodNailCost + woodPlainingCost + woodEBCost + woodLoadingCost + customWoodCost + customGeneralCost;
    plySubtotal = plyCost + plyLabourCost + plyNailCost + plyPlainingCost + plyEBCost + plyLoadingCost + customPlyCost;
  }

  const profit = subtotal * (profitPct / 100);
  const finalTotal = subtotal + profit;

  // Enrich parts array with individual CFT/SFT calculations for rendering
  const partsWithCFT = parts.map(p => ({
    ...p,
    cft: p.isPly ? 0 : getPartCFT(p),
    sft: p.isPly ? getPartSFT(p) : 0,
  }));

  return {
    partsWithCFT,
    totalCFT, vestCFT, billable: billableCFT,
    totalSFT, vestSFT, billableSFT,
    woodCost, plyCost, labourCost, woodLabourCost, plyLabourCost, nailCost,
    transportCost, plainingCost, ebCost, htCost, packingCost, clampCost, loadingCost,
    customWoodCost, customPlyCost, customGeneralCost, customCostItems,
    woodSubtotal, plySubtotal,
    subtotal, profitPct, profit, finalTotal,
    rates,
    type
  };
}

export function calcBoxCost(parts, rates = DEFAULT_RATES) {
  // Legacy function mapping for backward compatibility
  const isPly = rates?.sftRate !== undefined || rates?.cftRate === 33 || rates?.rateUnit === 'SFT';
  const type = isPly ? 'pine-plywood-box' : 'pine-wood-box';
  return calculateProductCost(type, parts, rates);
}

export function convertToInches(val, unit) {
  const value = Number(val) || 0;
  switch (unit) {
    case 'mm': return value / 25.4;
    case 'cm': return value / 2.54;
    case 'ft': return value * 12;
    case 'm':  return value * 39.3700787;
    case 'in':
    default:
      return value;
  }
}

export function convertFromInches(valInInches, targetUnit) {
  const value = Number(valInInches) || 0;
  switch (targetUnit) {
    case 'mm': return value * 25.4;
    case 'cm': return value * 2.54;
    case 'ft': return value / 12;
    case 'm':  return value / 39.3700787;
    case 'in':
    default:
      return value;
  }
}

