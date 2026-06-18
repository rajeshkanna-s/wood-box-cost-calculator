// Database of pre-negotiated corporate client presets, cut sheets, and fixed prices

// Helper to convert inches to millimeters for default parts calculations
const inchToMm = (inch) => inch * 25.4;

// Helper to dynamically generate realistic parts list fallbacks for client presets that don't have custom parts arrays
export function generateDefaultParts(productName, l, w, h, unit) {
  const Lmm = unit === 'in' ? inchToMm(l) : l;
  const Wmm = unit === 'in' ? inchToMm(w) : w;
  const Hmm = unit === 'in' ? inchToMm(h) : h;

  const isPallet = productName.toLowerCase().includes('pallet');
  if (isPallet) {
    // Standard block pallet parts
    return [
      { id: 'TOP', label: 'TOP PLANKS', l: Math.round(Lmm), w: 75, h: 16, qty: 5 },
      { id: 'LEG-PL', label: 'LEG PLANKS', l: Math.round(Wmm), w: 75, h: 16, qty: 3 },
      { id: 'BACK', label: 'BACK PLANKS', l: Math.round(Lmm), w: 75, h: 16, qty: 3 },
      { id: 'BLK', label: 'BLOCKS', l: 75, w: 75, h: 75, qty: 9 }
    ];
  } else {
    // Standard box parts
    return [
      { id: 'TOP', label: 'Top/Bottom Panel', l: Math.round(Lmm), w: Math.round(Wmm), h: 12, qty: 2 },
      { id: 'SIDE', label: 'Long Side Panel', l: Math.round(Lmm), w: Math.round(Hmm), h: 16, qty: 2 },
      { id: 'ENS', label: 'End Panel', l: Math.round(Wmm), w: Math.round(Hmm), h: 16, qty: 2 },
      { id: 'RUN', label: 'Runners', l: Math.round(Lmm), w: 90, h: 90, qty: 3 }
    ];
  }
}

