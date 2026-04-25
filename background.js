import { bookmarksToHTML } from './lib/parser.js';
import { uploadToWebDAV } from './lib/webdav.js';
import { deobfuscate } from './lib/crypto.js';

/**
 * Performs the bookmark sync operation.
 */
async function performSync() {
  try {
    const config = await chrome.storage.local.get(['webdavUrl', 'username', 'password']);
    
    if (config.webdavUrl && config.username && config.password) {
      // 1. Get bookmark tree
      const bookmarkTreeNodes = await chrome.bookmarks.getTree();
      
      // 2. Convert to HTML
      const htmlContent = bookmarksToHTML(bookmarkTreeNodes);
      
      // 3. Upload to WebDAV
      await uploadToWebDAV({
        url: config.webdavUrl,
        username: deobfuscate(config.username),
        password: deobfuscate(config.password)
      }, htmlContent);
      
    }
  } catch (error) {
    console.error('Auto-sync: Failed', error);
  }
}

// Listen for browser startup
chrome.runtime.onStartup.addListener(() => {
  performSync();
});
