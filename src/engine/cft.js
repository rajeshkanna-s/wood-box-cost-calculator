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
    wastePctWood = rates.wastePctWood !== undefined ? rates.wastePctWood : 5;
    wastePctPly = rates.wastePctPly !== undefined ? rates.wastePctPly : 7;
  } else if (type === 'pine-plywood-box') {
    wastePctWood = rates.wastePctWood !== undefined ? rates.wastePctWood : 10;
    wastePctPly = rates.wastePctPly !== undefined ? rates.wastePctPly : 10;
  } else {
    // Single-material calculators
    wastePctWood = rates.wastePct !== undefined ? rates.wastePct : 10;
    wastePctPly = rates.wastePct !== undefined ? rates.wastePct : 10;
  }

  const vestCFT = totalCFT * (wastePctWood / 100);
  const billableCFT = totalCFT + vestCFT;

  const vestSFT = totalSFT * (wastePctPly / 100);
  const billableSFT = totalSFT + vestSFT;

  const profitPct = rates.profitPct !== undefined ? rates.profitPct : 20;

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
    const cftRate = rates.cftRate ?? 925;
    woodCost = billableCFT * cftRate;
    labourCost = billableCFT * (rates.labour ?? 190);
    nailCost = billableCFT * (rates.nail ?? 20);
    transportCost = billableCFT * (rates.transport ?? 50);
    packingCost = billableCFT * (rates.packing ?? 50);
    clampCost = billableCFT * (rates.clamp ?? 30);
  } else if (type === 'pine-wood-pallet') {
    const cftRate = rates.cftRate ?? 925;
    woodCost = billableCFT * cftRate;
    labourCost = billableCFT * (rates.labour ?? 150);
    nailCost = billableCFT * (rates.nail ?? 30);
    transportCost = billableCFT * (rates.transport ?? 65);
    plainingCost = billableCFT * (rates.plaining ?? 10);
    ebCost = billableCFT * (rates.eb ?? 5);
    htCost = billableCFT * (rates.ht ?? 20);
  } else if (type === 'pine-plywood-box') {
    woodCost = billableCFT * (rates.cftRate ?? 925);
    plyCost = billableSFT * (rates.sftRate ?? 35);
    woodLabourCost = billableCFT * (rates.woodLabour ?? 190);
    plyLabourCost = billableSFT * (rates.plyLabour ?? 7);
    labourCost = woodLabourCost + plyLabourCost;
    nailCost = billableCFT * (rates.woodNail ?? 30);
    plainingCost = billableCFT * (rates.woodPlaining ?? 20);
    htCost = billableCFT * (rates.woodHT ?? 15);
    loadingCost = billableCFT * (rates.woodLoading ?? 5);
  } else if (type === 'ply-wood-pallet') {
    woodCost = billableCFT * (rates.cftRate ?? 590);
    plyCost = billableSFT * (rates.sftRate ?? 38);
    woodLabourCost = billableCFT * (rates.woodLabour ?? 190);
    plyLabourCost = billableSFT * (rates.plyLabour ?? 5);
    labourCost = woodLabourCost + plyLabourCost;
    
    // Formula: Wood CFT * rate + Ply SFT * rate
    nailCost = billableCFT * (rates.woodNail ?? 50) + billableSFT * (rates.plyNail ?? 1);
    plainingCost = billableCFT * (rates.woodPlaining ?? 5) + billableSFT * (rates.plyPlaining ?? 1);
    ebCost = billableCFT * (rates.woodEB ?? 3) + billableSFT * (rates.plyEB ?? 1);
    loadingCost = billableCFT * (rates.woodLoading ?? 3) + billableSFT * (rates.plyLoading ?? 1);
  }

  const subtotal = woodCost + plyCost + labourCost + nailCost + transportCost + plainingCost + ebCost + htCost + packingCost + clampCost + loadingCost;
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

