/**
 * @description タグバッジコンポーネント（Atom）
 * ノートのタグを個別のバッジとして表示する。
 *
 * @param {{ tag: string; className?: string }} props
 * @returns {JSX.Element} バッジ要素
 *
 * @example
 * ```tsx
 * <Badge tag="JavaScript" />
 * ```
 */

interface BadgeProps {
  /** 表示するタグ名 */
  tag: string;
  /** 追加のCSSクラス */
  className?: string;
}

export const Badge = ({ tag, className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/30 transition-colors duration-200 hover:bg-primary-200 dark:hover:bg-primary-800/50 ${className}`}
    >
      <span className="mr-1 text-primary-400 dark:text-primary-500">#</span>
      {tag}
    </span>
  );
};
