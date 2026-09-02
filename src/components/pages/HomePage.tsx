import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

import { Button } from '@/components/atoms/Button';

/**
 * @description 機能カードの型定義
 */
interface FeatureCard {
  /** アイコンコンポーネント */
  icon: React.ReactNode;
  /** カードのタイトル */
  title: string;
  /** カードの説明文 */
  description: string;
}

/**
 * @description 表示する機能カードの一覧
 */
const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: '高速開発',
    description: 'Vite + React + TypeScript で高速なビルドとHMRを実現。開発体験を最大限に向上。',
  },
  {
    icon: <Shield className="w-6 h-6 text-green-500" />,
    title: '型安全',
    description: 'TypeScript 厳格モードで型安全な開発。any 禁止ルールでバグを未然に防止。',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    title: 'モダンUI',
    description: 'TailwindCSS でグラスモーフィズムやグラデーションを活用した美しいデザイン。',
  },
];

/**
 * @description ホームページコンポーネント（Page）
 * ウェルカムページ。グラデーション背景とグラスモーフィズムカードを使用した
 * モダンなランディングページデザイン。
 *
 * @returns {JSX.Element} ホームページ要素
 *
 * @example
 * ```tsx
 * <Route path="/" element={<HomePage />} />
 * ```
 */
export const HomePage = () => {
  return (
    <div className="relative">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-accent-500/10 dark:from-primary-950/50 dark:via-gray-950 dark:to-secondary-950/50" />

        {/* 装飾用の背景ブロブ */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400/20 dark:bg-secondary-600/10 rounded-full blur-3xl" />

        {/* コンテンツ */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center animate-fade-in">
            {/* バッジ */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              React + Vite + TailwindCSS テンプレート
            </div>

            {/* メインタイトル */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-gray-900 dark:text-white">Build </span>
              <span className="text-gradient">Beautiful</span>
              <br />
              <span className="text-gray-900 dark:text-white">Web Apps</span>
            </h1>

            {/* サブタイトル */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10">
              AIエージェントが使い回すための、モダンで高品質なReactプロジェクトテンプレート。 GitHub
              Pages への自動デプロイに対応。
            </p>

            {/* CTAボタン群 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg">
                はじめる
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                ドキュメントを見る
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* セクションタイトル */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            テンプレートの特徴
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            このテンプレートには、高品質なWebアプリケーション開発に必要な機能が揃っています。
          </p>
        </div>

        {/* 機能カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURE_CARDS.map((card, index) => (
            <div
              key={card.title}
              className="group relative p-6 lg:p-8 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* アイコン */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                {card.icon}
              </div>

              {/* タイトル */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>

              {/* 説明 */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
