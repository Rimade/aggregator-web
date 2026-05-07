import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getEnv(name: string) {
	return process.env[name];
}

let _supabase: SupabaseClient | null = null;

/**
 * Возвращает Supabase client или `null`, если публичные env не заданы.
 * Это позволяет держать мок-режим без падения приложения.
 */
export function getSupabaseClient() {
	if (_supabase) return _supabase;

	const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
	const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
	if (!url || !anonKey) return null;

	_supabase = createClient(url, anonKey);
	return _supabase;
}

/** Совместимость: прямой экспорт клиента (может быть `null`). */
export const supabase = getSupabaseClient();
