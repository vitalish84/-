import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error(
    'חסרים משתני סביבה של Supabase.\n' +
    'צור קובץ .env.local עם VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY.\n' +
    'ראה .env.example לדוגמה.'
  );
}

export const supabase = createClient(url, key);
