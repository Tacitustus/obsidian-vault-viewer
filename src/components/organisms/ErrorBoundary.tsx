/**
 * @description エラーバウンダリコンポーネント（Organism）
 * 子コンポーネントツリー内で発生した JavaScript エラーをキャッチし、
 * フォールバック UI を表示する。
 *
 * @param {{ children: React.ReactNode; fallback?: React.ReactNode }} props
 * @returns {JSX.Element} エラーバウンダリでラップされた子要素
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <NoteRenderer body={content} />
 * </ErrorBoundary>
 * ```
 */

import { Component } from 'react';

import { ErrorMessage } from '@/components/atoms/ErrorMessage';

import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  /** 子要素 */
  children: ReactNode;
  /** エラー時のフォールバック UI（省略時はデフォルトのエラーメッセージ） */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;
  /** エラーメッセージ */
  errorMessage: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || '予期しないエラーが発生しました。',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログを出力する
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // フォールバック UI が指定されている場合はそれを表示する
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーメッセージを表示する
      return (
        <div className="p-6">
          <ErrorMessage
            message={this.state.errorMessage}
            type="error"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
