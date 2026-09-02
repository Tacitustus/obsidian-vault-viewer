/**
 * @description Vault への接続・切断を管理するカスタムフック
 * 接続フォームからの入力を受け取り、vaultStore 経由で GitHub API と通信する。
 *
 * @returns 接続・切断関数と接続状態
 *
 * @example
 * ```tsx
 * const { connect, disconnect, isConnected, isLoading, error } = useVaultConnection();
 * ```
 */

import { useCallback } from 'react';

import { useVaultStore } from '@/stores/vaultStore';

import type { VaultConnection } from '@/types/Vault';

export const useVaultConnection = () => {
  // ストアから必要な状態とアクションを取得する
  const connection = useVaultStore((state) => state.connection);
  const isConnected = useVaultStore((state) => state.isConnected);
  const isLoading = useVaultStore((state) => state.isLoading);
  const error = useVaultStore((state) => state.error);
  const connectAction = useVaultStore((state) => state.connect);
  const disconnectAction = useVaultStore((state) => state.disconnect);
  const clearError = useVaultStore((state) => state.clearError);

  // vault に接続する
  const connect = useCallback(
    async (connectionInfo: VaultConnection) => {
      await connectAction(connectionInfo);
    },
    [connectAction],
  );

  // vault から切断する
  const disconnect = useCallback(() => {
    disconnectAction();
  }, [disconnectAction]);

  return {
    connection,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    clearError,
  };
};
