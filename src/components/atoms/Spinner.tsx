/**
 * @description ローディングスピナーコンポーネント（Atom）
 * API 呼び出し中などの待機状態を視覚的に表現する。
 *
 * @param {{ size?: 'sm' | 'md' | 'lg'; className?: string }} props - スピナーのプロパティ
 * @returns {JSX.Element} スピナー要素
 *
 * @example
 * ```tsx
 * <Spinner size="md" />
 * ```
 */

interface SpinnerProps {
  /** スピナーのサイズ（デフォルト: 'md'） */
  size?: 'sm' | 'md' | 'lg';
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * @description サイズに対応する TailwindCSS クラスのマッピング
 */
const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  return (
    <div
      className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="読み込み中"
    >
      <span className="sr-only">読み込み中...</span>
    </div>
  );
};
