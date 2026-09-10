/**
 * @description 検索状態を管理する Zustand ストア
 * 検索モード（ファイル名 / コンテンツ / タグ）、検索クエリ、選択タグを保持する。
 * サイドバーの検索窓とタグ検索の連動に使用する。
 *
 * @returns {SearchStore} 検索の状態と操作関数
 *
 * @example
 * ```tsx
 * const { searchMode, searchQuery, setSearchMode, selectTag } = useSearchStore();
 * ```
 */

import { create } from 'zustand';

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
}

export const useSearchStore = create<SearchStore>((set) => ({
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
}));
