import { createClient } from '@supabase/supabase-js';

function reqEnv(name: string) {
	const v = process.env[name];
	if (!v) throw new Error(`Missing ${name} env`);
	return v;
}

export function createSupabaseAdmin() {
	return createClient(reqEnv('NEXT_PUBLIC_SUPABASE_URL'), reqEnv('SUPABASE_SERVICE_ROLE_KEY'), {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}

export function createSupabaseAnon() {
	return createClient(reqEnv('NEXT_PUBLIC_SUPABASE_URL'), reqEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}
