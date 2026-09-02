import { forwardRef } from 'react';

import type { InputHTMLAttributes } from 'react';

/**
 * @description Input コンポーネントのプロパティ型定義
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
}

/**
 * @description 汎用入力フィールドコンポーネント（Atom）
 * ラベル、エラーメッセージ表示、ダークモード対応のモダンな入力フィールド。
 * forwardRef を使用して ref の転送に対応。
 *
 * @param {InputProps} props - 入力フィールドのプロパティ
 * @returns {JSX.Element} スタイル付きの入力フィールド要素
 *
 * @example
 * ```tsx
 * <Input
 *   label="メールアドレス"
 *   type="email"
 *   placeholder="example@email.com"
 *   error="メールアドレスを入力してください"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    // ラベルとの紐付け用に id を生成する（指定がない場合は label から生成）
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // エラー状態に応じたボーダーカラーを設定する
    const borderClasses = error
      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
      : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500/50 focus:border-primary-500';

    return (
      <div className="w-full">
        {/* ラベル表示 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* 入力フィールド */}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800/50 ${borderClasses} border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${className}`}
          {...props}
        />

        {/* エラーメッセージ表示 */}
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

// React DevTools でのコンポーネント名表示用
Input.displayName = 'Input';
