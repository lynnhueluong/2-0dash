// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with default empty strings to allow build to succeed
// Runtime checks will happen when actually using the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
