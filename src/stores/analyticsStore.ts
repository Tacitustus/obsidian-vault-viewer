/**
 * @description アナリティクスの状態を管理する Zustand ストア
 * Supabase からの閲覧データの取得・更新・フィルタリングを行う。
 * Supabase 未設定時はメモリ内のみで動作する。
 *
 * @returns {AnalyticsStore} アナリティクスの状態と操作関数
 *
 * @example
 * ```tsx
 * const { recordView, analytics, topNotes, getViewCount } = useAnalyticsStore();
 * ```
 */

import { create } from 'zustand';

import {
  recordNoteView,
  fetchAllAnalytics,
  fetchTopNotes,
  saveAnalyticsFilter,
  fetchAnalyticsFilters,
  deleteAnalyticsFilter,
} from '@/lib/analyticsApi';
import { isSupabaseEnabled } from '@/lib/supabaseClient';

import type { NoteViewRecord, AnalyticsFilter, FilterOperator } from '@/lib/analyticsApi';

// ============================================================
// 型定義
// ============================================================

/**
 * @description ヒートマップ表示用のノードデータ
 */
export interface HeatMapNode {
  /** ファイルパス */
  filePath: string;
  /** ファイル名 */
  name: string;
  /** 閲覧回数 */
  viewCount: number;
  /** 正規化されたヒート値（0〜1） */
  heatValue: number;
}

/**
 * @description アナリティクスストアの型定義
 */
interface AnalyticsStore {
  /** 全閲覧データ（ファイルパス → レコードのマップ） */
  analyticsMap: Map<string, NoteViewRecord>;
  /** 人気ノートランキング */
  topNotes: NoteViewRecord[];
  /** フィルタ設定一覧 */
  filters: AnalyticsFilter[];
  /** 現在適用中のフィルタ設定 */
  activeFilter: AnalyticsFilter | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** Supabase が利用可能かどうか */
  isEnabled: boolean;
  /** メモリ内閲覧カウント（Supabase 未設定時のフォールバック） */
  memoryViewCounts: Map<string, number>;
  /** ノートの閲覧を記録する */
  recordView: (repoKey: string, filePath: string) => Promise<void>;
  /** 全アナリティクスデータを取得する */
  loadAnalytics: (repoKey: string) => Promise<void>;
  /** 人気ノートランキングを更新する */
  loadTopNotes: (repoKey: string, limit?: number) => Promise<void>;
  /** 特定ノートの閲覧回数を取得する */
  getViewCount: (filePath: string) => number;
  /** ヒートマップデータを生成する */
  getHeatMapData: (folderPaths?: string[], operator?: FilterOperator) => HeatMapNode[];
  /** フィルタ設定一覧を読み込む */
  loadFilters: (repoKey: string) => Promise<void>;
  /** フィルタ設定を保存する */
  saveFilter: (filter: AnalyticsFilter) => Promise<void>;
  /** フィルタ設定を削除する */
  removeFilter: (filterId: number) => Promise<void>;
  /** フィルタを適用する */
  setActiveFilter: (filter: AnalyticsFilter | null) => void;
  /** 最大閲覧回数を取得する */
  getMaxViewCount: () => number;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  // 初期状態
  analyticsMap: new Map(),
  topNotes: [],
  filters: [],
  activeFilter: null,
  isLoading: false,
  isEnabled: isSupabaseEnabled(),
  memoryViewCounts: new Map(),

  // ノートの閲覧を記録する
  recordView: async (repoKey: string, filePath: string) => {
    if (get().isEnabled) {
      // Supabase に記録する
      await recordNoteView(repoKey, filePath);

      // ローカルのマップも更新する（UI 即時反映用）
      set((prev) => {
        const newMap = new Map(prev.analyticsMap);
        const existing = newMap.get(filePath);
        if (existing) {
          newMap.set(filePath, {
            ...existing,
            view_count: existing.view_count + 1,
            last_viewed_at: new Date().toISOString(),
          });
        } else {
          newMap.set(filePath, {
            id: 0,
            repo_key: repoKey,
            file_path: filePath,
            view_count: 1,
            last_viewed_at: new Date().toISOString(),
          });
        }
        return { analyticsMap: newMap };
      });
    } else {
      // メモリ内のみで記録する
      set((prev) => {
        const newCounts = new Map(prev.memoryViewCounts);
        const currentCount = newCounts.get(filePath) ?? 0;
        newCounts.set(filePath, currentCount + 1);
        return { memoryViewCounts: newCounts };
      });
    }
  },

