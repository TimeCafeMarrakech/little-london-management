const requiredPublicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
};

export function getPublicEnv() {
  return requiredPublicEnv;
}

export function hasSupabasePublicEnv(): boolean {
  return Boolean(requiredPublicEnv.supabaseUrl && requiredPublicEnv.supabaseAnonKey);
}
