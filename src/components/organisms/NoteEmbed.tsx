/**
 * @description ノート埋め込み表示コンポーネント（Organism）
 * `![[ノート名]]` 記法で参照されたノートの内容をその場に埋め込み表示する。
 * 再帰の深さ制限と循環参照検出により無限ループを防止する。
 *
 * @param {{ target: string; depth?: number; visitedPaths?: Set<string> }} props
 * @returns {JSX.Element} 埋め込みノート要素
 *
 * @example
 * ```tsx
 * <NoteEmbed target="MyNote" depth={0} />
 * ```
 */

import { useEffect, useState, useCallback } from 'react';

import { useVaultStore } from '@/stores/vaultStore';
import { useWikilinkResolver } from '@/hooks/useWikilinkResolver';
import { fetchFileContent, decodeBase64Content } from '@/lib/githubApi';
import { parseNote } from '@/lib/markdownParser';
import { Spinner } from '@/components/atoms/Spinner';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';

import type { ApiError, ParsedNote } from '@/types/Vault';

// 最大埋め込み深さ: これ以上のネストは表示しない
const MAX_EMBED_DEPTH = 3;

interface NoteEmbedProps {
  /** 埋め込み対象のノート名 */
  target: string;
  /** 現在の埋め込み深さ（デフォルト: 0） */
  depth?: number;
  /** 訪問済みノートパスのセット（循環参照防止用） */
  visitedPaths?: Set<string>;
}

export const NoteEmbed = ({ target, depth = 0, visitedPaths = new Set() }: NoteEmbedProps) => {
  // ストアから接続情報を取得する
  const connection = useVaultStore((state) => state.connection);

  // wikilink 解決フックを使用する
  const { resolveFilePath } = useWikilinkResolver();

  // ノートの状態を管理する
  const [parsedNote, setParsedNote] = useState<ParsedNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイルパスを解決する
  const resolvedPath = resolveFilePath(target);

  const isDepthLimit = depth >= MAX_EMBED_DEPTH;
  const isCircular = resolvedPath ? visitedPaths.has(resolvedPath) : false;
  const shouldFetch = !isDepthLimit && !isCircular && !!resolvedPath;

  // ノートを取得する
  const loadNote = useCallback(async () => {
    if (!connection || !shouldFetch || !resolvedPath) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await fetchFileContent(connection, resolvedPath);
      const rawMarkdown = decodeBase64Content(fileContent.content);
      const note = parseNote(rawMarkdown);
      setParsedNote(note);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message ?? 'ノートの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [connection, resolvedPath, shouldFetch]);

  // マウント時にノートを取得する
  useEffect(() => {
    void loadNote();
  }, [loadNote]);

  // 埋め込み深さ制限チェック
  if (isDepthLimit) {
    return (
      <div className="wiki-embed-limit p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-700 dark:text-yellow-300">
        ⚠ 埋め込みの上限に達しました: {target}
      </div>
    );
  }

  // 循環参照チェック
  if (isCircular) {
    return (
      <div className="wiki-embed-circular p-3 rounded-lg border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/20 text-sm text-orange-700 dark:text-orange-300">
        🔄 循環参照を検出しました: {target}
      </div>
    );
  }

  // 未解決リンクの場合
  if (!resolvedPath) {
    return (
      <div className="wiki-embed-unresolved p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-500 dark:text-gray-400">
        📄 ノートが見つかりません: {target}
      </div>
    );
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="wiki-embed-loading flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{target} を読み込み中...</span>
      </div>
    );
  }

  // エラー時
  if (error) {
    return <ErrorMessage message={error} type="error" />;
  }

  // ノートが取得できた場合
  if (!parsedNote) {
    return null;
  }

  // 訪問済みパスに現在のパスを追加する
  const newVisitedPaths = new Set(visitedPaths);
  newVisitedPaths.add(resolvedPath);

  // 埋め込みノートを表示する（react-markdown は NoteRenderer 側で処理するため、ここでは本文テキストのみ表示）
  return (
    <div className="wiki-embed my-3 rounded-xl border border-primary-200/50 dark:border-primary-700/30 bg-primary-50/30 dark:bg-primary-900/10 overflow-hidden">
      {/* 埋め込みヘッダー */}
      <div className="px-4 py-2 border-b border-primary-200/30 dark:border-primary-700/20 bg-primary-50/50 dark:bg-primary-900/20">
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
          📎 {target}
        </span>
      </div>

      {/* 埋め込みコンテンツ */}
      <div className="p-4 prose-embed text-sm">
        {/* シンプルなテキスト表示（再帰的なMarkdownレンダリングは depth 制限内で行う） */}
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {parsedNote.body.slice(0, 2000)}
          {parsedNote.body.length > 2000 && (
            <span className="text-gray-400 dark:text-gray-500">... (省略)</span>
          )}
        </div>
      </div>
    </div>
  );
};
