/**
 * @description アナリティクスダッシュボードコンポーネント（Organism）
 * サイドバー下部に配置される折り畳み可能なダッシュボード。
 * 人気ノートランキング、ヒートマップ、フィルタ設定を含む。
 *
 * @param {{ onSelectFile: (path: string) => void }} props
 * @returns {JSX.Element} アナリティクスダッシュボード要素
 *
 * @example
 * ```tsx
 * <AnalyticsDashboard onSelectFile={handleSelect} />
 * ```
 */

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  Flame,
  Plus,
  Trash2,
  FolderTree,
} from 'lucide-react';

import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useVaultStore } from '@/stores/vaultStore';

import type { AnalyticsFilter, FilterOperator } from '@/lib/analyticsApi';
import type { HeatMapNode } from '@/stores/analyticsStore';

interface AnalyticsDashboardProps {
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
}

/**
 * @description ヒート値から色を生成する（青→黄→赤のグラデーション）
 * @param {number} heatValue - 0〜1 の正規化されたヒート値
 * @returns {string} CSS color 値
 */
const getHeatColor = (heatValue: number): string => {
  // 0: 青（低い）→ 0.5: 黄（中間）→ 1: 赤（高い）
  if (heatValue <= 0.5) {
    // 青→黄
    const t = heatValue * 2;
    const r = Math.round(59 + t * (250 - 59));
    const g = Math.round(130 + t * (204 - 130));
    const b = Math.round(246 - t * 246);
    return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
  } else {
    // 黄→赤
    const t = (heatValue - 0.5) * 2;
    const r = Math.round(250 + t * (239 - 250));
    const g = Math.round(204 - t * (136));
    const b = Math.round(0 + t * 68);
    return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
  }
};

