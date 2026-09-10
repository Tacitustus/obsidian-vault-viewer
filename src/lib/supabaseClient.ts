/**
 * @description Supabase クライアントの初期化モジュール
 * 環境変数 VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY から設定を読み込む。
 * 未設定の場合は null を返し、アナリティクス機能を自動的に無効化する。
 *
 * @example
 * ```ts
 * import { supabase } from '@/lib/supabaseClient';
 * if (supabase) {
 *   const { data } = await supabase.from('note_views').select('*');
 * }
 * ```
 */

import { createClient } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

// 環境変数から Supabase の接続情報を取得する
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * @description Supabase クライアントインスタンス
 * 環境変数が未設定の場合は null（アナリティクス機能無効）
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * @description Supabase が利用可能かどうかを返す
 * @returns {boolean} Supabase が設定されている場合は true
 */
export const isSupabaseEnabled = (): boolean => {
  return supabase !== null;
};
