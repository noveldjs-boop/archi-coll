// IAI Fee Rates based on building category and RAB
// Rates follow IAI (Ikatan Arsitek Indonesia) standard

export interface IAICalculationResult {
  rab: number;                    // RAB (Rencana Anggaran Biaya)
  designFee: number;              // Total Design Fee
  preDesignPrice: number;         // 15%
  schematicPrice: number;         // 25%
  dedPrice: number;               // 60%
  iaiFeeRate: number;             // Fee rate used
  pricePerM2: number;             // Building price per m²
  dp10: number;                  // 10% DP
  remainingAfterDP: number;       // Sisa setelah DP
  payment80AfterAgreed: number;   // 80% dari sisa setelah desain disepakati
  payment20AfterComplete: number; // 20% dari sisa setelah pekerjaan selesai
}

export type BuildingCategory = 
  | 'k1-low-sederhana'
  | 'k2-low-menengah'
  | 'k3-low-mewah'
  | 'k1-middle-sederhana'
  | 'k2-middle-menengah'
  | 'k3-middle-mewah'
  | 'k1-high-sederhana'
  | 'k2-high-menengah'
  | 'k3-high-mewah';

// Get IAI Fee Rate based on RAB (in millions) and building category
export const getIAIFeeRate = (rab: number, buildingCategory: BuildingCategory): number => {
  const iaiCategory = buildingCategory.split('-')[0] as 'k1' | 'k2' | 'k3';
  const rabJuta = rab / 1000000; // Convert to millions

  if (rabJuta < 200) {
    if (iaiCategory === 'k1') return 0.065;
    if (iaiCategory === 'k2') return 0.070;
    if (iaiCategory === 'k3') return 0.080;
  } else if (rabJuta <= 2000) {
    if (iaiCategory === 'k1') return 0.065;
    if (iaiCategory === 'k2') return 0.070;
    if (iaiCategory === 'k3') return 0.080;
  } else if (rabJuta <= 4000) {
    if (iaiCategory === 'k1') return 0.0551;
    if (iaiCategory === 'k2') return 0.0590;
    if (iaiCategory === 'k3') return 0.0648;
  } else if (rabJuta <= 20000) {
    if (iaiCategory === 'k1') return 0.0478;
    if (iaiCategory === 'k2') return 0.0513;
    if (iaiCategory === 'k3') return 0.0560;
  } else if (rabJuta <= 40000) {
    if (iaiCategory === 'k1') return 0.0420;
    if (iaiCategory === 'k2') return 0.0452;
    if (iaiCategory === 'k3') return 0.0492;
  } else if (rabJuta <= 60000) {
    if (iaiCategory === 'k1') return 0.0371;
    if (iaiCategory === 'k2') return 0.0401;
    if (iaiCategory === 'k3') return 0.0438;
  } else if (rabJuta <= 80000) {
    if (iaiCategory === 'k1') return 0.0329;
    if (iaiCategory === 'k2') return 0.0358;
    if (iaiCategory === 'k3') return 0.0392;
  } else if (rabJuta <= 100000) {
    if (iaiCategory === 'k1') return 0.0292;
    if (iaiCategory === 'k2') return 0.0320;
    if (iaiCategory === 'k3') return 0.0352;
  } else if (rabJuta <= 120000) {
    if (iaiCategory === 'k1') return 0.0260;
    if (iaiCategory === 'k2') return 0.0288;
    if (iaiCategory === 'k3') return 0.0318;
  } else if (rabJuta <= 140000) {
    if (iaiCategory === 'k1') return 0.0232;
    if (iaiCategory === 'k2') return 0.0259;
    if (iaiCategory === 'k3') return 0.0288;
  } else if (rabJuta <= 160000) {
    if (iaiCategory === 'k1') return 0.0207;
    if (iaiCategory === 'k2') return 0.0234;
    if (iaiCategory === 'k3') return 0.0262;
  } else if (rabJuta <= 180000) {
    if (iaiCategory === 'k1') return 0.0186;
    if (iaiCategory === 'k2') return 0.0212;
    if (iaiCategory === 'k3') return 0.0239;
  } else if (rabJuta <= 200000) {
    if (iaiCategory === 'k1') return 0.0167;
    if (iaiCategory === 'k2') return 0.0198;
    if (iaiCategory === 'k3') return 0.0220;
  } else if (rabJuta <= 220000) {
    if (iaiCategory === 'k1') return 0.0151;
    if (iaiCategory === 'k2') return 0.0176;
    if (iaiCategory === 'k3') return 0.0203;
  } else if (rabJuta <= 240000) {
    if (iaiCategory === 'k1') return 0.0137;
    if (iaiCategory === 'k2') return 0.0162;
    if (iaiCategory === 'k3') return 0.0188;
  } else if (rabJuta <= 260000) {
    if (iaiCategory === 'k1') return 0.0125;
    if (iaiCategory === 'k2') return 0.0151;
    if (iaiCategory === 'k3') return 0.0176;
  } else if (rabJuta <= 280000) {
    if (iaiCategory === 'k1') return 0.0116;
    if (iaiCategory === 'k2') return 0.0141;
    if (iaiCategory === 'k3') return 0.0167;
  } else if (rabJuta <= 300000) {
    if (iaiCategory === 'k1') return 0.0109;
    if (iaiCategory === 'k2') return 0.0134;
    if (iaiCategory === 'k3') return 0.0159;
  } else if (rabJuta <= 500000) {
    if (iaiCategory === 'k1') return 0.0104;
    if (iaiCategory === 'k2') return 0.0129;
    if (iaiCategory === 'k3') return 0.0154;
  } else {
    // > 500 milyar
    if (iaiCategory === 'k1') return 0.0100;
    if (iaiCategory === 'k2') return 0.0125;
    if (iaiCategory === 'k3') return 0.0150;
  }

  return 0.025; // Default fallback
};

