# YouTube Article Generator - Chrome Extension

YouTube動画を技術記事・レシピ記事に変換してGitHub LIFEリポジトリに自動保存するChrome拡張機能です。

## 機能

- YouTube動画ページに「記事化」ボタンを自動表示
- 字幕を自動取得（日本語/英語対応）
- AIが記事を自動生成（4社フォールバック対応）
- GitHub LIFEリポジトリに自動保存
- ジャンル自動判定（Tech/Cooking/Medical/Science/Business）

### 対応プラットフォーム

| プラットフォーム | 用途 |
|:--|:--|
| **LIFE** | 個人ナレッジベース（GitHub蓄積） |
| **Zenn** | 技術記事（Markdown） |
| **Qiita** | 技術記事 |
| **note** | エッセイ・料理・教養 |
| **Cookpad** | 料理専用（スクショガイド付き） |

### AI プロバイダ（フォールバック順）

1. さくらのAI Engine（gpt-oss-120b）
2. Google Gemini Pro
3. OpenAI GPT-4o
4. Claude（Anthropic）

## インストール

### 1. リポジトリをクローン

```bash
git clone https://github.com/katu09161004/youtube-article-extension.git
```

### 2. Chromeに読み込み

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンした `src/` フォルダを選択

### 3. APIキーを設定

1. 拡張機能のアイコンをクリック → 「設定」
2. 以下のキーを入力:
   - **GitHub Personal Access Token**（repo権限）
   - **AI APIキー**（最低1つ）：さくらAI / Gemini / OpenAI / Anthropic

## 使い方

### 基本的な流れ

1. YouTubeで動画ページを開く
2. 動画プレイヤー下の「**記事化**」ボタンをクリック
3. モーダルで設定を選択：
   - 投稿先プラットフォーム
   - スタイル（自動判定 / 技術解説 / レシピ記事 etc.）
   - 難易度・対象読者
4. 「**記事を生成**」をクリック
5. AI記事生成 → GitHub保存 → 完了！

### 記事の確認

- モーダル内の「GitHubで記事を見る」リンクから直接確認
- 「記事をコピー」ボタンでクリップボードにコピー
- 拡張ポップアップの「最近の記事」からアクセス

## ファイル構成

```
src/
├── manifest.json              # Chrome拡張設定（Manifest V3）
├── background/
│   └── service-worker.js      # AI API呼出・GitHub保存（メイン処理）
├── content/
│   └── youtube-inject.js      # YouTubeページUI注入・字幕取得
├── lib/
│   ├── constants.js           # ジャンル定義・フロントマターテンプレート
│   ├── prompts.js             # AI用プロンプトテンプレート
│   ├── ai-providers.js        # AI API 4社フォールバック
│   ├── github-api.js          # GitHub Contents API
│   ├── genre-detector.js      # ジャンル・料理モード自動判定
│   ├── prompt-builder.js      # プロンプト組み立て
│   └── utils.js               # ユーティリティ関数
├── popup/
│   ├── popup.html             # 拡張ポップアップ
│   └── popup.js
├── options/
│   ├── options.html           # 設定画面
│   └── options.js
├── styles/
│   ├── content.css            # ボタンスタイル
│   └── modal.css              # モーダルスタイル
└── icons/                     # 拡張アイコン
```

## GitHub LIFEリポジトリ構造

記事は以下のパスに自動保存されます:

```
LIFE/
├── Tech/          # 技術記事
│   ├── Zenn/
│   ├── Qiita/
│   ├── note/
│   └── LIFE/
├── Cooking/       # 料理レシピ
│   ├── note/
│   ├── Cookpad/
│   └── LIFE/
├── Medical/       # 医療系
├── Science/       # 科学系
├── Business/      # ビジネス系
└── Other/         # その他
```

ファイル名形式: `YYYYMMDD_HHMM_VideoID_タイトル.md`

## 技術記事の自動生成内容

- フロントマター（プラットフォーム別YAML）
- サムネイル画像埋め込み
- 本文セクション（AIが内容に応じて構成）
- コードブロック（言語指定付き）
- Mermaid図解（アーキテクチャ・フロー）
- 用語集・略語テーブル（正式名称＋日本語解説）
- まとめ・参考リソース

## 料理レシピの自動生成内容

- レシピ表（材料・分量・調味料）
- 調理手順（YouTubeタイムスタンプリンク付き）
- コツ・ポイント
- アレンジ・バリエーション
- 保存方法
- 料理用語解説テーブル
- Cookpad用：スクショ撮影ガイド

## 元プロジェクト

Python MCPサーバー版: `youtube_article_mcp.py`（Claude Desktop連携）

## ライセンス

MIT
