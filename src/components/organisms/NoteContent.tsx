/**
 * @description 個別ペイン内のノート表示コンポーネント（Organism）
 * VaultPage のノート表示ロジックを抽出し、タブシステム内で再利用可能にしたもの。
 * 閲覧時にアナリティクスの記録も行う。
 *
 * @param {{ filePath: string | null }} props
 * @returns {JSX.Element} ノートコンテンツ要素
 *
 * @example
 * ```tsx
 * <NoteContent filePath="notes/hello.md" />
 * ```
 */

import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';

import { useNoteContent } from '@/hooks/useNoteContent';
import { useVaultStore } from '@/stores/vaultStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { NoteRenderer } from '@/components/organisms/NoteRenderer';
import { FrontmatterPanel } from '@/components/molecules/FrontmatterPanel';
import { TagList } from '@/components/molecules/TagList';
import { AnalyticsPanel } from '@/components/molecules/AnalyticsPanel';
import { Skeleton } from '@/components/atoms/Skeleton';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';

interface NoteContentProps {
  /** 表示するノートのファイルパス */
  filePath: string | null;
}

export const NoteContent = ({ filePath }: NoteContentProps) => {
  // ノートの内容を取得する
  const { parsedNote, isLoading, error } = useNoteContent(filePath);
  const connection = useVaultStore((state) => state.connection);
  const recordView = useAnalyticsStore((state) => state.recordView);

  // ノート表示時に閲覧回数を記録する
  useEffect(() => {
    if (filePath && connection && parsedNote) {
      const repoKey = `${connection.owner}/${connection.repo}`;
      void recordView(repoKey, filePath);
    }
  }, [filePath, connection, parsedNote, recordView]);

  // ファイルパスからノートタイトルを生成する
  const noteTitle = filePath
    ? (decodeURIComponent(filePath)
        .split('/')
        .pop()
        ?.replace(/\.(md|markdown)$/, '') ?? decodeURIComponent(filePath))
    : null;

  // ノートが選択されていない場合のウェルカム画面
  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20 flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-primary-500 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          ノートを選択してください
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          左のサイドバーからノートを選択すると、ここに内容が表示されます。
        </p>
      </div>
    );
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <Skeleton variant="title" />
        <div className="mt-6">
          <Skeleton variant="text" lines={5} />
        </div>
        <div className="mt-6">
          <Skeleton variant="block" className="h-24" />
        </div>
        <div className="mt-6">
          <Skeleton variant="text" lines={8} />
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <ErrorMessage message={error.message} type="error" />
      </div>
    );
  }

  // ノートが取得できた場合
  if (!parsedNote) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 animate-fade-in">
      {/* 最上部のタグ一覧 */}
      {parsedNote.tags.length > 0 && (
        <div className="mb-4">
          <TagList tags={parsedNote.tags} />
        </div>
      )}

      {/* ノートタイトル（ファイル名から生成） */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {noteTitle}
      </h1>

      {/* アナリティクスパネル */}
      <AnalyticsPanel filePath={filePath} className="mb-4" />

      {/* フロントマターパネル */}
      <FrontmatterPanel frontmatter={parsedNote.frontmatter} className="mb-6" />

      {/* Markdown 本文レンダリング */}
      <ErrorBoundary>
        <NoteRenderer body={parsedNote.body} currentNotePath={filePath} />
      </ErrorBoundary>

      {/* 最下部のタグ一覧 */}
      <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <TagList tags={parsedNote.tags} />
      </div>
    </div>
  );
};
