// Direct port from youtube_article_mcp.py lines 456-467

import { GENRES, COOKING_KEYWORDS } from './constants.js';

export function guessGenre(text) {
  const tl = text.toLowerCase();
  for (const [genre, kws] of Object.entries(GENRES)) {
    if (kws.some(kw => tl.includes(kw))) {
      return genre;
    }
  }
  return "Other";
}

export function isCooking(text) {
  const tl = text.toLowerCase();
  let count = 0;
  for (const kw of COOKING_KEYWORDS) {
    if (tl.includes(kw)) count++;
    if (count >= 2) return true;
  }
  return false;
}
