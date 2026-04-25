import { bookmarksToHTML } from '../lib/parser.js';
import { uploadToWebDAV } from '../lib/webdav.js';
import { obfuscate, deobfuscate } from '../lib/crypto.js';

const urlInput = document.getElementById('url');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const saveButton = document.getElementById('save');
const unlockButton = document.getElementById('unlock');
const statusDiv = document.getElementById('status');
const container = document.querySelector('.container');

let isLocked = false;
let savedCredentials = null;

// Apply translations
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      if (el.tagName === 'INPUT' && el.type !== 'button') {
        el.placeholder = message;
      } else {
        el.textContent = message;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      el.placeholder = message;
    }
  });
}

function maskValue(str) {
  if (!str) return '';
  if (str.length <= 3) return '***';
  return str.slice(0, 3) + '***';
}

function lockUI(credentials) {
  isLocked = true;
  savedCredentials = credentials;
  container.classList.add('locked');
  
  urlInput.value = credentials.webdavUrl || '';
  usernameInput.value = maskValue(credentials.username);
  passwordInput.value = '********';
  
  urlInput.disabled = true;
  usernameInput.disabled = true;
  passwordInput.disabled = true;
  
  unlockButton.style.display = 'block';
  saveButton.style.display = 'none';
}

function unlockUI() {
  isLocked = false;
  container.classList.remove('locked');
  
  if (savedCredentials) {
    urlInput.value = savedCredentials.webdavUrl || '';
    usernameInput.value = savedCredentials.username || '';
    passwordInput.value = savedCredentials.password || '';
  }
  
  urlInput.disabled = false;
  usernameInput.disabled = false;
  passwordInput.disabled = false;
  
  unlockButton.style.display = 'none';
  saveButton.style.display = 'block';
}

function showStatus(messageKey, type, isLiteral = false) {
  const message = isLiteral ? messageKey : chrome.i18n.getMessage(messageKey);
  statusDiv.textContent = message || messageKey;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}

// Load saved settings
chrome.storage.local.get(['webdavUrl', 'username', 'password'], (result) => {
  if (result.webdavUrl && result.username) {
    const credentials = {
      webdavUrl: result.webdavUrl,
      username: deobfuscate(result.username),
      password: deobfuscate(result.password)
    };
    lockUI(credentials);
  }
  applyI18n();
});

unlockButton.addEventListener('click', unlockUI);

saveButton.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!url || !username || !password) {
    showStatus('Please fill in all fields.', 'error', true);
    return;
  }

  saveButton.disabled = true;
  showStatus('statusSaving', 'success');

  try {
    const credentials = {
      webdavUrl: url,
      username: obfuscate(username),
      password: obfuscate(password)
    };

    // 1. Save to storage
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(credentials, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });

    // 2. Get bookmarks
    const bookmarkTreeNodes = await chrome.bookmarks.getTree();
    
    // 3. Convert to HTML
    const htmlContent = bookmarksToHTML(bookmarkTreeNodes);
    
    // 4. Upload to WebDAV
    await uploadToWebDAV({ url, username, password }, htmlContent);
    
    showStatus('statusSuccess', 'success');
    
    // Lock after successful save
    lockUI({ webdavUrl: url, username, password });
    
  } catch (error) {
    console.error('Operation failed:', error);
    showStatus(error.message, 'error', true);
  } finally {
    saveButton.disabled = false;
  }
});
