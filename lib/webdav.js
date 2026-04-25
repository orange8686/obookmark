/**
 * Uploads content to a WebDAV server.
 * @param {Object} config - The WebDAV configuration.
 * @param {string} config.url - The WebDAV server URL.
 * @param {string} config.username - The username for authentication.
 * @param {string} config.password - The password for authentication.
 * @param {string} content - The content to upload.
 * @returns {Promise<Response>} - The fetch response.
 * @throws {Error} - If the upload fails.
 */
export async function uploadToWebDAV(config, content) {
  const { url, username, password } = config;
  
  // Ensure target URL ends with bookmarks.html
  let targetUrl = url;
  if (!targetUrl.endsWith('bookmarks.html')) {
    if (!targetUrl.endsWith('/')) {
      targetUrl += '/';
    }
    targetUrl += 'bookmarks.html';
  }

  // Construct Basic Auth header
  // Note: btoa handles Latin1 characters. For modern extensions, this is usually sufficient.
  const auth = btoa(`${username}:${password}`);
  
  const response = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: content
  });

  if (!response.ok) {
    throw new Error(`WebDAV upload failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
