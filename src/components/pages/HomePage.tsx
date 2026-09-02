/**
 * @description 接続設定ページコンポーネント（Page）
 * owner / repo / branch を入力して vault を開く画面。
 * プライベートリポジトリ用の PAT 入力フィールドも備える。
 *
 * @returns {JSX.Element} 接続設定ページ要素
 *
 * @example
 * ```tsx
 * <Route path="/" element={<HomePage />} />
 * ```
 */

import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, FolderTree, Link2 } from 'lucide-react';

import { ConnectionForm } from '@/components/molecules/ConnectionForm';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';
import { useVaultConnection } from '@/hooks/useVaultConnection';

import type { VaultConnection } from '@/types/Vault';

/**
 * @description 機能カードのデータ
 */
const FEATURE_CARDS = [
  {
    icon: <FolderTree className="w-6 h-6 text-yellow-500" />,
    title: 'フォルダツリー',
    description:
      'リポジトリ内の全ファイルを階層構造で表示。折りたたみ・検索に対応。',
  },
  {
    icon: <Link2 className="w-6 h-6 text-primary-500" />,
    title: 'Wikilink 解決',
    description:
      '[[wikilink]] や ![[embed]] を自動解決し、ノート間をシームレスにナビゲート。',
  },
  {
    icon: <Eye className="w-6 h-6 text-green-500" />,
    title: 'Markdown レンダリング',
    description:
      'GFM（表、タスクリスト）やフロントマター、タグに対応した高品質なレンダリング。',
  },
];

export const HomePage = () => {
  // ナビゲーション
  const navigate = useNavigate();

  // vault 接続フック
  const { connect, isLoading, error, clearError } = useVaultConnection();

  // 接続ハンドラー
  const handleConnect = async (connection: VaultConnection) => {
    await connect(connection);

    // 接続成功後に vault ページへ遷移する
    // （エラーの場合は connect 内でエラーが設定されるため、ここには来ない）
    void navigate('/vault');
  };

  return (
    <div className="relative min-h-screen">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-950/30 dark:via-gray-950 dark:to-secondary-950/30" />

      {/* 装飾用の背景ブロブ */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl" />

      {/* メインコンテンツ */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12 animate-fade-in">
          {/* ロゴアイコン */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-xl shadow-primary-500/25 mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          {/* タイトル */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-white">Obsidian </span>
            <span className="text-gradient">Vault Viewer</span>
          </h1>

          {/* サブタイトル */}
          <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400">
            GitHub 上の Obsidian vault をブラウザでそのまま閲覧。
            wikilink・embed・画像をすべて解決して表示します。
          </p>
        </div>

        {/* 接続フォームカード */}
        <div className="max-w-lg mx-auto mb-16 animate-slide-up">
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Vault に接続
            </h2>

            {/* エラーメッセージ */}
            {error && (
              <ErrorMessage
                message={error.message}
                type="error"
                onDismiss={clearError}
                className="mb-4"
              />
            )}

            {/* 接続フォーム */}
            <ConnectionForm
              onConnect={(conn) => void handleConnect(conn)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* 機能紹介セクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          {FEATURE_CARDS.map((card, index) => (
            <div
              key={card.title}
              className="group p-6 rounded-2xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${String(index * 100)}ms` }}
            >
              {/* アイコン */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                {card.icon}
              </div>

              {/* タイトル */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>

              {/* 説明 */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
