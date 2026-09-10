/**
 * @description 検索状態を管理する Zustand ストア
 * 検索モード（ファイル名 / コンテンツ / タグ）、検索クエリ、選択タグを保持する。
 * サイドバーの検索窓とタグ検索の連動に使用する。
 *
 * @returns {SearchStore} 検索の状態と操作関数
 *
 * @example
 * ```tsx
 * const { searchMode, searchQuery, setSearchMode, selectTag, buildTagIndex } = useSearchStore();
 * ```
 */

import { create } from 'zustand';

import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import { parseNote } from '@/lib/markdownParser';

import type { VaultConnection, GitHubTreeItem } from '@/types/Vault';

/**
 * @description 検索モードの種別
 */
export type SearchMode = 'filename' | 'content' | 'tag';

/**
 * @description 検索ストアの状態とアクションの型定義
 */
interface SearchStore {
  /** 検索モード（ファイル名 / コンテンツ / タグ） */
  searchMode: SearchMode;
  /** 検索クエリ文字列 */
  searchQuery: string;
  /** 選択中のタグ名（タグ検索モード時に使用） */
  selectedTag: string | null;
  /** 検索窓にフォーカスしているかどうか */
  isSearchFocused: boolean;
  /** 検索モードを設定する */
  setSearchMode: (mode: SearchMode) => void;
  /** 検索クエリを設定する */
  setSearchQuery: (query: string) => void;
  /** タグを選択してタグ検索モードに切り替える */
  selectTag: (tag: string) => void;
  /** タグ選択をクリアする */
  clearSelectedTag: () => void;
  /** 検索窓のフォーカス状態を設定する */
  setSearchFocused: (focused: boolean) => void;
  /** 検索状態をすべてリセットする */
  resetSearch: () => void;

  // --- タグインデックス ---
  /** タグ名 → 該当ファイルパス一覧のマップ */
  tagMap: Map<string, string[]>;
  /** 全タグ名の配列（出現回数降順でソート済み） */
  allTags: string[];
  /** タグごとの出現回数マップ */
  tagCounts: Map<string, number>;
  /** タグインデックスのローディング状態 */
  isLoadingTags: boolean;
  /** タグインデックスが構築済みかどうか */
  isTagIndexReady: boolean;
  /** タグインデックスを構築する */
  buildTagIndex: (connection: VaultConnection, flatTree: GitHubTreeItem[]) => Promise<void>;
  /** 特定タグでフィルタしたファイルパス一覧を取得する */
  getFilesByTag: (tag: string) => string[];
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  // 初期状態
  searchMode: 'filename',
  searchQuery: '',
  selectedTag: null,
  isSearchFocused: false,

  // 検索モードを設定する
  setSearchMode: (mode: SearchMode) => {
    set({
      searchMode: mode,
      // モード切替時にタグ選択をクリアする
      selectedTag: mode !== 'tag' ? null : undefined,
    });
  },

  // 検索クエリを設定する
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // タグを選択してタグ検索モードに切り替える
  selectTag: (tag: string) => {
    set({
      searchMode: 'tag',
      selectedTag: tag,
      searchQuery: '',
      isSearchFocused: false,
    });
  },

  // タグ選択をクリアする
  clearSelectedTag: () => {
    set({ selectedTag: null });
  },

  // 検索窓のフォーカス状態を設定する
  setSearchFocused: (focused: boolean) => {
    set({ isSearchFocused: focused });
  },

  // 検索状態をすべてリセットする
  resetSearch: () => {
    set({
      searchMode: 'filename',
      searchQuery: '',
      selectedTag: null,
      isSearchFocused: false,
    });
  },

  // --- タグインデックス ---
  tagMap: new Map(),
  allTags: [],
  tagCounts: new Map(),
  isLoadingTags: false,
  isTagIndexReady: false,

  // 特定タグでフィルタしたファイルパス一覧を取得する
  getFilesByTag: (tag: string) => {
    return get().tagMap.get(tag) ?? [];
  },

  // タグインデックスを構築する
  buildTagIndex: async (connection: VaultConnection, flatTree: GitHubTreeItem[]) => {
    const state = get();
    // 既に構築済み、または現在構築中の場合はスキップ
    if (state.isTagIndexReady || state.isLoadingTags) {
      return;
    }

    const mdFiles = flatTree.filter(
      (item) => item.path.endsWith('.md') || item.path.endsWith('.markdown'),
    );

    if (mdFiles.length === 0) {
      set({
        tagMap: new Map(),
        allTags: [],
        tagCounts: new Map(),
        isTagIndexReady: true,
      });
      return;
    }

    set({ isLoadingTags: true });

    const newTagMap = new Map<string, string[]>();

    try {
      // 全 Markdown ファイルを走査してタグを収集する
      // バッチ処理でAPIコールを分散する
      const batchSize = 10;
      for (let i = 0; i < mdFiles.length; i += batchSize) {
        const batch = mdFiles.slice(i, i + batchSize);
        const fetchPromises = batch.map(async (file) => {
          try {
            // ファイルコンテンツを取得する（キャッシュが効く）
            const content = await fetchFileContent(connection, file.path);
            const rawMarkdown = decodeBase64Content(content.content);

            // ノートをパースしてタグを抽出する
            const parsed = parseNote(rawMarkdown);

            // タグごとにファイルパスを登録する
            for (const tag of parsed.tags) {
              const existing = newTagMap.get(tag) ?? [];
              if (!existing.includes(file.path)) {
                existing.push(file.path);
                newTagMap.set(tag, existing);
              }
            }
          } catch {
            // 個別ファイルのエラーはスキップする
          }
        });

        await Promise.all(fetchPromises);
      }

      // 構築完了後の計算
      const newAllTags = Array.from(newTagMap.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([tag]) => tag);

      const newTagCounts = new Map<string, number>();
      newTagMap.forEach((files, tag) => {
        newTagCounts.set(tag, files.length);
      });

      set({
        tagMap: newTagMap,
        allTags: newAllTags,
        tagCounts: newTagCounts,
        isLoadingTags: false,
        isTagIndexReady: true,
      });
    } catch {
      set({ isLoadingTags: false });
    }
  },
}));
