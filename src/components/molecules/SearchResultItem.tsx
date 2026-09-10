/**
 * @description 検索結果アイテムコンポーネント（Molecule）
 * ファイル名マッチとコンテンツマッチの検索結果を区別して表示する。
 * コンテンツマッチ時はマッチ箇所のスニペットをプレビュー表示する。
 *
 * @param {{ result: SearchResult; onSelectFile: (path: string) => void }} props
 * @returns {JSX.Element} 検索結果アイテム要素
 *
 * @example
 * ```tsx
 * <SearchResultItem result={result} onSelectFile={handleSelect} />
 * ```
 */

import { FileText, Type, AlignLeft } from 'lucide-react';

import type { SearchResult } from '@/hooks/useFileTree';

interface SearchResultItemProps {
  /** 検索結果データ */
  result: SearchResult;
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
  /** 検索クエリ（ハイライト用） */
  searchQuery?: string;
}

export const SearchResultItem = ({
  result,
  onSelectFile,
  searchQuery = '',
}: SearchResultItemProps) => {
  // クリックハンドラー
  const handleClick = () => {
    onSelectFile(result.filePath);
  };

  // ファイル名を取得する
  const fileName = result.node.name.replace(/\.(md|markdown)$/, '');

  // ファイルの親ディレクトリパスを取得する
  const dirPath = result.filePath.split('/').slice(0, -1).join('/');

  /**
   * @description テキスト内のマッチ箇所をハイライトする
   * @param {string} text - ハイライト対象テキスト
   * @param {string} query - 検索クエリ
   * @returns {React.ReactNode} ハイライト済みテキスト
   */
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) return text;

    // マッチ前後のテキストを分割してハイライトする
    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + query.length);
    const after = text.slice(matchIndex + query.length);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-800/60 text-inherit rounded-sm px-0.5">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div
      className="flex flex-col gap-0.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* ファイル名行 */}
      <div className="flex items-center gap-2">
        {/* マッチ種別アイコン */}
        {result.matchType === 'filename' ? (
          <Type className="w-3 h-3 text-blue-400 flex-shrink-0" />
        ) : (
          <AlignLeft className="w-3 h-3 text-green-400 flex-shrink-0" />
        )}

        {/* ファイルアイコン */}
        <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />

        {/* ファイル名 */}
        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
          {highlightMatch(fileName, searchQuery)}
        </span>
      </div>

      {/* ディレクトリパス */}
      {dirPath && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-[26px] truncate">
          {dirPath}
        </span>
      )}

      {/* コンテンツマッチ時のスニペット */}
      {result.matchType === 'content' && result.snippet && (
        <div className="ml-[26px] mt-0.5 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800/40 border-l-2 border-green-400 dark:border-green-600">
          <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
            {highlightMatch(result.snippet, searchQuery)}
          </p>
        </div>
      )}
    </div>
  );
};
