import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * @description ボタンのバリアント（見た目のスタイル）
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * @description ボタンのサイズ
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * @description Button コンポーネントのプロパティ型定義
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのバリアント（デフォルト: 'primary'） */
  variant?: ButtonVariant;
  /** ボタンのサイズ（デフォルト: 'md'） */
  size?: ButtonSize;
  /** ボタンの子要素 */
  children: ReactNode;
}

/**
 * @description バリアントに対応するTailwindCSSクラスのマッピング
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
  secondary:
    'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 shadow-lg shadow-secondary-500/25 hover:shadow-secondary-500/40',
  outline:
    'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/50',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
};

/**
 * @description サイズに対応するTailwindCSSクラスのマッピング
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

/**
 * @description 汎用ボタンコンポーネント（Atom）
 * バリアント（primary / secondary / outline / ghost）とサイズ（sm / md / lg）を指定可能。
 * disabled 状態にも対応し、アニメーション付きのモダンなデザイン。
 *
 * @param {ButtonProps} props - ボタンのプロパティ
 * @returns {JSX.Element} スタイル付きのボタン要素
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   送信する
 * </Button>
 * ```
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // バリアントとサイズに対応するクラスを結合する
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900';

  // disabled 状態のスタイル
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer active:scale-[0.98]';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
