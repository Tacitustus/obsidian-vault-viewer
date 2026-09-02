/**
 * @description タグ一覧表示コンポーネント（Molecule）
 * ノートのフロントマターと本文から抽出されたタグをバッジ形式で一覧表示する。
 *
 * @param {{ tags: string[]; className?: string }} props
 * @returns {JSX.Element | null} タグ一覧要素（タグが空の場合は null）
 *
 * @example
 * ```tsx
 * <TagList tags={['JavaScript', 'React', 'TypeScript']} />
 * ```
 */

import { Tag } from 'lucide-react';

import { Badge } from '@/components/atoms/Badge';

interface TagListProps {
  /** 表示するタグ配列 */
  tags: string[];
  /** 追加のCSSクラス */
  className?: string;
}

export const TagList = ({ tags, className = '' }: TagListProps) => {
  // タグが空の場合は何も表示しない
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-start gap-2 flex-wrap ${className}`}>
      {/* タグアイコン */}
      <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />

      {/* タグバッジ一覧 */}
      {tags.map((tag) => (
        <Badge key={tag} tag={tag} />
      ))}
    </div>
  );
};
