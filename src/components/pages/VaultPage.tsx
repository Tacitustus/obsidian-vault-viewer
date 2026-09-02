/**
 * @description Vault ビューアページコンポーネント（Page）
 * サイドバーで選択されたノートの表示エリア。
 * URL パスからノートのパスを取得し、Markdown をレンダリングする。
 *
 * @returns {JSX.Element} Vault ページ要素
 *
 * @example
 * ```tsx
 * <Route path="/vault/*" element={<VaultPage />} />
 * ```
 */

import { useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

import { useNoteContent } from '@/hooks/useNoteContent';
import { NoteRenderer } from '@/components/organisms/NoteRenderer';
import { FrontmatterPanel } from '@/components/molecules/FrontmatterPanel';
import { TagList } from '@/components/molecules/TagList';
import { Skeleton } from '@/components/atoms/Skeleton';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';

export const VaultPage = () => {
  // URL パスからノートのパスを取得する（`/vault/notes/hello` → `notes/hello`）
  const { '*': notePath } = useParams();

  // ノートのパスを構築する（.md 拡張子を付与する）
  const filePath = notePath ? `${notePath}.md` : null;

  // ノートの内容を取得する
  const { parsedNote, isLoading, error } = useNoteContent(filePath);

  // ノートが選択されていない場合のウェルカム画面
  if (!notePath) {
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
      {/* ノートタイトル（ファイル名から生成） */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {notePath.split('/').pop()?.replace(/\.md$/, '') ?? notePath}
      </h1>

      {/* フロントマターパネル */}
      <FrontmatterPanel
        frontmatter={parsedNote.frontmatter}
        className="mb-6"
      />

      {/* Markdown 本文レンダリング */}
      <ErrorBoundary>
        <NoteRenderer body={parsedNote.body} currentNotePath={filePath ?? undefined} />
      </ErrorBoundary>

      {/* タグ一覧 */}
      <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <TagList tags={parsedNote.tags} />
      </div>
    </div>
  );
};
