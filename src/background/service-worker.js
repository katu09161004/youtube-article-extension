// Background Service Worker - Main orchestration
// Direct port of youtube_article_mcp.py youtube_to_article (lines 717-879)

import { GENRES, FRONTMATTER, POST_HINTS } from '../lib/constants.js';
import { callAI } from '../lib/ai-providers.js';
import { ghPut, ghGetSha, ghGetText, ghListDir } from '../lib/github-api.js';
import { buildPrompt } from '../lib/prompt-builder.js';
import { guessGenre, isCooking } from '../lib/genre-detector.js';
import {
  thumbnailUrl, formatTranscriptWithTimestamps, formatPlainTranscript,
  getJSTDate, formatJSTDate, sanitizeFilename,
} from '../lib/utils.js';

// ================================================================
// Message handler
// ================================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(e => {
    sendResponse({ error: e.message });
  });
  return true; // Keep channel open for async
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'GENERATE_ARTICLE':
      return await generateArticle(message.data, sender.tab?.id);
    case 'LIST_ARTICLES':
      return await listArticles(message.data);
    case 'SEARCH_ARTICLES':
      return await searchArticles(message.data);
    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}

// ================================================================
// Main pipeline: Generate article
// ================================================================
async function generateArticle(data, tabId) {
  const { videoId, url, transcript, videoTitle, platform, style, difficulty,
          audience, titleOverride, lang } = data;

  // Load settings
  const settings = await chrome.storage.local.get(['apiKeys', 'githubRepo']);
  const apiKeys = settings.apiKeys || {};
  const repo = settings.githubRepo;

  if (!repo) return { error: 'GitHub Repositoryが未設定です（設定画面で入力してください）' };
  if (!apiKeys.githubToken) return { error: 'GitHub Tokenが未設定です' };
  if (!apiKeys.sakuraToken && !apiKeys.geminiKey && !apiKeys.openaiKey && !apiKeys.anthropicKey) {
    return { error: 'AI APIキーが1つも設定されていません（設定画面で入力してください）' };
  }

  // Format transcript
  const baseUrl = url.split('&t=')[0];
  const transcriptWithTs = formatTranscriptWithTimestamps(transcript, baseUrl);
  const plainText = formatPlainTranscript(transcript);

  // Detect cooking mode
  const workingTitle = titleOverride || videoTitle || `YouTube_${videoId}`;
  const cookingMode = style === 'レシピ記事' || (style === 'auto' && isCooking(plainText.slice(0, 3000)));

  // Platform correction for cooking
  let finalPlatform = platform;
  if (cookingMode && platform === 'life') finalPlatform = 'note';

  // Build prompt
  const thumb = thumbnailUrl(videoId);
  const prompt = buildPrompt({
    isCooking: cookingMode,
    title: workingTitle, url: baseUrl, lang,
    transcript: transcriptWithTs, thumbnail: thumb,
    platform: finalPlatform, style, difficulty, audience,
  });

  // Call AI
  sendProgress(tabId, 'AI記事を生成中...');
  const { text: articleContent, provider } = await callAI(prompt, apiKeys);
  if (!articleContent) {
    return { error: 'AI記事生成に失敗しました。APIキーを確認してください。' };
  }

  // Extract article title
  const titleMatch = articleContent.match(/^#\s+(.+)$/m);
  const articleTitle = titleOverride || (titleMatch ? titleMatch[1].trim() : workingTitle);

  // Detect genre
  const genre = cookingMode ? 'Cooking' : guessGenre(articleTitle + ' ' + plainText.slice(0, 1000));
  const validGenre = (genre in GENRES || genre === 'Other') ? genre : 'Other';

  // Build file path
  const platformFolder = {
    zenn: 'Zenn', qiita: 'Qiita', note: 'note',
    life: 'LIFE', all: 'ALL', cookpad: 'Cookpad',
  }[finalPlatform] || 'LIFE';

  const dt = getJSTDate();
  const { date: dateStr, datetime } = formatJSTDate(dt);
  const safeTitle = sanitizeFilename(articleTitle);
  const filename = `${datetime}_${videoId}_${safeTitle}.md`;
  const filePath = `LIFE/${validGenre}/${platformFolder}/${filename}`;

  // Save to GitHub
  sendProgress(tabId, 'GitHubに保存中...');
  try {
    await ghPut(repo, filePath, articleContent,
      `[${validGenre}/${platformFolder}] ${articleTitle} (${dateStr})`,
      apiKeys.githubToken);
  } catch (e) {
    return { error: `GitHub保存失敗: ${e.message}` };
  }

  // Update processed log
  try {
    const processedPath = 'data/article_urls.txt';
    const existingLog = await ghGetText(repo, processedPath, apiKeys.githubToken) || '';
    const sha = await ghGetSha(repo, processedPath, apiKeys.githubToken);
    const newLine = `${videoId}\t${url}\t${dt.toISOString()}\t${validGenre}\t${finalPlatform}\t${provider}\t${articleTitle}\n`;
    await ghPut(repo, processedPath, existingLog + newLine,
      `article_urls update: ${videoId}`, apiKeys.githubToken, sha);
  } catch (e) {
    console.warn('Failed to update processed log:', e.message);
  }

  // Save to recent articles
  const githubUrl = `https://github.com/${repo}/blob/main/${filePath}`;
  try {
    const stored = await chrome.storage.local.get(['recentArticles']);
    const recent = stored.recentArticles || [];
    recent.unshift({ title: articleTitle, url: githubUrl, genre: validGenre, date: dateStr });
    await chrome.storage.local.set({ recentArticles: recent.slice(0, 20) });
  } catch (e) { /* ignore */ }

  return {
    articleTitle,
    genre: validGenre,
    platform: finalPlatform,
    provider,
    articleChars: articleContent.length,
    filePath,
    githubUrl,
    articleContent,
    postHints: POST_HINTS[finalPlatform] || '',
  };
}

// ================================================================
// List articles
// ================================================================
async function listArticles(data) {
  const settings = await chrome.storage.local.get(['apiKeys', 'githubRepo']);
  const token = settings.apiKeys?.githubToken;
  const repo = settings.githubRepo;
  if (!repo || !token) return { error: 'GitHub設定が未完了です' };

  const { genre, limit = 10 } = data || {};
  const genresToCheck = genre ? [genre] : [...Object.keys(GENRES), 'Other'];
  const platformFolders = ['Zenn', 'Qiita', 'note', 'LIFE', 'ALL', 'Cookpad'];
  const files = [];

  for (const g of genresToCheck) {
    for (const pf of platformFolders) {
      const items = await ghListDir(repo, `LIFE/${g}/${pf}`, token);
      for (const item of items) {
        if (item.name?.endsWith('.md') && item.name !== '.gitkeep') {
          files.push({ genre: g, platform: pf, name: item.name, path: item.path });
        }
      }
    }
  }

  files.sort((a, b) => b.name.localeCompare(a.name));
  return { files: files.slice(0, limit) };
}

// ================================================================
// Search articles
// ================================================================
async function searchArticles(data) {
  const settings = await chrome.storage.local.get(['apiKeys', 'githubRepo']);
  const token = settings.apiKeys?.githubToken;
  const repo = settings.githubRepo;
  if (!repo || !token) return { error: 'GitHub設定が未完了です' };

  const { query, genre } = data;
  const q = query.toLowerCase();
  const genresToCheck = genre ? [genre] : [...Object.keys(GENRES), 'Other'];
  const platformFolders = ['Zenn', 'Qiita', 'note', 'LIFE', 'ALL', 'Cookpad'];
  const matches = [];

  for (const g of genresToCheck) {
    for (const pf of platformFolders) {
      const items = await ghListDir(repo, `LIFE/${g}/${pf}`, token);
      for (const item of items) {
        if (!item.name?.endsWith('.md') || item.name === '.gitkeep') continue;
        if (q.split(' ').some(w => item.name.toLowerCase().includes(w))) {
          matches.push({ genre: g, platform: pf, name: item.name, match: 'filename' });
        }
      }
    }
  }

  return { matches };
}

// ================================================================
// Utilities
// ================================================================
function sendProgress(tabId, message) {
  if (!tabId) return;
  try {
    chrome.tabs.sendMessage(tabId, { type: 'UPDATE_PROGRESS', message });
  } catch (e) { /* ignore */ }
}

console.log('[YT-Article] Service worker loaded');
