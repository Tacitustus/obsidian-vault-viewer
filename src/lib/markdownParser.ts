/**
 * @description Markdown テキストのパースユーティリティ
 * YAML フロントマターの解析と本文中のタグ抽出を行う。
 */

import matter from 'gray-matter';

import type { FrontmatterData, ParsedNote } from '@/types/Vault';

/**
 * @description Markdown テキストからフロントマターを解析し、本文・メタデータ・タグを返す
 *
 * @param {string} rawMarkdown - 生の Markdown テキスト（フロントマター付き）
 * @returns {ParsedNote} パース済みのノートデータ
 *
 * @example
 * ```ts
 * const note = parseNote('---\ntitle: Hello\ntags: [a, b]\n---\n# Hello\n#tag1');
 * // { body: '# Hello\n#tag1', frontmatter: { title: 'Hello', tags: ['a', 'b'] }, tags: ['a', 'b', 'tag1'] }
 * ```
 */
export const parseNote = (rawMarkdown: string): ParsedNote => {
  // gray-matter でフロントマターと本文を分離する
  const { data, content } = matter(rawMarkdown);

  // フロントマターを FrontmatterData として型付けする
  const frontmatter = data;

  // タグを収集する（フロントマター + 本文中の #tag）
  const tags = extractTags(frontmatter, content);

  return {
    body: content,
    frontmatter,
    tags,
  };
};

/**
 * @description フロントマターと本文からタグを抽出する
 * フロントマターの `tags` フィールドと、本文中の `#tag` 記法の両方を検出する。
 *
 * @param {FrontmatterData} frontmatter - パース済みフロントマター
 * @param {string} body - Markdown 本文
 * @returns {string[]} 重複除去されたタグ一覧
 */
const extractTags = (
  frontmatter: FrontmatterData,
  body: string,
): string[] => {
  const tagSet = new Set<string>();

  // フロントマターからタグを取得する
  if (frontmatter.tags) {
    // tags が配列の場合
    if (Array.isArray(frontmatter.tags)) {
      for (const tag of frontmatter.tags) {
        if (typeof tag === 'string' && tag.trim()) {
          tagSet.add(tag.trim());
        }
      }
    }
    // tags が文字列の場合（カンマ区切り）
    else if (typeof frontmatter.tags === 'string') {
      const tagsString = frontmatter.tags;
      for (const tag of tagsString.split(',')) {
        if (tag.trim()) {
          tagSet.add(tag.trim());
        }
      }
    }
  }

  // 本文中の #tag を検出する
  // コードブロック内のハッシュタグは除外する
  const bodyWithoutCodeBlocks = removeCodeBlocks(body);

  // #tag パターンにマッチする正規表現
  // 行頭または空白の後に # で始まり、英数字・日本語・ハイフン・アンダースコア・スラッシュが続く
  const tagRegex = /(?:^|\s)#([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w][a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w/_-]*)/g;
  let match: RegExpExecArray | null;

  // 正規表現で全てのタグを検出する
  while ((match = tagRegex.exec(bodyWithoutCodeBlocks)) !== null) {
    if (match[1]) {
      tagSet.add(match[1]);
    }
  }

  // Set を配列に変換して返す
  return Array.from(tagSet);
};

/**
 * @description Markdown テキストからコードブロック（``` と `）を除去する
 * タグ検出時にコードブロック内の `#` をタグとして誤検出しないようにするため。
 *
 * @param {string} text - Markdown テキスト
 * @returns {string} コードブロックを除去したテキスト
 */
const removeCodeBlocks = (text: string): string => {
  // フェンスドコードブロック（```...```）を除去する
  let result = text.replace(/```[\s\S]*?```/g, '');
  // インラインコード（`...`）を除去する
  result = result.replace(/`[^`]*`/g, '');
  return result;
};
