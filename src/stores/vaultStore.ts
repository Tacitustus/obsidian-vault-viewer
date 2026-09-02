/**
 * @description Vault の接続情報とファイルツリーを管理する Zustand ストア
 * GitHub API との通信は UI コンポーネントから分離し、このストアに集約する。
 * 将来の編集機能追加時も、このストアにアクションを追加するだけで済む設計。
 *
 * @returns {VaultState & VaultActions} Vault の状態と操作関数
 *
 * @example
 * ```tsx
 * const { connection, nestedTree, isLoading, connect, disconnect } = useVaultStore();
 * ```
 */

import { create } from 'zustand';

import { fetchTree } from '@/lib/githubApi';
import { buildNestedTree } from '@/lib/fileTreeParser';
import { fileContentCache, fileTreeCache } from '@/lib/cache';

import type {
  ApiError,
  GitHubTreeItem,
  TreeNode,
  VaultConnection,
} from '@/types/Vault';

/**
 * @description Vault ストアの状態とアクションの型定義
 */
interface VaultStore {
  /** 接続情報 */
  connection: VaultConnection | null;
  /** ファイルツリー（フラットなパス一覧） */
  flatTree: GitHubTreeItem[];
  /** ネスト構造のファイルツリー */
  nestedTree: TreeNode[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー情報 */
  error: ApiError | null;
  /** 接続済みかどうか */
  isConnected: boolean;
  /** vault に接続する */
  connect: (connection: VaultConnection) => Promise<void>;
  /** vault から切断する */
  disconnect: () => void;
  /** エラーをクリアする */
  clearError: () => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  // 初期状態
  connection: null,
  flatTree: [],
  nestedTree: [],
  isLoading: false,
  error: null,
  isConnected: false,

  // vault に接続し、ファイルツリーを取得する
  connect: async (connection: VaultConnection) => {
    // ローディング開始、エラーをクリアする
    set({ isLoading: true, error: null });

    try {
      // GitHub API からファイルツリーを取得する
      const treeResponse = await fetchTree(connection);

      // blob（ファイル）のみを抽出する（ディレクトリは除外）
      const blobItems = treeResponse.tree.filter(
        (item) => item.type === 'blob',
      );

      // フラットなパス一覧をネスト構造に変換する
      const nested = buildNestedTree(blobItems);

      // ストアを更新する
      set({
        connection,
        flatTree: blobItems,
        nestedTree: nested,
        isLoading: false,
        isConnected: true,
        error: null,
      });
    } catch (error: unknown) {
      // エラーをストアに設定する
      const apiError: ApiError =
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        'message' in error
          ? (error as ApiError)
          : {
              type: 'unknown',
              message: '予期しないエラーが発生しました。',
            };

      set({
        isLoading: false,
        error: apiError,
        isConnected: false,
      });
    }
  },

  // vault から切断し、状態をリセットする
  disconnect: () => {
    // キャッシュもクリアする
    fileContentCache.clear();
    fileTreeCache.clear();

    set({
      connection: null,
      flatTree: [],
      nestedTree: [],
      isLoading: false,
      error: null,
      isConnected: false,
    });
  },

  // エラーをクリアする
  clearError: () => {
    set({ error: null });
  },
}));
