function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

export function bookmarksToHTML(bookmarkTreeNodes) {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;

  function walk(nodes, indent) {
    let result = "";
    nodes.forEach(node => {
      const dateAdded = node.dateAdded ? Math.floor(node.dateAdded / 1000) : "";
      const lastModified = node.dateGroupModified ? Math.floor(node.dateGroupModified / 1000) : "";
      
      if (node.url) {
        // Bookmark item
        result += `${indent}<DT><A HREF="${escapeHTML(node.url)}" ADD_DATE="${dateAdded}">${escapeHTML(node.title) || ""}</A>\n`;
      } else if (node.children) {
        // Folder or container
        if (node.title) {
          result += `${indent}<DT><H3 ADD_DATE="${dateAdded}" LAST_MODIFIED="${lastModified}">${escapeHTML(node.title)}</H3>\n`;
          result += `${indent}<DL><p>\n`;
          result += walk(node.children, indent + "    ");
          result += `${indent}</DL><p>\n`;
        } else {
          // Skip untitled root node (e.g., the root node from getTree)
          result += walk(node.children, indent);
        }
      }
    });
    return result;
  }

  // Find the Bookmarks Bar (usually the first child of the root node)
  const rootNode = bookmarkTreeNodes[0];
  const favoritesBar = rootNode && rootNode.children ? rootNode.children[0] : null;

  if (favoritesBar) {
    html += walk([favoritesBar], "    ");
  }

  html += "</DL><p>\n";
  return html;
}
