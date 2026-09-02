#!/usr/bin/env node

/**
 * @description テンプレートプロジェクトのセットアップスクリプト
 *
 * テンプレートから新しいプロジェクトを作成する際に、
 * プロジェクト名・表示名・説明文を一括で書き換えるユーティリティ。
 *
 * 使い方:
 *   node scripts/setup.cjs
 *   node scripts/setup.cjs --name my-app --display-name "My App" --description "アプリの説明"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// プロジェクトのルートディレクトリ
const ROOT_DIR = path.resolve(__dirname, '..');

// ─── ユーティリティ関数 ─────────────────────────────────

/**
 * ファイルの内容を読み込み、置換を適用して書き戻す
 * @param {string} filePath - 対象ファイルの絶対パス
 * @param {Array<{from: string | RegExp, to: string}>} replacements - 置換ルールの配列
 */
const replaceInFile = (filePath, replacements) => {
  // ファイルが存在しない場合はスキップする
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ スキップ（ファイルが見つかりません）: ${path.relative(ROOT_DIR, filePath)}`);
    return;
  }

  // ファイル内容を読み込む
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 各置換ルールを順番に適用する
  for (const { from, to } of replacements) {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  // 変更があった場合のみファイルを書き戻す
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ 更新: ${path.relative(ROOT_DIR, filePath)}`);
  } else {
    console.log(`  — 変更なし: ${path.relative(ROOT_DIR, filePath)}`);
  }
};

/**
 * 対話的にユーザーから入力を受け付けるプロンプト
 * @param {readline.Interface} rl - readline インターフェース
 * @param {string} question - ユーザーに表示する質問
 * @param {string} defaultValue - デフォルト値
 * @returns {Promise<string>} ユーザーの入力値（空の場合はデフォルト値）
 */
