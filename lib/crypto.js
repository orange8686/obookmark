/**
 * 凭据混淆工具模块
 * 用于在存储到 chrome.storage 之前对敏感数据进行基础混淆
 */

const SALT = 'ob-salt-v1-';

/**
 * 混淆字符串
 * @param {string} str - 原始字符串
 * @returns {string} 混淆后的字符串
 */
export function obfuscate(str) {
    if (!str) return str;
    try {
        // 先加盐，再转 Base64
        return btoa(unescape(encodeURIComponent(SALT + str)));
    } catch (e) {
        console.error('Obfuscation failed:', e);
        return str;
    }
}

/**
 * 解混淆字符串
 * @param {string} str - 混淆后的字符串
 * @returns {string} 原始字符串
 */
export function deobfuscate(str) {
    if (!str) return str;
    try {
        // 先转回字符串
        const decoded = decodeURIComponent(escape(atob(str)));
        // 移除盐
        if (decoded.startsWith(SALT)) {
            return decoded.slice(SALT.length);
        }
        return decoded;
    } catch (e) {
        // 如果不是有效的 Base64 或者解密失败，返回原样
        return str;
    }
}
