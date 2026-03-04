// Direct port from youtube_article_mcp.py lines 648-712

import { GITHUB_API } from './constants.js';
import { utf8ToBase64, base64ToUtf8 } from './utils.js';

function ghHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function ghPut(repo, path, content, message, token, sha = null) {
  const payload = {
    message,
    content: utf8ToBase64(content),
  };
  if (sha) payload.sha = sha;

  const r = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`GitHub PUT ${r.status}: ${err}`);
  }
}

export async function ghGetSha(repo, path, token) {
  const r = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: ghHeaders(token),
    signal: AbortSignal.timeout(15000),
  });
  if (r.status !== 200) return null;
  const data = await r.json();
  return data.sha || null;
}

export async function ghGetText(repo, path, token) {
  const r = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: ghHeaders(token),
    signal: AbortSignal.timeout(15000),
  });
  if (r.status !== 200) return null;
  const data = await r.json();
  const encoded = data.content || '';
  return base64ToUtf8(encoded);
}

export async function ghListDir(repo, path, token) {
  const r = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: ghHeaders(token),
    signal: AbortSignal.timeout(15000),
  });
  if (r.status !== 200) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}
