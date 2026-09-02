/**
 * @description スケルトンローダーコンポーネント（Atom）
 * コンテンツ読み込み中のプレースホルダーとして表示する。
 *
 * @param {{ variant?: 'text' | 'title' | 'block'; lines?: number; className?: string }} props
 * @returns {JSX.Element} スケルトン要素
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="title" />
 * <Skeleton variant="block" className="h-40" />
 * ```
 */

interface SkeletonProps {
  /** スケルトンの種類 */
  variant?: 'text' | 'title' | 'block';
  /** テキストバリアント時の行数（デフォルト: 3） */
  lines?: number;
  /** 追加のCSSクラス */
  className?: string;
}

export const Skeleton = ({
  variant = 'text',
  lines = 3,
  className = '',
}: SkeletonProps) => {
  // ベースのアニメーションクラス
  const baseClass =
    'bg-gray-200 dark:bg-gray-700 rounded animate-pulse';

  // タイトルバリアント: 1行の太い行
  if (variant === 'title') {
    return (
      <div className={`${baseClass} h-8 w-3/4 mb-4 ${className}`} />
    );
  }

  // ブロックバリアント: 大きな矩形
  if (variant === 'block') {
    return (
      <div className={`${baseClass} h-32 w-full ${className}`} />
    );
  }

  // テキストバリアント: 複数行のテキスト風プレースホルダー
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`${baseClass} h-4 ${
            // 最後の行は短くしてリアルさを出す
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};
