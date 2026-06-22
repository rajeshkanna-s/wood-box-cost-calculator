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

export function buildPlyParts(lengthInch, widthInch, heightInch) {
  const Lmm = inchToMm(lengthInch);
  const Wmm = inchToMm(widthInch);
  const Hmm = inchToMm(heightInch);

  return [
    { id: 'TOP',  label: 'Top/Bottom Panel',  l: Math.round(Lmm + 100), w: Math.round(Wmm + 80),  h: 12, qty: 2 },
    { id: 'SIDE', label: 'Long Side Panel',   l: Math.round(Lmm + 100), w: Math.round(Hmm + 40),  h: 12, qty: 2 },
    { id: 'ENS',  label: 'End Panel',         l: Math.round(Wmm),       w: Math.round(Hmm + 40),  h: 12, qty: 2 },
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
    { id: 'TR',    label: 'Top Reaper (TR)',          l: Lmm + 100, w: reaperWidth, h: 19, qty: 2 },
    { id: 'TS',    label: 'Top Support (TS)',         l: Wmm + 80,  w: reaperWidth, h: 19, qty: tsQty },
    { id: 'BR',    label: 'Bottom Reaper (BR)',       l: Lmm + 100, w: reaperWidth, h: 19, qty: brQty }
  ];

  if (brWQty > 0) {
    parts.push({ id: 'BR-W', label: 'Bottom Reaper W (BR)', l: Wmm + 80, w: reaperWidth, h: 19, qty: brWQty });
  }

  parts.push({ id: 'BBS-1', label: 'Bottom Support 1 (BBS)', l: Wmm + 80, w: reaperWidth, h: 19, qty: bbs1Qty });

  if (bbs2Qty > 0) {
    parts.push({ id: 'BBS-2', label: 'Bottom Support 2 (BBS)', l: Wmm + 80, w: reaperWidth, h: 19, qty: bbs2Qty });
  }

  parts.push(
    { id: 'SR',    label: 'Side Reaper (SR)',         l: Lmm + 100, w: reaperWidth, h: 19, qty: 4 },
    { id: 'SS',    label: 'Side Support (SS)',        l: Hmm + 40,  w: reaperWidth, h: 19, qty: ssQty },
    { id: 'ER',    label: 'End Reaper (ER)',          l: Wmm,       w: reaperWidth, h: 19, qty: erQty },
    { id: 'ES',    label: 'End Support (ES)',         l: Hmm + 40,  w: reaperWidth, h: 19, qty: esQty },
    { id: 'BL',    label: 'Leg Block (BL)',           l: 100,       w: 100,        h: 90, qty: blQty }
  );

  return parts;
}

export function buildPresetBlockPalletParts(lengthInch, widthInch, heightInch) {
  const Lmm = Math.round(inchToMm(lengthInch));
  const Wmm = Math.round(inchToMm(widthInch));
  const Hmm = Math.round(inchToMm(heightInch));

  // Check for specific sheet preset: Section 5 of Sheet1 (1140 x 1080 x 130)
  if (Lmm === 1140 && Wmm === 1080 && Hmm === 130) {
    return [
      { id: 'TOP',   label: 'Top Planks (TOP)',         l: 1140, w: 75, h: 16, qty: 7 },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: 1080, w: 75, h: 17, qty: 3 },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: 1140, w: 75, h: 16, qty: 3 },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 75,   w: 75, h: 78, qty: 9 }
    ];
  }

  // Check for specific sheet preset: Section 5/6 of Sheet2 (1150 x 950 x 150)
  if (Lmm === 1150 && Wmm === 950 && Hmm === 150) {
    return [
      { id: 'TOP-1', label: 'Top Planks 1 (TOP)',       l: 1200, w: 100, h: 22, qty: 3 },
      { id: 'TOP-2', label: 'Top Planks 2 (TOP)',       l: 1200, w: 75,  h: 22, qty: 4 },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: 1000, w: 100, h: 22, qty: 3 },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: 1200, w: 75,  h: 22, qty: 6 },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 150,  w: 100, h: 90, qty: 9 }
    ];
  }

  if (Hmm <= 135) {
    // Sheet 1 default
    return [
      { id: 'TOP',   label: 'Top Planks (TOP)',         l: Lmm + 50, w: 100, h: 17, qty: 7 },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: Wmm + 50, w: 100, h: 17, qty: 3 },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: Lmm + 50, w: 100, h: 17, qty: 3 },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 100,      w: 100, h: 78, qty: 9 }
    ];
  } else {
    // Sheet 2 default
    return [
      { id: 'TOP',   label: 'Top Planks (TOP)',         l: Lmm + 50, w: 100, h: 22, qty: 7 },
      { id: 'LEG',   label: 'Leg Planks (LEG)',         l: Wmm + 50, w: 100, h: 22, qty: 3 },
      { id: 'BACK',  label: 'Back Planks (BACK)',       l: Lmm + 50, w: 100, h: 22, qty: 3 },
      { id: 'BLOOK', label: 'Leg Blocks (BLOOK)',       l: 100,      w: 100, h: 85, qty: 9 }
    ];
  }
}
