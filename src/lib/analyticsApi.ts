/**
 * @description Supabase アナリティクス API モジュール
 * note_views テーブルに対する閲覧回数の記録・取得を行う。
 * analytics_filters テーブルに対するフィルタ設定の保存・読み込みを行う。
 *
 * @example
 * ```ts
 * await recordNoteView('owner/repo', 'notes/hello.md');
 * const analytics = await fetchAllAnalytics('owner/repo');
 * ```
 */

import { supabase } from '@/lib/supabaseClient';

// ============================================================
// 型定義
// ============================================================

/**
 * @description ノートの閲覧データ
 */
export interface NoteViewRecord {
  /** レコードID */
  id: number;
  /** リポジトリキー（"owner/repo" 形式） */
  repo_key: string;
  /** ファイルパス */
  file_path: string;
  /** 閲覧回数 */
  view_count: number;
  /** 最終閲覧日時（ISO 8601） */
  last_viewed_at: string;
}

/**
 * @description フィルタ条件の演算子
 */
export type FilterOperator = 'and' | 'or';

/**
 * @description アナリティクスのフィルタ設定
 */
export interface AnalyticsFilter {
  /** レコードID */
  id?: number;
  /** リポジトリキー（"owner/repo" 形式） */
  repo_key: string;
  /** フィルタ名 */
  filter_name: string;
  /** 対象フォルダパスの配列 */
  folder_paths: string[];
  /** フォルダ結合条件（AND/OR） */
  operator: FilterOperator;
  /** 作成日時 */
  created_at?: string;
}

// ============================================================
// 閲覧記録 API
// ============================================================

/**
 * @description ノートの閲覧を記録する（UPSERT）
 * 既存レコードがある場合は view_count をインクリメントし、last_viewed_at を更新する。
 *
 * @param {string} repoKey - リポジトリキー（"owner/repo" 形式）
 * @param {string} filePath - ファイルパス
 */
export const recordNoteView = async (repoKey: string, filePath: string): Promise<void> => {
  if (!supabase) return;

  try {
    // まず既存レコードを確認する
    const { data: existing } = await supabase
      .from('note_views')
      .select('id, view_count')
      .eq('repo_key', repoKey)
      .eq('file_path', filePath)
      .single();

    if (existing) {
      // 既存レコードがある場合は view_count をインクリメントする
      await supabase
        .from('note_views')
        .update({
          view_count: existing.view_count + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // 新規レコードを挿入する
      await supabase.from('note_views').insert({
        repo_key: repoKey,
        file_path: filePath,
        view_count: 1,
        last_viewed_at: new Date().toISOString(),
      });
    }
  } catch (error: unknown) {
    console.error('閲覧記録の保存に失敗しました:', error);
  }
};

/**
 * @description 特定リポジトリの全ノート閲覧データを取得する
 *
 * @param {string} repoKey - リポジトリキー
 * @returns {Promise<NoteViewRecord[]>} 閲覧データ配列
 */
export const fetchAllAnalytics = async (repoKey: string): Promise<NoteViewRecord[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('note_views')
      .select('*')
      .eq('repo_key', repoKey)
      .order('view_count', { ascending: false });

    if (error) {
      console.error('アナリティクスの取得に失敗しました:', error);
      return [];
    }

    return data ?? [];
  } catch (error: unknown) {
    console.error('アナリティクスの取得に失敗しました:', error);
    return [];
  }
};

/**
 * @description 特定ノートの閲覧データを取得する
 *
 * @param {string} repoKey - リポジトリキー
 * @param {string} filePath - ファイルパス
 * @returns {Promise<NoteViewRecord | null>} 閲覧データ
 */
export const fetchNoteAnalytics = async (
  repoKey: string,
  filePath: string,
): Promise<NoteViewRecord | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('note_views')
      .select('*')
      .eq('repo_key', repoKey)
      .eq('file_path', filePath)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

/**
 * @description 人気ノートランキングを取得する（上位N件）
 *
 * @param {string} repoKey - リポジトリキー
 * @param {number} limit - 取得件数
 * @returns {Promise<NoteViewRecord[]>} ランキングデータ
 */
export const fetchTopNotes = async (
  repoKey: string,
  limit: number = 10,
): Promise<NoteViewRecord[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('note_views')
      .select('*')
      .eq('repo_key', repoKey)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('ランキングの取得に失敗しました:', error);
      return [];
    }

    return data ?? [];
  } catch (error: unknown) {
    console.error('ランキングの取得に失敗しました:', error);
    return [];
  }
};

// ============================================================
// フィルタ設定 API
// ============================================================

/**
 * @description フィルタ設定を保存する（UPSERT）
 *
 * @param {AnalyticsFilter} filter - フィルタ設定
 * @returns {Promise<AnalyticsFilter | null>} 保存されたフィルタ設定
 */
export const saveAnalyticsFilter = async (
  filter: AnalyticsFilter,
): Promise<AnalyticsFilter | null> => {
  if (!supabase) return null;

  try {
    if (filter.id) {
      // 既存レコードの更新
      const { data, error } = await supabase
        .from('analytics_filters')
        .update({
          filter_name: filter.filter_name,
          folder_paths: filter.folder_paths,
          operator: filter.operator,
        })
        .eq('id', filter.id)
        .select()
        .single();

      if (error) {
        console.error('フィルタ設定の更新に失敗しました:', error);
        return null;
      }
      return data;
    } else {
      // 新規レコードの挿入
      const { data, error } = await supabase
        .from('analytics_filters')
        .insert({
          repo_key: filter.repo_key,
          filter_name: filter.filter_name,
          folder_paths: filter.folder_paths,
          operator: filter.operator,
        })
        .select()
        .single();

      if (error) {
        console.error('フィルタ設定の保存に失敗しました:', error);
        return null;
      }
      return data;
    }
  } catch (error: unknown) {
    console.error('フィルタ設定の保存に失敗しました:', error);
    return null;
  }
};

/**
 * @description フィルタ設定一覧を取得する
 *
 * @param {string} repoKey - リポジトリキー
 * @returns {Promise<AnalyticsFilter[]>} フィルタ設定配列
 */
export const fetchAnalyticsFilters = async (repoKey: string): Promise<AnalyticsFilter[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('analytics_filters')
      .select('*')
      .eq('repo_key', repoKey)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('フィルタ設定の取得に失敗しました:', error);
      return [];
    }

    return data ?? [];
  } catch (error: unknown) {
    console.error('フィルタ設定の取得に失敗しました:', error);
    return [];
  }
};

/**
 * @description フィルタ設定を削除する
 *
 * @param {number} filterId - フィルタ設定ID
 */
export const deleteAnalyticsFilter = async (filterId: number): Promise<void> => {
  if (!supabase) return;

  try {
    await supabase.from('analytics_filters').delete().eq('id', filterId);
  } catch (error: unknown) {
    console.error('フィルタ設定の削除に失敗しました:', error);
  }
};
