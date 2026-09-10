/**
 * @description タグ検索パネルコンポーネント（Molecule）
 * 全タグをバッジ形式で一覧表示し、クリックで選択。
 * タグ名のインクリメンタルフィルタにも対応する。
 *
 * @param {{ onSelectFile: (path: string) => void }} props
 * @returns {JSX.Element} タグ検索パネル要素
 *
 * @example
 * ```tsx
 * <TagSearchPanel onSelectFile={handleSelect} />
 * ```
 */

import { useState, useMemo } from 'react';
import { Tag, FileText, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/atoms/Badge';
import { useSearchStore } from '@/stores/searchStore';
import { useTagIndex } from '@/hooks/useTagIndex';
import { Spinner } from '@/components/atoms/Spinner';

interface TagSearchPanelProps {
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
}

export const TagSearchPanel = ({ onSelectFile }: TagSearchPanelProps) => {
  // 検索ストアからタグ選択状態を取得する
  const selectedTag = useSearchStore((state) => state.selectedTag);
  const selectTag = useSearchStore((state) => state.selectTag);
  const clearSelectedTag = useSearchStore((state) => state.clearSelectedTag);

  // タグインデックスを取得する
  const { allTags, tagCounts, getFilesByTag, isLoading } = useTagIndex();

  // タグフィルタクエリ
  const [tagFilter, setTagFilter] = useState('');

  // フィルタ済みタグ一覧
  const filteredTags = useMemo(() => {
    if (!tagFilter.trim()) return allTags;
    const lowerFilter = tagFilter.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(lowerFilter));
  }, [allTags, tagFilter]);

  // 選択中タグのファイル一覧
  const taggedFiles = useMemo(() => {
    if (!selectedTag) return [];
    return getFilesByTag(selectedTag);
  }, [selectedTag, getFilesByTag]);

  // タグ選択ハンドラー
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // 同じタグを再度クリックした場合は選択解除する
      clearSelectedTag();
    } else {
      selectTag(tag);
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spinner />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          タグを収集中...
        </p>
      </div>
    );
  }

  // タグが0件の場合
  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Tag className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          タグが見つかりません
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* タグフィルタ入力 */}
      <div className="px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <input
          type="text"
          placeholder="タグを絞り込み..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
        />
      </div>

      {/* 選択中タグがある場合: ファイル一覧を表示する */}
      {selectedTag ? (
        <div className="flex flex-col">
          {/* 選択中タグのヘッダー */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-primary-50/50 dark:bg-primary-900/10">
            <Tag className="w-3 h-3 text-primary-500" />
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
              #{selectedTag}
            </span>
            <span className="text-[10px] text-gray-400">
              ({taggedFiles.length} 件)
            </span>
            <button
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={clearSelectedTag}
            >
              ✕
            </button>
          </div>

          {/* ファイル一覧 */}
          <div className="overflow-y-auto max-h-[300px]">
            {taggedFiles.map((filePath) => {
              // ファイル名を取得する
              const fileName = filePath.split('/').pop()?.replace(/\.(md|markdown)$/, '') ?? filePath;

              return (
                <button
                  key={filePath}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                  onClick={() => onSelectFile(filePath)}
                >
                  <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {fileName}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 ml-auto flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* タグ一覧をバッジ形式で表示する */
        <div className="p-3 flex flex-wrap gap-1.5 overflow-y-auto max-h-[300px]">
          {filteredTags.map((tag) => (
            <div key={tag} className="flex items-center gap-0.5">
              <Badge
                tag={tag}
                onClick={() => handleTagClick(tag)}
              />
              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                {tagCounts.get(tag) ?? 0}
              </span>
            </div>
          ))}

          {/* フィルタ結果が0件の場合 */}
          {filteredTags.length === 0 && tagFilter.trim() && (
            <p className="w-full text-center text-xs text-gray-500 dark:text-gray-400 py-4">
              「{tagFilter}」に一致するタグはありません
            </p>
          )}
        </div>
      )}
    </div>
  );
};
