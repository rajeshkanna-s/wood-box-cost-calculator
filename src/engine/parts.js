import { inchToMm } from './cft';

export function getReperType(lengthInch) {
  if (lengthInch >= 100) return 26;
  if (lengthInch >= 60)  return 22;
  return 18;
}

export function buildPineWoodBoxParts(lengthInch, widthInch, heightInch) {
  const Lmm = inchToMm(lengthInch);
  const Wmm = inchToMm(widthInch);
  const Hmm = inchToMm(heightInch);
  const reperType = getReperType(lengthInch);

  const qty_TR_LG = reperType >= 22 ? 3 : 2;
  const qty_SR    = reperType >= 22 ? 6 : 4;
  const qty_TR_LG_26 = reperType === 26 ? 4 : qty_TR_LG;
  const qty_SR_26    = reperType === 26 ? 8 : qty_SR;

  return [
    { id: 'TOP',  label: 'Top/Bottom Panel',  l: Lmm + 100, w: Wmm + 40,  h: 16, qty: 2, isPly: false },
    { id: 'SIDE', label: 'Long Side Panel',   l: Lmm + 100, w: Hmm,       h: 16, qty: 2, isPly: false },
    { id: 'ENS',  label: 'End Panel',         l: Wmm,       w: Hmm,       h: 16, qty: 2, isPly: false },
    { id: 'TR',   label: 'Top Rail',          l: Wmm + 40,  w: 75,        h: 19, qty: qty_TR_LG_26, isPly: false },
    { id: 'LG',   label: 'Leg',               l: Wmm + 40,  w: 100,       h: 75, qty: qty_TR_LG_26, isPly: false },
    { id: 'SR',   label: 'Side Rail',         l: Hmm + 150, w: 75,        h: 19, qty: qty_SR_26, isPly: false },
    { id: 'ER',   label: 'End Rail',          l: Hmm,       w: 75,        h: 19, qty: 6, isPly: false },
    { id: 'ES',   label: 'End Stringer',      l: Wmm,       w: 75,        h: 19, qty: 4, isPly: false },
  ];
}

export function buildPlywoodPalletParts(lengthInch, widthInch, heightInch) {
  const Lmm = Math.round(inchToMm(lengthInch));
  const Wmm = Math.round(inchToMm(widthInch));
  const Hmm = Math.round(inchToMm(heightInch));
  const plyThickness = 12;
  const blockHeight = 90;
  
  return [
    { id: 'TOP',  label: 'Top Ply Deck (TOP)',   l: Lmm, w: Wmm, h: plyThickness, qty: 1, isPly: true },
    { id: 'LEG',  label: 'Leg Ply Planks (LEG)', l: Lmm, w: 90,  h: plyThickness, qty: 3, isPly: true },
    { id: 'BACK', label: 'Back Ply Planks (BACK)', l: Wmm, w: 90,  h: plyThickness, qty: 3, isPly: true },
    { id: 'BL',   label: 'Chip Blocks (BL)',      l: 90,  w: 90,  h: blockHeight,  qty: 9, isPly: false },
  ];
}

export function buildPineWoodPalletParts(lengthInch, widthInch, heightInch) {
  const Lmm = Math.round(inchToMm(lengthInch));
  const Wmm = Math.round(inchToMm(widthInch));
  const Hmm = Math.round(inchToMm(heightInch));
  
  const thickness = Hmm <= 135 ? 17 : 22;
  const blockHeight = Hmm > 100 ? Hmm - (3 * thickness) : (Hmm <= 135 ? 78 : 85);
  
  // Custom configurations for specific sizes in excel
  if (Lmm === 1140 && Wmm === 1080 && Hmm === 130) {
    return [
      { id: 'TOP',   label: 'Top Planks (TOP)',         l: 1140, w: 75, h: 17, qty: 7, isPly: false },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: 1080, w: 75, h: 17, qty: 3, isPly: false },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: 1140, w: 75, h: 17, qty: 3, isPly: false },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 75,   w: 75, h: 78, qty: 9, isPly: false }
    ];
  }
  
  if (Lmm === 1150 && Wmm === 950 && Hmm === 150) {
    return [
      { id: 'TOP-1', label: 'Top Planks 1 (TOP)',       l: 1200, w: 100, h: 22, qty: 3, isPly: false },
      { id: 'TOP-2', label: 'Top Planks 2 (TOP)',       l: 1200, w: 75,  h: 22, qty: 4, isPly: false },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: 1000, w: 100, h: 22, qty: 3, isPly: false },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: 1200, w: 75,  h: 22, qty: 6, isPly: false },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 150,  w: 100, h: 90, qty: 9, isPly: false }
    ];
  }

  return [
    { id: 'TOP',   label: 'Top Planks (TOP)',   l: Lmm + 50, w: 100, h: thickness, qty: 7, isPly: false },
    { id: 'LEG',   label: 'Leg Planks (LEG)',   l: Wmm + 50, w: 100, h: thickness, qty: 3, isPly: false },
    { id: 'BACK',  label: 'Back Planks (BACK)', l: Lmm + 50, w: 100, h: thickness, qty: 3, isPly: false },
    { id: 'BLOOK', label: 'Leg Blocks (BLOOK)', l: 100,      w: 100, h: blockHeight, qty: 9, isPly: false }
  ];
}

