/**
 * @description アナリティクスパネルコンポーネント（Molecule）
 * ノート上部に表示される閲覧回数・最終閲覧日時のミニパネル。
 *
 * @param {{ filePath: string }} props
 * @returns {JSX.Element | null} アナリティクスパネル要素
 *
 * @example
 * ```tsx
 * <AnalyticsPanel filePath="notes/hello.md" />
 * ```
 */

import { Eye, Clock } from 'lucide-react';

import { useAnalyticsStore } from '@/stores/analyticsStore';
import { formatDate } from '@/utils/formatDate';

interface AnalyticsPanelProps {
  /** ファイルパス */
  filePath: string;
  /** 追加のCSSクラス */
  className?: string;
}

export const AnalyticsPanel = ({ filePath, className = '' }: AnalyticsPanelProps) => {
  // アナリティクスストアからデータを取得する
  const analyticsMap = useAnalyticsStore((state) => state.analyticsMap);
  const isEnabled = useAnalyticsStore((state) => state.isEnabled);
  const memoryViewCounts = useAnalyticsStore((state) => state.memoryViewCounts);

  // 閲覧データを取得する
  const viewCount = isEnabled
    ? (analyticsMap.get(filePath)?.view_count ?? 0)
    : (memoryViewCounts.get(filePath) ?? 0);

  const lastViewedAt = isEnabled ? analyticsMap.get(filePath)?.last_viewed_at : undefined;

  // 閲覧回数が0の場合は表示しない
  if (viewCount === 0) return null;

  return (
    <div
      className={`flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 ${className}`}
    >
      {/* 閲覧回数 */}
      <div className="flex items-center gap-1">
        <Eye className="w-3 h-3" />
        <span>{viewCount} 回閲覧</span>
      </div>

      {/* 最終閲覧日時 */}
      {lastViewedAt && (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>最終: {formatDate(new Date(lastViewedAt))}</span>
        </div>
      )}
    </div>
  );
};