const prompt = (rl, question, defaultValue) => {
  return new Promise((resolve) => {
    // デフォルト値がある場合はプロンプトに表示する
    const displayQuestion = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(displayQuestion, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
};

/**
 * kebab-case の文字列を Title Case に変換する
 * 例: "my-awesome-app" → "My Awesome App"
 * @param {string} kebab - kebab-case の文字列
 * @returns {string} Title Case の文字列
 */
const kebabToTitleCase = (kebab) => {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ─── CLI引数パーサー ─────────────────────────────────

/**
 * コマンドライン引数を解析する
 * @returns {{ name?: string, displayName?: string, description?: string }}
 */
const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      result.name = args[++i];
    } else if (args[i] === '--display-name' && args[i + 1]) {
      result.displayName = args[++i];
    } else if (args[i] === '--description' && args[i + 1]) {
      result.description = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
テンプレートプロジェクト セットアップスクリプト

使い方:
  node scripts/setup.cjs [オプション]

オプション:
  --name <name>              パッケージ名（kebab-case）例: my-awesome-app
  --display-name <name>      表示名 例: "My Awesome App"
  --description <desc>       プロジェクトの説明文
  -h, --help                 このヘルプを表示

引数を省略した場合は対話的に入力を求めます。
`);
      process.exit(0);
    }
  }

  return result;
};

// ─── メイン処理 ─────────────────────────────────

const main = async () => {
  console.log('');
  console.log('🚀 テンプレートプロジェクト セットアップ');
  console.log('━'.repeat(50));
  console.log('');

  // CLI引数を解析する
  const cliArgs = parseArgs();

  // 現在のディレクトリ名からデフォルトのプロジェクト名を推定する
  const currentDirName = path.basename(ROOT_DIR);
  const isTemplate = currentDirName === 'react-github-pages-template';
  const defaultName = isTemplate ? '' : currentDirName;

  let projectName;
  let displayName;
  let description;

  // CLI引数が全て指定されている場合は対話モードをスキップする
  if (cliArgs.name) {
    projectName = cliArgs.name;
    displayName = cliArgs.displayName || kebabToTitleCase(projectName);
    description = cliArgs.description || '';
  } else {
    // 対話モードで入力を受け付ける
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      projectName = await prompt(
        rl,
        '📦 パッケージ名（kebab-case）',
        defaultName
      );

      // パッケージ名が空の場合はエラーにする
      if (!projectName) {
        console.error('❌ パッケージ名は必須です。');
        process.exit(1);
      }

      // デフォルトの表示名を kebab-case から生成する
      const defaultDisplayName = cliArgs.displayName || kebabToTitleCase(projectName);
      displayName = await prompt(rl, '🏷️  表示名', defaultDisplayName);

      description = await prompt(
        rl,
        '📝 プロジェクトの説明文',
        cliArgs.description || ''
      );
    } finally {
      rl.close();
    }
  }

  console.log('');
  console.log('📋 設定内容:');
  console.log(`   パッケージ名: ${projectName}`);
  console.log(`   表示名:       ${displayName}`);
  console.log(`   説明文:       ${description || '（未設定）'}`);
  console.log('');
  console.log('📝 ファイルを更新中...');
  console.log('');

  // ─── 1. package.json の name フィールドを更新する ─────────
  replaceInFile(path.join(ROOT_DIR, 'package.json'), [
    {
      from: /"name": "react-github-pages-template"/,
      to: `"name": "${projectName}"`,
    },
  ]);

  // ─── 2. vite.config.ts の BASE_PATH デフォルト値を更新する ─────────
  replaceInFile(path.join(ROOT_DIR, 'vite.config.ts'), [
    {
      from: /\/react-github-pages-template\//,
      to: `/${projectName}/`,
    },
  ]);

  // ─── 3. index.html の title と meta description を更新する ─────────
  const indexHtmlReplacements = [
    {
      from: /<title>React GitHub Pages Template<\/title>/,
      to: `<title>${displayName}</title>`,
    },
  ];
  // 説明文が指定されている場合は meta description も更新する
  if (description) {
    indexHtmlReplacements.push({
      from: /content="React \+ Vite \+ TailwindCSS テンプレートプロジェクト"/,
      to: `content="${description}"`,
    });
  }
  replaceInFile(path.join(ROOT_DIR, 'index.html'), indexHtmlReplacements);

  // ─── 4. src/constants/appConfig.ts の APP_NAME と APP_DESCRIPTION を更新する ─────────
  const appConfigReplacements = [
    {
      from: /export const APP_NAME = 'React GitHub Pages Template';/,
      to: `export const APP_NAME = '${displayName}';`,
    },
  ];
  if (description) {
    appConfigReplacements.push({
      from: /export const APP_DESCRIPTION =\n\s*'[^']*';/,
      to: `export const APP_DESCRIPTION = '${description}';`,
    });
    // Windows の改行コード（CRLF）にも対応する
    appConfigReplacements.push({
      from: /export const APP_DESCRIPTION =\r\n\s*'[^']*';/,
      to: `export const APP_DESCRIPTION = '${description}';`,
    });
  }
  replaceInFile(
    path.join(ROOT_DIR, 'src', 'constants', 'appConfig.ts'),
    appConfigReplacements
  );

  // ─── 5. public/404.html の segmentCount を確認（コメントのみ） ─────────
  // segmentCount はリポジトリの階層構造に依存するため、
  // user.github.io（ルートドメイン）の場合は 0 に変更が必要
  // 通常のリポジトリ（user.github.io/repo-name/）の場合は 1 のまま

  // ─── 6. README.md を新規プロジェクト用に更新する ─────────
  replaceInFile(path.join(ROOT_DIR, 'README.md'), [
    {
      from: /# React GitHub Pages Template/,
      to: `# ${displayName}`,
    },
    {
      from: /AIエージェントがWebアプリケーションを開発する際に使い回すための、モダンで高品質なReactプロジェクトテンプレートです。/,
      to: description || `${displayName} — React + Vite + TailwindCSS で構築されたWebアプリケーション`,
    },
  ]);

  // ─── 7. BLUEPRINT.md の概要を更新する ─────────
  if (description) {
    replaceInFile(path.join(ROOT_DIR, 'BLUEPRINT.md'), [
      {
        from: /（このプロジェクトの目的・概要を記述する）/,
        to: description,
      },
    ]);
  }

  console.log('');
  console.log('━'.repeat(50));
  console.log('✅ セットアップが完了しました！');
  console.log('');
  console.log('📌 次のステップ:');
  console.log('   1. BLUEPRINT.md を編集して、機能要件やページ構成を定義する');
  console.log('   2. tailwind.config.ts でカラーパレットをカスタマイズする');
  console.log('   3. npm run dev で開発サーバーを起動する');
  console.log('');
  console.log('⚠️  追加の確認事項:');
  console.log('   • GitHub Pages のルートドメイン（username.github.io）で公開する場合:');
  console.log('     → public/404.html の segmentCount を 0 に変更してください');
  console.log('     → vite.config.ts の BASE_PATH デフォルト値を "/" に変更してください');
  console.log('');
};

// スクリプトを実行する
main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
