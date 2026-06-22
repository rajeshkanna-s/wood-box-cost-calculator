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
    id: 'motherson-3',
    companyName: 'Motherson Automotive Elastomers Technology unit- 3',
    products: []
  },
  {
    id: 'motherson-1',
    companyName: 'Motherson Automotive Elastomers Technology unit- 1',
    products: []
  },
  {
    id: 'indauto',
    companyName: 'INDAUTO FILTER',
    products: []
  },
  {
    id: 'nexteer',
    companyName: 'NEXTEER AUTOMOTIVES INDIA PVT LTD',
    products: []
  },
  {
    id: 'ntn-ne',
    companyName: 'NTN NE MANUFACTURING INDIA PVT LTD',
    products: []
  },
  {
    id: 'gurit-wind',
    companyName: 'GURIT WIND PRIVATE LIMITED',
    products: []
  },
  {
    id: 'packlabs',
    companyName: 'PACKLABS',
    products: []
  },
  {
    id: 'milton-roy',
    companyName: 'MILTON ROY INDIA PRIVATE LIMITED',
    products: []
  },
  {
    id: 'sgi-automotive',
    companyName: 'SGI AUTOMOTIVE INDIA PVT LTD',
    products: []
  },
  {
    id: 'tvs-toyota',
    companyName: 'TVS TOYOTA TSUSHO INDIA PVT LTD',
    products: []
  },
  {
    id: 'dmw-cns',
    companyName: 'DMW CNS SOLUTION INDIA PVT LTD',
    products: []
  },
  {
    id: 'rockwell',
    companyName: 'ROCKWELL AUTOMATION',
    products: []
  },
  {
    id: 'tag',
    companyName: 'TAG CORPORATION',
    products: []
  },
  {
    id: 'shree-priya',
    companyName: 'SHREE PRIYA PACKS',
    products: []
  },
  {
    id: 'vishnu',
    companyName: 'VISHNU INDUSTRIAL PACKERS',
    products: []
  },
  {
    id: 'globin',
    companyName: 'GLOBIN PACKAGING SOLUTION & TECNOLOGY',
    products: []
  },
  {
    id: 'qh-talbors',
    companyName: 'QH TALBORS PVT LTD',
    products: []
  },
  {
    id: 'value-supply',
    companyName: 'VALUE SUPPLY CHAIN SOLUTION',
    products: []
  },
  {
    id: 'madha',
    companyName: 'MADHA PACKAGING COMPANY',
    products: []
  },
  {
    id: 'pontus',
    companyName: 'PONTUS PACK PVT LTD',
    products: []
  },
  {
    id: 'meetup',
    companyName: 'MEETUP SYSTEMS PRIVATE LIMITED',
    products: []
  },
  {
    id: 'bharath',
    companyName: 'BHARATH INDUSTRIES',
    products: []
  },
  {
    id: 'transmarine',
    companyName: 'TRANSMARINE CARGO SERVICES',
    products: []
  },
  {
    id: 'econovus',
    companyName: 'ECONOVUS PACKAGING PVT LTD',
    products: []
  },
  {
    id: 'ficus-pax',
    companyName: 'FICUS PAX PRIVATE LIMITED',
    products: []
  },
  {
    id: 'xpert-pack',
    companyName: 'XPERT PACK TRASPORT PACKAGING PVT LTD',
    products: []
  }
];
