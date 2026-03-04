// Direct port from youtube_article_mcp.py lines 33-278

export const GITHUB_API = "https://api.github.com";
export const SAKURA_API = "https://api.ai.sakura.ad.jp/v1";

export const GENRES = {
  Tech: ["python","ai","llm","gpt","claude","program","develop","software","system",
         "machine learning","docker","kubernetes","github","api","sql","javascript",
         "swift","ios","android","linux","powershell","vba","excel","cloud","aws",
         "azure","network","security","プログラム","開発","技術","システム","自動化",
         "mcp","rag","vector","embedding","fine-tuning","inference"],
  Cooking: ["recipe","cooking","food","cook","ingredient","bake","chef","kitchen",
            "dinner","lunch","breakfast","meal","dish","sauce","marinade","grill","fry",
            "料理","レシピ","食材","調理","ごはん","献立","お菓子","焼き","スープ",
            "パスタ","弁当","作り方","炒め","煮込み","揚げ","蒸し","和食","洋食","中華"],
  Medical: ["medical","clinical","hospital","nursing","diagnosis","treatment","health",
            "看護","医療","病院","検査","診断","治療","医師","患者","薬","細菌","pcr"],
  Science: ["science","physics","chemistry","biology","astronomy","quantum","research",
            "科学","物理","化学","生物","天文","宇宙","研究","実験","論文","数学"],
  Business: ["business","marketing","finance","investment","startup","economy","stock",
             "ビジネス","経営","投資","起業","経済","副業","転職","マーケティング"],
};

export const COOKING_KEYWORDS = new Set(GENRES.Cooking);

export const FRONTMATTER = {
  zenn: `\`\`\`yaml
---
title: "記事タイトル（日本語）"
emoji: "適切な絵文字1文字"
type: "tech"
topics: [タグ1, タグ2, タグ3, タグ4, タグ5]
published: false
---
\`\`\``,

  qiita: `\`\`\`yaml
---
title: 記事タイトル（日本語）
tags:
  - タグ1
  - タグ2
  - タグ3
  - タグ4
  - タグ5
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
---
\`\`\``,

  note: `<!-- note投稿用メタ情報
タイトル: 記事タイトル
ハッシュタグ: #タグ1 #タグ2 #タグ3 #タグ4 #タグ5
マガジン: （該当するマガジン名）
有料設定: 無料 / 有料（XXX円）
-->`,

  life: `---
title: "記事タイトル（日本語）"
genre: "ジャンル"
tags: [タグ1, タグ2, タグ3, タグ4, タグ5]
difficulty: "難易度"
audience: "対象読者"
source_lang: "字幕言語"
source_url: "元動画URL"
created: "YYYY-MM-DD"
ai_model: "使用AI"
published_to: []
---`,

  cookpad: `<!-- ===== Cookpad 投稿ガイド =====
  以下の各セクションをCookpadの対応フィールドにコピー&ペーストしてください
  投稿ページ: https://cookpad.com/recipe/new
  料理名         → 「料理の名前」フィールド
  材料リスト     → 「材料」フィールド（食材名と分量を1行ずつ）
  作り方         → 「作り方」フィールド（1ステップずつ）
  コツ・ポイント → 「コツ・ポイント」フィールド
  ================================ -->`,
};

export const POST_HINTS = {
  zenn: `  1. GitHubリポジトリをZennと連携（zenn.dev → 設定）
  2. published: true に変更してpush → 自動公開
  3. または zenn.dev エディタに直接貼り付け`,

  qiita: `  1. qiita.com → 記事を書く → Markdownモード
  2. frontmatterのYAMLは削除してから貼り付け
  3. タグ・タイトルはUI上で設定`,

  note: `  1. note.com → 投稿 → テキスト
  2. <!-- note... --> コメントを参考にタイトル・ハッシュタグを設定
  3. 画像はサムネイルURLを直接貼り付け or スクリーンショットをアップロード`,

  cookpad: `  1. cookpad.com/recipe/new を開く
  2. 「=== COOKPAD:料理名 ===」の内容を「料理の名前」欄に貼る
  3. 「=== COOKPAD:材料 ===」の内容を「材料」欄に貼る
  4. 「=== COOKPAD:作り方 ===」の各ステップを工程欄に1つずつ貼る
  5. 「=== COOKPAD:コツ・ポイント ===」を対応欄に貼る`,

  life: `  個人ナレッジとしてGitHubに蓄積されました。
  後で別プラットフォーム向けに再生成できます。`,

  all: `  プラットフォーム別セクションが1記事にまとめられています。
  各プラットフォームの該当部分をコピーして投稿してください。`,
};
