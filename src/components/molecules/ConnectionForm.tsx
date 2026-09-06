/**
 * @description 接続設定フォームコンポーネント（Molecule）
 * owner / repo / branch / PAT を入力して vault に接続するフォーム。
 * 入力情報はブラウザのローカルストレージに保存され、次回以降の入力を省略する。
 *
 * @param {{ onConnect: (connection: VaultConnection) => void; isLoading: boolean }} props
 * @returns {JSX.Element} 接続フォーム要素
 *
 * @example
 * ```tsx
 * <ConnectionForm onConnect={handleConnect} isLoading={isLoading} />
 * ```
 */

import { useState } from 'react';
import { GitBranch, Lock } from 'lucide-react';

import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

import type { VaultConnection } from '@/types/Vault';

interface ConnectionFormProps {
  /** 接続ボタン押下時のコールバック */
  onConnect: (connection: VaultConnection) => void;
  /** ローディング状態 */
  isLoading: boolean;
}

export const ConnectionForm = ({
  onConnect,
  isLoading,
}: ConnectionFormProps) => {
  // フォームの入力値を管理する（初期値をローカルストレージから取得）
  const [owner, setOwner] = useState(() => localStorage.getItem('vault_owner') || '');
  const [repo, setRepo] = useState(() => localStorage.getItem('vault_repo') || '');
  const [branch, setBranch] = useState(() => localStorage.getItem('vault_branch') || 'main');
  const [token, setToken] = useState(() => localStorage.getItem('vault_token') || '');

  // フォームの送信を処理する
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 必須項目が入力されていない場合は送信しない
    if (!owner.trim() || !repo.trim() || !branch.trim()) {
      return;
    }

    // 接続情報を構築してコールバックを呼ぶ
    const connection: VaultConnection = {
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim(),
      token: token.trim() || undefined,
    };

    // 入力値をローカルストレージに保存
    localStorage.setItem('vault_owner', connection.owner);
    localStorage.setItem('vault_repo', connection.repo);
    localStorage.setItem('vault_branch', connection.branch);
    if (connection.token) {
      localStorage.setItem('vault_token', connection.token);
    } else {
      localStorage.removeItem('vault_token');
    }

    onConnect(connection);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Owner / Repo を横並びに表示する */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* リポジトリオーナー */}
        <Input
          id="vault-owner"
          label="Owner"
          type="text"
          placeholder="例: obsidianmd"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          required
          disabled={isLoading}
        />

        {/* リポジトリ名 */}
        <Input
          id="vault-repo"
          label="Repository"
          type="text"
          placeholder="例: obsidian-help"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* ブランチ名 */}
      <div className="relative">
        <Input
          id="vault-branch"
          label="Branch"
          type="text"
          placeholder="main"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          required
          disabled={isLoading}
        />
        <GitBranch className="absolute right-3 top-9 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>

      {/* Personal Access Token（オプション） */}
      <div className="relative">
        <Input
          id="vault-token"
          label="Personal Access Token（オプション）"
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isLoading}
        />
        <Lock className="absolute right-3 top-9 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>

      {/* トークンに関する注意書き */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        トークンなどの接続情報はブラウザのローカルストレージに保存され、サーバーへの送信は行われません。
        プライベートリポジトリの閲覧や API レート制限の緩和に使用します。
        fine-grained token で Contents: Read only の権限を推奨します。
      </p>

      {/* 接続ボタン */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading || !owner.trim() || !repo.trim()}
      >
        {isLoading ? '接続中...' : 'Vault を開く'}
      </Button>
    </form>
  );
};