  // 全アナリティクスデータを取得する
  loadAnalytics: async (repoKey: string) => {
    if (!get().isEnabled) return;

    set({ isLoading: true });

    try {
      const records = await fetchAllAnalytics(repoKey);
      const newMap = new Map<string, NoteViewRecord>();
      for (const record of records) {
        newMap.set(record.file_path, record);
      }
      set({ analyticsMap: newMap, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // 人気ノートランキングを更新する
  loadTopNotes: async (repoKey: string, limit: number = 10) => {
    if (!get().isEnabled) return;

    try {
      const topNotes = await fetchTopNotes(repoKey, limit);
      set({ topNotes });
    } catch {
      // エラー時は何もしない
    }
  },

  // 特定ノートの閲覧回数を取得する
  getViewCount: (filePath: string): number => {
    const state = get();
    if (state.isEnabled) {
      return state.analyticsMap.get(filePath)?.view_count ?? 0;
    }
    return state.memoryViewCounts.get(filePath) ?? 0;
  },

  // 最大閲覧回数を取得する
  getMaxViewCount: (): number => {
    const state = get();
    let maxCount = 0;
    if (state.isEnabled) {
      state.analyticsMap.forEach((record) => {
        if (record.view_count > maxCount) {
          maxCount = record.view_count;
        }
      });
    } else {
      state.memoryViewCounts.forEach((count) => {
        if (count > maxCount) {
          maxCount = count;
        }
      });
    }
    return maxCount;
  },

  // ヒートマップデータを生成する
  getHeatMapData: (folderPaths?: string[], operator: FilterOperator = 'or'): HeatMapNode[] => {
    const state = get();
    const maxCount = get().getMaxViewCount();
    if (maxCount === 0) return [];

    // 閲覧データを収集する
    const entries: Array<{ filePath: string; viewCount: number }> = [];

    if (state.isEnabled) {
      state.analyticsMap.forEach((record) => {
        entries.push({ filePath: record.file_path, viewCount: record.view_count });
      });
    } else {
      state.memoryViewCounts.forEach((count, filePath) => {
        entries.push({ filePath, viewCount: count });
      });
    }

    // フォルダフィルタを適用する
    let filtered = entries;
    if (folderPaths && folderPaths.length > 0) {
      if (operator === 'and') {
        // AND: すべてのフォルダパスに一致する必要がある
        filtered = entries.filter((entry) =>
          folderPaths.every((folder) => entry.filePath.startsWith(folder)),
        );
      } else {
        // OR: いずれかのフォルダパスに一致すればよい
        filtered = entries.filter((entry) =>
          folderPaths.some((folder) => entry.filePath.startsWith(folder)),
        );
      }
    }

    // ヒートマップノードに変換する
    return filtered.map((entry) => ({
      filePath: entry.filePath,
      name: entry.filePath.split('/').pop()?.replace(/\.(md|markdown)$/, '') ?? entry.filePath,
      viewCount: entry.viewCount,
      heatValue: entry.viewCount / maxCount,
    }));
  },

  // フィルタ設定一覧を読み込む
  loadFilters: async (repoKey: string) => {
    if (!get().isEnabled) return;

    try {
      const filters = await fetchAnalyticsFilters(repoKey);
      set({ filters });
    } catch {
      // エラー時は何もしない
    }
  },

  // フィルタ設定を保存する
  saveFilter: async (filter: AnalyticsFilter) => {
    if (!get().isEnabled) return;

    const saved = await saveAnalyticsFilter(filter);
    if (saved) {
      // フィルタ一覧を再読み込みする
      await get().loadFilters(filter.repo_key);
    }
  },

  // フィルタ設定を削除する
  removeFilter: async (filterId: number) => {
    if (!get().isEnabled) return;

    await deleteAnalyticsFilter(filterId);

    // ローカル状態を更新する
    set((prev) => ({
      filters: prev.filters.filter((f) => f.id !== filterId),
      activeFilter: prev.activeFilter?.id === filterId ? null : prev.activeFilter,
    }));
  },

  // フィルタを適用する
  setActiveFilter: (filter: AnalyticsFilter | null) => {
    set({ activeFilter: filter });
  },
}));
