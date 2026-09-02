import { useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

/**
 * @description SearchBar コンポーネントのプロパティ型定義
 */
interface SearchBarProps {
  /** 検索実行時のコールバック関数 */
  onSearch: (query: string) => void;
  /** プレースホルダーテキスト（デフォルト: '検索...'） */
  placeholder?: string;
}

/**
 * @description 検索バーコンポーネント（Molecule）
 * Input と Button を組み合わせた検索入力UI。
 * 入力値の状態管理とフォーム送信ハンドリングを行う。
 *
 * @param {SearchBarProps} props - 検索バーのプロパティ
 * @returns {JSX.Element} 検索バーコンポーネント
 *
 * @example
 * ```tsx
 * <SearchBar
 *   onSearch={(query) => console.log('検索:', query)}
 *   placeholder="キーワードを入力..."
 * />
 * ```
 */
export const SearchBar = ({ onSearch, placeholder = '検索...' }: SearchBarProps) => {
  // 検索クエリの状態を管理する
  const [query, setQuery] = useState('');

  /**
   * フォーム送信時のハンドラー
   * デフォルトのフォーム送信を防止し、コールバックを実行する
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 空白のみの入力は無視する
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full max-w-md">
      {/* 検索入力フィールド */}
      <div className="flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="検索キーワード"
        />
      </div>

      {/* 検索ボタン */}
      <Button type="submit" variant="primary" size="md" aria-label="検索を実行">
        <Search className="w-4 h-4 mr-1.5" />
        検索
      </Button>
    </form>
  );
};
