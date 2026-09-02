/**
 * @description エラーメッセージ表示コンポーネント（Atom）
 * API エラーやバリデーションエラーを適切なスタイルで表示する。
 *
 * @param {{ message: string; type?: 'error' | 'warning' | 'info'; onDismiss?: () => void; className?: string }} props
 * @returns {JSX.Element} エラーメッセージ要素
 *
 * @example
 * ```tsx
 * <ErrorMessage message="ファイルが見つかりません" type="error" />
 * ```
 */

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ErrorMessageProps {
  /** 表示するメッセージ */
  message: string;
  /** メッセージの種類（デフォルト: 'error'） */
  type?: 'error' | 'warning' | 'info';
  /** 閉じるボタンのコールバック */
  onDismiss?: () => void;
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * @description 種類に対応するスタイル設定
 */
const typeStyles = {
  error: {
    container:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300',
    icon: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />,
  },
  warning: {
    container:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-300',
    icon: (
      <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
    ),
  },
  info: {
    container:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300',
    icon: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />,
  },
};

export const ErrorMessage = ({
  message,
  type = 'error',
  onDismiss,
  className = '',
}: ErrorMessageProps) => {
  // 種類に応じたスタイルを取得する
  const styles = typeStyles[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles.container} animate-fade-in ${className}`}
      role="alert"
    >
      {/* アイコン */}
      {styles.icon}

      {/* メッセージ本文 */}
      <p className="flex-1 text-sm leading-relaxed">{message}</p>

      {/* 閉じるボタン（onDismiss が指定されている場合のみ表示） */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