// Get building price per m² based on category
export const getBuildingPrice = (buildingCategory: BuildingCategory): number => {
  switch (buildingCategory) {
    case 'k1-low-sederhana': return 3000000;
    case 'k2-low-menengah': return 5000000;
    case 'k3-low-mewah': return 10000000;
    case 'k1-middle-sederhana': return 5000000;
    case 'k2-middle-menengah': return 7000000;
    case 'k3-middle-mewah': return 12000000;
    case 'k1-high-sederhana': return 7000000;
    case 'k2-high-menengah': return 10000000;
    case 'k3-high-mewah': return 15000000;
    default: return 0;
  }
};

// Calculate design fee using IAI standard
export const calculateIAIDesignFee = (
  area: number,
  buildingCategory: BuildingCategory
): IAICalculationResult => {
  // Calculate RAB based on building category
  const pricePerM2 = getBuildingPrice(buildingCategory);
  const rab = area * pricePerM2;

  // Calculate design fee using IAI rate
  const iaiFeeRate = getIAIFeeRate(rab, buildingCategory);
  const designFee = rab * iaiFeeRate;

  // Calculate package breakdown (15% pre-design, 25% schematic, 60% DED)
  const preDesignPrice = designFee * 0.15;
  const schematicPrice = designFee * 0.25;
  const dedPrice = designFee * 0.60;

  // Calculate payment terms
  const dp10 = designFee * 0.10; // DP 10%
  const remainingAfterDP = designFee - dp10;
  
  // After design is agreed, payment is recalculated based on actual design fee
  // For simulation: 80% of remaining after agreed, 20% after completion
  const payment80AfterAgreed = remainingAfterDP * 0.80;
  const payment20AfterComplete = remainingAfterDP * 0.20;

  return {
    rab,
    designFee,
    preDesignPrice,
    schematicPrice,
    dedPrice,
    iaiFeeRate,
    pricePerM2,
    dp10,
    remainingAfterDP,
    payment80AfterAgreed,
    payment20AfterComplete
  };
};

// Map building type (low-rise, mid-rise, high-rise) and floor count to IAI building category
export const mapToIAIBuildingCategory = (
  buildingType: 'low-rise' | 'mid-rise' | 'high-rise',
  qualityLevel: 'sederhana' | 'menengah' | 'mewah'
): BuildingCategory => {
  const typePrefix = buildingType === 'low-rise' ? 'low' : buildingType === 'mid-rise' ? 'middle' : 'high';
  const qualityPrefix = qualityLevel === 'sederhana' ? 'k1' : qualityLevel === 'menengah' ? 'k2' : 'k3';
  
  return `${qualityPrefix}-${typePrefix}-${qualityLevel}` as BuildingCategory;
};
