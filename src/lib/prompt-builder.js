// Direct port from youtube_article_mcp.py _build_prompt (lines 607-643)

import { FRONTMATTER } from './constants.js';
import { TECH_PROMPT, COOKING_PROMPT, COOKPAD_PROMPT, formatPrompt } from './prompts.js';

export function buildPrompt({ isCooking, title, url, lang, transcript, thumbnail,
                              platform, style, difficulty, audience }) {
  const fm = FRONTMATTER[platform] || FRONTMATTER.life;

  if (platform === 'cookpad') {
    return formatPrompt(COOKPAD_PROMPT, { title, url, lang, transcript });
  }

  if (isCooking) {
    return formatPrompt(COOKING_PROMPT, {
      title, url, lang, transcript, thumbnail,
      frontmatter_template: fm, difficulty,
    });
  }

  const styleLabel = style !== 'auto' ? style : '技術解説記事（Qiita/Zenn風）';
  return formatPrompt(TECH_PROMPT, {
    title, url, lang, transcript, thumbnail,
    platform, frontmatter_template: fm,
    style: styleLabel, difficulty, audience,
  });
}
