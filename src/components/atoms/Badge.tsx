/**
 * @description タグバッジコンポーネント（Atom）
 * ノートのタグを個別のバッジとして表示する。
 * onClick が渡された場合はクリック可能なインタラクティブバッジになる。
 *
 * @param {{ tag: string; onClick?: (tag: string) => void; className?: string }} props
 * @returns {JSX.Element} バッジ要素
 *
 * @example
 * ```tsx
 * <Badge tag="JavaScript" onClick={(tag) => console.log(tag)} />
 * ```
 */

interface BadgeProps {
  /** 表示するタグ名 */
  tag: string;
  /** タグクリック時のコールバック */
  onClick?: (tag: string) => void;
  /** 追加のCSSクラス */
  className?: string;
}

export const Badge = ({ tag, onClick, className = '' }: BadgeProps) => {
  // クリックイベントハンドラー
  const handleClick = () => {
    if (onClick) {
      onClick(tag);
    }
  };

  // キーボードアクセシビリティ用ハンドラー
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(tag);
    }
  };

  // クリック可能かどうかでスタイルとセマンティクスを変える
  const isClickable = !!onClick;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/30 transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800/50 hover:scale-105 hover:shadow-sm active:scale-95'
          : 'hover:bg-primary-200 dark:hover:bg-primary-800/50'
      } ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `タグ「${tag}」で検索する` : undefined}
    >
      <span className="mr-1 text-primary-400 dark:text-primary-500">#</span>
      {tag}
    </span>
  );
};