export function buildPresetWoodFramingParts(lengthInch, widthInch, heightInch) {
  const Lmm = Math.round(inchToMm(lengthInch));
  const Wmm = Math.round(inchToMm(widthInch));
  const Hmm = Math.round(inchToMm(heightInch));

  // Determine reaper width and support quantities based on Lmm
  const reaperWidth = Lmm > 1200 ? 100 : 75;
  const tsQty = Lmm > 1200 ? 4 : 3;
  const ssQty = Lmm > 1200 ? 8 : 6;
  const blQty = Lmm > 1200 ? 12 : 9;

  // Determine bottom support / reaper quantities and end support/reaper quantities
  let brQty, brWQty, bbs1Qty, bbs2Qty, erQty, esQty;

  if (Lmm <= 1200) {
    if (Hmm <= 250) {
      brQty = 5;
      brWQty = 0;
      bbs1Qty = 3;
      bbs2Qty = 3;
      erQty = 6;
      esQty = 6;
    } else {
      brQty = 2;
      brWQty = 3;
      bbs1Qty = 3;
      bbs2Qty = 3;
      erQty = 4;
      esQty = 4;
    }
  } else {
    brQty = 4;
    brWQty = 4;
    bbs1Qty = 4;
    bbs2Qty = 0;
    erQty = 4;
    esQty = 4;
  }

  const parts = [
    { id: 'TR',    label: 'Top Reaper (TR)',          l: Lmm + 100, w: reaperWidth, h: 19, qty: 2, isPly: false },
    { id: 'TS',    label: 'Top Support (TS)',         l: Wmm + 80,  w: reaperWidth, h: 19, qty: tsQty, isPly: false },
    { id: 'BR',    label: 'Bottom Reaper (BR)',       l: Lmm + 100, w: reaperWidth, h: 19, qty: brQty, isPly: false }
  ];

  if (brWQty > 0) {
    parts.push({ id: 'BR-W', label: 'Bottom Reaper W (BR)', l: Wmm + 80, w: reaperWidth, h: 19, qty: brWQty, isPly: false });
  }

  parts.push({ id: 'BBS-1', label: 'Bottom Support 1 (BBS)', l: Wmm + 80, w: reaperWidth, h: 19, qty: bbs1Qty, isPly: false });

  if (bbs2Qty > 0) {
    parts.push({ id: 'BBS-2', label: 'Bottom Support 2 (BBS)', l: Wmm + 80, w: reaperWidth, h: 19, qty: bbs2Qty, isPly: false });
  }

  parts.push(
    { id: 'SR',    label: 'Side Reaper (SR)',         l: Lmm + 100, w: reaperWidth, h: 19, qty: 4, isPly: false },
    { id: 'SS',    label: 'Side Support (SS)',        l: Hmm + 40,  w: reaperWidth, h: 19, qty: ssQty, isPly: false },
    { id: 'ER',    label: 'End Reaper (ER)',          l: Wmm,       w: reaperWidth, h: 19, qty: erQty, isPly: false },
    { id: 'ES',    label: 'End Support (ES)',         l: Hmm + 40,  w: reaperWidth, h: 19, qty: esQty, isPly: false },
    { id: 'BL',    label: 'Leg Block (BL)',           l: 100,       w: 100,        h: 90, qty: blQty, isPly: false }
  );

  return parts;
}

export function buildPinePlywoodBoxParts(lengthInch, widthInch, heightInch) {
  const Lmm = Math.round(inchToMm(lengthInch));
  const Wmm = Math.round(inchToMm(widthInch));
  const Hmm = Math.round(inchToMm(heightInch));
  
  const plyParts = [
    { id: 'PLY-TOP',  label: 'Plywood Top/Bottom (TOP)',  l: Lmm + 100, w: Wmm + 80,  h: 12, qty: 2, isPly: true },
    { id: 'PLY-SIDE', label: 'Plywood Side (SIDE)',       l: Lmm + 100, w: Hmm + 40,  h: 12, qty: 2, isPly: true },
    { id: 'PLY-ENS',  label: 'Plywood Ends (ENS)',        l: Wmm,       w: Hmm + 40,  h: 12, qty: 2, isPly: true },
  ];
  
  const woodParts = buildPresetWoodFramingParts(lengthInch, widthInch, heightInch);
  return [...plyParts, ...woodParts];
}

// Backward compatibility legacy mappings
export const buildParts = buildPineWoodBoxParts;
export const buildPlyParts = (l, w, h) => [
  { id: 'TOP',  label: 'Top/Bottom Panel',  l: Math.round(inchToMm(l) + 100), w: Math.round(inchToMm(w) + 80),  h: 12, qty: 2, isPly: true },
  { id: 'SIDE', label: 'Long Side Panel',   l: Math.round(inchToMm(l) + 100), w: Math.round(inchToMm(h) + 40),  h: 12, qty: 2, isPly: true },
  { id: 'ENS',  label: 'End Panel',         l: Math.round(inchToMm(w)),       w: Math.round(inchToMm(h) + 40),  h: 12, qty: 2, isPly: true },
];
export const buildPresetBlockPalletParts = buildPineWoodPalletParts;
