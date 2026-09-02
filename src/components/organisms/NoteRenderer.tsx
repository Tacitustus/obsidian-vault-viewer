/**
 * @description Markdown レンダリングコンポーネント（Organism）
 * react-markdown + remark-gfm + 自前の remarkObsidianLink プラグインで
 * Obsidian Markdown をレンダリングする。wikilink と embed のカスタムコンポーネントマッピング含む。
 *
 * @param {{ body: string; currentNotePath?: string }} props
 * @returns {JSX.Element} レンダリング済み Markdown 要素
 *
 * @example
 * ```tsx
 * <NoteRenderer body={markdownContent} currentNotePath="notes/hello.md" />
 * ```
 */

import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

import { remarkObsidianLink } from '@/lib/remark/remarkObsidianLink';
import { useWikilinkResolver } from '@/hooks/useWikilinkResolver';
import { useVaultStore } from '@/stores/vaultStore';
import { buildRawImageUrl, fetchFileContent, buildBase64ImageUrl } from '@/lib/githubApi';
import { NoteEmbed } from '@/components/organisms/NoteEmbed';

import type { Components } from 'react-markdown';
import type { VaultConnection } from '@/types/Vault';

interface NoteRendererProps {
  /** Markdown 本文（フロントマター除去済み） */
  body: string;
  /** 現在表示中のノートのパス（相対パス解決用） */
  currentNotePath?: string;
}

