// Direct port from youtube_article_mcp.py lines 528-601

import { SAKURA_API } from './constants.js';

async function callSakura(prompt, token) {
  const r = await fetch(`${SAKURA_API}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096, temperature: 0.5, stream: false,
    }),
    signal: AbortSignal.timeout(150000),
  });
  if (!r.ok) throw new Error(`Sakura API ${r.status}`);
  const data = await r.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt, key) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
      }),
      signal: AbortSignal.timeout(150000),
    }
  );
  if (!r.ok) throw new Error(`Gemini API ${r.status}`);
  const data = await r.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(prompt, key) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096, temperature: 0.5,
    }),
    signal: AbortSignal.timeout(150000),
  });
  if (!r.ok) throw new Error(`OpenAI API ${r.status}`);
  const data = await r.json();
  return data.choices[0].message.content;
}

async function callClaude(prompt, key) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(150000),
  });
  if (!r.ok) throw new Error(`Claude API ${r.status}`);
  const data = await r.json();
  return data.content[0].text;
}

const PROVIDERS = [
  { name: 'さくらのAI Engine', key: 'sakuraToken', fn: callSakura },
  { name: 'Google Gemini Pro', key: 'geminiKey', fn: callGemini },
  { name: 'OpenAI GPT-4o', key: 'openaiKey', fn: callOpenAI },
  { name: 'Claude', key: 'anthropicKey', fn: callClaude },
];

export async function callAI(prompt, apiKeys) {
  for (const { name, key, fn } of PROVIDERS) {
    const apiKey = apiKeys[key];
    if (!apiKey) continue;
    try {
      const text = await fn(prompt, apiKey);
      return { text, provider: name };
    } catch (e) {
      console.error(`[${name}] Failed:`, e.message);
    }
  }
  return { text: '', provider: 'none' };
}
