import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL과 Anon Key를 .env 파일에 설정해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