export const AnalyticsDashboard = ({ onSelectFile }: AnalyticsDashboardProps) => {
  // ストアから状態を取得する
  const connection = useVaultStore((state) => state.connection);
  const nestedTree = useVaultStore((state) => state.nestedTree);
  const {
    topNotes,
    filters,
    activeFilter,
    isEnabled,
    loadAnalytics,
    loadTopNotes,
    loadFilters,
    saveFilter,
    removeFilter,
    setActiveFilter,
    getHeatMapData,
  } = useAnalyticsStore();

  // UI 状態
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRanking, setShowRanking] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showFilterEditor, setShowFilterEditor] = useState(false);

  // フィルタ編集用の状態
  const [editFilterName, setEditFilterName] = useState('');
  const [editFolderPaths, setEditFolderPaths] = useState<string[]>([]);
  const [editOperator, setEditOperator] = useState<FilterOperator>('or');

  // リポジトリキーを取得する
  const repoKey = connection ? `${connection.owner}/${connection.repo}` : '';

  // ダッシュボード展開時にデータをロードする
  useEffect(() => {
    if (isExpanded && repoKey && isEnabled) {
      void loadAnalytics(repoKey);
      void loadTopNotes(repoKey, 10);
      void loadFilters(repoKey);
    }
  }, [isExpanded, repoKey, isEnabled, loadAnalytics, loadTopNotes, loadFilters]);

  // ヒートマップデータを取得する
  const heatMapData = useMemo((): HeatMapNode[] => {
    if (!showHeatMap) return [];
    if (activeFilter) {
      return getHeatMapData(activeFilter.folder_paths, activeFilter.operator);
    }
    return getHeatMapData();
  }, [showHeatMap, activeFilter, getHeatMapData]);

  // フォルダパス一覧を取得する（フィルタ設定用）
  const folderPaths = useMemo(() => {
    const folders: string[] = [];
    const collectFolders = (nodes: typeof nestedTree, prefix: string = '') => {
      for (const node of nodes) {
        if (node.isDirectory) {
          const path = prefix ? `${prefix}/${node.name}` : node.name;
          folders.push(path);
          collectFolders(node.children, path);
        }
      }
    };
    collectFolders(nestedTree);
    return folders;
  }, [nestedTree]);

  // フィルタ保存ハンドラー
  const handleSaveFilter = async () => {
    if (!editFilterName.trim() || editFolderPaths.length === 0) return;
    const filter: AnalyticsFilter = {
      repo_key: repoKey,
      filter_name: editFilterName,
      folder_paths: editFolderPaths,
      operator: editOperator,
    };
    await saveFilter(filter);
    // フォーム初期化
    setEditFilterName('');
    setEditFolderPaths([]);
    setEditOperator('or');
    setShowFilterEditor(false);
  };

  // Supabase 無効時のメッセージ
  if (!isEnabled) {
    return null;
  }

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-700/50">
      {/* ダッシュボードヘッダー（クリックで展開/折り畳み） */}
      <button
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <BarChart3 className="w-3.5 h-3.5" />
        アナリティクス
      </button>

      {/* ダッシュボード本体 */}
      {isExpanded && (
        <div className="px-2 pb-3 space-y-2 animate-slide-down">
          {/* タブ切替 */}
          <div className="flex gap-1 px-1">
            <button
              className={`flex-1 text-[10px] py-1 rounded-md transition-colors ${
                showRanking
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => { setShowRanking(true); setShowHeatMap(false); }}
            >
              <Eye className="w-3 h-3 inline-block mr-0.5" />
              ランキング
            </button>
            <button
              className={`flex-1 text-[10px] py-1 rounded-md transition-colors ${
                showHeatMap
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => { setShowHeatMap(true); setShowRanking(false); }}
            >
              <Flame className="w-3 h-3 inline-block mr-0.5" />
              ヒートマップ
            </button>
          </div>

          {/* ランキング表示 */}
          {showRanking && (
            <div className="space-y-0.5">
              {topNotes.length === 0 ? (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center py-3">
                  閲覧データがありません
                </p>
              ) : (
                topNotes.slice(0, 10).map((note, index) => {
                  // ファイル名を取得する
                  const fileName = note.file_path.split('/').pop()?.replace(/\.(md|markdown)$/, '') ?? note.file_path;
                  // ランキング色
                  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
                  const rankColor = rankColors[index] ?? 'text-gray-400 dark:text-gray-500';

                  return (
                    <button
                      key={note.file_path}
                      className="flex items-center gap-2 w-full px-2 py-1 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
                      onClick={() => onSelectFile(note.file_path)}
                    >
                      {/* ランキング順位 */}
                      <span className={`text-[10px] font-bold w-4 text-right ${rankColor}`}>
                        {index + 1}
                      </span>
                      {/* ファイル名 */}
                      <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate flex-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {fileName}
                      </span>
                      {/* 閲覧回数 */}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {note.view_count}回
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ヒートマップ表示 */}
          {showHeatMap && (
            <div className="space-y-2">
              {/* フィルタ切替 */}
              <div className="flex items-center gap-1 px-1">
                <FolderTree className="w-3 h-3 text-gray-400" />
                <select
                  className="flex-1 text-[10px] bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-primary-500"
                  value={activeFilter?.id?.toString() ?? ''}
                  onChange={(e) => {
                    const filterId = e.target.value;
                    if (!filterId) {
                      setActiveFilter(null);
                    } else {
                      const filter = filters.find((f) => f.id?.toString() === filterId);
                      if (filter) setActiveFilter(filter);
                    }
                  }}
                >
                  <option value="">全ファイル</option>
                  {filters.map((filter) => (
                    <option key={filter.id} value={filter.id?.toString()}>
                      {filter.filter_name}
                    </option>
                  ))}
                </select>

                {/* フィルタ追加ボタン */}
                <button
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowFilterEditor((prev) => !prev)}
                  title="フィルタを追加"
                >
                  <Plus className="w-3 h-3 text-gray-400" />
                </button>
              </div>

              {/* フィルタエディター */}
              {showFilterEditor && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg space-y-1.5 border border-gray-200/50 dark:border-gray-700/50">
                  <input
                    type="text"
                    placeholder="フィルタ名"
                    value={editFilterName}
                    onChange={(e) => setEditFilterName(e.target.value)}
                    className="w-full text-[10px] px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary-500"
                  />

                  {/* 演算子の選択 */}
                  <div className="flex gap-1">
                    <button
                      className={`flex-1 text-[10px] py-0.5 rounded ${
                        editOperator === 'or'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                      onClick={() => setEditOperator('or')}
                    >
                      OR (いずれか)
                    </button>
                    <button
                      className={`flex-1 text-[10px] py-0.5 rounded ${
                        editOperator === 'and'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                      onClick={() => setEditOperator('and')}
                    >
                      AND (すべて)
                    </button>
                  </div>

                  {/* フォルダ選択 */}
                  <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                    {folderPaths.map((folder) => (
                      <label key={folder} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={editFolderPaths.includes(folder)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditFolderPaths((prev) => [...prev, folder]);
                            } else {
                              setEditFolderPaths((prev) => prev.filter((p) => p !== folder));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-500"
                        />
                        {folder}
                      </label>
                    ))}
                  </div>

                  <button
                    className="w-full text-[10px] py-1 rounded bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                    onClick={() => void handleSaveFilter()}
                    disabled={!editFilterName.trim() || editFolderPaths.length === 0}
                  >
                    保存
                  </button>
                </div>
              )}

              {/* 既存フィルタの削除 */}
              {activeFilter && activeFilter.id && (
                <button
                  className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-500 transition-colors px-1"
                  onClick={() => {
                    if (activeFilter.id) {
                      void removeFilter(activeFilter.id);
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  このフィルタを削除
                </button>
              )}

              {/* ヒートマップ本体 */}
              <div className="grid grid-cols-4 gap-1 p-1">
                {heatMapData.length === 0 ? (
                  <p className="col-span-4 text-[10px] text-gray-400 dark:text-gray-500 text-center py-3">
                    閲覧データがありません
                  </p>
                ) : (
                  heatMapData.map((node) => (
                    <button
                      key={node.filePath}
                      className="relative aspect-square rounded-md overflow-hidden transition-transform duration-150 hover:scale-110 hover:z-10 group"
                      style={{ backgroundColor: getHeatColor(node.heatValue) }}
                      onClick={() => onSelectFile(node.filePath)}
                      title={`${node.name} (${String(node.viewCount)}回)`}
                    >
                      {/* ファイル名オーバーレイ */}
                      <div className="absolute inset-0 flex items-center justify-center p-0.5">
                        <span className="text-[8px] font-medium text-white text-center leading-tight line-clamp-2 drop-shadow-sm">
                          {node.name}
                        </span>
                      </div>
                      {/* ホバー時の閲覧回数 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.viewCount}回
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* 凡例 */}
              {heatMapData.length > 0 && (
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[9px] text-gray-400">少</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: getHeatColor(i / 9) }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-400">多</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
