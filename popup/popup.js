import { bookmarksToHTML } from '../lib/parser.js';
import { uploadToWebDAV } from '../lib/webdav.js';

const urlInput = document.getElementById('url');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get(['webdavUrl', 'username', 'password'], (result) => {
  if (result.webdavUrl) urlInput.value = result.webdavUrl;
  if (result.username) usernameInput.value = result.username;
  if (result.password) passwordInput.value = result.password;
});

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}

saveButton.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!url || !username || !password) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  saveButton.disabled = true;
  showStatus('Saving and Syncing...', 'success');

  try {
    // 1. Save to storage
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({
        webdavUrl: url,
        username: username,
        password: password
      }, () => {
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
    
    showStatus('Settings saved and sync successful!', 'success');
  } catch (error) {
    console.error('Operation failed:', error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    saveButton.disabled = false;
  }
});
