# Obsidian Vault Viewer

GitHub リポジトリ上で管理されている Obsidian の Vault をブラウザ上でそのまま閲覧するためのウェブアプリケーションです。

🌐 **アプリ URL**: [https://Tacitustus.github.io/obsidian-vault-viewer/](https://Tacitustus.github.io/obsidian-vault-viewer/)

## ✨ 主な機能

- **そのまま閲覧**: GitHub 上にある Markdown ファイル群を Obsidian に近い見た目でレンダリングします。
- **Wikilink 解決**: `[[ノート名]]` 形式のリンクをクリックして他のノートへシームレスに遷移できます。
- **インライン埋め込み**: `![[ノート名]]` や `![[画像.png]]` によるコンテンツの埋め込み表示に対応しています。
- **フォルダツリー**: リポジトリ内のファイルを階層構造で表示し、インクリメンタル検索が可能です。
- **プライベートリポジトリ対応**: Personal Access Token (PAT) を入力することで、プライベートリポジトリの Vault も閲覧できます。

## 📖 使い方

1. [アプリ (Obsidian Vault Viewer)](https://Tacitustus.github.io/obsidian-vault-viewer/) にアクセスします。
2. 接続フォームに以下の情報を入力します：
   - **Owner**: GitHub のユーザー名 または 組織名（例: `Tacitustus`）
   - **Repository**: Vault があるリポジトリ名（例: `my-vault`）
   - **Branch**: ブランチ名（デフォルト: `main`）
3. **プライベートリポジトリの場合**:
   - 「Personal Access Token」の欄に GitHub の PAT を入力してください。
   - ※ トークンはブラウザのメモリ上にのみ保持され、外部サーバーに送信されたり保存されたりすることはありません。
4. 「Vault を開く」ボタンをクリックすると、左側にフォルダツリー、右側にノートが表示されるビューア画面に切り替わります。

## 💻 ローカル開発環境のセットアップ

本リポジトリをクローンして手元で動かす場合の手順です。

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` が自動的に開きます。

## 🛠 技術スタック

- **React 19**
- **TypeScript**
- **Vite**
- **TailwindCSS v3**
- **Zustand** (状態管理)
- **react-markdown** + **remark-gfm** + カスタムプラグイン (Markdown レンダリング)

## 📄 ライセンス

MIT
