import { NextResponse, type NextRequest } from 'next/server';
import { requirePlatformAdmin } from '../_util';

export async function POST(req: NextRequest) {
	const authz = await requirePlatformAdmin(req);
	if (!authz.ok) return authz.res;

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { email, password, cafeId, role } = body as {
		email?: string;
		password?: string;
		cafeId?: string;
		role?: 'platform_admin' | 'cafe_staff';
	};

	if (!email?.trim() || !password) {
		return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
	}
	const userRole = role ?? 'cafe_staff';
	if (userRole === 'cafe_staff' && !cafeId) {
		return NextResponse.json({ error: 'cafeId is required for cafe_staff' }, { status: 400 });
	}

	const { data: created, error: cErr } = await authz.admin.auth.admin.createUser({
		email: email.trim(),
		password,
		email_confirm: true,
	});
	if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 });

	const userId = created.user?.id;
	if (!userId) return NextResponse.json({ error: 'User create failed' }, { status: 500 });

	const { error: pErr } = await authz.admin.from('profiles').upsert({
		user_id: userId,
		role: userRole,
		cafe_id: userRole === 'cafe_staff' ? cafeId : null,
	});
	if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 });

	return NextResponse.json({
		user: { id: userId, email: created.user?.email },
		profile: { role: userRole, cafe_id: cafeId ?? null },
	});
}
