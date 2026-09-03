/**
 * @description Markdown テキストのパースユーティリティ
 * YAML フロントマターの解析と本文中のタグ抽出を行う。
 *
 * gray-matter は Node.js の Buffer モジュールに依存しておりブラウザ環境では動作しないため、
 * フロントマターの分離・YAML パースを自前で実装している。
 */

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
  // フロントマターと本文を分離する
  const { frontmatter, body } = extractFrontmatter(rawMarkdown);

  // タグを収集する（フロントマター + 本文中の #tag）
  const tags = extractTags(frontmatter, body);

  return {
    body,
    frontmatter,
    tags,
  };
};

// ============================================================
// フロントマター分離・パース
// ============================================================

/**
 * @description YAML フロントマターブロックを検出し、本文と分離する
 * フロントマターは `---` で囲まれたブロック（ファイル先頭のみ有効）として認識する。
 *
 * @param {string} rawMarkdown - 生の Markdown テキスト
 * @returns {{ frontmatter: FrontmatterData; body: string }} 分離されたフロントマターと本文
 */
const extractFrontmatter = (
  rawMarkdown: string,
): { frontmatter: FrontmatterData; body: string } => {
  // 先頭の空白を除去する
  const trimmed = rawMarkdown.trimStart();

  // `---` で始まらない場合はフロントマターなし
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: rawMarkdown };
  }

  // 2番目の `---` を探す（最初の `---` の後）
  const endIndex = trimmed.indexOf('\n---', 3);
  if (endIndex === -1) {
    // 閉じタグが見つからない場合はフロントマターなし
    return { frontmatter: {}, body: rawMarkdown };
  }

  // YAML ブロックを取得する（最初の `---\n` と閉じ `\n---` の間）
  const yamlBlock = trimmed.slice(trimmed.indexOf('\n', 0) + 1, endIndex);

  // 本文を取得する（閉じ `---` の後）
  const bodyStart = endIndex + 4; // `\n---` の長さ
  const body = trimmed.slice(bodyStart).replace(/^\n/, ''); // 先頭の改行を除去

  // YAML をパースする
  const frontmatter = parseSimpleYaml(yamlBlock);

  return { frontmatter, body };
};

/**
 * @description 簡易 YAML パーサー
 * Obsidian のフロントマターで使用される基本的な YAML 構文をパースする。
 * 対応構文: 文字列、数値、真偽値、null、配列（インラインおよびリスト形式）
 *
 * @param {string} yaml - YAML テキスト
 * @returns {FrontmatterData} パース済みのキー・バリュー辞書
 */
const parseSimpleYaml = (yaml: string): FrontmatterData => {
  const result: FrontmatterData = {};
  const lines = yaml.split('\n');

  let currentKey: string | null = null;
  let currentListItems: string[] = [];
  let isInList = false;

  // リスト収集を確定してresultに書き込むヘルパー
  const flushList = () => {
    if (isInList && currentKey) {
      result[currentKey] = currentListItems;
      currentListItems = [];
      isInList = false;
      currentKey = null;
    }
  };

  for (const line of lines) {
    // 空行はスキップする
    if (line.trim() === '') {
      continue;
    }

    // リスト項目の検出（`  - value` 形式）
    const listItemMatch = /^[ \t]+- (.*)$/.exec(line);
    if (listItemMatch && isInList) {
      // リスト項目を追加する
      currentListItems.push(parseYamlValue(listItemMatch[1].trim()));
      continue;
    }

    // 前のリスト収集を確定する
    flushList();

    // `key: value` 形式の行を検出する
    const keyValueMatch = /^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!keyValueMatch) {
      continue;
    }

    const key = keyValueMatch[1];
    const rawValue = keyValueMatch[2].trim();

    // 値が空の場合 → 次の行がリスト項目かもしれない
    if (rawValue === '') {
      currentKey = key;
      isInList = true;
      currentListItems = [];
      continue;
    }

    // インライン配列の検出（`[item1, item2, ...]` 形式）
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inner = rawValue.slice(1, -1);
      result[key] = inner
        .split(',')
        .map((item) => parseYamlValue(item.trim()))
        .filter((item) => item !== '');
      continue;
    }

    // 通常の key: value
    result[key] = parseYamlValue(rawValue);
  }

  // ループ終了後にリストを確定する
  flushList();

  return result;
};

/**
 * @description YAML の値文字列を適切な JavaScript 型に変換する
 * @param {string} value - YAML 値の文字列表現
 * @returns {string} パース済みの値（文字列として返す）
 */
const parseYamlValue = (value: string): string => {
  // 引用符で囲まれた文字列 → 引用符を除去する
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

// ============================================================
// タグ抽出
// ============================================================

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
  const tagRegex =
    /(?:^|\s)#([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w][a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w/_-]*)/g;
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
