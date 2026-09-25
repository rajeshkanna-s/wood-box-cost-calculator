import { supabase } from './supabaseClient';
import { getGeneratedParts } from './parts';
import { 
  DEFAULT_PINE_WOOD_BOX_RATES, 
  DEFAULT_PLY_WOOD_PALLET_RATES, 
  DEFAULT_PINE_WOOD_PALLET_RATES, 
  DEFAULT_PINE_PLYWOOD_BOX_RATES 
} from './cft';

const DEFAULT_RATES = {
  'pine-wood-box': DEFAULT_PINE_WOOD_BOX_RATES,
  'ply-wood-pallet': DEFAULT_PLY_WOOD_PALLET_RATES,
  'pine-wood-pallet': DEFAULT_PINE_WOOD_PALLET_RATES,
  'pine-plywood-box': DEFAULT_PINE_PLYWOOD_BOX_RATES
};

/**
 * Fetch specifications (parts) for a specific company, preset size, and product type.
 * Returns { parts, isCustomized: boolean, rates }
 */
export async function fetchSpecifications({ companyId, presetSizeId, productType, presetObj }) {
  try {
    // 1. First check calculations table (which holds parts and rates per company & preset)
    if (companyId && presetSizeId) {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('company_id', companyId)
        .eq('preset_size_id', presetSizeId)
        .eq('product_type', productType)
        .maybeSingle();

      if (!error && data && Array.isArray(data.parts)) {
        return {
          parts: data.parts,
          rates: data.rates || DEFAULT_RATES[productType] || {},
          isCustomized: true,
          fromDb: true
        };
      }
    }

    // 2. If no saved calculation, generate default specifications from formulas
    const fallbackL = presetObj?.l ?? 1000;
    const fallbackW = presetObj?.w ?? 800;
    const fallbackH = presetObj?.h ?? 600;
    const fallbackUnit = presetObj?.unit || 'mm';
    const fallbackTh = presetObj?.th;

    const defaultParts = getGeneratedParts(
      productType,
      fallbackL,
      fallbackW,
      fallbackH,
      fallbackUnit,
      fallbackTh
    );

    return {
      parts: defaultParts,
      rates: DEFAULT_RATES[productType] || {},
      isCustomized: false,
      fromDb: false
    };
  } catch (err) {
    console.error('Error fetching specifications:', err);
    // Return standard defaults on network or schema error
    const defaultParts = getGeneratedParts(
      productType,
      presetObj?.l || 1000,
      presetObj?.w || 800,
      presetObj?.h || 600,
      presetObj?.unit || 'mm',
      presetObj?.th
    );
    return {
      parts: defaultParts,
      rates: DEFAULT_RATES[productType] || {},
      isCustomized: false,
      fromDb: false
    };
  }
}

/**
 * Save specifications (parts) to the database for a company and preset size.
 */
export async function saveSpecifications({ companyId, presetSizeId, productType, parts, rates }) {
  if (!companyId || !presetSizeId || !productType) {
    throw new Error('Company, Preset Size, and Product Type are all required to save specifications.');
  }

  // 1. Upsert into calculations table
  const finalRates = rates || DEFAULT_RATES[productType] || {};
  const { data, error } = await supabase
    .from('calculations')
    .upsert({
      company_id: companyId,
      preset_size_id: presetSizeId,
      product_type: productType,
      rates: finalRates,
      parts: parts
    }, { onConflict: 'company_id, preset_size_id, product_type' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting calculation specifications:', error);
    throw error;
  }

  // 2. Best-effort sync to dedicated specifications table if it exists
  try {
    const { error: specTableCheck } = await supabase
      .from('specifications')
      .select('id')
      .limit(1);

    if (!specTableCheck) {
      // If table exists, delete existing rows for this key and re-insert
      await supabase
        .from('specifications')
        .delete()
        .eq('company_id', companyId)
        .eq('preset_size_id', presetSizeId)
        .eq('product_type', productType);

      const rowsToInsert = parts.map((p, idx) => ({
        company_id: companyId,
        preset_size_id: presetSizeId,
        product_type: productType,
        part_id: p.id || `PART-${idx + 1}`,
        label: p.label || 'Component',
        l: Number(p.l) || 0,
        w: Number(p.w) || 0,
        h: Number(p.h) || 0,
        qty: Number(p.qty) || 1,
        is_ply: Boolean(p.isPly),
        is_custom: Boolean(p.isCustom),
        is_excluded: Boolean(p.isExcluded),
        sort_order: idx
      }));

      if (rowsToInsert.length > 0) {
        await supabase.from('specifications').insert(rowsToInsert);
      }
    }
  } catch (specSyncErr) {
    // Graceful ignore if optional table does not exist
    console.debug('Dedicated specifications table not present or skipped:', specSyncErr?.message);
  }

  return data;
}

/**
 * Reset specifications to calculated defaults based on preset dimensions.
 */
export function generateDefaultSpecs(productType, presetObj) {
  return getGeneratedParts(
    productType,
    presetObj?.l ?? 1000,
    presetObj?.w ?? 800,
    presetObj?.h ?? 600,
    presetObj?.unit || 'mm',
    presetObj?.th
  );
}
