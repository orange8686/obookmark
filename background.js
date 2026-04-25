import { bookmarksToHTML } from './lib/parser.js';
import { uploadToWebDAV } from './lib/webdav.js';

/**
 * Performs the bookmark sync operation.
 */
async function performSync() {
  try {
    const config = await chrome.storage.local.get(['webdavUrl', 'username', 'password']);
    
    if (config.webdavUrl && config.username && config.password) {
      console.log('Auto-sync: WebDAV configured, starting sync...');
      
      // 1. Get bookmark tree
      const bookmarkTreeNodes = await chrome.bookmarks.getTree();
      
      // 2. Convert to HTML
      const htmlContent = bookmarksToHTML(bookmarkTreeNodes);
      
      // 3. Upload to WebDAV
      await uploadToWebDAV({
        url: config.webdavUrl,
        username: config.username,
        password: config.password
      }, htmlContent);
      
      console.log('Auto-sync: Successful!');
    } else {
      console.log('Auto-sync: WebDAV not configured, skipping.');
    }
  } catch (error) {
    console.error('Auto-sync: Failed', error);
  }
}

// Listen for browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started: onStartup triggered.');
  performSync();
});
