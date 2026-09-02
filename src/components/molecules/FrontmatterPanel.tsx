/**
 * @description YAML フロントマターのプロパティ表示パネルコンポーネント（Molecule）
 * ノートの YAML フロントマターを key-value 形式で表示する。
 *
 * @param {{ frontmatter: FrontmatterData; className?: string }} props
 * @returns {JSX.Element | null} フロントマターパネル要素（フロントマターが空の場合は null）
 *
 * @example
 * ```tsx
 * <FrontmatterPanel frontmatter={{ title: 'Hello', date: '2024-01-01' }} />
 * ```
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { FrontmatterData } from '@/types/Vault';

interface FrontmatterPanelProps {
  /** フロントマターデータ */
  frontmatter: FrontmatterData;
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * @description フロントマターの値を表示用文字列に変換する
 * @param {unknown} value - 変換対象の値
 * @returns {string} 表示用文字列
 */
const formatValue = (value: unknown): string => {
  // 配列の場合はカンマ区切りにする
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).join(', ');
  }
  // オブジェクトの場合は JSON 文字列にする
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  // その他は文字列に変換する
  return String(value);
};

export const FrontmatterPanel = ({
  frontmatter,
  className = '',
}: FrontmatterPanelProps) => {
  // フロントマターの展開/折り畳み状態を管理する
  const [isExpanded, setIsExpanded] = useState(true);

  // フロントマターが空の場合は何も表示しない
  const keys = Object.keys(frontmatter);
  if (keys.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden ${className}`}
    >
      {/* ヘッダー（クリックで展開/折り畳み） */}
      <button
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-200"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        Properties
      </button>

      {/* プロパティ一覧 */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-1.5">
          {keys.map((key) => (
            <div
              key={key}
              className="flex gap-3 text-sm"
            >
              {/* キー名 */}
              <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">
                {key}
              </span>
              {/* 値 */}
              <span className="text-gray-700 dark:text-gray-300 break-all">
                {formatValue(frontmatter[key])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
