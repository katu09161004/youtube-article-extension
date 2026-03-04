# YouTube Article Generator - Chrome Extension

## Project Overview
YouTube動画の字幕を取得し、AIで技術記事・レシピ記事に変換してGitHub LIFEリポジトリに保存するChrome拡張機能（Manifest V3）。

元となったPython MCPサーバー: `~/Documents/mcp-servers/youtube_article_mcp.py`

## Architecture

```
Content Script (youtube-inject.js)
  ├── YouTubeページに「記事化」ボタン注入
  ├── 字幕取得（captionTracks抽出 → fetch）
  └── モーダルUI（設定選択 → 生成 → 結果表示）
         │
         │ chrome.runtime.sendMessage
         ▼
Service Worker (service-worker.js)  ← ES Module
  ├── AI API呼び出し（lib/ai-providers.js）
  │     さくらAI → Gemini → OpenAI → Claude フォールバック
  ├── GitHub API（lib/github-api.js）
  │     記事保存 / 一覧 / 検索
  └── プロンプト組み立て（lib/prompt-builder.js）
```

## Directory Structure

```
src/
├── manifest.json
├── background/service-worker.js     # メイン処理（ES Module）
├── content/youtube-inject.js        # Content Script（非Module）
├── lib/                             # 共有ライブラリ（ES Module）
│   ├── constants.js                 # GENRES, FRONTMATTER, POST_HINTS
│   ├── prompts.js                   # TECH/COOKING/COOKPAD_PROMPT
│   ├── ai-providers.js              # AI API 4社フォールバック
│   ├── github-api.js                # GitHub Contents API
│   ├── genre-detector.js            # ジャンル・料理モード判定
│   ├── prompt-builder.js            # プロンプト組み立て
│   └── utils.js                     # VideoID抽出, base64, タイムスタンプ
├── popup/popup.{html,js}            # 拡張ポップアップ
├── options/options.{html,js}        # 設定画面（APIキー管理）
├── styles/content.css, modal.css    # UI スタイル
└── icons/                           # 拡張アイコン
```

## Key Design Decisions

- **Content Scriptは非Module**: Manifest V3のcontent_scriptsはES Module importを使えないため、youtube-inject.jsは単一ファイルに字幕取得ロジックをインライン化
- **Service WorkerはES Module**: `"type": "module"` でlib/以下をimport
- **AIフォールバック順**: さくらAI → Gemini → OpenAI → Claude（Python版と同一）
- **UTF-8 Base64**: `btoa()`は日本語非対応のため`TextEncoder`ベースの`utf8ToBase64()`を使用
- **字幕取得**: tube2transプロジェクトのcaptionTracks抽出ロジックを移植

## Development

```bash
# Chromeにインストール
# chrome://extensions → デベロッパーモード → src/ フォルダを読み込み

# 初回設定
# 拡張アイコン → 設定 → APIキー入力

# テスト
# YouTubeの動画ページで「記事化」ボタンをクリック
```

## Settings Storage (chrome.storage.local)

```javascript
{
  apiKeys: { githubToken, sakuraToken, geminiKey, openaiKey, anthropicKey },
  githubRepo: "katu09161004/LIFE",
  defaults: { platform, difficulty, audience, style },
  recentArticles: [{ title, url, genre, date }]
}
```

## Conventions

- Python MCPサーバーのビジネスロジックを忠実に移植（関数名・変数名の対応はlib/内コメント参照）
- プロンプトテンプレートはPython版と完全一致を維持
- 新しいジャンルやプラットフォーム追加時は`lib/constants.js`のGENRES/FRONTMATTERを更新
