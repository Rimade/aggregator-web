import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing ${name}. Create web/.env.local from web/.env.local.example`,
    );
  }
  return v;
}

export const supabase = createClient(
  getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
);

