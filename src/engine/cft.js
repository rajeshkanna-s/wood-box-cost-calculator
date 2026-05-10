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
};

export function calcBoxCost(parts, rates = DEFAULT_RATES) {
  const {
    cftRate, labour, nail, transport, packing, clamp, profitPct, wastePct
  } = { ...DEFAULT_RATES, ...rates };

  const partsWithCFT = parts.map(p => ({
    ...p,
    cft: p.isExcluded ? 0 : calcCFT(p.l, p.w, p.h, p.qty)
  }));

  const totalCFT  = partsWithCFT.reduce((s, p) => s + p.cft, 0);
  const vestCFT   = totalCFT * (wastePct / 100);
  const billable  = totalCFT + vestCFT;

  const woodCost      = billable * cftRate;
  const labourCost    = billable * labour;
  const nailCost      = billable * nail;
  const transportCost = billable * transport;
  const packingCost   = billable * packing;
  const clampCost     = billable * clamp;

  const subtotal   = woodCost + labourCost + nailCost
                   + transportCost + packingCost + clampCost;
  const profit     = subtotal * (profitPct / 100);
  const finalTotal = subtotal + profit;

  return {
    partsWithCFT,
    totalCFT, vestCFT, billable,
    woodCost, labourCost, nailCost,
    transportCost, packingCost, clampCost,
    subtotal, profitPct, profit, finalTotal
  };
}
