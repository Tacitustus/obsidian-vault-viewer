/**
 * @description 日付をフォーマットするユーティリティ関数
 * @param {Date} date - フォーマット対象の日付
 * @param {Intl.DateTimeFormatOptions} options - フォーマットオプション
 * @returns {string} フォーマットされた日付文字列
 */
export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
): string => {
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
};