export const NoteRenderer = ({
  body,
  currentNotePath,
}: NoteRendererProps) => {
  // wikilink 解決フック
  const { resolveWikilink, resolveFilePath } = useWikilinkResolver();
  const connection = useVaultStore((state) => state.connection);

  // remark プラグイン配列をメモ化する
  const remarkPlugins = useMemo(() => [remarkGfm, remarkObsidianLink], []);

  // カスタムコンポーネントマッピングを定義する
  const components: Components = useMemo(
    () => ({
      // wikiLink カスタムノード → WikiLink コンポーネント
      'wiki-link': ({
        target,
        alias,
        heading,
        ...props
      }: {
        target?: string;
        alias?: string;
        heading?: string;
        children?: React.ReactNode;
      } & React.HTMLAttributes<HTMLElement>) => {
        if (!target) return <span {...props} />;

        // wikilink を解決する
        const resolved = resolveWikilink(
          target,
          alias ?? undefined,
          heading ?? undefined,
        );

        // 表示テキスト
        const displayText = alias || target;

        if (resolved.isResolved && resolved.resolvedPath) {
          // 解決済み: React Router のリンクとして表示する
          const vaultPath = resolved.resolvedPath.replace(/\.md$/, '');
          // TODO: [[Note#見出し]] の見出しへのスクロールは今後実装する
          return (
            <Link
              to={`/vault/${vaultPath}`}
              className="wiki-link-resolved text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-300 dark:decoration-primary-600 underline-offset-2 hover:decoration-primary-500 transition-colors duration-200"
              title={`${target}${heading ? `#${heading}` : ''}`}
            >
              {displayText}
            </Link>
          );
        }

        // 未解決: 未作成リンクとして破線表示する
        return (
          <span
            className="wiki-link-unresolved text-gray-500 dark:text-gray-400 border-b border-dashed border-gray-400 dark:border-gray-500 cursor-help"
            title={`未作成: ${target}`}
          >
            {displayText}
          </span>
        );
      },

      // wikiEmbed カスタムノード → 埋め込みコンポーネント
      'wiki-embed': ({
        target,
        embedType: embedTypeProp,
        width,
      }: {
        target?: string;
        embedType?: string;
        width?: number;
      } & React.HTMLAttributes<HTMLElement>) => {
        if (!target) return null;

        const embedType = embedTypeProp ?? 'note';

        // 画像埋め込みの場合
        if (embedType === 'image') {
          return (
            <EmbedImage
              target={target}
              width={width}
              connection={connection}
              resolveFilePath={resolveFilePath}
            />
          );
        }

        // PDF埋め込みの場合: ダウンロードリンクとして表示する
        if (embedType === 'pdf') {
          return (
            <div className="wiki-embed-pdf p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                📄 PDF: {target}
              </span>
            </div>
          );
        }

        // ノート埋め込みの場合
        return <NoteEmbed target={target} depth={0} />;
      },

      // 標準 Markdown 画像のカスタムレンダリング
      img: ({
        src,
        alt,
        ...props
      }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        // 外部URL の場合はそのまま表示する
        if (src?.startsWith('http://') || src?.startsWith('https://')) {
          return (
            <img
              src={src}
              alt={alt ?? ''}
              className="max-w-full h-auto rounded-lg my-2"
              loading="lazy"
              {...props}
            />
          );
        }

        // リポジトリ内の画像: パスを解決して表示する
        if (src && connection) {
          let resolvedSrc = src;
          // 相対パスの場合、現在のノートのディレクトリを基準にする
          if (currentNotePath && !src.startsWith('/')) {
            const currentDir = currentNotePath
              .split('/')
              .slice(0, -1)
              .join('/');
            resolvedSrc = currentDir ? `${currentDir}/${src}` : src;
          }
          const imageUrl = buildRawImageUrl(connection, resolvedSrc);
          return (
            <img
              src={imageUrl}
              alt={alt ?? ''}
              className="max-w-full h-auto rounded-lg my-2"
              loading="lazy"
              {...props}
            />
          );
        }

        return <img src={src} alt={alt ?? ''} {...props} />;
      },

      // リンクの target="_blank" 設定（外部リンク）
      a: ({
        href,
        children,
        ...props
      }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        // 外部リンクの場合は新しいタブで開く
        if (
          href?.startsWith('http://') ||
          href?.startsWith('https://')
        ) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2 transition-colors duration-200"
              {...props}
            >
              {children}
            </a>
          );
        }

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },

      // テーブルのスタイリング
      table: ({
        children,
        ...props
      }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-4">
          <table
            className="min-w-full border-collapse border border-gray-200 dark:border-gray-700"
            {...props}
          >
            {children}
          </table>
        </div>
      ),

      th: ({
        children,
        ...props
      }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th
          className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </th>
      ),

      td: ({
        children,
        ...props
      }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </td>
      ),

      // タスクリストのスタイリング
      input: (props: React.InputHTMLAttributes<HTMLInputElement>) => {
        if (props.type === 'checkbox') {
          return (
            <input
              {...props}
              disabled
              className="mr-2 rounded border-gray-300 dark:border-gray-600 text-primary-500"
            />
          );
        }
        return <input {...props} />;
      },

      // コードブロックのスタイリング
      code: ({
        children,
        className,
        ...props
      }: React.HTMLAttributes<HTMLElement>) => {
        // インラインコードの場合
        const isInline = !className;
        if (isInline) {
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-primary-600 dark:text-primary-400 font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        // フェンスドコードブロックの場合
        return (
          <code className={`${className ?? ''} font-mono text-sm`} {...props}>
            {children}
          </code>
        );
      },

      pre: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLPreElement>) => (
        <pre
          className="p-4 my-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 overflow-x-auto text-sm leading-relaxed"
          {...props}
        >
          {children}
        </pre>
      ),

      // ブロック引用のスタイリング
      blockquote: ({
        children,
        ...props
      }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
          className="my-4 pl-4 border-l-4 border-primary-300 dark:border-primary-600 text-gray-600 dark:text-gray-400 italic"
          {...props}
        >
          {children}
        </blockquote>
      ),

      // 水平線のスタイリング
      hr: () => (
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
      ),
    }),
    [resolveWikilink, resolveFilePath, connection, currentNotePath],
  );

  return (
    <div className="note-renderer prose-custom">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
};

// ============================================================
// 画像埋め込みサブコンポーネント
// ============================================================

/**
 * @description Embed 画像表示用の内部コンポーネント
 * PAT指定時はContents APIからbase64取得、それ以外はraw URLを使用する
 */
const EmbedImage = ({
  target,
  width,
  connection,
  resolveFilePath,
}: {
  target: string;
  width?: number;
  connection: VaultConnection | null;
  resolveFilePath: (t: string) => string | undefined;
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');

  // 画像URLを解決する
  useEffect(() => {
    if (!connection) return;

    const resolvedPath = resolveFilePath(target) ?? target;

    // PAT指定時はContents API経由でbase64取得する
    if (connection.token) {
      void (async () => {
        try {
          const fileContent = await fetchFileContent(connection, resolvedPath);
          setImageSrc(buildBase64ImageUrl(fileContent));
        } catch {
          // フォールバック: raw URL
          setImageSrc(buildRawImageUrl(connection, resolvedPath));
        }
      })();
    } else {
      // 公開リポジトリ: raw URL
      setImageSrc(buildRawImageUrl(connection, resolvedPath));
    }
  }, [target, connection, resolveFilePath]);

  if (!imageSrc) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full" />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={target}
      className="max-w-full h-auto rounded-lg my-2"
      style={width ? { width: `${String(width)}px` } : undefined}
      loading="lazy"
    />
  );
};
