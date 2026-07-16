import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://datdsjjeuaqhowpkfdnt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z0VSjAmOqQ7u91Pqdc_SfA_65pOnICy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
