/**
 * @description クラス名を条件付きで結合するユーティリティ関数
 * falsy な値（undefined, null, false, ''）は自動的に除外される
 *
 * @param {...(string | undefined | null | false)[]} classes - 結合するクラス名の配列
 * @returns {string} 結合されたクラス名文字列
 *
 * @example
 * ```ts
 * cn('base-class', isActive && 'active', 'always-applied');
 * // isActive が true の場合: 'base-class active always-applied'
 * // isActive が false の場合: 'base-class always-applied'
 * ```
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
