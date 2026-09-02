import { useState, useEffect, useCallback } from 'react';

/**
 * @description useMediaQuery フックの戻り値の型定義
 */
interface UseMediaQueryResult {
  /** メディアクエリがマッチしているかどうか */
  matches: boolean;
}

/**
 * @description CSSメディアクエリの一致状態を監視するカスタムフック
 * ウィンドウサイズの変更などに応じてリアクティブに更新される。
 *
 * @param {string} query - CSSメディアクエリ文字列
 * @returns {UseMediaQueryResult} メディアクエリの一致状態
 *
 * @example
 * ```tsx
 * const { matches: isMobile } = useMediaQuery('(max-width: 768px)');
 * ```
 */
export const useMediaQuery = (query: string): UseMediaQueryResult => {
  // メディアクエリの一致状態を管理する
  const [matches, setMatches] = useState(() => {
    // SSR 対応: window が存在しない場合は false を返す
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  /**
   * メディアクエリの変更イベントハンドラー
   */
  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    // メディアクエリリストを作成する
    const mediaQueryList = window.matchMedia(query);

    // 初期値を設定する
    setMatches(mediaQueryList.matches);

    // 変更イベントをリッスンする
    mediaQueryList.addEventListener('change', handleChange);

    // クリーンアップ: イベントリスナーを解除する
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return { matches };
};