export const CLIENT_PRESETS = [
  {
    id: 'ntn',
    companyName: 'NTN',
    products: [
      {
        id: 'ntn-1',
        name: 'PINEWOOD PALLET',
        sizeLabel: '1140 × 1080 × 120 mm',
        l: 1140,
        w: 1080,
        h: 120,
        unit: 'mm',
        price: 1020,
        parts: [
          { id: 'TOP', label: 'TOP PLANKS', l: 1140, w: 75, h: 16, qty: 7 },
          { id: 'BACK', label: 'BACK PLANKS', l: 1140, w: 75, h: 16, qty: 3 },
          { id: 'LEG-PL', label: 'LEG PLANKS', l: 1080, w: 75, h: 16, qty: 3 },
          { id: 'LEG', label: 'LEGS', l: 75, w: 75, h: 75, qty: 9 }
        ]
      }
    ]
  },
  {
    id: 'motherson',
    companyName: 'MOTHERSON',
    products: [
      {
        id: 'moth-1',
        name: 'M10 PINEWOOD PALLET',
        sizeLabel: '1100 × 750 × 125 mm',
        l: 1100,
        w: 750,
        h: 125,
        unit: 'mm',
        price: 650,
        parts: [
          { id: 'TOP', label: 'TOP', l: 1100, w: 75, h: 16, qty: 5 },
          { id: 'LEG-PL', label: 'LEG PLANK', l: 750, w: 75, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK PLANK', l: 750, w: 75, h: 16, qty: 3 },
          { id: 'BLK', label: 'BLOCKS', l: 75, w: 75, h: 75, qty: 9 }
        ]
      },
      {
        id: 'moth-2',
        name: 'M12 PINEWOOD PALLET',
        sizeLabel: '1190 × 760 × 126 mm',
        l: 1190,
        w: 760,
        h: 126,
        unit: 'mm',
        price: 865,
        parts: [
          { id: 'TOP', label: 'TOP', l: 1190, w: 75, h: 16, qty: 5 },
          { id: 'LEG-PL', label: 'LEG PLANK', l: 760, w: 75, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK PLANKS', l: 1190, w: 75, h: 16, qty: 3 },
          { id: 'BLK', label: 'BLOCKS', l: 75, w: 75, h: 75, qty: 9 }
        ]
      },
      {
        id: 'moth-3',
        name: 'M13 PINEWOOD PALLET',
        sizeLabel: '1100 × 750 × 125 mm',
        l: 1100,
        w: 750,
        h: 125,
        unit: 'mm',
        price: 720,
        parts: [
          { id: 'TOP', label: 'TOP', l: 1100, w: 75, h: 15, qty: 5 },
          { id: 'LEG-PL', label: 'LEG PLANK', l: 750, w: 75, h: 15, qty: 3 },
          { id: 'BACK', label: 'BACK PLANK', l: 1100, w: 75, h: 15, qty: 3 },
          { id: 'BLK', label: 'BLOCKS', l: 75, w: 75, h: 75, qty: 9 }
        ]
      },
      {
        id: 'moth-4',
        name: 'M18 PINEWOOD PALLET',
        sizeLabel: '900 × 630 × 125 mm',
        l: 900,
        w: 630,
        h: 125,
        unit: 'mm',
        price: 480,
        parts: [
          { id: 'TOP', label: 'TOP', l: 900, w: 75, h: 16, qty: 5 },
          { id: 'LEG-PL', label: 'LEG PLANK', l: 630, w: 75, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK PLANKS', l: 900, w: 75, h: 16, qty: 3 },
          { id: 'BLK', label: 'BLOCKS', l: 75, w: 75, h: 75, qty: 9 }
        ]
      }
    ]
  },
  {
    id: 'basf',
    companyName: 'BASF',
    products: [
      {
        id: 'basf-1',
        name: 'PLY AND PINEWOOD PALLET',
        sizeLabel: '45 × 32 × 5 in',
        l: 45,
        w: 32,
        h: 5,
        unit: 'in',
        price: 700,
        parts: [
          { id: 'TOP', label: 'TOP SCRAB (in/mm/mm)', l: 45, w: 75, h: 16, qty: 5, useInchLength: true },
          { id: 'LEG-PL', label: 'LEG PLANKS SCRAB (in/mm/mm)', l: 32, w: 75, h: 16, qty: 3, useInchLength: true },
          { id: 'BACK', label: 'BACK PLANK SCRAB (in/mm/mm)', l: 45, w: 75, h: 16, qty: 3, useInchLength: true },
          { id: 'BLK', label: 'BLOCK SCRAB (mm)', l: 75, w: 75, h: 90, qty: 9 }
        ]
      },
      {
        id: 'basf-2',
        name: 'PLY AND PINEWOOD PALLET',
        sizeLabel: '32 × 23 × 5 in',
        l: 32,
        w: 23,
        h: 5,
        unit: 'in',
        price: 490,
        parts: [
          { id: 'TOP', label: 'TOP SCRAB (in/mm/mm)', l: 32, w: 75, h: 16, qty: 4, useInchLength: true },
          { id: 'LEG-PL', label: 'LEG PLANKS SCRAB (in/mm/mm)', l: 23, w: 75, h: 16, qty: 3, useInchLength: true },
          { id: 'BACK', label: 'BACK PLANK SCRAB (in/mm/mm)', l: 23, w: 75, h: 16, qty: 3, useInchLength: true },
          { id: 'BLK', label: 'BLOCK SCRAB (mm)', l: 75, w: 75, h: 75, qty: 9 }
        ]
      },
      { id: 'basf-3', name: 'PINEWOOD CRATE', sizeLabel: '32 × 23 × 21 in', l: 32, w: 23, h: 21, unit: 'in', price: 1250 },
      { id: 'basf-4', name: 'PLYWOOD BOX', sizeLabel: '128 × 115 × 116 mm', l: 128, w: 115, h: 116, unit: 'mm', price: 6600 },
      { id: 'basf-5', name: 'PINEWOOD RUNNER', sizeLabel: '108 × 3 × 3 in', l: 108, w: 3, h: 3, unit: 'in', price: 690 },
      { id: 'basf-6', name: 'PLYWOOD SHEET', sizeLabel: '96 × 48 × 10 mm', l: 96, w: 48, h: 10, unit: 'mm', price: 1500 },
      { id: 'basf-7', name: 'PLYWOOD SHEET', sizeLabel: '97 × 48 × 14 mm', l: 97, w: 48, h: 14, unit: 'mm', price: 1700 }
    ]
  },
  {
    id: 'globin',
    companyName: 'GLOBIN',
    products: [
      { id: 'glob-1', name: 'PINEWOOD CRATE', sizeLabel: '1170 × 1050 × 1050 mm', l: 1170, w: 1050, h: 1050, unit: 'mm', price: 2900 },
      { id: 'glob-2', name: 'PINEWOOD PALLET', sizeLabel: '1140 × 980 × 130 mm', l: 1140, w: 980, h: 130, unit: 'mm', price: 1050 },
      { id: 'glob-3', name: 'PINEWOOD PALLET', sizeLabel: '1200 × 1000 × 145 mm', l: 1200, w: 1000, h: 145, unit: 'mm', price: 1630 },
      { id: 'glob-4', name: 'PINEWOOD PALLET', sizeLabel: '1220 × 1015 × 140 mm', l: 1220, w: 1015, h: 140, unit: 'mm', price: 1190 },
      { id: 'glob-5', name: 'EURO PALLET', sizeLabel: '1200 × 800 × 195 mm', l: 1200, w: 800, h: 195, unit: 'mm', price: 1040 },
      { id: 'glob-6', name: 'PINEWOOD PALLET', sizeLabel: '1160 × 1160 × 135 mm', l: 1160, w: 1160, h: 135, unit: 'mm', price: 1650 },
      { id: 'glob-7', name: 'PINEWOOD PALLET', sizeLabel: '1160 × 1160 × 120 mm', l: 1160, w: 1160, h: 120, unit: 'mm', price: 1000 },
      {
        id: 'glob-8',
        name: 'PINEWOOD PALLET',
        sizeLabel: '1200 × 1000 × 130 mm',
        l: 1200,
        w: 1000,
        h: 130,
        unit: 'mm',
        price: 1150,
        parts: [
          { id: 'TOP', label: 'TOP PLYWOOD', l: 1120, w: 1000, h: 15, qty: 1 },
          { id: 'LEG-PL', label: 'LEG PLY', l: 1000, w: 90, h: 15, qty: 3 },
          { id: 'BLK', label: 'COMPRESSED BLOCK', l: 90, w: 90, h: 90, qty: 9 }
        ]
      },
      {
        id: 'glob-9',
        name: 'PINEWOOD PALLET',
        sizeLabel: '840 × 740 × 130 mm',
        l: 840,
        w: 740,
        h: 130,
        unit: 'mm',
        price: 900,
        parts: [
          { id: 'TOP', label: 'TOP', l: 840, w: 75, h: 16, qty: 5 },
          { id: 'LEG', label: 'LEG', l: 740, w: 90, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK', l: 840, w: 75, h: 16, qty: 2 },
          { id: 'SUPP', label: 'SUPPORT PIECE', l: 590, w: 75, h: 16, qty: 3 },
          { id: 'LEG-B1', label: 'LEG BLOCK A', l: 115, w: 75, h: 90, qty: 6 },
          { id: 'LEG-B2', label: 'LEG BLOCK B', l: 75, w: 75, h: 90, qty: 3 }
        ]
      },
      { id: 'glob-10', name: 'PINEWOOD PALLET', sizeLabel: '1250 × 1250 × 135 mm', l: 1250, w: 1250, h: 135, unit: 'mm', price: 1420 },
      { id: 'glob-11', name: 'PINEWOOD PALLET', sizeLabel: '2250 × 850 × 140 mm', l: 2250, w: 850, h: 140, unit: 'mm', price: 2650 },
      { id: 'glob-12', name: 'SCRAB EURO PALLET', sizeLabel: '1200 × 800 × 145 mm', l: 1200, w: 800, h: 145, unit: 'mm', price: 890 },
      { id: 'glob-13', name: 'PINEWOOD BOX', sizeLabel: '980 × 825 × 900 mm', l: 980, w: 825, h: 900, unit: 'mm', price: 4200 },
      { id: 'glob-14', name: 'PINEWOOD BOX', sizeLabel: '1150 × 900 × 1100 mm', l: 1150, w: 900, h: 1100, unit: 'mm', price: 4600 },
      { id: 'glob-15', name: 'PINEWOOD BOX', sizeLabel: '1070 × 900 × 1070 mm', l: 1070, w: 900, h: 1070, unit: 'mm', price: 4300 },
      { id: 'glob-16', name: 'PINEWOOD BOX', sizeLabel: '1170 × 800 × 460 mm', l: 1170, w: 800, h: 460, unit: 'mm', price: 5000 }
    ]
  },
  {
    id: 'gurit',
    companyName: 'GURIT',
    products: [
      {
        id: 'guri-1',
        name: 'PLYWOOD BOX',
        sizeLabel: '2300 × 1250 × 100 mm',
        l: 2300,
        w: 1250,
        h: 100,
        unit: 'mm',
        price: 8150,
        parts: [
          { id: 'TOP', label: 'PLYWOOD TOP', l: 2300, w: 1250, h: 12, qty: 1 },
          { id: 'BOT', label: 'PLYWOOD BOTTOM', l: 2300, w: 1250, h: 12, qty: 1 },
          { id: 'SIDE', label: 'PINEWOOD SIDES', l: 2300, w: 100, h: 19, qty: 2 },
          { id: 'END', label: 'PINEWOOD ENDS', l: 1212, w: 100, h: 19, qty: 2 },
          { id: 'RUN', label: 'RUNNERS', l: 2300, w: 90, h: 90, qty: 3 }
        ]
      },
      { id: 'guri-2', name: 'PLYWOOD BOX', sizeLabel: '9700 × 700 × 400 mm', l: 9700, w: 700, h: 400, unit: 'mm', price: 55000 },
      { id: 'guri-3', name: 'PLYWOOD BOX', sizeLabel: '2000 × 1200 × 500 mm', l: 2000, w: 1200, h: 500, unit: 'mm', price: 14460 },
      { id: 'guri-4', name: 'PLYWOOD BOX', sizeLabel: '2750 × 410 × 150 mm', l: 2750, w: 410, h: 150, unit: 'mm', price: 8700 },
      { id: 'guri-5', name: 'PLYWOOD BOX', sizeLabel: '700 × 1000 × 1650 mm', l: 700, w: 1000, h: 1650, unit: 'mm', price: 9620 },
      { id: 'guri-6', name: 'PLYWOOD BOX', sizeLabel: '500 × 400 × 320 mm', l: 500, w: 400, h: 320, unit: 'mm', price: 2800 },
      { id: 'guri-7', name: 'PLYWOOD BOX', sizeLabel: '2000 × 1000 × 1100 mm', l: 2000, w: 1000, h: 1100, unit: 'mm', price: 10500 },
      { id: 'guri-8', name: 'PLYWOOD BOX', sizeLabel: '1200 × 1000 × 1000 mm', l: 1200, w: 1000, h: 1000, unit: 'mm', price: 8250 },
      { id: 'guri-9', name: 'PLYWOOD BOX', sizeLabel: '2000 × 2670 × 1100 mm', l: 2000, w: 2670, h: 1100, unit: 'mm', price: 19658 },
      { id: 'guri-10', name: 'PLYWOOD BOX', sizeLabel: '1400 × 650 × 2400 mm', l: 1400, w: 650, h: 2400, unit: 'mm', price: 8200 },
      { id: 'guri-11', name: 'PLYWOOD BOX', sizeLabel: '1400 × 800 × 700 mm', l: 1400, w: 800, h: 700, unit: 'mm', price: 5100 },
      { id: 'guri-12', name: 'PLYWOOD BOX', sizeLabel: '1800 × 750 × 2300 mm', l: 1800, w: 750, h: 2300, unit: 'mm', price: 10911 },
      { id: 'guri-13', name: 'PINEWOOD BOX', sizeLabel: '2300 × 1300 × 1650 mm', l: 2300, w: 1300, h: 1650, unit: 'mm', price: 32000 },
      { id: 'guri-14', name: 'PINEWOOD PALLET', sizeLabel: '1220 × 1005 × 140 mm', l: 1220, w: 1005, h: 140, unit: 'mm', price: 1225 },
      { id: 'guri-15', name: 'PINEWOOD PALLET', sizeLabel: '2440 × 1005 × 140 mm', l: 2440, w: 1005, h: 140, unit: 'mm', price: 2100 },
      { id: 'guri-16', name: 'PINEWOOD PALLET', sizeLabel: '1240 × 1240 × 120 mm', l: 1240, w: 1240, h: 120, unit: 'mm', price: 910 },
      { id: 'guri-17', name: 'PINEWOOD PALLET', sizeLabel: '2440 × 1050 × 145 mm', l: 2440, w: 1050, h: 145, unit: 'mm', price: 1430 },
      { id: 'guri-18', name: 'PINEWOOD PALLET', sizeLabel: '2450 × 1020 × 145 mm', l: 2450, w: 1020, h: 145, unit: 'mm', price: 1430 }
    ]
  },
  {
    id: 'dmw',
    companyName: 'DMW',
    products: [
      {
        id: 'dmw-1',
        name: 'PINEWOOD BOX INNER',
        sizeLabel: '1100 × 870 × 940 mm',
        l: 1100,
        w: 870,
        h: 940,
        unit: 'mm',
        price: 4720,
        parts: [
          { id: 'T-PLY', label: 'TOP PLY', l: 45, w: 36, h: 6, qty: 2, useInchLength: true, useInchWidth: true },
          { id: 'S-PLY', label: 'SIDE PLY', l: 45, w: 39.25, h: 6, qty: 2, useInchLength: true, useInchWidth: true },
          { id: 'E-PLY', label: 'ENDS PLY', l: 39.5, w: 34, h: 6, qty: 2, useInchLength: true, useInchWidth: true },
          { id: 'T-REAP', label: 'TOP REAPER', l: 45, w: 75, h: 16, qty: 2, useInchLength: true },
          { id: 'T-SUPP', label: 'TOP SUPPORT', l: 30.25, w: 75, h: 16, qty: 3, useInchLength: true },
          { id: 'S-REAP', label: 'SIDE REAPER', l: 45, w: 75, h: 16, qty: 4, useInchLength: true },
          { id: 'S-SUPP', label: 'SIDE SUPPORT', l: 33.25, w: 75, h: 16, qty: 4, useInchLength: true }
        ]
      }
    ]
  },
  {
    id: 'madha',
    companyName: 'MADHA PACKAGING',
    products: [
      { id: 'madha-1', name: 'PINEWOOD BOX', sizeLabel: '16.75 × 13.75 × 15.25 in', l: 16.75, w: 13.75, h: 15.25, unit: 'in', price: 785 },
      { id: 'madha-2', name: 'PINEWOOD BOX', sizeLabel: '18 × 14 × 15.25 in', l: 18, w: 14, h: 15.25, unit: 'in', price: 785 },
      { id: 'madha-3', name: 'PINEWOOD BOX', sizeLabel: '40 × 40 × 40 in', l: 40, w: 40, h: 40, unit: 'in', price: 5000 },
      { id: 'madha-4', name: 'PINEWOOD BOX', sizeLabel: '46 × 38 × 28 in', l: 46, w: 38, h: 28, unit: 'in', price: 4550 },
      { id: 'madha-5', name: 'PLYWOOD BOX', sizeLabel: '720 × 720 × 1000 mm', l: 720, w: 720, h: 1000, unit: 'mm', price: 3300 },
      { id: 'madha-6', name: 'PLYWOOD BOX', sizeLabel: '720 × 720 × 800 mm', l: 720, w: 720, h: 800, unit: 'mm', price: 3000 },
      { id: 'madha-7', name: 'PINEWOOD PALLET', sizeLabel: '1250 × 1150 × 1000 mm', l: 1250, w: 1150, h: 1000, unit: 'mm', price: 5700 },
      { id: 'madha-8', name: 'PINEWOOD BOX', sizeLabel: '1200 × 600 × 500 mm', l: 1200, w: 600, h: 500, unit: 'mm', price: 330 },
      { id: 'madha-9', name: 'RUBBERWOOD PALLET', sizeLabel: '40 × 40 × 5.5 in', l: 40, w: 40, h: 5.5, unit: 'in', price: 620 },
      { id: 'madha-10', name: 'RUBBERWOOD BOX', sizeLabel: '26 × 31 × 16 in', l: 26, w: 31, h: 16, unit: 'in', price: 1125 },
      { id: 'madha-11', name: 'PINEWOOD PALLET', sizeLabel: '1200 × 1000 × 150 mm', l: 1200, w: 1000, h: 150, unit: 'mm', price: 1600 }
    ]
  },
  {
    id: 'shreepriya',
    companyName: 'SHREE PRIYA PACKS',
    products: [
      { id: 'sp-1', name: 'BRB PLYWOOD PALLET', sizeLabel: '43.5 × 43.5 × 5 in', l: 43.5, w: 43.5, h: 5, unit: 'in', price: 1260 },
      { id: 'sp-2', name: 'POLARIES', sizeLabel: '52 × 43 × 5 in', l: 52, w: 43, h: 5, unit: 'in', price: 1630 },
      { id: 'sp-3', name: 'T6 OBJ', sizeLabel: '45 × 44 × 5 in', l: 45, w: 44, h: 5, unit: 'in', price: 1140 },
      { id: 'sp-4', name: 'WORTHANJ OBJ', sizeLabel: '46 × 46 × 5 in', l: 46, w: 46, h: 5, unit: 'in', price: 1140 },
      { id: 'sp-5', name: 'MASTHANJ OBJ', sizeLabel: '47 × 41 × 5 in', l: 47, w: 41, h: 5, unit: 'in', price: 1130 },
      { id: 'sp-6', name: '9 BUXS', sizeLabel: '59 × 43 × 5 in', l: 59, w: 43, h: 5, unit: 'in', price: 1730 },
      { id: 'sp-7', name: 'PSA PALLET', sizeLabel: '1460 × 1140 × 135 mm', l: 1460, w: 1140, h: 135, unit: 'mm', price: 1530 },
      { id: 'sp-8', name: 'MAGNA PLYWOOD PALLET', sizeLabel: '1160 × 1110 × 120 mm', l: 1160, w: 1110, h: 120, unit: 'mm', price: 1190 },
      { id: 'sp-9', name: 'PLYWOOD LEG PALLET', sizeLabel: '1600 × 1000 × 135 mm', l: 1600, w: 1000, h: 135, unit: 'mm', price: 1800 },
      { id: 'sp-10', name: 'PLYWOOD LEG PALLET', sizeLabel: '40 × 30 × 135 in/in/mm', l: 40, w: 30, h: 135, unit: 'in', price: 890 },
      { id: 'sp-11', name: 'PLYWOOD LEG PALLET', sizeLabel: '1210 × 1000 × 135 mm', l: 1210, w: 1000, h: 135, unit: 'mm', price: 1350 },
      { id: 'sp-12', name: 'PLYWOOD LEG PALLET', sizeLabel: '1245 × 1045 × 135 mm', l: 1245, w: 1045, h: 135, unit: 'mm', price: 1430 },
      { id: 'sp-13', name: 'PLYWOOD LEG PALLET', sizeLabel: '1205 × 1000 × 135 mm', l: 1205, w: 1000, h: 135, unit: 'mm', price: 1350 },
      { id: 'sp-14', name: 'PLYWOOD LEG PALLET', sizeLabel: '1340 × 1000 × 135 mm', l: 1340, w: 1000, h: 135, unit: 'mm', price: 1490 },
      { id: 'sp-15', name: 'KAWASAKI PALLET', sizeLabel: '44 × 37.5 × 5 in', l: 44, w: 37.5, h: 5, unit: 'in', price: 1040 },
      { id: 'sp-16', name: 'KUBTO PLYWOOD PALLET', sizeLabel: '40 × 30 × 5 in', l: 40, w: 30, h: 5, unit: 'in', price: 890 },
      { id: 'sp-17', name: 'PLYWOOD LEG PALLET', sizeLabel: '1625 × 1000 × 135 mm', l: 1625, w: 1000, h: 135, unit: 'mm', price: 1870 },
      { id: 'sp-18', name: 'PINEWOOD PALLET', sizeLabel: '1120 × 1120 × 135 mm', l: 1120, w: 1120, h: 135, unit: 'mm', price: 890 },
      { id: 'sp-19', name: 'T6 OBJ', sizeLabel: '45 × 38 × 5 in', l: 45, w: 38, h: 5, unit: 'in', price: 1080 }
    ]
  },
  {
    id: 'ssn',
    companyName: 'SSN',
    products: [
      {
        id: 'ssn-1',
        name: 'PINEWOOD PALLET',
        sizeLabel: '1066 × 1066 × 150 mm',
        l: 1066,
        w: 1066,
        h: 150,
        unit: 'mm',
        price: 1035,
        parts: [
          { id: 'TOP1', label: 'TOP WIDE', l: 1060, w: 95, h: 16, qty: 3 },
          { id: 'TOP2', label: 'TOP NARROW', l: 1060, w: 75, h: 16, qty: 4 },
          { id: 'LEG', label: 'LEG PLANKS', l: 1060, w: 95, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK PLANKS', l: 1060, w: 95, h: 16, qty: 3 },
          { id: 'BLK', label: 'BLOCKS', l: 95, w: 95, h: 90, qty: 9 }
        ]
      }
    ]
  },
  {
    id: 'sgi',
    companyName: 'SGI',
    products: [
      {
        id: 'sgi-1',
        name: 'PINEWOOD PALLET',
        sizeLabel: '870 × 750 × 150 mm',
        l: 870,
        w: 750,
        h: 150,
        unit: 'mm',
        price: 780,
        parts: [
          { id: 'TOP', label: 'TOP PLANKS', l: 750, w: 75, h: 16, qty: 6 },
          { id: 'LEG', label: 'LEG PLANKS', l: 870, w: 75, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK PLANKS', l: 870, w: 75, h: 16, qty: 3 },
          { id: 'BLK', label: 'LEG BLOCKS', l: 75, w: 75, h: 90, qty: 9 }
        ]
      },
      { id: 'sgi-2', name: 'PINEWOOD PALLET', sizeLabel: '1000 × 1200 × 150 mm', l: 1000, w: 1200, h: 150, unit: 'mm', price: 1010 },
      { id: 'sgi-3', name: 'PINEWOOD PALLET', sizeLabel: '1200 × 800 × 150 mm', l: 1200, w: 800, h: 150, unit: 'mm', price: 800 },
      { id: 'sgi-4', name: 'PINEWOOD PALLET', sizeLabel: '700 × 800 × 150 mm', l: 700, w: 800, h: 150, unit: 'mm', price: 700 },
      { id: 'sgi-5', name: 'PLYWOOD BOX', sizeLabel: '1000 × 970 × 750 mm', l: 1000, w: 970, h: 750, unit: 'mm', price: 2820 },
      { id: 'sgi-6', name: 'PLY BOX SUPPORT REAPER', sizeLabel: '950 × 30 × 40 mm', l: 950, w: 30, h: 40, unit: 'mm', price: 41 },
      { id: 'sgi-7', name: 'PLY BOX SUPPORT REAPER', sizeLabel: '730 × 30 × 40 mm', l: 730, w: 30, h: 40, unit: 'mm', price: 31 }
    ]
  },
  {
    id: 'qhtalbors',
    companyName: 'QH TALBORS',
    products: [
      {
        id: 'qh-1',
        name: 'PINEWOOD BOX',
        sizeLabel: '1490 × 230 × 200 mm',
        l: 1490,
        w: 230,
        h: 200,
        unit: 'mm',
        price: 1515,
        parts: [
          { id: 'SIDE', label: 'SIDE', l: 1550, w: 200, h: 10, qty: 2 },
          { id: 'E-PLY', label: 'ENDS PLY', l: 230, w: 200, h: 10, qty: 2 },
          { id: 'E-PINE', label: 'ENDS PINEWOOD', l: 230, w: 200, h: 20, qty: 2 },
          { id: 'TOP', label: 'TOP', l: 1550, w: 250, h: 10, qty: 1 },
          { id: 'BASE', label: 'BASE', l: 1550, w: 250, h: 14, qty: 1 }
        ]
      },
      {
        id: 'qh-2',
        name: 'PINEWOOD PALLET',
        sizeLabel: '1150 × 1020 × 150 mm',
        l: 1150,
        w: 1020,
        h: 150,
        unit: 'mm',
        price: 2086,
        parts: [
          { id: 'TOP', label: 'TOP', l: 1570, w: 1020, h: 14, qty: 1 },
          { id: 'LEG', label: 'LEG', l: 1020, w: 90, h: 14, qty: 4 },
          { id: 'LEGS1', label: 'LEGS 130', l: 130, w: 90, h: 108, qty: 8 },
          { id: 'LEGS2', label: 'LEGS 90', l: 90, w: 90, h: 108, qty: 4 },
          { id: 'BACK', label: 'BACK PIECE', l: 1570, w: 90, h: 14, qty: 2 },
          { id: 'SUPP', label: 'SUPPORT', l: 840, w: 90, h: 14, qty: 4 }
        ]
      }
    ]
  },
  {
    id: 'tvs',
    companyName: 'TVS',
    products: [
      {
        id: 'tvs-1',
        name: 'PINEWOOD PALLET',
        sizeLabel: '1200 × 800 × 164 mm',
        l: 1200,
        w: 800,
        h: 164,
        unit: 'mm',
        price: 1490,
        parts: [
          { id: 'TOP', label: 'TOP PLANKS', l: 1200, w: 95, h: 17, qty: 5 },
          { id: 'LEG', label: 'LEG PLANKS', l: 800, w: 95, h: 17, qty: 3 },
          { id: 'BACK', label: 'BACK PLANKS', l: 1200, w: 95, h: 17, qty: 3 },
          { id: 'BLK', label: 'BLOCK PLANKS', l: 95, w: 95, h: 113, qty: 9 }
        ]
      },
      { id: 'tvs-2', name: 'PINEWOOD PALLET', sizeLabel: '1200 × 800 × 144 mm', l: 1200, w: 800, h: 144, unit: 'mm', price: 1675 },
      { id: 'tvs-3', name: 'COLLAR HINGES', sizeLabel: '1200 × 800 × 195 mm', l: 1200, w: 800, h: 195, unit: 'mm', price: 1360 },
      { id: 'tvs-4', name: 'WOODEN BOX', sizeLabel: '300 × 350 × 100 mm', l: 300, w: 350, h: 100, unit: 'mm', price: 475 },
      { id: 'tvs-5', name: 'SUPPORT PIECE', sizeLabel: '150 × 75 × 50 mm', l: 150, w: 75, h: 50, unit: 'mm', price: 30 },
      { id: 'tvs-6', name: 'PLYWOOD SHEET', sizeLabel: '1200 × 150 × 15 mm', l: 1200, w: 150, h: 15, unit: 'mm', price: 115 },
      { id: 'tvs-7', name: 'PLYWOOD SHEET', sizeLabel: '1150 × 750 × 6 mm', l: 1150, w: 750, h: 6, unit: 'mm', price: 385 },
      { id: 'tvs-8', name: 'PLYWOOD SHEET', sizeLabel: '1200 × 800 × 10 mm', l: 1200, w: 800, h: 10, unit: 'mm', price: 525 }
    ]
  },
  {
    id: 'miltonroy',
    companyName: 'MILTON ROY',
    products: [
      { id: 'mr-1', name: 'PALLET', sizeLabel: '18 × 17 × 5 in', l: 18, w: 17, h: 5, unit: 'in', price: 320 },
      { id: 'mr-2', name: 'PALLET', sizeLabel: '33 × 18 × 5 in', l: 33, w: 18, h: 5, unit: 'in', price: 440 },
      { id: 'mr-3', name: 'PALLET', sizeLabel: '36 × 33 × 5 in', l: 36, w: 33, h: 5, unit: 'in', price: 720 },
      { id: 'mr-4', name: 'BOX', sizeLabel: '24 × 18 × 12 in', l: 24, w: 18, h: 12, unit: 'in', price: 1000 },
      { id: 'mr-5', name: 'BOX', sizeLabel: '16 × 34 × 32 in', l: 16, w: 34, h: 32, unit: 'in', price: 2295 },
      { id: 'mr-6', name: 'BOX', sizeLabel: '25 × 16 × 29 in', l: 25, w: 16, h: 29, unit: 'in', price: 1700 },
      { id: 'mr-7', name: 'BOX', sizeLabel: '22 × 34 × 32 in', l: 22, w: 34, h: 32, unit: 'in', price: 2720 },
      { id: 'mr-8', name: 'BOX', sizeLabel: '22 × 14 × 28 in', l: 22, w: 14, h: 28, unit: 'in', price: 1410 },
      { id: 'mr-9', name: 'BOX', sizeLabel: '19 × 14 × 25 in', l: 19, w: 14, h: 25, unit: 'in', price: 1170 },
      { id: 'mr-10', name: 'BOX', sizeLabel: '25 × 14 × 25 in', l: 25, w: 14, h: 25, unit: 'in', price: 1420 },
      { id: 'mr-11', name: 'BOX', sizeLabel: '18 × 34 × 29 in', l: 18, w: 34, h: 29, unit: 'in', price: 2180 },
      { id: 'mr-12', name: 'BOX', sizeLabel: '37 × 35 × 40 in', l: 37, w: 35, h: 40, unit: 'in', price: 4350 },
      { id: 'mr-13', name: 'BOX', sizeLabel: '20 × 15 × 26 in', l: 20, w: 15, h: 26, unit: 'in', price: 1800 },
      { id: 'mr-14', name: 'BOX', sizeLabel: '59 × 35 × 29 in', l: 59, w: 35, h: 29, unit: 'in', price: 4980 },
      { id: 'mr-15', name: 'BOX', sizeLabel: '25 × 34 × 29 in', l: 25, w: 34, h: 29, unit: 'in', price: 2830 },
      { id: 'mr-16', name: 'BOX', sizeLabel: '30 × 12 × 18 in', l: 30, w: 12, h: 18, unit: 'in', price: 1190 },
      { id: 'mr-17', name: 'BOX', sizeLabel: '21 × 19 × 25 in', l: 21, w: 19, h: 25, unit: 'in', price: 2250 },
      { id: 'mr-18', name: 'BOX', sizeLabel: '26 × 19 × 25 in', l: 26, w: 19, h: 25, unit: 'in', price: 1870 },
      { id: 'mr-19', name: 'BOX', sizeLabel: '27 × 10 × 25 in', l: 27, w: 10, h: 25, unit: 'in', price: 1280 },
      { id: 'mr-20', name: 'BOX', sizeLabel: '30 × 34 × 32 in', l: 30, w: 34, h: 32, unit: 'in', price: 3150 },
      { id: 'mr-21', name: 'BOX', sizeLabel: '32 × 34 × 32 in', l: 32, w: 34, h: 32, unit: 'in', price: 3280 },
      { id: 'mr-22', name: 'BOX', sizeLabel: '34 × 21 × 32 in', l: 34, w: 21, h: 32, unit: 'in', price: 3200 },
      { id: 'mr-23', name: 'BOX', sizeLabel: '40 × 36 × 32 in', l: 40, w: 36, h: 32, unit: 'in', price: 3180 },
      { id: 'mr-24', name: 'BOX', sizeLabel: '25 × 35 × 40 in', l: 25, w: 35, h: 40, unit: 'in', price: 3360 }
    ]
  },
  {
    id: 'tag',
    companyName: 'TAG',
    products: [
      { id: 'tag-1', name: 'PINEWOOD CASE', sizeLabel: '75 × 35 × 35 in', l: 75, w: 35, h: 35, unit: 'in', price: 10922.1 },
      { id: 'tag-2', name: 'PINEWOOD CASE', sizeLabel: '75 × 35 × 24 in', l: 75, w: 35, h: 24, unit: 'in', price: 9149.66 },
      { id: 'tag-3', name: 'PINEWOOD CASE', sizeLabel: '80 × 32 × 35 in', l: 80, w: 32, h: 35, unit: 'in', price: 10779.88 },
      { id: 'tag-4', name: 'PINEWOOD CASE', sizeLabel: '38.5 × 42.5 × 41 in', l: 38.5, w: 42.5, h: 41, unit: 'in', price: 8854.5 },
      { id: 'tag-5', name: 'PINEWOOD CASE', sizeLabel: '38.5 × 42.5 × 35 in', l: 38.5, w: 42.5, h: 35, unit: 'in', price: 8097.56 },
      { id: 'tag-6', name: 'PINEWOOD CASE', sizeLabel: '38 × 35 × 24 in', l: 38, w: 35, h: 24, unit: 'in', price: 5855 },
      { id: 'tag-7', name: 'PINEWOOD CASE', sizeLabel: '38 × 35 × 30 in', l: 38, w: 35, h: 30, unit: 'in', price: 653.87 },
      { id: 'tag-8', name: 'PINEWOOD CASE', sizeLabel: '102 × 35 × 24 in', l: 102, w: 35, h: 24, unit: 'in', price: 11708.92 },
      {
        id: 'tag-9',
        name: 'PINEWOOD CASE',
        sizeLabel: '102 × 24 × 15 in',
        l: 102,
        w: 24,
        h: 15,
        unit: 'in',
        price: 7662.74,
        parts: [
          { id: 'SIDE', label: 'SIDE', l: 105, w: 15, h: 16, qty: 2, useInchLength: true, useInchWidth: true },
          { id: 'SIDE-REAP', label: 'SIDE REAPER', l: 20.75, w: 75, h: 19, qty: 4, useInchLength: true },
          { id: 'ENDS', label: 'ENDS', l: 24, w: 15, h: 16, qty: 2, useInchLength: true, useInchWidth: true },
          { id: 'ENDS-REAP', label: 'ENDS REAPER', l: 15, w: 75, h: 16, qty: 4, useInchLength: true },
          { id: 'ENDS-SUPP', label: 'ENDS SUPPORT', l: 18, w: 75, h: 16, qty: 4, useInchLength: true },
          { id: 'TOP', label: 'TOP', l: 105, w: 25.25, h: 16, qty: 1, useInchLength: true, useInchWidth: true },
          { id: 'TOP-REAP', label: 'TOP REAPER', l: 25.25, w: 75, h: 19, qty: 4, useInchLength: true },
          { id: 'BASE', label: 'BASE', l: 105, w: 25.25, h: 16, qty: 1, useInchLength: true, useInchWidth: true },
          { id: 'BASE-RUN', label: 'BASE RUNNER', l: 25.25, w: 75, h: 90, qty: 4, useInchLength: true }
        ]
      },
      { id: 'tag-10', name: 'PINEWOOD CASE', sizeLabel: '114 × 24 × 20 in', l: 114, w: 24, h: 20, unit: 'in', price: 9242 },
      { id: 'tag-11', name: 'PINEWOOD CASE', sizeLabel: '42 × 42 × 37 in', l: 42, w: 42, h: 37, unit: 'in', price: 8615.61 },
      { id: 'tag-12', name: 'PINEWOOD CASE', sizeLabel: '65 × 33 × 24 in', l: 65, w: 33, h: 24, unit: 'in', price: 8101 },
      { id: 'tag-13', name: 'PINEWOOD CASE', sizeLabel: '42 × 35 × 15 in', l: 42, w: 35, h: 15, unit: 'in', price: 5084 },
      { id: 'tag-14', name: 'PINEWOOD CASE', sizeLabel: '47 × 30 × 38 in', l: 47, w: 30, h: 38, unit: 'in', price: 7536.3 }
    ]
  },
  {
    id: 'packlabs',
    companyName: 'PACKLABS',
    products: [
      { id: 'pl-1', name: 'PLYWOOD PALLET', sizeLabel: '1140 × 980 × 120 mm', l: 1140, w: 980, h: 120, unit: 'mm', price: 1180 },
      { id: 'pl-2', name: 'COMER PALLET', sizeLabel: '800 × 1000 × 130 mm', l: 800, w: 1000, h: 130, unit: 'mm', price: 1050 },
      { id: 'pl-3', name: '3P PINEWOOD PALLET', sizeLabel: '1150 × 950 × 125 mm', l: 1150, w: 950, h: 125, unit: 'mm', price: 1130 },
      { id: 'pl-4', name: 'NTN BIG PALLET', sizeLabel: '920 × 460 × 135 mm', l: 920, w: 460, h: 135, unit: 'mm', price: 770 },
      { id: 'pl-5', name: 'NTN SMALL PALLET', sizeLabel: '920 × 410 × 135 mm', l: 920, w: 410, h: 135, unit: 'mm', price: 710 },
      {
        id: 'pl-6',
        name: 'NTN COMBO BIG PALLET',
        sizeLabel: '945 × 945 × 125 mm',
        l: 945,
        w: 945,
        h: 125,
        unit: 'mm',
        price: 1310,
        parts: [
          { id: 'TOP', label: 'TOP', l: 945, w: 95, h: 16, qty: 6 },
          { id: 'LEG PLANKS', label: 'LEG PLANKS', l: 945, w: 89, h: 38, qty: 3 },
          { id: 'BACK', label: 'BACK', l: 945, w: 95, h: 16, qty: 4 }
        ]
      },
      {
        id: 'pl-7',
        name: 'NTN COMBO SMALL PALLET',
        sizeLabel: '945 × 845 × 125 mm',
        l: 945,
        w: 845,
        h: 125,
        unit: 'mm',
        price: 1260,
        parts: [
          { id: 'TOP', label: 'TOP', l: 945, w: 95, h: 16, qty: 6 },
          { id: 'LEG PLANKS', label: 'LEG PLANKS', l: 845, w: 89, h: 38, qty: 3 },
          { id: 'BACK', label: 'BACK', l: 945, w: 95, h: 16, qty: 4 }
        ]
      },
      {
        id: 'pl-8',
        name: 'SCRAB COUNTRYWOOD PALLET',
        sizeLabel: '850 × 750 × 125 mm',
        l: 850,
        w: 750,
        h: 125,
        unit: 'mm',
        price: 480,
        parts: [
          { id: 'TOP', label: 'TOP', l: 850, w: 75, h: 15, qty: 5 },
          { id: 'LEG PLANKS', label: 'LEG PLANKS', l: 845, w: 89, h: 38, qty: 3 },
          { id: 'BLOCK', label: 'BLOCK', l: 75, w: 75, h: 75, qty: 9 },
          { id: 'BACK', label: 'BACK', l: 750, w: 75, h: 16, qty: 3 }
        ]
      },
      {
        id: 'pl-9',
        name: 'SCRAB COUNTRYWOOD PALLET',
        sizeLabel: '800 × 600 × 125 mm',
        l: 800,
        w: 600,
        h: 125,
        unit: 'mm',
        price: 360,
        parts: [
          { id: 'TOP', label: 'TOP', l: 800, w: 75, h: 16, qty: 4 },
          { id: 'LEG PLANKS', label: 'LEG PLANKS', l: 600, w: 75, h: 16, qty: 3 },
          { id: 'BLOCK', label: 'BLOCK', l: 75, w: 75, h: 75, qty: 9 },
          { id: 'BACK', label: 'BACK', l: 600, w: 75, h: 16, qty: 3 }
        ]
      },
      { id: 'pl-10', name: 'AT6 PALLET', sizeLabel: '1190 × 790 × 135 mm', l: 1190, w: 790, h: 135, unit: 'mm', price: 1180 },
      { id: 'pl-11', name: 'E10', sizeLabel: '970 × 790 × 130 mm', l: 970, w: 790, h: 130, unit: 'mm', price: 960 },
      {
        id: 'pl-12',
        name: 'DANFOSS',
        sizeLabel: '850 × 730 × 120 mm',
        l: 850,
        w: 730,
        h: 120,
        unit: 'mm',
        price: 950,
        parts: [
          { id: 'TOP', label: 'TOP', l: 850, w: 75, h: 16, qty: 5 },
          { id: 'LEG', label: 'LEG', l: 730, w: 75, h: 16, qty: 6 },
          { id: 'BLOCK', label: 'BLOCK', l: 75, w: 75, h: 75, qty: 9 }
        ]
      },
      {
        id: 'pl-13',
        name: 'MB6 PALLET',
        sizeLabel: '1050 × 650 × 140 mm',
        l: 1050,
        w: 650,
        h: 140,
        unit: 'mm',
        price: 1100,
        parts: [
          { id: 'TOP', label: 'TOP', l: 1050, w: 75, h: 16, qty: 6 },
          { id: 'LEG', label: 'LEG', l: 650, w: 75, h: 16, qty: 3 },
          { id: 'BACK', label: 'BACK', l: 1050, w: 75, h: 16, qty: 3 },
          { id: 'BLOCK', label: 'BLOCK', l: 75, w: 75, h: 90, qty: 9 }
        ]
      },
      { id: 'pl-14', name: 'PINEWOOD PALLET', sizeLabel: '1180 × 780 × 140 mm', l: 1180, w: 780, h: 140, unit: 'mm', price: 1230 },
      { id: 'pl-15', name: 'PINEWOOD PALLET', sizeLabel: '890 × 760 × 130 mm', l: 890, w: 760, h: 130, unit: 'mm', price: 940 },
      { id: 'pl-16', name: 'PINEWOOD PALLET', sizeLabel: '920 × 770 × 135 mm', l: 920, w: 770, h: 135, unit: 'mm', price: 960 }
    ]
  }
];
