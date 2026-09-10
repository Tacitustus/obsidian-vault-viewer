/**
 * @description タグ一覧表示コンポーネント（Molecule）
 * ノートのフロントマターと本文から抽出されたタグをバッジ形式で一覧表示する。
 * タグクリックでサイドバーのタグ検索機能を起動する。
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
import { useSearchStore } from '@/stores/searchStore';

interface TagListProps {
  /** 表示するタグ配列 */
  tags: string[];
  /** 追加のCSSクラス */
  className?: string;
}

export const TagList = ({ tags, className = '' }: TagListProps) => {
  // 検索ストアからタグ選択アクションを取得する
  const selectTag = useSearchStore((state) => state.selectTag);

  // タグクリック時にサイドバーのタグ検索を起動する
  const handleTagClick = (tag: string) => {
    selectTag(tag);
  };

  // タグが空の場合は何も表示しない
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-start gap-2 flex-wrap ${className}`}>
      {/* タグアイコン */}
      <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />

      {/* タグバッジ一覧（クリックでタグ検索を起動） */}
      {tags.map((tag) => (
        <Badge key={tag} tag={tag} onClick={handleTagClick} />
      ))}
    </div>
  );
};

