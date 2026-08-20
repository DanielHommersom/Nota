import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

/**
 * Real Supabase client. Not wired into `features/auth/authService.ts` yet —
 * that file still mocks the backend on purpose (see its header comment) and
 * is designed so swapping it to call `supabase.auth.*` is a one-file change.
 *
 * `EXPO_PUBLIC_*` vars are inlined at build time and end up in the client
 * bundle, so only the publishable/anon key belongs here — never a service
 * role key.
 */
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
