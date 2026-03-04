// Direct port from youtube_article_mcp.py utility functions

export function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function thumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function formatTranscriptWithTimestamps(entries, url, maxChars = 14000) {
  const baseUrl = url.split("&t=")[0];
  const lines = [];
  let total = 0;
  for (const e of entries) {
    const sec = Math.floor(e.start || 0);
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    const hh = Math.floor(mm / 60);
    const mm2 = mm % 60;
    const ts = hh ? `${String(hh).padStart(2,'0')}:${String(mm2).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
                   : `${String(mm2).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    const line = `[${ts}|${sec}s] ${e.text}`;
    if (total + line.length > maxChars) break;
    lines.push(line);
    total += line.length + 1;
  }
  return lines.join("\n");
}

export function formatPlainTranscript(entries, maxChars = 14000) {
  const text = entries.map(e => e.text).join(" ");
  return text.slice(0, maxChars);
}

export function getJSTDate() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst;
}

export function formatJSTDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, datetime: `${y}${m}${d}_${hh}${mm}` };
}

export function sanitizeFilename(title) {
  return title.replace(/[^\w\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f]/g, '_')
              .slice(0, 60)
              .replace(/_+$/, '');
}

// UTF-8 safe base64 encode/decode for GitHub API
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
