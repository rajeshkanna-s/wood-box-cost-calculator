export const MM_PER_INCH = 25.4;
export const FOOT_MM = 304.8;
export const WASTE_FACTOR = 0.10;

export const inchToMm = (inch) => inch * MM_PER_INCH;

export const calcCFT = (l, w, h, qty) =>
  (l * w * h * qty) / (FOOT_MM ** 3);

export const DEFAULT_RATES = {
  cftRate:   925,
  labour:    200,
  nail:      20,
  transport: 50,
  packing:   50,
  clamp:     30,
  profitPct: 20,
  wastePct:  10,
  rateUnit:  'CFT',
};

export const DEFAULT_PLY_RATES = {
  cftRate:   33,
  labour:    7,
  nail:      2,
  transport: 3,
  packing:   2,
  clamp:     0,
  profitPct: 15,
  wastePct:  10,
  rateUnit:  'SFT',
};


export function calcBoxCost(parts, rates = DEFAULT_RATES) {
  const isPly = rates?.cftRate === 33 || rates?.rateUnit === 'SFT';
  const defaults = isPly ? DEFAULT_PLY_RATES : DEFAULT_RATES;

  const getRateValue = (key, defaultVal) => {
    if (rates && key in rates) {
      const val = rates[key];
      return (val === null || val === undefined) ? 0 : val;
    }
    return defaultVal;
  };

  const cftRate = getRateValue('cftRate', defaults.cftRate);
  const labour = getRateValue('labour', defaults.labour);
  const nail = getRateValue('nail', defaults.nail);
  const transport = getRateValue('transport', defaults.transport);
  const packing = getRateValue('packing', defaults.packing);
  const clamp = getRateValue('clamp', defaults.clamp);
  const profitPct = getRateValue('profitPct', defaults.profitPct);
  const wastePct = getRateValue('wastePct', defaults.wastePct);
  const rateUnit = rates?.rateUnit || defaults.rateUnit;

  const partsWithCFT = parts.map(p => {
    const lMm = p.useInchLength ? p.l * 25.4 : p.l;
    const wMm = p.useInchWidth ? p.w * 25.4 : p.w;
    const calcArea = (lMm * wMm * p.qty) / (304.8 ** 2);
    
    return {
      ...p,
      cft: p.isExcluded ? 0 : (p.cft !== undefined ? p.cft : calcCFT(p.l, p.w, p.h, p.qty)),
      sft: p.isExcluded ? 0 : (p.sft !== undefined ? p.sft : calcArea)
    };
  });

  const totalCFT  = partsWithCFT.reduce((s, p) => s + p.cft, 0);
  const vestCFT   = totalCFT * (wastePct / 100);
  const billable  = totalCFT + vestCFT;

  const totalSFT  = partsWithCFT.reduce((s, p) => s + p.sft, 0);
  const vestSFT   = totalSFT * (wastePct / 100);
  const billableSFT = totalSFT + vestSFT;

  const isAreaRate = rateUnit === 'SFT' || rateUnit === 'SFT of 4 NOS';
  const woodCost      = isAreaRate ? (billableSFT * cftRate) : (billable * cftRate);

  const hasKey = (key) => rates === null || rates === undefined || (key in rates && rates[key] !== null && rates[key] !== undefined);

  const labourCost    = hasKey('labour') ? (isAreaRate ? (billableSFT * labour) : (billable * labour)) : 0;
  const nailCost      = hasKey('nail') ? (isAreaRate ? (billableSFT * nail) : (billable * nail)) : 0;
  const transportCost = hasKey('transport') ? (isAreaRate ? (billableSFT * transport) : (billable * transport)) : 0;
  const packingCost   = hasKey('packing') ? (isAreaRate ? (billableSFT * packing) : (billable * packing)) : 0;
  const clampCost     = hasKey('clamp') ? (isAreaRate ? (billableSFT * clamp) : (billable * clamp)) : 0;

  // Calculate custom rates
  const customRates = rates?.customRates || [];
  let customSubtotal = 0;
  let customProfitTotal = 0;
  const customCosts = {};

  customRates.forEach(cr => {
    if (!cr.label || !cr.value) return;
    if (cr.type === 'currency' || !cr.type) {
      const cost = isAreaRate ? (billableSFT * cr.value) : (billable * cr.value);
      customSubtotal += cost;
      customCosts[cr.label] = cost;
    }
  });

  const subtotal   = woodCost + labourCost + nailCost
                   + transportCost + packingCost + clampCost
                   + customSubtotal;

  const standardProfit = hasKey('profitPct') ? (subtotal * (profitPct / 100)) : 0;

  customRates.forEach(cr => {
    if (!cr.label || !cr.value) return;
    if (cr.type === 'percent') {
      const cost = subtotal * (cr.value / 100);
      customProfitTotal += cost;
      customCosts[cr.label] = cost;
    }
  });

  const profit = standardProfit + customProfitTotal;
  const finalTotal = subtotal + profit;

  return {
    partsWithCFT,
    totalCFT, vestCFT, billable,
    totalSFT, vestSFT, billableSFT,
    woodCost, labourCost, nailCost,
    transportCost, packingCost, clampCost,
    customCosts,
    rates,
    subtotal, profitPct, profit, finalTotal
  };
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
