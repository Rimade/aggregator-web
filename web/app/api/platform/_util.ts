import { createSupabaseAdmin, createSupabaseAnon } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function requirePlatformAdmin(req: NextRequest) {
	const auth = req.headers.get('authorization');
	const m = auth?.match(/^Bearer\s+(.+)$/i);
	const token = m?.[1];
	if (!token) {
		return {
			ok: false as const,
			res: NextResponse.json({ error: 'Missing bearer token' }, { status: 401 }),
		};
	}

	const anon = createSupabaseAnon();
	const { data: user, error: userErr } = await anon.auth.getUser(token);
	if (userErr || !user?.user) {
		return {
			ok: false as const,
			res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		};
	}

	const admin = createSupabaseAdmin();
	const { data: profile, error: pErr } = await admin
		.from('profiles')
		.select('role')
		.eq('user_id', user.user.id)
		.maybeSingle();
	if (pErr) {
		return {
			ok: false as const,
			res: NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 }),
		};
	}
	if (profile?.role !== 'platform_admin') {
		return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
	}

	return { ok: true as const, admin, userId: user.user.id };
}
