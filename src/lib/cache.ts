/**
 * @description メモリベースのキャッシュユーティリティ
 * 同一セッション内で同じファイルを再取得しないようにする。
 * GitHub API のレート制限（未認証60回/時、認証済み5,000回/時）を考慮した設計。
 *
 * @example
 * ```ts
 * const cache = createCache<string>();
 * cache.set('key', 'value');
 * const value = cache.get('key'); // 'value'
 * ```
 */

/**
 * @description キャッシュのインターフェース
 */
export interface Cache<T> {
  /** キャッシュからデータを取得する */
  get: (key: string) => T | undefined;
  /** キャッシュにデータを設定する */
  set: (key: string, value: T) => void;
  /** 指定キーのキャッシュを持っているかチェックする */
  has: (key: string) => boolean;
  /** 指定キーのキャッシュを削除する */
  delete: (key: string) => void;
  /** キャッシュを全てクリアする */
  clear: () => void;
  /** キャッシュのサイズを取得する */
  size: () => number;
}

/**
 * @description メモリベースのキャッシュを作成する
 * Map を使用したシンプルなキャッシュ実装。
 * TTLなし、セッション中有効。
 *
 * @returns {Cache<T>} キャッシュインスタンス
 */
export const createCache = <T>(): Cache<T> => {
  // キャッシュデータを保持する Map
  const store = new Map<string, T>();

  return {
    // キャッシュからデータを取得する
    get: (key: string): T | undefined => {
      return store.get(key);
    },

    // キャッシュにデータを設定する
    set: (key: string, value: T): void => {
      store.set(key, value);
    },

    // 指定キーのキャッシュを持っているかチェックする
    has: (key: string): boolean => {
      return store.has(key);
    },

    // 指定キーのキャッシュを削除する
    delete: (key: string): void => {
      store.delete(key);
    },

    // キャッシュを全てクリアする
    clear: (): void => {
      store.clear();
    },

    // キャッシュのサイズを取得する
    size: (): number => {
      return store.size;
    },
  };
};

// ファイルコンテンツ用のグローバルキャッシュインスタンス
// 同一セッション内で同じファイルの再取得を防止する
export const fileContentCache = createCache<string>();

// ファイルツリー用のグローバルキャッシュインスタンス
// 同一リポジトリのツリーを再取得しないようにする
export const fileTreeCache = createCache<string>();
