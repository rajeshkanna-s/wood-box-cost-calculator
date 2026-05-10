import { inchToMm } from './cft';

export function getReperType(lengthInch) {
  if (lengthInch >= 100) return 26;
  if (lengthInch >= 60)  return 22;
  return 18;
}

export function buildParts(lengthInch, widthInch, heightInch) {
  const Lmm = inchToMm(lengthInch);
  const Wmm = inchToMm(widthInch);
  const Hmm = inchToMm(heightInch);
  const reperType = getReperType(lengthInch);

  const qty_TR_LG = reperType >= 22 ? 3 : 2;
  const qty_SR    = reperType >= 22 ? 6 : 4;
  // 26-reper uses qty 4 TR/LG and 8 SR
  const qty_TR_LG_26 = reperType === 26 ? 4 : qty_TR_LG;
  const qty_SR_26    = reperType === 26 ? 8 : qty_SR;

  return [
    { id: 'TOP',  label: 'Top/Bottom Panel',  l: Lmm + 100, w: Wmm + 40,  h: 16, qty: 2 },
    { id: 'SIDE', label: 'Long Side Panel',   l: Lmm + 100, w: Hmm,       h: 16, qty: 2 },
    { id: 'ENS',  label: 'End Panel',         l: Wmm,       w: Hmm,       h: 16, qty: 2 },
    { id: 'TR',   label: 'Top Rail',          l: Wmm + 40,  w: 75,        h: 19, qty: qty_TR_LG_26 },
    { id: 'LG',   label: 'Leg',               l: Wmm + 40,  w: 100,       h: 75, qty: qty_TR_LG_26 },
    { id: 'SR',   label: 'Side Rail',         l: Hmm + 150, w: 75,        h: 19, qty: qty_SR_26 },
    { id: 'ER',   label: 'End Rail',          l: Hmm,       w: 75,        h: 19, qty: 6 },
    { id: 'ES',   label: 'End Stringer',      l: Wmm,       w: 75,        h: 19, qty: 4 },
  ];
}
