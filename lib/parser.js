export function bookmarksToHTML(bookmarkTreeNodes) {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;

  function walk(nodes, indent) {
    let result = "";
    nodes.forEach(node => {
      const dateAdded = node.dateAdded ? Math.floor(node.dateAdded / 1000) : "";
      const lastModified = node.dateGroupModified ? Math.floor(node.dateGroupModified / 1000) : "";
      
      if (node.url) {
        // Bookmark item
        result += `${indent}<DT><A HREF="${node.url}" ADD_DATE="${dateAdded}">${node.title || ""}</A>\n`;
      } else if (node.children) {
        // Folder or container
        if (node.title) {
          result += `${indent}<DT><H3 ADD_DATE="${dateAdded}" LAST_MODIFIED="${lastModified}">${node.title}</H3>\n`;
          result += `${indent}<DL><p>\n`;
          result += walk(node.children, indent + "    ");
          result += `${indent}</DL><p>\n`;
        } else {
          // Skip untitled root node
          result += walk(node.children, indent);
        }
      }
    });
    return result;
  }

  html += walk(bookmarkTreeNodes, "    ");
  html += "</DL><p>\n";
  return html;
}
