import { bookmarksToHTML } from '../lib/parser.js';
import { uploadToWebDAV } from '../lib/webdav.js';
import { obfuscate, deobfuscate } from '../lib/crypto.js';

const urlInput = document.getElementById('url');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const saveBtn = document.getElementById('save-btn');
const syncBtn = document.getElementById('sync-btn');
const statusDiv = document.getElementById('status');

let savedConfig = { webdavUrl: '', username: '', password: '' };

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

function showStatus(messageKey, type, isLiteral = false) {
  const message = isLiteral ? messageKey : chrome.i18n.getMessage(messageKey);
  statusDiv.textContent = message || messageKey;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Auto hide after 3 seconds if it's a success message
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

function checkDirty() {
  const currentUrl = urlInput.value.trim();
  const currentUsername = usernameInput.value.trim();
  const currentPassword = passwordInput.value.trim();

  const isChanged = currentUrl !== savedConfig.webdavUrl || 
                    currentUsername !== savedConfig.username || 
                    currentPassword !== savedConfig.password;
  
  const isNotEmpty = currentUrl !== '' && currentUsername !== '' && currentPassword !== '';

  // Enable save button only if there are changes and all fields are filled
  if (isChanged && isNotEmpty) {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}

// Load saved settings
chrome.storage.local.get(['webdavUrl', 'username', 'password'], (result) => {
  savedConfig = {
    webdavUrl: result.webdavUrl || '',
    username: deobfuscate(result.username) || '',
    password: deobfuscate(result.password) || ''
  };

  urlInput.value = savedConfig.webdavUrl;
  usernameInput.value = savedConfig.username;
  passwordInput.value = savedConfig.password;

  applyI18n();
  checkDirty();
});

// Event listeners for dirty check
[urlInput, usernameInput, passwordInput].forEach(input => {
  input.addEventListener('input', checkDirty);
});

// Save button logic: Only save to storage
saveBtn.addEventListener('click', async () => {
  const webdavUrl = urlInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  saveBtn.disabled = true;

  try {
    const credentials = {
      webdavUrl,
      username: obfuscate(username),
      password: obfuscate(password)
    };

    await chrome.storage.local.set(credentials);
    
    savedConfig = { webdavUrl, username, password };
    checkDirty();
    showStatus('statusSuccess', 'success');
  } catch (error) {
    console.error('Save failed:', error);
    showStatus(error.message, 'error', true);
    checkDirty(); // Restore button state if it was actually dirty
  }
});

// Sync button logic: Direct upload without saving settings
syncBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!url || !username || !password) {
    showStatus('Please fill in all fields.', 'error', true);
    return;
  }

  syncBtn.disabled = true;
  showStatus('statusSyncing', 'success');

  try {
    const bookmarkTreeNodes = await chrome.bookmarks.getTree();
    const htmlContent = bookmarksToHTML(bookmarkTreeNodes);
    await uploadToWebDAV({ url, username, password }, htmlContent);
    showStatus('statusSyncSuccess', 'success');
  } catch (error) {
    console.error('Sync failed:', error);
    showStatus(error.message, 'error', true);
  } finally {
    syncBtn.disabled = false;
  }
});
