import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';
import type { VaultSettings } from '@/types/Vault';

/**
 * @description Vault設定（フォルダフィルタやタブ状態）を取得する
 * @param {string} repoKey リポジトリキー（"owner/repo"）
 * @returns {Promise<VaultSettings | null>} 取得した設定、存在しない場合は null
 */
export const fetchVaultSettings = async (repoKey: string): Promise<VaultSettings | null> => {
  if (!isSupabaseEnabled()) return null;

  try {
    const { data, error } = await supabase!
      .from('vault_settings')
      .select('*')
      .eq('repo_key', repoKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが存在しない場合
        return null;
      }
      console.error('Failed to fetch vault settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching vault settings:', err);
    return null;
  }
};

/**
 * @description Vault設定を保存・更新する（UPSERT）
 * @param {string} repoKey リポジトリキー（"owner/repo"）
 * @param {Partial<VaultSettings>} settings 更新する設定内容
 * @returns {Promise<boolean>} 成功したかどうか
 */
export const updateVaultSettings = async (
  repoKey: string,
  settings: Partial<VaultSettings>,
): Promise<boolean> => {
  if (!isSupabaseEnabled()) return false;

  try {
    const { error } = await supabase!.from('vault_settings').upsert(
      {
        repo_key: repoKey,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'repo_key' },
    );

    if (error) {
      console.error('Failed to update vault settings:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating vault settings:', err);
    return false;
  }
};
