/**
 * @description アプリケーション全体で使用する共通の型定義
 */

/**
 * @description 子要素を持つコンポーネントのプロパティ型
 */
export interface WithChildren {
  /** 子要素 */
  children: React.ReactNode;
}

/**
 * @description className を受け取るコンポーネントのプロパティ型
 */
export interface WithClassName {
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * @description 基本的なコンポーネントプロパティ型（children + className）
 */
export interface BaseComponentProps extends WithChildren, WithClassName {}
