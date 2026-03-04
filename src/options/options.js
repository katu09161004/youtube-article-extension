// Options page logic

const DEFAULTS = {
  apiKeys: { githubToken: '', sakuraToken: '', geminiKey: '', openaiKey: '', anthropicKey: '' },
  githubRepo: 'katu09161004/LIFE',
  defaults: { platform: 'life', difficulty: '中級者向け', audience: 'エンジニア全般', style: 'auto' },
};

function loadSettings() {
  chrome.storage.local.get(['apiKeys', 'githubRepo', 'defaults'], (data) => {
    const keys = data.apiKeys || DEFAULTS.apiKeys;
    document.getElementById('githubToken').value = keys.githubToken || '';
    document.getElementById('sakuraToken').value = keys.sakuraToken || '';
    document.getElementById('geminiKey').value = keys.geminiKey || '';
    document.getElementById('openaiKey').value = keys.openaiKey || '';
    document.getElementById('anthropicKey').value = keys.anthropicKey || '';

    document.getElementById('githubRepo').value = data.githubRepo || DEFAULTS.githubRepo;

    const d = data.defaults || DEFAULTS.defaults;
    document.getElementById('defPlatform').value = d.platform || 'life';
    document.getElementById('defDifficulty').value = d.difficulty || '中級者向け';
    document.getElementById('defAudience').value = d.audience || 'エンジニア全般';
    document.getElementById('defStyle').value = d.style || 'auto';
  });
}

function saveSettings() {
  const settings = {
    apiKeys: {
      githubToken: document.getElementById('githubToken').value.trim(),
      sakuraToken: document.getElementById('sakuraToken').value.trim(),
      geminiKey: document.getElementById('geminiKey').value.trim(),
      openaiKey: document.getElementById('openaiKey').value.trim(),
      anthropicKey: document.getElementById('anthropicKey').value.trim(),
    },
    githubRepo: document.getElementById('githubRepo').value.trim(),
    defaults: {
      platform: document.getElementById('defPlatform').value,
      difficulty: document.getElementById('defDifficulty').value,
      audience: document.getElementById('defAudience').value.trim(),
      style: document.getElementById('defStyle').value,
    },
  };

  chrome.storage.local.set(settings, () => {
    showStatus('設定を保存しました。タブを閉じます...', 'success');
    setTimeout(() => { window.close(); }, 1000);
  });
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = `status ${type}`;
  setTimeout(() => { el.className = 'status'; }, 3000);
}

document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('resetBtn').addEventListener('click', () => {
  chrome.storage.local.set(DEFAULTS, () => {
    loadSettings();
    showStatus('デフォルト設定に戻しました', 'success');
  });
});

loadSettings();
