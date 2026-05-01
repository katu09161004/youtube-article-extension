// Popup logic

async function init() {
  // Check current tab for YouTube video
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const videoInfo = document.getElementById('video-info');

  if (tab?.url?.includes('youtube.com/watch')) {
    const m = tab.url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (m) {
      videoInfo.className = 'video-info';
      videoInfo.innerHTML = `
        <div class="title">${tab.title?.replace(' - YouTube', '') || '動画'}</div>
        <div class="vid">ID: ${m[1]}</div>
      `;
    }
  }

  // Load recent articles
  chrome.storage.local.get(['recentArticles'], (data) => {
    const list = document.getElementById('recent-list');
    const articles = data.recentArticles || [];
    if (articles.length > 0) {
      list.innerHTML = articles.slice(0, 5).map(a =>
        `<li><a href="${a.url}" target="_blank">${a.title}</a><br><span style="color:#999;font-size:11px;">${a.date} | ${a.genre}</span></li>`
      ).join('');
    }
  });

  // API key status
  chrome.storage.local.get(['apiKeys', 'githubRepo'], (data) => {
    const keys = data.apiKeys || {};
    const status = document.getElementById('api-status');
    const checks = [
      { name: 'GitHub', ok: !!keys.githubToken },
      { name: 'AI', ok: !!(keys.sakuraToken || keys.geminiKey || keys.openaiKey || keys.anthropicKey) },
    ];
    status.innerHTML = checks.map(c =>
      `<span class="${c.ok ? 'ok' : 'missing'}">${c.ok ? '●' : '○'} ${c.name}</span>`
    ).join(' ');
    if (!checks[0].ok || !checks[1].ok) {
      status.innerHTML += ' <a href="#" id="setupLink" style="color:#065fd4;font-size:11px;">設定が必要です</a>';
              setTimeout(() => {
                          const setupLink = document.getElementById('setupLink');
                          if (setupLink) {
                                        setupLink.addEventListener('click', (e) => {
                                                        e.preventDefault();
                                                        chrome.runtime.openOptionsPage();
                                        });
                          }
              }, 0);
    }
  });

  // Links
  document.getElementById('openOptions').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('openGithub').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.get(['githubRepo'], (data) => {
      const repo = data.githubRepo || 'katu09161004/LIFE';
      chrome.tabs.create({ url: `https://github.com/${repo}` });
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
