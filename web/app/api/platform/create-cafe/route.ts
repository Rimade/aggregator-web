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

	const { name, slug } = body as { name?: string; slug?: string };
	if (!name?.trim() || !slug?.trim()) {
		return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
	}

	const { data, error } = await authz.admin
		.from('cafes')
		.insert({ name: name.trim(), slug: slug.trim(), is_active: true, accepting_orders: true })
		.select('id, name, slug')
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 400 });
	return NextResponse.json({ cafe: data });
}
